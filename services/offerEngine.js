/**
 * offerEngine.js - Offer variant / revenue-experiment engine.
 *
 * Pure logic extracted from App.js: intent segmentation, offer variant
 * assignment, experiment cohorts, focus telemetry, and automatic offer-winner
 * derivation. No React, no side effects - safe to unit test in plain Node.
 */
import { createDefaultAdRuntime } from '../context/AppDataContext';
import { clampNumber } from '../utils/helpers';

const OFFER_VARIANT_OPTIONS = {
  homeSprintOffer: ['control', 'urgency', 'value', 'outcome'],
  homeSprintReward: ['standard', 'extended'],
  reviewBonusOffer: ['control', 'challenge'],
  reviewWeakOffer: ['control', 'coach'],
};
const OFFER_WINNER_PRIORITY = ['homeSprintReward', 'homeSprintOffer', 'reviewBonusOffer', 'reviewWeakOffer'];
const OFFER_WINNER_DEPENDENCIES = Object.freeze({
  homeSprintOffer: 'homeSprintReward',
});
const OFFER_WINNER_MIN_ATTEMPTS = 12;
const OFFER_WINNER_MIN_LIFT_PCT_POINTS = 5;
const OFFER_WINNER_DECAY_PER_DAY = 0.12;
const OFFER_WINNER_EXPIRY_THRESHOLD = 0.45;
const REVENUE_INTELLIGENCE_HOLDOUT_PCT = 20;
const AD_ROLLING_WINDOW_MS = 10 * 60 * 1000;
const INTENT_SEGMENTS = Object.freeze(['high-intent', 'warming', 'low-intent', 'unknown']);
function normalizeIntentSegment(segment = '') {
  const value = String(segment || '').trim().toLowerCase();
  if (value === 'high-intent' || value === 'warming' || value === 'low-intent') return value;
  return 'unknown';
}

function createEmptyIntentTransitionSummary() {
  const bySegment = INTENT_SEGMENTS.reduce((acc, segment) => {
    acc[segment] = 0;
    return acc;
  }, {});
  return {
    totals: {
      changed: 0,
      unchanged: 0,
      entries: 0,
    },
    bySegment,
    transitions: {},
  };
}

function summarizeIntentTransitions(leaderboard = []) {
  const summary = createEmptyIntentTransitionSummary();
  (Array.isArray(leaderboard) ? leaderboard : []).forEach((row) => {
    const currentSegment = normalizeIntentSegment(row?.intentSegment);
    const previousSegment = normalizeIntentSegment(row?.previousIntentSegment || currentSegment);
    const key = `${previousSegment}->${currentSegment}`;
    summary.totals.entries += 1;
    summary.bySegment[currentSegment] += 1;
    if (previousSegment === currentSegment) summary.totals.unchanged += 1;
    else summary.totals.changed += 1;
    summary.transitions[key] = Number(summary.transitions[key] || 0) + 1;
  });
  return summary;
}

function getOfferFrequencyPolicyForSegment(segment = '') {
  const normalized = normalizeIntentSegment(segment);
  if (normalized === 'high-intent') {
    return {
      segment: normalized,
      interstitialDailyLimitMultiplier: 1.25,
      interstitialCooldownMultiplier: 0.75,
      resumeLimitMultiplier: 1,
      quizCompleteLimitMultiplier: 1.25,
      rewardedDailyLimitMultiplier: 1.25,
      rewardedCooldownMultiplier: 0.75,
    };
  }

  if (normalized === 'low-intent') {
    return {
      segment: normalized,
      interstitialDailyLimitMultiplier: 0.75,
      interstitialCooldownMultiplier: 1.5,
      resumeLimitMultiplier: 0.67,
      quizCompleteLimitMultiplier: 0.75,
      rewardedDailyLimitMultiplier: 0.75,
      rewardedCooldownMultiplier: 1.5,
    };
  }

  return {
    segment: normalized,
    interstitialDailyLimitMultiplier: 1,
    interstitialCooldownMultiplier: 1,
    resumeLimitMultiplier: 1,
    quizCompleteLimitMultiplier: 1,
    rewardedDailyLimitMultiplier: 1,
    rewardedCooldownMultiplier: 1,
  };
}

function buildPinnedOfferVariants(existing = {}) {
  return Object.keys(OFFER_VARIANT_OPTIONS).reduce((acc, key) => ({
    ...acc,
    [key]: OFFER_VARIANT_OPTIONS[key].includes(existing[key]) ? existing[key] : null,
  }), {});
}

