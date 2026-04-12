const OFFER_VARIANT_OPTIONS = {
  homeSprintOffer: ['control', 'urgency'],
  homeSprintReward: ['standard', 'extended'],
  reviewBonusOffer: ['control', 'challenge'],
  reviewWeakOffer: ['control', 'coach'],
};
const OFFER_WINNER_PRIORITY = ['homeSprintReward', 'homeSprintOffer', 'reviewBonusOffer', 'reviewWeakOffer'];
const OFFER_WINNER_DEPENDENCIES = Object.freeze({ homeSprintOffer: 'homeSprintReward' });
const OFFER_WINNER_MIN_ATTEMPTS = 12;
const OFFER_WINNER_MIN_LIFT_PCT_POINTS = 5;
const OFFER_WINNER_DECAY_PER_DAY = 0.12;
const OFFER_WINNER_EXPIRY_THRESHOLD = 0.45;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createDefaultAutoOfferWinners() {
  return {
    homeSprintOffer: null,
    homeSprintReward: null,
    reviewBonusOffer: null,
    reviewWeakOffer: null,
  };
}

function normalizeOfferVariantWinners(raw = {}) {
  const defaults = createDefaultAutoOfferWinners();
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

function buildPinnedOfferVariants(existing = {}) {
  return Object.keys(OFFER_VARIANT_OPTIONS).reduce((acc, key) => ({
    ...acc,
    [key]: OFFER_VARIANT_OPTIONS[key].includes(existing[key]) ? existing[key] : null,
  }), {});
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
      return { variantName, attempts, completions, conversionRateRaw };
    })
    .sort((a, b) => {
      if (b.conversionRateRaw !== a.conversionRateRaw) return b.conversionRateRaw - a.conversionRateRaw;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      return String(a.variantName || '').localeCompare(String(b.variantName || ''));
    });

  const leader = rankedVariants[0] || null;
  const baselineVariant = rankedVariants.find((variant) => variant.variantName === 'control') || rankedVariants[1] || null;
  const cvrDeltaRaw = leader && baselineVariant ? leader.conversionRateRaw - baselineVariant.conversionRateRaw : 0;
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
  return Number(
    clampNumber(Number(confidenceStart || 0) * Math.pow(1 - OFFER_WINNER_DECAY_PER_DAY, decayDays), 0, 1).toFixed(3),
  );
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
      const assignedAt = sameWinnerStillLeading && previousWinner?.assignedAt ? previousWinner.assignedAt : nowIso;
      const confidenceStart = sameWinnerStillLeading
        ? Math.max(Number(previousWinner?.confidenceStart || 0), nextConfidenceStart)
        : nextConfidenceStart;
      const confidenceCurrent = getDecayedOfferWinnerConfidence(confidenceStart, assignedAt, nowMs);
      const active = confidenceCurrent >= OFFER_WINNER_EXPIRY_THRESHOLD;

      acc[variantKey] = {
        variantKey,
        variantName: snapshot.leader?.variantName || null,
        baselineVariantName: snapshot.baselineVariant?.variantName || null,
        confidenceStart,
        confidenceCurrent,
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

const nowMs = Date.now();
const strongStats = {
  homeSprintReward: {
    standard: { attempts: 20, completions: 8 },
    extended: { attempts: 20, completions: 12 },
  },
  homeSprintOffer: {
    control: { attempts: 20, completions: 8 },
    urgency: { attempts: 20, completions: 11 },
  },
};

const rewardFirstScenario = deriveAutoOfferWinners({
  pinnedOfferVariants: {},
  offerVariantStats: strongStats,
}, nowMs);

const copyBlockedScenario = deriveAutoOfferWinners({
  pinnedOfferVariants: {},
  offerVariantStats: {
    homeSprintReward: {
      standard: { attempts: 8, completions: 3 },
      extended: { attempts: 8, completions: 4 },
    },
    homeSprintOffer: strongStats.homeSprintOffer,
  },
}, nowMs);

const agedAssignedAt = new Date(nowMs - (7 * 24 * 60 * 60 * 1000)).toISOString();
const agedScenario = deriveAutoOfferWinners({
  pinnedOfferVariants: {},
  offerVariantStats: strongStats,
  autoOfferWinners: {
    homeSprintReward: {
      variantKey: 'homeSprintReward',
      variantName: 'extended',
      baselineVariantName: 'standard',
      confidenceStart: 0.738,
      confidenceCurrent: 0.738,
      cvrDeltaPctPoints: 20,
      relativeLiftPct: 50,
      attempts: 20,
      baselineAttempts: 20,
      assignedAt: agedAssignedAt,
      lastEvaluatedAt: agedAssignedAt,
      expiresAt: null,
      expiredAt: null,
      active: true,
      reason: 'eligible',
    },
  },
}, nowMs);

const rewardWinner = rewardFirstScenario.homeSprintReward;
const copyWinner = rewardFirstScenario.homeSprintOffer;
const decayedWinner = agedScenario.homeSprintReward;

console.log(JSON.stringify({
  date: new Date(nowMs).toISOString().slice(0, 10),
  rewardFirstGate: rewardWinner?.active && copyWinner?.active ? 'pass' : 'fail',
  copyBlockedWithoutReward: copyBlockedScenario.homeSprintOffer?.reason === 'blocked_by_reward_priority' ? 'pass' : 'fail',
  winnerId: rewardWinner?.variantName || 'none',
  confidenceStart: Number(decayedWinner?.confidenceStart || 0),
  confidenceEnd: Number(decayedWinner?.confidenceCurrent || 0),
  expired: Boolean(!decayedWinner?.active),
  rewardWinner,
  copyWinner,
  blockedCopyWinner: copyBlockedScenario.homeSprintOffer,
  decayedWinner,
}, null, 2));
