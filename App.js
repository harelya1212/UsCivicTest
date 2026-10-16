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
  clampNumber,
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
import {
  OFFER_VARIANT_OPTIONS,
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
} from './services/offerEngine';
import {
  buildInviteCode,
  normalizeComebackCampaign,
  deriveComebackCampaign,
  buildMemberFromProfile,
  normalizeSquadSync,
  getGhostStreakIntensity,
  deriveSeasonState,
  reconcileSquadSync,
} from './services/squadEngine';
import { evaluateModerationPolicy } from './services/moderation';
// import { PremiumManager, PREMIUM_TIERS, logMonetizationEvent } from './monetizationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');


const COMEBACK_REWARD_QUESTIONS = Object.freeze({ d2: 8, d5: 12, d10: 18 });
const FOCUS_SUPPRESSION_WINDOW_MS = 5 * 60 * 1000;
const FOCUS_SHIELD_WINDOW_MS = 20 * 60 * 1000;
const FOCUS_POST_VICTORY_WINDOW_MS = 10 * 60 * 1000;
const CINEMATIC_SAFETY_BUFFER_MS = 30 * 1000;
const MAX_ADS_PER_10_MIN = 3;




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

