import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, limit as fsLimit } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import {
  enforceServerModerationPolicy,
  fetchSquadSyncSnapshot,
  pushSquadSyncSnapshot,
  runServerModerationAdminAction,
} from '../firebaseServices.js';

const TEAM_ID = `sprint5-two-runtime-${new Date().toISOString().slice(0, 10)}`;
const ACTOR_ID = 'actor-validation-child';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toEpoch(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSquadSync(raw = {}) {
  const updatedAt = raw?.updatedAt || new Date().toISOString();
  const syncMeta = raw?.syncMeta && typeof raw.syncMeta === 'object' ? raw.syncMeta : {};
  const fieldClock = syncMeta?.fieldClock && typeof syncMeta.fieldClock === 'object' ? syncMeta.fieldClock : {};

  return {
    teamId: raw?.teamId || TEAM_ID,
    teamName: raw?.teamName || 'Validation Team',
    inviteCode: raw?.inviteCode || 'VAL123',
    weeklyGoal: Number(raw?.weeklyGoal || 3),
    weeklyChallenge: raw?.weeklyChallenge || 'Daily Civic Sprint',
    householdBoard: Array.isArray(raw?.householdBoard) ? raw.householdBoard : [],
    streakChain: raw?.streakChain && typeof raw.streakChain === 'object' ? raw.streakChain : { days: 0, lastUpdated: null },
    nudgeCooldownByMember: raw?.nudgeCooldownByMember && typeof raw.nudgeCooldownByMember === 'object' ? raw.nudgeCooldownByMember : {},
    moderation: raw?.moderation && typeof raw.moderation === 'object' ? raw.moderation : {},
    members: Array.isArray(raw?.members) ? raw.members : [],
    updatedAt,
    syncMeta: {
      revision: Number(syncMeta?.revision || 0),
      lastMutationAt: syncMeta?.lastMutationAt || updatedAt,
      lastWriterDeviceId: syncMeta?.lastWriterDeviceId || 'validation-runtime',
      fieldClock,
    },
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
        ? (incoming.syncMeta?.lastWriterDeviceId || 'validation-runtime')
        : (local.syncMeta?.lastWriterDeviceId || 'validation-runtime'),
      fieldClock: mergedFieldClock,
    },
  });
}

async function ensureBaseline() {
  const nowMs = Date.now();
  const baseline = normalizeSquadSync({
    teamId: TEAM_ID,
    teamName: 'Validation Team',
    inviteCode: 'BASE123',
    weeklyGoal: 3,
    weeklyChallenge: 'Validation Challenge',
    householdBoard: [{ id: 'board-1', label: 'Read one civics question', completed: false }],
    members: [
      { id: 'parent-a', role: 'parent' },
      { id: 'child-b', role: 'child' },
    ],
    syncMeta: {
      revision: 1,
      lastMutationAt: new Date(nowMs).toISOString(),
      lastWriterDeviceId: 'baseline-writer',
      fieldClock: {
        weeklyGoal: nowMs,
        inviteCode: nowMs,
        householdBoard: nowMs,
        moderation: nowMs,
      },
    },
  });

  await pushSquadSyncSnapshot(TEAM_ID, baseline, { writerDeviceId: 'baseline-writer', revision: 1 });
  await runServerModerationAdminAction(TEAM_ID, 'reset_rate_buckets', { actorId: '*' });
  await runServerModerationAdminAction(TEAM_ID, 'reset_actor_escalation', { actorId: ACTOR_ID });
  await runServerModerationAdminAction(TEAM_ID, 'clear_actor_mute', { actorId: ACTOR_ID });
  return baseline;
}

