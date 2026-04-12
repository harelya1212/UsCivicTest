import React, { useState, useEffect, useContext, useRef } from 'react';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Dimensions,
  Share,
  Alert,
  Animated,
  TextInput,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
import * as Notifications from 'expo-notifications';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// CSS bundled locally to avoid Metro node_modules export-map warning
import './assets/react-datepicker.min.css';

// Shared styles (includes all screen-level and component-level styles)
import styles from './styles';

// Shared context and state factories
import {
  AppDataContext,
  createDefaultAdRuntime,
  createDefaultMasteryMap,
  createDefaultUserProfile,
  createDefaultSquadSync,
} from './context/AppDataContext';

// Shared utility functions
import {
  getDayKey,
  daysSince,
  parseDateSafe,
  generateStudyPlan,
  calculateEstimatedRevenue,
  buildSevenDayRevenueTrend,
  withAutoStudyPlan,
  buildCaseProgressStorageKey,
  buildCaseReminderStorageKey,
  escapeHtml,
  buildDefaultCaseProgress,
} from './utils/helpers';

// Smart Queue algorithm
import { buildSmartQueue } from './utils/smartQueue';

// Shared constants and data
import {
  PAUSED_SESSION_STORAGE_KEY,
  AD_RUNTIME_STORAGE_KEY,
  MASTERY_MAP_STORAGE_KEY,
  USER_PROFILE_STORAGE_KEY,
  SQUAD_SYNC_STORAGE_KEY,
  DAILY_FREE_PACK_LIMIT,
  FREE_PACK_QUESTION_COUNT,
  FREE_PACK_COOLDOWN_MS,
  AD_EVENT_NAMES,
  APP_EVENT_NAMES,
  CASE_PROGRESS_STAGES,
  WEEKDAY_OPTIONS,
  CASE_STAGE_CHECKLISTS,
  usStates,
  achievements,
} from './constants';

// Firebase & Monetization Imports (credentials needed - see firebaseConfig.js)
// import { watchAuthState, getUserProfile, saveQuizResult, loginUser } from './firebaseServices';
import { showInterstitialAd, showRewardedAd, AdScheduler, HomeBannerAd } from './adMobService';
import {
  generateQuizQuestion,
  getAdaptiveDifficulty,
  calculatePerformance,
  getVisualImage,
  getQuestionBank,
  isAnswerCorrect as checkAnswerCorrect,
} from './quizHelpers';
import { CIVICS_QUESTION_BANK } from './civicsQuestionBank';
import {
  DYNAMIC_CIVICS_DATA,
  STATE_CAPITALS,
  setDynamicFederalAnswers,
  setStateOfficeholders,
  setStateCapital,
} from './civicsDynamicData';
import { logAppAnalyticsEvent } from './analyticsService';
import { playLogoSwell } from './utils/audioHaptics';
import {
  fetchSquadSyncSnapshot,
  pushSquadSyncSnapshot,
  enforceServerModerationPolicy,
  runServerModerationAdminAction,
} from './firebaseServices';
import { HapticProvider } from './context/HapticProvider';
// import { PremiumManager, PREMIUM_TIERS, logMonetizationEvent } from './monetizationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

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

const MODERATION_ROLE_LIMITS = Object.freeze({
  parent: { nudge_send: 20, invite_refresh: 10, goal_update: 30 },
  admin: { nudge_send: 16, invite_refresh: 8, goal_update: 24 },
  child: { nudge_send: 4, invite_refresh: 2, goal_update: 6 },
});
const MODERATION_MUTE_MS = 10 * 60 * 1000;
const MODERATION_MUTE_THRESHOLD = 3;
const MODERATION_ESCALATION_THRESHOLD = 5;
const COMEBACK_WINDOW_OFFSETS = Object.freeze({ d2: 2, d5: 5, d10: 10 });
const COMEBACK_REWARD_QUESTIONS = Object.freeze({ d2: 8, d5: 12, d10: 18 });
const FOCUS_SUPPRESSION_WINDOW_MS = 5 * 60 * 1000;
const FOCUS_SHIELD_WINDOW_MS = 20 * 60 * 1000;
const FOCUS_POST_VICTORY_WINDOW_MS = 10 * 60 * 1000;
const CINEMATIC_SAFETY_BUFFER_MS = 30 * 1000;
const AD_ROLLING_WINDOW_MS = 10 * 60 * 1000;
const MAX_ADS_PER_10_MIN = 3;

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

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


// ─── Screens ──────────────────────────────────────────────────────────────────
import OnboardingScreen from './screens/OnboardingScreen';
import EditTestDetailsScreen from './screens/EditTestDetailsScreen';
import HomeScreen from './screens/HomeScreen';
import ModeSelectorScreen from './screens/ModeSelectorScreen';
import QuizScreen from './screens/QuizScreen';
import ReviewScreen from './screens/ReviewScreen';
import InterviewScreen from './screens/InterviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import CaseProgressScreen from './screens/CaseProgressScreen';
import MasteryMapScreen from './screens/MasteryMapScreen';
import FamilyScreen from './screens/FamilyScreen';
import AdminScreen from './screens/AdminScreen';

