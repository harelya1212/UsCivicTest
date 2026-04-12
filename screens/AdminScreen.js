import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Clipboard from 'expo-clipboard';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import {
  buildSevenDayRevenueTrend,
} from '../utils/helpers';
import {
  usStates,
  APP_EVENT_NAMES,
  RECOVERY_CAMPAIGN_STORAGE_PREFIX,
} from '../constants';
import {
  DYNAMIC_CIVICS_DATA,
  STATE_CAPITALS,
  setDynamicFederalAnswers,
  setStateOfficeholders,
  setStateCapital,
} from '../civicsDynamicData';
import { fetchRecentAnalyticsDebugEvents, getAnalyticsVerificationMode } from '../analyticsService';

const OFFER_VARIANT_GROUPS = [
  {
    key: 'homeSprintOffer',
    label: 'Home Sprint Copy Test',
    variants: ['control', 'urgency'],
  },
  {
    key: 'homeSprintReward',
    label: 'Home Sprint Reward Test',
    variants: ['standard', 'extended'],
  },
  {
    key: 'reviewBonusOffer',
    label: 'Review Bonus Copy Test',
    variants: ['control', 'challenge'],
  },
  {
    key: 'reviewWeakOffer',
    label: 'Weak-Area Rescue Copy Test',
    variants: ['control', 'coach'],
  },
];

const VARIANT_LABELS = {
  control: 'Control',
  urgency: 'Urgency',
  standard: 'Standard Reward',
  extended: 'Extended Reward',
  challenge: 'Challenge',
  coach: 'Coach',
};

const AUTO_VARIANT_VALUE = '__auto__';

