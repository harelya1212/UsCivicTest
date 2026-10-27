/**
 * MasteryMapScreen (rebuilt) - Duolingo-style progress.
 *
 * One progress ring, topic bars with emoji, single "Review now" CTA.
 * No tables, no filters. Clean and focused.
 */
import React, { useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { getQuestionTopic } from '../utils/helpers';
import { getQuestionBank } from '../quizHelpers';
import HomeButton from '../components/ui/HomeButton';
import { colors, gradients, spacing, typography, radius } from '../theme';

const TOPIC_EMOJI = {
  'American Government': '🏛️',
  'American History': '📜',
  'Integrated Civics': '🗽',
  'General': '📚',
};

function MasteryMapScreen({ navigation }) {
  const { masteryMap, testDetails } = useContext(AppDataContext);

  const stats = useMemo(() => {
    const byQ = masteryMap?.byQuestion || {};
    const ids = Object.keys(byQ);
    
    // Overall
    let totalAttempts = 0;
    let totalCorrect = 0;
    ids.forEach((id) => {
      totalAttempts += Number(byQ[id]?.attempts || 0);
      totalCorrect += Number(byQ[id]?.correct || 0);
    });
    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    // By topic
    const byTopic = {};
    ids.forEach((id) => {
      const q = byQ[id];
      const topic = q?.topic || 'General';
      if (!byTopic[topic]) byTopic[topic] = { attempts: 0, correct: 0 };
      byTopic[topic].attempts += Number(q?.attempts || 0);
      byTopic[topic].correct += Number(q?.correct || 0);
    });
    
    const topics = Object.entries(byTopic)
      .map(([topic, data]) => ({
        topic,
        emoji: TOPIC_EMOJI[topic] || '📚',
        accuracy: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0,
        attempts: data.attempts,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 4);
    
    // Due for review (accuracy < 70% and attempted)
    const dueCount = topics.filter(t => t.accuracy < 70 && t.attempts > 0).length;
    
    return { overallAccuracy, totalAttempts, topics, dueCount };
  }, [masteryMap]);

  const handleReview = () => {
    // Start a quiz focused on weak areas
    navigation.navigate('Quiz', {
      type: testDetails?.testType || 'naturalization128',
      forceQuestionCount: 10,
      reviewMode: true,
    });
  };

  if (stats.totalAttempts === 0) {
    return (
      <Screen>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No progress yet</Text>
          <Text style={styles.emptySubtitle}>
            Answer some questions and your mastery map will appear here.
          </Text>
          <Button title="Start Practice" onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header with home */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={styles.sectionTitle}>Mastery Map</Text>
        <HomeButton />
      </View>

      {/* Overall progress - gradient hero for TikTok energy */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <Text style={styles.heroEmoji}>🎯</Text>
        <Text style={styles.heroNumberWhite}>{stats.overallAccuracy}%</Text>
        <Text style={styles.heroLabelWhite}>Overall Accuracy</Text>
        <Text style={styles.heroSubWhite}>{stats.totalAttempts} questions answered</Text>
      </LinearGradient>

      {/* Topic bars - color-coded by mastery */}
      <Text style={styles.sectionTitle}>By Topic</Text>
      {stats.topics.map((t) => {
        const barColor = t.accuracy >= 80 ? colors.success : t.accuracy >= 60 ? '#F59E0B' : colors.error;
        return (
          <Card key={t.topic} style={styles.topicCard}>
            <View style={styles.topicRow}>
              <Text style={styles.topicEmoji}>{t.emoji}</Text>
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{t.topic}</Text>
                <ProgressBar progress={t.accuracy / 100} style={styles.topicBar} color={barColor} />
              </View>
              <Text style={[styles.topicPct, { color: barColor }]}>{t.accuracy}%</Text>
            </View>
          </Card>
        );
      })}

      {/* CTA */}
      {stats.dueCount > 0 ? (
        <Button
          title={`Review ${stats.dueCount} weak topic${stats.dueCount === 1 ? '' : 's'}`}
          onPress={handleReview}
          style={styles.cta}
          icon={<MaterialCommunityIcons name="refresh" size={20} color="#fff" />}
        />
      ) : (
        <Card style={styles.celebrateCard}>
          <Text style={styles.celebrateEmoji}>🌟</Text>
          <Text style={styles.celebrateTitle}>All topics strong!</Text>
          <Text style={styles.celebrateSub}>Keep practicing to maintain your streak.</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  heroEmoji: { fontSize: 48, marginBottom: spacing.sm },
  heroNumber: { fontSize: 56, fontWeight: typography.bold, color: colors.primary },
  heroNumberWhite: { fontSize: 56, fontWeight: typography.bold, color: '#fff' },
  heroLabel: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginTop: 4 },
  heroLabelWhite: { fontSize: typography.body, fontWeight: typography.semibold, color: '#fff', marginTop: 4 },
  heroSub: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  heroSubWhite: { fontSize: typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  topicCard: { marginBottom: spacing.sm },
  topicRow: { flexDirection: 'row', alignItems: 'center' },
  topicEmoji: { fontSize: 28, marginRight: spacing.md },
  topicInfo: { flex: 1 },
  topicName: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: 4 },
  topicBar: { height: 8 },
  topicPct: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary, marginLeft: spacing.md, minWidth: 48, textAlign: 'right' },
  cta: { marginTop: spacing.lg },
  celebrateCard: { alignItems: 'center', paddingVertical: spacing.lg, marginTop: spacing.lg, backgroundColor: colors.successLight },
  celebrateEmoji: { fontSize: 40, marginBottom: spacing.sm },
  celebrateTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text },
  celebrateSub: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
});

export default MasteryMapScreen;