function buildOfferVariants(existing = {}) {
  return Object.keys(OFFER_VARIANT_OPTIONS).reduce((acc, key) => ({
    ...acc,
    [key]: OFFER_VARIANT_OPTIONS[key].includes(existing[key]) ? existing[key] : OFFER_VARIANT_OPTIONS[key][0],
  }), {});
}

function getBalancedOfferVariant(variantKey, runtime) {
  const options = OFFER_VARIANT_OPTIONS[variantKey] || ['control'];
  const stats = runtime?.offerVariantStats?.[variantKey] || {};
  const hasTraffic = options.some((variantName) => {
    const variant = stats[variantName] || { attempts: 0, completions: 0 };
    return (variant.attempts || 0) > 0 || (variant.completions || 0) > 0;
  });

  if (!hasTraffic) {
    return runtime?.offerVariants?.[variantKey] || options[0] || 'control';
  }

  return options.reduce((bestVariantName, variantName) => {
    if (!bestVariantName) return variantName;

    const bestVariant = stats[bestVariantName] || { attempts: 0, completions: 0 };
    const currentVariant = stats[variantName] || { attempts: 0, completions: 0 };
    const bestAttempts = bestVariant.attempts || 0;
    const currentAttempts = currentVariant.attempts || 0;

    if (currentAttempts !== bestAttempts) {
      return currentAttempts < bestAttempts ? variantName : bestVariantName;
    }

    const bestCompletions = bestVariant.completions || 0;
    const currentCompletions = currentVariant.completions || 0;
    if (currentCompletions !== bestCompletions) {
      return currentCompletions < bestCompletions ? variantName : bestVariantName;
    }

    return variantName < bestVariantName ? variantName : bestVariantName;
  }, null) || options[0] || 'control';
}

