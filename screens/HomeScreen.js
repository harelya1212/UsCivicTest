import React, { useState, useEffect, useContext, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import ThreeDPath from './components/ThreeDPath';
import {
  achievements,
  AD_EVENT_NAMES,
  APP_EVENT_NAMES,
  DAILY_FREE_PACK_LIMIT,
  FREE_PACK_QUESTION_COUNT,
} from '../constants';
import {
  showRewardedAd,
  HomeBannerAd,
} from '../adMobService';

const OFFER_VARIANT_ALLOWED = Object.freeze({
  homeSprintOffer: ['control', 'urgency', 'value', 'outcome'],
  homeSprintReward: ['standard', 'extended'],
});

const ENABLE_SPATIAL_HOME_PATH = true;

function sanitizeVariant(variantKey, candidate) {
  const options = OFFER_VARIANT_ALLOWED[variantKey] || [];
  if (options.includes(candidate)) {
    return { value: candidate, fallbackApplied: false, fallbackFrom: null };
  }

  const fallback = options[0] || 'control';
  return { value: fallback, fallbackApplied: true, fallbackFrom: String(candidate || '') };
}

function HomeScreen({ navigation }) {
  const {
    testDetails,
    pausedSession,
    clearPausedSession,
    maybeShowInterstitial,
    trackAdEvent,
    trackAppEvent,
    adRuntime,
    unlockDailyFreePack,
    claimComebackReward,
    getOfferVariant,
    recordCinematicLanding,
  } = useContext(AppDataContext);
  const studyPlan = testDetails?.studyPlan;
  const [nowTick, setNowTick] = useState(Date.now());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [spatialPathFailed, setSpatialPathFailed] = useState(false);
  const homeScrollRef = useRef(null);
  const runtimeExposureTrackedRef = useRef(false);
  const cinematicLandingTrackedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const freePackUnlockedToday = adRuntime.freePackDayKey === todayKey && (adRuntime.freePackUnlocksToday || 0) >= DAILY_FREE_PACK_LIMIT;
  const freePackCooldownMs = Math.max(0, (adRuntime.freePackCooldownUntil || 0) - nowTick);
  const freePackCooldownMinutes = Math.ceil(freePackCooldownMs / (60 * 1000));
  const cooldownHours = Math.floor(freePackCooldownMs / (60 * 60 * 1000));
  const cooldownRemainingMinutes = Math.ceil((freePackCooldownMs % (60 * 60 * 1000)) / (60 * 1000));
  const cooldownHHMM = `${String(cooldownHours).padStart(2, '0')}:${String(Math.max(0, Math.min(59, cooldownRemainingMinutes))).padStart(2, '0')}`;
  const analytics = adRuntime.analytics || {};
  const availableBoostsNow = 1 + (freePackUnlockedToday ? 0 : 1);
  const totalBoostsClaimed = (analytics.rewardedSprintUnlocks || 0) + (analytics.rewardedFreePackUnlocked || 0);
  const rewardedConversionRate = analytics.rewardedAttempts
    ? Math.round(((analytics.rewardedCompleted || 0) / analytics.rewardedAttempts) * 100)
    : 0;
  const comebackCampaign = adRuntime?.comebackCampaign || {};
  const revenueExperiment = adRuntime?.experimentCohorts?.revenueIntelligence || {};
  const _revenueOverride = String(revenueExperiment?.overrideCohort || '').trim().toLowerCase();
  const revenueCohort = (_revenueOverride === 'treatment' || _revenueOverride === 'holdout')
    ? _revenueOverride
    : String(revenueExperiment?.cohort || 'treatment');
  const revenueTreatmentEnabled = revenueCohort !== 'holdout';
  const comebackEligibleWindow = String(comebackCampaign?.eligibleWindow || '').trim();
  const comebackWindow = comebackEligibleWindow ? comebackCampaign?.windows?.[comebackEligibleWindow] : null;
  const comebackLastClaimedDayKey = String(comebackWindow?.lastClaimedAt || '').trim().slice(0, 10);
  const comebackClaimedToday = Boolean(comebackEligibleWindow) && comebackLastClaimedDayKey === todayKey;
  const comebackRewardLabelMap = {
    d2: '8-question reset pack',
    d5: '12-question momentum pack',
    d10: '18-question comeback pack',
  };
  const comebackRewardLabel = comebackRewardLabelMap[comebackEligibleWindow] || 'bonus pack';
  const homeSprintVariantResult = sanitizeVariant('homeSprintOffer', getOfferVariant('homeSprintOffer'));
  const homeSprintRewardVariantResult = sanitizeVariant('homeSprintReward', getOfferVariant('homeSprintReward'));
  const homeSprintVariant = homeSprintVariantResult.value;
  const homeSprintRewardVariant = homeSprintRewardVariantResult.value;
  const sprintRewardDelta = homeSprintRewardVariant === 'extended' ? 15 : 10;
  const sprintRewardLabel = homeSprintRewardVariant === 'extended' ? '+15 questions' : '+10 questions';
  const getLeadingVariant = (variantKey) => {
    const variantGroup = adRuntime.offerVariantStats?.[variantKey] || {};
    return Object.entries(variantGroup)
      .map(([variantName, value]) => {
        const attempts = value?.attempts || 0;
        const completions = value?.completions || 0;
        return {
          variantName,
          attempts,
          conversionRate: attempts ? Math.round((completions / attempts) * 100) : 0,
        };
      })
      .sort((a, b) => {
        if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate;
        return b.attempts - a.attempts;
      })[0] || null;
  };
  const homeSprintCopyLeader = getLeadingVariant('homeSprintOffer');
  const homeSprintRewardLeader = getLeadingVariant('homeSprintReward');
  const homeSprintCopyByVariant = {
    urgency: {
      title: 'Need a Fast Study Boost?',
      subtitle: 'Watch once and jump into an extra-question sprint right now',
    },
    value: {
      title: 'Quick Win: Extra Practice Pack',
      subtitle: `One short ad unlocks ${sprintRewardLabel} instantly`,
    },
    outcome: {
      title: 'Boost Pass Confidence Today',
      subtitle: `Add ${sprintRewardLabel} to improve today\'s session outcome`,
    },
    control: {
      title: 'Watch Ad: Unlock Sprint Practice',
      subtitle: `Get ${sprintRewardLabel} today at no cost`,
    },
  };
  const homeSprintCopy = homeSprintCopyByVariant[homeSprintVariant] || homeSprintCopyByVariant.control;
  const showSpatialPath = ENABLE_SPATIAL_HOME_PATH && !spatialPathFailed;
  const spatialStudyRoute = [
    {
      id: 'weak-area-drill',
      title: 'Weak-Area Drill',
      subtitle: 'Focus mode + urgency-first questions',
      urgency: 0.92,
      action: { screen: 'Quiz', params: { type: testDetails?.testType || 'naturalization128', forceQuestionCount: 8, focusMode: 'minimal' } },
    },
    {
      id: 'trend-stabilizer',
      title: 'Trend Stabilizer',
      subtitle: 'Recover your 7-day momentum',
      urgency: 0.74,
      action: { screen: 'Quiz', params: { type: testDetails?.testType || 'naturalization128', forceQuestionCount: 10 } },
    },
    {
      id: 'interview-rehearsal',
      title: 'Interview Rehearsal',
      subtitle: 'Lock in confidence with spoken practice',
      urgency: 0.58,
      action: { screen: 'Interview', params: {} },
    },
  ];

  const handleSpatialPathRuntimeFailure = (reason = 'unknown') => {
    setSpatialPathFailed(true);
    trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, {
      screen: 'home',
      variant_key: 'homeSpatialPath',
      requested_variant: 'threeDPath',
      fallback_variant: 'currentRouteUI',
      reason,
    });
  };

  const handleSpatialStepEnter = (step) => {
    clearPausedSession();
    const screen = step?.action?.screen || 'Quiz';
    const params = step?.action?.params || { type: testDetails?.testType || 'naturalization128' };
    navigation.navigate(screen, params);
  };

  useEffect(() => {
    if (!runtimeExposureTrackedRef.current) {
      runtimeExposureTrackedRef.current = true;
      trackAppEvent(APP_EVENT_NAMES.HOME_REVENUE_RUNTIME_EXPOSED, {
        cohort: revenueCohort,
        treatment_enabled: revenueTreatmentEnabled,
        home_sprint_offer_variant: homeSprintVariant,
        home_sprint_reward_variant: homeSprintRewardVariant,
      });
    }
  }, [
    homeSprintRewardVariant,
    homeSprintVariant,
    revenueCohort,
    revenueTreatmentEnabled,
    trackAppEvent,
  ]);

  useEffect(() => {
    if (homeSprintVariantResult.fallbackApplied) {
      trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, {
        screen: 'home',
        variant_key: 'homeSprintOffer',
        requested_variant: homeSprintVariantResult.fallbackFrom,
        fallback_variant: homeSprintVariant,
      });
    }
    if (homeSprintRewardVariantResult.fallbackApplied) {
      trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, {
        screen: 'home',
        variant_key: 'homeSprintReward',
        requested_variant: homeSprintRewardVariantResult.fallbackFrom,
        fallback_variant: homeSprintRewardVariant,
      });
    }
  }, [
    homeSprintRewardVariant,
    homeSprintRewardVariantResult.fallbackApplied,
    homeSprintRewardVariantResult.fallbackFrom,
    homeSprintVariant,
    homeSprintVariantResult.fallbackApplied,
    homeSprintVariantResult.fallbackFrom,
    trackAppEvent,
  ]);

  useEffect(() => {
    if (!showSpatialPath) {
      cinematicLandingTrackedRef.current = false;
      return;
    }
    if (cinematicLandingTrackedRef.current) return;
    cinematicLandingTrackedRef.current = true;
    recordCinematicLanding({ surface: 'home_spatial_path' });
  }, [recordCinematicLanding, showSpatialPath]);

  const handleDailyFreePackUnlock = async () => {
    const result = await unlockDailyFreePack();

    if (result.ok) {
      Alert.alert('Daily Pack Unlocked', `You unlocked ${result.questionCount} free bonus questions.`);
      clearPausedSession();
      navigation.navigate('Quiz', {
        type: testDetails?.testType || 'naturalization128',
        forceQuestionCount: result.questionCount,
      });
      return;
    }

    if (result.reason === 'daily_limit') {
      Alert.alert('Daily Limit Reached', 'You already unlocked today\'s free pack. Come back tomorrow!');
      return;
    }

    if (result.reason === 'cooldown') {
      const minutes = Math.max(1, Math.ceil(((result.cooldownUntil || 0) - Date.now()) / (60 * 1000)));
      Alert.alert('Please Wait', `Try again in about ${minutes} minute(s).`);
      return;
    }

    Alert.alert('Ad Unavailable', 'The ad was closed or unavailable. Please try again shortly.');
  };

  const handleWatchAdForSprint = async () => {
    trackAdEvent(AD_EVENT_NAMES.REWARDED_ATTEMPT);
    trackAdEvent({
      eventName: AD_EVENT_NAMES.REWARDED_HOME_SPRINT_ATTEMPT,
      experiments: [
        { variantKey: 'homeSprintOffer', variantName: homeSprintVariant },
        { variantKey: 'homeSprintReward', variantName: homeSprintRewardVariant },
      ],
      phase: 'attempt',
    });
    try {
      await showRewardedAd();
      trackAdEvent(AD_EVENT_NAMES.REWARDED_COMPLETED);
      trackAdEvent({
        eventName: AD_EVENT_NAMES.REWARDED_SPRINT_UNLOCK,
        experiments: [
          { variantKey: 'homeSprintOffer', variantName: homeSprintVariant },
          { variantKey: 'homeSprintReward', variantName: homeSprintRewardVariant },
        ],
        phase: 'complete',
      });
      const baseCount = studyPlan?.questionsPerDay || 10;
      const sprintCount = Math.min(homeSprintRewardVariant === 'extended' ? 30 : 25, baseCount + sprintRewardDelta);
      Alert.alert('Unlocked', `Sprint mode unlocked: ${sprintCount} questions.`);
      clearPausedSession();
      navigation.navigate('Quiz', {
        type: testDetails?.testType || 'naturalization128',
        forceQuestionCount: sprintCount,
      });
    } catch (error) {
      trackAdEvent(AD_EVENT_NAMES.REWARDED_FAILED_OR_CLOSED);
      console.log('Rewarded ad skipped or failed:', error);
    }
  };

  const handleClaimComebackReward = async () => {
    const result = await claimComebackReward();

    if (!result?.ok) {
      if (result?.reason === 'holdout') {
        Alert.alert('Baseline Cohort', 'Comeback rewards are disabled for the holdout cohort during lift measurement.');
        return;
      }

      if (result?.reason === 'already_claimed') {
        Alert.alert('Already Claimed', 'You already claimed today\'s comeback reward.');
        return;
      }

      Alert.alert('Not Eligible', 'No comeback reward window is active right now.');
      return;
    }

    Alert.alert('Comeback Reward Claimed', `Unlocked ${result.questionCount} bonus questions from ${String(result.windowKey || '').toUpperCase()}.`);
    clearPausedSession();
    navigation.navigate('Quiz', {
      type: testDetails?.testType || 'naturalization128',
      forceQuestionCount: result.questionCount,
      focusMode: 'minimal',
      comebackWindow: result.windowKey,
    });
  };

  const startFocusPreset = ({ count, label, focusMode = null }) => {
    clearPausedSession();
    navigation.navigate('Quiz', {
      type: testDetails?.testType || 'naturalization128',
      forceQuestionCount: count,
      focusMode,
    });
    Alert.alert('Focus Session', `${label} started.`);
  };

  const [user, setUser] = useState({
    name: testDetails?.name || 'Future Citizen',
    initials: (testDetails?.name || 'FC').split(' ').map(n => n[0]).join('').toUpperCase(),
    points: 260,
    level: 3,
    streak: 5,
    avatar: '👤',
  });

  const [userStats] = useState({
    questionsAnswered: 47,
    accuracy: 78,
    timeSpent: '2h 34m',
  });

  // Calculate days until test
  const daysUntilTest = testDetails?.testDate ? Math.max(0, Math.floor((new Date(testDetails.testDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557804506-669714153f27?w=500&h=500&fit=crop' }}
        style={styles.headerBg}
        blurRadius={30}
      >
        <View style={styles.headerOverlay} />

        {/* Header with Profile */}
        <View style={styles.headerTop}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>⭐ {user.points} pts</Text>
            <Text style={styles.levelBadgeLevel}>Lv {user.level}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{user.initials[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome message */}
        <View style={styles.headerContent}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name.split(' ')[0]}</Text>
          <Text style={styles.welcomeSub}>
            {testDetails && daysUntilTest !== null && `${daysUntilTest} days until your test`}
            {!testDetails || daysUntilTest === null ? 'Let\'s start practicing!' : ' • Get studying!'}
          </Text>
        </View>
      </ImageBackground>

      <ScrollView
        ref={homeScrollRef}
        style={styles.scrollContent}
        contentContainerStyle={styles.homeScrollContent}
        nestedScrollEnabled
        scrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        onScroll={(event) => {
          const y = event?.nativeEvent?.contentOffset?.y || 0;
          if (y > 420 && !showScrollTop) setShowScrollTop(true);
          if (y <= 420 && showScrollTop) setShowScrollTop(false);
        }}
        scrollEventThrottle={16}
      >
        {/* Test Details Card */}
        {testDetails && (
          <TouchableOpacity
            style={styles.testDetailsCard}
            onPress={() => navigation.navigate('EditTestDetails')}
          >
            <View style={styles.testDetailsContent}>
              <View>
                <Text style={styles.testDetailsLabel}>Test Type</Text>
                <Text style={styles.testDetailsValue}>
                  {testDetails.testType === 'highschool' ? '🏫 High School Civics' : testDetails.testType === 'naturalization100' ? '🏛️ Naturalization (100Q)' : '🇺🇸 Naturalization (128Q)'}
                </Text>
              </View>
              <View style={styles.testDetailsSeparator} />
              <View>
                <Text style={styles.testDetailsLabel}>Location</Text>
                <Text style={styles.testDetailsValue}>📍 {testDetails.location}</Text>
              </View>
              <View style={styles.testDetailsSeparator} />
              <View>
                <Text style={styles.testDetailsLabel}>Test Date</Text>
                <Text style={styles.testDetailsValue}>📅 {testDetails.testDate}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#A78BFA" />
          </TouchableOpacity>
        )}

        {studyPlan && (
          <View style={styles.studyPlanCard}>
            <View style={styles.studyPlanHeaderRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#34D399" />
              <Text style={styles.studyPlanCardTitle}>Auto Study Plan</Text>
            </View>
            <Text style={styles.studyPlanCardLine}>Days left: {studyPlan.daysUntilTest}</Text>
            <Text style={styles.studyPlanCardLine}>Questions per day: {studyPlan.questionsPerDay}</Text>
            <Text style={styles.studyPlanCardLine}>Weekly target: {studyPlan.targetWeeklyQuestions}</Text>
            <Text style={styles.studyPlanCardHint}>Review every {studyPlan.reviewEvery} day(s). {studyPlan.focus}</Text>
          </View>
        )}

        {showSpatialPath ? (
          <View style={styles.focusPresetCard}>
            <Text style={styles.focusPresetTitle}>Spatial Study Route (Beta)</Text>
            <Text style={styles.focusPresetSubtitle}>Snap through your 3-step path. If unavailable, Home falls back automatically.</Text>
            <ThreeDPath
              studyRoute={spatialStudyRoute}
              focusVelocity={Number(adRuntime?.focusTelemetry?.focusVelocity || 0)}
              onStepEnter={handleSpatialStepEnter}
              onAdaptivePacingNudge={() => {
                trackAppEvent(APP_EVENT_NAMES.QUIZ_BREAK_NUDGE_SHOWN, {
                  quiz_type: testDetails?.testType || 'naturalization128',
                  from_screen: 'HomeTab',
                  source: 'threeDPath',
                  reason: 'fast-scroll-no-step-entry',
                });
              }}
              onRuntimeFailure={handleSpatialPathRuntimeFailure}
            />
          </View>
        ) : (
          <View style={styles.focusPresetCard}>
            {ENABLE_SPATIAL_HOME_PATH && spatialPathFailed ? (
              <View style={styles.homeBetaFallbackBadge}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#FDE68A" />
                <Text style={styles.homeBetaFallbackBadgeText}>Beta fallback active</Text>
              </View>
            ) : null}
            <Text style={styles.focusPresetTitle}>Focus Presets</Text>
            <Text style={styles.focusPresetSubtitle}>Pick the energy level you have right now.</Text>
            <View style={styles.focusPresetRow}>
              <TouchableOpacity
                style={styles.focusPresetButton}
                onPress={() => startFocusPreset({ count: 5, label: '3-minute quick reset', focusMode: 'minimal' })}
              >
                <Text style={styles.focusPresetButtonTitle}>3 min</Text>
                <Text style={styles.focusPresetButtonMeta}>Quick reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.focusPresetButton}
                onPress={() => startFocusPreset({ count: 8, label: '7-minute focus sprint', focusMode: 'minimal' })}
              >
                <Text style={styles.focusPresetButtonTitle}>7 min</Text>
                <Text style={styles.focusPresetButtonMeta}>Focus sprint</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.focusPresetButton}
                onPress={() => startFocusPreset({ count: 12, label: '12-minute deep practice', focusMode: null })}
              >
                <Text style={styles.focusPresetButtonTitle}>12 min</Text>
                <Text style={styles.focusPresetButtonMeta}>Deep practice</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Big CTA Button - Quiz Mode */}
        <TouchableOpacity
          onPress={() => {
            clearPausedSession();
            navigation.navigate('Quiz', { type: testDetails?.testType || 'naturalization128' });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <MaterialCommunityIcons name="play-circle" size={32} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.ctaButtonText}>Start Practice Quiz</Text>
              <Text style={styles.ctaButtonSub}>
                {testDetails?.testType === 'highschool' ? 'High School Civics' : testDetails?.testType === 'naturalization100' ? 'Naturalization (100Q)' : 'Naturalization (128Q)'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            clearPausedSession();
            trackAppEvent(APP_EVENT_NAMES.HOME_LISTEN_CTA_CLICKED, {
              from_screen: 'HomeTab',
            });
            navigation.navigate('Quiz', {
              type: testDetails?.testType || 'naturalization128',
              listenMode: true,
            });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#06B6D4', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ctaButton, styles.listenCtaButton]}
          >
            <MaterialCommunityIcons name="volume-high" size={32} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.ctaButtonText}>Start Listen Mode</Text>
              <Text style={styles.ctaButtonSub}>Listen to each question with speed and repeat controls</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Interview Mode CTA Button */}
        <TouchableOpacity
          onPress={() => {
            clearPausedSession();
            trackAppEvent(APP_EVENT_NAMES.HOME_INTERVIEW_CTA_CLICKED, {
              from_screen: 'HomeTab',
            });
            navigation.navigate('Interview');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.interviewCtaButton}
          >
            <MaterialCommunityIcons name="microphone-outline" size={28} color="#fff" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.interviewCtaButtonText}>Start Interview Mode</Text>
              <Text style={styles.interviewCtaButtonSub}>🎤 Answer with your voice • Get instant feedback</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {pausedSession && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={async () => {
              try {
                await maybeShowInterstitial('resume');
              } catch (error) {
                console.log('Resume ad failed, continuing to quiz:', error);
              } finally {
                navigation.navigate('Quiz', { type: pausedSession.type, resumeSession: true });
              }
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="play-box-multiple-outline" size={24} color="#34D399" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.resumeButtonTitle}>Resume Paused Session</Text>
              <Text style={styles.resumeButtonSubtitle}>
                Continue from question {pausedSession.current + 1}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.boostsCard}>
          <View style={styles.boostsHeader}>
            <View>
              <Text style={styles.boostsTitle}>Ad-Powered Practice Boosts</Text>
              <Text style={styles.boostsSubtitle}>Optional boosts convert better than passive banners because the value is obvious.</Text>
            </View>
            <MaterialCommunityIcons name="rocket-launch" size={22} color="#A78BFA" />
          </View>
          <View style={styles.boostsGrid}>
            <View style={styles.boostMetricCard}>
              <Text style={styles.boostMetricLabel}>Available now</Text>
              <Text style={styles.boostMetricValue}>{availableBoostsNow}</Text>
              <Text style={styles.boostMetricHint}>Sprint + daily pack</Text>
            </View>
            <View style={styles.boostMetricCard}>
              <Text style={styles.boostMetricLabel}>Claimed so far</Text>
              <Text style={styles.boostMetricValue}>{totalBoostsClaimed}</Text>
              <Text style={styles.boostMetricHint}>Rewarded completions</Text>
            </View>
          </View>
        </View>

        <View style={styles.homeKpiCard}>
          <View style={styles.homeKpiHeader}>
            <Text style={styles.homeKpiTitle}>Rewarded Revenue Pulse</Text>
            <MaterialCommunityIcons name="chart-line" size={18} color="#2DD4BF" />
          </View>
          <View style={styles.homeKpiMetricsRow}>
            <View style={styles.homeKpiMetricBox}>
              <Text style={styles.homeKpiMetricLabel}>Rewarded CVR</Text>
              <Text style={styles.homeKpiMetricValue}>{rewardedConversionRate}%</Text>
            </View>
            <View style={styles.homeKpiMetricBox}>
              <Text style={styles.homeKpiMetricLabel}>Sprint unlocks</Text>
              <Text style={styles.homeKpiMetricValue}>{analytics.rewardedSprintUnlocks || 0}</Text>
            </View>
          </View>
          <Text style={styles.homeKpiInsight}>
            Winning copy: {homeSprintCopyLeader ? `${homeSprintCopyLeader.variantName} at ${homeSprintCopyLeader.conversionRate}% CVR` : 'collecting data'}
          </Text>
          <Text style={styles.homeKpiInsight}>
            Winning reward: {homeSprintRewardLeader ? `${homeSprintRewardLeader.variantName} at ${homeSprintRewardLeader.conversionRate}% CVR` : 'collecting data'}
          </Text>
          <Text style={styles.homeKpiInsight}>
            Revenue cohort: {revenueTreatmentEnabled ? 'treatment' : 'holdout baseline'}
          </Text>
        </View>

        <TouchableOpacity style={styles.rewardedHomeButton} onPress={handleWatchAdForSprint}>
          <MaterialCommunityIcons name="gift-outline" size={22} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.rewardedHomeTitle}>{homeSprintCopy.title}</Text>
            <Text style={styles.rewardedHomeSubtitle}>{homeSprintCopy.subtitle} • Current reward: {sprintRewardLabel}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rewardedHomeButton, freePackUnlockedToday && styles.rewardedHomeButtonDisabled]}
          onPress={handleDailyFreePackUnlock}
          disabled={freePackUnlockedToday}
        >
          <MaterialCommunityIcons name="calendar-star" size={22} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.rewardedHomeTitle}>Daily Free Pack Unlock</Text>
            <Text style={styles.rewardedHomeSubtitle}>
              {freePackUnlockedToday
                ? 'Already unlocked today - back tomorrow'
                : freePackCooldownMs > 0
                  ? `Cooldown active (${freePackCooldownMinutes} min)`
                  : `Watch ad to unlock ${FREE_PACK_QUESTION_COUNT} bonus questions`}
            </Text>
            {freePackCooldownMs > 0 && !freePackUnlockedToday && (
              <View style={styles.countdownBadge}>
                <MaterialCommunityIcons name="timer-sand" size={14} color="#C4B5FD" />
                <Text style={styles.countdownBadgeText}>{cooldownHHMM}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {revenueTreatmentEnabled && comebackEligibleWindow ? (
          <TouchableOpacity
            style={[styles.rewardedHomeButton, comebackClaimedToday && styles.rewardedHomeButtonDisabled]}
            onPress={handleClaimComebackReward}
            disabled={comebackClaimedToday}
          >
            <MaterialCommunityIcons name="backup-restore" size={22} color="#fff" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.rewardedHomeTitle}>Comeback Reward {String(comebackEligibleWindow).toUpperCase()}</Text>
              <Text style={styles.rewardedHomeSubtitle}>
                {comebackClaimedToday
                  ? 'Already claimed today'
                  : `Claim your ${comebackRewardLabel} after returning to practice`}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#FBBF24' }]}>
            <MaterialCommunityIcons name="book" size={28} color="#FBBF24" />
            <Text style={styles.statLabel}>Questions</Text>
            <Text style={styles.statValue}>{userStats.questionsAnswered}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
            <MaterialCommunityIcons name="target" size={28} color="#8B5CF6" />
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{userStats.accuracy}%</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#F472B6' }]}>
            <MaterialCommunityIcons name="clock" size={28} color="#F472B6" />
            <Text style={styles.statLabel}>Studied</Text>
            <Text style={styles.statValue}>{userStats.timeSpent}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#34D399' }]}>
            <MaterialCommunityIcons name="fire" size={28} color="#34D399" />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{user.streak} days</Text>
          </View>
        </View>

        {/* Adaptive Learning Path Card */}
        <View style={[styles.card, styles.adaptiveCard]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={24} color="#A78BFA" />
            <Text style={styles.cardTitle}>Your Adaptive Learning Path</Text>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Performance Trend</Text>
            <View style={styles.trendBadge}>
              <MaterialCommunityIcons name="trending-up" size={16} color="#34D399" />
              <Text style={styles.trendText}>Stable</Text>
            </View>
          </View>

          <View style={[styles.progressItem, { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }]}>
            <Text style={styles.progressLabel}>Next Milestone</Text>
            <Text style={styles.milestoneText}>Complete 50 questions with 80%+ accuracy</Text>
          </View>

          <Text style={styles.confidenceText}>AI Confidence: 85% • Last updated: 1/22/2026</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Error Bank tracking will be available after you complete a quiz!')}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#F87171" />
            <Text style={styles.actionButtonText}>Practice Error Bank</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ModeSelector')}>
            <MaterialCommunityIcons name="target" size={20} color="#FBBF24" />
            <Text style={styles.actionButtonText}>Practice by Topic</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MasteryMap')}>
            <MaterialCommunityIcons name="chart-bubble" size={20} color="#38BDF8" />
            <Text style={styles.actionButtonText}>Mastery Map & Heatmap</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Family')}>
            <MaterialCommunityIcons name="account-group" size={20} color="#C084FC" />
            <Text style={styles.actionButtonText}>Squad Challenge Hub</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CaseProgress')}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#60A5FA" />
            <Text style={styles.actionButtonText}>Case Progress Tracker</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementGrid}>
            {achievements.slice(0, 3).map((ach) => (
              <TouchableOpacity key={ach.id} style={styles.achievementBadge} activeOpacity={0.7}>
                <Text style={styles.achievementEmoji}>{ach.icon}</Text>
                <Text style={styles.achievementName}>{ach.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <HomeBannerAd />
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity
          style={styles.homeScrollTopButton}
          activeOpacity={0.9}
          onPress={() => homeScrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <MaterialCommunityIcons name="arrow-up" size={18} color="#fff" />
          <Text style={styles.homeScrollTopButtonText}>Top</Text>
        </TouchableOpacity>
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

export default HomeScreen;
