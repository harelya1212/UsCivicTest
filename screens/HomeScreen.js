/**
 * HomeScreen (rebuilt) - Duolingo-style home.
 *
 * One focused hero card with the primary CTA, real stats from masteryMap,
 * quick actions to the rest of the app. No experiment clutter.
 * Previous version backed up at screens/HomeScreen.old.js.
 */
import React, { useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HomeBannerAd } from '../adMobService';
import { getQuestionBank } from '../quizHelpers';
import { getDynamicDataFreshness } from '../civicsDynamicData';
import { getQuestionTopic } from '../utils/helpers';
import { ALL_TOPICS_VALUE } from '../constants';
import { colors, gradients, radius, spacing, typography, shadows } from '../theme';

const TEST_TYPE_LABELS = {
  naturalization128: 'Citizenship Test (128)',
  naturalization100: 'Citizenship Test (100)',
  highschool: 'High School Civics',
};

function HomeScreen({ navigation }) {
  const {
    testDetails,
    userProfile,
    masteryMap,
    pausedSession,
    clearPausedSession,
    errorBank,
    trackAppEvent,
  } = useContext(AppDataContext);

  const name = (userProfile?.name || testDetails?.name || '').split(' ')[0] || 'there';

  const stats = useMemo(() => {
    const byQ = masteryMap?.byQuestion || {};
    const ids = Object.keys(byQ);
    let correct = 0;
    let answered = 0;
    ids.forEach((id) => {
      const q = byQ[id] || {};
      answered += Number(q.attempts || 0);
      correct += Number(q.correct || 0);
    });
    const totalQuestions = Number(masteryMap?.totalQuestions || 0);
    const totalSessions = Number(masteryMap?.totalSessions || 0);
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { answered: totalQuestions || answered, accuracy, sessions: totalSessions };
  }, [masteryMap]);

  const weakCount = Array.isArray(errorBank) ? errorBank.length : 0;
  const testLabel = TEST_TYPE_LABELS[testDetails?.testType] || 'Civics Test';

  // Quick-start popup flow: length -> topic -> quiz
  const [showLengthModal, setShowLengthModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [pickedLength, setPickedLength] = useState(null);

  const LENGTH_OPTIONS = [
    { value: 10, label: '10', hint: 'Quick drill', icon: 'lightning-bolt' },
    { value: 20, label: '20', hint: 'Short session', icon: 'timer' },
    { value: 50, label: '50', hint: 'Deep practice', icon: 'target' },
    { value: 0, label: 'All', hint: 'Full test', icon: 'flag' },
  ];

  const topicOptions = useMemo(() => {
    try {
      const pool = getQuestionBank(testDetails?.testType || 'naturalization128');
      return Array.from(new Set(pool.map((q) => getQuestionTopic(q)).filter(Boolean))).sort();
    } catch {
      return [];
    }
  }, [testDetails?.testType]);

  const startQuiz = (params = {}) => {
    trackAppEvent?.('quiz_started_from_home', { test_type: testDetails?.testType || 'unknown' });
    // Open the quick-start popup flow instead of navigating away
    setShowLengthModal(true);
  };

  const handlePickLength = (value) => {
    setPickedLength(value);
    setShowLengthModal(false);
    setShowTopicModal(true);
  };

  const handlePickTopic = (topic) => {
    setShowTopicModal(false);
    // Clear any stale paused session from a previous quiz
    clearPausedSession?.();
    const params = {
      type: testDetails?.testType || 'naturalization128',
      forceQuestionCount: pickedLength || 0,
      topicFilter: topic === ALL_TOPICS_VALUE ? null : topic,
    };
    setPickedLength(null);
    navigation.navigate('Quiz', params);
  };

  const daysUntilTest = testDetails?.testDate
    ? Math.max(0, Math.floor((new Date(testDetails.testDate) - new Date()) / 86400000))
    : null;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {name}</Text>
          <Text style={styles.subgreeting}>Ready to keep your streak going?</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {(userProfile?.name || testDetails?.name || 'F')[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stale officeholder data notice (non-blocking, dismissible per session) */}
      {(() => {
        const freshness = getDynamicDataFreshness(90);
        if (!freshness.isStale) return null;
        return (
          <Card style={{ marginBottom: spacing.md, borderColor: colors.warning, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.warning} style={{ marginRight: spacing.sm, marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: typography.caption, color: colors.text, lineHeight: 20 }}>
                Heads up: governor and senator answers were last verified on {freshness.lastVerified} ({freshness.ageDays} days ago). Officeholders can change after elections - please double-check current names at uscis.gov before your test.
              </Text>
            </View>
          </Card>
        );
      })()}

      {/* Hero: start practice */}
      <TouchableOpacity activeOpacity={0.95} onPress={() => startQuiz()}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="flag" size={14} color="#fff" />
              <Text style={styles.heroBadgeText}>{testLabel}</Text>
            </View>
            {daysUntilTest !== null && (
              <Text style={styles.heroDays}>{daysUntilTest}d left</Text>
            )}
          </View>
          <Text style={styles.heroTitle}>Start Practice</Text>
          <Text style={styles.heroSubtitle}>
            {stats.answered > 0
              ? `${stats.answered} questions answered - ${stats.accuracy}% accuracy`
              : 'Answer real test questions, one at a time'}
          </Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Let's go</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.answered}</Text>
          <Text style={styles.statLabel}>Answered</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.sessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </Card>
      </View>

      {/* Paused session */}
      {pausedSession && (
        <Card style={styles.resumeCard} onPress={() => navigation.navigate('Quiz', { type: pausedSession.type, resumeSession: true })}>
          <View style={styles.resumeRow}>
            <View style={styles.resumeIcon}>
              <MaterialCommunityIcons name="play-circle" size={28} color={colors.primary} />
            </View>
            <View style={styles.resumeText}>
              <Text style={styles.resumeTitle}>Continue where you left off</Text>
              <Text style={styles.resumeSubtitle}>Question {(pausedSession.current || 0) + 1} of {pausedSession.pool?.length || pausedSession.resumeContext?.queueLength || '?'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </View>
        </Card>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Keep improving</Text>
      <View style={styles.actionsGrid}>
        <Card style={styles.actionCard} onPress={() => {
          const ids = (Array.isArray(errorBank) ? errorBank : [])
            .map((e) => String(e?.id ?? ''))
            .filter(Boolean);
          if (ids.length === 0) return;
          navigation.navigate('Quiz', {
            type: testDetails?.testType || 'naturalization128',
            questionIds: ids,
            focusMode: 'minimal',
          });
        }}>
          <View style={[styles.actionIcon, { backgroundColor: colors.dangerLight }]}>
            <MaterialCommunityIcons name="target" size={24} color={colors.danger} />
          </View>
          <Text style={styles.actionTitle}>Weak spots</Text>
          <Text style={styles.actionSubtitle}>{weakCount > 0 ? `${weakCount} to review` : 'None yet'}</Text>
        </Card>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('Interview')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.infoLight }]}>
            <MaterialCommunityIcons name="microphone" size={24} color={colors.info} />
          </View>
          <Text style={styles.actionTitle}>Mock interview</Text>
          <Text style={styles.actionSubtitle}>Practice out loud</Text>
        </Card>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('MasteryMap')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.successLight }]}>
            <MaterialCommunityIcons name="map" size={24} color={colors.success} />
          </View>
          <Text style={styles.actionTitle}>Mastery map</Text>
          <Text style={styles.actionSubtitle}>See your progress</Text>
        </Card>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('Family')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.goldLight }]}>
            <MaterialCommunityIcons name="trophy-variant" size={24} color={colors.gold} />
          </View>
          <Text style={styles.actionTitle}>Squad</Text>
          <Text style={styles.actionSubtitle}>Challenge family</Text>
        </Card>
      </View>

      {/* Test details */}
      <Card style={styles.testCard} onPress={() => navigation.navigate('EditTestDetails')}>
        <View style={styles.testRow}>
          <MaterialCommunityIcons name="cog" size={20} color={colors.textSecondary} />
          <Text style={styles.testText}>{testLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
        </View>
      </Card>

      <HomeBannerAd />

      {/* Session length popup */}
      <Modal visible={showLengthModal} transparent animationType="fade" onRequestClose={() => setShowLengthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>How many questions?</Text>
            <Text style={styles.modalSubtitle}>Pick a session length to get started</Text>
            <View style={styles.modalGrid}>
              {LENGTH_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  activeOpacity={0.8}
                  style={styles.lengthOption}
                  onPress={() => handlePickLength(opt.value)}
                >
                  <View style={styles.lengthIconWrap}>
                    <MaterialCommunityIcons name={opt.icon} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.lengthNumber}>{opt.label}</Text>
                  <Text style={styles.lengthHint}>{opt.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowLengthModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Topic popup */}
      <Modal visible={showTopicModal} transparent animationType="fade" onRequestClose={() => setShowTopicModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>What do you want to drill?</Text>
            <Text style={styles.modalSubtitle}>Mix everything or focus on one topic</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.topicOption, styles.topicOptionHighlight]}
              onPress={() => handlePickTopic(ALL_TOPICS_VALUE)}
            >
              <MaterialCommunityIcons name="shuffle" size={22} color="#fff" />
              <Text style={styles.topicOptionHighlightText}>Mix of everything</Text>
            </TouchableOpacity>
            {topicOptions.map((topic) => (
              <TouchableOpacity
                key={topic}
                activeOpacity={0.8}
                style={styles.topicOption}
                onPress={() => handlePickTopic(topic)}
              >
                <MaterialCommunityIcons name="bookmark-outline" size={20} color={colors.primary} />
                <Text style={styles.topicOptionText}>{topic}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { setShowTopicModal(false); setShowLengthModal(true); }} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text },
  subgreeting: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: typography.bold, color: colors.primary },

  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.raised,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  heroBadgeText: { color: '#fff', fontSize: typography.small, fontWeight: typography.semibold, marginLeft: 4 },
  heroDays: { color: '#fff', fontSize: typography.small, fontWeight: typography.semibold, opacity: 0.9 },
  heroTitle: { fontSize: typography.hero, fontWeight: typography.bold, color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: typography.caption, color: 'rgba(255,255,255,0.85)', marginBottom: spacing.md },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  heroCtaText: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary, marginRight: 6 },

  statsRow: { flexDirection: 'row', marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'center', marginHorizontal: 4, paddingVertical: spacing.md },
  statValue: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text },
  statLabel: { fontSize: typography.small, color: colors.textSecondary, marginTop: 2 },

  resumeCard: { marginBottom: spacing.md, borderColor: colors.primary, borderWidth: 1.5 },
  resumeRow: { flexDirection: 'row', alignItems: 'center' },
  resumeIcon: { marginRight: spacing.sm },
  resumeText: { flex: 1 },
  resumeTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  resumeSubtitle: { fontSize: typography.caption, color: colors.textSecondary },

  sectionTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: spacing.md },
  actionCard: { width: '48%', margin: '1%', alignItems: 'center', paddingVertical: spacing.lg },
  actionIcon: { width: 52, height: 52, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionTitle: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.text },
  actionSubtitle: { fontSize: typography.small, color: colors.textSecondary, marginTop: 2 },

  testCard: { marginBottom: spacing.md },
  testRow: { flexDirection: 'row', alignItems: 'center' },
  testText: { flex: 1, fontSize: typography.caption, color: colors.textSecondary, marginLeft: spacing.sm },

  // Quick-start popups
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.card,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text, textAlign: 'center' },
  modalSubtitle: { fontSize: typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  lengthOption: {
    width: '47%',
    margin: '1.5%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lengthIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  lengthNumber: { fontSize: 24, fontWeight: typography.bold, color: colors.text },
  lengthHint: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  topicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  topicOptionHighlight: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicOptionText: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginLeft: spacing.sm },
  topicOptionHighlightText: { fontSize: typography.body, fontWeight: typography.bold, color: '#fff', marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.sm },
  modalCancelText: { fontSize: typography.body, color: colors.textSecondary },
});

export default HomeScreen;