function normalizeOfferVariantWinners(raw = {}) {
  const defaults = createDefaultAdRuntime().autoOfferWinners || {};
  return Object.keys(OFFER_VARIANT_OPTIONS).reduce((acc, variantKey) => {
    const winner = raw?.[variantKey];
    acc[variantKey] = winner && typeof winner === 'object'
      ? {
          variantKey,
          variantName: String(winner.variantName || '').trim() || null,
          baselineVariantName: String(winner.baselineVariantName || '').trim() || null,
          confidenceStart: Number(winner.confidenceStart || 0),
          confidenceCurrent: Number(winner.confidenceCurrent || 0),
          cvrDeltaPctPoints: Number(winner.cvrDeltaPctPoints || 0),
          relativeLiftPct: Number(winner.relativeLiftPct || 0),
          attempts: Number(winner.attempts || 0),
          baselineAttempts: Number(winner.baselineAttempts || 0),
          assignedAt: winner.assignedAt || null,
          lastEvaluatedAt: winner.lastEvaluatedAt || null,
          expiresAt: winner.expiresAt || null,
          expiredAt: winner.expiredAt || null,
          active: Boolean(winner.active),
          reason: String(winner.reason || '').trim() || 'insufficient_signal',
        }
      : defaults[variantKey] || null;
    return acc;
  }, {});
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

function normalizeExperimentCohorts(raw = {}) {
  const defaults = createDefaultAdRuntime().experimentCohorts || {};
  const revenueIntelligence = raw?.revenueIntelligence && typeof raw.revenueIntelligence === 'object'
    ? raw.revenueIntelligence
    : {};
  const cohort = String(revenueIntelligence.cohort || '').trim().toLowerCase();
  const overrideCohort = String(revenueIntelligence.overrideCohort || '').trim().toLowerCase();
  return {
    revenueIntelligence: {
      ...defaults.revenueIntelligence,
      ...revenueIntelligence,
      cohort: cohort === 'holdout' || cohort === 'treatment' ? cohort : null,
      overrideCohort: overrideCohort === 'holdout' || overrideCohort === 'treatment' ? overrideCohort : null,
      seed: String(revenueIntelligence.seed || '').trim(),
      bucket: Number.isFinite(Number(revenueIntelligence.bucket)) ? Number(revenueIntelligence.bucket) : null,
      holdoutPct: Number.isFinite(Number(revenueIntelligence.holdoutPct))
        ? Number(revenueIntelligence.holdoutPct)
        : defaults.revenueIntelligence.holdoutPct,
    },
  };
}

function deriveExperimentCohorts(runtime = {}, seed = '', nowMs = Date.now()) {
  const current = normalizeExperimentCohorts(runtime?.experimentCohorts || {});
  const safeSeed = String(current?.revenueIntelligence?.seed || seed || '').trim();
  const holdoutPct = clampNumber(Number(current?.revenueIntelligence?.holdoutPct || REVENUE_INTELLIGENCE_HOLDOUT_PCT), 1, 50);
  const bucket = safeSeed ? hashStringToBucket(safeSeed) : null;
  const derivedCohort = bucket === null ? null : (bucket < holdoutPct ? 'holdout' : 'treatment');
  const overrideCohort = String(current?.revenueIntelligence?.overrideCohort || '').trim().toLowerCase();
  const cohort = overrideCohort === 'holdout' || overrideCohort === 'treatment'
    ? overrideCohort
    : derivedCohort;
  const previousCohort = String(current?.revenueIntelligence?.cohort || '').trim().toLowerCase();
  const assignedAt = cohort
    ? (current?.revenueIntelligence?.assignedAt && previousCohort === cohort
      ? current.revenueIntelligence.assignedAt
      : new Date(nowMs).toISOString())
    : null;

  return {
    revenueIntelligence: {
      ...current.revenueIntelligence,
      cohort,
      overrideCohort: overrideCohort === 'holdout' || overrideCohort === 'treatment' ? overrideCohort : null,
      assignedAt,
      seed: safeSeed,
      bucket,
      holdoutPct,
    },
  };
}

function normalizeFocusTelemetry(raw = {}, nowMs = Date.now()) {
  const defaults = createDefaultAdRuntime().focusTelemetry || {};
  const suppressionUntil = Math.max(0, Number(raw?.adSuppressionUntil || 0));
  const shieldUntil = Math.max(0, Number(raw?.focusShieldUntil || 0));
  const activeUntil = Math.max(suppressionUntil, shieldUntil);
  const interstitialShownAt = Array.isArray(raw?.interstitialShownAt)
    ? raw.interstitialShownAt
      .map((value) => Number(value || 0))
      .filter((value) => Number.isFinite(value) && value > 0 && (nowMs - value) <= AD_ROLLING_WINDOW_MS)
    : [];

  return {
    ...defaults,
    ...raw,
    focusVelocity: Math.max(0, Number(raw?.focusVelocity || 0)),
    accuracyStreak: Math.max(0, Number(raw?.accuracyStreak || 0)),
    interactionLatencyMs: Math.max(0, Number(raw?.interactionLatencyMs || 0)),
    sessionFatigueScore: Math.max(0, Number(raw?.sessionFatigueScore || 0)),
    adSuppressionUntil: suppressionUntil,
    focusShieldUntil: shieldUntil,
    adSuppressionActive: activeUntil > nowMs,
    focusShieldEligible: Boolean(raw?.focusShieldEligible),
    focusShieldPromptShownForWindow: Boolean(raw?.focusShieldPromptShownForWindow),
    recoveryRewardedPrompt: Boolean(raw?.recoveryRewardedPrompt),
    focusStateSeen: Boolean(raw?.focusStateSeen),
    focusEnteredAt: Math.max(0, Number(raw?.focusEnteredAt || 0)),
    focusExitedAt: Math.max(0, Number(raw?.focusExitedAt || 0)),
    cinematicLandingAt: Math.max(0, Number(raw?.cinematicLandingAt || 0)),
    interstitialShownAt,
  };
}

function getOfferVariantGroupSnapshot(variantKey, runtime = {}) {
  const variants = runtime?.offerVariantStats?.[variantKey] || {};
  const names = Object.keys(variants);
  const rankedVariants = names
    .map((variantName) => {
      const variant = variants[variantName] || { attempts: 0, completions: 0 };
      const attempts = Number(variant.attempts || 0);
      const completions = Number(variant.completions || 0);
      const conversionRateRaw = attempts > 0 ? (completions / attempts) : 0;
      return {
        variantName,
        attempts,
        completions,
        conversionRateRaw,
      };
    })
    .sort((a, b) => {
      if (b.conversionRateRaw !== a.conversionRateRaw) return b.conversionRateRaw - a.conversionRateRaw;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      return String(a.variantName || '').localeCompare(String(b.variantName || ''));
    });

  const leader = rankedVariants[0] || null;
  const baselineVariant = rankedVariants.find((variant) => variant.variantName === 'control') || rankedVariants[1] || null;
  const cvrDeltaRaw = leader && baselineVariant
    ? leader.conversionRateRaw - baselineVariant.conversionRateRaw
    : 0;
  const cvrDeltaPctPoints = cvrDeltaRaw * 100;
  const relativeLiftPct = baselineVariant && baselineVariant.conversionRateRaw > 0
    ? Math.round((cvrDeltaRaw / baselineVariant.conversionRateRaw) * 100)
    : 0;
  const qualifies = Boolean(
    leader
    && baselineVariant
    && cvrDeltaPctPoints >= OFFER_WINNER_MIN_LIFT_PCT_POINTS
    && cvrDeltaRaw > 0
    && Number(leader.attempts || 0) >= OFFER_WINNER_MIN_ATTEMPTS
    && Number(baselineVariant.attempts || 0) >= OFFER_WINNER_MIN_ATTEMPTS
  );

  return {
    leader,
    baselineVariant,
    cvrDeltaPctPoints: Number(cvrDeltaPctPoints.toFixed(2)),
    relativeLiftPct,
    qualifies,
  };
}

function getOfferWinnerConfidenceStart(snapshot = {}) {
  const leaderAttempts = Number(snapshot?.leader?.attempts || 0);
  const baselineAttempts = Number(snapshot?.baselineVariant?.attempts || 0);
  const sharedSample = Math.min(leaderAttempts, baselineAttempts);
  const sampleScore = clampNumber((sharedSample - OFFER_WINNER_MIN_ATTEMPTS) / 24, 0, 1);
  const liftScore = clampNumber((Number(snapshot?.cvrDeltaPctPoints || 0) - OFFER_WINNER_MIN_LIFT_PCT_POINTS) / 12, 0, 1);
  return Number(clampNumber(0.55 + (sampleScore * 0.25) + (liftScore * 0.2), 0.55, 0.98).toFixed(3));
}

function getOfferWinnerDecayDays(assignedAt, nowMs = Date.now()) {
  const assignedMs = Date.parse(assignedAt || '');
  if (!Number.isFinite(assignedMs)) return 0;
  return Math.max(0, Math.floor((nowMs - assignedMs) / (24 * 60 * 60 * 1000)));
}

function getDecayedOfferWinnerConfidence(confidenceStart = 0, assignedAt, nowMs = Date.now()) {
  const decayDays = getOfferWinnerDecayDays(assignedAt, nowMs);
  const confidenceCurrent = Number(
    clampNumber(Number(confidenceStart || 0) * Math.pow(1 - OFFER_WINNER_DECAY_PER_DAY, decayDays), 0, 1).toFixed(3),
  );
  return {
    decayDays,
    confidenceCurrent,
  };
}

function getOfferWinnerExpiryAt(confidenceStart = 0, assignedAt) {
  const assignedMs = Date.parse(assignedAt || '');
  if (!Number.isFinite(assignedMs) || !Number.isFinite(confidenceStart) || confidenceStart <= 0) return null;
  if (confidenceStart < OFFER_WINNER_EXPIRY_THRESHOLD) return new Date(assignedMs).toISOString();
  const daysUntilExpiry = Math.max(
    0,
    Math.ceil(Math.log(OFFER_WINNER_EXPIRY_THRESHOLD / confidenceStart) / Math.log(1 - OFFER_WINNER_DECAY_PER_DAY)),
  );
  return new Date(assignedMs + (daysUntilExpiry * 24 * 60 * 60 * 1000)).toISOString();
}

function deriveAutoOfferWinners(runtime = {}, nowMs = Date.now()) {
  const previousWinners = normalizeOfferVariantWinners(runtime?.autoOfferWinners || {});
  const pinnedVariants = buildPinnedOfferVariants(runtime?.pinnedOfferVariants || {});
  const nowIso = new Date(nowMs).toISOString();

  const nextWinners = OFFER_WINNER_PRIORITY.reduce((acc, variantKey) => {
    const previousWinner = previousWinners[variantKey];
    const dependencyKey = OFFER_WINNER_DEPENDENCIES[variantKey];
    const dependencySatisfied = !dependencyKey || Boolean(pinnedVariants?.[dependencyKey] || acc?.[dependencyKey]?.active);
    const snapshot = getOfferVariantGroupSnapshot(variantKey, runtime);
    const sameWinnerStillLeading = Boolean(
      previousWinner?.variantName
      && snapshot?.leader?.variantName
      && previousWinner.variantName === snapshot.leader.variantName,
    );

    if (snapshot.qualifies && dependencySatisfied) {
      const nextConfidenceStart = getOfferWinnerConfidenceStart(snapshot);
      const assignedAt = sameWinnerStillLeading && previousWinner?.assignedAt
        ? previousWinner.assignedAt
        : nowIso;
      const confidenceStart = sameWinnerStillLeading
        ? Math.max(Number(previousWinner?.confidenceStart || 0), nextConfidenceStart)
        : nextConfidenceStart;
      const decay = getDecayedOfferWinnerConfidence(confidenceStart, assignedAt, nowMs);
      const active = decay.confidenceCurrent >= OFFER_WINNER_EXPIRY_THRESHOLD;

      acc[variantKey] = {
        variantKey,
        variantName: snapshot.leader?.variantName || null,
        baselineVariantName: snapshot.baselineVariant?.variantName || null,
        confidenceStart,
        confidenceCurrent: decay.confidenceCurrent,
        cvrDeltaPctPoints: Number(snapshot.cvrDeltaPctPoints || 0),
        relativeLiftPct: Number(snapshot.relativeLiftPct || 0),
        attempts: Number(snapshot.leader?.attempts || 0),
        baselineAttempts: Number(snapshot.baselineVariant?.attempts || 0),
        assignedAt,
        lastEvaluatedAt: nowIso,
        expiresAt: getOfferWinnerExpiryAt(confidenceStart, assignedAt),
        expiredAt: active ? null : nowIso,
        active,
        reason: active ? (pinnedVariants?.[variantKey] ? 'admin_pinned_override' : 'eligible') : 'confidence_decay',
      };
      return acc;
    }

    acc[variantKey] = previousWinner && typeof previousWinner === 'object'
      ? {
          ...previousWinner,
          active: false,
          lastEvaluatedAt: nowIso,
          expiredAt: previousWinner?.expiredAt || nowIso,
          reason: dependencySatisfied ? 'insufficient_signal' : 'blocked_by_reward_priority',
        }
      : snapshot?.leader
        ? {
            variantKey,
            variantName: snapshot.leader?.variantName || null,
            baselineVariantName: snapshot.baselineVariant?.variantName || null,
            confidenceStart: snapshot.qualifies ? getOfferWinnerConfidenceStart(snapshot) : 0,
            confidenceCurrent: 0,
            cvrDeltaPctPoints: Number(snapshot.cvrDeltaPctPoints || 0),
            relativeLiftPct: Number(snapshot.relativeLiftPct || 0),
            attempts: Number(snapshot.leader?.attempts || 0),
            baselineAttempts: Number(snapshot.baselineVariant?.attempts || 0),
            assignedAt: null,
            lastEvaluatedAt: nowIso,
            expiresAt: null,
            expiredAt: null,
            active: false,
            reason: dependencySatisfied ? 'insufficient_signal' : 'blocked_by_reward_priority',
          }
        : null;
    return acc;
  }, {});

  return normalizeOfferVariantWinners(nextWinners);
}

export {
  OFFER_VARIANT_OPTIONS,
  OFFER_WINNER_PRIORITY,
  OFFER_WINNER_DEPENDENCIES,
  OFFER_WINNER_MIN_ATTEMPTS,
  OFFER_WINNER_MIN_LIFT_PCT_POINTS,
  OFFER_WINNER_DECAY_PER_DAY,
  OFFER_WINNER_EXPIRY_THRESHOLD,
  REVENUE_INTELLIGENCE_HOLDOUT_PCT,
  AD_ROLLING_WINDOW_MS,
  INTENT_SEGMENTS,
  normalizeIntentSegment,
  createEmptyIntentTransitionSummary,
  summarizeIntentTransitions,
  getOfferFrequencyPolicyForSegment,
  buildPinnedOfferVariants,
  buildOfferVariants,
  getBalancedOfferVariant,
  normalizeOfferVariantWinners,
  normalizeExperimentCohorts,
  deriveExperimentCohorts,
  normalizeFocusTelemetry,
  deriveAutoOfferWinners,
};
