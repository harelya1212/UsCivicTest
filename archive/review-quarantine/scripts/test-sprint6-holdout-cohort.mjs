function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashStringToBucket(value = '') {
  const input = String(value || '');
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

function deriveRevenueIntelligenceCohort(seed, holdoutPct = 20, nowMs = Date.now()) {
  const safeSeed = String(seed || '').trim();
  const pct = clampNumber(Number(holdoutPct || 20), 1, 50);
  const bucket = hashStringToBucket(safeSeed);
  return {
    seed: safeSeed,
    bucket,
    cohort: bucket < pct ? 'holdout' : 'treatment',
    holdoutPct: pct,
    assignedAt: new Date(nowMs).toISOString(),
  };
}

function findSeedForCohort(prefix, targetCohort, holdoutPct = 20, nowMs = Date.now()) {
  for (let index = 0; index < 5000; index += 1) {
    const seed = `${prefix}-${index}:revenue-intelligence`;
    const result = deriveRevenueIntelligenceCohort(seed, holdoutPct, nowMs);
    if (result.cohort === targetCohort) return result;
  }
  throw new Error(`Unable to find seed for cohort ${targetCohort}`);
}

const nowMs = Date.now();
const treatmentOne = findSeedForCohort('local-ios-treatment', 'treatment', 20, nowMs);
const treatmentTwo = deriveRevenueIntelligenceCohort(treatmentOne.seed, 20, nowMs + 1000);
const holdout = findSeedForCohort('local-ios-holdout', 'holdout', 20, nowMs);

console.log(JSON.stringify({
  date: new Date(nowMs).toISOString().slice(0, 10),
  deterministic: treatmentOne.bucket === treatmentTwo.bucket && treatmentOne.cohort === treatmentTwo.cohort,
  treatmentSeed: treatmentOne.seed,
  treatmentBucket: treatmentOne.bucket,
  treatmentCohort: treatmentOne.cohort,
  holdoutSeed: holdout.seed,
  holdoutBucket: holdout.bucket,
  holdoutCohort: holdout.cohort,
  splitRespected: treatmentOne.cohort === 'treatment' && holdout.cohort === 'holdout',
}, null, 2));
