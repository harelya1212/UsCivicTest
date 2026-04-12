const OFFER_VARIANT_OPTIONS = {
  homeSprintOffer: ['control', 'urgency'],
  homeSprintReward: ['standard', 'extended'],
};

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

function deriveCohort(seed, holdoutPct = 20) {
  const bucket = hashStringToBucket(seed);
  return {
    cohort: bucket < holdoutPct ? 'holdout' : 'treatment',
    bucket,
  };
}

function getOfferFrequencyPolicyForSegment(segment = '') {
  const normalized = String(segment || '').trim().toLowerCase();
  if (normalized === 'high-intent') {
    return {
      rewardedDailyLimitMultiplier: 1.25,
      rewardedCooldownMultiplier: 0.75,
      interstitialDailyLimitMultiplier: 1.25,
      interstitialCooldownMultiplier: 0.75,
      resumeLimitMultiplier: 1,
      quizCompleteLimitMultiplier: 1.25,
    };
  }
  if (normalized === 'low-intent') {
    return {
      rewardedDailyLimitMultiplier: 0.75,
      rewardedCooldownMultiplier: 1.5,
      interstitialDailyLimitMultiplier: 0.75,
      interstitialCooldownMultiplier: 1.5,
      resumeLimitMultiplier: 0.67,
      quizCompleteLimitMultiplier: 0.75,
    };
  }
  return {
    rewardedDailyLimitMultiplier: 1,
    rewardedCooldownMultiplier: 1,
    interstitialDailyLimitMultiplier: 1,
    interstitialCooldownMultiplier: 1,
    resumeLimitMultiplier: 1,
    quizCompleteLimitMultiplier: 1,
  };
}

function getBaselineOfferVariant(variantKey) {
  return OFFER_VARIANT_OPTIONS[variantKey]?.[0] || 'control';
}

function deriveComebackEligibility({ treatmentEnabled, inactiveDays }) {
  if (!treatmentEnabled) return null;
  if (inactiveDays === 2) return 'd2';
  if (inactiveDays === 5) return 'd5';
  if (inactiveDays === 10) return 'd10';
  return null;
}

function buildRuntimeBehavior({ cohort, activeSegment, inactiveDays }) {
  const treatmentEnabled = cohort === 'treatment';
  const effectiveSegment = treatmentEnabled ? activeSegment : 'warming';
  const segmentPolicy = getOfferFrequencyPolicyForSegment(effectiveSegment);
  return {
    treatmentEnabled,
    homeSprintOffer: treatmentEnabled ? 'urgency' : getBaselineOfferVariant('homeSprintOffer'),
    homeSprintReward: treatmentEnabled ? 'extended' : getBaselineOfferVariant('homeSprintReward'),
    segmentPolicy,
    comebackWindow: deriveComebackEligibility({ treatmentEnabled, inactiveDays }),
  };
}

const treatmentSeed = 'local-ios-treatment-0:revenue-intelligence';
const holdoutSeed = 'local-ios-holdout-5:revenue-intelligence';
const treatmentCohort = deriveCohort(treatmentSeed);
const holdoutCohort = deriveCohort(holdoutSeed);
const treatmentBehavior = buildRuntimeBehavior({ cohort: treatmentCohort.cohort, activeSegment: 'high-intent', inactiveDays: 2 });
const holdoutBehavior = buildRuntimeBehavior({ cohort: holdoutCohort.cohort, activeSegment: 'high-intent', inactiveDays: 2 });

console.log(JSON.stringify({
  date: new Date().toISOString().slice(0, 10),
  treatmentCohort: treatmentCohort.cohort,
  holdoutCohort: holdoutCohort.cohort,
  treatmentRewardVariant: treatmentBehavior.homeSprintReward,
  holdoutRewardVariant: holdoutBehavior.homeSprintReward,
  treatmentRewardedDailyMult: Number(treatmentBehavior.segmentPolicy.rewardedDailyLimitMultiplier || 0),
  holdoutRewardedDailyMult: Number(holdoutBehavior.segmentPolicy.rewardedDailyLimitMultiplier || 0),
  treatmentComebackWindow: treatmentBehavior.comebackWindow || 'none',
  holdoutComebackWindow: holdoutBehavior.comebackWindow || 'none',
  pass: treatmentBehavior.homeSprintReward === 'extended'
    && holdoutBehavior.homeSprintReward === 'standard'
    && treatmentBehavior.segmentPolicy.rewardedDailyLimitMultiplier === 1.25
    && holdoutBehavior.segmentPolicy.rewardedDailyLimitMultiplier === 1
    && treatmentBehavior.comebackWindow === 'd2'
    && holdoutBehavior.comebackWindow === null,
}, null, 2));