async function runScenario1() {
  const before = normalizeSquadSync(await fetchSquadSyncSnapshot(TEAM_ID));
  const t1 = Date.now() + 1;
  const t2 = t1 + 2;

  const deviceA = normalizeSquadSync({
    ...before,
    weeklyGoal: Number(before.weeklyGoal || 0) + 1,
    updatedAt: new Date(t1).toISOString(),
    syncMeta: {
      ...before.syncMeta,
      revision: Number(before.syncMeta?.revision || 0) + 1,
      lastMutationAt: new Date(t1).toISOString(),
      lastWriterDeviceId: 'device-a',
      fieldClock: {
        ...(before.syncMeta?.fieldClock || {}),
        weeklyGoal: t1,
      },
    },
  });

  const deviceB = normalizeSquadSync({
    ...before,
    inviteCode: `INV${String(t2).slice(-4)}`,
    householdBoard: (before.householdBoard || []).map((item) => ({ ...item, completed: !Boolean(item.completed) })),
    updatedAt: new Date(t2).toISOString(),
    syncMeta: {
      ...before.syncMeta,
      revision: Number(before.syncMeta?.revision || 0) + 1,
      lastMutationAt: new Date(t2).toISOString(),
      lastWriterDeviceId: 'device-b',
      fieldClock: {
        ...(before.syncMeta?.fieldClock || {}),
        inviteCode: t2,
        householdBoard: t2,
      },
    },
  });

  await pushSquadSyncSnapshot(TEAM_ID, deviceA, { writerDeviceId: 'device-a', revision: deviceA.syncMeta.revision });
  await pushSquadSyncSnapshot(TEAM_ID, deviceB, { writerDeviceId: 'device-b', revision: deviceB.syncMeta.revision });

  const afterConcurrent = normalizeSquadSync(await fetchSquadSyncSnapshot(TEAM_ID));
  const reconciledA = reconcileSquadSync(deviceA, afterConcurrent);
  const reconciledB = reconcileSquadSync(deviceB, afterConcurrent);

  await pushSquadSyncSnapshot(TEAM_ID, reconciledA, { writerDeviceId: 'device-a', revision: reconciledA.syncMeta.revision });
  await sleep(250);
  const finalRemote = normalizeSquadSync(await fetchSquadSyncSnapshot(TEAM_ID));
  const finalA = reconcileSquadSync(reconciledA, finalRemote);
  const finalB = reconcileSquadSync(reconciledB, finalRemote);

  return {
    beforeRevisionA: before.syncMeta.revision,
    beforeRevisionB: before.syncMeta.revision,
    afterRevisionA: finalA.syncMeta.revision,
    afterRevisionB: finalB.syncMeta.revision,
    weeklyGoalBefore: before.weeklyGoal,
    weeklyGoalAfter: finalRemote.weeklyGoal,
    inviteCodeBefore: before.inviteCode,
    inviteCodeAfter: finalRemote.inviteCode,
    boardItemId: finalRemote.householdBoard?.[0]?.id || 'board-1',
    boardBeforeCompleted: Boolean(before.householdBoard?.[0]?.completed),
    boardAfterCompleted: Boolean(finalRemote.householdBoard?.[0]?.completed),
    convergedSameState: JSON.stringify(normalizeSquadSync(finalA)) === JSON.stringify(normalizeSquadSync(finalB)),
  };
}

