/**
 * squadEngine.js - Squad / family competition engine.
 *
 * Pure logic extracted from App.js: squad sync normalization and
 * reconciliation, comeback campaigns, season scoring, leaderboards,
 * tiers and ghost-streak intensity. No React, no side effects.
 */
import { createDefaultAdRuntime, createDefaultSquadSync } from '../context/AppDataContext';
import { getDayKey, clampNumber } from '../utils/helpers';
import { createEmptyIntentTransitionSummary, summarizeIntentTransitions, normalizeIntentSegment } from './offerEngine';

const COMEBACK_WINDOW_OFFSETS = Object.freeze({ d2: 2, d5: 5, d10: 10 });

function buildInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SQUAD-';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function normalizeComebackCampaign(raw = {}) {
  const defaults = createDefaultAdRuntime().comebackCampaign;
  const windows = raw?.windows && typeof raw.windows === 'object' ? raw.windows : {};

  return {
    ...defaults,
    ...(raw || {}),
    windows: {
      d2: {
        ...defaults.windows.d2,
        ...(windows.d2 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d2,
      },
      d5: {
        ...defaults.windows.d5,
        ...(windows.d5 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d5,
      },
      d10: {
        ...defaults.windows.d10,
        ...(windows.d10 || {}),
        dayOffset: COMEBACK_WINDOW_OFFSETS.d10,
      },
    },
  };
}

function getDayKeyDistance(previousDayKey, currentDayKey) {
  if (!previousDayKey || !currentDayKey) return 0;
  const previousMs = Date.parse(`${previousDayKey}T00:00:00.000Z`);
  const currentMs = Date.parse(`${currentDayKey}T00:00:00.000Z`);
  if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return 0;
  return Math.max(0, Math.round((currentMs - previousMs) / (24 * 60 * 60 * 1000)));
}

function deriveComebackCampaign(runtime = {}, nowMs = Date.now()) {
  const currentDayKey = getDayKey(new Date(nowMs));
  const campaign = normalizeComebackCampaign(runtime?.comebackCampaign || {});
  const lastActiveDayKey = String(campaign?.lastActiveDayKey || runtime?.dayKey || '').trim();
  const inactiveDays = getDayKeyDistance(lastActiveDayKey, currentDayKey);
  const nextWindows = Object.entries(campaign.windows).reduce((acc, [windowKey, windowValue]) => {
    acc[windowKey] = {
      ...windowValue,
      eligible: false,
    };
    return acc;
  }, {});

  let eligibleWindow = null;
  let triggeredWindow = null;

  if (lastActiveDayKey && inactiveDays > 0) {
    Object.entries(COMEBACK_WINDOW_OFFSETS).forEach(([windowKey, dayOffset]) => {
      if (inactiveDays === dayOffset) {
        const previousWindow = nextWindows[windowKey];
        const firstTriggerForToday = previousWindow.lastEligibleDayKey !== currentDayKey;
        nextWindows[windowKey] = {
          ...previousWindow,
          eligible: true,
          lastEligibleDayKey: currentDayKey,
          lastTriggeredAt: firstTriggerForToday ? new Date(nowMs).toISOString() : previousWindow.lastTriggeredAt,
          shownCount: firstTriggerForToday ? Number(previousWindow.shownCount || 0) + 1 : Number(previousWindow.shownCount || 0),
        };
        eligibleWindow = windowKey;
        if (firstTriggerForToday) triggeredWindow = windowKey;
      }
    });
  }

  return {
    campaign: {
      ...campaign,
      lastActiveDayKey: currentDayKey,
      eligibleWindow,
      windows: nextWindows,
    },
    triggeredWindow,
    inactiveDays,
    currentDayKey,
  };
}

function buildMemberFromProfile(profile = {}, fallbackName = 'You') {
  const displayName = String(profile.name || fallbackName).trim() || fallbackName;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'Y';

  return {
    id: 'self',
    name: displayName,
    role: 'parent',
    points: 260,
    level: 3,
    initials,
    completed: 5,
    effortHours: 4.1,
    accuracy: 76,
    status: 'active',
  };
}

function normalizeSquadMember(member = {}) {
  const next = { ...(member || {}) };
  const memberId = String(next.id || '').trim();
  const role = String(next.role || '').trim().toLowerCase();
  if (memberId === 'self') {
    next.role = role || 'parent';
  } else {
    next.role = role || 'child';
  }

  const ghostPresence = next?.ghostPresence && typeof next.ghostPresence === 'object'
    ? next.ghostPresence
    : {};
  next.ghostPresence = {
    streakIntensity: clampNumber(Number(ghostPresence.streakIntensity || 0), 0, 1),
    focusVelocity: Math.max(0, Number(ghostPresence.focusVelocity || 0)),
    isFlowState: Boolean(ghostPresence.isFlowState),
    updatedAt: ghostPresence.updatedAt || null,
  };

  return next;
}

function normalizeSquadSync(raw = {}) {
  const defaults = createDefaultSquadSync();
  const safeMembers = Array.isArray(raw.members) ? raw.members.map((member) => normalizeSquadMember(member)) : [];
  const fieldClock = raw?.syncMeta?.fieldClock;

  return {
    ...defaults,
    ...(raw || {}),
    weeklyGoal: {
      ...defaults.weeklyGoal,
      ...(raw.weeklyGoal || {}),
    },
    weeklyChallenge: {
      ...defaults.weeklyChallenge,
      ...(raw.weeklyChallenge || {}),
    },
    householdBoard: {
      ...defaults.householdBoard,
      ...(raw.householdBoard || {}),
      items: Array.isArray(raw?.householdBoard?.items)
        ? raw.householdBoard.items
        : defaults.householdBoard.items,
    },
    streakChain: {
      ...defaults.streakChain,
      ...(raw.streakChain || {}),
    },
    nudgeCooldownByMember: raw.nudgeCooldownByMember && typeof raw.nudgeCooldownByMember === 'object'
      ? raw.nudgeCooldownByMember
      : {},
    moderation: {
      ...defaults.moderation,
      ...(raw.moderation || {}),
      rateBuckets: raw?.moderation?.rateBuckets && typeof raw.moderation.rateBuckets === 'object'
        ? raw.moderation.rateBuckets
        : {},
      mutedActors: raw?.moderation?.mutedActors && typeof raw.moderation.mutedActors === 'object'
        ? raw.moderation.mutedActors
        : {},
      violationsByActor: raw?.moderation?.violationsByActor && typeof raw.moderation.violationsByActor === 'object'
        ? raw.moderation.violationsByActor
        : {},
      escalationByActor: raw?.moderation?.escalationByActor && typeof raw.moderation.escalationByActor === 'object'
        ? raw.moderation.escalationByActor
        : {},
      auditTrail: Array.isArray(raw?.moderation?.auditTrail)
        ? raw.moderation.auditTrail
        : [],
    },
    season: {
      ...defaults.season,
      ...(raw.season || {}),
      leaderboard: Array.isArray(raw?.season?.leaderboard)
        ? raw.season.leaderboard
        : [],
      tierSummary: raw?.season?.tierSummary && typeof raw.season.tierSummary === 'object'
        ? {
            bronze: Number(raw.season.tierSummary.bronze || 0),
            silver: Number(raw.season.tierSummary.silver || 0),
            gold: Number(raw.season.tierSummary.gold || 0),
            platinum: Number(raw.season.tierSummary.platinum || 0),
          }
        : { ...defaults.season.tierSummary },
      intentTransitionSummary: raw?.season?.intentTransitionSummary && typeof raw.season.intentTransitionSummary === 'object'
        ? raw.season.intentTransitionSummary
        : { ...defaults.season.intentTransitionSummary },
      archived: Array.isArray(raw?.season?.archived)
        ? raw.season.archived
        : [],
    },
    syncMeta: {
      ...defaults.syncMeta,
      ...(raw.syncMeta || {}),
      fieldClock: fieldClock && typeof fieldClock === 'object' ? fieldClock : {},
    },
    members: safeMembers,
  };
}

function toEpoch(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getUtcWeekWindow(nowMs = Date.now()) {
  const now = new Date(nowMs);
  const startOfDayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const day = now.getUTCDay();
  const offsetToMonday = (day + 6) % 7;
  const startMs = startOfDayMs - (offsetToMonday * 24 * 60 * 60 * 1000);
  const endMs = startMs + (7 * 24 * 60 * 60 * 1000);
  return {
    startMs,
    endMs,
    weekKey: new Date(startMs).toISOString().slice(0, 10),
  };
}

function getSeasonScore(member = {}) {
  const points = Number(member?.points || 0);
  const completed = Number(member?.completed || 0);
  const effortHours = Number(member?.effortHours || 0);
  const accuracy = Number(member?.accuracy || 0);
  const level = Number(member?.level || 0);

  return Math.round(
    points
    + (completed * 18)
    + (effortHours * 14)
    + (accuracy * 6)
    + (level * 10),
  );
}

function getGhostStreakIntensity({ focusVelocity = 0, streakDays = 0, isFlowState = false } = {}) {
  const velocityScore = clampNumber(Number(focusVelocity || 0) / 10, 0, 1);
  const streakScore = clampNumber(Number(streakDays || 0) / 10, 0, 1);
  const flowBoost = isFlowState ? 0.08 : 0;
  return Number(clampNumber((velocityScore * 0.65) + (streakScore * 0.35) + flowBoost, 0, 1).toFixed(3));
}

function getSeasonFairPlay(member = {}) {
  const completed = Math.max(0, Number(member?.completed || 0));
  const effortHours = Math.max(0, Number(member?.effortHours || 0));
  const accuracy = clampNumber(Number(member?.accuracy || 0), 0, 100);

  const accuracyQuality = clampNumber(accuracy / 100, 0.45, 1);
  const effortPerCompletion = completed > 0 ? (effortHours / completed) : 1;
  const completionQuality = clampNumber(effortPerCompletion / 0.65, 0.5, 1.1);
  const completionSpamRatio = completed > 0 ? (completed / Math.max(1, effortHours * 2.5)) : 0;
  const consistencyQuality = clampNumber(1 - (Math.max(0, completionSpamRatio - 1) * 0.35), 0.55, 1);

  const fairPlayMultiplier = clampNumber(
    (accuracyQuality * 0.5) + (completionQuality * 0.3) + (consistencyQuality * 0.2),
    0.55,
    1.08,
  );

  return {
    multiplier: Number(fairPlayMultiplier.toFixed(3)),
    accuracyQuality,
    completionQuality,
    consistencyQuality,
  };
}

function getSeasonWeightedScore(member = {}) {
  const rawScore = getSeasonScore(member);
  const fairPlay = getSeasonFairPlay(member);
  const weightedScore = Math.max(0, Math.round(rawScore * fairPlay.multiplier));
  const fairPlayDelta = weightedScore - rawScore;
  const fairPlayDeltaPct = rawScore > 0
    ? Number(((fairPlayDelta / rawScore) * 100).toFixed(2))
    : 0;
  return {
    rawScore,
    weightedScore,
    fairPlay,
    fairPlayDelta,
    fairPlayDeltaPct,
  };
}

function getIntentSegmentAssignment(member = {}, weighted = {}) {
  const completed = Math.max(0, Number(member?.completed || 0));
  const effortHours = Math.max(0, Number(member?.effortHours || 0));
  const accuracy = clampNumber(Number(member?.accuracy || 0), 0, 100);
  const level = Math.max(0, Number(member?.level || 0));
  const rawScore = Math.max(0, Number(weighted?.rawScore || getSeasonScore(member)));
  const weightedScore = Math.max(0, Number(weighted?.weightedScore || rawScore));
  const fairPlayMultiplier = clampNumber(Number(weighted?.fairPlay?.multiplier || 1), 0.55, 1.08);

  const activitySignal = clampNumber((completed / 10) + (effortHours / 8), 0, 1);
  const qualitySignal = clampNumber(((accuracy / 100) * 0.6) + (((fairPlayMultiplier - 0.55) / 0.53) * 0.4), 0, 1);
  const progressionSignal = clampNumber((level / 8) + (weightedScore / 1200), 0, 1);
  const intentScore = Number((((activitySignal * 0.45) + (qualitySignal * 0.4) + (progressionSignal * 0.15)) * 100).toFixed(1));

  let segment = 'low-intent';
  if (intentScore >= 72) segment = 'high-intent';
  else if (intentScore >= 45) segment = 'warming';

  return {
    segment,
    intentScore,
    signals: {
      activity: Number(activitySignal.toFixed(3)),
      quality: Number(qualitySignal.toFixed(3)),
      progression: Number(progressionSignal.toFixed(3)),
    },
    inputs: {
      completed,
      effortHours: Number(effortHours.toFixed(2)),
      accuracy: Number(accuracy.toFixed(1)),
      level,
      rawScore,
      weightedScore,
      fairPlayMultiplier,
    },
  };
}

function getTierFromRank(rankIndex, total) {
  if (total <= 1) return 'platinum';
  const percentile = (rankIndex + 1) / total;
  if (percentile <= 0.1) return 'platinum';
  if (percentile <= 0.35) return 'gold';
  if (percentile <= 0.7) return 'silver';
  return 'bronze';
}

function buildSeasonLeaderboard(members = []) {
  const scoreRows = (Array.isArray(members) ? members : [])
    .map((member) => normalizeSquadMember(member))
    .filter((member) => String(member?.id || '').trim().length > 0)
    .map((member) => {
      const weighted = getSeasonWeightedScore(member);
      const intent = getIntentSegmentAssignment(member, weighted);
      return {
        id: String(member.id),
        name: String(member.name || member.id || 'Member').trim() || 'Member',
        role: String(member.role || 'child').trim() || 'child',
        score: weighted.weightedScore,
        rawScore: weighted.rawScore,
        weightedScore: weighted.weightedScore,
        fairPlayMultiplier: weighted.fairPlay.multiplier,
        fairPlayDelta: weighted.fairPlayDelta,
        fairPlayDeltaPct: weighted.fairPlayDeltaPct,
        qualitySignals: {
          accuracy: Number(weighted.fairPlay.accuracyQuality.toFixed(3)),
          completion: Number(weighted.fairPlay.completionQuality.toFixed(3)),
          consistency: Number(weighted.fairPlay.consistencyQuality.toFixed(3)),
        },
        fairPlayWeighting: {
          rawScore: weighted.rawScore,
          weightedScore: weighted.weightedScore,
          delta: weighted.fairPlayDelta,
          deltaPct: weighted.fairPlayDeltaPct,
          multiplier: weighted.fairPlay.multiplier,
          qualitySignals: {
            accuracy: Number(weighted.fairPlay.accuracyQuality.toFixed(3)),
            completion: Number(weighted.fairPlay.completionQuality.toFixed(3)),
            consistency: Number(weighted.fairPlay.consistencyQuality.toFixed(3)),
          },
        },
        intentSegment: intent.segment,
        intentScore: intent.intentScore,
        intentSignals: intent.signals,
        intentInputs: intent.inputs,
      };
    });

  const rawRankByMemberId = scoreRows
    .slice()
    .sort((a, b) => {
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      return a.name.localeCompare(b.name);
    })
    .reduce((acc, member, index) => {
      acc[member.id] = index + 1;
      return acc;
    }, {});

  const safeMembers = scoreRows
    .slice()
    .sort((a, b) => {
      if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore;
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      return a.name.localeCompare(b.name);
    });

  return safeMembers.map((member, index) => ({
    ...member,
    rank: index + 1,
    rawRank: Number(rawRankByMemberId[member.id] || (index + 1)),
    rankDelta: Number(rawRankByMemberId[member.id] || (index + 1)) - (index + 1),
    tier: getTierFromRank(index, safeMembers.length),
  }));
}

function summarizeSeasonTiers(leaderboard = []) {
  return (Array.isArray(leaderboard) ? leaderboard : []).reduce((acc, member) => {
    const tier = String(member?.tier || '').trim().toLowerCase();
    if (tier === 'platinum' || tier === 'gold' || tier === 'silver' || tier === 'bronze') {
      acc[tier] += 1;
    }
    return acc;
  }, {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  });
}

function deriveSeasonState(state = {}, nowMs = Date.now()) {
  const defaults = createDefaultSquadSync().season;
  const currentSeason = {
    ...defaults,
    ...(state?.season || {}),
    leaderboard: Array.isArray(state?.season?.leaderboard) ? state.season.leaderboard : [],
    tierSummary: state?.season?.tierSummary && typeof state.season.tierSummary === 'object'
      ? {
          bronze: Number(state.season.tierSummary.bronze || 0),
          silver: Number(state.season.tierSummary.silver || 0),
          gold: Number(state.season.tierSummary.gold || 0),
          platinum: Number(state.season.tierSummary.platinum || 0),
        }
      : { ...defaults.tierSummary },
    intentTransitionSummary: state?.season?.intentTransitionSummary && typeof state.season.intentTransitionSummary === 'object'
      ? state.season.intentTransitionSummary
      : createEmptyIntentTransitionSummary(),
    archived: Array.isArray(state?.season?.archived) ? state.season.archived : [],
  };

  const previousByMemberId = (Array.isArray(currentSeason.leaderboard) ? currentSeason.leaderboard : [])
    .reduce((acc, entry) => {
      const memberId = String(entry?.id || '').trim();
      if (!memberId) return acc;
      acc[memberId] = normalizeIntentSegment(entry?.intentSegment);
      return acc;
    }, {});

  const leaderboard = buildSeasonLeaderboard(state?.members || []).map((entry) => {
    const previousIntentSegment = normalizeIntentSegment(previousByMemberId[entry.id] || entry.intentSegment);
    const currentIntentSegment = normalizeIntentSegment(entry.intentSegment);
    return {
      ...entry,
      intentSegment: currentIntentSegment,
      previousIntentSegment,
      intentTransition: `${previousIntentSegment}->${currentIntentSegment}`,
      intentTransitionChanged: previousIntentSegment !== currentIntentSegment,
    };
  });
  const tierSummary = summarizeSeasonTiers(leaderboard);
  const intentTransitionSummary = summarizeIntentTransitions(leaderboard);
  const { startMs, endMs, weekKey } = getUtcWeekWindow(nowMs);
  const expectedSeasonId = `season-${weekKey}`;

  const hasWindow = Boolean(currentSeason.startsAt && currentSeason.endsAt);
  const needsInit = !currentSeason.seasonId || !hasWindow;
  const needsReset = hasWindow && nowMs >= toEpoch(currentSeason.endsAt);

  let archived = Array.isArray(currentSeason.archived) ? [...currentSeason.archived] : [];
  let resetCount = Number(currentSeason.resetCount || 0);

  if (needsReset && currentSeason.seasonId) {
    archived.push({
      seasonId: currentSeason.seasonId,
      weekKey: currentSeason.weekKey,
      startsAt: currentSeason.startsAt,
      endsAt: currentSeason.endsAt,
      leaderboard: Array.isArray(currentSeason.leaderboard) ? currentSeason.leaderboard : [],
      tierSummary: currentSeason.tierSummary && typeof currentSeason.tierSummary === 'object'
        ? currentSeason.tierSummary
        : { ...defaults.tierSummary },
      rolledOverAt: new Date(nowMs).toISOString(),
    });
    archived = archived.slice(-12);
    resetCount += 1;
  }

  const nextSeason = {
    ...currentSeason,
    seasonId: expectedSeasonId,
    weekKey,
    startsAt: new Date(startMs).toISOString(),
    endsAt: new Date(endMs).toISOString(),
    resetCadence: 'weekly',
    resetCount,
    leaderboard,
    tierSummary,
    intentTransitionSummary,
    archived,
  };

  const changed = JSON.stringify(currentSeason) !== JSON.stringify(nextSeason);
  return {
    season: nextSeason,
    changed,
    rolledOver: Boolean(needsReset),
  };
}
function reconcileSquadSync(localRaw = {}, incomingRaw = {}) {
  const local = normalizeSquadSync(localRaw);
  const incoming = normalizeSquadSync(incomingRaw);
  const merged = {
    ...local,
    ...incoming,
  };

  const fields = [
    'teamId',
    'teamName',
    'inviteCode',
    'weeklyGoal',
    'weeklyChallenge',
    'householdBoard',
    'streakChain',
    'nudgeCooldownByMember',
    'moderation',
    'season',
    'members',
  ];

  const localClock = local.syncMeta?.fieldClock || {};
  const incomingClock = incoming.syncMeta?.fieldClock || {};
  const localUpdatedAt = toEpoch(local.updatedAt || local.syncMeta?.lastMutationAt);
  const incomingUpdatedAt = toEpoch(incoming.updatedAt || incoming.syncMeta?.lastMutationAt);

  fields.forEach((field) => {
    const left = Number(localClock[field] || 0);
    const right = Number(incomingClock[field] || 0);
    if (right > left) {
      merged[field] = incoming[field];
      return;
    }
    if (left > right) {
      merged[field] = local[field];
      return;
    }
    merged[field] = incomingUpdatedAt >= localUpdatedAt ? incoming[field] : local[field];
  });

  const mergedFieldClock = {
    ...localClock,
    ...incomingClock,
  };

  Object.keys(localClock).forEach((field) => {
    mergedFieldClock[field] = Math.max(Number(localClock[field] || 0), Number(incomingClock[field] || 0));
  });

  return normalizeSquadSync({
    ...merged,
    updatedAt: incomingUpdatedAt >= localUpdatedAt ? incoming.updatedAt : local.updatedAt,
    syncMeta: {
      ...merged.syncMeta,
      revision: Math.max(Number(local.syncMeta?.revision || 0), Number(incoming.syncMeta?.revision || 0)),
      lastMutationAt: incomingUpdatedAt >= localUpdatedAt
        ? (incoming.syncMeta?.lastMutationAt || incoming.updatedAt)
        : (local.syncMeta?.lastMutationAt || local.updatedAt),
      lastWriterDeviceId: incomingUpdatedAt >= localUpdatedAt
        ? (incoming.syncMeta?.lastWriterDeviceId || 'local-device')
        : (local.syncMeta?.lastWriterDeviceId || 'local-device'),
      fieldClock: mergedFieldClock,
    },
  });
}

export {
  buildInviteCode,
  normalizeComebackCampaign,
  deriveComebackCampaign,
  buildMemberFromProfile,
  normalizeSquadSync,
  getGhostStreakIntensity,
  deriveSeasonState,
  reconcileSquadSync,
};