function TabNavigator({ testDetails, onEditTestDetails }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#475569',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        initialParams={{ testDetails }}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProfileScreen}
        initialParams={{ testDetails, onEditTestDetails }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FamilyTab"
        component={FamilyScreen}
        options={{
          tabBarLabel: 'Squad',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="trophy-variant" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminTab"
        component={AdminScreen}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shield-account" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 🚀 MAIN APP
export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [testDetails, setTestDetails] = useState(null);
  const [errorBank, setErrorBank] = useState([]);
  const [pausedSession, setPausedSession] = useState(null);
  const [adRuntime, setAdRuntime] = useState(createDefaultAdRuntime());
  const [masteryMap, setMasteryMap] = useState(createDefaultMasteryMap());
  const [userProfile, setUserProfile] = useState(createDefaultUserProfile());
  const [squadSync, setSquadSync] = useState(createDefaultSquadSync());
  const lastGhostBroadcastRef = useRef({ at: 0, intensity: -1, isFlowState: false });
  const navigationRef = useRef(null);
  const routeNameRef = useRef(null);
  const localDeviceIdRef = useRef(`local-${Platform.OS}-${Math.random().toString(36).slice(2, 8)}`);
  const lastPushedRevisionRef = useRef(0);
  const lastSegmentTransitionSignatureRef = useRef('');
  const lastOfferWinnersSignatureRef = useRef('');
  const lastExperimentCohortsSignatureRef = useRef('');

  const getSelfIntentSegment = () => {
    const leaderboard = Array.isArray(squadSync?.season?.leaderboard) ? squadSync.season.leaderboard : [];
    const selfEntry = leaderboard.find((row) => String(row?.id || '').trim() === 'self');
    return normalizeIntentSegment(selfEntry?.intentSegment || 'warming');
  };

  const getRevenueIntelligenceExperiment = (runtime = adRuntime) => {
    const cohorts = normalizeExperimentCohorts(runtime?.experimentCohorts || {});
    return cohorts?.revenueIntelligence || createDefaultAdRuntime().experimentCohorts.revenueIntelligence;
  };

  const getRevenueIntelligenceCohort = (runtime = adRuntime) => String(getRevenueIntelligenceExperiment(runtime)?.cohort || 'treatment');
  const isRevenueIntelligenceTreatment = (runtime = adRuntime) => getRevenueIntelligenceCohort(runtime) !== 'holdout';
  const getBaselineOfferVariant = (variantKey) => OFFER_VARIANT_OPTIONS[variantKey]?.[0] || 'control';

  const logOfferCapDecision = ({
    channel,
    trigger = 'n/a',
    decision,
    reason,
    segment,
    policy,
    cooldownMs = 0,
    dailyLimit = 0,
    triggerLimit = 0,
  }) => {
    trackAppEvent(APP_EVENT_NAMES.OFFER_CAP_DECISION, {
      channel: String(channel || 'unknown'),
      trigger: String(trigger || 'n/a'),
      decision: String(decision || 'unknown'),
      reason: String(reason || 'unknown'),
      segment: String(segment || 'unknown'),
      experiment_cohort: getRevenueIntelligenceCohort(),
      cooldown_ms: Number(cooldownMs || 0),
      daily_limit: Number(dailyLimit || 0),
      trigger_limit: Number(triggerLimit || 0),
      policy_interstitial_daily_mult: Number(policy?.interstitialDailyLimitMultiplier || 0),
      policy_interstitial_cooldown_mult: Number(policy?.interstitialCooldownMultiplier || 0),
      policy_rewarded_daily_mult: Number(policy?.rewardedDailyLimitMultiplier || 0),
      policy_rewarded_cooldown_mult: Number(policy?.rewardedCooldownMultiplier || 0),
    });
  };

  const applySquadMutation = (mutator, touchedFields = []) => {
    setSquadSync((previous) => {
      const prev = normalizeSquadSync(previous);
      const proposed = typeof mutator === 'function' ? mutator(prev) : prev;
      let next = normalizeSquadSync(proposed || prev);
      const nowIso = new Date().toISOString();
      const nowMs = Date.now();
      const nextFieldClock = { ...(prev.syncMeta?.fieldClock || {}) };

      const seasonResult = deriveSeasonState(next, nowMs);
      if (seasonResult.changed) {
        next = {
          ...next,
          season: seasonResult.season,
        };
        nextFieldClock.season = nowMs;
      }

      touchedFields.forEach((fieldName) => {
        if (!fieldName) return;
        nextFieldClock[fieldName] = nowMs;
      });

      return {
        ...next,
        updatedAt: nowIso,
        syncMeta: {
          ...next.syncMeta,
          revision: Math.max(Number(prev.syncMeta?.revision || 0) + 1, Number(next.syncMeta?.revision || 0)),
          lastMutationAt: nowIso,
          lastWriterDeviceId: localDeviceIdRef.current,
          fieldClock: nextFieldClock,
        },
      };
    });
  };

  // iOS App Tracking Transparency — must fire before any ad SDK initializes
  useEffect(() => {
    requestTrackingPermissionsAsync().catch(() => {
      // ATT is iOS-only; silently skip on Android
    });
  }, []);

  useEffect(() => {
    const teamId = String(squadSync?.teamId || '').trim();
    if (!teamId) return undefined;

    const maintainSeason = () => {
      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();

      setSquadSync((previous) => {
        const prev = normalizeSquadSync(previous);
        const result = deriveSeasonState(prev, nowMs);
        if (!result.changed) return previous;

        return {
          ...prev,
          season: result.season,
          updatedAt: nowIso,
          syncMeta: {
            ...prev.syncMeta,
            revision: Number(prev.syncMeta?.revision || 0) + 1,
            lastMutationAt: nowIso,
            lastWriterDeviceId: localDeviceIdRef.current,
            fieldClock: {
              ...(prev.syncMeta?.fieldClock || {}),
              season: nowMs,
            },
          },
        };
      });
    };

    maintainSeason();
    const intervalId = setInterval(maintainSeason, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [squadSync?.teamId, squadSync?.members, squadSync?.season?.seasonId, squadSync?.season?.endsAt]);

  const trackAppEvent = (eventName, params = {}) => {
    if (!eventName) return;

    const safeParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
      const valueType = typeof value;
      if (value == null) return acc;
      if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log('[Analytics]', eventName, safeParams);
    void logAppAnalyticsEvent(eventName, safeParams);
  };

  useEffect(() => {
    const season = squadSync?.season || {};
    const summary = season?.intentTransitionSummary && typeof season.intentTransitionSummary === 'object'
      ? season.intentTransitionSummary
      : null;
    const transitions = summary?.transitions && typeof summary.transitions === 'object'
      ? summary.transitions
      : {};
    const entries = Number(summary?.totals?.entries || 0);
    const changed = Number(summary?.totals?.changed || 0);
    const unchanged = Number(summary?.totals?.unchanged || 0);
    const seasonId = String(season?.seasonId || '').trim();
    if (!seasonId || entries <= 0) return;

    const signature = `${seasonId}|${entries}|${changed}|${unchanged}|${JSON.stringify(transitions)}`;
    if (signature === lastSegmentTransitionSignatureRef.current) return;
    lastSegmentTransitionSignatureRef.current = signature;

    const topTransition = Object.entries(transitions)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0];

    trackAppEvent(APP_EVENT_NAMES.SEGMENT_TRANSITION, {
      season_id: seasonId,
      week_key: String(season?.weekKey || ''),
      entries,
      changed_count: changed,
      unchanged_count: unchanged,
      transition_types: Object.keys(transitions).length,
      top_transition: String(topTransition?.[0] || 'none'),
      top_transition_count: Number(topTransition?.[1] || 0),
    });
  }, [squadSync?.season?.seasonId, squadSync?.season?.weekKey, squadSync?.season?.intentTransitionSummary]);

  useEffect(() => {
    trackAppEvent(APP_EVENT_NAMES.APP_OPEN, {
      platform: Platform.OS,
    });
    playLogoSwell();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPausedSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(PAUSED_SESSION_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.pool) && parsed.currentQuestion) {
          setPausedSession(parsed);
        }
      } catch (error) {
        console.log('Failed to load paused session:', error);
      }
    };

    loadPausedSession();

    const loadAdRuntime = async () => {
      try {
        const stored = await AsyncStorage.getItem(AD_RUNTIME_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setAdRuntime((prev) => ({
            ...prev,
            ...parsed,
            comebackCampaign: normalizeComebackCampaign(parsed.comebackCampaign),
            history: Array.isArray(parsed.history) ? parsed.history : prev.history,
            offerVariants: buildOfferVariants(parsed.offerVariants),
            pinnedOfferVariants: buildPinnedOfferVariants(parsed.pinnedOfferVariants),
            autoOfferWinners: normalizeOfferVariantWinners(parsed.autoOfferWinners),
            experimentCohorts: normalizeExperimentCohorts(parsed.experimentCohorts),
            offerVariantStats: parsed.offerVariantStats && typeof parsed.offerVariantStats === 'object'
              ? parsed.offerVariantStats
              : prev.offerVariantStats,
            analytics: {
              ...prev.analytics,
              ...(parsed.analytics || {}),
            },
            focusTelemetry: normalizeFocusTelemetry(parsed.focusTelemetry, Date.now()),
          }));
        }
      } catch (error) {
        console.log('Failed to load ad runtime:', error);
      }
    };

    loadAdRuntime();

    const loadMasteryMap = async () => {
      try {
        const stored = await AsyncStorage.getItem(MASTERY_MAP_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setMasteryMap({
            ...createDefaultMasteryMap(),
            ...parsed,
            byQuestion: parsed.byQuestion && typeof parsed.byQuestion === 'object' ? parsed.byQuestion : {},
            topicDaily: parsed.topicDaily && typeof parsed.topicDaily === 'object' ? parsed.topicDaily : {},
          });
        }
      } catch (error) {
        console.log('Failed to load mastery map:', error);
      }
    };

    const loadUserProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setUserProfile({
            ...createDefaultUserProfile(),
            ...parsed,
          });
        }
      } catch (error) {
        console.log('Failed to load user profile:', error);
      }
    };

    const loadSquadSync = async () => {
      try {
        const stored = await AsyncStorage.getItem(SQUAD_SYNC_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setSquadSync((prev) => reconcileSquadSync(prev, parsed));
        }
      } catch (error) {
        console.log('Failed to load squad sync:', error);
      }
    };

    loadMasteryMap();
    loadUserProfile();
    loadSquadSync();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setAdRuntime((prev) => {
      const nextVariants = buildOfferVariants(prev.offerVariants);
      const nextPinnedVariants = buildPinnedOfferVariants(prev.pinnedOfferVariants);
      if (
        JSON.stringify(prev.offerVariants || {}) === JSON.stringify(nextVariants)
        && JSON.stringify(prev.pinnedOfferVariants || {}) === JSON.stringify(nextPinnedVariants)
      ) {
        return prev;
      }

      return {
        ...prev,
        offerVariants: nextVariants,
        pinnedOfferVariants: nextPinnedVariants,
      };
    });
  }, []);

  useEffect(() => {
    const persistPausedSession = async () => {
      try {
        if (pausedSession) {
          await AsyncStorage.setItem(PAUSED_SESSION_STORAGE_KEY, JSON.stringify(pausedSession));
        } else {
          await AsyncStorage.removeItem(PAUSED_SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.log('Failed to persist paused session:', error);
      }
    };

    persistPausedSession();
  }, [pausedSession]);

  useEffect(() => {
    const maintainComebackState = () => {
      const nowMs = Date.now();
      setAdRuntime((previous) => {
        const treatmentEnabled = isRevenueIntelligenceTreatment(previous);
        const derived = treatmentEnabled
          ? deriveComebackCampaign(previous, nowMs)
          : {
              campaign: {
                ...normalizeComebackCampaign(previous?.comebackCampaign || {}),
                lastActiveDayKey: getDayKey(new Date(nowMs)),
                eligibleWindow: null,
                windows: Object.entries(normalizeComebackCampaign(previous?.comebackCampaign || {}).windows || {}).reduce((acc, [windowKey, windowValue]) => {
                  acc[windowKey] = {
                    ...windowValue,
                    eligible: false,
                  };
                  return acc;
                }, {}),
              },
              triggeredWindow: null,
              inactiveDays: 0,
              currentDayKey: getDayKey(new Date(nowMs)),
            };
        const analytics = {
          ...createDefaultAdRuntime().analytics,
          ...(previous.analytics || {}),
        };

        if (derived.triggeredWindow === 'd2') analytics.comebackD2Triggered += 1;
        if (derived.triggeredWindow === 'd5') analytics.comebackD5Triggered += 1;
        if (derived.triggeredWindow === 'd10') analytics.comebackD10Triggered += 1;

        const next = {
          ...previous,
          dayKey: derived.currentDayKey,
          comebackCampaign: derived.campaign,
          analytics,
        };

        if (JSON.stringify(previous.comebackCampaign || {}) === JSON.stringify(next.comebackCampaign)
          && JSON.stringify(previous.analytics || {}) === JSON.stringify(next.analytics)
          && previous.dayKey === next.dayKey) {
          return previous;
        }

        return next;
      });
    };

    maintainComebackState();
    const intervalId = setInterval(maintainComebackState, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const maintainOfferWinners = () => {
      const nowMs = Date.now();
      setAdRuntime((previous) => {
        const nextAutoOfferWinners = isRevenueIntelligenceTreatment(previous)
          ? deriveAutoOfferWinners(previous, nowMs)
          : createDefaultAdRuntime().autoOfferWinners;
        if (JSON.stringify(normalizeOfferVariantWinners(previous.autoOfferWinners || {})) === JSON.stringify(nextAutoOfferWinners)) {
          return previous;
        }

        return {
          ...previous,
          autoOfferWinners: nextAutoOfferWinners,
        };
      });
    };

    maintainOfferWinners();
    const intervalId = setInterval(maintainOfferWinners, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setAdRuntime((previous) => {
      const nextExperimentCohorts = deriveExperimentCohorts(previous, `${localDeviceIdRef.current}:revenue-intelligence`, Date.now());
      if (JSON.stringify(normalizeExperimentCohorts(previous.experimentCohorts || {})) === JSON.stringify(nextExperimentCohorts)) {
        return previous;
      }

      return {
        ...previous,
        experimentCohorts: nextExperimentCohorts,
      };
    });
  }, []);

  useEffect(() => {
    const comebackCampaign = normalizeComebackCampaign(adRuntime?.comebackCampaign || {});
    const eligibleWindow = String(comebackCampaign?.eligibleWindow || '').trim();
    if (!eligibleWindow) return;
    const activeWindow = comebackCampaign.windows?.[eligibleWindow];
    if (!activeWindow?.lastTriggeredAt) return;

    trackAppEvent(APP_EVENT_NAMES.COMEBACK_TRIGGERED, {
      window_key: eligibleWindow,
      day_offset: Number(activeWindow.dayOffset || 0),
      eligible_day_key: String(activeWindow.lastEligibleDayKey || ''),
      shown_count: Number(activeWindow.shownCount || 0),
    });
  }, [adRuntime?.comebackCampaign?.eligibleWindow, adRuntime?.comebackCampaign?.windows?.d2?.lastTriggeredAt, adRuntime?.comebackCampaign?.windows?.d5?.lastTriggeredAt, adRuntime?.comebackCampaign?.windows?.d10?.lastTriggeredAt]);

  useEffect(() => {
    const winners = normalizeOfferVariantWinners(adRuntime?.autoOfferWinners || {});
    const signature = JSON.stringify(winners);
    if (lastOfferWinnersSignatureRef.current === signature) return;

    const previousWinners = lastOfferWinnersSignatureRef.current
      ? normalizeOfferVariantWinners(JSON.parse(lastOfferWinnersSignatureRef.current))
      : createDefaultAdRuntime().autoOfferWinners;

    Object.keys(winners).forEach((variantKey) => {
      const currentWinner = winners[variantKey];
      const previousWinner = previousWinners?.[variantKey];
      const winnerActivated = Boolean(
        currentWinner?.active
        && currentWinner?.variantName
        && (!previousWinner?.active || previousWinner?.variantName !== currentWinner?.variantName),
      );
      const winnerExpired = Boolean(
        previousWinner?.active
        && previousWinner?.variantName
        && (!currentWinner?.active || currentWinner?.variantName !== previousWinner?.variantName),
      );

      if (winnerActivated) {
        trackAppEvent(APP_EVENT_NAMES.OFFER_WINNER_SELECTED, {
          variant_key: variantKey,
          winner_variant: String(currentWinner.variantName || ''),
          confidence_start: Number(currentWinner.confidenceStart || 0),
          confidence_current: Number(currentWinner.confidenceCurrent || 0),
          cvr_delta_pct_points: Number(currentWinner.cvrDeltaPctPoints || 0),
          relative_lift_pct: Number(currentWinner.relativeLiftPct || 0),
          attempts: Number(currentWinner.attempts || 0),
          baseline_attempts: Number(currentWinner.baselineAttempts || 0),
          assigned_at: String(currentWinner.assignedAt || ''),
        });
      }

      if (winnerExpired) {
        trackAppEvent(APP_EVENT_NAMES.OFFER_WINNER_EXPIRED, {
          variant_key: variantKey,
          winner_variant: String(previousWinner.variantName || ''),
          reason: String(currentWinner?.reason || 'confidence_decay'),
          confidence_end: Number(currentWinner?.confidenceCurrent || 0),
          expired_at: String(currentWinner?.expiredAt || new Date().toISOString()),
        });
      }
    });

    lastOfferWinnersSignatureRef.current = signature;
  }, [adRuntime?.autoOfferWinners]);

  useEffect(() => {
    const cohorts = normalizeExperimentCohorts(adRuntime?.experimentCohorts || {});
    const signature = JSON.stringify(cohorts);
    if (lastExperimentCohortsSignatureRef.current === signature) return;

    const revenueIntelligence = cohorts?.revenueIntelligence;
    if (revenueIntelligence?.cohort) {
      trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_COHORT_ASSIGNED, {
        experiment: 'revenue_intelligence',
        cohort: String(revenueIntelligence.cohort || ''),
        bucket: Number(revenueIntelligence.bucket ?? -1),
        holdout_pct: Number(revenueIntelligence.holdoutPct || REVENUE_INTELLIGENCE_HOLDOUT_PCT),
        assigned_at: String(revenueIntelligence.assignedAt || ''),
      });
    }

    lastExperimentCohortsSignatureRef.current = signature;
  }, [adRuntime?.experimentCohorts]);

  useEffect(() => {
    const persistAdRuntime = async () => {
      try {
        await AsyncStorage.setItem(AD_RUNTIME_STORAGE_KEY, JSON.stringify(adRuntime));
      } catch (error) {
        console.log('Failed to persist ad runtime:', error);
      }
    };

    persistAdRuntime();
  }, [adRuntime]);

  useEffect(() => {
    const persistMasteryMap = async () => {
      try {
        await AsyncStorage.setItem(MASTERY_MAP_STORAGE_KEY, JSON.stringify(masteryMap));
      } catch (error) {
        console.log('Failed to persist mastery map:', error);
      }
    };

    persistMasteryMap();
  }, [masteryMap]);

  useEffect(() => {
    const persistUserProfile = async () => {
      try {
        await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
      } catch (error) {
        console.log('Failed to persist user profile:', error);
      }
    };

    persistUserProfile();
  }, [userProfile]);

  useEffect(() => {
    const persistSquadSync = async () => {
      try {
        await AsyncStorage.setItem(SQUAD_SYNC_STORAGE_KEY, JSON.stringify(squadSync));
      } catch (error) {
        console.log('Failed to persist squad sync:', error);
      }
    };

    persistSquadSync();
  }, [squadSync]);

  useEffect(() => {
    const teamId = String(squadSync?.teamId || '').trim();
    if (!teamId) return undefined;

    let stopped = false;

    const pullRemote = async () => {
      try {
        const remoteSnapshot = await fetchSquadSyncSnapshot(teamId);
        if (stopped || !remoteSnapshot || typeof remoteSnapshot !== 'object') return;
        setSquadSync((prev) => reconcileSquadSync(prev, remoteSnapshot));
      } catch (error) {
        console.log('Remote squad pull failed:', error);
      }
    };

    pullRemote();
    const intervalId = setInterval(pullRemote, 15000);

    return () => {
      stopped = true;
      clearInterval(intervalId);
    };
  }, [squadSync?.teamId]);

  useEffect(() => {
    const teamId = String(squadSync?.teamId || '').trim();
    if (!teamId) return undefined;

    const revision = Number(squadSync?.syncMeta?.revision || 0);
    if (!revision || revision <= lastPushedRevisionRef.current) return undefined;

    const payload = normalizeSquadSync(squadSync);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await pushSquadSyncSnapshot(teamId, payload, {
          revision,
          writerDeviceId: payload.syncMeta?.lastWriterDeviceId || localDeviceIdRef.current,
        });
        if (result?.ok) {
          lastPushedRevisionRef.current = revision;
        }
      } catch (error) {
        console.log('Remote squad push failed:', error);
      }
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [squadSync]);

  useEffect(() => {
    const todayKey = adRuntime.dayKey || new Date().toISOString().slice(0, 10);
    const history = Array.isArray(adRuntime.history) ? adRuntime.history : [];
    const nextEntry = {
      dayKey: todayKey,
      interstitialShown: adRuntime.currentDayInterstitialShown || 0,
      rewardedCompleted: adRuntime.currentDayRewardedCompleted || 0,
    };

    const existingIndex = history.findIndex((entry) => entry.dayKey === todayKey);
    const nextHistory = [...history];

    if (existingIndex >= 0) {
      const currentEntry = nextHistory[existingIndex];
      if (
        currentEntry.interstitialShown === nextEntry.interstitialShown &&
        currentEntry.rewardedCompleted === nextEntry.rewardedCompleted
      ) {
        return;
      }
      nextHistory[existingIndex] = nextEntry;
    } else {
      nextHistory.push(nextEntry);
    }

    nextHistory.sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    const trimmedHistory = nextHistory.slice(-7);

    setAdRuntime((prev) => {
      const prevHistory = Array.isArray(prev.history) ? prev.history : [];
      if (JSON.stringify(prevHistory) === JSON.stringify(trimmedHistory)) {
        return prev;
      }
      return {
        ...prev,
        history: trimmedHistory,
      };
    });
  }, [adRuntime.dayKey, adRuntime.currentDayInterstitialShown, adRuntime.currentDayRewardedCompleted]);

  const handleOnboardingComplete = (details) => {
    setTestDetails(withAutoStudyPlan(details));
    setUserProfile((prev) => ({
      ...prev,
      name: prev.name || details?.name || '',
    }));
    setOnboardingComplete(true);
  };

  const handleEditTestDetails = (details) => {
    setTestDetails((prev) => withAutoStudyPlan(details, prev));
  };

  const addErrorItem = (item) => {
    setErrorBank((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  };

  const savePausedSession = (sessionSnapshot) => {
    setPausedSession({
      ...sessionSnapshot,
      pausedAt: new Date().toISOString(),
    });
  };

  const clearPausedSession = () => {
    setPausedSession(null);
  };

  const recordMasterySession = (sessionHistory = [], quizType = 'unknown') => {
    if (!Array.isArray(sessionHistory) || !sessionHistory.length) return;

    setMasteryMap((prev) => {
      const nextByQuestion = {
        ...(prev.byQuestion || {}),
      };
      const nextTopicDaily = {
        ...(prev.topicDaily || {}),
      };

      for (const item of sessionHistory) {
        const id = item?.id ? String(item.id) : null;
        if (!id) continue;
        const topicName = item.topic || 'General';
        const dayKey = getDayKey(item.answeredAt || new Date());
        const existing = nextByQuestion[id] || {
          attempts: 0,
          correct: 0,
          topic: topicName,
          subTopic: item.subTopic || 'General',
          difficulty: item.difficulty || 'easy',
          quizType,
          lastSeen: null,
        };

        nextByQuestion[id] = {
          ...existing,
          attempts: (existing.attempts || 0) + 1,
          correct: (existing.correct || 0) + (item.correct ? 1 : 0),
          topic: topicName || existing.topic || 'General',
          subTopic: item.subTopic || existing.subTopic || 'General',
          difficulty: item.difficulty || existing.difficulty || 'easy',
          quizType,
          lastSeen: item.answeredAt || new Date().toISOString(),
        };

        if (!nextTopicDaily[topicName]) nextTopicDaily[topicName] = {};
        const existingDaily = nextTopicDaily[topicName][dayKey] || { attempts: 0, correct: 0 };
        nextTopicDaily[topicName][dayKey] = {
          attempts: existingDaily.attempts + 1,
          correct: existingDaily.correct + (item.correct ? 1 : 0),
        };
      }

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        totalSessions: (prev.totalSessions || 0) + 1,
        totalQuestions: (prev.totalQuestions || 0) + sessionHistory.length,
        byQuestion: nextByQuestion,
        topicDaily: nextTopicDaily,
      };
    });
  };

  const resetMasteryMap = () => {
    Alert.alert('Reset Mastery Analytics', 'This clears your mastery map and heatmap history for this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => setMasteryMap(createDefaultMasteryMap()),
      },
    ]);
  };

  const updateUserProfile = (patch = {}) => {
    if (!patch || typeof patch !== 'object') return;
    setUserProfile((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const createSquad = (teamNameInput = '') => {
    const trimmedName = String(teamNameInput || '').trim();
    const nextTeamName = trimmedName || squadSync.teamName || 'Civics Squad';
    const selfMember = buildMemberFromProfile(userProfile, 'You');
    const existingMembers = Array.isArray(squadSync.members) ? squadSync.members : [];
    const nextMembers = existingMembers.some((member) => String(member.id) === 'self')
      ? existingMembers.map((member) => (String(member.id) === 'self' ? { ...member, ...selfMember } : member))
      : [selfMember, ...existingMembers];

    const nextState = {
      ...squadSync,
      teamId: squadSync.teamId || `team-${Date.now()}`,
      teamName: nextTeamName,
      inviteCode: squadSync.inviteCode || buildInviteCode(),
      householdBoard: squadSync.householdBoard || createDefaultSquadSync().householdBoard,
      streakChain: squadSync.streakChain || createDefaultSquadSync().streakChain,
      nudgeCooldownByMember: squadSync.nudgeCooldownByMember || {},
      moderation: squadSync.moderation || createDefaultSquadSync().moderation,
      season: squadSync.season || createDefaultSquadSync().season,
      members: nextMembers,
      updatedAt: new Date().toISOString(),
    };

    applySquadMutation(
      () => nextState,
      ['teamId', 'teamName', 'inviteCode', 'members'],
    );
    trackAppEvent(APP_EVENT_NAMES.TEAM_CREATED, {
      team_name: nextTeamName,
      member_count: nextMembers.length,
    });
    return nextState;
  };

  const refreshSquadInviteCode = () => {
    const nextCode = buildInviteCode();
    applySquadMutation((prev) => ({
      ...prev,
      teamId: prev.teamId || `team-${Date.now()}`,
      teamName: prev.teamName || 'Civics Squad',
      inviteCode: nextCode,
    }), ['inviteCode']);
    trackAppEvent(APP_EVENT_NAMES.TEAM_INVITE_CODE_REFRESHED, {
      has_team: Boolean(squadSync.teamId),
    });
    return nextCode;
  };

  const updateSquadWeeklyGoal = (patch = {}) => {
    if (!patch || typeof patch !== 'object') return;
    applySquadMutation((prev) => ({
      ...prev,
      weeklyGoal: {
        ...prev.weeklyGoal,
        ...patch,
      },
    }), ['weeklyGoal']);
    trackAppEvent(APP_EVENT_NAMES.TEAM_WEEKLY_GOAL_UPDATED, {
      goal_quizzes: Number(patch.quizzes || squadSync.weeklyGoal?.quizzes || 0),
      goal_focus_minutes: Number(patch.focusMinutes || squadSync.weeklyGoal?.focusMinutes || 0),
    });
  };

  const updateSquadChallengeProgress = (progress = 0) => {
    const safeProgress = Math.max(0, Number(progress) || 0);
    applySquadMutation((prev) => ({
      ...prev,
      weeklyChallenge: {
        ...prev.weeklyChallenge,
        progress: safeProgress,
      },
    }), ['weeklyChallenge']);
  };

  const toggleHouseholdBoardItem = (itemId, completed) => {
    const targetId = String(itemId || '').trim();
    if (!targetId) return;

    applySquadMutation((prev) => {
      const board = prev.householdBoard || createDefaultSquadSync().householdBoard;
      const items = Array.isArray(board.items) ? board.items : [];
      const nextItems = items.map((item) => {
        if (String(item.id) !== targetId) return item;
        return {
          ...item,
          completed: Boolean(completed),
          lastCompletedAt: completed ? new Date().toISOString() : null,
        };
      });

      const todayKey = new Date().toISOString().slice(0, 10);
      const streak = prev.streakChain || createDefaultSquadSync().streakChain;
      let nextStreak = { ...streak };

      if (completed) {
        const lastDay = streak.lastActivityDay;
        if (lastDay === todayKey) {
          nextStreak = { ...streak };
        } else if (lastDay) {
          const msPerDay = 24 * 60 * 60 * 1000;
          const deltaDays = Math.floor((new Date(todayKey).getTime() - new Date(lastDay).getTime()) / msPerDay);
          const continued = deltaDays === 1;
          const currentDays = continued ? (streak.currentDays || 0) + 1 : 1;
          nextStreak = {
            currentDays,
            bestDays: Math.max(streak.bestDays || 0, currentDays),
            lastActivityDay: todayKey,
          };
        } else {
          nextStreak = {
            currentDays: 1,
            bestDays: Math.max(streak.bestDays || 0, 1),
            lastActivityDay: todayKey,
          };
        }
      }

      return {
        ...prev,
        householdBoard: {
          ...board,
          items: nextItems,
        },
        streakChain: nextStreak,
      };
    }, ['householdBoard', 'streakChain']);

    if (completed) {
      trackAppEvent(APP_EVENT_NAMES.STREAK_CHAIN_UPDATED, {
        source: 'household_board',
        item_id: targetId,
      });
    }
  };

  const recordParentChildNudge = (memberIds = []) => {
    const safeIds = Array.from(new Set((Array.isArray(memberIds) ? memberIds : [])
      .map((id) => String(id || '').trim())
      .filter((id) => id && id !== 'self')));
    if (!safeIds.length) return;

    const nowIso = new Date().toISOString();
    applySquadMutation((prev) => {
      const current = prev.nudgeCooldownByMember && typeof prev.nudgeCooldownByMember === 'object'
        ? prev.nudgeCooldownByMember
        : {};
      const nextMap = { ...current };
      safeIds.forEach((id) => {
        nextMap[id] = nowIso;
      });
      return {
        ...prev,
        nudgeCooldownByMember: nextMap,
      };
    }, ['nudgeCooldownByMember']);
  };

  const enforceModerationPolicy = async (params = {}) => {
    const nowMs = Date.now();
    const teamId = String(squadSync?.teamId || '').trim();
    if (teamId) {
      const serverResult = await enforceServerModerationPolicy(teamId, {
        ...params,
        writerDeviceId: localDeviceIdRef.current,
      });

      if (serverResult?.payload) {
        setSquadSync((prev) => reconcileSquadSync(prev, serverResult.payload));
      }

      if (serverResult?.decision) {
        return serverResult.decision;
      }
    }

    const baseline = normalizeSquadSync(squadSync);
    const baseResult = evaluateModerationPolicy(baseline, params, nowMs);
    applySquadMutation((prev) => {
      const evaluated = evaluateModerationPolicy(prev, params, nowMs);
      return {
        ...prev,
        moderation: evaluated.moderation,
      };
    }, ['moderation']);
    return baseResult.decision;
  };

  const refreshSquadFromRemote = async () => {
    const teamId = String(squadSync?.teamId || '').trim();
    if (!teamId) return { ok: false, reason: 'missing_team' };

    const remoteSnapshot = await fetchSquadSyncSnapshot(teamId);
    if (!remoteSnapshot || typeof remoteSnapshot !== 'object') {
      return { ok: false, reason: 'no_remote_snapshot' };
    }

    setSquadSync((prev) => reconcileSquadSync(prev, remoteSnapshot));
    return {
      ok: true,
      revision: Number(remoteSnapshot?.syncMeta?.revision || 0),
    };
  };

  const runModerationAdminAction = async (action, options = {}) => {
    const teamId = String(squadSync?.teamId || '').trim();
    if (!teamId) return { ok: false, reason: 'missing_team' };

    const result = await runServerModerationAdminAction(teamId, action, {
      ...options,
      adminActorId: options?.adminActorId || 'self',
    });

    if (result?.payload) {
      setSquadSync((prev) => reconcileSquadSync(prev, result.payload));
    }

    return result;
  };

  const trackAdEvent = (eventInput) => {
    setAdRuntime((prev) => {
      const options = typeof eventInput === 'string' ? { eventName: eventInput } : (eventInput || {});
      const eventName = options.eventName || '';
      const experiments = Array.isArray(options.experiments)
        ? options.experiments.filter((entry) => entry?.variantKey)
        : options.variantKey
          ? [{ variantKey: options.variantKey, variantName: options.variantName }]
          : [];
      const phase = options.phase || null;
      const todayKey = new Date().toISOString().slice(0, 10);
      const next = prev.dayKey === todayKey
        ? {
            ...prev,
            offerVariantStats: {
              ...(prev.offerVariantStats || {}),
            },
            analytics: {
              ...prev.analytics,
            },
          }
        : {
            ...prev,
            dayKey: todayKey,
            dailyCount: 0,
            resumeCount: 0,
            quizCompleteCount: 0,
            quizCompleteOpportunityCount: 0,
            lastShownAt: 0,
            currentDayInterstitialShown: 0,
            currentDayRewardedCompleted: 0,
            offerVariantStats: {
              ...(prev.offerVariantStats || {}),
            },
            analytics: {
              ...prev.analytics,
            },
          };

      if (experiments.length > 0) {
        experiments.forEach((experiment) => {
          const variantKey = experiment.variantKey;
          const variantName = experiment.variantName || getBalancedOfferVariant(variantKey, next);
          const existingVariantGroup = next.offerVariantStats?.[variantKey] || {};
          const existingVariantStats = existingVariantGroup[variantName] || { attempts: 0, completions: 0 };
          next.offerVariantStats = {
            ...next.offerVariantStats,
            [variantKey]: {
              ...existingVariantGroup,
              [variantName]: {
                attempts: existingVariantStats.attempts + (phase === 'attempt' ? 1 : 0),
                completions: existingVariantStats.completions + (phase === 'complete' ? 1 : 0),
              },
            },
          };
        });
      }

      switch (eventName) {
        case AD_EVENT_NAMES.REWARDED_ATTEMPT:
          next.analytics.rewardedAttempts += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_COMPLETED:
          next.analytics.rewardedCompleted += 1;
          next.currentDayRewardedCompleted += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_FAILED_OR_CLOSED:
          next.analytics.rewardedFailedOrClosed += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_HOME_SPRINT_ATTEMPT:
          next.analytics.rewardedHomeSprintAttempts += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_SPRINT_UNLOCK:
          next.analytics.rewardedSprintUnlocks += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_REVIEW_BONUS_ATTEMPT:
          next.analytics.rewardedReviewBonusAttempts += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_BONUS_UNLOCK:
          next.analytics.rewardedBonusUnlocks += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_REVIEW_WEAK_ATTEMPT:
          next.analytics.rewardedReviewWeakAttempts += 1;
          break;
        case AD_EVENT_NAMES.REWARDED_REVIEW_WEAK_UNLOCK:
          next.analytics.rewardedReviewWeakUnlocks += 1;
          break;
        case AD_EVENT_NAMES.WEAK_SCORE_UPSELL_ELIGIBLE:
          next.analytics.weakScoreUpsellEligible += 1;
          break;
        case AD_EVENT_NAMES.WEAK_SCORE_UPSELL_SHOWN:
          next.analytics.weakScoreUpsellShown += 1;
          break;
        default:
          break;
      }

      return next;
    });
  };

  const getOfferVariant = (variantKey) => {
    if (!isRevenueIntelligenceTreatment()) {
      return getBaselineOfferVariant(variantKey);
    }

    const pinnedVariantName = adRuntime.pinnedOfferVariants?.[variantKey];
    if ((OFFER_VARIANT_OPTIONS[variantKey] || []).includes(pinnedVariantName)) {
      return pinnedVariantName;
    }

    const autoWinnerVariantName = adRuntime?.autoOfferWinners?.[variantKey]?.active
      ? adRuntime.autoOfferWinners[variantKey]?.variantName
      : null;
    if ((OFFER_VARIANT_OPTIONS[variantKey] || []).includes(autoWinnerVariantName)) {
      return autoWinnerVariantName;
    }

    return getBalancedOfferVariant(variantKey, adRuntime);
  };

  const setPinnedOfferVariant = (variantKey, variantName = null) => {
    const options = OFFER_VARIANT_OPTIONS[variantKey] || [];
    const nextPinnedVariant = options.includes(variantName) ? variantName : null;

    setAdRuntime((prev) => ({
      ...prev,
      pinnedOfferVariants: {
        ...buildPinnedOfferVariants(prev.pinnedOfferVariants),
        [variantKey]: nextPinnedVariant,
      },
    }));
  };

  const setRevenueCohortOverride = (nextCohort = null) => {
    const normalized = String(nextCohort || '').trim().toLowerCase();
    const override = normalized === 'holdout' || normalized === 'treatment' ? normalized : null;
    setAdRuntime((prev) => {
      const cohorts = normalizeExperimentCohorts(prev?.experimentCohorts || {});
      return {
        ...prev,
        experimentCohorts: {
          ...cohorts,
          revenueIntelligence: {
            ...cohorts.revenueIntelligence,
            overrideCohort: override,
          },
        },
      };
    });
  };

  const resetOfferVariantStats = () => {
    setAdRuntime((prev) => ({
      ...prev,
      pinnedOfferVariants: createDefaultAdRuntime().pinnedOfferVariants,
      autoOfferWinners: createDefaultAdRuntime().autoOfferWinners,
      offerVariantStats: {},
    }));
  };

  const resetAdAnalytics = () => {
    setAdRuntime((prev) => ({
      ...prev,
      pinnedOfferVariants: createDefaultAdRuntime().pinnedOfferVariants,
      autoOfferWinners: createDefaultAdRuntime().autoOfferWinners,
      offerVariantStats: {},
      analytics: createDefaultAdRuntime().analytics,
    }));
  };

  const unlockDailyFreePack = async () => {
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    const activeSegment = getSelfIntentSegment();
    const treatmentEnabled = isRevenueIntelligenceTreatment();
    const effectiveSegment = treatmentEnabled ? activeSegment : 'warming';
    const segmentPolicy = getOfferFrequencyPolicyForSegment(effectiveSegment);
    const maxFreePackUnlocks = Math.max(1, Math.round(DAILY_FREE_PACK_LIMIT * segmentPolicy.rewardedDailyLimitMultiplier));
    const freePackCooldownMs = Math.max(60 * 1000, Math.round(FREE_PACK_COOLDOWN_MS * segmentPolicy.rewardedCooldownMultiplier));
    const baseline = adRuntime.dayKey === todayKey
      ? { ...adRuntime }
      : {
          ...adRuntime,
          dayKey: todayKey,
          dailyCount: 0,
          resumeCount: 0,
          quizCompleteCount: 0,
          lastShownAt: 0,
          currentDayInterstitialShown: 0,
          currentDayRewardedCompleted: 0,
          freePackDayKey: todayKey,
          freePackUnlocksToday: 0,
        };

    if (baseline.freePackDayKey !== todayKey) {
      baseline.freePackDayKey = todayKey;
      baseline.freePackUnlocksToday = 0;
    }

    if (baseline.freePackUnlocksToday >= maxFreePackUnlocks) {
      logOfferCapDecision({
        channel: 'rewarded_free_pack',
        trigger: 'daily_unlock',
        decision: 'blocked',
        reason: 'daily_limit',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs: freePackCooldownMs,
        dailyLimit: maxFreePackUnlocks,
      });
      setAdRuntime({
        ...baseline,
        analytics: {
          ...baseline.analytics,
          rewardedFreePackBlockedDailyLimit: (baseline.analytics?.rewardedFreePackBlockedDailyLimit || 0) + 1,
        },
      });
      return { ok: false, reason: 'daily_limit' };
    }

    if (now < (baseline.freePackCooldownUntil || 0)) {
      logOfferCapDecision({
        channel: 'rewarded_free_pack',
        trigger: 'daily_unlock',
        decision: 'blocked',
        reason: 'cooldown',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs: freePackCooldownMs,
        dailyLimit: maxFreePackUnlocks,
      });
      setAdRuntime({
        ...baseline,
        analytics: {
          ...baseline.analytics,
          rewardedFreePackBlockedCooldown: (baseline.analytics?.rewardedFreePackBlockedCooldown || 0) + 1,
        },
      });
      return {
        ok: false,
        reason: 'cooldown',
        cooldownUntil: baseline.freePackCooldownUntil,
      };
    }

    const withAttempt = {
      ...baseline,
      analytics: {
        ...baseline.analytics,
        rewardedAttempts: (baseline.analytics?.rewardedAttempts || 0) + 1,
        rewardedFreePackAttempts: (baseline.analytics?.rewardedFreePackAttempts || 0) + 1,
      },
    };

    try {
      await showRewardedAd();

      logOfferCapDecision({
        channel: 'rewarded_free_pack',
        trigger: 'daily_unlock',
        decision: 'allowed',
        reason: 'shown',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs: freePackCooldownMs,
        dailyLimit: maxFreePackUnlocks,
      });

      const next = {
        ...withAttempt,
        freePackDayKey: todayKey,
        freePackUnlocksToday: (withAttempt.freePackUnlocksToday || 0) + 1,
        freePackCooldownUntil: now + freePackCooldownMs,
        currentDayRewardedCompleted: (withAttempt.currentDayRewardedCompleted || 0) + 1,
        analytics: {
          ...withAttempt.analytics,
          rewardedCompleted: (withAttempt.analytics?.rewardedCompleted || 0) + 1,
          rewardedFreePackUnlocked: (withAttempt.analytics?.rewardedFreePackUnlocked || 0) + 1,
        },
      };

      setAdRuntime(next);
      return {
        ok: true,
        questionCount: FREE_PACK_QUESTION_COUNT,
        cooldownUntil: next.freePackCooldownUntil,
      };
    } catch (error) {
      logOfferCapDecision({
        channel: 'rewarded_free_pack',
        trigger: 'daily_unlock',
        decision: 'blocked',
        reason: 'ad_failed',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs: freePackCooldownMs,
        dailyLimit: maxFreePackUnlocks,
      });
      setAdRuntime({
        ...withAttempt,
        freePackCooldownUntil: now + Math.max(60 * 1000, Math.round((5 * 60 * 1000) * segmentPolicy.rewardedCooldownMultiplier)),
        analytics: {
          ...withAttempt.analytics,
          rewardedFailedOrClosed: (withAttempt.analytics?.rewardedFailedOrClosed || 0) + 1,
          rewardedFreePackFailed: (withAttempt.analytics?.rewardedFreePackFailed || 0) + 1,
        },
      });
      return { ok: false, reason: 'ad_failed' };
    }
  };

  const claimComebackReward = async () => {
    if (!isRevenueIntelligenceTreatment()) {
      return { ok: false, reason: 'holdout' };
    }

    const nowIso = new Date().toISOString();
    const currentDayKey = getDayKey(new Date());
    const campaign = normalizeComebackCampaign(adRuntime?.comebackCampaign || {});
    const windowKey = String(campaign?.eligibleWindow || '').trim();
    if (!windowKey || !campaign?.windows?.[windowKey]?.eligible) {
      return { ok: false, reason: 'not_eligible' };
    }

    const window = campaign.windows[windowKey] || {};
    const lastClaimDayKey = String(window?.lastClaimedAt || '').trim().slice(0, 10);
    if (lastClaimDayKey === currentDayKey) {
      return { ok: false, reason: 'already_claimed' };
    }

    const questionCount = Number(COMEBACK_REWARD_QUESTIONS[windowKey] || 8);
    const nextCampaign = {
      ...campaign,
      eligibleWindow: null,
      windows: {
        ...campaign.windows,
        [windowKey]: {
          ...window,
          eligible: false,
          claimedCount: Number(window?.claimedCount || 0) + 1,
          lastClaimedAt: nowIso,
        },
      },
    };

    setAdRuntime((prev) => {
      const analytics = {
        ...createDefaultAdRuntime().analytics,
        ...(prev.analytics || {}),
      };
      if (windowKey === 'd2') analytics.comebackD2Claimed += 1;
      if (windowKey === 'd5') analytics.comebackD5Claimed += 1;
      if (windowKey === 'd10') analytics.comebackD10Claimed += 1;
      return {
        ...prev,
        comebackCampaign: nextCampaign,
        analytics,
      };
    });

    trackAppEvent(APP_EVENT_NAMES.COMEBACK_REWARD_CLAIMED, {
      window_key: windowKey,
      day_offset: Number(window?.dayOffset || 0),
      question_count: questionCount,
      claimed_count: Number(window?.claimedCount || 0) + 1,
    });

    return {
      ok: true,
      windowKey,
      questionCount,
    };
  };

  const reportFocusInteraction = (payload = {}) => {
    const now = Date.now();
    let enteredFocusState = false;
    let exitedFocusState = false;
    let showedFocusShieldPrompt = false;
    let exitReason = 'unknown';

    setAdRuntime((prev) => {
      const focusTelemetry = normalizeFocusTelemetry(prev.focusTelemetry, now);
      const nextFocusTelemetry = {
        ...focusTelemetry,
        focusVelocity: Math.max(0, Number(payload.focusVelocity || focusTelemetry.focusVelocity || 0)),
        accuracyStreak: Math.max(0, Number(payload.accuracyStreak || 0)),
        interactionLatencyMs: Math.max(0, Number(payload.interactionLatencyMs || 0)),
        sessionFatigueScore: Math.max(0, Number(payload.sessionFatigueScore || 0)),
      };

      const windowQualified = Boolean(payload.focusWindowQualified);
      const skipActionsInWindow = Math.max(0, Number(payload.skipActionsInWindow || 0));
      const consecutiveIncorrect = Math.max(0, Number(payload.consecutiveIncorrect || 0));
      const interactionLatencyMs = Math.max(0, Number(payload.interactionLatencyMs || 0));

      const shouldEnterFocus = !nextFocusTelemetry.adSuppressionActive
        && windowQualified
        && nextFocusTelemetry.accuracyStreak >= 5
        && skipActionsInWindow === 0;

      if (shouldEnterFocus) {
        enteredFocusState = true;
        nextFocusTelemetry.adSuppressionActive = true;
        nextFocusTelemetry.adSuppressionUntil = now + FOCUS_SUPPRESSION_WINDOW_MS;
        nextFocusTelemetry.focusEnteredAt = now;
        nextFocusTelemetry.focusStateSeen = true;
        nextFocusTelemetry.recoveryRewardedPrompt = false;
        nextFocusTelemetry.focusShieldEligible = true;
        nextFocusTelemetry.focusShieldPromptShownForWindow = false;
      }

      const shouldExitByLatency = interactionLatencyMs > 15000;
      const shouldExitByIncorrect = consecutiveIncorrect >= 2;
      const shouldExitFocus = nextFocusTelemetry.adSuppressionActive && (shouldExitByLatency || shouldExitByIncorrect);
      if (shouldExitFocus) {
        exitedFocusState = true;
        exitReason = shouldExitByLatency ? 'latency_gt_15s' : 'two_incorrect_streak';
        nextFocusTelemetry.adSuppressionActive = false;
        nextFocusTelemetry.adSuppressionUntil = now;
        nextFocusTelemetry.focusExitedAt = now;
        nextFocusTelemetry.recoveryRewardedPrompt = true;
        nextFocusTelemetry.focusShieldEligible = false;
        nextFocusTelemetry.focusShieldPromptShownForWindow = false;
      }

      if (
        nextFocusTelemetry.adSuppressionActive
        && nextFocusTelemetry.focusShieldEligible
        && !nextFocusTelemetry.focusShieldPromptShownForWindow
      ) {
        showedFocusShieldPrompt = true;
        nextFocusTelemetry.focusShieldPromptShownForWindow = true;
      }

      const nextAnalytics = {
        ...prev.analytics,
        focusStateEnterCount: (prev.analytics?.focusStateEnterCount || 0) + (enteredFocusState ? 1 : 0),
        focusStateExitCount: (prev.analytics?.focusStateExitCount || 0) + (exitedFocusState ? 1 : 0),
        focusShieldPromptShownCount: (prev.analytics?.focusShieldPromptShownCount || 0) + (showedFocusShieldPrompt ? 1 : 0),
      };

      return {
        ...prev,
        analytics: nextAnalytics,
        focusTelemetry: nextFocusTelemetry,
      };
    });

    if (enteredFocusState) {
      trackAppEvent(APP_EVENT_NAMES.FOCUS_STATE_ENTERED, {
        focus_velocity: Number(payload.focusVelocity || 0),
        accuracy_streak: Number(payload.accuracyStreak || 0),
        interaction_latency_ms: Number(payload.interactionLatencyMs || 0),
        session_fatigue_score: Number(payload.sessionFatigueScore || 0),
        skip_actions_in_window: Number(payload.skipActionsInWindow || 0),
      });
    }

    if (exitedFocusState) {
      trackAppEvent(APP_EVENT_NAMES.FOCUS_STATE_EXITED, {
        reason: exitReason,
        focus_velocity: Number(payload.focusVelocity || 0),
        accuracy_streak: Number(payload.accuracyStreak || 0),
        interaction_latency_ms: Number(payload.interactionLatencyMs || 0),
        session_fatigue_score: Number(payload.sessionFatigueScore || 0),
      });
    }

    if (showedFocusShieldPrompt) {
      trackAppEvent(APP_EVENT_NAMES.FOCUS_SHIELD_PROMPT_SHOWN, {
        prompt: 'watch_ad_keep_ad_free_20m',
      });
    }

    const latestFlowState = enteredFocusState
      ? true
      : exitedFocusState
        ? false
        : Boolean(adRuntime?.focusTelemetry?.adSuppressionActive);
    const streakDays = Number(squadSync?.streakChain?.currentDays || 0);
    const streakIntensity = getGhostStreakIntensity({
      focusVelocity: Number(payload.focusVelocity || 0),
      streakDays,
      isFlowState: latestFlowState,
    });

    const previousGhostBroadcast = lastGhostBroadcastRef.current || { at: 0, intensity: -1, isFlowState: false };
    const shouldBroadcastGhostPresence = (
      Math.abs(streakIntensity - Number(previousGhostBroadcast.intensity || 0)) >= 0.08
      || previousGhostBroadcast.isFlowState !== latestFlowState
      || (now - Number(previousGhostBroadcast.at || 0)) >= 10000
    );

    if (shouldBroadcastGhostPresence) {
      lastGhostBroadcastRef.current = {
        at: now,
        intensity: streakIntensity,
        isFlowState: latestFlowState,
      };

      const updatedAtIso = new Date(now).toISOString();
      applySquadMutation((prev) => {
        const members = Array.isArray(prev?.members) ? prev.members : [];
        if (!members.length) return prev;

        const nextMembers = members.map((member) => {
          if (String(member?.id || '').trim() !== 'self') return member;
          return {
            ...member,
            status: latestFlowState ? 'in_the_zone' : 'active',
            ghostPresence: {
              streakIntensity,
              focusVelocity: Math.max(0, Number(payload.focusVelocity || 0)),
              isFlowState: latestFlowState,
              updatedAt: updatedAtIso,
            },
          };
        });

        return {
          ...prev,
          members: nextMembers,
        };
      }, ['members']);
    }
  };

  const activateFocusShieldRewarded = async () => {
    const now = Date.now();
    const currentFocusTelemetry = normalizeFocusTelemetry(adRuntime?.focusTelemetry, now);
    if (!currentFocusTelemetry.adSuppressionActive) {
      return { ok: false, reason: 'not_in_focus' };
    }

    setAdRuntime((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        rewardedAttempts: (prev.analytics?.rewardedAttempts || 0) + 1,
      },
    }));

    try {
      await showRewardedAd();
      const focusShieldUntil = Date.now() + FOCUS_SHIELD_WINDOW_MS;

      setAdRuntime((prev) => {
        const nextFocusTelemetry = normalizeFocusTelemetry(prev?.focusTelemetry, Date.now());
        return {
          ...prev,
          analytics: {
            ...prev.analytics,
            rewardedCompleted: (prev.analytics?.rewardedCompleted || 0) + 1,
            focusShieldActivatedCount: (prev.analytics?.focusShieldActivatedCount || 0) + 1,
          },
          focusTelemetry: {
            ...nextFocusTelemetry,
            focusShieldUntil,
            adSuppressionUntil: Math.max(Number(nextFocusTelemetry.adSuppressionUntil || 0), focusShieldUntil),
            adSuppressionActive: true,
            focusShieldEligible: false,
            recoveryRewardedPrompt: false,
          },
        };
      });

      trackAppEvent(APP_EVENT_NAMES.FOCUS_SHIELD_ACTIVATED, {
        shield_minutes: 20,
      });

      return { ok: true, focusShieldUntil };
    } catch (error) {
      setAdRuntime((prev) => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          rewardedFailedOrClosed: (prev.analytics?.rewardedFailedOrClosed || 0) + 1,
        },
      }));
      return { ok: false, reason: 'ad_failed' };
    }
  };

  const recordCinematicLanding = (meta = {}) => {
    const landedAt = Date.now();
    setAdRuntime((prev) => {
      const nextFocusTelemetry = normalizeFocusTelemetry(prev?.focusTelemetry, landedAt);
      return {
        ...prev,
        focusTelemetry: {
          ...nextFocusTelemetry,
          cinematicLandingAt: landedAt,
        },
      };
    });

    trackAppEvent(APP_EVENT_NAMES.CINEMATIC_FLYTHROUGH_LANDED, {
      surface: String(meta.surface || 'home_spatial_path'),
    });
  };

  const maybeShowInterstitial = async (trigger = 'generic') => {
    const options = typeof trigger === 'string' ? { trigger } : (trigger || {});
    const triggerName = options.trigger || 'generic';
    const sessionQuestionCount = Math.max(0, Number(options.sessionQuestionCount || 0));
    const sessionScore = Math.max(0, Number(options.score || 0));
    const sessionPercentage = sessionQuestionCount > 0
      ? Math.round((sessionScore / sessionQuestionCount) * 100)
      : 0;
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    const activeSegment = getSelfIntentSegment();
    const treatmentEnabled = isRevenueIntelligenceTreatment();
    const effectiveSegment = treatmentEnabled ? activeSegment : 'warming';
    const segmentPolicy = getOfferFrequencyPolicyForSegment(effectiveSegment);
    const baseline = adRuntime.dayKey === todayKey
      ? { ...adRuntime }
      : {
          ...adRuntime,
          dayKey: todayKey,
          dailyCount: 0,
          resumeCount: 0,
          quizCompleteCount: 0,
          quizCompleteOpportunityCount: 0,
          lastShownAt: 0,
          currentDayInterstitialShown: 0,
          currentDayRewardedCompleted: 0,
          freePackDayKey: todayKey,
          freePackUnlocksToday: 0,
        };

    const baseCooldownMs = triggerName === 'resume' ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const cooldownMs = Math.max(60 * 1000, Math.round(baseCooldownMs * segmentPolicy.interstitialCooldownMultiplier));
    const maxDailyAds = Math.max(3, Math.round(8 * segmentPolicy.interstitialDailyLimitMultiplier));
    const maxResumeAds = Math.max(1, Math.round(3 * segmentPolicy.resumeLimitMultiplier));
    const maxQuizCompleteAds = Math.max(1, Math.round(4 * segmentPolicy.quizCompleteLimitMultiplier));

    const withAttempt = {
      ...baseline,
      analytics: {
        ...baseline.analytics,
        interstitialAttempts: (baseline.analytics?.interstitialAttempts || 0) + 1,
      },
    };
    const focusTelemetry = normalizeFocusTelemetry(withAttempt.focusTelemetry, now);

    if (focusTelemetry.adSuppressionActive) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'focus_suppression',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        focusTelemetry,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedFocusSuppression: (withAttempt.analytics?.interstitialSkippedFocusSuppression || 0) + 1,
        },
      });
      return false;
    }

    if (focusTelemetry.cinematicLandingAt > 0 && (now - focusTelemetry.cinematicLandingAt) < CINEMATIC_SAFETY_BUFFER_MS) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'cinematic_safety_buffer',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        focusTelemetry,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedCinematicSafetyBuffer: (withAttempt.analytics?.interstitialSkippedCinematicSafetyBuffer || 0) + 1,
        },
      });
      return false;
    }

    if ((focusTelemetry.interstitialShownAt || []).length >= MAX_ADS_PER_10_MIN) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'rolling_10m_cap',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        focusTelemetry,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedRolling10mCap: (withAttempt.analytics?.interstitialSkippedRolling10mCap || 0) + 1,
        },
      });
      return false;
    }

    if (triggerName === 'quizComplete') {
      const hasNaturalBreak = focusTelemetry.focusStateSeen
        ? (focusTelemetry.focusExitedAt > 0 && (now - focusTelemetry.focusExitedAt) <= FOCUS_POST_VICTORY_WINDOW_MS)
        : true;
      if (!hasNaturalBreak) {
        logOfferCapDecision({
          channel: 'interstitial',
          trigger: triggerName,
          decision: 'blocked',
          reason: 'post_victory_wait_focus_exit',
          segment: effectiveSegment,
          policy: segmentPolicy,
          cooldownMs,
          dailyLimit: maxDailyAds,
          triggerLimit: maxQuizCompleteAds,
        });
        setAdRuntime({
          ...withAttempt,
          focusTelemetry,
          analytics: {
            ...withAttempt.analytics,
            interstitialQuizCompleteSkippedNoNaturalBreak: (withAttempt.analytics?.interstitialQuizCompleteSkippedNoNaturalBreak || 0) + 1,
          },
        });
        return false;
      }

      const withEligibility = {
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialQuizCompleteEligible: (withAttempt.analytics?.interstitialQuizCompleteEligible || 0) + 1,
        },
      };

      if (sessionQuestionCount > 0 && sessionQuestionCount < 8) {
        logOfferCapDecision({
          channel: 'interstitial',
          trigger: triggerName,
          decision: 'blocked',
          reason: 'short_session',
          segment: effectiveSegment,
          policy: segmentPolicy,
          cooldownMs,
          dailyLimit: maxDailyAds,
          triggerLimit: maxQuizCompleteAds,
        });
        setAdRuntime({
          ...withEligibility,
          analytics: {
            ...withEligibility.analytics,
            interstitialQuizCompleteSkippedShortSession: (withEligibility.analytics?.interstitialQuizCompleteSkippedShortSession || 0) + 1,
          },
        });
        return false;
      }

      if (sessionQuestionCount > 0 && sessionPercentage < 60) {
        logOfferCapDecision({
          channel: 'interstitial',
          trigger: triggerName,
          decision: 'blocked',
          reason: 'low_score',
          segment: effectiveSegment,
          policy: segmentPolicy,
          cooldownMs,
          dailyLimit: maxDailyAds,
          triggerLimit: maxQuizCompleteAds,
        });
        setAdRuntime({
          ...withEligibility,
          analytics: {
            ...withEligibility.analytics,
            interstitialQuizCompleteSkippedLowScore: (withEligibility.analytics?.interstitialQuizCompleteSkippedLowScore || 0) + 1,
          },
        });
        return false;
      }

      const nextOpportunityCount = (withEligibility.quizCompleteOpportunityCount || 0) + 1;
      const cadenceEvery = 2;
      if (nextOpportunityCount % cadenceEvery !== 0) {
        logOfferCapDecision({
          channel: 'interstitial',
          trigger: triggerName,
          decision: 'blocked',
          reason: 'cadence_skip',
          segment: effectiveSegment,
          policy: segmentPolicy,
          cooldownMs,
          dailyLimit: maxDailyAds,
          triggerLimit: maxQuizCompleteAds,
        });
        setAdRuntime({
          ...withEligibility,
          quizCompleteOpportunityCount: nextOpportunityCount,
          analytics: {
            ...withEligibility.analytics,
            interstitialQuizCompleteSkippedCadence: (withEligibility.analytics?.interstitialQuizCompleteSkippedCadence || 0) + 1,
          },
        });
        return false;
      }

      withAttempt.quizCompleteOpportunityCount = nextOpportunityCount;
      withAttempt.analytics = {
        ...withEligibility.analytics,
      };
    }

    if (withAttempt.dailyCount >= maxDailyAds) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'daily_limit',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedDailyCap: (withAttempt.analytics?.interstitialSkippedDailyCap || 0) + 1,
        },
      });
      return false;
    }

    if (now - (withAttempt.lastShownAt || 0) < cooldownMs) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'cooldown',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedCooldown: (withAttempt.analytics?.interstitialSkippedCooldown || 0) + 1,
        },
      });
      return false;
    }

    if (triggerName === 'resume' && withAttempt.resumeCount >= maxResumeAds) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'trigger_limit',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: maxResumeAds,
      });
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedTriggerCap: (withAttempt.analytics?.interstitialSkippedTriggerCap || 0) + 1,
        },
      });
      return false;
    }

    if (triggerName === 'quizComplete' && withAttempt.quizCompleteCount >= maxQuizCompleteAds) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'trigger_limit',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedTriggerCap: (withAttempt.analytics?.interstitialSkippedTriggerCap || 0) + 1,
        },
      });
      return false;
    }

    try {
      await showInterstitialAd();

      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'allowed',
        reason: 'shown',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });

      setAdRuntime({
        ...withAttempt,
        dailyCount: withAttempt.dailyCount + 1,
        resumeCount: triggerName === 'resume' ? withAttempt.resumeCount + 1 : withAttempt.resumeCount,
        quizCompleteCount: triggerName === 'quizComplete' ? withAttempt.quizCompleteCount + 1 : withAttempt.quizCompleteCount,
        lastShownAt: now,
        currentDayInterstitialShown: (withAttempt.currentDayInterstitialShown || 0) + 1,
        analytics: {
          ...withAttempt.analytics,
          interstitialShown: (withAttempt.analytics?.interstitialShown || 0) + 1,
          interstitialResumeShown: triggerName === 'resume'
            ? (withAttempt.analytics?.interstitialResumeShown || 0) + 1
            : (withAttempt.analytics?.interstitialResumeShown || 0),
          interstitialQuizCompleteShown: triggerName === 'quizComplete'
            ? (withAttempt.analytics?.interstitialQuizCompleteShown || 0) + 1
            : (withAttempt.analytics?.interstitialQuizCompleteShown || 0),
          interstitialGenericShown: triggerName !== 'resume' && triggerName !== 'quizComplete'
            ? (withAttempt.analytics?.interstitialGenericShown || 0) + 1
            : (withAttempt.analytics?.interstitialGenericShown || 0),
        },
        focusTelemetry: {
          ...focusTelemetry,
          interstitialShownAt: [...(focusTelemetry.interstitialShownAt || []), now]
            .filter((ts) => Number.isFinite(Number(ts)) && (now - Number(ts)) <= AD_ROLLING_WINDOW_MS),
        },
      });
      if (triggerName === 'quizComplete') {
        trackAppEvent(APP_EVENT_NAMES.INTERSTITIAL_POST_VICTORY_SHOWN, {
          focus_state_seen: Boolean(focusTelemetry.focusStateSeen),
          millis_since_focus_exit: focusTelemetry.focusExitedAt > 0 ? Math.max(0, now - focusTelemetry.focusExitedAt) : -1,
        });
      }
      return true;
    } catch (error) {
      logOfferCapDecision({
        channel: 'interstitial',
        trigger: triggerName,
        decision: 'blocked',
        reason: 'ad_failed',
        segment: effectiveSegment,
        policy: segmentPolicy,
        cooldownMs,
        dailyLimit: maxDailyAds,
        triggerLimit: triggerName === 'resume' ? maxResumeAds : maxQuizCompleteAds,
      });
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialFailed: (withAttempt.analytics?.interstitialFailed || 0) + 1,
        },
      });
      console.log('Interstitial throttled flow failed:', error);
      return false;
    }
  };

  return (
    <HapticProvider>
      <AppDataContext.Provider
        value={{
          testDetails,
          setTestDetails,
          errorBank,
          addErrorItem,
          pausedSession,
          savePausedSession,
          clearPausedSession,
          maybeShowInterstitial,
          adRuntime,
          trackAdEvent,
          trackAppEvent,
          reportFocusInteraction,
          activateFocusShieldRewarded,
          recordCinematicLanding,
          getOfferVariant,
          setPinnedOfferVariant,
          setRevenueCohortOverride,
          resetOfferVariantStats,
          resetAdAnalytics,
          unlockDailyFreePack,
          claimComebackReward,
          masteryMap,
          recordMasterySession,
          resetMasteryMap,
          userProfile,
          updateUserProfile,
          squadSync,
          createSquad,
          refreshSquadInviteCode,
          updateSquadWeeklyGoal,
          updateSquadChallengeProgress,
          toggleHouseholdBoardItem,
          recordParentChildNudge,
          enforceModerationPolicy,
          refreshSquadFromRemote,
          runModerationAdminAction,
        }}
      >
        <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const initialRoute = navigationRef.current?.getCurrentRoute()?.name || 'unknown';
          routeNameRef.current = initialRoute;
          trackAppEvent(APP_EVENT_NAMES.SCREEN_VIEW, { screen_name: initialRoute });
        }}
        onStateChange={() => {
          const previousRoute = routeNameRef.current;
          const currentRoute = navigationRef.current?.getCurrentRoute()?.name || 'unknown';

          if (previousRoute !== currentRoute) {
            trackAppEvent(APP_EVENT_NAMES.SCREEN_VIEW, {
              screen_name: currentRoute,
              previous_screen: previousRoute || 'unknown',
            });
          }

          routeNameRef.current = currentRoute;
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0A0A12' },
          }}
        >
          {!onboardingComplete ? (
            <Stack.Screen
              name="Onboarding"
              options={{ animationEnabled: false }}
            >
              {(props) => <OnboardingScreen {...props} route={{ ...props.route, params: { onComplete: handleOnboardingComplete } }} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                options={{ animationEnabled: false }}
              >
                {(props) => <TabNavigator {...props} testDetails={testDetails} onEditTestDetails={handleEditTestDetails} />}
              </Stack.Screen>
              <Stack.Screen
                name="EditTestDetails"
                options={{ animationEnabled: true }}
              >
                {(props) => <EditTestDetailsScreen {...props} testDetails={testDetails} onSave={handleEditTestDetails} />}
              </Stack.Screen>
              <Stack.Screen name="ModeSelector" component={ModeSelectorScreen} options={{ animationEnabled: true }} />
              <Stack.Screen name="MasteryMap" component={MasteryMapScreen} options={{ animationEnabled: true }} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen name="Review" component={ReviewScreen} />
              <Stack.Screen name="Interview" component={InterviewScreen} options={{ animationEnabled: true }} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Family" component={FamilyScreen} />
              <Stack.Screen name="CaseProgress" component={CaseProgressScreen} />
            </>
          )}
        </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </AppDataContext.Provider>
    </HapticProvider>
  );
}

