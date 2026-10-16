/**
 * HomeScreen (rebuilt) - Duolingo-style home.
 *
 * One focused hero card with the primary CTA, real stats from masteryMap,
 * quick actions to the rest of the app. No experiment clutter.
 * Previous version backed up at screens/HomeScreen.old.js.
 */
import React, { useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import { HomeBannerAd } from '../adMobService';
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
      answered += Number(q.asked || 0);
      correct += Number(q.correct || 0);
    });
    const totalQuestions = Number(masteryMap?.totalQuestions || 0);
    const totalSessions = Number(masteryMap?.totalSessions || 0);
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { answered: totalQuestions || answered, accuracy, sessions: totalSessions };
  }, [masteryMap]);

  const weakCount = Array.isArray(errorBank) ? errorBank.length : 0;
  const testLabel = TEST_TYPE_LABELS[testDetails?.testType] || 'Civics Test';

  const startQuiz = (params = {}) => {
    trackAppEvent?.('quiz_started_from_home', { test_type: testDetails?.testType || 'unknown' });
    navigation.navigate('Quiz', { type: testDetails?.testType || 'naturalization100', ...params });
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
            <MaterialCommunityIcons name="arrow-right" size={20} color="#4F46E5" />
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
        <Card style={styles.actionCard} onPress={() => navigation.navigate('Review')}>
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
});

export default HomeScreen;
