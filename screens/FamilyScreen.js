import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
  Modal,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import { APP_EVENT_NAMES } from '../constants';
import { showRewardedAd, HomeBannerAd } from '../adMobService';
import { getQuestionBank } from '../quizHelpers';
import { daysSince } from '../utils/helpers';
import { buildSmartQueue, computeDueDays } from '../utils/smartQueue';
import {
  playAdStartFeedback,
  playCorrectFeedback,
  playInviteNudgeFeedback,
  playWrongFeedback,
} from '../utils/audioHaptics';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.24;

function FamilyScreen({ navigation }) {
  const {
    masteryMap,
    testDetails,
    userProfile,
    squadSync,
    createSquad,
    refreshSquadInviteCode,
    updateSquadWeeklyGoal,
    updateSquadChallengeProgress,
    toggleHouseholdBoardItem,
    recordParentChildNudge,
    enforceModerationPolicy,
    trackAppEvent,
  } = useContext(AppDataContext);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [boosterPct, setBoosterPct] = useState(0);
  const [toast, setToast] = useState(null);
  const [watchingBoost, setWatchingBoost] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewLaterCount, setReviewLaterCount] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [lastInviteRefreshAt, setLastInviteRefreshAt] = useState(0);

  const handleReportMember = (member) => {
    if (String(member.id) === 'self') return;
    Alert.alert(
      `Report ${member.name}`,
      'Why are you reporting this squad member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Harassment or abuse', onPress: () => confirmReport(member, 'harassment') },
        { text: 'Spam or fake account', onPress: () => confirmReport(member, 'spam') },
        { text: 'Other reason', onPress: () => confirmReport(member, 'other') },
      ],
    );
  };

  const confirmReport = (member, reason) => {
    trackAppEvent('squad_member_reported', {
      reported_member_id: String(member.id || '').slice(0, 32),
      reason,
    });
    Alert.alert('Report Received', 'Thank you. We review all reports within 24 hours. Violators will be permanently banned per our Terms of Use.');
  };
  const swipe = useMemo(() => new Animated.ValueXY(), []);

  const selfMember = useMemo(() => {
    const displayName = String(userProfile?.name || 'You').trim() || 'You';
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
  }, [userProfile?.name]);

  const squad = useMemo(() => {
    const members = Array.isArray(squadSync?.members) ? squadSync.members : [];
    if (!members.length) return [selfMember];
    const hasSelf = members.some((member) => String(member.id) === 'self');
    return hasSelf
      ? members.map((member) => (String(member.id) === 'self' ? { ...member, ...selfMember } : member))
      : [selfMember, ...members];
  }, [squadSync?.members, selfMember]);

  const inviteCode = squadSync?.inviteCode || 'SQUAD-SETUP';
  const teamName = squadSync?.teamName || 'Civics Squad';
  const weeklyGoal = squadSync?.weeklyGoal || { quizzes: 12, focusMinutes: 120 };
  const weeklyChallenge = squadSync?.weeklyChallenge || { target: 20, progress: 0, title: 'Founders Week Sprint' };
  const householdBoardItems = Array.isArray(squadSync?.householdBoard?.items) ? squadSync.householdBoard.items : [];
  const streakChain = squadSync?.streakChain || { currentDays: 0, bestDays: 0, lastActivityDay: null };

  const sorted = useMemo(() => [...squad].sort((a, b) => b.points - a.points), [squad]);
  const selfRole = useMemo(() => {
    const found = sorted.find((member) => String(member.id) === 'self');
    return String(found?.role || 'parent').toLowerCase();
  }, [sorted]);
  const canManageTeam = selfRole === 'parent' || selfRole === 'admin';
  const totalEffortHours = useMemo(
    () => sorted.reduce((sum, member) => sum + member.effortHours, 0),
    [sorted],
  );
  const avgAccuracy = useMemo(
    () => Math.round(sorted.reduce((sum, member) => sum + member.accuracy, 0) / Math.max(sorted.length, 1)),
    [sorted],
  );

  const coopProgress = Math.min(
    100,
    Math.round((totalEffortHours * 2.8) + (avgAccuracy * 0.7) + boosterPct),
  );
  const challengeTarget = Math.max(1, Number(weeklyChallenge.target || 20));
  const challengeProgress = Math.min(challengeTarget, Math.max(0, masteredCount + reviewLaterCount));

  const effortDominant = totalEffortHours * 10 >= avgAccuracy;
  const roomGradient = effortDominant
    ? ['#1B1336', '#2A1465', '#4C1D95']
    : ['#2B1725', '#5B2A1F', '#9A3412'];

  useEffect(() => {
    if ((weeklyChallenge.progress || 0) === challengeProgress) return;
    updateSquadChallengeProgress(challengeProgress);
  }, [challengeProgress, weeklyChallenge.progress, updateSquadChallengeProgress]);

  const shareStudyKey = async () => {
    try {
      if (!squadSync?.teamId) {
        createSquad(teamName);
      }
      const activeCode = squadSync?.inviteCode || refreshSquadInviteCode();
      await Share.share({
        message: [
          'Join my private Civics Coach Squad.',
          `Study Key: ${activeCode}`,
          'Tap to enter the Squad Challenge Lounge and start a co-op challenge together.',
        ].join('\n'),
      });
      setToast({
        text: 'Study key shared.',
        undoText: 'Undo',
        onUndo: () => setToast({ text: 'Share canceled.', undoText: null, onUndo: null }),
      });
    } catch (error) {
      Alert.alert('Unable to Share', 'Please try again in a moment.');
    }
  };

  const nudgeSquad = async () => {
    const now = Date.now();
    const minCooldownMs = 60 * 1000;
    const cooldownMap = squadSync?.nudgeCooldownByMember || {};

    if (!canManageTeam) {
      setToast({ text: 'Only parent/admin can send team nudges.', undoText: null, onUndo: null });
      trackAppEvent(APP_EVENT_NAMES.PARENT_CHILD_NUDGE_BLOCKED, { reason: 'unauthorized_role', role: selfRole });
      return;
    }

    const targetMembers = sorted.filter((member) => String(member.id) !== 'self');
    if (!targetMembers.length) {
      setToast({ text: 'Add at least one teammate before sending nudges.', undoText: null, onUndo: null });
      trackAppEvent(APP_EVENT_NAMES.PARENT_CHILD_NUDGE_BLOCKED, { reason: 'insufficient_members' });
      return;
    }

    const moderationDecision = await enforceModerationPolicy({
      actionType: 'nudge_send',
      actorId: 'self',
      actorRole: selfRole,
      targetMemberIds: targetMembers.map((member) => member.id),
    });

    if (!moderationDecision?.allowed) {
      if (moderationDecision.reason === 'temporary_mute') {
        const untilLabel = moderationDecision.mutedUntilIso || 'later';
        setToast({ text: `Nudge muted until ${untilLabel}.`, undoText: null, onUndo: null });
      } else {
        setToast({ text: 'Nudge blocked by moderation rate policy.', undoText: null, onUndo: null });
      }
      trackAppEvent(APP_EVENT_NAMES.PARENT_CHILD_NUDGE_BLOCKED, { reason: `moderation_${moderationDecision.reason}` });
      return;
    }

    const cooldownBlocked = targetMembers.filter((member) => {
      const key = String(member.id);
      const lastNudgedAt = cooldownMap[key];
      const elapsed = now - (Date.parse(lastNudgedAt || '') || 0);
      return elapsed < minCooldownMs;
    });

    const eligibleTargets = targetMembers.filter((member) => !cooldownBlocked.some((blocked) => blocked.id === member.id));

    if (!eligibleTargets.length) {
      const firstBlocked = cooldownBlocked[0];
      const key = String(firstBlocked?.id || 'unknown');
      const waitMs = minCooldownMs - (now - (Date.parse(cooldownMap[key] || '') || 0));
      const waitSec = Math.max(1, Math.ceil(waitMs / 1000));
      setToast({ text: `All teammates are on cooldown (${waitSec}s).`, undoText: null, onUndo: null });
      trackAppEvent(APP_EVENT_NAMES.PARENT_CHILD_NUDGE_BLOCKED, { reason: 'cooldown_all_targets' });
      return;
    }

    playInviteNudgeFeedback();
    recordParentChildNudge(eligibleTargets.map((member) => member.id));
    trackAppEvent(APP_EVENT_NAMES.PARENT_CHILD_NUDGE_SENT, {
      member_count: sorted.length,
      target_count: eligibleTargets.length,
      blocked_count: cooldownBlocked.length,
    });
    setToast({
      text: cooldownBlocked.length
        ? `Nudged ${eligibleTargets.length} teammate(s), ${cooldownBlocked.length} cooling down.`
        : 'Nudge sent to your squad.',
      undoText: 'Undo',
      onUndo: () => setToast({ text: 'Nudge canceled.', undoText: null, onUndo: null }),
    });
  };

  const adjustWeeklyGoal = async (delta) => {
    if (!canManageTeam) {
      setToast({ text: 'Only parent/admin can update weekly goals.', undoText: null, onUndo: null });
      return;
    }

    const moderationDecision = await enforceModerationPolicy({
      actionType: 'goal_update',
      actorId: 'self',
      actorRole: selfRole,
      targetMemberIds: [],
    });

    if (!moderationDecision?.allowed) {
      setToast({ text: 'Goal update blocked by moderation rate policy.', undoText: null, onUndo: null });
      return;
    }

    const nextQuizGoal = Math.max(4, Number(weeklyGoal.quizzes || 12) + delta);
    const focusMinutes = Math.max(30, Number(weeklyGoal.focusMinutes || 120));
    updateSquadWeeklyGoal({ quizzes: nextQuizGoal, focusMinutes });
    setToast({
      text: `Weekly squad goal set to ${nextQuizGoal} quizzes.`,
      undoText: null,
      onUndo: null,
    });
  };

  const runBooster = async () => {
    if (watchingBoost) return;
    setWatchingBoost(true);
    try {
      await playAdStartFeedback();
      await showRewardedAd();
      setBoosterPct((prev) => Math.min(30, prev + 5));
      setToast({
        text: 'Group Booster active: +5% squad energy.',
        undoText: null,
        onUndo: null,
      });
    } catch (error) {
      Alert.alert('Booster Failed', 'Please try again in a moment.');
    } finally {
      setWatchingBoost(false);
    }
  };

  const statusColors = {
    studying: '#34D399',
    aced: '#FBBF24',
    active: '#2DD4BF',
    idle: '#64748B',
  };

  const challengeDeck = useMemo(() => {
    const byQuestion = masteryMap?.byQuestion || {};
    const entries = Object.entries(byQuestion).map(([id, value]) => ({
      id,
      ...(value || {}),
    }));
    const bank = getQuestionBank(testDetails?.testType || 'naturalization128');

    if (!entries.length || !bank.length) {
      return [];
    }

    const bankById = new Map(bank.map((question) => [String(question.id), question]));
    const topicStats = entries.reduce((acc, entry) => {
      const topic = entry.topic || 'General';
      const attempts = Number(entry.attempts || 0);
      const correct = Number(entry.correct || 0);
      const prev = acc.get(topic) || { attempts: 0, correct: 0 };
      acc.set(topic, {
        attempts: prev.attempts + attempts,
        correct: prev.correct + correct,
      });
      return acc;
    }, new Map());

    const queuedIds = buildSmartQueue(entries, { limit: 10 });
    const queuedCards = queuedIds
      .map((id) => {
        const entry = byQuestion[String(id)];
        const question = bankById.get(String(id));
        if (!entry || !question) return null;

        const attempts = Number(entry.attempts || 0);
        const correct = Number(entry.correct || 0);
        const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
        const dueDays = computeDueDays(entry);
        const daysElapsed = daysSince(entry.lastSeen || new Date().toISOString());
        const isDue = daysElapsed >= dueDays;
        const topic = question.topic || entry.topic || 'General';
        const topicAggregate = topicStats.get(topic) || { attempts: 0, correct: 0 };
        const topicAccuracy = topicAggregate.attempts
          ? Math.round((topicAggregate.correct / topicAggregate.attempts) * 100)
          : accuracy;

        return {
          id: `sq-${String(id)}`,
          topic,
          prompt: question.question,
          hint: `Expected: ${question.answer}`,
          difficulty: isDue ? `Due now • ${Math.max(0, daysElapsed - dueDays)}d late` : `Topic ${topicAccuracy}%`,
        };
      })
      .filter(Boolean);

    if (queuedCards.length) return queuedCards;

    return bank.slice(0, 6).map((question) => ({
      id: `starter-${String(question.id)}`,
      topic: question.topic || 'General',
      prompt: question.question,
      hint: `Expected: ${question.answer}`,
      difficulty: 'Starter Mix',
    }));
  }, [masteryMap, testDetails?.testType]);

  useEffect(() => {
    setDeckIndex(0);
    setMasteredCount(0);
    setReviewLaterCount(0);
    setSwipeHistory([]);
    swipe.setValue({ x: 0, y: 0 });
  }, [challengeDeck.length, swipe]);

  const remainingCards = Math.max(0, challengeDeck.length - deckIndex);
  const currentCard = challengeDeck[deckIndex] || null;
  const nextCard = challengeDeck[deckIndex + 1] || null;

  const commitSwipe = (direction) => {
    if (!currentCard) return;

    const action = direction === 'right' ? 'mastered' : 'review';
    if (action === 'mastered') {
      playCorrectFeedback();
    } else {
      playWrongFeedback();
    }
    if (action === 'mastered') {
      setMasteredCount((prev) => prev + 1);
    } else {
      setReviewLaterCount((prev) => prev + 1);
    }

    setSwipeHistory((prev) => [...prev, { cardId: currentCard.id, action }]);
    setDeckIndex((prev) => prev + 1);
    swipe.setValue({ x: 0, y: 0 });
    setToast({
      text: action === 'mastered' ? 'Marked mastered.' : 'Saved for review later.',
      undoText: 'Undo',
      onUndo: undoLastSwipe,
    });
  };

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? width : -width;
    Animated.timing(swipe, {
      toValue: { x, y: 0 },
      duration: 170,
      useNativeDriver: false,
    }).start(() => commitSwipe(direction));
  };

  const resetCardPosition = () => {
    Animated.spring(swipe, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  const undoLastSwipe = () => {
    setSwipeHistory((prev) => {
      if (!prev.length) return prev;
      const nextHistory = [...prev];
      const last = nextHistory.pop();
      if (last.action === 'mastered') {
        setMasteredCount((count) => Math.max(0, count - 1));
      } else {
        setReviewLaterCount((count) => Math.max(0, count - 1));
      }
      setDeckIndex((idx) => Math.max(0, idx - 1));
      swipe.setValue({ x: 0, y: 0 });
      setToast({ text: 'Move undone.', undoText: null, onUndo: null });
      return nextHistory;
    });
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
      onPanResponderMove: (_, gesture) => {
        swipe.setValue({ x: gesture.dx, y: gesture.dy * 0.1 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
          return;
        }
        if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
          return;
        }
        resetCardPosition();
      },
    }),
    [swipe, currentCard],
  );

  const cardRotate = swipe.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-18deg', '0deg', '18deg'],
    extrapolate: 'clamp',
  });

  const rightLabelOpacity = swipe.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const leftLabelOpacity = swipe.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.screen}>
      <LinearGradient colors={roomGradient} style={localStyles.background}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Friends-Only Challenge Lounge</Text>
          <Text style={styles.pageSubtitle}>Private squad. Shared grind. Real momentum.</Text>

          <View style={localStyles.teamControlCard}>
            <View style={localStyles.teamHeaderRow}>
              <View>
                <Text style={localStyles.teamName}>{teamName}</Text>
                <Text style={localStyles.teamCode}>Invite code: {inviteCode}</Text>
              </View>
              <TouchableOpacity
                style={localStyles.teamActionPill}
                onPress={async () => {
                  if (!canManageTeam) {
                    setToast({ text: 'Only parent/admin can manage invite codes.', undoText: null, onUndo: null });
                    trackAppEvent(APP_EVENT_NAMES.TEAM_INVITE_CODE_REFRESH_BLOCKED, { reason: 'unauthorized_role', role: selfRole });
                    return;
                  }

                  const moderationDecision = await enforceModerationPolicy({
                    actionType: 'invite_refresh',
                    actorId: 'self',
                    actorRole: selfRole,
                    targetMemberIds: [],
                  });

                  if (!moderationDecision?.allowed) {
                    setToast({ text: 'Invite code action blocked by moderation policy.', undoText: null, onUndo: null });
                    trackAppEvent(APP_EVENT_NAMES.TEAM_INVITE_CODE_REFRESH_BLOCKED, { reason: `moderation_${moderationDecision.reason}` });
                    return;
                  }

                  const now = Date.now();
                  if (squadSync?.teamId && now - lastInviteRefreshAt < 30 * 1000) {
                    const waitSec = Math.ceil((30 * 1000 - (now - lastInviteRefreshAt)) / 1000);
                    setToast({ text: `Invite code cooldown: wait ${waitSec}s.`, undoText: null, onUndo: null });
                    trackAppEvent(APP_EVENT_NAMES.TEAM_INVITE_CODE_REFRESH_BLOCKED, { reason: 'cooldown' });
                    return;
                  }

                  if (!squadSync?.teamId) {
                    createSquad(teamName);
                    setToast({ text: 'Squad created. Share your invite code next.', undoText: null, onUndo: null });
                  } else {
                    refreshSquadInviteCode();
                    setLastInviteRefreshAt(now);
                  }
                }}
              >
                <Text style={localStyles.teamActionPillText}>{squadSync?.teamId ? 'Refresh Code' : 'Create Squad'}</Text>
              </TouchableOpacity>
            </View>
            <View style={localStyles.goalRow}>
              <Text style={localStyles.goalLabel}>Weekly Goal</Text>
              <View style={localStyles.goalActions}>
                <TouchableOpacity style={localStyles.goalBtn} onPress={() => { void adjustWeeklyGoal(-1); }}>
                  <Text style={localStyles.goalBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={localStyles.goalValue}>{weeklyGoal.quizzes} quizzes</Text>
                <TouchableOpacity style={localStyles.goalBtn} onPress={() => { void adjustWeeklyGoal(1); }}>
                  <Text style={localStyles.goalBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={localStyles.challengeProgressText}>
              {weeklyChallenge.title}: {challengeProgress}/{challengeTarget}
            </Text>
          </View>

          <View style={localStyles.streakCard}>
            <Text style={localStyles.streakTitle}>Streak Chain</Text>
            <View style={localStyles.streakRow}>
              <Text style={localStyles.streakValue}>{streakChain.currentDays || 0} day</Text>
              <Text style={localStyles.streakMeta}>Best {streakChain.bestDays || 0}</Text>
              <Text style={localStyles.streakMeta}>Last {streakChain.lastActivityDay || 'N/A'}</Text>
            </View>
          </View>

          <View style={localStyles.householdCard}>
            <Text style={localStyles.householdTitle}>Shared Household Board</Text>
            {householdBoardItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={localStyles.householdItem}
                onPress={() => {
                  if (!canManageTeam && item.assignedTo === 'squad') {
                    setToast({ text: 'Only parent/admin can edit squad-assigned items.', undoText: null, onUndo: null });
                    return;
                  }

                  const nextCompleted = !Boolean(item.completed);
                  toggleHouseholdBoardItem(item.id, nextCompleted);
                  setToast({
                    text: nextCompleted ? 'Board item completed.' : 'Board item reopened.',
                    undoText: null,
                    onUndo: null,
                  });
                }}
              >
                <MaterialCommunityIcons
                  name={item.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={18}
                  color={item.completed ? '#34D399' : '#94A3B8'}
                />
                <View style={localStyles.householdTextWrap}>
                  <Text style={[localStyles.householdItemText, item.completed && localStyles.householdItemDone]}>{item.title}</Text>
                  <Text style={localStyles.householdItemMeta}>Assigned: {item.assignedTo === 'self' ? 'You' : 'Squad'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={localStyles.dualOrbCard}>
            <Text style={localStyles.sectionKicker}>Dual Engine</Text>
            <View style={localStyles.dualOrbRow}>
              <View style={localStyles.dualOrbHalfEffort}>
                <Text style={localStyles.dualOrbLabel}>Effort</Text>
                <Text style={localStyles.dualOrbValue}>{totalEffortHours.toFixed(1)}h</Text>
              </View>
              <View style={localStyles.dualOrbHalfScore}>
                <Text style={localStyles.dualOrbLabel}>Score</Text>
                <Text style={localStyles.dualOrbValue}>{avgAccuracy}%</Text>
              </View>
            </View>
            <Text style={localStyles.dualOrbHint}>Tap Progress below to switch lenses in future builds.</Text>
          </View>

          <View style={localStyles.coopCard}>
            <View style={localStyles.coopHeader}>
              <Text style={localStyles.coopTitle}>Co-op Unlock: 20% Ad-Free</Text>
              <Text style={localStyles.coopPct}>{coopProgress}%</Text>
            </View>
            <View style={localStyles.coopTrack}>
              <LinearGradient
                colors={['#06B6D4', '#8B5CF6', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[localStyles.coopFill, { width: `${Math.max(8, coopProgress)}%` }]}
              />
            </View>
            <Text style={localStyles.coopHint}>Study together to unlock squad rewards. Boosters increase progress instantly.</Text>
          </View>

          <View style={localStyles.deckSection}>
            <View style={localStyles.deckHeader}>
              <View>
                <Text style={localStyles.deckTitle}>Squad Card Stack</Text>
                <Text style={localStyles.deckSubtitle}>Smart queue from your weak and due topics</Text>
              </View>
              <View style={localStyles.deckCountPill}>
                <Text style={localStyles.deckCountText}>{remainingCards} left</Text>
              </View>
            </View>

            <View style={localStyles.deckStatsRow}>
              <View style={localStyles.deckStatCard}>
                <Text style={localStyles.deckStatLabel}>Mastered</Text>
                <Text style={localStyles.deckStatValue}>{masteredCount}</Text>
              </View>
              <View style={localStyles.deckStatCard}>
                <Text style={localStyles.deckStatLabel}>Review Later</Text>
                <Text style={localStyles.deckStatValue}>{reviewLaterCount}</Text>
              </View>
            </View>

            {!!currentCard ? (
              <View style={localStyles.deckViewport}>
                {!!nextCard && (
                  <View style={[localStyles.challengeCard, localStyles.challengeCardBack]}>
                    <Text style={localStyles.challengeTopic}>{nextCard.topic}</Text>
                    <Text style={localStyles.challengePrompt} numberOfLines={2}>{nextCard.prompt}</Text>
                  </View>
                )}

                <Animated.View
                  style={[
                    localStyles.challengeCard,
                    {
                      transform: [
                        { translateX: swipe.x },
                        { translateY: swipe.y },
                        { rotate: cardRotate },
                      ],
                    },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Animated.View style={[localStyles.swipeBadgeRight, { opacity: rightLabelOpacity }]}> 
                    <Text style={localStyles.swipeBadgeText}>MASTERED</Text>
                  </Animated.View>
                  <Animated.View style={[localStyles.swipeBadgeLeft, { opacity: leftLabelOpacity }]}> 
                    <Text style={localStyles.swipeBadgeText}>REVIEW</Text>
                  </Animated.View>

                  <Text style={localStyles.challengeTopic}>{currentCard.topic}</Text>
                  <Text style={localStyles.challengePrompt}>{currentCard.prompt}</Text>
                  <Text style={localStyles.challengeHint}>{currentCard.hint}</Text>
                  <View style={localStyles.challengeMetaRow}>
                    <Text style={localStyles.challengeDifficulty}>{currentCard.difficulty}</Text>
                    <Text style={localStyles.challengeGesture}>Drag card to decide</Text>
                  </View>
                </Animated.View>
              </View>
            ) : (
              <View style={localStyles.deckCompleteCard}>
                <MaterialCommunityIcons name="party-popper" size={24} color="#FBBF24" />
                <Text style={localStyles.deckCompleteTitle}>{challengeDeck.length ? 'Stack Complete' : 'No Smart Queue Yet'}</Text>
                <Text style={localStyles.deckCompleteBody}>
                  {challengeDeck.length
                    ? 'You finished this challenge run. Tap Undo to revisit the last card.'
                    : 'Complete at least one quiz session to unlock personalized weak-topic squad cards.'}
                </Text>
              </View>
            )}

            <View style={localStyles.deckActions}>
              <TouchableOpacity style={localStyles.deckActionReview} onPress={() => !!currentCard && forceSwipe('left')}>
                <MaterialCommunityIcons name="arrow-left-bold" size={16} color="#FCA5A5" />
                <Text style={localStyles.deckActionReviewText}>Review Later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.deckActionUndo} onPress={undoLastSwipe}>
                <MaterialCommunityIcons name="undo-variant" size={16} color="#67E8F9" />
                <Text style={localStyles.deckActionUndoText}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.deckActionMaster} onPress={() => !!currentCard && forceSwipe('right')}>
                <Text style={localStyles.deckActionMasterText}>Mastered</Text>
                <MaterialCommunityIcons name="arrow-right-bold" size={16} color="#0A0A12" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={localStyles.sectionTitle}>Shared Surface</Text>
          {sorted.map((member, idx) => (
            <View
              key={member.id}
              style={[
                localStyles.squadCard,
                idx > 0 && { marginTop: -8 },
                idx === 0 && localStyles.squadCardLeader,
              ]}
            >
              <View style={localStyles.rankChip}>
                <Text style={localStyles.rankChipText}>#{idx + 1}</Text>
              </View>

              <View style={localStyles.avatarWrap}>
                <View style={[localStyles.pulseHalo, { borderColor: statusColors[member.status] || '#64748B' }]} />
                <View style={styles.familyAvatar}>
                  <Text style={styles.familyAvatarText}>{member.initials[0]}</Text>
                </View>
              </View>

              <View style={localStyles.cardInfo}>
                <Text style={styles.familyName}>{member.name}</Text>
                <Text style={styles.familyStats}>{member.completed} quizzes - Lv {member.level}</Text>
                <View style={localStyles.meterRow}>
                  <Text style={localStyles.meterText}>Effort {member.effortHours.toFixed(1)}h</Text>
                  <Text style={localStyles.dot}>•</Text>
                  <Text style={localStyles.meterText}>Score {member.accuracy}%</Text>
                </View>
              </View>

              <View style={styles.familyPoints}>
                <Text style={styles.familyPointsValue}>{member.points}</Text>
                <Text style={styles.familyPointsLabel}>pts</Text>
                <Text style={[localStyles.statusChip, { color: statusColors[member.status] || '#64748B' }]}>
                  {member.status === 'studying' ? 'LIVE' : member.status === 'aced' ? 'ACED' : 'ACTIVE'}
                </Text>
                {String(member.id) !== 'self' && (
                  <TouchableOpacity
                    onPress={() => handleReportMember(member)}
                    style={localStyles.reportPill}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="dots-vertical" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <View style={localStyles.actionRow}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary, localStyles.actionButton]} onPress={() => setInviteOpen(true)}>
              <MaterialCommunityIcons name="sparkles" size={18} color="#fff" />
              <Text style={[styles.buttonText, localStyles.actionButtonText]}>Invite Squad</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, localStyles.nudgeButton]} onPress={() => { void nudgeSquad(); }}>
              <MaterialCommunityIcons name="vibrate" size={18} color="#A78BFA" />
              <Text style={[styles.buttonText, localStyles.nudgeText]}>Nudge</Text>
            </TouchableOpacity>
          </View>

          <View style={localStyles.boosterCard}>
            <Text style={localStyles.boosterTitle}>Group Booster</Text>
            <Text style={localStyles.boosterBody}>Watch to Save a Streak or add +5% squad energy for the next hour.</Text>
            <TouchableOpacity
              style={[styles.button, localStyles.boosterButton, watchingBoost && { opacity: 0.6 }]}
              onPress={runBooster}
              disabled={watchingBoost}
            >
              <MaterialCommunityIcons name="play-circle-outline" size={18} color="#0A0A12" />
              <Text style={localStyles.boosterButtonText}>{watchingBoost ? 'Activating...' : 'Watch Booster'}</Text>
            </TouchableOpacity>
            <View style={localStyles.sponsorWrap}>
              <Text style={localStyles.sponsorLabel}>Sponsor Credit</Text>
              <HomeBannerAd />
            </View>
          </View>

          <View style={localStyles.privateDrawer}>
            <View style={localStyles.drawerHandle} />
            <Text style={localStyles.drawerTitle}>Private Drawer</Text>
            <View style={localStyles.drawerItem}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color="#67E8F9" />
              <Text style={localStyles.drawerItemText}>The Squad: {sorted.length} members in room</Text>
            </View>
            <View style={localStyles.drawerItem}>
              <MaterialCommunityIcons name="gesture-tap-button" size={18} color="#A78BFA" />
              <Text style={localStyles.drawerItemText}>The Nudge: one tap micro-haptic wake-up</Text>
            </View>
            <View style={localStyles.drawerItem}>
              <MaterialCommunityIcons name="gift-outline" size={18} color="#FBBF24" />
              <Text style={localStyles.drawerItemText}>The Prize: shared ad-free window</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.button, localStyles.backButton]} onPress={() => navigation.navigate('HomeTab')}>
            <MaterialCommunityIcons name="arrow-left" size={18} color="#A78BFA" />
            <Text style={[styles.buttonText, localStyles.backButtonText]}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={inviteOpen} transparent animationType="fade" onRequestClose={() => setInviteOpen(false)}>
          <LinearGradient colors={['rgba(7,10,20,0.92)', 'rgba(36,19,67,0.95)', 'rgba(16,42,57,0.95)']} style={localStyles.overlay}>
            <View style={localStyles.inviteCard}>
              <Text style={localStyles.inviteTitle}>Study Key Card</Text>
              <Text style={localStyles.inviteSubtitle}>Recruit your squad with one visual invite.</Text>

              <View style={localStyles.dynamicCard}>
                <View style={localStyles.dynamicRing}>
                  <Text style={localStyles.dynamicRingText}>{coopProgress}%</Text>
                </View>
                <View style={localStyles.dynamicInfo}>
                  <Text style={localStyles.dynamicName}>{teamName} • {sorted.length} members</Text>
                  <Text style={localStyles.dynamicMeta}>Code {inviteCode} - Instant join flow</Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.button, styles.buttonPrimary, localStyles.overlayButton]} onPress={shareStudyKey}>
                <MaterialCommunityIcons name="share-variant" size={18} color="#fff" />
                <Text style={[styles.buttonText, localStyles.actionButtonText]}>Share Study Key</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, localStyles.overlayClose]} onPress={() => setInviteOpen(false)}>
                <Text style={localStyles.overlayCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>

        {!!toast?.text && (
          <View style={localStyles.toast}>
            <Text style={localStyles.toastText}>{toast.text}</Text>
            {!!toast.undoText && (
              <TouchableOpacity onPress={toast.onUndo}>
                <Text style={localStyles.toastUndo}>{toast.undoText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  background: {
    flex: 1,
  },
  teamControlCard: {
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: 'rgba(8, 15, 30, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.25)',
    borderRadius: 16,
    padding: 14,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  teamCode: {
    marginTop: 2,
    color: '#A5F3FC',
    fontSize: 12,
    fontWeight: '700',
  },
  teamActionPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  teamActionPillText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '800',
  },
  goalRow: {
    marginTop: 10,
  },
  goalLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalActions: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  goalBtnText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '900',
  },
  goalValue: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    minWidth: 92,
    textAlign: 'center',
  },
  challengeProgressText: {
    marginTop: 10,
    color: '#67E8F9',
    fontSize: 12,
    fontWeight: '700',
  },
  streakCard: {
    marginBottom: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 14,
    padding: 12,
  },
  streakTitle: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  streakValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
  },
  streakMeta: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  householdCard: {
    marginBottom: 14,
    backgroundColor: 'rgba(11, 18, 34, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 16,
    padding: 12,
  },
  householdTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  householdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  householdTextWrap: {
    flex: 1,
  },
  householdItemText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  householdItemDone: {
    color: '#86EFAC',
    textDecorationLine: 'line-through',
  },
  householdItemMeta: {
    marginTop: 2,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#67E8F9',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  dualOrbCard: {
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    padding: 16,
  },
  dualOrbRow: {
    marginTop: 10,
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
  },
  dualOrbHalfEffort: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(45,212,191,0.14)',
  },
  dualOrbHalfScore: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(251,191,36,0.14)',
  },
  dualOrbLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  dualOrbValue: {
    marginTop: 4,
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
  },
  dualOrbHint: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 12,
  },
  coopCard: {
    backgroundColor: 'rgba(10,10,18,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.28)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  coopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coopTitle: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 14,
  },
  coopPct: {
    color: '#67E8F9',
    fontSize: 16,
    fontWeight: '900',
  },
  coopTrack: {
    marginTop: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  coopFill: {
    height: '100%',
    borderRadius: 999,
  },
  coopHint: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 12,
  },
  deckSection: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(6,12,24,0.5)',
    padding: 14,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '800',
  },
  deckSubtitle: {
    marginTop: 2,
    color: '#94A3B8',
    fontSize: 12,
  },
  deckCountPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
  },
  deckCountText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '800',
  },
  deckStatsRow: {
    marginTop: 10,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  deckStatCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  deckStatLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  deckStatValue: {
    marginTop: 2,
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  deckViewport: {
    height: 250,
    justifyContent: 'center',
    marginBottom: 12,
  },
  challengeCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(11,18,34,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 16,
    minHeight: 230,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  challengeCardBack: {
    transform: [{ scale: 0.96 }, { translateY: 10 }],
    opacity: 0.7,
  },
  challengeTopic: {
    color: '#67E8F9',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  challengePrompt: {
    marginTop: 8,
    color: '#F8FAFC',
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
  },
  challengeHint: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  challengeMetaRow: {
    marginTop: 'auto',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDifficulty: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 11,
  },
  challengeGesture: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  swipeBadgeRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 2,
    borderColor: '#34D399',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  swipeBadgeLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderWidth: 2,
    borderColor: '#F87171',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  swipeBadgeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  deckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deckActionReview: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deckActionReviewText: {
    marginLeft: 5,
    color: '#FCA5A5',
    fontWeight: '800',
    fontSize: 12,
  },
  deckActionUndo: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deckActionUndoText: {
    marginLeft: 5,
    color: '#67E8F9',
    fontWeight: '800',
    fontSize: 12,
  },
  deckActionMaster: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deckActionMasterText: {
    marginRight: 5,
    color: '#0A0A12',
    fontWeight: '900',
    fontSize: 12,
  },
  deckCompleteCard: {
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    backgroundColor: 'rgba(251,191,36,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    marginBottom: 12,
  },
  deckCompleteTitle: {
    marginTop: 6,
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  deckCompleteBody: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  squadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(10,10,18,0.56)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  squadCardLeader: {
    borderColor: 'rgba(251,191,36,0.4)',
    backgroundColor: 'rgba(251,191,36,0.08)',
  },
  rankChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  rankChipText: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 11,
  },
  avatarWrap: {
    marginLeft: 10,
    marginRight: 12,
  },
  pulseHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
  },
  cardInfo: {
    flex: 1,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    color: '#64748B',
    marginHorizontal: 6,
  },
  statusChip: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  reportPill: {
    marginTop: 4,
    padding: 2,
    alignSelf: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
  nudgeButton: {
    flex: 1,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 12,
  },
  nudgeText: {
    color: '#A78BFA',
    marginLeft: 6,
  },
  boosterCard: {
    backgroundColor: 'rgba(2,6,23,0.54)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.28)',
    padding: 16,
    marginBottom: 16,
  },
  boosterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#67E8F9',
  },
  boosterBody: {
    marginTop: 6,
    marginBottom: 10,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  boosterButton: {
    backgroundColor: '#FCD34D',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boosterButtonText: {
    marginLeft: 6,
    color: '#0A0A12',
    fontWeight: '900',
    fontSize: 13,
  },
  sponsorWrap: {
    marginTop: 10,
  },
  sponsorLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  privateDrawer: {
    marginBottom: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  drawerHandle: {
    width: 44,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.6)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerItemText: {
    marginLeft: 8,
    color: '#CBD5E1',
    fontSize: 12,
  },
  backButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    backgroundColor: 'rgba(139,92,246,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#A78BFA',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inviteCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(12,18,35,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 18,
  },
  inviteTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '900',
  },
  inviteSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  dynamicCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dynamicRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: '#67E8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dynamicRingText: {
    color: '#67E8F9',
    fontWeight: '900',
    fontSize: 14,
  },
  dynamicInfo: {
    flex: 1,
  },
  dynamicName: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 14,
  },
  dynamicMeta: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 11,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  overlayClose: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCloseText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'rgba(2,6,23,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toastText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  toastUndo: {
    color: '#67E8F9',
    fontWeight: '800',
    fontSize: 12,
  },
});

export default FamilyScreen;
