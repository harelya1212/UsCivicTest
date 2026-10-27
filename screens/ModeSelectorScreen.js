/**
 * ModeSelectorScreen (rebuilt) - Duolingo-style practice setup.
 *
 * Pick a test type, optionally narrow by topic/subtopic chips, then start.
 * Business logic is unchanged from the original: same state, same filters,
 * same Quiz navigation params. Only the visual layer is new.
 */
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import HomeButton from '../components/ui/HomeButton';
import { ALL_TOPICS_VALUE, ALL_SUBTOPICS_VALUE } from '../constants';
import { getQuestionTopic, getQuestionSubTopic } from '../utils/helpers';
import { getQuestionBank } from '../quizHelpers';
import { colors, radius, spacing, typography } from '../theme';

const MODES = [
  {
    type: 'naturalization128',
    title: 'Citizenship Test',
    subtitle: '128 questions - 2025 test',
    icon: 'flag',
    tint: colors.primaryLight,
    iconColor: colors.primary,
  },
  {
    type: 'naturalization100',
    title: 'Citizenship Test',
    subtitle: '100 questions - 2008 test',
    icon: 'bank',
    tint: colors.infoLight,
    iconColor: colors.info,
  },
  {
    type: 'highschool',
    title: 'High School Civics',
    subtitle: 'Arizona graduation test - 70% to pass',
    icon: 'school',
    tint: colors.goldLight,
    iconColor: colors.gold,
  },
];

