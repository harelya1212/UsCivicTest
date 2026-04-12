import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import {
  ALL_TOPICS_VALUE,
  ALL_SUBTOPICS_VALUE,
} from '../constants';
import {
  getQuestionTopic,
  getQuestionSubTopic,
} from '../utils/helpers';
import {
  getQuestionBank,
} from '../quizHelpers';

function ModeSelectorScreen({ navigation }) {
  const { testDetails } = useContext(AppDataContext);
  const modes = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫', color: '#EC4899' },
    { type: 'naturalization100', title: 'Naturalization (100Q)', icon: '🏛️', color: '#3B82F6' },
    { type: 'naturalization128', title: 'Naturalization (128Q)', icon: '🇺🇸', color: '#10B981' },
  ];
  const defaultType = testDetails?.testType || 'naturalization128';
  const [selectedType, setSelectedType] = useState(defaultType);
  const [selectedTopic, setSelectedTopic] = useState(ALL_TOPICS_VALUE);
  const [selectedSubTopic, setSelectedSubTopic] = useState(ALL_SUBTOPICS_VALUE);

  const fullPool = getQuestionBank(selectedType);
  const topicOptions = Array.from(new Set(fullPool.map((question) => getQuestionTopic(question)).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
  const subTopicSourcePool = selectedTopic === ALL_TOPICS_VALUE
    ? fullPool
    : fullPool.filter((question) => getQuestionTopic(question) === selectedTopic);
  const subTopicOptions = Array.from(new Set(subTopicSourcePool.map((question) => getQuestionSubTopic(question)).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
  const filteredPool = fullPool.filter((question) => {
    const topicMatch = selectedTopic === ALL_TOPICS_VALUE || getQuestionTopic(question) === selectedTopic;
    const subTopicMatch = selectedSubTopic === ALL_SUBTOPICS_VALUE || getQuestionSubTopic(question) === selectedSubTopic;
    return topicMatch && subTopicMatch;
  });

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
    });
  };

  useEffect(() => {
    setSelectedSubTopic(ALL_SUBTOPICS_VALUE);
  }, [selectedTopic]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#A78BFA" />
          <Text style={{ color: '#A78BFA', fontWeight: '600', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Practice Setup</Text>
        <Text style={styles.pageSubtitle}>Choose test type, topic, and subtopic before you start</Text>

        {modes.map((mode) => {
          const isSelected = mode.type === selectedType;
          return (
            <TouchableOpacity
              key={mode.type}
              style={[styles.modeCard, { borderLeftColor: mode.color, borderLeftWidth: isSelected ? 6 : 3, backgroundColor: isSelected ? 'rgba(139,92,246,0.12)' : '#12121E' }]}
              onPress={() => handleSelectType(mode.type)}
              activeOpacity={0.7}
            >
              <View style={styles.modeIcon}>
                <Text style={styles.modeIconText}>{mode.icon}</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={[styles.modeTitle, isSelected && { color: '#A78BFA' }]}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{isSelected ? '✅ Selected test type' : 'Tap to select this test'}</Text>
              </View>
              <MaterialCommunityIcons name={isSelected ? 'check-circle' : 'chevron-right'} size={24} color={mode.color} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.modeFilterCard}>
          <Text style={styles.modeFilterTitle}>Filter Questions</Text>
          <Text style={styles.modeFilterHint}>Use these filters to focus practice on one area.</Text>

          <Text style={styles.modeFilterLabel}>Topic</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedTopic} onValueChange={(value) => setSelectedTopic(value)} style={styles.picker}>
              <Picker.Item label="All topics" value={ALL_TOPICS_VALUE} />
              {topicOptions.map((topic) => (
                <Picker.Item key={topic} label={topic} value={topic} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.modeFilterLabel, { marginTop: 12 }]}>Subtopic</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedSubTopic} onValueChange={(value) => setSelectedSubTopic(value)} style={styles.picker}>
              <Picker.Item label="All subtopics" value={ALL_SUBTOPICS_VALUE} />
              {subTopicOptions.map((subTopic) => (
                <Picker.Item key={subTopic} label={subTopic} value={subTopic} />
              ))}
            </Picker>
          </View>

          <Text style={styles.modeFilterSummary}>
            {filteredPool.length} question{filteredPool.length === 1 ? '' : 's'} match your filters
          </Text>
        </View>

        <TouchableOpacity style={styles.modeStartButton} onPress={startPractice}>
          <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
          <Text style={styles.modeStartButtonText}>Start Practice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ModeSelectorScreen;
