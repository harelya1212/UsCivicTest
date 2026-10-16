/**
 * moderation.js - Squad moderation policy engine.
 *
 * Pure logic extracted from App.js: role normalization, per-role rate
 * limits, mute pruning, audit entries and moderation policy evaluation.
 * No React, no side effects.
 */
import { createDefaultSquadSync } from '../context/AppDataContext';
const MODERATION_ROLE_LIMITS = Object.freeze({
  parent: { nudge_send: 20, invite_refresh: 10, goal_update: 30 },
  admin: { nudge_send: 16, invite_refresh: 8, goal_update: 24 },
  child: { nudge_send: 4, invite_refresh: 2, goal_update: 6 },
});
const MODERATION_MUTE_MS = 10 * 60 * 1000;
const MODERATION_MUTE_THRESHOLD = 3;
const MODERATION_ESCALATION_THRESHOLD = 5;

function normalizeRole(value = '') {
  const role = String(value || '').trim().toLowerCase();
  if (role === 'parent' || role === 'admin' || role === 'child') return role;
  return 'child';
}

function getRoleRateLimit(actorRole, actionType) {
  const normalizedRole = normalizeRole(actorRole);
  const limits = MODERATION_ROLE_LIMITS[normalizedRole] || MODERATION_ROLE_LIMITS.child;
  return Number(limits[actionType] || 6);
}

function pruneExpiredMutedActors(mutedActors = {}, nowMs = Date.now()) {
  return Object.entries(mutedActors || {}).reduce((acc, [actorId, value]) => {
    const untilMs = Number(value?.untilMs || 0);
    if (untilMs > nowMs) {
      acc[actorId] = value;
    }
    return acc;
  }, {});
}

function buildModerationAuditEntry({
  nowIso,
  actionType,
  actorId,
  actorRole,
  allowed,
  reason,
  limit,
  count,
  mutedUntilIso,
  escalationLevel,
  targetMemberIds,
}) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: nowIso,
    actionType,
    actorId,
    actorRole,
    allowed,
    reason: reason || 'ok',
    limit,
    count,
    targetMemberIds: Array.isArray(targetMemberIds) ? targetMemberIds : [],
    mutedUntilIso: mutedUntilIso || null,
    escalationLevel: Number(escalationLevel || 0),
  };
}

function evaluateModerationPolicy(state, params = {}, nowMs = Date.now()) {
  const nowIso = new Date(nowMs).toISOString();
  const actionType = String(params.actionType || 'unknown').trim() || 'unknown';
  const actorId = String(params.actorId || 'self').trim() || 'self';
  const actorRole = normalizeRole(params.actorRole || 'child');
  const targetMemberIds = Array.from(new Set((Array.isArray(params.targetMemberIds) ? params.targetMemberIds : [])
    .map((id) => String(id || '').trim())
    .filter(Boolean)));
  const moderation = state.moderation || createDefaultSquadSync().moderation;
  const hourKey = new Date(nowMs).toISOString().slice(0, 13);
  const bucketKey = `${actorId}:${actionType}:${hourKey}`;
  const limit = getRoleRateLimit(actorRole, actionType);
  const mutedActors = pruneExpiredMutedActors(moderation.mutedActors, nowMs);
  const existingMute = mutedActors[actorId];

  let allowed = true;
  let reason = 'ok';
  let count = Number(moderation.rateBuckets?.[bucketKey] || 0);
  let mutedUntilIso = null;
  let escalationLevel = Number(moderation.escalationByActor?.[actorId]?.level || 0);

  const nextModeration = {
    ...moderation,
    rateBuckets: {
      ...(moderation.rateBuckets || {}),
    },
    mutedActors: {
      ...mutedActors,
    },
    violationsByActor: {
      ...(moderation.violationsByActor || {}),
    },
    escalationByActor: {
      ...(moderation.escalationByActor || {}),
    },
    auditTrail: Array.isArray(moderation.auditTrail) ? [...moderation.auditTrail] : [],
  };

  if (existingMute && Number(existingMute.untilMs || 0) > nowMs) {
    allowed = false;
    reason = 'temporary_mute';
    mutedUntilIso = existingMute.untilIso || new Date(existingMute.untilMs).toISOString();
  } else if (count >= limit) {
    allowed = false;
    reason = 'rate_limit';
    const nextViolations = Number(nextModeration.violationsByActor[actorId] || 0) + 1;
    nextModeration.violationsByActor[actorId] = nextViolations;

    if (nextViolations >= MODERATION_MUTE_THRESHOLD) {
      const untilMs = nowMs + MODERATION_MUTE_MS;
      mutedUntilIso = new Date(untilMs).toISOString();
      nextModeration.mutedActors[actorId] = {
        untilMs,
        untilIso: mutedUntilIso,
        reason: 'repeated_rate_limit',
        actionType,
      };
      reason = 'temporary_mute';
    }

    if (nextViolations >= MODERATION_ESCALATION_THRESHOLD) {
      escalationLevel = Number(nextModeration.escalationByActor[actorId]?.level || 0) + 1;
      nextModeration.escalationByActor[actorId] = {
        level: escalationLevel,
        reason: 'repeated_rate_limit',
        lastEscalatedAt: nowIso,
        actionType,
      };
    }
  } else {
    nextModeration.rateBuckets[bucketKey] = count + 1;
    count = Number(nextModeration.rateBuckets[bucketKey] || 0);
  }

  const auditEntry = buildModerationAuditEntry({
    nowIso,
    actionType,
    actorId,
    actorRole,
    allowed,
    reason,
    limit,
    count,
    mutedUntilIso,
    escalationLevel,
    targetMemberIds,
  });

  nextModeration.auditTrail.push(auditEntry);
  if (nextModeration.auditTrail.length > 120) {
    nextModeration.auditTrail = nextModeration.auditTrail.slice(-120);
  }

  return {
    moderation: nextModeration,
    decision: {
      allowed,
      reason,
      limit,
      count,
      mutedUntilIso,
      escalationLevel,
      actorRole,
    },
    auditEntry,
  };
}

export {
  MODERATION_ROLE_LIMITS,
  MODERATION_MUTE_MS,
  MODERATION_MUTE_THRESHOLD,
  MODERATION_ESCALATION_THRESHOLD,
  normalizeRole,
  getRoleRateLimit,
  pruneExpiredMutedActors,
  buildModerationAuditEntry,
  evaluateModerationPolicy,
};