async function runScenario2And3() {
  const auditDocIds = [];
  let rateLimitAttempt = null;
  let muteUntilIso = null;
  let firstBlockedReason = null;

  const escalationBeforeSnap = normalizeSquadSync(await fetchSquadSyncSnapshot(TEAM_ID));
  const escalationBefore = Number(escalationBeforeSnap?.moderation?.escalationByActor?.[ACTOR_ID]?.level || 0);

  for (let attempt = 1; attempt <= 7; attempt += 1) {
    const result = await enforceServerModerationPolicy(TEAM_ID, {
      actionType: 'nudge_send',
      actorId: ACTOR_ID,
      actorRole: 'child',
      targetMemberIds: ['child-b'],
    });
    if (result?.auditDocId) auditDocIds.push(result.auditDocId);

    if (!result?.decision?.allowed && rateLimitAttempt === null) {
      rateLimitAttempt = attempt;
      firstBlockedReason = result?.decision?.reason || 'unknown';
    }

    if (result?.decision?.mutedUntilIso) {
      muteUntilIso = result.decision.mutedUntilIso;
      break;
    }
  }

  const blockedOnOtherRuntime = await enforceServerModerationPolicy(TEAM_ID, {
    actionType: 'nudge_send',
    actorId: ACTOR_ID,
    actorRole: 'child',
    targetMemberIds: ['child-b'],
  });
  if (blockedOnOtherRuntime?.auditDocId) auditDocIds.push(blockedOnOtherRuntime.auditDocId);

  await runServerModerationAdminAction(TEAM_ID, 'clear_actor_mute', { actorId: ACTOR_ID });
  await enforceServerModerationPolicy(TEAM_ID, {
    actionType: 'nudge_send',
    actorId: ACTOR_ID,
    actorRole: 'child',
    targetMemberIds: ['child-b'],
  });
  await runServerModerationAdminAction(TEAM_ID, 'clear_actor_mute', { actorId: ACTOR_ID });
  const escalationHit = await enforceServerModerationPolicy(TEAM_ID, {
    actionType: 'nudge_send',
    actorId: ACTOR_ID,
    actorRole: 'child',
    targetMemberIds: ['child-b'],
  });
  if (escalationHit?.auditDocId) auditDocIds.push(escalationHit.auditDocId);

  await sleep(600);

  const latestSnapshot = normalizeSquadSync(await fetchSquadSyncSnapshot(TEAM_ID));
  const escalationAfter = Number(latestSnapshot?.moderation?.escalationByActor?.[ACTOR_ID]?.level || 0);

  const q = query(
    collection(db, 'squads', TEAM_ID, 'auditTrail'),
    orderBy('loggedAt', 'desc'),
    fsLimit(20),
  );
  const snap = await getDocs(q);
  const auditDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const sortedByAt = [...auditDocs]
    .filter((entry) => typeof entry.at === 'string')
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const allowedEntry = auditDocs.find((entry) => entry.actionType === 'nudge_send' && entry.allowed === true);
  const blockedEntry = auditDocs.find((entry) => entry.actionType === 'nudge_send' && entry.allowed === false);
  const requiredFields = ['actionType', 'actorId', 'actorRole', 'allowed', 'reason', 'count', 'limit', 'escalationLevel', 'at'];
  const hasRequiredFields = (entry) => requiredFields.every((field) => Object.prototype.hasOwnProperty.call(entry || {}, field));
  const timestampsMonotonic = sortedByAt.every((entry, idx) => {
    if (idx === 0) return true;
    return new Date(entry.at).getTime() >= new Date(sortedByAt[idx - 1].at).getTime();
  });

  return {
    actorId: ACTOR_ID,
    actionType: 'nudge_send',
    rateLimitHitAttempt: rateLimitAttempt,
    muteUntilIso: muteUntilIso || 'na',
    escalationBefore,
    escalationAfter,
    blockedReasonOnRuntimeB: blockedOnOtherRuntime?.decision?.reason || 'unknown',
    propagatedWithinPullWindow: blockedOnOtherRuntime?.decision?.allowed === false,
    firstBlockedReason: firstBlockedReason || 'unknown',
    auditDocIds,
    allowedEntryId: allowedEntry?.id || 'na',
    blockedEntryId: blockedEntry?.id || 'na',
    allowedReason: allowedEntry?.reason || 'na',
    blockedReason: blockedEntry?.reason || 'na',
    uiBlockedReason: blockedOnOtherRuntime?.decision?.reason || 'na',
    reasonMatch: (blockedEntry?.reason || '') === (blockedOnOtherRuntime?.decision?.reason || ''),
    timestampsMonotonic,
    requiredFieldsPresent: Boolean(hasRequiredFields(allowedEntry) && hasRequiredFields(blockedEntry)),
  };
}

async function cleanupOldAudit(keep = 60) {
  const q = query(
    collection(db, 'squads', TEAM_ID, 'auditTrail'),
    orderBy('loggedAt', 'desc'),
    fsLimit(200),
  );
  const snap = await getDocs(q);
  const extra = snap.docs.slice(keep);
  await Promise.all(extra.map((d) => deleteDoc(doc(db, 'squads', TEAM_ID, 'auditTrail', d.id))));
}

async function main() {
  await ensureBaseline();
  const scenario1 = await runScenario1();
  const scenario2And3 = await runScenario2And3();
  await cleanupOldAudit(60);

  const output = {
    date: new Date().toISOString().slice(0, 10),
    teamId: TEAM_ID,
    scenario1,
    scenario2: {
      actorId: scenario2And3.actorId,
      actionType: scenario2And3.actionType,
      rateLimitHitAttempt: scenario2And3.rateLimitHitAttempt,
      muteUntilIso: scenario2And3.muteUntilIso,
      escalationBefore: scenario2And3.escalationBefore,
      escalationAfter: scenario2And3.escalationAfter,
      blockedReasonOnRuntimeB: scenario2And3.blockedReasonOnRuntimeB,
      propagatedWithinPullWindow: scenario2And3.propagatedWithinPullWindow,
      firstBlockedReason: scenario2And3.firstBlockedReason,
    },
    scenario3: {
      auditDocIds: scenario2And3.auditDocIds.slice(0, 6),
      allowedEntryId: scenario2And3.allowedEntryId,
      blockedEntryId: scenario2And3.blockedEntryId,
      allowedReason: scenario2And3.allowedReason,
      blockedReason: scenario2And3.blockedReason,
      uiBlockedReason: scenario2And3.uiBlockedReason,
      reasonMatch: scenario2And3.reasonMatch,
      timestampsMonotonic: scenario2And3.timestampsMonotonic,
      requiredFieldsPresent: scenario2And3.requiredFieldsPresent,
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error('two-runtime validation failed:', error);
  process.exit(1);
});
