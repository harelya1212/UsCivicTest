import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import {
  buildSevenDayRevenueTrend,
} from '../utils/helpers';
import {
  usStates,
  APP_EVENT_NAMES,
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
    resetAdAnalytics,
    setPinnedOfferVariant,
    resetOfferVariantStats,
    trackAppEvent,
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

  const verificationMode = getAnalyticsVerificationMode();
  const analyticsFunnelRows = [
    { key: APP_EVENT_NAMES.QUIZ_STARTED, label: 'Quiz Started' },
    { key: APP_EVENT_NAMES.QUESTION_ANSWERED, label: 'Questions Answered' },
    { key: APP_EVENT_NAMES.HOME_LISTEN_CTA_CLICKED, label: 'Home Listen CTA Clicked' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_PLAYED, label: 'Quiz TTS Played' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_REPEATED, label: 'Quiz TTS Repeated' },
    { key: APP_EVENT_NAMES.QUIZ_TTS_SPEED_CHANGED, label: 'Quiz TTS Speed Changed' },
    { key: APP_EVENT_NAMES.INTERVIEW_STARTED, label: 'Interview Started' },
    { key: APP_EVENT_NAMES.INTERVIEW_PROMPT_PLAYED, label: 'Interview Prompt Played' },
    { key: APP_EVENT_NAMES.INTERVIEW_RECORDING_STARTED, label: 'Interview Recording Started' },
    { key: APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED, label: 'Interview Responses' },
    { key: APP_EVENT_NAMES.INTERVIEW_SCORE_REVEALED, label: 'Interview Score Revealed' },
    { key: APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SHOWN, label: 'Follow-Ups Shown' },
    { key: APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED, label: 'Follow-Ups Completed' },
    { key: APP_EVENT_NAMES.INTERVIEW_SESSION_COMPLETED, label: 'Interview Session Completed' },
    { key: APP_EVENT_NAMES.INTERVIEW_SESSION_EXITED, label: 'Interview Session Exited' },
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
  const interviewStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_STARTED)?.count || 0;
  const interviewRecordingStartedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_RECORDING_STARTED)?.count || 0;
  const interviewResponseCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED)?.count || 0;
  const followUpShownCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SHOWN)?.count || 0;
  const followUpCompletedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED)?.count || 0;
  const interviewCompletedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_SESSION_COMPLETED)?.count || 0;
  const interviewExitedCount = analyticsFunnelRows.find((row) => row.key === APP_EVENT_NAMES.INTERVIEW_SESSION_EXITED)?.count || 0;
  const quizAnswerRate = quizStartedCount ? Math.round((questionAnsweredCount / quizStartedCount) * 100) : 0;
  const interviewResponseRate = interviewStartedCount ? Math.round((interviewResponseCount / interviewStartedCount) * 100) : 0;
  const interviewRecordingStartRate = interviewStartedCount ? Math.round((interviewRecordingStartedCount / interviewStartedCount) * 100) : 0;
  const interviewCompletionRate = interviewStartedCount ? Math.round((interviewCompletedCount / interviewStartedCount) * 100) : 0;
  const listenUsageRate = listenCtaCount ? Math.round((quizTtsPlayedCount / listenCtaCount) * 100) : 0;
  const listenRepeatRate = quizTtsPlayedCount ? Math.round((quizTtsRepeatedCount / quizTtsPlayedCount) * 100) : 0;
  const listenSpeedChangeRate = quizTtsPlayedCount ? Math.round((quizTtsSpeedChangedCount / quizTtsPlayedCount) * 100) : 0;
  const recentAnalyticsEvents = analyticsDebugEvents.slice(0, 8);

  const analytics = adRuntime.analytics || {};
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
  const offerVariantStats = adRuntime.offerVariantStats || {};
  const offerVariantRows = OFFER_VARIANT_GROUPS.map((group) => {
    const variants = offerVariantStats[group.key] || {};
    const names = Object.keys(variants);
    const totals = names.reduce((acc, variantName) => {
      const variant = variants[variantName] || { attempts: 0, completions: 0 };
      return {
        attempts: acc.attempts + (variant.attempts || 0),
        completions: acc.completions + (variant.completions || 0),
      };
    }, { attempts: 0, completions: 0 });
    const rankedVariants = names
      .map((variantName) => {
        const variant = variants[variantName] || { attempts: 0, completions: 0 };
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
      variants,
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
    };
  });
  const homeSprintAttemptCount = analytics.rewardedHomeSprintAttempts || 0;
  const homeSprintAttemptProgress = Math.min(30, homeSprintAttemptCount);
  const homeSprintAttemptPct = Math.round((homeSprintAttemptProgress / 30) * 100);
  const homeSprintRewardGroup = offerVariantRows.find((group) => group.key === 'homeSprintReward');
  const rewardWinnerReady = Boolean(
    homeSprintRewardGroup?.leader
    && homeSprintRewardGroup?.runnerUp
    && homeSprintRewardGroup.totals.attempts >= 15
    && homeSprintRewardGroup.cvrDeltaPctPoints >= 5
    && homeSprintRewardGroup.highConfidenceSuggestion
  );

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
      const events = await fetchRecentAnalyticsDebugEvents(25);
      setAnalyticsDebugEvents(events);
    } catch (error) {
      setAnalyticsDebugError(error?.message || 'Failed to load analytics debug events.');
    } finally {
      setAnalyticsDebugLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalyticsDebugEvents();
  }, []);

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

    setTimeout(() => {
      void loadAnalyticsDebugEvents();
    }, 800);

    Alert.alert('Sent', 'Synthetic Listen-mode validation events sent. Refresh if needed.');
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

            <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 10 }]} onPress={sendListenValidationEvents}>
              <Text style={styles.buttonText}>Send Listen Validation Events</Text>
            </TouchableOpacity>

            {analyticsDebugError ? (
              <Text style={[styles.adminMetricSubtext, { color: '#B91C1C', marginTop: 10 }]}>{analyticsDebugError}</Text>
            ) : null}

            <View style={{ marginTop: 12 }}>
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
                    <MaterialCommunityIcons name="pulse" size={18} color="#0F766E" />
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
            <Text style={styles.adminMetricSubtext}>1. Reset rewarded offer tests, then drive 15-30 Home Sprint unlocks.</Text>
            <Text style={styles.adminMetricSubtext}>Home Sprint traffic progress: {homeSprintAttemptCount}/30 attempts ({homeSprintAttemptPct}%)</Text>
            <Text style={styles.adminMetricSubtext}>
              2. If reward winner is clear, pin reward first before copy.
              {rewardWinnerReady
                ? ` Current recommendation: pin ${VARIANT_LABELS[homeSprintRewardGroup.leader.variantName] || homeSprintRewardGroup.leader.variantName}.`
                : ' Current recommendation: keep collecting traffic.'}
            </Text>
            {rewardWinnerReady && homeSprintRewardGroup?.leader && (
              <View style={styles.adminSuggestionBadge}>
                <MaterialCommunityIcons name="auto-fix" size={14} color="#065F46" />
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
            {offerVariantRows.map((group) => {
              return (
                <View key={group.key} style={{ marginBottom: 12 }}>
                  <Text style={styles.adminMetricLabel}>{group.label}</Text>
                  <Text style={styles.adminMetricSubtext}>
                    Delivery mode: {group.pinnedVariantName ? `Pinned to ${VARIANT_LABELS[group.pinnedVariantName] || group.pinnedVariantName}` : 'Auto rotation'}
                  </Text>
                  <View style={[styles.pickerContainer, { marginTop: 8, marginBottom: 8 }]}>
                    <Picker
                      selectedValue={group.pinnedVariantName || AUTO_VARIANT_VALUE}
                      onValueChange={(value) => setPinnedOfferVariant(group.key, value === AUTO_VARIANT_VALUE ? null : value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Auto rotate" value={AUTO_VARIANT_VALUE} />
                      {group.variants.map((variantName) => (
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
                    const variant = group.variants[variantName] || { attempts: 0, completions: 0 };
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
                      <MaterialCommunityIcons name="auto-fix" size={14} color="#065F46" />
                      <Text style={styles.adminSuggestionBadgeText}>
                        Auto-suggestion: Pin {VARIANT_LABELS[group.leader.variantName] || group.leader.variantName}
                      </Text>
                    </View>
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
