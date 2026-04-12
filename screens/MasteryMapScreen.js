import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import {
  getDayKey,
  daysSince,
} from '../utils/helpers';
import { buildSmartQueue } from '../utils/smartQueue';

function MasteryMapScreen({ navigation }) {
  const { masteryMap, resetMasteryMap, testDetails } = useContext(AppDataContext);
  const [completedRouteSteps, setCompletedRouteSteps] = useState({});
  const entries = Object.entries(masteryMap?.byQuestion || {}).map(([id, value]) => ({ id, ...value }));

  const topicAccumulator = {};
  const subTopicAccumulator = {};

  for (const entry of entries) {
    const topic = entry.topic || 'General';
    const subTopic = entry.subTopic || 'General';
    if (!topicAccumulator[topic]) topicAccumulator[topic] = { attempts: 0, correct: 0, questions: 0 };
    topicAccumulator[topic].attempts += entry.attempts || 0;
    topicAccumulator[topic].correct += entry.correct || 0;
    topicAccumulator[topic].questions += 1;

    const key = `${topic}__${subTopic}`;
    if (!subTopicAccumulator[key]) {
      subTopicAccumulator[key] = {
        topic,
        subTopic,
        attempts: 0,
        correct: 0,
        questions: 0,
      };
    }
    subTopicAccumulator[key].attempts += entry.attempts || 0;
    subTopicAccumulator[key].correct += entry.correct || 0;
    subTopicAccumulator[key].questions += 1;
  }

  const topicStats = Object.entries(topicAccumulator)
    .map(([topic, stat]) => ({
      topic,
      attempts: stat.attempts,
      correct: stat.correct,
      questions: stat.questions,
      accuracy: stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts);

  const subTopicStats = Object.values(subTopicAccumulator)
    .map((stat) => ({
      ...stat,
      accuracy: stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0,
    }))
    .sort((a, b) => {
      if (a.accuracy === b.accuracy) return b.attempts - a.attempts;
      return a.accuracy - b.accuracy;
    });

  const dueQuestions = entries.filter((entry) => {
    const dueDays = computeDueDays(entry);
    const since = daysSince(entry.lastSeen);
    return since >= dueDays;
  });

  const dueByTopic = dueQuestions.reduce((acc, entry) => {
    const topic = entry.topic || 'General';
    if (!acc[topic]) acc[topic] = { topic, due: 0, attempts: 0, correct: 0 };
    acc[topic].due += 1;
    acc[topic].attempts += entry.attempts || 0;
    acc[topic].correct += entry.correct || 0;
    return acc;
  }, {});

  const dueTopicStats = Object.values(dueByTopic)
    .map((item) => ({
      ...item,
      accuracy: item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0,
    }))
    .sort((a, b) => b.due - a.due);

  const recommendations = topicStats
    .map((topic) => {
      const due = dueByTopic[topic.topic]?.due || 0;
      const score = ((100 - topic.accuracy) * 1.5) + due * 5 + Math.min(20, topic.attempts * 0.25);
      return {
        ...topic,
        due,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const topicDaily = masteryMap?.topicDaily || {};
  const buildWindow = (offsetStart, offsetEnd) => {
    const keys = [];
    for (let i = offsetStart; i <= offsetEnd; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      keys.push(getDayKey(d));
    }
    return keys;
  };
  const currentWeekKeys = buildWindow(0, 6);
  const previousWeekKeys = buildWindow(7, 13);
  const lastSevenDayKeys = [...currentWeekKeys].reverse();

  const trendRows = topicStats.map((topic) => {
    const map = topicDaily[topic.topic] || {};
    const aggregate = (keys) => keys.reduce((acc, key) => {
      const day = map[key] || { attempts: 0, correct: 0 };
      acc.attempts += day.attempts || 0;
      acc.correct += day.correct || 0;
      return acc;
    }, { attempts: 0, correct: 0 });

    const current = aggregate(currentWeekKeys);
    const previous = aggregate(previousWeekKeys);
    const currentAcc = current.attempts ? Math.round((current.correct / current.attempts) * 100) : 0;
    const previousAcc = previous.attempts ? Math.round((previous.correct / previous.attempts) * 100) : 0;
    const delta = currentAcc - previousAcc;
    const trend = current.attempts === 0
      ? 'no-data'
      : delta >= 5
        ? 'improving'
        : delta <= -5
          ? 'declining'
          : 'stagnant';

    return {
      topic: topic.topic,
      currentAcc,
      previousAcc,
      currentAttempts: current.attempts,
      previousAttempts: previous.attempts,
      delta,
      trend,
    };
  }).sort((a, b) => {
    if (a.trend === b.trend) return a.topic.localeCompare(b.topic);
    const order = { declining: 0, stagnant: 1, improving: 2, 'no-data': 3 };
    return (order[a.trend] ?? 9) - (order[b.trend] ?? 9);
  });

  const topicRadarRows = topicStats
    .map((topic) => {
      const due = dueByTopic[topic.topic]?.due || 0;
      const urgencyScoreRaw = ((100 - topic.accuracy) * 0.7) + (due * 7) + Math.min(18, topic.attempts * 0.3);
      return {
        ...topic,
        due,
        urgencyScoreRaw,
      };
    })
    .sort((a, b) => b.urgencyScoreRaw - a.urgencyScoreRaw)
    .slice(0, 6);

  const topicRadarMaxScore = Math.max(1, ...topicRadarRows.map((row) => row.urgencyScoreRaw));
  const topicRadar = topicRadarRows.map((row) => ({
    ...row,
    urgencyPercent: Math.max(8, Math.round((row.urgencyScoreRaw / topicRadarMaxScore) * 100)),
  }));

  const trendByTopic = trendRows.reduce((acc, row) => {
    acc[row.topic] = row;
    return acc;
  }, {});

  const getUrgencyBand = (score) => {
    if (score >= 78) return { label: 'Critical', color: '#FCA5A5', bg: 'rgba(248,113,113,0.15)' };
    if (score >= 58) return { label: 'High', color: '#FDBA74', bg: 'rgba(251,146,60,0.12)' };
    if (score >= 36) return { label: 'Medium', color: '#FCD34D', bg: 'rgba(252,211,77,0.10)' };
    return { label: 'Low', color: '#6EE7B7', bg: 'rgba(52,211,153,0.10)' };
  };

  const urgencyMapRows = topicRadar
    .map((row) => {
      const trend = trendByTopic[row.topic]?.trend || 'no-data';
      const trendPenalty = trend === 'declining' ? 12 : trend === 'stagnant' ? 6 : trend === 'improving' ? 0 : 4;
      const compositeScore = Math.min(100, Math.round(row.urgencyPercent + trendPenalty));
      return {
        ...row,
        trend,
        compositeScore,
        band: getUrgencyBand(compositeScore),
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const routePrimaryTopic = urgencyMapRows[0]?.topic || null;
  const routeTrendTopic = urgencyMapRows.find((row) => row.topic !== routePrimaryTopic && row.trend === 'declining')?.topic || null;
  const routeDueTopic = dueTopicStats.find((row) => row.topic !== routePrimaryTopic && row.topic !== routeTrendTopic)?.topic || null;

  const routeStepConfidence = (topic, fallback = 40) => {
    if (!topic) return fallback;
    const row = urgencyMapRows.find((r) => r.topic === topic) ?? topicStats.find((t) => t.topic === topic);
    if (!row) return fallback;
    const density = Math.min(60, Math.round((Math.min(row.attempts || 0, 40) / 40) * 60));
    const signal = row.compositeScore !== undefined
      ? Math.round((row.compositeScore / 100) * 37)
      : Math.round(((100 - (row.accuracy || 50)) / 100) * 37);
    return Math.max(30, Math.min(97, density + signal));
  };

  const actionableStudyRoute = [
    {
      step: 1,
      title: 'Rescue Top Urgency Topic',
      subtitle: routePrimaryTopic
        ? `${routePrimaryTopic} has the highest urgency score right now.`
        : 'Start a quick session to seed urgency scoring.',
      actionLabel: routePrimaryTopic ? `Start ${routePrimaryTopic}` : 'Seed Data',
      actionType: routePrimaryTopic ? 'topic' : 'smart',
      topic: routePrimaryTopic,
      focusMode: 'minimal',
      confidence: routeStepConfidence(routePrimaryTopic, 38),
    },
    {
      step: 2,
      title: 'Stabilize Trend Risk',
      subtitle: routeTrendTopic
        ? `${routeTrendTopic} is trending down; run an 8-question correction set.`
        : 'No declining trend detected. Run Focus Smart Queue to prevent drift.',
      actionLabel: routeTrendTopic ? `Correct ${routeTrendTopic}` : 'Focus Smart Queue',
      actionType: routeTrendTopic ? 'topic' : 'smart',
      topic: routeTrendTopic,
      focusMode: 'minimal',
      confidence: routeStepConfidence(routeTrendTopic, 45),
    },
    {
      step: 3,
      title: 'Close Due Review Debt',
      subtitle: routeDueTopic
        ? `${routeDueTopic} has due questions ready for spaced-review reinforcement.`
        : 'No specific due topic selected. Run Smart Queue to close mixed due items.',
      actionLabel: routeDueTopic ? `Review ${routeDueTopic}` : 'Start Smart Queue',
      actionType: routeDueTopic ? 'topic' : 'smart',
      topic: routeDueTopic,
      focusMode: null,
      confidence: routeDueTopic
        ? Math.min(95, 40 + (dueTopicStats.find((r) => r.topic === routeDueTopic)?.due || 0) * 8)
        : 35,
    },
  ];

  const trendStripDays = lastSevenDayKeys.map((dayKey) => {
    const aggregate = topicStats.reduce((acc, topic) => {
      const day = topicDaily?.[topic.topic]?.[dayKey] || { attempts: 0, correct: 0 };
      acc.attempts += day.attempts || 0;
      acc.correct += day.correct || 0;
      return acc;
    }, { attempts: 0, correct: 0 });

    const accuracy = aggregate.attempts ? Math.round((aggregate.correct / aggregate.attempts) * 100) : 0;
    const label = dayKey.slice(5); // MM-DD

    return {
      dayKey,
      label,
      attempts: aggregate.attempts,
      accuracy,
    };
  });

  const trendStripMaxAttempts = Math.max(1, ...trendStripDays.map((day) => day.attempts));

  const getHeatStyle = (accuracy, attempts) => {
    if (!attempts) return { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', textColor: '#64748B' };
    if (accuracy < 60) return { backgroundColor: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', textColor: '#FCA5A5' };
    if (accuracy < 75) return { backgroundColor: 'rgba(251,146,60,0.10)', borderColor: 'rgba(251,146,60,0.25)', textColor: '#FDBA74' };
    if (accuracy < 90) return { backgroundColor: 'rgba(252,211,77,0.08)', borderColor: 'rgba(252,211,77,0.2)', textColor: '#FCD34D' };
    return { backgroundColor: 'rgba(52,211,153,0.10)', borderColor: 'rgba(52,211,153,0.25)', textColor: '#6EE7B7' };
  };

  const weakFocus = subTopicStats.slice(0, 5);
  const totalAttempts = masteryMap?.totalQuestions || 0;
  const launchType = testDetails?.testType || 'naturalization128';

  const smartQueueQuestionIds = buildSmartQueue(entries);

  const startRecommendation = (topicName) => {
    navigation.navigate('Quiz', {
      type: launchType,
      topicFilter: topicName,
      subTopicFilter: null,
      forceQuestionCount: 8,
    });
  };

  const startSmartQueue = (focusMode = null) => {
    if (!smartQueueQuestionIds.length) {
      Alert.alert('No Smart Queue Yet', 'Complete at least one quiz so Smart Queue can pick weak/due questions.');
      return;
    }

    navigation.navigate('Quiz', {
      type: launchType,
      questionIds: smartQueueQuestionIds,
      forceQuestionCount: 8,
      focusMode,
    });
  };

  const getTrendBadgeStyle = (trend) => {
    if (trend === 'improving') return { bg: 'rgba(52,211,153,0.15)', color: '#6EE7B7', label: 'Improving' };
    if (trend === 'declining') return { bg: 'rgba(248,113,113,0.15)', color: '#FCA5A5', label: 'Declining' };
    if (trend === 'stagnant') return { bg: 'rgba(252,211,77,0.12)', color: '#FCD34D', label: 'Stagnant' };
    return { bg: 'rgba(255,255,255,0.06)', color: '#64748B', label: 'No Data' };
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#A78BFA" />
          <Text style={{ color: '#A78BFA', fontWeight: '600', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Mastery Map</Text>
        <Text style={styles.pageSubtitle}>Topic confidence and subtopic heatmap from your real quiz history.</Text>

        <View style={styles.masteryOverviewCard}>
          <View style={styles.masteryOverviewRow}>
            <View style={styles.masteryMetric}>
              <Text style={styles.masteryMetricValue}>{masteryMap?.totalSessions || 0}</Text>
              <Text style={styles.masteryMetricLabel}>Sessions</Text>
            </View>
            <View style={styles.masteryMetric}>
              <Text style={styles.masteryMetricValue}>{totalAttempts}</Text>
              <Text style={styles.masteryMetricLabel}>Attempts</Text>
            </View>
            <View style={styles.masteryMetric}>
              <Text style={styles.masteryMetricValue}>{entries.length}</Text>
              <Text style={styles.masteryMetricLabel}>Questions Tracked</Text>
            </View>
          </View>
          <Text style={styles.masteryUpdatedText}>
            {masteryMap?.updatedAt ? `Updated ${new Date(masteryMap.updatedAt).toLocaleString()}` : 'No attempts tracked yet'}
          </Text>
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Smart Queue</Text>
          <Text style={styles.masteryEmptyText}>Auto-mixes your weakest and due-for-review questions into an 8-question pack.</Text>
          <View style={styles.masterySmartQueueActions}>
            <TouchableOpacity style={styles.masteryActionButtonLarge} onPress={() => startSmartQueue(null)}>
              <MaterialCommunityIcons name="brain" size={16} color="#fff" />
              <Text style={styles.masteryActionButtonText}>Start Smart Queue (8)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.masteryActionButtonGhost} onPress={() => startSmartQueue('minimal')}>
              <MaterialCommunityIcons name="target-variant" size={16} color="#67E8F9" />
              <Text style={styles.masteryActionButtonGhostText}>Focus Smart Queue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Due For Review</Text>
          {dueTopicStats.length === 0 ? (
            <Text style={styles.masteryEmptyText}>Nothing due yet. Keep practicing to seed spaced repetition.</Text>
          ) : (
            dueTopicStats.map((item) => (
              <View key={`due-${item.topic}`} style={styles.masteryDueRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.masteryDueTitle}>{item.topic}</Text>
                  <Text style={styles.masteryDueMeta}>{item.due} due • {item.accuracy}% lifetime accuracy</Text>
                </View>
                <TouchableOpacity style={styles.masteryActionButton} onPress={() => startRecommendation(item.topic)}>
                  <Text style={styles.masteryActionButtonText}>Do 8 Now</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Topic Recommendations</Text>
          {!recommendations.length ? (
            <Text style={styles.masteryEmptyText}>No recommendations yet. Complete one quiz session.</Text>
          ) : (
            recommendations.map((topic) => (
              <View key={`rec-${topic.topic}`} style={styles.masteryRecommendationRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.masteryTopicTitle}>{topic.topic}</Text>
                  <Text style={styles.masteryRecommendationMeta}>Recommended: do 8 questions now • {topic.accuracy}% accuracy • {topic.due} due</Text>
                </View>
                <TouchableOpacity style={styles.masteryActionButton} onPress={() => startRecommendation(topic.topic)}>
                  <Text style={styles.masteryActionButtonText}>Start 8</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Topic Radar (Sprint 4 Data Prep)</Text>
          {!topicRadar.length ? (
            <Text style={styles.masteryEmptyText}>No radar data yet. Complete one quiz session.</Text>
          ) : (
            topicRadar.map((row) => (
              <View key={`radar-${row.topic}`} style={styles.masteryTopicRow}>
                <View style={styles.masteryTopicHeader}>
                  <Text style={styles.masteryTopicTitle}>{row.topic}</Text>
                  <Text style={styles.masteryTopicMeta}>Urgency {Math.round(row.urgencyScoreRaw)} • {row.due} due</Text>
                </View>
                <View style={styles.masteryBarTrack}>
                  <View style={[styles.masteryBarFill, { width: `${row.urgencyPercent}%`, backgroundColor: '#FB923C' }]} />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>7-Day Trend Strip (Sprint 4 Data Prep)</Text>
          {!trendStripDays.some((day) => day.attempts > 0) ? (
            <Text style={styles.masteryEmptyText}>No daily trend strip data yet.</Text>
          ) : (
            <View style={styles.masteryTrendStripRow}>
              {trendStripDays.map((day) => {
                const heightPct = Math.max(10, Math.round((day.attempts / trendStripMaxAttempts) * 100));
                const barColor = day.accuracy >= 80 ? '#34D399' : day.accuracy >= 65 ? '#FBBF24' : '#F87171';
                return (
                  <View key={`strip-${day.dayKey}`} style={styles.masteryTrendStripCol}>
                    <Text style={styles.masteryTrendStripTop}>{day.attempts}</Text>
                    <View style={styles.masteryTrendStripTrack}>
                      <View style={[styles.masteryTrendStripFill, { height: `${heightPct}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.masteryTrendStripBottom}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Weak-Area Urgency Map</Text>
          {!urgencyMapRows.length ? (
            <Text style={styles.masteryEmptyText}>No urgency map yet. Complete one quiz session.</Text>
          ) : (
            urgencyMapRows.map((row) => (
              <View key={`urgency-${row.topic}`} style={styles.masteryUrgencyRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.masteryUrgencyHeader}>
                    <Text style={styles.masteryTopicTitle}>{row.topic}</Text>
                    <View style={[styles.masteryUrgencyBadge, { backgroundColor: row.band.bg }]}> 
                      <Text style={[styles.masteryUrgencyBadgeText, { color: row.band.color }]}>{row.band.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.masteryTrendMeta}>
                    Score {row.compositeScore} • Due {row.due} • Trend {row.trend}
                  </Text>
                  <View style={styles.masteryBarTrack}>
                    <View style={[styles.masteryBarFill, { width: `${Math.max(6, row.compositeScore)}%`, backgroundColor: '#F87171' }]} />
                  </View>
                </View>
                <TouchableOpacity style={styles.masteryActionButton} onPress={() => startRecommendation(row.topic)}>
                  <Text style={styles.masteryActionButtonText}>Fix Now</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>3-Step Study Route (Auto-Generated)</Text>
          {!topicStats.length ? (
            <Text style={styles.masteryEmptyText}>No route yet. Complete one quiz session to generate your personalized plan.</Text>
          ) : (
            actionableStudyRoute.map((item) => {
              const isDone = !!completedRouteSteps[item.step];
              const confColor = item.confidence >= 75 ? '#6EE7B7' : item.confidence >= 50 ? '#FCD34D' : '#64748B';
              const confBg = item.confidence >= 75 ? 'rgba(52,211,153,0.15)' : item.confidence >= 50 ? 'rgba(252,211,77,0.12)' : 'rgba(255,255,255,0.06)';
              return (
                <View key={`route-step-${item.step}`} style={[styles.masteryRouteRow, isDone && styles.masteryRouteRowDone]}>
                  <View style={[styles.masteryRouteStepBadge, isDone && { backgroundColor: '#34D399' }]}>
                    {isDone
                      ? <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      : <Text style={styles.masteryRouteStepBadgeText}>{item.step}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.masteryTopicTitle, isDone && { color: '#64748B' }]}>{item.title}</Text>
                    <Text style={styles.masteryRecommendationMeta}>{item.subtitle}</Text>
                    <View style={[styles.masteryRouteConfidencePill, { backgroundColor: confBg }]}>
                      <Text style={[styles.masteryRouteConfidencePillText, { color: confColor }]}>
                        {isDone ? '✓ Launched' : `Confidence ${item.confidence}%`}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.masteryActionButton, isDone && styles.masteryActionButtonDone]}
                    onPress={() => {
                      setCompletedRouteSteps((prev) => ({ ...prev, [item.step]: true }));
                      if (item.actionType === 'topic' && item.topic) {
                        startRecommendation(item.topic);
                        return;
                      }
                      startSmartQueue(item.focusMode);
                    }}
                  >
                    <Text style={[styles.masteryActionButtonText, isDone && { color: '#64748B' }]}>
                      {isDone ? 'Done' : item.actionLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Weekly Trend By Topic</Text>
          {!trendRows.length ? (
            <Text style={styles.masteryEmptyText}>No trend data yet.</Text>
          ) : (
            trendRows.map((row) => {
              const badge = getTrendBadgeStyle(row.trend);
              return (
                <View key={`trend-${row.topic}`} style={styles.masteryTrendRow}>
                  <View style={styles.masteryTrendHeader}>
                    <Text style={styles.masteryTopicTitle}>{row.topic}</Text>
                    <View style={[styles.masteryTrendBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.masteryTrendBadgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.masteryTrendMeta}>
                    This week: {row.currentAcc}% ({row.currentAttempts} attempts) • Last week: {row.previousAcc}% ({row.previousAttempts} attempts)
                  </Text>
                  <View style={styles.masteryTrendBars}>
                    <View style={styles.masteryTrendBarBlock}>
                      <Text style={styles.masteryTrendBarLabel}>Last</Text>
                      <View style={styles.masteryBarTrack}>
                        <View style={[styles.masteryBarFill, { width: `${Math.max(2, row.previousAcc)}%`, backgroundColor: '#94A3B8' }]} />
                      </View>
                    </View>
                    <View style={styles.masteryTrendBarBlock}>
                      <Text style={styles.masteryTrendBarLabel}>Now</Text>
                      <View style={styles.masteryBarTrack}>
                        <View style={[styles.masteryBarFill, { width: `${Math.max(2, row.currentAcc)}%`, backgroundColor: '#0EA5E9' }]} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Topic Confidence</Text>
          {!topicStats.length ? (
            <Text style={styles.masteryEmptyText}>Take one quiz to generate your mastery map.</Text>
          ) : (
            topicStats.map((topic) => {
              const pct = Math.max(5, topic.accuracy);
              return (
                <View key={topic.topic} style={styles.masteryTopicRow}>
                  <View style={styles.masteryTopicHeader}>
                    <Text style={styles.masteryTopicTitle}>{topic.topic}</Text>
                    <Text style={styles.masteryTopicMeta}>{topic.accuracy}% • {topic.attempts} attempts</Text>
                  </View>
                  <View style={styles.masteryBarTrack}>
                    <View style={[styles.masteryBarFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Focus Now (Weakest Subtopics)</Text>
          {!weakFocus.length ? (
            <Text style={styles.masteryEmptyText}>No subtopic data yet.</Text>
          ) : (
            weakFocus.map((item, idx) => {
              const heat = getHeatStyle(item.accuracy, item.attempts);
              return (
                <View key={`${item.topic}-${item.subTopic}-${idx}`} style={[styles.masteryHeatItem, { backgroundColor: heat.backgroundColor, borderColor: heat.borderColor }]}>
                  <Text style={[styles.masteryHeatTitle, { color: heat.textColor }]}>{item.topic} → {item.subTopic}</Text>
                  <Text style={[styles.masteryHeatMeta, { color: heat.textColor }]}>{item.accuracy}% accuracy • {item.attempts} attempts</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryCardTitle}>Subtopic Heatmap</Text>
          {!subTopicStats.length ? (
            <Text style={styles.masteryEmptyText}>No heatmap yet. Complete a quiz first.</Text>
          ) : (
            <View style={styles.masteryHeatmapWrap}>
              {subTopicStats.map((item, idx) => {
                const heat = getHeatStyle(item.accuracy, item.attempts);
                return (
                  <View
                    key={`${item.topic}-${item.subTopic}-${idx}`}
                    style={[styles.masteryHeatTile, { backgroundColor: heat.backgroundColor, borderColor: heat.borderColor }]}
                  >
                    <Text style={[styles.masteryHeatTilePct, { color: heat.textColor }]}>{item.attempts ? `${item.accuracy}%` : 'N/A'}</Text>
                    <Text style={[styles.masteryHeatTileName, { color: heat.textColor }]} numberOfLines={2}>{item.subTopic}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.masteryResetButton} onPress={resetMasteryMap}>
          <MaterialCommunityIcons name="refresh" size={18} color="#A78BFA" />
          <Text style={styles.masteryResetButtonText}>Reset Mastery Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MasteryMapScreen;
