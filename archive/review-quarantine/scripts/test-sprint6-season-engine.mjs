const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
  const startMs = startOfDayMs - (offsetToMonday * MS_PER_DAY);
  const endMs = startMs + (7 * MS_PER_DAY);
  return {
    startMs,
    endMs,
    weekKey: new Date(startMs).toISOString().slice(0, 10),
  };
}

function normalizeMember(member = {}) {
  return {
    id: String(member?.id || '').trim(),
    name: String(member?.name || member?.id || 'Member').trim() || 'Member',
    role: String(member?.role || 'child').trim() || 'child',
    points: Number(member?.points || 0),
    completed: Number(member?.completed || 0),
    effortHours: Number(member?.effortHours || 0),
    accuracy: Number(member?.accuracy || 0),
    level: Number(member?.level || 0),
  };
}

function getSeasonScore(member = {}) {
  const safe = normalizeMember(member);
  return Math.round(
    safe.points
    + (safe.completed * 18)
    + (safe.effortHours * 14)
    + (safe.accuracy * 6)
    + (safe.level * 10),
  );
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
  const safeMembers = (Array.isArray(members) ? members : [])
    .map((member) => normalizeMember(member))
    .filter((member) => member.id)
    .map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      score: getSeasonScore(member),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

  return safeMembers.map((member, index) => ({
    ...member,
    rank: index + 1,
    tier: getTierFromRank(index, safeMembers.length),
  }));
}

function summarizeSeasonTiers(leaderboard = []) {
  return (Array.isArray(leaderboard) ? leaderboard : []).reduce((acc, row) => {
    const tier = String(row?.tier || '').toLowerCase();
    if (tier === 'platinum' || tier === 'gold' || tier === 'silver' || tier === 'bronze') {
      acc[tier] += 1;
    }
    return acc;
  }, { bronze: 0, silver: 0, gold: 0, platinum: 0 });
}

function deriveSeasonState(input = {}, nowMs = Date.now()) {
  const current = {
    seasonId: input?.season?.seasonId || null,
    weekKey: input?.season?.weekKey || null,
    startsAt: input?.season?.startsAt || null,
    endsAt: input?.season?.endsAt || null,
    resetCadence: 'weekly',
    resetCount: Number(input?.season?.resetCount || 0),
    leaderboard: Array.isArray(input?.season?.leaderboard) ? input.season.leaderboard : [],
    tierSummary: input?.season?.tierSummary && typeof input.season.tierSummary === 'object'
      ? input.season.tierSummary
      : { bronze: 0, silver: 0, gold: 0, platinum: 0 },
    archived: Array.isArray(input?.season?.archived) ? input.season.archived : [],
  };

  const leaderboard = buildSeasonLeaderboard(input?.members || []);
  const tierSummary = summarizeSeasonTiers(leaderboard);
  const { startMs, endMs, weekKey } = getUtcWeekWindow(nowMs);
  const expectedSeasonId = `season-${weekKey}`;

  const hasWindow = Boolean(current.startsAt && current.endsAt);
  const needsReset = hasWindow && nowMs >= toEpoch(current.endsAt);
  const needsInit = !current.seasonId || !hasWindow;

  let archived = [...current.archived];
  let resetCount = current.resetCount;

  if (needsReset && current.seasonId) {
    archived.push({
      seasonId: current.seasonId,
      weekKey: current.weekKey,
      startsAt: current.startsAt,
      endsAt: current.endsAt,
      leaderboard: current.leaderboard,
      tierSummary: current.tierSummary,
      rolledOverAt: new Date(nowMs).toISOString(),
    });
    archived = archived.slice(-12);
    resetCount += 1;
  }

  const next = {
    ...current,
    seasonId: expectedSeasonId,
    weekKey,
    startsAt: new Date(startMs).toISOString(),
    endsAt: new Date(endMs).toISOString(),
    resetCadence: 'weekly',
    resetCount,
    leaderboard,
    tierSummary,
    archived,
  };

  return {
    previousSeasonId: current.seasonId,
    nextSeasonId: next.seasonId,
    resetApplied: needsReset,
    season: next,
  };
}

const nowMs = Date.now();
const { startMs, endMs } = getUtcWeekWindow(nowMs - (8 * MS_PER_DAY));

const simulatedState = {
  members: [
    { id: 'self', name: 'You', role: 'parent', points: 420, completed: 9, effortHours: 5.4, accuracy: 82, level: 4 },
    { id: 'member-2', name: 'Ari', role: 'child', points: 330, completed: 8, effortHours: 4.8, accuracy: 76, level: 3 },
    { id: 'member-3', name: 'Maya', role: 'child', points: 270, completed: 6, effortHours: 3.9, accuracy: 71, level: 3 },
    { id: 'member-4', name: 'Liam', role: 'child', points: 180, completed: 4, effortHours: 2.1, accuracy: 64, level: 2 },
  ],
  season: {
    seasonId: 'season-expired-window',
    weekKey: 'expired-week',
    startsAt: new Date(startMs).toISOString(),
    endsAt: new Date(endMs).toISOString(),
    resetCadence: 'weekly',
    resetCount: 0,
    leaderboard: [],
    tierSummary: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
    archived: [],
  },
};

const first = deriveSeasonState(simulatedState, nowMs);
const second = deriveSeasonState({ ...simulatedState, season: first.season }, nowMs);
const deterministic = JSON.stringify(first.season.leaderboard) === JSON.stringify(second.season.leaderboard)
  && JSON.stringify(first.season.tierSummary) === JSON.stringify(second.season.tierSummary);

console.log(JSON.stringify({
  date: new Date(nowMs).toISOString().slice(0, 10),
  previousSeason: first.previousSeasonId,
  nextSeason: first.nextSeasonId,
  resetAt: first.season.startsAt,
  resetApplied: first.resetApplied,
  memberCount: first.season.leaderboard.length,
  tierSummary: first.season.tierSummary,
  deterministic,
}, null, 2));