function FilterChips({ options, selected, onSelect, allLabel, allValue }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
      <Chip label={allLabel} selected={selected === allValue} onPress={() => onSelect(allValue)} />
      {options.map((option) => (
        <Chip key={option} label={option} selected={selected === option} onPress={() => onSelect(option)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ModeSelectorScreen({ navigation }) {
  const { testDetails } = useContext(AppDataContext);

  const defaultType = testDetails?.testType || 'naturalization128';
  const [selectedType, setSelectedType] = useState(defaultType);
  const [selectedTopic, setSelectedTopic] = useState(ALL_TOPICS_VALUE);
  const [selectedSubTopic, setSelectedSubTopic] = useState(ALL_SUBTOPICS_VALUE);
  const [sessionLength, setSessionLength] = useState('all');

  const SESSION_LENGTHS = [
    { value: '10', label: '10', hint: 'Quick drill' },
    { value: '20', label: '20', hint: 'Short session' },
    { value: '50', label: '50', hint: 'Deep practice' },
    { value: 'all', label: 'All', hint: 'Full test' },
  ];

  const fullPool = useMemo(() => getQuestionBank(selectedType), [selectedType]);

  const topicOptions = useMemo(() => (
    Array.from(new Set(fullPool.map((q) => getQuestionTopic(q)).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  ), [fullPool]);

  const subTopicOptions = useMemo(() => {
    const sourcePool = selectedTopic === ALL_TOPICS_VALUE
      ? fullPool
      : fullPool.filter((q) => getQuestionTopic(q) === selectedTopic);
    return Array.from(new Set(sourcePool.map((q) => getQuestionSubTopic(q)).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
  }, [fullPool, selectedTopic]);

  const filteredPool = useMemo(() => fullPool.filter((q) => {
    const topicMatch = selectedTopic === ALL_TOPICS_VALUE || getQuestionTopic(q) === selectedTopic;
    const subTopicMatch = selectedSubTopic === ALL_SUBTOPICS_VALUE || getQuestionSubTopic(q) === selectedSubTopic;
    return topicMatch && subTopicMatch;
  }), [fullPool, selectedTopic, selectedSubTopic]);

  const modeCounts = useMemo(() => {
    const counts = {};
    MODES.forEach((m) => {
      try {
        counts[m.type] = getQuestionBank(m.type).length;
      } catch {
        counts[m.type] = 0;
      }
    });
    return counts;
  }, []);

  useEffect(() => {
    setSelectedSubTopic(ALL_SUBTOPICS_VALUE);
  }, [selectedTopic]);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setSelectedTopic(ALL_TOPICS_VALUE);
    setSelectedSubTopic(ALL_SUBTOPICS_VALUE);
  };

  const startPractice = () => {
    navigation.navigate('Quiz', {
      type: selectedType,
      topicFilter: selectedTopic === ALL_TOPICS_VALUE ? null : selectedTopic,
      subTopicFilter: selectedSubTopic === ALL_SUBTOPICS_VALUE ? null : selectedSubTopic,
      forceQuestionCount: sessionLength === 'all' ? 0 : parseInt(sessionLength, 10),
    });
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <HomeButton />
      </View>

      <Text style={styles.pageTitle}>Practice Setup</Text>
      <Text style={styles.pageSubtitle}>Pick your test, then focus on what you want to drill.</Text>

      <Text style={styles.sectionTitle}>Test type</Text>
      {MODES.map((mode) => {
        const isSelected = mode.type === selectedType;
        return (
          <Card
            key={mode.type}
            onPress={() => handleSelectType(mode.type)}
            style={[styles.modeCard, isSelected && styles.modeCardSelected]}
          >
            <View style={[styles.modeIcon, { backgroundColor: mode.tint }]}>
              <MaterialCommunityIcons name={mode.icon} size={26} color={mode.iconColor} />
            </View>
            <View style={styles.modeText}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSubtitle}>
                {mode.subtitle}{modeCounts[mode.type] ? ` - ${modeCounts[mode.type]} questions` : ''}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={isSelected ? 'check-circle' : 'chevron-right'}
              size={24}
              color={isSelected ? colors.primary : colors.textTertiary}
            />
          </Card>
        );
      })}

      <Text style={styles.sectionTitle}>Topic</Text>
      <FilterChips
        options={topicOptions}
        selected={selectedTopic}
        onSelect={setSelectedTopic}
        allLabel="All topics"
        allValue={ALL_TOPICS_VALUE}
      />

      {subTopicOptions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Subtopic</Text>
          <FilterChips
            options={subTopicOptions}
            selected={selectedSubTopic}
            onSelect={setSelectedSubTopic}
            allLabel="All subtopics"
            allValue={ALL_SUBTOPICS_VALUE}
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Session length</Text>
      <View style={styles.lengthRow}>
        {SESSION_LENGTHS.map((opt) => {
          const isSelected = sessionLength === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSessionLength(opt.value)}
              activeOpacity={0.8}
              style={[styles.lengthChip, isSelected && styles.lengthChipSelected]}
            >
              <Text style={[styles.lengthLabel, isSelected && styles.lengthLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.lengthHint, isSelected && styles.lengthHintSelected]}>
                {opt.hint}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.summaryCard}>
        <MaterialCommunityIcons name="filter-variant" size={20} color={colors.primary} />
        <Text style={styles.summaryText}>
          {filteredPool.length} question{filteredPool.length === 1 ? '' : 's'} match your filters
        </Text>
      </Card>

      <Button
        title="Start Practice"
        size="lg"
        onPress={startPractice}
        disabled={filteredPool.length === 0}
        icon={<MaterialCommunityIcons name="play" size={20} color="#fff" style={{ marginRight: 6 }} />}
        style={styles.startButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  backText: { color: colors.primary, fontWeight: typography.semibold, marginLeft: 4, fontSize: typography.caption },

  pageTitle: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text },
  pageSubtitle: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md },

  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  modeCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  modeCardSelected: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  modeIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  modeText: { flex: 1 },
  modeTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  modeSubtitle: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },

  chipsRow: { paddingRight: spacing.md },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: spacing.sm,
    maxWidth: 220,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { fontSize: typography.caption, fontWeight: typography.medium, color: colors.textSecondary },
  chipTextSelected: { color: '#fff', fontWeight: typography.semibold },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  summaryText: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.primaryDark, marginLeft: spacing.sm },

  lengthRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  lengthChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lengthChipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 1.5 },
  lengthLabel: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text },
  lengthLabelSelected: { color: colors.primaryDark },
  lengthHint: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  lengthHintSelected: { color: colors.primary },

  startButton: { marginTop: spacing.sm },
});

export default ModeSelectorScreen;
