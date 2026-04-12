function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
  return {
    rawScore,
    weightedScore,
    fairPlay,
    fairPlayDelta: weightedScore - rawScore,
  };
}

function buildRows(members = []) {
  const rows = members.map((member) => {
    const weighted = getSeasonWeightedScore(member);
    return {
      id: member.id,
      name: member.name,
      rawScore: weighted.rawScore,
      weightedScore: weighted.weightedScore,
      fairPlayMultiplier: weighted.fairPlay.multiplier,
      fairPlayDelta: weighted.fairPlayDelta,
    };
  });

  const rawSorted = rows.slice().sort((a, b) => b.rawScore - a.rawScore || a.name.localeCompare(b.name));
  const weightedSorted = rows.slice().sort((a, b) => b.weightedScore - a.weightedScore || a.name.localeCompare(b.name));

  return { rows, rawSorted, weightedSorted };
}

const members = [
  {
    id: 'spammer-max',
    name: 'Spammer Max',
    points: 160,
    completed: 28,
    effortHours: 2.4,
    accuracy: 49,
    level: 3,
  },
  {
    id: 'steady-ava',
    name: 'Steady Ava',
    points: 155,
    completed: 14,
    effortHours: 7.2,
    accuracy: 86,
    level: 4,
  },
  {
    id: 'focus-liam',
    name: 'Focus Liam',
    points: 150,
    completed: 12,
    effortHours: 6.4,
    accuracy: 83,
    level: 4,
  },
  {
    id: 'balanced-maya',
    name: 'Balanced Maya',
    points: 142,
    completed: 11,
    effortHours: 5.8,
    accuracy: 79,
    level: 4,
  },
];

const { rows, rawSorted, weightedSorted } = buildRows(members);
const spammer = rows.find((row) => row.id === 'spammer-max');

console.log(JSON.stringify({
  date: new Date().toISOString().slice(0, 10),
  members: rows.length,
  rawLeader: rawSorted[0]?.id || null,
  weightedLeader: weightedSorted[0]?.id || null,
  antiSpamDelta: spammer ? spammer.fairPlayDelta : null,
  spammerMultiplier: spammer ? spammer.fairPlayMultiplier : null,
  rows,
}, null, 2));