function AdminScreen() {
  const {
    testDetails,
    adRuntime,
    squadSync,
    resetAdAnalytics,
    setPinnedOfferVariant,
    setRevenueCohortOverride,
    resetOfferVariantStats,
    refreshSquadFromRemote,
    runModerationAdminAction,
    trackAppEvent,
    getOfferVariant,
  } = useContext(AppDataContext);
  const [stateName, setStateName] = useState(testDetails?.state || 'California');
  const [president, setPresident] = useState(DYNAMIC_CIVICS_DATA.federal.president);
  const [vicePresident, setVicePresident] = useState(DYNAMIC_CIVICS_DATA.federal.vicePresident);
  const [speakerOfHouse, setSpeakerOfHouse] = useState(DYNAMIC_CIVICS_DATA.federal.speakerOfHouse);
  const [chiefJustice, setChiefJustice] = useState(DYNAMIC_CIVICS_DATA.federal.chiefJustice);
  const [governor, setGovernor] = useState('');
  const [senatorOne, setSenatorOne] = useState('');
  const [senatorTwo, setSenatorTwo] = useState('');
  const [capital, setCapitalValue] = useState('');
  const [interstitialEcpm, setInterstitialEcpm] = useState('4.00');
  const [rewardedEcpm, setRewardedEcpm] = useState('12.00');
  const [showMonthlyProjection, setShowMonthlyProjection] = useState(true);
  const [analyticsDebugEvents, setAnalyticsDebugEvents] = useState([]);
  const [analyticsDebugLoading, setAnalyticsDebugLoading] = useState(false);
  const [analyticsDebugError, setAnalyticsDebugError] = useState('');
  const [recoveryMetrics, setRecoveryMetrics] = useState({
    completedSessions: 0,
    lastTopic: null,
    updatedAt: null,
    stepTimestamps: { 1: null, 2: null, 3: null },
  });
  const [recoveryMetricsLoading, setRecoveryMetricsLoading] = useState(false);
  const [moderationActorId, setModerationActorId] = useState('self');
  const [moderationBusy, setModerationBusy] = useState(false);
  const [runtimeSelfCheckSummary, setRuntimeSelfCheckSummary] = useState('Tap "Run Self-Check" to capture active treatment/baseline runtime paths.');
  const [copyFeedback, setCopyFeedback] = useState({ type: '', text: '' });
  const [staleCopyFeedback, setStaleCopyFeedback] = useState({ type: '', text: '' });

  const verificationMode = getAnalyticsVerificationMode();
  const analyticsFunnelRows = [
    { key: APP_EVENT_NAMES.QUIZ_STARTED, label: 'Quiz Started' },
    { key: APP_EVENT_NAMES.QUESTION_ANSWERED, label: 'Questions Answered' },
    { key: APP_EVENT_NAMES.HOME_LISTEN_CTA_CLICKED, label: 'Home Listen CTA Clicked' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_PLAYED, label: 'Quiz TTS Played' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_REPEATED, label: 'Quiz TTS Repeated' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_SPEED_CHANGED, label: 'Quiz TTS Speed Changed' },
    { key: APP_EVENT_NAMES.QUIZ_LISTEN_AUTO_ADVANCED, label: 'Quiz Listen Auto Advanced' },
    { key: APP_EVENT_NAMES.QUIZ_FOCUS_MODE_TOGGLED, label: 'Quiz Focus Mode Toggled' },
    { key: APP_EVENT_NAMES.QUIZ_STEP_GOAL_REACHED, label: 'Quiz Step Goal Reached' },
    { key: APP_EVENT_NAMES.QUIZ_BREAK_NUDGE_SHOWN, label: 'Quiz Break Nudge Shown' },
    { key: APP_EVENT_NAMES.RECOVERY_SESSION_STARTED, label: 'Recovery Session Started' },
    { key: APP_EVENT_NAMES.RECOVERY_SESSION_COMPLETED, label: 'Recovery Session Completed' },
    { key: APP_EVENT_NAMES.INTERVIEW_STARTED, label: 'Interview Started' },
    { key: APP_EVENT_NAMES.INTERVIEW_PROMPT_PLAYED, label: 'Interview Prompt Played' },
    { key: APP_EVENT_NAMES.INTERVIEW_RECORDING_STARTED, label: 'Interview Recording Started' },
    { key: APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED, label: 'Interview Responses' },
    { key: APP_EVENT_NAMES.INTERVIEW_SCORE_REVEALED, label: 'Interview Score Revealed' },
    { key: APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SHOWN, label: 'Follow-Ups Shown' },
    { key: APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED, label: 'Follow-Ups Completed' },
    { key: APP_EVENT_NAMES.INTERVIEW_SESSION_COMPLETED, label: 'Interview Session Completed' },
    { key: APP_EVENT_NAMES.INTERVIEW_SESSION_EXITED, label: 'Interview Session Exited' },
    { key: APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED, label: 'Home Revenue Runtime Exposed' },
    { key: APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED, label: 'Review Revenue Runtime Exposed' },
    { key: APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, label: 'Variant Fallback Applied' },
  ].map((row) => ({
    ...row,
    count: analyticsDebugEvents.filter((event) => event.eventName === row.key).length,
  }));
  const quizStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_STARTED)?.count || 0;
  const questionAnsweredCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUESTION_ANSWERED)?.count || 0;
  const listenCtaCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.HOME_LISTEN_CTA_CLICKED)?.count || 0;
  const quizTtsPlayedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_TTS_PLAYED)?.count || 0;
  const quizTtsRepeatedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_TTS_REPEATED)?.count || 0;
  const quizTtsSpeedChangedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_TTS_SPEED_CHANGED)?.count || 0;
  const quizListenAutoAdvancedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_LISTEN_AUTO_ADVANCED)?.count || 0;
  const quizFocusModeToggledCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_FOCUS_MODE_TOGGLED)?.count || 0;
  const quizStepGoalReachedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_STEP_GOAL_REACHED)?.count || 0;
  const quizBreakNudgeShownCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.QUIZ_BREAK_NUDGE_SHOWN)?.count || 0;
  const recoverySessionStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.RECOVERY_SESSION_STARTED)?.count || 0;
  const recoverySessionCompletedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.RECOVERY_SESSION_COMPLETED)?.count || 0;
  const interviewStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_STARTED)?.count || 0;
  const interviewRecordingStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_RECORDING_STARTED)?.count || 0;
  const interviewResponseCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED)?.count || 0;
  const followUpShownCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SHOWN)?.count || 0;
  const followUpCompletedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED)?.count || 0;
  const interviewCompletedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_SESSION_COMPLETED)?.count || 0;
  const interviewExitedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_SESSION_EXITED)?.count || 0;
  const homeRevenueRuntimeExposedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED)?.count || 0;
  const reviewRevenueRuntimeExposedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED)?.count || 0;
  const experimentVariantFallbackAppliedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED)?.count || 0;
  const last24hCutoffMs = Date.now() - (24 * 60 * 60 * 1000);
  const countEventsInLast24h = (eventName) => analyticsDebugEvents.filter((event) => {
    if (event?.eventName !== eventName) return false;
    const createdAtMs = Date.parse(String(event?.createdAtIso || '').trim());
    return Number.isFinite(createdAtMs) && createdAtMs >= last24hCutoffMs;
  }).length;
  const getLastSeenTimestampByEventName = (eventName) => {
    let latestMs = 0;
    analyticsDebugEvents.forEach((event) => {
      if (event?.eventName !== eventName) return;
      const createdAtMs = Date.parse(String(event?.createdAtIso || '').trim());
      if (Number.isFinite(createdAtMs) && createdAtMs > latestMs) latestMs = createdAtMs;
    });
    return latestMs > 0 ? new Date(latestMs).toLocaleString() : 'never';
  };
  const getLastSeenAgeLabelByEventName = (eventName) => {
    let latestMs = 0;
    analyticsDebugEvents.forEach((event) => {
      if (event?.eventName !== eventName) return;
      const createdAtMs = Date.parse(String(event?.createdAtIso || '').trim());
      if (Number.isFinite(createdAtMs) && createdAtMs > latestMs) latestMs = createdAtMs;
    });
    if (latestMs <= 0) return 'never';

    const elapsedMs = Math.max(0, Date.now() - latestMs);
    const elapsedHours = Math.floor(elapsedMs / (60 * 60 * 1000));
    if (elapsedHours < 1) return '<1h ago';
    if (elapsedHours < 24) return `${elapsedHours}h ago`;

    const elapsedDays = Math.floor(elapsedHours / 24);
    const remainingHours = elapsedHours % 24;
    return remainingHours > 0 ? `${elapsedDays}d ${remainingHours}h ago` : `${elapsedDays}d ago`;
  };
  const homeRevenueRuntimeExposedLast24hCount = countEventsInLast24h(APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED);
  const reviewRevenueRuntimeExposedLast24hCount = countEventsInLast24h(APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED);
  const experimentVariantFallbackAppliedLast24hCount = countEventsInLast24h(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED);
  const homeRevenueRuntimeLastSeen = getLastSeenTimestampByEventName(APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED);
  const reviewRevenueRuntimeLastSeen = getLastSeenTimestampByEventName(APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED);
  const experimentVariantFallbackLastSeen = getLastSeenTimestampByEventName(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED);
  const homeRevenueRuntimeLastSeenAge = getLastSeenAgeLabelByEventName(APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED);
  const reviewRevenueRuntimeLastSeenAge = getLastSeenAgeLabelByEventName(APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED);
  const experimentVariantFallbackLastSeenAge = getLastSeenAgeLabelByEventName(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED);
  const homeRuntimeExposureStale = homeRevenueRuntimeExposedLast24hCount === 0 && homeRevenueRuntimeExposedCount > 0;
  const reviewRuntimeExposureStale = reviewRevenueRuntimeExposedLast24hCount === 0 && reviewRevenueRuntimeExposedCount > 0;
  const variantFallbackStale = experimentVariantFallbackAppliedLast24hCount === 0 && experimentVariantFallbackAppliedCount > 0;
  const staleInstrumentationCount = [homeRuntimeExposureStale, reviewRuntimeExposureStale, variantFallbackStale].filter(Boolean).length;
  const hasStaleInstrumentation = staleInstrumentationCount > 0;
  const staleInstrumentationLabels = [
    homeRuntimeExposureStale ? 'homeRuntime' : null,
    reviewRuntimeExposureStale ? 'reviewRuntime' : null,
    variantFallbackStale ? 'fallback' : null,
  ].filter(Boolean).join(', ');
  const staleDiagnosticsRows = [
    homeRuntimeExposureStale
      ? { key: 'homeRuntime', lastSeen: homeRevenueRuntimeLastSeen, coldDuration: homeRevenueRuntimeLastSeenAge }
      : null,
    reviewRuntimeExposureStale
      ? { key: 'reviewRuntime', lastSeen: reviewRevenueRuntimeLastSeen, coldDuration: reviewRevenueRuntimeLastSeenAge }
      : null,
    variantFallbackStale
      ? { key: 'fallback', lastSeen: experimentVariantFallbackLastSeen, coldDuration: experimentVariantFallbackLastSeenAge }
      : null,
  ].filter(Boolean);
  const quizAnswerRate = quizStartedCount ? Math.round((questionAnsweredCount / quizStartedCount) * 100) : 0;
  const interviewResponseRate = interviewStartedCount ? Math.round((interviewResponseCount / interviewStartedCount) * 100) : 0;
  const interviewRecordingStartRate = interviewStartedCount ? Math.round((interviewRecordingStartedCount / interviewStartedCount) * 100) : 0;
  const interviewCompletionRate = interviewStartedCount ? Math.round((interviewCompletedCount / interviewStartedCount) * 100) : 0;
  const listenUsageRate = listenCtaCount ? Math.round((quizTtsPlayedCount / listenCtaCount) * 100) : 0;
  const listenRepeatRate = quizTtsPlayedCount ? Math.round((quizTtsRepeatedCount / quizTtsPlayedCount) * 100) : 0;
  const listenSpeedChangeRate = quizTtsPlayedCount ? Math.round((quizTtsSpeedChangedCount / quizTtsPlayedCount) * 100) : 0;
  const listenAutoAdvanceRate = quizTtsPlayedCount ? Math.round((quizListenAutoAdvancedCount / quizTtsPlayedCount) * 100) : 0;
  const focusToggleRate = quizStartedCount ? Math.round((quizFocusModeToggledCount / quizStartedCount) * 100) : 0;
  const stepGoalRate = questionAnsweredCount ? Math.round((quizStepGoalReachedCount / questionAnsweredCount) * 100) : 0;
  const breakNudgeRate = questionAnsweredCount ? Math.round((quizBreakNudgeShownCount / questionAnsweredCount) * 100) : 0;
  const recoveryCompletionRate = recoverySessionStartedCount
    ? Math.round((recoverySessionCompletedCount / recoverySessionStartedCount) * 100)
    : 0;
  const segmentTransitionEvents = analyticsDebugEvents.filter((event) => event.eventName === APP_EVENT_NAMES.SEGMENT_TRANSITION);
  const offerCapDecisionEvents = analyticsDebugEvents.filter((event) => event.eventName === APP_EVENT_NAMES.OFFER_CAP_DECISION);
  const latestSegmentTransitionEvent = segmentTransitionEvents[0] || null;
  const latestOfferCapDecisionEvent = offerCapDecisionEvents[0] || null;
  const trendDayKeys = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    return day.toISOString().slice(0, 10);
  });
  const analyticsTrendRowsByDay = trendDayKeys.reduce((acc, dayKey) => {
    acc[dayKey] = {
      dayKey,
      segmentTransitionEvents: 0,
      segmentChangedMembers: 0,
      offerCapAllowed: 0,
      offerCapBlocked: 0,
    };
    return acc;
  }, {});

  segmentTransitionEvents.forEach((event) => {
    const iso = String(event?.createdAtIso || '').trim();
    const dayKey = iso ? iso.slice(0, 10) : null;
    if (!dayKey || !analyticsTrendRowsByDay[dayKey]) return;
    analyticsTrendRowsByDay[dayKey].segmentTransitionEvents += 1;
    analyticsTrendRowsByDay[dayKey].segmentChangedMembers += Number(event?.params?.changed_count || 0);
  });

  offerCapDecisionEvents.forEach((event) => {
    const iso = String(event?.createdAtIso || '').trim();
    const dayKey = iso ? iso.slice(0, 10) : null;
    if (!dayKey || !analyticsTrendRowsByDay[dayKey]) return;
    const decision = String(event?.params?.decision || '').trim().toLowerCase();
    if (decision === 'allowed') analyticsTrendRowsByDay[dayKey].offerCapAllowed += 1;
    else analyticsTrendRowsByDay[dayKey].offerCapBlocked += 1;
  });

  const analyticsTrendRows = trendDayKeys.map((dayKey) => analyticsTrendRowsByDay[dayKey]);
  const recentAnalyticsEvents = analyticsDebugEvents.slice(0, 8);
  const moderationState = squadSync?.moderation || {};
  const moderationRateBucketCount = Object.keys(moderationState.rateBuckets || {}).length;
  const moderationActiveMuteEntries = Object.entries(moderationState.mutedActors || {}).filter(([, value]) => Number(value?.untilMs || 0) > Date.now());
  const moderationEscalationCount = Object.keys(moderationState.escalationByActor || {}).length;
  const moderationAuditCount = Array.isArray(moderationState.auditTrail) ? moderationState.auditTrail.length : 0;
  const moderationAuditRows = (Array.isArray(moderationState.auditTrail) ? moderationState.auditTrail : [])
    .slice()
    .sort((a, b) => {
      const left = Date.parse(a?.at || '') || 0;
      const right = Date.parse(b?.at || '') || 0;
      return right - left;
    })
    .slice(0, 10);
  const seasonState = squadSync?.season || {};
  const seasonLeaderboard = Array.isArray(seasonState.leaderboard) ? seasonState.leaderboard : [];
  const seasonTopRows = seasonLeaderboard.slice(0, 10);
  const seasonSegmentRows = seasonLeaderboard
    .map((entry) => {
      const segment = String(entry?.intentSegment || '').trim().toLowerCase() || 'unknown';
      const normalizedSegment = segment === 'high-intent' || segment === 'warming' || segment === 'low-intent'
        ? segment
        : 'unknown';
      const score = Number(entry?.intentScore || 0);
      const signals = entry?.intentSignals && typeof entry.intentSignals === 'object'
        ? entry.intentSignals
        : {};
      return {
        id: String(entry?.id || entry?.name || `member-${Math.random()}`),
        name: String(entry?.name || entry?.id || 'Member'),
        segment: normalizedSegment,
        score,
        signals: {
          activity: Number(signals?.activity || 0),
          quality: Number(signals?.quality || 0),
          progression: Number(signals?.progression || 0),
        },
      };
    });
  const seasonSegmentCounts = seasonSegmentRows.reduce((acc, row) => {
    acc.total += 1;
    acc[row.segment] = Number(acc[row.segment] || 0) + 1;
    return acc;
  }, {
    total: 0,
    'high-intent': 0,
    warming: 0,
    'low-intent': 0,
    unknown: 0,
  });
  const seasonSegmentPreview = seasonSegmentRows
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const computedTransitionMap = seasonLeaderboard.reduce((acc, entry) => {
    const previousSegment = String(entry?.previousIntentSegment || entry?.intentSegment || 'unknown').trim().toLowerCase();
    const currentSegment = String(entry?.intentSegment || 'unknown').trim().toLowerCase();
    const normalizedPrevious = previousSegment === 'high-intent' || previousSegment === 'warming' || previousSegment === 'low-intent'
      ? previousSegment
      : 'unknown';
    const normalizedCurrent = currentSegment === 'high-intent' || currentSegment === 'warming' || currentSegment === 'low-intent'
      ? currentSegment
      : 'unknown';
    const key = `${normalizedPrevious}->${normalizedCurrent}`;
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});
  const seasonTransitionSummary = seasonState?.intentTransitionSummary && typeof seasonState.intentTransitionSummary === 'object'
    ? seasonState.intentTransitionSummary
    : {
        totals: {
          changed: seasonLeaderboard.filter((entry) => String(entry?.previousIntentSegment || entry?.intentSegment || '').trim().toLowerCase() !== String(entry?.intentSegment || '').trim().toLowerCase()).length,
          unchanged: seasonLeaderboard.filter((entry) => String(entry?.previousIntentSegment || entry?.intentSegment || '').trim().toLowerCase() === String(entry?.intentSegment || '').trim().toLowerCase()).length,
          entries: seasonLeaderboard.length,
        },
        transitions: computedTransitionMap,
      };
  const seasonTransitionRows = Object.entries(seasonTransitionSummary?.transitions || {})
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, 8);
  const seasonRawLeader = seasonLeaderboard
    .slice()
    .sort((a, b) => {
      const left = Number(a?.rawScore ?? a?.score ?? 0);
      const right = Number(b?.rawScore ?? b?.score ?? 0);
      if (right !== left) return right - left;
      return String(a?.name || a?.id || '').localeCompare(String(b?.name || b?.id || ''));
    })[0] || null;
  const seasonWeightedLeader = seasonLeaderboard[0] || null;
  const seasonDeltaRows = seasonLeaderboard
    .map((entry) => {
      const weighting = entry?.fairPlayWeighting && typeof entry.fairPlayWeighting === 'object'
        ? entry.fairPlayWeighting
        : null;
      const rawScore = Number(weighting?.rawScore ?? entry?.rawScore ?? entry?.score ?? 0);
      const weightedScore = Number(weighting?.weightedScore ?? entry?.weightedScore ?? entry?.score ?? 0);
      const rank = Number(entry?.rank || 0);
      const rawRank = Number(entry?.rawRank || rank || 0);
      const rankDelta = Number(entry?.rankDelta ?? (rawRank - rank));
      const fairPlayDelta = Number(weighting?.delta ?? entry?.fairPlayDelta ?? (weightedScore - rawScore));
      const fairPlayDeltaPct = Number(
        weighting?.deltaPct
        ?? entry?.fairPlayDeltaPct
        ?? (rawScore > 0 ? ((fairPlayDelta / rawScore) * 100) : 0),
      );
      const qualitySignals = entry?.qualitySignals && typeof entry.qualitySignals === 'object'
        ? entry.qualitySignals
        : (weighting?.qualitySignals && typeof weighting.qualitySignals === 'object' ? weighting.qualitySignals : {});
      return {
        id: String(entry?.id || entry?.name || `member-${rank}`),
        name: String(entry?.name || entry?.id || 'Member'),
        rawScore,
        weightedScore,
        fairPlayDelta,
        fairPlayDeltaPct,
        rank,
        rawRank,
        rankDelta,
        fairPlayMultiplier: Number((weighting?.multiplier ?? entry?.fairPlayMultiplier) || 1),
        qualitySignals: {
          accuracy: Number(qualitySignals?.accuracy || 0),
          completion: Number(qualitySignals?.completion || 0),
          consistency: Number(qualitySignals?.consistency || 0),
        },
      };
    })
    .sort((a, b) => {
      const deltaGap = Math.abs(b.fairPlayDelta) - Math.abs(a.fairPlayDelta);
      if (deltaGap !== 0) return deltaGap;
      const rankGap = Math.abs(b.rankDelta) - Math.abs(a.rankDelta);
      if (rankGap !== 0) return rankGap;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);
  const seasonTierSummary = seasonState?.tierSummary && typeof seasonState.tierSummary === 'object'
    ? seasonState.tierSummary
    : { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  const seasonEndsMs = Date.parse(seasonState?.endsAt || '');
  const seasonStartsMs = Date.parse(seasonState?.startsAt || '');
  const seasonRemainingMs = Number.isFinite(seasonEndsMs) ? Math.max(0, seasonEndsMs - Date.now()) : 0;
  const seasonRemainingDays = Math.floor(seasonRemainingMs / (24 * 60 * 60 * 1000));
  const seasonRemainingHours = Math.floor((seasonRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const seasonWindowLabel = Number.isFinite(seasonStartsMs) && Number.isFinite(seasonEndsMs)
    ? `${new Date(seasonStartsMs).toLocaleDateString()} - ${new Date(seasonEndsMs).toLocaleDateString()}`
    : 'N/A';

  const analytics = adRuntime.analytics || {};
  const offerVariantStats = adRuntime.offerVariantStats || {};
  const autoOfferWinners = adRuntime.autoOfferWinners || {};
  const revenueExperiment = adRuntime?.experimentCohorts?.revenueIntelligence || {};
  const revenueOverrideCohort = String(revenueExperiment?.overrideCohort || '').trim().toLowerCase();
  const cohortOverrideValue = revenueOverrideCohort === 'holdout' || revenueOverrideCohort === 'treatment'
    ? revenueOverrideCohort
    : AUTO_VARIANT_VALUE;
  const revenueCohort = (revenueOverrideCohort === 'treatment' || revenueOverrideCohort === 'holdout')
    ? revenueOverrideCohort
    : String(revenueExperiment?.cohort || 'unassigned');
  const cohortAssignmentSource = revenueOverrideCohort
    ? `override:${revenueOverrideCohort}`
    : 'seeded';
  const cohortSeed = String(revenueExperiment?.seed || '').trim() || 'n/a';
  const cohortAssignedAt = String(revenueExperiment?.assignedAt || '').trim();
  const cohortAssignedAtLabel = cohortAssignedAt ? new Date(cohortAssignedAt).toLocaleString() : 'n/a';
  const treatmentEnabled = revenueCohort !== 'holdout';
  const effectiveSegment = treatmentEnabled ? 'high-intent/segment-driven' : 'warming/baseline';
  const effectiveRewardedDailyMult = treatmentEnabled ? 1.25 : 1;
  const effectiveRewardedCooldownMult = treatmentEnabled ? 0.75 : 1;
  const effectiveInterstitialDailyMult = treatmentEnabled ? 1.25 : 1;
  const effectiveInterstitialCooldownMult = treatmentEnabled ? 0.75 : 1;
  const comebackCampaign = adRuntime?.comebackCampaign || {};
  const comebackWindows = comebackCampaign?.windows && typeof comebackCampaign.windows === 'object'
    ? comebackCampaign.windows
    : {};
  const comebackEligibleWindow = String(comebackCampaign?.eligibleWindow || '').trim() || 'none';
  const comebackWindowRows = ['d2', 'd5', 'd10'].map((key) => {
    const window = comebackWindows?.[key] || {};
    return {
      key,
      dayOffset: Number(window?.dayOffset || 0),
      eligible: Boolean(window?.eligible),
      shownCount: Number(window?.shownCount || 0),
      claimedCount: Number(window?.claimedCount || 0),
      lastEligibleDayKey: window?.lastEligibleDayKey || 'N/A',
      lastTriggeredAt: window?.lastTriggeredAt || null,
    };
  });
  const interstitialShown = analytics.interstitialShown || 0;
  const rewardedCompleted = analytics.rewardedCompleted || 0;

  const interstitialEcpmValue = Math.max(0, Number.parseFloat(interstitialEcpm) || 0);
  const rewardedEcpmValue = Math.max(0, Number.parseFloat(rewardedEcpm) || 0);
  const estimatedInterstitialRevenue = (interstitialShown / 1000) * interstitialEcpmValue;
  const estimatedRewardedRevenue = (rewardedCompleted / 1000) * rewardedEcpmValue;
  const estimatedDailyRevenue = estimatedInterstitialRevenue + estimatedRewardedRevenue;
  const trendDays = buildSevenDayRevenueTrend(adRuntime.history, interstitialEcpmValue, rewardedEcpmValue);
  const maxTrendRevenue = Math.max(...trendDays.map((day) => day.revenue), 0.01);
  const lowMultiplier = 0.75;
  const highMultiplier = 1.25;
  const dailyLow = estimatedDailyRevenue * lowMultiplier;
  const dailyHigh = estimatedDailyRevenue * highMultiplier;
  const monthlyBase = estimatedDailyRevenue * 30;
  const monthlyLow = dailyLow * 30;
  const monthlyHigh = dailyHigh * 30;
  const rewardedCompletionRate = analytics.rewardedAttempts
    ? Math.round((rewardedCompleted / analytics.rewardedAttempts) * 100)
    : 0;
  const rewardedPlacementRows = [
    {
      key: 'sprint',
      label: 'Home Sprint',
      attempts: analytics.rewardedHomeSprintAttempts || 0,
      completions: analytics.rewardedSprintUnlocks || 0,
    },
    {
      key: 'bonus',
      label: 'Review Bonus Drill',
      attempts: analytics.rewardedReviewBonusAttempts || 0,
      completions: analytics.rewardedBonusUnlocks || 0,
    },
    {
      key: 'weak',
      label: 'Review Weak-Area Rescue',
      attempts: analytics.rewardedReviewWeakAttempts || 0,
      completions: analytics.rewardedReviewWeakUnlocks || 0,
    },
    {
      key: 'freepack',
      label: 'Daily Free Pack',
      attempts: analytics.rewardedFreePackAttempts || 0,
      completions: analytics.rewardedFreePackUnlocked || 0,
    },
  ].map((row) => ({
    ...row,
    conversionRate: row.attempts ? Math.round((row.completions / row.attempts) * 100) : 0,
    estimatedRevenue: (row.completions / 1000) * rewardedEcpmValue,
  }));
  const offerVariantRows = useMemo(() => OFFER_VARIANT_GROUPS.map((group) => {
    const variantStats = offerVariantStats[group.key] || {};
    const names = Object.keys(variantStats);
    const totals = names.reduce((acc, variantName) => {
      const variant = variantStats[variantName] || { attempts: 0, completions: 0 };
      return {
        attempts: acc.attempts + (variant.attempts || 0),
        completions: acc.completions + (variant.completions || 0),
      };
    }, { attempts: 0, completions: 0 });
    const rankedVariants = names
      .map((variantName) => {
        const variant = variantStats[variantName] || { attempts: 0, completions: 0 };
        const conversionRate = variant.attempts ? Math.round((variant.completions / variant.attempts) * 100) : 0;
        const conversionRateRaw = variant.attempts ? (variant.completions / variant.attempts) : 0;
        return {
          variantName,
          attempts: variant.attempts || 0,
          completions: variant.completions || 0,
          conversionRate,
          conversionRateRaw,
        };
      })
      .sort((a, b) => {
        if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate;
        return b.attempts - a.attempts;
      });

    const baselineVariant = rankedVariants.find((variant) => variant.variantName === 'control') || rankedVariants[1] || null;
    const leader = rankedVariants[0] || null;
    const cvrDeltaRaw = leader && baselineVariant
      ? leader.conversionRateRaw - baselineVariant.conversionRateRaw
      : 0;
    const cvrDeltaPctPoints = cvrDeltaRaw * 100;
    const revenueLiftPer100Attempts = cvrDeltaRaw > 0
      ? cvrDeltaRaw * rewardedEcpmValue * 0.1
      : 0;
    const revenueLiftAtObservedAttempts = cvrDeltaRaw > 0
      ? (cvrDeltaRaw * totals.attempts * rewardedEcpmValue) / 1000
      : 0;
    const relativeLiftPct = baselineVariant && baselineVariant.conversionRateRaw > 0
      ? Math.round((cvrDeltaRaw / baselineVariant.conversionRateRaw) * 100)
      : 0;
    const minAttemptsPerVariantForConfidence = 12;
    const highConfidenceSuggestion = Boolean(
      leader
      && baselineVariant
      && cvrDeltaPctPoints >= 5
      && cvrDeltaRaw > 0
      && (leader.attempts || 0) >= minAttemptsPerVariantForConfidence
      && (baselineVariant.attempts || 0) >= minAttemptsPerVariantForConfidence
    );

    return {
      ...group,
      variantStats,
      variantOptions: Array.isArray(group.variants) ? group.variants : [],
      names,
      totals,
      leader,
      runnerUp: rankedVariants[1] || null,
      baselineVariant,
      cvrDeltaPctPoints,
      relativeLiftPct,
      revenueLiftPer100Attempts,
      revenueLiftAtObservedAttempts,
      highConfidenceSuggestion,
      pinnedVariantName: adRuntime.pinnedOfferVariants?.[group.key] || null,
      autoWinner: autoOfferWinners?.[group.key] && typeof autoOfferWinners[group.key] === 'object'
        ? autoOfferWinners[group.key]
        : null,
    };
  }), [offerVariantStats, autoOfferWinners, adRuntime.pinnedOfferVariants, rewardedEcpmValue]);
  const homeSprintAttemptCount = analytics.rewardedHomeSprintAttempts || 0;
  const homeSprintAttemptProgress = Math.min(30, homeSprintAttemptCount);
  const homeSprintAttemptPct = Math.round((homeSprintAttemptProgress / 30) * 100);
  const activeHomeSprintOfferVariant = getOfferVariant('homeSprintOffer');
  const activeHomeSprintRewardVariant = getOfferVariant('homeSprintReward');
  const activeReviewBonusVariant = getOfferVariant('reviewBonusOffer');
  const activeReviewWeakVariant = getOfferVariant('reviewWeakOffer');
  const homeSprintRewardGroup = offerVariantRows.find((group) => group.key === 'homeSprintReward');
  const rewardWinnerReady = Boolean(
    homeSprintRewardGroup?.leader
    && homeSprintRewardGroup?.runnerUp
    && homeSprintRewardGroup.totals.attempts >= 15
    && homeSprintRewardGroup.cvrDeltaPctPoints >= 5
    && homeSprintRewardGroup.highConfidenceSuggestion
  );

  const runRevenueRuntimeSelfCheck = () => {
    const snapshot = [
      `Path: ${treatmentEnabled ? 'treatment' : 'holdout-baseline'} (cohort=${revenueCohort})`,
      `Assignment source: ${cohortAssignmentSource} • seed=${cohortSeed} • assignedAt=${cohortAssignedAt || 'n/a'}`,
      `Offer variant path: homeSprintOffer=${treatmentEnabled ? 'dynamic (pinned/auto/balanced)' : 'control baseline'}, homeSprintReward=${treatmentEnabled ? 'dynamic (pinned/auto/balanced)' : 'standard baseline'}`,
      `Active variants now: homeSprintOffer=${activeHomeSprintOfferVariant}, homeSprintReward=${activeHomeSprintRewardVariant}, reviewBonusOffer=${activeReviewBonusVariant}, reviewWeakOffer=${activeReviewWeakVariant}`,
      `Cap policy path: segment=${effectiveSegment}, rewardedDailyMult=${effectiveRewardedDailyMult}, rewardedCooldownMult=${effectiveRewardedCooldownMult}, interstitialDailyMult=${effectiveInterstitialDailyMult}, interstitialCooldownMult=${effectiveInterstitialCooldownMult}`,
      `Comeback path: eligibleWindow=${comebackEligibleWindow || 'none'}, CTA=${treatmentEnabled ? 'enabled when eligible' : 'disabled for holdout'}`,
    ].join('\n');

    setRuntimeSelfCheckSummary(snapshot);
  };

  const copyRevenueRuntimeSelfCheck = async () => {
    const summary = String(runtimeSelfCheckSummary || '').trim();
    if (!summary || summary.startsWith('Tap "Run Self-Check"')) {
      runRevenueRuntimeSelfCheck();
      setCopyFeedback({
        type: 'info',
        text: 'Self-check updated. Tap Copy Summary again to copy the latest snapshot.',
      });
      return;
    }

    try {
      await Clipboard.setStringAsync(summary);
      setCopyFeedback({ type: 'success', text: 'Copied to clipboard.' });
    } catch (error) {
      setCopyFeedback({ type: 'error', text: 'Copy failed on this device.' });
    }
  };

  const copyStaleDiagnosticsSummary = async () => {
    if (!hasStaleInstrumentation || staleDiagnosticsRows.length === 0) {
      setStaleCopyFeedback({ type: 'info', text: 'No stale counters right now.' });
      return;
    }

    const summary = [
      'Batch 1 Stale Diagnostics',
      `Captured: ${new Date().toLocaleString()}`,
      `Stale counters: ${staleInstrumentationLabels}`,
      ...staleDiagnosticsRows.map((row) => `${row.key} | lastSeen=${row.lastSeen} | coldDuration=${row.coldDuration}`),
    ].join('\n');

    try {
      await Clipboard.setStringAsync(summary);
      setStaleCopyFeedback({ type: 'success', text: 'Stale diagnostics copied.' });
    } catch (error) {
      setStaleCopyFeedback({ type: 'error', text: 'Copy failed on this device.' });
    }
  };

  useEffect(() => {
    const office = DYNAMIC_CIVICS_DATA.stateOfficeholders[stateName] || {};
    setGovernor(office.governor || '');
    setSenatorOne((office.senators && office.senators[0]) || '');
    setSenatorTwo((office.senators && office.senators[1]) || '');
    setCapitalValue(STATE_CAPITALS[stateName] || '');
  }, [stateName]);

  const loadAnalyticsDebugEvents = async () => {
    setAnalyticsDebugLoading(true);
    setAnalyticsDebugError('');

    try {
      const events = await fetchRecentAnalyticsDebugEvents(120);
      setAnalyticsDebugEvents(events);
    } catch (error) {
      setAnalyticsDebugError(error?.message || 'Failed to load analytics debug events.');
    } finally {
      setAnalyticsDebugLoading(false);
    }
  };

  const loadRecoveryMetrics = async () => {
    setRecoveryMetricsLoading(true);
    try {
      const quizType = testDetails?.testType || 'naturalization128';
      const key = `${RECOVERY_CAMPAIGN_STORAGE_PREFIX}.${String(quizType)}`;
      const raw = await AsyncStorage.getItem(key);
      if (!raw) {
        setRecoveryMetrics({
          completedSessions: 0,
          lastTopic: null,
          updatedAt: null,
          stepTimestamps: { 1: null, 2: null, 3: null },
        });
        return;
      }

      const parsed = JSON.parse(raw);
      setRecoveryMetrics({
        completedSessions: Math.max(0, Number(parsed?.completedSessions || 0)),
        lastTopic: parsed?.lastTopic || null,
        updatedAt: parsed?.updatedAt || null,
        stepTimestamps: {
          1: parsed?.stepTimestamps?.[1] || null,
          2: parsed?.stepTimestamps?.[2] || null,
          3: parsed?.stepTimestamps?.[3] || null,
        },
      });
    } catch (error) {
      console.log('Failed to load recovery metrics', error);
    } finally {
      setRecoveryMetricsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalyticsDebugEvents();
  }, []);

  useEffect(() => {
    void loadRecoveryMetrics();
  }, [testDetails?.testType]);

  const formatRecoveryTimestamp = (value) => (value ? new Date(value).toLocaleString() : 'Pending');

  const saveFederalOfficials = () => {
    if (!president.trim() || !vicePresident.trim() || !speakerOfHouse.trim() || !chiefJustice.trim()) {
      Alert.alert('Error', 'Please fill all federal official fields.');
      return;
    }

    setDynamicFederalAnswers({
      president: president.trim(),
      vicePresident: vicePresident.trim(),
      speakerOfHouse: speakerOfHouse.trim(),
      chiefJustice: chiefJustice.trim(),
    });

    Alert.alert('Saved', 'Federal officials updated successfully.');
  };

  const saveStateOfficials = () => {
    if (!stateName || !governor.trim() || !senatorOne.trim() || !senatorTwo.trim() || !capital.trim()) {
      Alert.alert('Error', 'Please fill state, governor, two senators, and capital.');
      return;
    }

    setStateOfficeholders(stateName, {
      governor: governor.trim(),
      senators: [senatorOne.trim(), senatorTwo.trim()],
    });
    setStateCapital(stateName, capital.trim());

    Alert.alert('Saved', `Updated ${stateName} officials and capital.`);
  };

  const confirmResetOfferVariantStats = () => {
    Alert.alert(
      'Reset Rewarded Offer Tests',
      'This clears rewarded offer-test stats (copy + reward) and returns all rewarded placements to auto rotation. Other ad analytics stay intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetOfferVariantStats,
        },
      ],
    );
  };

  const pinRewardWinnerFirst = () => {
    if (!homeSprintRewardGroup?.leader) {
      Alert.alert('No Winner Yet', 'Run more Home Sprint unlocks to collect reward test traffic.');
      return;
    }

    setPinnedOfferVariant('homeSprintReward', homeSprintRewardGroup.leader.variantName);
    Alert.alert('Pinned', `Pinned reward winner: ${VARIANT_LABELS[homeSprintRewardGroup.leader.variantName] || homeSprintRewardGroup.leader.variantName}`);
  };

  const sendAnalyticsTestEvent = async () => {
    trackAppEvent(APP_EVENT_NAMES.ADMIN_DEBUG_PING, {
      source_screen: 'AdminTab',
      verification_ping: true,
    });

    setTimeout(() => {
      void loadAnalyticsDebugEvents();
    }, 800);

    Alert.alert('Sent', 'Analytics verification event sent. Refresh if it does not appear immediately.');
  };

  const sendListenValidationEvents = async () => {
    const quizType = testDetails?.testType || 'naturalization128';

    trackAppEvent(APP_EVENT_NAMES.HOME_LISTEN_CTA_CLICKED, {
      source_screen: 'AdminTab',
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_TTS_PLAYED, {
      quiz_type: quizType,
      question_id: 'synthetic_q1',
      question_index: 0,
      total_questions: 3,
      rate: 1.0,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_TTS_REPEATED, {
      quiz_type: quizType,
      question_id: 'synthetic_q1',
      question_index: 0,
      total_questions: 3,
      rate: 1.0,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_TTS_SPEED_CHANGED, {
      quiz_type: quizType,
      question_id: 'synthetic_q1',
      question_index: 0,
      total_questions: 3,
      from_rate: 1.0,
      to_rate: 1.25,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_LISTEN_AUTO_ADVANCED, {
      quiz_type: quizType,
      question_id: 'synthetic_q1',
      question_index: 0,
      total_questions: 3,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_FOCUS_MODE_TOGGLED, {
      quiz_type: quizType,
      low_clutter_mode: true,
      question_index: 1,
      total_questions: 3,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_STEP_GOAL_REACHED, {
      quiz_type: quizType,
      answered_count: 3,
      total_questions: 3,
      step_size: 3,
      synthetic_validation: true,
    });

    trackAppEvent(APP_EVENT_NAMES.QUIZ_BREAK_NUDGE_SHOWN, {
      quiz_type: quizType,
      answered_count: 6,
      total_questions: 12,
      break_step: 6,
      synthetic_validation: true,
    });

    setTimeout(() => {
      void loadAnalyticsDebugEvents();
    }, 800);

    Alert.alert('Sent', 'Synthetic Listen-mode validation events sent. Refresh if needed.');
  };

  const sendSegmentationValidationEvents = async () => {
    trackAppEvent(APP_EVENT_NAMES.SEGMENT_TRANSITION, {
      season_id: String(seasonState?.seasonId || 'season-validation'),
      week_key: String(seasonState?.weekKey || 'validation-week'),
      entries: Number(seasonLeaderboard.length || 4),
      changed_count: 2,
      unchanged_count: Math.max(0, Number(seasonLeaderboard.length || 4) - 2),
      transition_types: 2,
      top_transition: 'warming->high-intent',
      top_transition_count: 1,
      synthetic_validation: true,
      source_screen: 'AdminTab',
    });

    trackAppEvent(APP_EVENT_NAMES.OFFER_CAP_DECISION, {
      channel: 'interstitial',
      trigger: 'quizComplete',
      decision: 'blocked',
      reason: 'cooldown',
      segment: 'low-intent',
      cooldown_ms: 300000,
      daily_limit: 6,
      trigger_limit: 3,
      policy_interstitial_daily_mult: 0.75,
      policy_interstitial_cooldown_mult: 1.5,
      policy_rewarded_daily_mult: 0.75,
      policy_rewarded_cooldown_mult: 1.5,
      synthetic_validation: true,
      source_screen: 'AdminTab',
    });

    trackAppEvent(APP_EVENT_NAMES.OFFER_CAP_DECISION, {
      channel: 'rewarded_free_pack',
      trigger: 'daily_unlock',
      decision: 'allowed',
      reason: 'shown',
      segment: 'high-intent',
      cooldown_ms: 2700000,
      daily_limit: 2,
      trigger_limit: 0,
      policy_interstitial_daily_mult: 1.25,
      policy_interstitial_cooldown_mult: 0.75,
      policy_rewarded_daily_mult: 1.25,
      policy_rewarded_cooldown_mult: 0.75,
      synthetic_validation: true,
      source_screen: 'AdminTab',
    });

    setTimeout(() => {
      void loadAnalyticsDebugEvents();
    }, 800);

    Alert.alert('Sent', 'Synthetic segmentation trend events sent. Refresh if needed.');
  };

  const formatModerationAuditTime = (value) => {
    const stamp = Date.parse(value || '');
    if (!Number.isFinite(stamp)) return 'pending';
    return new Date(stamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const refreshModerationFromServer = async () => {
    setModerationBusy(true);
    try {
      const result = await refreshSquadFromRemote();
      if (result?.ok) {
        Alert.alert('Moderation Synced', `Pulled latest squad moderation snapshot (revision ${result.revision || 0}).`);
      } else {
        Alert.alert('Sync Unavailable', 'No remote squad snapshot found yet.');
      }
    } catch (error) {
      Alert.alert('Sync Failed', error?.message || 'Unable to refresh moderation snapshot.');
    } finally {
      setModerationBusy(false);
    }
  };

  const runModerationAction = async (action) => {
    setModerationBusy(true);
    try {
      const actorId = String(moderationActorId || '').trim() || 'self';
      const result = await runModerationAdminAction(action, { actorId, adminActorId: 'self' });
      if (!result?.ok) {
        Alert.alert('Action Failed', result?.error || 'Moderation admin action did not complete.');
        return;
      }
      Alert.alert('Applied', `Admin moderation action complete: ${action}`);
    } catch (error) {
      Alert.alert('Action Failed', error?.message || 'Moderation admin action failed.');
    } finally {
      setModerationBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Admin: Update Officials</Text>
        <Text style={styles.pageSubtitle}>Last verified: {DYNAMIC_CIVICS_DATA.lastVerified}</Text>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Analytics Verification</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Primary sink: {verificationMode.usesFirebaseAnalytics ? 'Firebase Analytics (web)' : 'Firestore debug mirror'}</Text>
            <Text style={styles.analyticsLine}>Measurement ID configured: {verificationMode.measurementIdConfigured ? 'Yes' : 'No'}</Text>
            <Text style={styles.analyticsLine}>Debug collection: {verificationMode.debugCollection}</Text>
            <Text style={styles.revenueHint}>Use this panel to confirm live event flow in Expo/native builds.</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.button, styles.buttonSecondary, { flex: 1 }]} onPress={sendAnalyticsTestEvent}>
                <Text style={styles.buttonText}>Send Test Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSecondary, { flex: 1 }]} onPress={loadAnalyticsDebugEvents}>
                <Text style={styles.buttonText}>{analyticsDebugLoading ? 'Refreshing...' : 'Refresh Events'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={loadRecoveryMetrics}>
              <Text style={styles.buttonText}>{recoveryMetricsLoading ? 'Refreshing Recovery...' : 'Refresh Recovery Metrics'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={sendListenValidationEvents}>
              <Text style={styles.buttonText}>Send Listen Validation Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={sendSegmentationValidationEvents}>
              <Text style={styles.buttonText}>Send Segmentation Validation Events</Text>
            </TouchableOpacity>

            {analyticsDebugError ? (
              <Text style={[styles.adminMetricSubtext, { color: '#B91C1C', marginTop: 10 }]}>{analyticsDebugError}</Text>
            ) : null}

            <View style={{ marginTop: 12 }}>
              <Text style={styles.adminMetricLabel}>Revenue Runtime Instrumentation (Batch 1)</Text>
              <Text style={styles.adminMetricSubtext}>Reset window view: Last 24h vs All-time volumes from mirrored analytics events.</Text>
              <View style={{ marginTop: 8, marginBottom: 10 }}>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Home Runtime Exposed</Text>
                    <Text style={styles.adminMetricSubtext}>{APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED}</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>
                    <Text style={homeRuntimeExposureStale ? { color: '#B45309' } : null}>{homeRevenueRuntimeExposedLast24hCount}</Text>
                    {' / '}
                    <Text>{homeRevenueRuntimeExposedCount}</Text>
                  </Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Review Runtime Exposed</Text>
                    <Text style={styles.adminMetricSubtext}>{APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED}</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>
                    <Text style={reviewRuntimeExposureStale ? { color: '#B45309' } : null}>{reviewRevenueRuntimeExposedLast24hCount}</Text>
                    {' / '}
                    <Text>{reviewRevenueRuntimeExposedCount}</Text>
                  </Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Variant Fallback Applied</Text>
                    <Text style={styles.adminMetricSubtext}>{APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED}</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>
                    <Text style={variantFallbackStale ? { color: '#B45309' } : null}>{experimentVariantFallbackAppliedLast24hCount}</Text>
                    {' / '}
                    <Text>{experimentVariantFallbackAppliedCount}</Text>
                  </Text>
                </View>
              </View>
              <Text style={styles.adminMetricSubtext}>Format: Last 24h / All-time</Text>
              <Text style={[styles.adminMetricSubtext, hasStaleInstrumentation ? { color: '#B45309' } : { color: '#047857' }]}>
                Signal health: {hasStaleInstrumentation ? `stale (${staleInstrumentationCount}/3 counters)` : 'healthy (3/3 active within 24h)'}
              </Text>
              {hasStaleInstrumentation ? (
                <>
                  <Text style={[styles.adminMetricSubtext, { color: '#B45309' }]}>Stale counters: {staleInstrumentationLabels}</Text>
                  {homeRuntimeExposureStale ? (
                    <Text style={[styles.adminMetricSubtext, { color: '#B45309' }]}>Last seen homeRuntime: {homeRevenueRuntimeLastSeen} ({homeRevenueRuntimeLastSeenAge})</Text>
                  ) : null}
                  {reviewRuntimeExposureStale ? (
                    <Text style={[styles.adminMetricSubtext, { color: '#B45309' }]}>Last seen reviewRuntime: {reviewRevenueRuntimeLastSeen} ({reviewRevenueRuntimeLastSeenAge})</Text>
                  ) : null}
                  {variantFallbackStale ? (
                    <Text style={[styles.adminMetricSubtext, { color: '#B45309' }]}>Last seen fallback: {experimentVariantFallbackLastSeen} ({experimentVariantFallbackLastSeenAge})</Text>
                  ) : null}
                  <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 8 }]} onPress={copyStaleDiagnosticsSummary}>
                    <Text style={styles.buttonText}>Copy Stale Diagnostics</Text>
                  </TouchableOpacity>
                  {!!staleCopyFeedback.text && (
                    <Text style={[styles.adminMetricSubtext, staleCopyFeedback.type === 'error' ? { color: '#B91C1C' } : null]}>
                      {staleCopyFeedback.text}
                    </Text>
                  )}
                </>
              ) : null}

              <Text style={styles.adminMetricLabel}>Recent Funnel Snapshot</Text>
              <Text style={styles.adminMetricSubtext}>Based on the latest mirrored analytics events in Firestore.</Text>
              <View style={{ marginTop: 8, marginBottom: 10 }}>
                {analyticsFunnelRows.map((row) => (
                  <View key={row.key} style={styles.adminMetricRow}>
                    <View style={styles.adminMetricLabelBlock}>
                      <Text style={styles.adminMetricLabel}>{row.label}</Text>
                      <Text style={styles.adminMetricSubtext}>{row.key}</Text>
                    </View>
                    <Text style={styles.adminMetricValue}>{row.count}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.adminMetricLabel}>Conversion Snapshot</Text>
              <View style={{ marginTop: 8, marginBottom: 10 }}>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Quiz Answer Rate</Text>
                    <Text style={styles.adminMetricSubtext}>question_answered / quiz_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{quizAnswerRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Interview Response Rate</Text>
                    <Text style={styles.adminMetricSubtext}>interview_response_submitted / interview_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{interviewResponseRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Listen TTS Usage Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_tts_played / home_listen_cta_clicked</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{listenUsageRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Listen Repeat Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_tts_repeated / quiz_tts_played</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{listenRepeatRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Listen Speed Change Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_tts_speed_changed / quiz_tts_played</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{listenSpeedChangeRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Listen Auto-Advance Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_listen_auto_advanced / quiz_tts_played</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{listenAutoAdvanceRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Focus Toggle Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_focus_mode_toggled / quiz_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{focusToggleRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Step Goal Event Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_step_goal_reached / question_answered</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{stepGoalRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Break Nudge Event Rate</Text>
                    <Text style={styles.adminMetricSubtext}>quiz_break_nudge_shown / question_answered</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{breakNudgeRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Recovery Completion Rate</Text>
                    <Text style={styles.adminMetricSubtext}>recovery_session_completed / recovery_session_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{recoveryCompletionRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Interview Recording Start Rate</Text>
                    <Text style={styles.adminMetricSubtext}>interview_recording_started / interview_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{interviewRecordingStartRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Interview Completion Rate</Text>
                    <Text style={styles.adminMetricSubtext}>interview_session_completed / interview_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{interviewCompletionRate}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Interview Exit Rate</Text>
                    <Text style={styles.adminMetricSubtext}>interview_session_exited / interview_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{interviewStartedCount ? Math.round((interviewExitedCount / interviewStartedCount) * 100) : 0}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Follow-Up Frequency</Text>
                    <Text style={styles.adminMetricSubtext}>interview_followup_shown / interview_started</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{interviewStartedCount ? Math.round((followUpShownCount / interviewStartedCount) * 100) : 0}%</Text>
                </View>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Follow-Up Completion Rate</Text>
                    <Text style={styles.adminMetricSubtext}>interview_followup_completed / interview_followup_shown</Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{followUpShownCount ? Math.round((followUpCompletedCount / followUpShownCount) * 100) : 0}%</Text>
                </View>
              </View>

              <Text style={styles.adminMetricLabel}>Segment + Offer-Cap Trend (Last 7 Days)</Text>
              <Text style={styles.adminMetricSubtext}>Shows `segment_transition` and `offer_cap_decision` events over time.</Text>
              <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 8, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                  <Text style={{ width: 90, fontSize: 11, fontWeight: '700', color: '#334155' }}>Day</Text>
                  <Text style={{ width: 54, fontSize: 11, fontWeight: '700', color: '#334155' }}>Seg Ev</Text>
                  <Text style={{ width: 62, fontSize: 11, fontWeight: '700', color: '#334155' }}>Members</Text>
                  <Text style={{ width: 58, fontSize: 11, fontWeight: '700', color: '#334155' }}>Allowed</Text>
                  <Text style={{ width: 58, fontSize: 11, fontWeight: '700', color: '#334155' }}>Blocked</Text>
                </View>

                {analyticsTrendRows.map((row) => (
                  <View key={row.dayKey} style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <Text style={{ width: 90, fontSize: 11, color: '#334155' }}>{row.dayKey}</Text>
                    <Text style={{ width: 54, fontSize: 11, color: '#0F172A' }}>{row.segmentTransitionEvents}</Text>
                    <Text style={{ width: 62, fontSize: 11, color: '#0F172A' }}>{row.segmentChangedMembers}</Text>
                    <Text style={{ width: 58, fontSize: 11, color: '#059669' }}>{row.offerCapAllowed}</Text>
                    <Text style={{ width: 58, fontSize: 11, color: '#B91C1C' }}>{row.offerCapBlocked}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.adminMetricLabel}>Latest Segmentation Payloads</Text>
              <Text style={styles.adminMetricSubtext}>Fast validation view for the newest transition and cap decision events.</Text>
              <View style={{ marginTop: 8, marginBottom: 10 }}>
                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Latest segment_transition</Text>
                    <Text style={styles.adminMetricSubtext}>
                      {latestSegmentTransitionEvent?.createdAtIso || 'No event yet'}
                    </Text>
                    <Text style={styles.adminMetricSubtext}>
                      {latestSegmentTransitionEvent
                        ? `changed=${Number(latestSegmentTransitionEvent?.params?.changed_count || 0)} | unchanged=${Number(latestSegmentTransitionEvent?.params?.unchanged_count || 0)} | top=${String(latestSegmentTransitionEvent?.params?.top_transition || 'n/a')}`
                        : 'Trigger a segmentation validation event to inspect the latest payload.'}
                    </Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{segmentTransitionEvents.length}</Text>
                </View>

                <View style={styles.adminMetricRow}>
                  <View style={styles.adminMetricLabelBlock}>
                    <Text style={styles.adminMetricLabel}>Latest offer_cap_decision</Text>
                    <Text style={styles.adminMetricSubtext}>
                      {latestOfferCapDecisionEvent?.createdAtIso || 'No event yet'}
                    </Text>
                    <Text style={styles.adminMetricSubtext}>
                      {latestOfferCapDecisionEvent
                        ? `${String(latestOfferCapDecisionEvent?.params?.channel || 'n/a')} | ${String(latestOfferCapDecisionEvent?.params?.decision || 'n/a')} | ${String(latestOfferCapDecisionEvent?.params?.reason || 'n/a')} | seg=${String(latestOfferCapDecisionEvent?.params?.segment || 'n/a')}`
                        : 'Trigger a segmentation validation event to inspect the latest payload.'}
                    </Text>
                  </View>
                  <Text style={styles.adminMetricValue}>{offerCapDecisionEvents.length}</Text>
                </View>
              </View>

              <Text style={styles.adminMetricLabel}>Latest Mirrored Events</Text>
              {analyticsDebugEvents.length === 0 && !analyticsDebugLoading ? (
                <Text style={styles.adminMetricSubtext}>No mirrored analytics events yet. Trigger a flow, then refresh.</Text>
              ) : null}

              {recentAnalyticsEvents.map((event) => {
                const paramEntries = Object.entries(event.params || {}).slice(0, 3);
                return (
                  <View key={event.id} style={styles.adminMetricRow}>
                    <View style={styles.adminMetricLabelBlock}>
                      <Text style={styles.adminMetricLabel}>{event.eventName || 'unknown_event'}</Text>
                      <Text style={styles.adminMetricSubtext}>
                        {event.platform || 'unknown'} • {event.createdAtIso || 'pending timestamp'}
                      </Text>
                      {paramEntries.length > 0 ? (
                        <Text style={styles.adminMetricSubtext}>
                          {paramEntries.map(([key, value]) => `${key}=${String(value)}`).join(' • ')}
                        </Text>
                      ) : null}
                    </View>
                    <MaterialCommunityIcons name="pulse" size={18} color="#2DD4BF" />
                  </View>
                );
              })}

              <Text style={[styles.adminMetricLabel, { marginTop: 14 }]}>Recovery Campaign Timestamps</Text>
              <Text style={styles.adminMetricSubtext}>
                {recoveryMetrics.completedSessions}/3 complete • Topic: {recoveryMetrics.lastTopic || 'N/A'}
              </Text>
              <Text style={styles.adminMetricSubtext}>Step 1: {formatRecoveryTimestamp(recoveryMetrics.stepTimestamps?.[1])}</Text>
              <Text style={styles.adminMetricSubtext}>Step 2: {formatRecoveryTimestamp(recoveryMetrics.stepTimestamps?.[2])}</Text>
              <Text style={styles.adminMetricSubtext}>Step 3: {formatRecoveryTimestamp(recoveryMetrics.stepTimestamps?.[3])}</Text>
              <Text style={styles.adminMetricSubtext}>Last updated: {formatRecoveryTimestamp(recoveryMetrics.updatedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Server Moderation Controls</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Team ID: {squadSync?.teamId || 'N/A'}</Text>
            <Text style={styles.analyticsLine}>Revision: {Number(squadSync?.syncMeta?.revision || 0)}</Text>
            <Text style={styles.analyticsLine}>Rate Buckets: {moderationRateBucketCount}</Text>
            <Text style={styles.analyticsLine}>Active Mutes: {moderationActiveMuteEntries.length}</Text>
            <Text style={styles.analyticsLine}>Escalations: {moderationEscalationCount}</Text>
            <Text style={styles.analyticsLine}>Local Audit Entries: {moderationAuditCount}</Text>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Target Actor ID</Text>
            <TextInput
              style={styles.textInput}
              value={moderationActorId}
              onChangeText={setModerationActorId}
              placeholder="self"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]}
              onPress={refreshModerationFromServer}
              disabled={moderationBusy}
            >
              <Text style={styles.buttonText}>{moderationBusy ? 'Working...' : 'Refresh Server Snapshot'}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={() => { void runModerationAction('clear_actor_mute'); }}
                disabled={moderationBusy}
              >
                <Text style={styles.buttonText}>Clear Mute</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={() => { void runModerationAction('reset_actor_escalation'); }}
                disabled={moderationBusy}
              >
                <Text style={styles.buttonText}>Reset Escalation</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={() => { void runModerationAction('reset_rate_buckets'); }}
                disabled={moderationBusy}
              >
                <Text style={styles.buttonText}>Reset Rate Buckets</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                onPress={() => { void runModerationAction('clear_local_audit_trail'); }}
                disabled={moderationBusy}
              >
                <Text style={styles.buttonText}>Clear Local Audit Trail</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Latest Moderation Audit (Top 10)</Text>
            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ flex: 1.5, fontSize: 11, fontWeight: '700', color: '#334155' }}>Action</Text>
                <Text style={{ flex: 1.2, fontSize: 11, fontWeight: '700', color: '#334155' }}>Reason</Text>
                <Text style={{ width: 58, fontSize: 11, fontWeight: '700', color: '#334155' }}>Allowed</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#334155' }}>Actor</Text>
                <Text style={{ width: 76, fontSize: 11, fontWeight: '700', color: '#334155' }}>Time</Text>
              </View>

              {moderationAuditRows.length === 0 ? (
                <View style={{ paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>No moderation audit entries yet.</Text>
                </View>
              ) : moderationAuditRows.map((entry) => {
                const action = String(entry?.actionType || 'unknown');
                const reason = String(entry?.reason || 'n/a');
                const allowed = Boolean(entry?.allowed);
                const actor = String(entry?.actorId || 'unknown');
                const time = formatModerationAuditTime(entry?.at);
                return (
                  <View
                    key={String(entry?.id || `${action}-${actor}-${time}`)}
                    style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                  >
                    <Text style={{ flex: 1.5, fontSize: 11, color: '#0F172A' }} numberOfLines={1}>{action}</Text>
                    <Text style={{ flex: 1.2, fontSize: 11, color: '#334155' }} numberOfLines={1}>{reason}</Text>
                    <Text style={{ width: 58, fontSize: 11, fontWeight: '700', color: allowed ? '#059669' : '#B91C1C' }}>{allowed ? 'yes' : 'no'}</Text>
                    <Text style={{ flex: 1, fontSize: 11, color: '#334155' }} numberOfLines={1}>{actor}</Text>
                    <Text style={{ width: 76, fontSize: 11, color: '#334155' }} numberOfLines={1}>{time}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Sprint 6: Season Engine Diagnostics</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Season ID: {seasonState?.seasonId || 'N/A'}</Text>
            <Text style={styles.analyticsLine}>Week Key: {seasonState?.weekKey || 'N/A'}</Text>
            <Text style={styles.analyticsLine}>Window: {seasonWindowLabel}</Text>
            <Text style={styles.analyticsLine}>Resets Applied: {Number(seasonState?.resetCount || 0)}</Text>
            <Text style={styles.analyticsLine}>Time Until Reset: {Number.isFinite(seasonEndsMs) ? `${seasonRemainingDays}d ${seasonRemainingHours}h` : 'N/A'}</Text>
            <Text style={styles.analyticsLine}>Members Ranked: {seasonLeaderboard.length}</Text>
            <Text style={styles.analyticsLine}>Raw Leader: {String(seasonRawLeader?.name || seasonRawLeader?.id || 'N/A')}</Text>
            <Text style={styles.analyticsLine}>Weighted Leader: {String(seasonWeightedLeader?.name || seasonWeightedLeader?.id || 'N/A')}</Text>
            <Text style={styles.analyticsLine}>Tier Split: Platinum {Number(seasonTierSummary.platinum || 0)} | Gold {Number(seasonTierSummary.gold || 0)} | Silver {Number(seasonTierSummary.silver || 0)} | Bronze {Number(seasonTierSummary.bronze || 0)}</Text>
            <Text style={styles.analyticsLine}>Intent Segments: High {seasonSegmentCounts['high-intent']} | Warming {seasonSegmentCounts.warming} | Low {seasonSegmentCounts['low-intent']} | Unknown {seasonSegmentCounts.unknown}</Text>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Intent Segment Counts</Text>
            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#334155' }}>Segment</Text>
                <Text style={{ width: 62, fontSize: 11, fontWeight: '700', color: '#334155' }}>Count</Text>
                <Text style={{ width: 66, fontSize: 11, fontWeight: '700', color: '#334155' }}>Share</Text>
              </View>

              {['high-intent', 'warming', 'low-intent', 'unknown'].map((segmentKey) => {
                const count = Number(seasonSegmentCounts[segmentKey] || 0);
                const sharePct = seasonSegmentCounts.total > 0 ? Math.round((count / seasonSegmentCounts.total) * 100) : 0;
                const tone = segmentKey === 'high-intent'
                  ? '#059669'
                  : (segmentKey === 'warming' ? '#B45309' : (segmentKey === 'low-intent' ? '#334155' : '#64748B'));
                return (
                  <View
                    key={segmentKey}
                    style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                  >
                    <Text style={{ flex: 1, fontSize: 11, color: tone, textTransform: 'capitalize' }}>{segmentKey.replace('-', ' ')}</Text>
                    <Text style={{ width: 62, fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{count}</Text>
                    <Text style={{ width: 66, fontSize: 11, color: '#334155' }}>{sharePct}%</Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Intent Transitions (Prev -&gt; Current)</Text>
            <Text style={styles.adminMetricSubtext}>Changed: {Number(seasonTransitionSummary?.totals?.changed || 0)} | Unchanged: {Number(seasonTransitionSummary?.totals?.unchanged || 0)} | Entries: {Number(seasonTransitionSummary?.totals?.entries || seasonLeaderboard.length)}</Text>
            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#334155' }}>Transition</Text>
                <Text style={{ width: 72, fontSize: 11, fontWeight: '700', color: '#334155' }}>Members</Text>
              </View>

              {seasonTransitionRows.length === 0 ? (
                <View style={{ paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>No segment transitions recorded yet.</Text>
                </View>
              ) : seasonTransitionRows.map(([key, count]) => (
                <View
                  key={key}
                  style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                >
                  <Text style={{ flex: 1, fontSize: 11, color: '#0F172A', textTransform: 'capitalize' }}>{String(key || '').replace('-', ' ')}</Text>
                  <Text style={{ width: 72, fontSize: 11, fontWeight: '700', color: '#334155' }}>{Number(count || 0)}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Top Season Ranks (Top 10)</Text>
            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ width: 42, fontSize: 11, fontWeight: '700', color: '#334155' }}>Rank</Text>
                <Text style={{ flex: 1.2, fontSize: 11, fontWeight: '700', color: '#334155' }}>Member</Text>
                <Text style={{ width: 70, fontSize: 11, fontWeight: '700', color: '#334155' }}>Tier</Text>
                <Text style={{ width: 70, fontSize: 11, fontWeight: '700', color: '#334155' }}>Segment</Text>
                <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: '#334155' }}>Wt Score</Text>
              </View>

              {seasonTopRows.length === 0 ? (
                <View style={{ paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>No season leaderboard rows yet.</Text>
                </View>
              ) : seasonTopRows.map((entry) => (
                <View
                  key={String(entry?.id || `${entry?.name || 'member'}-${entry?.rank || 0}`)}
                  style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                >
                  <Text style={{ width: 42, fontSize: 11, color: '#0F172A' }}>#{Number(entry?.rank || 0)}</Text>
                  <Text style={{ flex: 1.2, fontSize: 11, color: '#0F172A' }} numberOfLines={1}>{String(entry?.name || entry?.id || 'member')}</Text>
                  <Text style={{ width: 70, fontSize: 11, color: '#334155', textTransform: 'capitalize' }} numberOfLines={1}>{String(entry?.tier || 'bronze')}</Text>
                  <Text style={{ width: 70, fontSize: 11, color: '#334155', textTransform: 'capitalize' }} numberOfLines={1}>{String(entry?.intentSegment || 'unknown').replace('-', ' ')}</Text>
                  <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: '#334155' }}>{Number((entry?.weightedScore ?? entry?.score) || 0)}</Text>
                </View>
              ))}
            </View>

            {seasonSegmentPreview.length > 0 ? (
              <Text style={[styles.adminMetricSubtext, { marginTop: 8 }]}>Top intent scores: {seasonSegmentPreview.map((row) => `${row.name} ${row.score}`).join(' | ')}</Text>
            ) : null}

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Raw vs Weighted Delta (Top 10)</Text>
            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ flex: 1.2, fontSize: 11, fontWeight: '700', color: '#334155' }}>Member</Text>
                <Text style={{ width: 52, fontSize: 11, fontWeight: '700', color: '#334155' }}>Raw</Text>
                <Text style={{ width: 58, fontSize: 11, fontWeight: '700', color: '#334155' }}>Weighted</Text>
                <Text style={{ width: 50, fontSize: 11, fontWeight: '700', color: '#334155' }}>xM</Text>
                <Text style={{ width: 64, fontSize: 11, fontWeight: '700', color: '#334155' }}>Delta</Text>
                <Text style={{ width: 68, fontSize: 11, fontWeight: '700', color: '#334155' }}>Rank Δ</Text>
              </View>

              {seasonDeltaRows.length === 0 ? (
                <View style={{ paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>No raw-vs-weighted deltas yet.</Text>
                </View>
              ) : seasonDeltaRows.map((entry) => {
                const deltaPrefix = entry.fairPlayDelta > 0 ? '+' : '';
                const rankPrefix = entry.rankDelta > 0 ? '+' : '';
                const rankTone = entry.rankDelta > 0 ? '#059669' : (entry.rankDelta < 0 ? '#B91C1C' : '#334155');
                const deltaTone = entry.fairPlayDelta > 0 ? '#059669' : (entry.fairPlayDelta < 0 ? '#B91C1C' : '#334155');
                const deltaPctPrefix = entry.fairPlayDeltaPct > 0 ? '+' : '';
                const qualitySummary = `A ${Math.round(entry.qualitySignals.accuracy * 100)}% | C ${Math.round(entry.qualitySignals.completion * 100)}% | K ${Math.round(entry.qualitySignals.consistency * 100)}%`;
                return (
                  <View
                    key={entry.id}
                    style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
                  >
                    <View style={{ flex: 1.2, paddingRight: 6 }}>
                      <Text style={{ fontSize: 11, color: '#0F172A' }} numberOfLines={1}>{entry.name}</Text>
                      <Text style={{ marginTop: 1, fontSize: 10, color: '#64748B' }} numberOfLines={1}>{qualitySummary}</Text>
                    </View>
                    <Text style={{ width: 52, fontSize: 11, color: '#334155' }}>{entry.rawScore}</Text>
                    <Text style={{ width: 58, fontSize: 11, color: '#334155' }}>{entry.weightedScore}</Text>
                    <Text style={{ width: 50, fontSize: 11, color: '#334155' }}>{entry.fairPlayMultiplier.toFixed(3)}</Text>
                    <View style={{ width: 64 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: deltaTone }}>{`${deltaPrefix}${entry.fairPlayDelta}`}</Text>
                      <Text style={{ marginTop: 1, fontSize: 10, color: deltaTone }}>{`${deltaPctPrefix}${entry.fairPlayDeltaPct.toFixed(1)}%`}</Text>
                    </View>
                    <Text style={{ width: 68, fontSize: 11, fontWeight: '700', color: rankTone }}>{`${rankPrefix}${entry.rankDelta}`}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Federal Officials</Text>

          <Text style={styles.inputLabel}>President</Text>
          <TextInput style={styles.textInput} value={president} onChangeText={setPresident} />

          <Text style={styles.inputLabel}>Vice President</Text>
          <TextInput style={styles.textInput} value={vicePresident} onChangeText={setVicePresident} />

          <Text style={styles.inputLabel}>Speaker of the House</Text>
          <TextInput style={styles.textInput} value={speakerOfHouse} onChangeText={setSpeakerOfHouse} />

          <Text style={styles.inputLabel}>Chief Justice</Text>
          <TextInput style={styles.textInput} value={chiefJustice} onChangeText={setChiefJustice} />

          <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 12 }]} onPress={saveFederalOfficials}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Save Federal Updates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>State Officials + Capital</Text>

          <Text style={styles.inputLabel}>State</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={stateName} onValueChange={(value) => setStateName(value)} style={styles.picker}>
              {usStates.map((state) => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Governor</Text>
          <TextInput style={styles.textInput} value={governor} onChangeText={setGovernor} />

          <Text style={styles.inputLabel}>U.S. Senator 1</Text>
          <TextInput style={styles.textInput} value={senatorOne} onChangeText={setSenatorOne} />

          <Text style={styles.inputLabel}>U.S. Senator 2</Text>
          <TextInput style={styles.textInput} value={senatorTwo} onChangeText={setSenatorTwo} />

          <Text style={styles.inputLabel}>State Capital</Text>
          <TextInput style={styles.textInput} value={capital} onChangeText={setCapitalValue} />

          <TouchableOpacity style={[styles.button, styles.buttonPrimary, { marginTop: 12 }]} onPress={saveStateOfficials}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>Save State Updates</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Revenue Estimate (Daily)</Text>

          <Text style={styles.inputLabel}>Interstitial eCPM (USD)</Text>
          <TextInput
            style={styles.textInput}
            value={interstitialEcpm}
            onChangeText={setInterstitialEcpm}
            keyboardType="numeric"
            placeholder="4.00"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.inputLabel, { marginTop: 10 }]}>Rewarded eCPM (USD)</Text>
          <TextInput
            style={styles.textInput}
            value={rewardedEcpm}
            onChangeText={setRewardedEcpm}
            keyboardType="numeric"
            placeholder="12.00"
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Interstitial impressions: {interstitialShown}</Text>
            <Text style={styles.analyticsLine}>Rewarded completions: {rewardedCompleted}</Text>
            <Text style={styles.revenueLine}>Interstitial est.: ${estimatedInterstitialRevenue.toFixed(2)}</Text>
            <Text style={styles.revenueLine}>Rewarded est.: ${estimatedRewardedRevenue.toFixed(2)}</Text>
            <Text style={styles.revenueTotal}>Estimated Daily Revenue: ${estimatedDailyRevenue.toFixed(2)}</Text>
            <Text style={styles.revenueBandLine}>
              Confidence Band (daily): Low ${dailyLow.toFixed(2)} | Base ${estimatedDailyRevenue.toFixed(2)} | High ${dailyHigh.toFixed(2)}
            </Text>

            <TouchableOpacity
              style={styles.monthlyToggleButton}
              onPress={() => setShowMonthlyProjection((prev) => !prev)}
            >
              <MaterialCommunityIcons
                name={showMonthlyProjection ? 'chevron-down' : 'chevron-right'}
                size={18}
                color="#6D28D9"
              />
              <Text style={styles.monthlyToggleText}>Monthly projection (optional)</Text>
            </TouchableOpacity>

            {showMonthlyProjection && (
              <Text style={styles.revenueBandLine}>
                Confidence Band (30-day): Low ${monthlyLow.toFixed(2)} | Base ${monthlyBase.toFixed(2)} | High ${monthlyHigh.toFixed(2)}
              </Text>
            )}
            <Text style={styles.revenueHint}>Rough model: revenue = impressions / 1000 x eCPM</Text>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>7-Day Revenue Trend</Text>
          <View style={styles.trendChartRow}>
            {trendDays.map((day) => {
              const barHeight = Math.max(8, Math.round((day.revenue / maxTrendRevenue) * 90));
              return (
                <View key={day.dayKey} style={styles.trendBarColumn}>
                  <Text style={styles.trendValueLabel}>${day.revenue.toFixed(2)}</Text>
                  <View style={styles.trendBarTrack}>
                    <View style={[styles.trendBarFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.trendBarLabel}>{day.label}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.revenueHint}>Based on stored daily ad counts and your current eCPM assumptions.</Text>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Comeback Loop Diagnostics</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Last Active Day: {String(comebackCampaign?.lastActiveDayKey || 'N/A')}</Text>
            <Text style={styles.analyticsLine}>Eligible Window: {comebackEligibleWindow}</Text>
            <Text style={styles.analyticsLine}>Triggered Counts: D2 {analytics.comebackD2Triggered || 0} | D5 {analytics.comebackD5Triggered || 0} | D10 {analytics.comebackD10Triggered || 0}</Text>

            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 6, paddingHorizontal: 8 }}>
                <Text style={{ width: 42, fontSize: 11, fontWeight: '700', color: '#334155' }}>Win</Text>
                <Text style={{ width: 48, fontSize: 11, fontWeight: '700', color: '#334155' }}>Days</Text>
                <Text style={{ width: 56, fontSize: 11, fontWeight: '700', color: '#334155' }}>Live</Text>
                <Text style={{ width: 56, fontSize: 11, fontWeight: '700', color: '#334155' }}>Shown</Text>
                <Text style={{ width: 60, fontSize: 11, fontWeight: '700', color: '#334155' }}>Claimed</Text>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#334155' }}>Last Day</Text>
              </View>

              {comebackWindowRows.map((row) => (
                <View key={row.key} style={{ flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}>
                  <Text style={{ width: 42, fontSize: 11, color: '#0F172A', textTransform: 'uppercase' }}>{row.key}</Text>
                  <Text style={{ width: 48, fontSize: 11, color: '#334155' }}>{row.dayOffset}</Text>
                  <Text style={{ width: 56, fontSize: 11, fontWeight: '700', color: row.eligible ? '#059669' : '#64748B' }}>{row.eligible ? 'yes' : 'no'}</Text>
                  <Text style={{ width: 56, fontSize: 11, color: '#334155' }}>{row.shownCount}</Text>
                  <Text style={{ width: 60, fontSize: 11, color: '#334155' }}>{row.claimedCount}</Text>
                  <Text style={{ flex: 1, fontSize: 11, color: '#334155' }} numberOfLines={1}>{row.lastEligibleDayKey}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.revenueHint}>This verifies D2/D5/D10 eligibility windows before reward-claim UX is wired.</Text>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Rewarded Funnel by Placement</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.analyticsLine}>Overall rewarded completion rate: {rewardedCompletionRate}%</Text>
            {rewardedPlacementRows.map((row) => (
              <View key={row.key} style={styles.adminMetricRow}>
                <View style={styles.adminMetricLabelBlock}>
                  <Text style={styles.adminMetricLabel}>{row.label}</Text>
                  <Text style={styles.adminMetricSubtext}>
                    {row.attempts} attempts • {row.completions} completions • {row.conversionRate}% CVR
                  </Text>
                </View>
                <Text style={styles.adminMetricValue}>${row.estimatedRevenue.toFixed(2)}</Text>
              </View>
            ))}
            <Text style={styles.revenueHint}>Use this to decide which rewarded surface deserves better placement and copy.</Text>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Next Move Runbook</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.adminMetricSubtext}>
              Revenue cohort: {revenueCohort}
              {' • '}
              bucket {Number.isFinite(Number(revenueExperiment?.bucket)) ? Number(revenueExperiment.bucket) : 'n/a'}
              {' • '}
              holdout split {Number(revenueExperiment?.holdoutPct || 20)}%
            </Text>
            <Text style={styles.adminMetricSubtext}>
              Assignment source: {cohortAssignmentSource}
              {' • '}
              seed {cohortSeed}
              {' • '}
              assigned {cohortAssignedAtLabel}
            </Text>
            <Text style={styles.adminMetricSubtext}>
              Active variants now: homeSprintOffer={activeHomeSprintOfferVariant}, homeSprintReward={activeHomeSprintRewardVariant}, reviewBonusOffer={activeReviewBonusVariant}, reviewWeakOffer={activeReviewWeakVariant}
            </Text>
            <View style={[styles.pickerContainer, { marginTop: 8, marginBottom: 8 }]}>
              <Picker
                selectedValue={cohortOverrideValue}
                onValueChange={(value) => setRevenueCohortOverride(value === AUTO_VARIANT_VALUE ? null : value)}
                style={styles.picker}
              >
                <Picker.Item label="Cohort: Auto (seeded)" value={AUTO_VARIANT_VALUE} />
                <Picker.Item label="Cohort: Treatment" value="treatment" />
                <Picker.Item label="Cohort: Holdout" value="holdout" />
              </Picker>
            </View>
            <Text style={styles.adminMetricSubtext}>1. Reset rewarded offer tests, then drive 15-30 Home Sprint unlocks.</Text>
            <Text style={styles.adminMetricSubtext}>Home Sprint traffic progress: {homeSprintAttemptCount}/30 attempts ({homeSprintAttemptPct}%)</Text>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={runRevenueRuntimeSelfCheck}>
              <Text style={styles.buttonText}>Run Self-Check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 8 }]} onPress={copyRevenueRuntimeSelfCheck}>
              <Text style={styles.buttonText}>Copy Summary</Text>
            </TouchableOpacity>
            {!!copyFeedback.text && (
              <Text
                style={[
                  styles.adminMetricSubtext,
                  styles.adminCopyFeedback,
                  copyFeedback.type === 'error' && styles.adminCopyFeedbackError,
                ]}
              >
                {copyFeedback.text}
              </Text>
            )}
            <Text style={[styles.adminMetricSubtext, { marginTop: 8, lineHeight: 18 }]}>{runtimeSelfCheckSummary}</Text>
            {revenueCohort === 'holdout' && (
              <Text style={styles.adminMetricSubtext}>
                Holdout behavior: baseline offer variants, baseline cap policy, and no comeback CTA. Use treatment devices to validate Sprint 6 monetization changes.
              </Text>
            )}
            <Text style={styles.adminMetricSubtext}>
              2. If reward winner is clear, pin reward first before copy.
              {rewardWinnerReady
                ? ` Current recommendation: pin ${VARIANT_LABELS[homeSprintRewardGroup.leader.variantName] || homeSprintRewardGroup.leader.variantName}.`
                : ' Current recommendation: keep collecting traffic.'}
            </Text>
            {homeSprintRewardGroup?.autoWinner?.active && (
              <Text style={styles.adminMetricSubtext}>
                Auto winner active: {VARIANT_LABELS[homeSprintRewardGroup.autoWinner.variantName] || homeSprintRewardGroup.autoWinner.variantName}
                {' • '}
                confidence {(Number(homeSprintRewardGroup.autoWinner.confidenceCurrent || 0) * 100).toFixed(0)}%
                {' • '}
                expires {homeSprintRewardGroup.autoWinner.expiresAt ? new Date(homeSprintRewardGroup.autoWinner.expiresAt).toLocaleDateString() : 'n/a'}
              </Text>
            )}
            {rewardWinnerReady && homeSprintRewardGroup?.leader && (
              <View style={styles.adminSuggestionBadge}>
                <MaterialCommunityIcons name="auto-fix" size={14} color="#34D399" />
                <Text style={styles.adminSuggestionBadgeText}>
                  Auto-suggestion: Pin reward winner {VARIANT_LABELS[homeSprintRewardGroup.leader.variantName] || homeSprintRewardGroup.leader.variantName}
                </Text>
              </View>
            )}
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={pinRewardWinnerFirst}>
              <Text style={styles.buttonText}>Pin Reward Winner First</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Rewarded Offer Tests</Text>
          <View style={styles.revenueSummaryBox}>
            <Text style={styles.adminMetricSubtext}>
              Holdout readiness: {revenueCohort === 'holdout' ? 'User is assigned to holdout for revenue-intelligence validation.' : 'User is assigned to treatment for revenue-intelligence validation.'}
            </Text>
            {offerVariantRows.map((group) => {
              return (
                <View key={group.key} style={{ marginBottom: 12 }}>
                  <Text style={styles.adminMetricLabel}>{group.label}</Text>
                  <Text style={styles.adminMetricSubtext}>
                    Delivery mode: {group.pinnedVariantName
                      ? `Pinned to ${VARIANT_LABELS[group.pinnedVariantName] || group.pinnedVariantName}`
                      : revenueCohort === 'holdout'
                        ? `Baseline ${VARIANT_LABELS[group.variantOptions[0]] || group.variantOptions[0]}`
                      : group.autoWinner?.active
                        ? `Auto winner ${VARIANT_LABELS[group.autoWinner.variantName] || group.autoWinner.variantName}`
                        : 'Auto rotation'}
                  </Text>
                  {group.autoWinner && (
                    <Text style={styles.adminMetricSubtext}>
                      Winner lifecycle: {group.autoWinner.variantName ? `${VARIANT_LABELS[group.autoWinner.variantName] || group.autoWinner.variantName}` : 'none'}
                      {' • '}
                      start {(Number(group.autoWinner.confidenceStart || 0) * 100).toFixed(0)}%
                      {' • '}
                      current {(Number(group.autoWinner.confidenceCurrent || 0) * 100).toFixed(0)}%
                      {' • '}
                      status {group.autoWinner.active ? 'active' : (group.autoWinner.reason || 'inactive')}
                    </Text>
                  )}
                  {group.autoWinner?.expiresAt && (
                    <Text style={styles.adminMetricSubtext}>
                      Auto-expiry: {new Date(group.autoWinner.expiresAt).toLocaleString()}
                      {group.autoWinner.expiredAt ? ` • expired ${new Date(group.autoWinner.expiredAt).toLocaleString()}` : ''}
                    </Text>
                  )}
                  <View style={[styles.pickerContainer, { marginTop: 8, marginBottom: 8 }]}>
                    <Picker
                      selectedValue={group.pinnedVariantName || AUTO_VARIANT_VALUE}
                      onValueChange={(value) => setPinnedOfferVariant(group.key, value === AUTO_VARIANT_VALUE ? null : value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Auto rotate" value={AUTO_VARIANT_VALUE} />
                      {group.variantOptions.map((variantName) => (
                        <Picker.Item
                          key={`${group.key}-${variantName}-picker`}
                          label={`Pin ${VARIANT_LABELS[variantName] || variantName}`}
                          value={variantName}
                        />
                      ))}
                    </Picker>
                  </View>
                  {group.names.length === 0 ? (
                    <Text style={styles.adminMetricSubtext}>No traffic yet.</Text>
                  ) : group.names.map((variantName) => {
                    const variant = group.variantStats[variantName] || { attempts: 0, completions: 0 };
                    const conversionRate = variant.attempts ? Math.round((variant.completions / variant.attempts) * 100) : 0;
                    return (
                      <View key={`${group.key}-${variantName}`} style={styles.adminMetricRow}>
                        <View style={styles.adminMetricLabelBlock}>
                          <Text style={styles.adminMetricLabel}>{variantName}</Text>
                          <Text style={styles.adminMetricSubtext}>
                            {variant.attempts} attempts • {variant.completions} completions • {conversionRate}% CVR
                          </Text>
                        </View>
                        <Text style={styles.adminMetricValue}>${((variant.completions / 1000) * rewardedEcpmValue).toFixed(2)}</Text>
                      </View>
                    );
                  })}
                  {group.leader && (
                    <Text style={styles.adminMetricSubtext}>
                      Leading now: {group.leader.variantName} at {group.leader.conversionRate}% CVR
                      {group.runnerUp ? ` vs ${group.runnerUp.variantName} at ${group.runnerUp.conversionRate}%` : ''}
                      {group.totals.attempts < 40 ? ' • Early data, keep collecting traffic.' : ' • Enough signal to consider promoting the winner.'}
                    </Text>
                  )}
                  {group.leader && group.baselineVariant && (
                    <Text style={styles.adminMetricSubtext}>
                      Estimated lift vs {group.baselineVariant.variantName}: {group.cvrDeltaPctPoints > 0 ? '+' : ''}{group.cvrDeltaPctPoints.toFixed(1)} pts CVR
                      {group.relativeLiftPct ? ` (${group.relativeLiftPct > 0 ? '+' : ''}${group.relativeLiftPct}% relative)` : ''}
                      {' • '}
                      +${group.revenueLiftPer100Attempts.toFixed(4)} per 100 attempts
                      {' • '}
                      +${group.revenueLiftAtObservedAttempts.toFixed(4)} at current traffic
                    </Text>
                  )}
                  {group.highConfidenceSuggestion && group.leader && (
                    <View style={styles.adminSuggestionBadge}>
                      <MaterialCommunityIcons name="auto-fix" size={14} color="#34D399" />
                      <Text style={styles.adminSuggestionBadgeText}>
                        Auto-suggestion: Pin {VARIANT_LABELS[group.leader.variantName] || group.leader.variantName}
                      </Text>
                    </View>
                  )}
                  {group.key === 'homeSprintOffer' && !homeSprintRewardGroup?.autoWinner?.active && !homeSprintRewardGroup?.pinnedVariantName && (
                    <Text style={styles.adminMetricSubtext}>Copy winner waits until the reward winner is active or manually pinned.</Text>
                  )}
                </View>
              );
            })}
            <Text style={styles.revenueHint}>3. Use estimated lift to pick winners by business impact, not CVR alone.</Text>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]} onPress={confirmResetOfferVariantStats}>
              <Text style={styles.buttonText}>Reset Offer Tests (Copy + Reward)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.adminCard}>
          <Text style={styles.adminCardTitle}>Ad Analytics (Lightweight)</Text>
          <Text style={styles.analyticsLine}>Today key: {adRuntime.dayKey || 'N/A'}</Text>
          <Text style={styles.analyticsLine}>Interstitial attempts: {analytics.interstitialAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Interstitial shown: {analytics.interstitialShown || 0}</Text>
          <Text style={styles.analyticsLine}>Shown from Resume: {analytics.interstitialResumeShown || 0}</Text>
          <Text style={styles.analyticsLine}>Shown from Quiz Complete: {analytics.interstitialQuizCompleteShown || 0}</Text>
          <Text style={styles.analyticsLine}>Quiz-complete eligible sessions: {analytics.interstitialQuizCompleteEligible || 0}</Text>
          <Text style={styles.analyticsLine}>Quiz-complete skipped (short): {analytics.interstitialQuizCompleteSkippedShortSession || 0}</Text>
          <Text style={styles.analyticsLine}>Quiz-complete skipped (low score): {analytics.interstitialQuizCompleteSkippedLowScore || 0}</Text>
          <Text style={styles.analyticsLine}>Quiz-complete skipped (cadence): {analytics.interstitialQuizCompleteSkippedCadence || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (cooldown): {analytics.interstitialSkippedCooldown || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (daily cap): {analytics.interstitialSkippedDailyCap || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (trigger cap): {analytics.interstitialSkippedTriggerCap || 0}</Text>
          <Text style={styles.analyticsLine}>Interstitial failures: {analytics.interstitialFailed || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded attempts: {analytics.rewardedAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded completed: {analytics.rewardedCompleted || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded failed/closed: {analytics.rewardedFailedOrClosed || 0}</Text>
          <Text style={styles.analyticsLine}>Sprint unlocks: {analytics.rewardedSprintUnlocks || 0}</Text>
          <Text style={styles.analyticsLine}>Review bonus unlocks: {analytics.rewardedBonusUnlocks || 0}</Text>
          <Text style={styles.analyticsLine}>Weak-area rescue unlocks: {analytics.rewardedReviewWeakUnlocks || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack attempts: {analytics.rewardedFreePackAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack unlocked: {analytics.rewardedFreePackUnlocked || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack blocked (daily): {analytics.rewardedFreePackBlockedDailyLimit || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack blocked (cooldown): {analytics.rewardedFreePackBlockedCooldown || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack ad failed: {analytics.rewardedFreePackFailed || 0}</Text>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]} onPress={resetAdAnalytics}>
            <Text style={styles.buttonText}>Reset Analytics Counters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AdminScreen;
