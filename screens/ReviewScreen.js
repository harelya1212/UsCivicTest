/**
 * ReviewScreen (rebuilt) - Duolingo-style quiz results.
 *
 * Celebratory hero with the score, focus-area cards for weak topics,
 * the 3-session recovery path, and rewarded practice actions.
 * All business logic (recovery campaign, offer variants, rewarded ads,
 * personal best, analytics) is unchanged from the previous version.
 */
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataContext';
import { AD_EVENT_NAMES, APP_EVENT_NAMES, RECOVERY_CAMPAIGN_STORAGE_PREFIX } from '../constants';
import {
  showRewardedAd,
} from '../adMobService';
import { playAdStartFeedback, playHighScoreFeedback } from '../utils/audioHaptics';
import Screen from '../components/ui/Screen';
import BannerAd from '../components/ui/BannerAd';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import HomeButton from '../components/ui/HomeButton';
import ShareScoreCard, { buildShareMessage } from '../components/ShareScoreCard';
import ProgressBar from '../components/ui/ProgressBar';
import { colors, gradients, radius, spacing, typography, shadows } from '../theme';

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
  const { trackAdEvent, trackAppEvent, getOfferVariant, adRuntime, errorBank, maybeShowInterstitial, squadSync, userProfile } = useContext(AppDataContext);
  const squadInviteCode = squadSync?.inviteCode || '';
  const shareUserName = userProfile?.name || '';
  const { score = 0, total = 0, type = 'unknown', weak = [] } = route.params || {};
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
  const [shareFeedback, setShareFeedback] = useState(''); // in-app share feedback (web-safe)
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
    const message = buildShareMessage({
      percentage,
      inviteCode: squadInviteCode,
      userName: shareUserName,
    });
    const copyToClipboard = async () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Copied! Your challenge message is copied - paste it anywhere.');
        return true;
      }
      return false;
    };
    try {
      const result = await Share.share({ message, title: 'Civics Coach Challenge' });
      // If the native share sheet actually shared, we're done
      if (result?.action === Share.sharedAction) {
        trackAppEvent?.(APP_EVENT_NAMES.SCORE_SHARED || 'score_shared', { percentage });
        return;
      }
      // Otherwise (dismissed, or web where Share is a no-op) fall back to clipboard
      if (!(await copyToClipboard())) {
        setShareFeedback(message);
      }
      trackAppEvent?.(APP_EVENT_NAMES.SCORE_SHARED || 'score_shared', { percentage });
    } catch (err) {
      try {
        if (!(await copyToClipboard())) {
          setShareFeedback(message);
        }
      } catch {}
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

  const mistakeIds = Array.isArray(route?.params?.mistakeIds)
    ? route.params.mistakeIds.map((id) => String(id))
    : [];

  const reviewMistakes = async () => {
    // Ad policy: 1 interstitial per quiz, shown after results
    await maybeShowInterstitial?.({ trigger: 'quizComplete', sessionQuestionCount: total, score });
    trackAppEvent?.(APP_EVENT_NAMES.QUIZ_RESTARTED_FROM_REVIEW || 'quiz_restarted_from_review', {
      quiz_type: type,
      review_mode: 'mistakes',
      mistake_count: mistakeIds.length,
    });
    navigation.replace('Quiz', { type, questionIds: mistakeIds, focusMode: 'minimal' });
  };

  const practiceAgain = () => {
    trackAppEvent?.(APP_EVENT_NAMES.QUIZ_RESTARTED_FROM_REVIEW || 'quiz_restarted_from_review', {
      quiz_type: type,
    });
    // Preserve the session length (don't jump to a full 128Q test)
    navigation.replace('Quiz', { type, questionCount: total });
  };

  // ---- Presentation helpers ----
  const heroGradient = percentage >= 80 ? gradients.success : percentage >= 60 ? gradients.primary : gradients.gold;
  const heroEmoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪';
  const praise = percentage >= 80
    ? "Excellent work! You're crushing it!"
    : percentage >= 60
      ? 'Great effort! Keep practicing!'
      : "Don't give up! Review your weak areas and try again!";

  const weakTopics = (Array.isArray(weak) ? weak : []).filter((t) => Number(t?.ratio || 0) > 0);
  const errorItems = Array.isArray(errorBank) ? errorBank : [];
  const hasWeakSpots = weakTopics.length > 0 || errorItems.length > 0;

  return (
    <Screen>
      {/* Home at any moment */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
        <HomeButton />
      </View>
      {/* Celebration hero */}
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEmoji}>{heroEmoji}</Text>
        <Text style={styles.heroTitle}>Quiz Complete!</Text>
        <Text style={styles.heroScore}>{score}/{total}</Text>
        <Text style={styles.heroPercent}>{percentage}%</Text>
        <View style={styles.heroBarWrap}>
          <ProgressBar progress={percentage / 100} height={10} style={styles.heroBar} />
        </View>
        <Text style={styles.heroPraise}>{praise}</Text>
      </LinearGradient>

      {/* Focus areas */}
      <Text style={styles.sectionTitle}>Focus areas</Text>
      {!hasWeakSpots ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🌟</Text>
          <Text style={styles.emptyTitle}>Flawless round!</Text>
          <Text style={styles.emptySubtitle}>
            No weak spots this time. Keep the streak alive with another round.
          </Text>
        </Card>
      ) : (
        <>
          {weakTopics.map((item) => (
            <Card key={item.topic} style={styles.weakCard}>
              <View style={styles.weakHeader}>
                <View style={[styles.weakIcon, { backgroundColor: colors.dangerLight }]}>
                  <MaterialCommunityIcons name="target" size={20} color={colors.danger} />
                </View>
                <View style={styles.weakText}>
                  <Text style={styles.weakTopic}>{item.topic}</Text>
                  <Text style={styles.weakSub}>{Math.round(item.ratio * 100)}% needs work</Text>
                </View>
              </View>
              <ProgressBar progress={item.ratio} height={8} style={styles.weakBar} />
            </Card>
          ))}
          {errorItems.map((item) => (
            <Card key={item.id || item.question} style={styles.weakCard}>
              <Text style={styles.errorQuestion}>{item.question || item.text}</Text>
              {(item.correctAnswer || item.answer) && (
                <View style={styles.errorAnswerRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                  <Text style={styles.errorAnswer}>{item.correctAnswer || item.answer}</Text>
                </View>
              )}
              {item.whyThisAnswer && (
                <Text style={styles.errorWhy}>{item.whyThisAnswer}</Text>
              )}
            </Card>
          ))}
        </>
      )}


      {/* Actions */}
      {mistakeIds.length > 0 && (
        <Button
          title={`Review my mistakes (${mistakeIds.length})`}
          onPress={reviewMistakes}
          icon={<MaterialCommunityIcons name="alert-circle" size={20} color="#fff" />}
          style={styles.actionButton}
        />
      )}
      <Button
        title="Practice again"
        onPress={async () => {
          // Ad policy: 1 interstitial per quiz, shown after results
          await maybeShowInterstitial?.({ trigger: 'quizComplete', sessionQuestionCount: total, score });
          practiceAgain();
        }}
        icon={<MaterialCommunityIcons name="refresh" size={20} color="#fff" />}
        style={styles.actionButton}
      />
      {/* Shareable challenge card - screenshot-ready, carries the squad invite code */}
      <ShareScoreCard
        percentage={percentage}
        inviteCode={squadInviteCode}
        userName={shareUserName}
        style={styles.shareCard}
      />
      <View style={styles.actionRow}>
        <Button
          title="Back home"
          onPress={async () => {
            // Ad policy: 1 interstitial per quiz, shown after results
            await maybeShowInterstitial?.({ trigger: 'quizComplete', sessionQuestionCount: total, score });
            navigation.navigate('MainTabs', { screen: 'HomeTab' });
          }}
          variant="secondary"
          style={styles.halfButton}
        />
        <Button
          title="Share"
          onPress={handleShare}
          variant="outline"
          icon={<MaterialCommunityIcons name="share-variant" size={18} color={colors.text} />}
          style={styles.halfButton}
        />
      </View>
      {/* Share feedback - in-app modal (web-safe, replaces Alert.alert) */}
      <Modal
        visible={!!shareFeedback}
        transparent
        animationType="fade"
        onRequestClose={() => setShareFeedback('')}
      >
        <View style={styles.shareOverlay}>
          <View style={styles.shareCard}>
            <Text style={styles.shareTitle}>Share this challenge</Text>
            <Text style={styles.shareMsg}>{shareFeedback}</Text>
            <Button title="Got it" onPress={() => setShareFeedback('')} />
          </View>
        </View>
      </Modal>
          <BannerAd />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.raised,
  },
  heroEmoji: { fontSize: 56, marginBottom: spacing.sm },
  heroTitle: { fontSize: typography.title, fontWeight: typography.bold, color: '#fff' },
  heroScore: { fontSize: typography.subtitle, fontWeight: typography.semibold, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  heroPercent: { fontSize: 64, fontWeight: typography.bold, color: '#fff', marginVertical: spacing.sm },
  heroBarWrap: { width: '100%', marginBottom: spacing.sm },
  heroBar: { backgroundColor: 'rgba(255,255,255,0.3)' },
  heroPraise: { fontSize: typography.body, fontWeight: typography.medium, color: '#fff', textAlign: 'center' },

  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: typography.bold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text },
  emptySubtitle: { fontSize: typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },

  weakCard: { marginBottom: spacing.sm },
  weakHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  weakIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  weakText: { flex: 1 },
  weakTopic: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  weakSub: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  weakBar: { marginTop: 2 },

  errorQuestion: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.sm },
  errorAnswerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  errorAnswer: { fontSize: typography.caption, color: colors.success, fontWeight: typography.semibold, marginLeft: 6 },
  errorWhy: { fontSize: typography.caption, color: colors.textSecondary, lineHeight: 20 },

  infoCard: { marginBottom: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.info },
  upsellCard: { marginBottom: spacing.md, borderColor: colors.primary, borderWidth: 1.5 },
  recoveryCard: { marginBottom: spacing.md },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text, flex: 1 },
  cardBody: { fontSize: typography.caption, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.primary },
  upsellButton: { marginTop: spacing.sm },

  recoveryTopic: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.sm },
  recoverySteps: { marginBottom: spacing.md },
  recoveryStep: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  recoveryDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  recoveryDotDone: { backgroundColor: colors.success },
  recoveryStepText: { fontSize: typography.caption, color: colors.textSecondary },

  actionButton: { marginTop: spacing.sm, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', marginHorizontal: -4 },
  halfButton: { flex: 1, marginHorizontal: 4 },
  shareCard: { marginBottom: spacing.md, marginTop: spacing.sm },

  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  shareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 12,
  },
  shareMsg: {
    fontSize: 16,
    color: '#475467',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default ReviewScreen;
