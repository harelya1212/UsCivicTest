import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import { AD_EVENT_NAMES, APP_EVENT_NAMES, RECOVERY_CAMPAIGN_STORAGE_PREFIX } from '../constants';
import {
  showRewardedAd,
} from '../adMobService';
import { playAdStartFeedback, playHighScoreFeedback } from '../utils/audioHaptics';

const OFFER_VARIANT_ALLOWED = Object.freeze({
  reviewBonusOffer: ['control', 'challenge'],
  reviewWeakOffer: ['control', 'coach'],
});

function sanitizeVariant(variantKey, candidate) {
  const options = OFFER_VARIANT_ALLOWED[variantKey] || [];
  if (options.includes(candidate)) {
    return { value: candidate, fallbackApplied: false, fallbackFrom: null };
  }

  const fallback = options[0] || 'control';
  return { value: fallback, fallbackApplied: true, fallbackFrom: String(candidate || '') };
}

function ReviewScreen({ route, navigation }) {
  const { trackAdEvent, trackAppEvent, getOfferVariant, adRuntime } = useContext(AppDataContext);
  const { score, total, type, weak } = route.params;
  const percentage = Math.round((score / total) * 100);
  const weakScoreThreshold = 70;
  const isWeakScoreSession = percentage < weakScoreThreshold;
  const weakestTopic = weak?.[0]?.topic || null;
  const recoveryCampaignCompleted = Boolean(route?.params?.recoveryCampaignCompleted);
  const recoveryStepNumber = Number(route?.params?.recoveryStepNumber || 0);
  const recoveryTopic = route?.params?.recoveryTopic ? String(route.params.recoveryTopic) : null;
  const recoveryStorageKey = `${RECOVERY_CAMPAIGN_STORAGE_PREFIX}.${String(type || 'default')}`;
  const personalBestStorageKey = `civics.personalBestPct.${String(type || 'default')}`;
  const revenueExperiment = adRuntime?.experimentCohorts?.revenueIntelligence || {};
  const revenueOverride = String(revenueExperiment?.overrideCohort || '').trim().toLowerCase();
  const revenueCohort = (revenueOverride === 'treatment' || revenueOverride === 'holdout')
    ? revenueOverride
    : String(revenueExperiment?.cohort || 'treatment');
  const reviewBonusVariantResult = sanitizeVariant('reviewBonusOffer', getOfferVariant('reviewBonusOffer'));
  const reviewWeakVariantResult = sanitizeVariant('reviewWeakOffer', getOfferVariant('reviewWeakOffer'));
  const reviewBonusVariant = reviewBonusVariantResult.value;
  const reviewWeakVariant = reviewWeakVariantResult.value;
  const [showWeakScoreUpsell, setShowWeakScoreUpsell] = useState(false);
  const [recoveryCampaign, setRecoveryCampaign] = useState({
    completedSessions: 0,
    lastTopic: null,
    updatedAt: null,
    stepTimestamps: { 1: null, 2: null, 3: null },
  });
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(true);
  const reviewBonusLabel = reviewBonusVariant === 'challenge'
    ? 'One More Round: 5 Bonus Questions'
    : 'Watch Ad for 5 Bonus Questions';
  const reviewWeakLabel = reviewWeakVariant === 'coach'
    ? (weakestTopic ? `Fix ${weakestTopic} Now` : 'Fix Your Weak Area Now')
    : (weakestTopic ? `Watch Ad: Rescue ${weakestTopic}` : 'Watch Ad: Weak Area Rescue');
  const reviewBonusBody = reviewBonusVariant === 'challenge'
    ? 'Finish strong with a short bonus set while your momentum is still high.'
    : 'Use rewarded ads only at high-intent moments: short bonus drills or immediate weak-area rescue.';

  useEffect(() => {
    trackAppEvent(APP_EVENT_NAMES.REVIEW_REVENUE_RUNTIME_EXPOSED, {
      cohort: revenueCohort,
      review_bonus_variant: reviewBonusVariant,
      review_weak_variant: reviewWeakVariant,
      weak_score_session: isWeakScoreSession,
    });
  }, [
    isWeakScoreSession,
    revenueCohort,
    reviewBonusVariant,
    reviewWeakVariant,
    trackAppEvent,
  ]);

  useEffect(() => {
    if (reviewBonusVariantResult.fallbackApplied) {
      trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, {
        screen: 'review',
        variant_key: 'reviewBonusOffer',
        requested_variant: reviewBonusVariantResult.fallbackFrom,
        fallback_variant: reviewBonusVariant,
      });
    }
    if (reviewWeakVariantResult.fallbackApplied) {
      trackAppEvent(APP_EVENT_NAMES.EXPERIMENT_VARIANT_FALLBACK_APPLIED, {
        screen: 'review',
        variant_key: 'reviewWeakOffer',
        requested_variant: reviewWeakVariantResult.fallbackFrom,
        fallback_variant: reviewWeakVariant,
      });
    }
  }, [
    reviewBonusVariant,
    reviewBonusVariantResult.fallbackApplied,
    reviewBonusVariantResult.fallbackFrom,
    reviewWeakVariant,
    reviewWeakVariantResult.fallbackApplied,
    reviewWeakVariantResult.fallbackFrom,
    trackAppEvent,
  ]);

  useEffect(() => {
    if (!isWeakScoreSession) return undefined;

    trackAdEvent(AD_EVENT_NAMES.WEAK_SCORE_UPSELL_ELIGIBLE);
    const timerId = setTimeout(() => {
      setShowWeakScoreUpsell(true);
      trackAdEvent(AD_EVENT_NAMES.WEAK_SCORE_UPSELL_SHOWN);
    }, 1400);

    return () => clearTimeout(timerId);
  }, [isWeakScoreSession]);

  useEffect(() => {
    let mounted = true;

    const loadRecoveryCampaign = async () => {
      try {
        const raw = await AsyncStorage.getItem(recoveryStorageKey);
        if (!mounted) return;
        if (!raw) {
          setRecoveryCampaign({
            completedSessions: 0,
            lastTopic: null,
            updatedAt: null,
            stepTimestamps: { 1: null, 2: null, 3: null },
          });
          return;
        }

        const parsed = JSON.parse(raw);
        setRecoveryCampaign({
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
        console.log('Failed to load recovery campaign state', error);
      } finally {
        if (mounted) setIsRecoveryLoading(false);
      }
    };

    void loadRecoveryCampaign();
    return () => {
      mounted = false;
    };
  }, [recoveryStorageKey]);

  useEffect(() => {
    let mounted = true;

    const maybeCelebrateHighScore = async () => {
      try {
        const raw = await AsyncStorage.getItem(personalBestStorageKey);
        const previousBest = Number(raw || 0);
        if (percentage > previousBest) {
          await AsyncStorage.setItem(personalBestStorageKey, String(percentage));
          if (mounted) {
            playHighScoreFeedback();
          }
        }
      } catch (error) {
        console.log('Failed to check personal best score', error);
      }
    };

    void maybeCelebrateHighScore();
    return () => {
      mounted = false;
    };
  }, [percentage, personalBestStorageKey]);

  useEffect(() => {
    if (!recoveryCampaignCompleted || recoveryStepNumber <= 0) return;

    let mounted = true;
    const updateRecoveryCompletion = async () => {
      try {
        const completedAt = new Date().toISOString();
        const nextCompleted = Math.min(3, Math.max(recoveryCampaign.completedSessions, recoveryStepNumber));
        const payload = {
          completedSessions: nextCompleted,
          lastTopic: recoveryTopic || weakestTopic || recoveryCampaign.lastTopic || null,
          updatedAt: completedAt,
          stepTimestamps: {
            1: recoveryCampaign.stepTimestamps?.[1] || null,
            2: recoveryCampaign.stepTimestamps?.[2] || null,
            3: recoveryCampaign.stepTimestamps?.[3] || null,
            [recoveryStepNumber]: completedAt,
          },
        };
        await AsyncStorage.setItem(recoveryStorageKey, JSON.stringify(payload));
        if (!mounted) return;
        setRecoveryCampaign(payload);

        trackAppEvent(APP_EVENT_NAMES.RECOVERY_SESSION_COMPLETED, {
          quiz_type: type,
          recovery_step: recoveryStepNumber,
          completed_sessions: nextCompleted,
          recovery_topic: payload.lastTopic || 'unknown',
        });
      } catch (error) {
        console.log('Failed to persist recovery completion', error);
      }
    };

    void updateRecoveryCompletion();
    return () => {
      mounted = false;
    };
  }, [
    recoveryCampaignCompleted,
    recoveryStepNumber,
    recoveryTopic,
    recoveryCampaign.completedSessions,
    recoveryCampaign.lastTopic,
    recoveryCampaign.stepTimestamps,
    recoveryStorageKey,
    trackAppEvent,
    type,
    weakestTopic,
  ]);

  const nextRecoveryStep = Math.min(3, recoveryCampaign.completedSessions + 1);
  const recoveryComplete = recoveryCampaign.completedSessions >= 3;
  const recoveryStepLabel = recoveryComplete ? 'Recovery Path Complete' : `Start Recovery Session ${nextRecoveryStep}/3`;
  const formatRecoveryTs = (value) => (value ? new Date(value).toLocaleString() : 'Pending');

  const launchRecoverySession = (step, usesRewarded) => {
    const selectedTopic = weakestTopic || recoveryCampaign.lastTopic;
    if (!selectedTopic) {
      Alert.alert('No Weak Topic Yet', 'Finish a few more sessions to unlock topic-specific recovery drills.');
      return;
    }

    trackAppEvent(APP_EVENT_NAMES.RECOVERY_SESSION_STARTED, {
      quiz_type: type,
      recovery_step: step,
      total_steps: 3,
      recovery_topic: selectedTopic,
      ad_mode: usesRewarded ? 'rewarded' : 'ad-light',
    });

    navigation.replace('Quiz', {
      type,
      topicFilter: selectedTopic,
      forceQuestionCount: 8,
      focusMode: 'minimal',
      recoveryCampaignActive: true,
      recoveryStepNumber: step,
    });
  };

  const startRecoveryCampaignStep = async () => {
    if (recoveryComplete) {
      Alert.alert('Recovery Complete', 'You already finished the 3-session recovery path. Great work.');
      return;
    }

    if (nextRecoveryStep === 1) {
      launchRecoverySession(nextRecoveryStep, false);
      return;
    }

    try {
      await playAdStartFeedback();
      trackAdEvent(AD_EVENT_NAMES.REWARDED_ATTEMPT);
      await showRewardedAd();
      trackAdEvent(AD_EVENT_NAMES.REWARDED_COMPLETED);
      launchRecoverySession(nextRecoveryStep, true);
    } catch (error) {
      trackAdEvent(AD_EVENT_NAMES.REWARDED_FAILED_OR_CLOSED);
      console.log('User cancelled ad or ad failed');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scored ${percentage}% on the US Civic ${type} test! Challenge me on Civics Coach! 🇺🇸`,
        url: 'https://civics-coach.app',
        title: 'Civics Coach Challenge',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const watchAdForBonusQuestions = async () => {
    trackAdEvent(AD_EVENT_NAMES.REWARDED_ATTEMPT);
    trackAdEvent({
      eventName: AD_EVENT_NAMES.REWARDED_REVIEW_BONUS_ATTEMPT,
      variantKey: 'reviewBonusOffer',
      variantName: reviewBonusVariant,
      phase: 'attempt',
    });
    try {
      await playAdStartFeedback();
      await showRewardedAd();
      trackAdEvent(AD_EVENT_NAMES.REWARDED_COMPLETED);
      trackAdEvent({
        eventName: AD_EVENT_NAMES.REWARDED_BONUS_UNLOCK,
        variantKey: 'reviewBonusOffer',
        variantName: reviewBonusVariant,
        phase: 'complete',
      });
      Alert.alert('Bonus Questions Unlocked', 'Starting a short bonus drill now.');
      navigation.replace('Quiz', {
        type,
        forceQuestionCount: 5,
        focusMode: 'minimal',
      });
    } catch (error) {
      trackAdEvent(AD_EVENT_NAMES.REWARDED_FAILED_OR_CLOSED);
      console.log('User cancelled ad or ad failed');
    }
  };

  const watchAdForWeakAreaRescue = async () => {
    if (!weakestTopic) {
      Alert.alert('No Weak Topic Yet', 'Finish a few more sessions to unlock topic-specific rescue drills.');
      return;
    }

    trackAdEvent(AD_EVENT_NAMES.REWARDED_ATTEMPT);
    trackAdEvent({
      eventName: AD_EVENT_NAMES.REWARDED_REVIEW_WEAK_ATTEMPT,
      variantKey: 'reviewWeakOffer',
      variantName: reviewWeakVariant,
      phase: 'attempt',
    });
    try {
      await playAdStartFeedback();
      await showRewardedAd();
      trackAdEvent(AD_EVENT_NAMES.REWARDED_COMPLETED);
      trackAdEvent({
        eventName: AD_EVENT_NAMES.REWARDED_REVIEW_WEAK_UNLOCK,
        variantKey: 'reviewWeakOffer',
        variantName: reviewWeakVariant,
        phase: 'complete',
      });
      navigation.replace('Quiz', {
        type,
        topicFilter: weakestTopic,
        forceQuestionCount: 8,
        focusMode: 'minimal',
      });
    } catch (error) {
      trackAdEvent(AD_EVENT_NAMES.REWARDED_FAILED_OR_CLOSED);
      console.log('User cancelled ad or ad failed');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.reviewContainer}>
        <View style={styles.celebrationBox}>
          <Text style={styles.celebrationEmoji}>{percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}</Text>
          <Text style={styles.scoreTitle}>Quiz Complete!</Text>
          <Text style={styles.scoreValue}>{score}/{total}</Text>
          <Text style={styles.scorePercent}>{percentage}%</Text>

          {percentage >= 80 && <Text style={styles.praises}>Excellent work! You're crushing it!</Text>}
          {percentage >= 60 && percentage < 80 && <Text style={styles.praises}>Great effort! Keep practicing!</Text>}
          {percentage < 60 && <Text style={styles.praises}>Don't give up! Review weak areas and try again!</Text>}
        </View>

        {weak.length > 0 && (
          <View style={[styles.card, styles.weakCard]}>
            <Text style={styles.cardTitle}>📊 Focus Areas for Next Time</Text>
            {weak.map((item) => (
              <View key={item.topic} style={styles.weakItem}>
                <Text style={styles.weakTopic}>{item.topic}</Text>
                <View style={styles.weakBar}>
                  <View style={[styles.weakBarFill, { width: `${item.ratio * 100}%` }]} />
                </View>
                <Text style={styles.weakPercent}>{(item.ratio * 100).toFixed(0)}% needs work</Text>
              </View>
            ))}
          </View>
        )}

        {isWeakScoreSession && !showWeakScoreUpsell && (
          <View style={[styles.card, styles.reviewUpsellWaitCard]}>
            <Text style={styles.cardTitle}>🔎 Checking your recovery path</Text>
            <Text style={styles.bonusText}>You had a weak-score session, so we are prioritizing a targeted recovery offer instead of a generic upsell.</Text>
          </View>
        )}

        {isWeakScoreSession && showWeakScoreUpsell && (
          <View style={[styles.card, styles.bonusCard]}>
            <View style={styles.reviewUpsellHeader}>
              <Text style={styles.cardTitle}>🎯 Recovery Round Ready</Text>
              <View style={styles.reviewUpsellTag}>
                <Text style={styles.reviewUpsellTagText}>Weak-score only</Text>
              </View>
            </View>
            <Text style={styles.bonusText}>{reviewBonusBody}</Text>
            <View style={styles.rewardedOfferStack}>
              <TouchableOpacity
                style={styles.rewardedAdButton}
                onPress={watchAdForBonusQuestions}
              >
                <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
                <Text style={styles.rewardedAdText}>{reviewBonusLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rewardedAdButton, styles.rewardedAdButtonSecondary]}
                onPress={watchAdForWeakAreaRescue}
              >
                <MaterialCommunityIcons name="target" size={20} color="#fff" />
                <Text style={styles.rewardedAdText}>{reviewWeakLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {(isWeakScoreSession || recoveryCampaign.completedSessions > 0) && (
          <View style={[styles.card, styles.bonusCard]}>
            <View style={styles.reviewUpsellHeader}>
              <Text style={styles.cardTitle}>🧭 3-Session Recovery Path</Text>
              <View style={styles.reviewUpsellTag}>
                <Text style={styles.reviewUpsellTagText}>{recoveryCampaign.completedSessions}/3 complete</Text>
              </View>
            </View>
            <Text style={styles.bonusText}>
              Session 1 is ad-light. Sessions 2-3 use rewarded unlock to keep recovery high-intent.
            </Text>
            <Text style={styles.bonusText}>
              Target topic: {weakestTopic || recoveryCampaign.lastTopic || 'pending weak-topic detection'}
            </Text>
            <View style={{ marginTop: 6, marginBottom: 10 }}>
              <Text style={styles.bonusText}>Step 1 completed: {formatRecoveryTs(recoveryCampaign.stepTimestamps?.[1])}</Text>
              <Text style={styles.bonusText}>Step 2 completed: {formatRecoveryTs(recoveryCampaign.stepTimestamps?.[2])}</Text>
              <Text style={styles.bonusText}>Step 3 completed: {formatRecoveryTs(recoveryCampaign.stepTimestamps?.[3])}</Text>
            </View>

            <TouchableOpacity
              style={[styles.rewardedAdButton, recoveryComplete && styles.rewardedAdButtonSecondary]}
              onPress={startRecoveryCampaignStep}
              disabled={isRecoveryLoading}
            >
              <MaterialCommunityIcons name={recoveryComplete ? 'check-circle' : 'rocket-launch'} size={20} color="#fff" />
              <Text style={styles.rewardedAdText}>
                {isRecoveryLoading ? 'Loading Recovery State...' : recoveryStepLabel}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Back Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff', marginLeft: 8 }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ReviewScreen;
