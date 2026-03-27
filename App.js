import React, { useState, useEffect, createContext, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Dimensions,
  Share,
  Alert,
  Animated,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
import './node_modules/react-datepicker/dist/react-datepicker.css';

// Firebase & Monetization Imports
// Note: Initialize Firebase with your credentials in firebaseConfig.js
// import { watchAuthState, getUserProfile, saveQuizResult, loginUser } from './firebaseServices';
import { showInterstitialAd, showRewardedAd, AdScheduler, HomeBannerAd } from './adMobService';
import { 
  generateQuizQuestion, 
  getAdaptiveDifficulty, 
  calculatePerformance, 
  getVisualImage,
  getQuestionBank,
  isAnswerCorrect as checkAnswerCorrect,
} from './quizHelpers';
import { CIVICS_QUESTION_BANK } from './civicsQuestionBank';
import {
  DYNAMIC_CIVICS_DATA,
  STATE_CAPITALS,
  setDynamicFederalAnswers,
  setStateOfficeholders,
  setStateCapital,
} from './civicsDynamicData';
// import { PremiumManager, PREMIUM_TIERS, logMonetizationEvent } from './monetizationService';
// (Commented out until Firebase credentials are added - see setup instructions below)

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const PAUSED_SESSION_STORAGE_KEY = 'civics.pausedSession.v1';
const AD_RUNTIME_STORAGE_KEY = 'civics.adRuntime.v1';
const DAILY_FREE_PACK_LIMIT = 1;
const FREE_PACK_QUESTION_COUNT = 15;
const FREE_PACK_COOLDOWN_MS = 60 * 60 * 1000;

const createDefaultAdRuntime = () => ({
  dayKey: '',
  dailyCount: 0,
  resumeCount: 0,
  quizCompleteCount: 0,
  lastShownAt: 0,
  currentDayInterstitialShown: 0,
  currentDayRewardedCompleted: 0,
  freePackDayKey: '',
  freePackUnlocksToday: 0,
  freePackCooldownUntil: 0,
  history: [],
  analytics: {
    interstitialAttempts: 0,
    interstitialShown: 0,
    interstitialFailed: 0,
    interstitialSkippedCooldown: 0,
    interstitialSkippedDailyCap: 0,
    interstitialSkippedTriggerCap: 0,
    interstitialResumeShown: 0,
    interstitialQuizCompleteShown: 0,
    interstitialGenericShown: 0,
    rewardedAttempts: 0,
    rewardedCompleted: 0,
    rewardedFailedOrClosed: 0,
    rewardedSprintUnlocks: 0,
    rewardedBonusUnlocks: 0,
    rewardedFreePackAttempts: 0,
    rewardedFreePackUnlocked: 0,
    rewardedFreePackBlockedDailyLimit: 0,
    rewardedFreePackBlockedCooldown: 0,
    rewardedFreePackFailed: 0,
  },
});

// Question bank with all 3 test types
const questionBank = {
  highschool: [
    { id: 'HS1', question: 'What is the supreme law of the land?', options: ['The Constitution', 'The President', 'The Senate', 'The Bill of Rights'], answer: 'The Constitution', topic: 'Foundations', hint: 'Think about the document that defines government powers.', dynamic: false, memoryHook: 'The Constitution is the boss document for all laws.', explanation: 'The Constitution defines U.S. government structure and is above all other laws.' },
    { id: 'HS2', question: 'What is one right or freedom from the First Amendment?', options: ['Free speech', 'Vote-only for women', 'Free health care', 'No taxes'], answer: 'Free speech', topic: 'Rights', hint: 'It begins with F and is how people express opinions.', dynamic: false, memoryHook: 'First Amendment = First freedom (speech, religion, press).', explanation: 'The First Amendment protects free speech, religion, press, assembly, and petition.' },
    { id: 'HS3', question: 'What is one responsibility of a U.S. citizen?', options: ['Vote', 'Own a car', 'Become rich', 'Travel abroad'], answer: 'Vote', topic: 'Civic Duty', hint: 'You do this in elections.', dynamic: false, memoryHook: 'Voting is civic duty, not optional when adult.', explanation: 'Voting is a function of citizenship; other options are not required responsibilities.' },
  ],
  naturalization100: [
    { id: 'N100_1', question: 'What is the capital of the United States?', options: ['New York', 'Washington, D.C.', 'Los Angeles', 'Chicago'], answer: 'Washington, D.C.', topic: 'Geography', hint: 'It\'s not a state; it is a district.', dynamic: false, memoryHook: 'Washington D.C. is the capital, not a state city.', explanation: 'The capital of the United States is Washington, D.C., established by the Constitution.' },
    { id: 'N100_2', question: 'Name one branch or part of the government.', options: ['Legislative', 'Banking', 'Retail', 'Education'], answer: 'Legislative', topic: 'Structure', hint: 'It writes laws.', dynamic: false, memoryHook: 'Legislative makes laws, Executive enforces, Judicial judges.', explanation: 'The government has three branches: Legislative (Congress), Executive (President), Judicial (Supreme Court).' },
  ],
  naturalization128: [
    { id: 'N128_1', question: 'What are the two major political parties in the United States?', options: ['Democratic and Republican', 'Libertarian and Green', 'Socialist and Communist', 'Federalist and Anti-Federalist'], answer: 'Democratic and Republican', topic: 'Politics', hint: 'One is blue, one is red.', dynamic: false, memoryHook: 'Blue = Democrats, Red = Republicans.', explanation: 'The two major parties are Democratic and Republican; others are minor parties.' },
    { id: 'N128_2', question: 'What does the judicial branch do?', options: ['Reviews laws', 'Makes laws', 'Enforces laws', 'Votes for laws'], answer: 'Reviews laws', topic: 'Checks and Balances', hint: 'Judges and courts.', dynamic: true, memoryHook: 'Judicial judges the laws.', explanation: 'The judicial branch interprets and reviews laws to ensure they are constitutional.' },
  ],
};

// US States for dropdown
const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Achievements system
const achievements = [
  { id: 'first_ten', name: 'First Steps', desc: 'Answer 10 questions correctly', icon: '🎓', unlocked: false },
  { id: 'week_warrior', name: 'Week Warrior', desc: 'Practice 7 days in a row', icon: '⚡', unlocked: false },
  { id: 'perfect', name: 'Perfect Practice', desc: 'Get 10 questions correct in a row', icon: '🔥', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Answer 20 questions in under 5 minutes', icon: '🚀', unlocked: false },
  { id: 'sharing_king', name: 'Sharing King', desc: 'Invite 5 friends to practice', icon: '👑', unlocked: false },
];

export const AppDataContext = createContext({
  testDetails: null,
  setTestDetails: () => { },
  errorBank: [],
  addErrorItem: () => { },
  pausedSession: null,
  savePausedSession: () => { },
  clearPausedSession: () => { },
  maybeShowInterstitial: async () => false,
  adRuntime: createDefaultAdRuntime(),
  trackAdEvent: () => { },
  resetAdAnalytics: () => { },
  unlockDailyFreePack: async () => ({ ok: false }),
});

const weakAreaEstimator = (history) => {
  const counts = {};
  for (const record of history) {
    if (!counts[record.topic]) counts[record.topic] = { total: 0, wrong: 0 };
    counts[record.topic].total += 1;
    if (!record.correct) counts[record.topic].wrong += 1;
  }
  const weaknesses = Object.entries(counts)
    .map(([topic, { total, wrong }]) => ({ topic, wrong, total, ratio: wrong / total }))
    .sort((a, b) => b.ratio - a.ratio);
  return weaknesses.slice(0, 3);
};

const QUESTIONS_BY_TEST_TYPE = {
  highschool: 100,
  naturalization100: 100,
  naturalization128: 128,
};

function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const parts = String(value).split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts.map((p) => Number(p));
    if (month && day && year) {
      const fallback = new Date(year, month - 1, day);
      if (!Number.isNaN(fallback.getTime())) return fallback;
    }
  }

  return null;
}

function generateStudyPlan(testDetails) {
  const date = parseDateSafe(testDetails?.testDate);
  if (!date) return null;

  const now = new Date();
  const daysUntilTest = Math.max(1, Math.ceil((date - now) / (1000 * 60 * 60 * 24)));
  const totalQuestions = QUESTIONS_BY_TEST_TYPE[testDetails?.testType] || 128;
  const questionsPerDay = Math.max(5, Math.ceil(totalQuestions / daysUntilTest));
  const reviewEvery = daysUntilTest <= 14 ? 2 : 3;

  return {
    generatedAt: new Date().toISOString(),
    daysUntilTest,
    totalQuestions,
    questionsPerDay,
    reviewEvery,
    targetWeeklyQuestions: questionsPerDay * 7,
    focus: daysUntilTest <= 21 ? 'High intensity review mode' : 'Steady daily practice mode',
  };
}

function calculateEstimatedRevenue(interstitialCount, rewardedCount, interstitialEcpm, rewardedEcpm) {
  return ((interstitialCount || 0) / 1000) * interstitialEcpm + ((rewardedCount || 0) / 1000) * rewardedEcpm;
}

function buildSevenDayRevenueTrend(history, interstitialEcpm, rewardedEcpm) {
  const historyMap = new Map((history || []).map((entry) => [entry.dayKey, entry]));
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dayKey = date.toISOString().slice(0, 10);
    const entry = historyMap.get(dayKey) || {
      dayKey,
      interstitialShown: 0,
      rewardedCompleted: 0,
    };
    const revenue = calculateEstimatedRevenue(
      entry.interstitialShown,
      entry.rewardedCompleted,
      interstitialEcpm,
      rewardedEcpm
    );

    days.push({
      ...entry,
      revenue,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
    });
  }

  return days;
}

function withAutoStudyPlan(nextDetails, previousDetails = {}) {
  const merged = {
    ...previousDetails,
    ...nextDetails,
  };

  if (!merged.state && merged.location) {
    merged.state = merged.location;
  }

  if (!merged.location && merged.state) {
    merged.location = merged.state;
  }

  merged.studyPlan = generateStudyPlan(merged);
  return merged;
}

// � ONBOARDING SCREEN - COLLECT USER PREFERENCES
function OnboardingScreen({ navigation, route }) {
  const onComplete = route?.params?.onComplete;
  const [step, setStep] = useState(1); // 1=name, 2=testType, 3=state, 4=date
  const [name, setName] = useState('');
  const [testType, setTestType] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫', description: 'U.S. Civics high school curriculum' },
    { type: 'naturalization100', title: 'Naturalization (100 Questions)', icon: '🏛️', description: 'U.S. Citizenship Test - 100 questions' },
    { type: 'naturalization128', title: 'Naturalization (128 Questions)', icon: '🇺🇸', description: 'U.S. Citizenship Test - 128 questions' },
  ];

  const handleContinue = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (step === 2 && !testType) {
      Alert.alert('Error', 'Please select a test type');
      return;
    }
    if (step === 3 && !selectedState.trim()) {
      Alert.alert('Error', 'Please select your state');
      return;
    }
    if (step === 4 && !testDate) {
      Alert.alert('Error', 'Please select your test date');
      return;
    }

    if (step === 4) {
      // Complete onboarding
      onComplete({ name, testType, state: selectedState, testDate: testDate.toLocaleDateString() });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.onboardingProgress}>
          <Text style={styles.onboardingProgressText}>Step {step} of 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
        </View>

        {/* STEP 1: NAME */}
        {step === 1 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>👋</Text>
            <Text style={styles.onboardingTitle}>Welcome! What's your name?</Text>
            <Text style={styles.onboardingSubtitle}>We'll personalize your learning experience</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>
        )}

        {/* STEP 2: TEST TYPE */}
        {step === 2 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📚</Text>
            <Text style={styles.onboardingTitle}>Which test are you preparing for?</Text>
            <Text style={styles.onboardingSubtitle}>We'll customize questions based on your test</Text>

            {testOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.onboardingOption,
                  testType === option.type && styles.onboardingOptionSelected,
                ]}
                onPress={() => setTestType(option.type)}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>{option.icon}</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </View>
                {testType === option.type && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#7C3AED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3: STATE */}
        {step === 3 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📍</Text>
            <Text style={styles.onboardingTitle}>Which state will you take the test in?</Text>
            <Text style={styles.onboardingSubtitle}>We'll tailor questions to your state</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={(itemValue) => setSelectedState(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a state" value="" />
                  {usStates.map(state => <Picker.Item key={state} label={state} value={state} />)}
                </Picker>
              </View>
              <Text style={styles.inputHint}>This helps us tailor questions to your state</Text>
            </View>
          </View>
        )}

        {/* STEP 4: TEST DATE */}
        {step === 4 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📅</Text>
            <Text style={styles.onboardingTitle}>When's your test scheduled?</Text>
            <Text style={styles.onboardingSubtitle}>We'll create a personalized study plan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Expected Test Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{testDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <Text style={styles.inputHint}>Tap to select date</Text>
            </View>

            {Platform.OS === 'web' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Test Date</Text>
                    <DatePicker
                      selected={testDate}
                      onChange={(date) => {
                        setTestDate(date);
                        setShowDatePicker(false);
                      }}
                      inline
                      minDate={new Date()}
                      dateFormat="MM/dd/yyyy"
                    />
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={testDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setTestDate(selectedDate);
                  }}
                />
              )
            )}

            <View style={styles.studyPlanPreview}>
              <Text style={styles.studyPlanTitle}>📊 Your Study Plan</Text>
              {testDate && (
                <Text style={styles.studyPlanText}>
                  {`You have ~${Math.max(1, Math.floor((testDate - new Date()) / (1000 * 60 * 60 * 24)))} days to prepare`}
                </Text>
              )}
              <Text style={styles.studyPlanSmall}>We'll adjust daily goals based on available time</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.onboardingActions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            <Text style={styles.buttonText}>{step === 1 ? 'Skip' : 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {step === 4 ? 'Complete Setup' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✏️ EDIT TEST DETAILS SCREEN
function EditTestDetailsScreen({ navigation, testDetails, onSave }) {
  const [name, setName] = useState(testDetails?.name || '');
  const [testType, setTestType] = useState(testDetails?.testType || '');
  const [location, setLocation] = useState(testDetails?.location || '');
  const [testDate, setTestDate] = useState(testDetails?.testDate || '');

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫' },
    { type: 'naturalization100', title: 'Naturalization (100Q)', icon: '🏛️' },
    { type: 'naturalization128', title: 'Naturalization (128Q)', icon: '🇺🇸' },
  ];

  const handleSave = () => {
    if (!name.trim() || !testType || !location.trim() || !testDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onSave({ name, testType, location, testDate });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Edit Test Details</Text>
          <View style={styles.spacer} />
        </View>

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Test Type */}
        <Text style={styles.sectionLabel}>Test Type</Text>
        {testOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.onboardingOption,
              testType === option.type && styles.onboardingOptionSelected,
            ]}
            onPress={() => setTestType(option.type)}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
            <Text style={styles.optionTitle}>{option.title}</Text>
            {testType === option.type && (
              <MaterialCommunityIcons name="check-circle" size={20} color="#7C3AED" />
            )}
          </TouchableOpacity>
        ))}

        {/* Location */}
        <View style={[styles.inputContainer, { marginTop: 16 }]}>
          <Text style={styles.inputLabel}>Test Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Test Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Test Date</Text>
          <TextInput
            style={styles.textInput}
            value={testDate}
            onChangeText={setTestDate}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { marginTop: 20 }]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 MODERN HOME SCREEN WITH GAMIFICATION
function HomeScreen({ navigation }) {
  const { testDetails, pausedSession, clearPausedSession, maybeShowInterstitial, trackAdEvent, adRuntime, unlockDailyFreePack } = useContext(AppDataContext);
  const studyPlan = testDetails?.studyPlan;
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const freePackUnlockedToday = adRuntime.freePackDayKey === todayKey && (adRuntime.freePackUnlocksToday || 0) >= DAILY_FREE_PACK_LIMIT;
  const freePackCooldownMs = Math.max(0, (adRuntime.freePackCooldownUntil || 0) - nowTick);
  const freePackCooldownMinutes = Math.ceil(freePackCooldownMs / (60 * 1000));
  const cooldownHours = Math.floor(freePackCooldownMs / (60 * 60 * 1000));
  const cooldownRemainingMinutes = Math.ceil((freePackCooldownMs % (60 * 60 * 1000)) / (60 * 1000));
  const cooldownHHMM = `${String(cooldownHours).padStart(2, '0')}:${String(Math.max(0, Math.min(59, cooldownRemainingMinutes))).padStart(2, '0')}`;

  const handleDailyFreePackUnlock = async () => {
    const result = await unlockDailyFreePack();

    if (result.ok) {
      Alert.alert('Daily Pack Unlocked', `You unlocked ${result.questionCount} free bonus questions.`);
      clearPausedSession();
      navigation.navigate('Quiz', {
        type: testDetails?.testType || 'naturalization128',
        forceQuestionCount: result.questionCount,
      });
      return;
    }

    if (result.reason === 'daily_limit') {
      Alert.alert('Daily Limit Reached', 'You already unlocked today\'s free pack. Come back tomorrow!');
      return;
    }

    if (result.reason === 'cooldown') {
      const minutes = Math.max(1, Math.ceil(((result.cooldownUntil || 0) - Date.now()) / (60 * 1000)));
      Alert.alert('Please Wait', `Try again in about ${minutes} minute(s).`);
      return;
    }

    Alert.alert('Ad Unavailable', 'The ad was closed or unavailable. Please try again shortly.');
  };

  const handleWatchAdForSprint = async () => {
    trackAdEvent('rewarded_attempt');
    try {
      await showRewardedAd();
      trackAdEvent('rewarded_completed');
      trackAdEvent('rewarded_sprint_unlock');
      const baseCount = studyPlan?.questionsPerDay || 10;
      const sprintCount = Math.min(25, baseCount + 10);
      Alert.alert('Unlocked', `Sprint mode unlocked: ${sprintCount} questions.`);
      clearPausedSession();
      navigation.navigate('Quiz', {
        type: testDetails?.testType || 'naturalization128',
        forceQuestionCount: sprintCount,
      });
    } catch (error) {
      trackAdEvent('rewarded_failed_or_closed');
      console.log('Rewarded ad skipped or failed:', error);
    }
  };

  const [user, setUser] = useState({
    name: testDetails?.name || 'Future Citizen',
    initials: (testDetails?.name || 'FC').split(' ').map(n => n[0]).join('').toUpperCase(),
    points: 260,
    level: 3,
    streak: 5,
    avatar: '👤',
  });

  const [userStats] = useState({
    questionsAnswered: 47,
    accuracy: 78,
    timeSpent: '2h 34m',
  });

  // Calculate days until test
  const daysUntilTest = testDetails?.testDate ? Math.max(0, Math.floor((new Date(testDetails.testDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557804506-669714153f27?w=500&h=500&fit=crop' }}
        style={styles.headerBg}
        blurRadius={30}
      >
        <View style={styles.headerOverlay} />

        {/* Header with Profile */}
        <View style={styles.headerTop}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>⭐ {user.points} pts</Text>
            <Text style={styles.levelBadgeLevel}>Lv {user.level}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{user.initials[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome message */}
        <View style={styles.headerContent}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name.split(' ')[0]}</Text>
          <Text style={styles.welcomeSub}>
            {testDetails && daysUntilTest !== null && `${daysUntilTest} days until your test`}
            {!testDetails || daysUntilTest === null ? 'Let\'s start practicing!' : ' • Get studying!'}
          </Text>
        </View>
      </ImageBackground>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Test Details Card */}
        {testDetails && (
          <TouchableOpacity
            style={styles.testDetailsCard}
            onPress={() => navigation.navigate('EditTestDetails')}
          >
            <View style={styles.testDetailsContent}>
              <View>
                <Text style={styles.testDetailsLabel}>Test Type</Text>
                <Text style={styles.testDetailsValue}>
                  {testDetails.testType === 'highschool' ? '🏫 High School Civics' : testDetails.testType === 'naturalization100' ? '🏛️ Naturalization (100Q)' : '🇺🇸 Naturalization (128Q)'}
                </Text>
              </View>
              <View style={styles.testDetailsSeparator} />
              <View>
                <Text style={styles.testDetailsLabel}>Location</Text>
                <Text style={styles.testDetailsValue}>📍 {testDetails.location}</Text>
              </View>
              <View style={styles.testDetailsSeparator} />
              <View>
                <Text style={styles.testDetailsLabel}>Test Date</Text>
                <Text style={styles.testDetailsValue}>📅 {testDetails.testDate}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="pencil" size={20} color="#7C3AED" />
          </TouchableOpacity>
        )}

        {studyPlan && (
          <View style={styles.studyPlanCard}>
            <View style={styles.studyPlanHeaderRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#065F46" />
              <Text style={styles.studyPlanCardTitle}>Auto Study Plan</Text>
            </View>
            <Text style={styles.studyPlanCardLine}>Days left: {studyPlan.daysUntilTest}</Text>
            <Text style={styles.studyPlanCardLine}>Questions per day: {studyPlan.questionsPerDay}</Text>
            <Text style={styles.studyPlanCardLine}>Weekly target: {studyPlan.targetWeeklyQuestions}</Text>
            <Text style={styles.studyPlanCardHint}>Review every {studyPlan.reviewEvery} day(s). {studyPlan.focus}</Text>
          </View>
        )}

        {/* Big CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            clearPausedSession();
            navigation.navigate('Quiz', { type: testDetails?.testType || 'naturalization128' });
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="play-circle" size={32} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.ctaButtonText}>Start Practice Quiz</Text>
            <Text style={styles.ctaButtonSub}>
              {testDetails?.testType === 'highschool' ? 'High School Civics' : testDetails?.testType === 'naturalization100' ? 'Naturalization (100Q)' : 'Naturalization (128Q)'}
            </Text>
          </View>
        </TouchableOpacity>

        {pausedSession && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={async () => {
              try {
                await maybeShowInterstitial('resume');
              } catch (error) {
                console.log('Resume ad failed, continuing to quiz:', error);
              } finally {
                navigation.navigate('Quiz', { type: pausedSession.type, resumeSession: true });
              }
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="play-box-multiple-outline" size={24} color="#065F46" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.resumeButtonTitle}>Resume Paused Session</Text>
              <Text style={styles.resumeButtonSubtitle}>
                Continue from question {pausedSession.current + 1}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.rewardedHomeButton} onPress={handleWatchAdForSprint}>
          <MaterialCommunityIcons name="gift-outline" size={22} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.rewardedHomeTitle}>Watch Ad: Unlock Sprint Practice</Text>
            <Text style={styles.rewardedHomeSubtitle}>Get +10 extra questions today at no cost</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rewardedHomeButton, freePackUnlockedToday && styles.rewardedHomeButtonDisabled]}
          onPress={handleDailyFreePackUnlock}
          disabled={freePackUnlockedToday}
        >
          <MaterialCommunityIcons name="calendar-star" size={22} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.rewardedHomeTitle}>Daily Free Pack Unlock</Text>
            <Text style={styles.rewardedHomeSubtitle}>
              {freePackUnlockedToday
                ? 'Already unlocked today - back tomorrow'
                : freePackCooldownMs > 0
                  ? `Cooldown active (${freePackCooldownMinutes} min)`
                  : `Watch ad to unlock ${FREE_PACK_QUESTION_COUNT} bonus questions`}
            </Text>
            {freePackCooldownMs > 0 && !freePackUnlockedToday && (
              <View style={styles.countdownBadge}>
                <MaterialCommunityIcons name="timer-sand" size={14} color="#4C1D95" />
                <Text style={styles.countdownBadgeText}>{cooldownHHMM}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Stats Row - ADHD Friendly (Visual, Colorful) */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#FFB84D' }]}>
            <MaterialCommunityIcons name="book" size={28} color="#FFB84D" />
            <Text style={styles.statLabel}>Questions</Text>
            <Text style={styles.statValue}>{userStats.questionsAnswered}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <MaterialCommunityIcons name="target" size={28} color="#7C3AED" />
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{userStats.accuracy}%</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#EC4899' }]}>
            <MaterialCommunityIcons name="clock" size={28} color="#EC4899" />
            <Text style={styles.statLabel}>Studied</Text>
            <Text style={styles.statValue}>{userStats.timeSpent}</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <MaterialCommunityIcons name="fire" size={28} color="#10B981" />
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{user.streak} days</Text>
          </View>
        </View>

        {/* Adaptive Learning Path Card */}
        <View style={[styles.card, styles.adaptiveCard]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={24} color="#7C3AED" />
            <Text style={styles.cardTitle}>Your Adaptive Learning Path</Text>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Performance Trend</Text>
            <View style={styles.trendBadge}>
              <MaterialCommunityIcons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.trendText}>Stable</Text>
            </View>
          </View>

          <View style={[styles.progressItem, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#FFF3E0', paddingTop: 12 }]}>
            <Text style={styles.progressLabel}>Next Milestone</Text>
            <Text style={styles.milestoneText}>Complete 50 questions with 80%+ accuracy</Text>
          </View>

          <Text style={styles.confidenceText}>AI Confidence: 85% • Last updated: 1/22/2026</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'Error Bank tracking will be available after you complete a quiz!')}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.actionButtonText}>Practice Error Bank</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ModeSelector')}>
            <MaterialCommunityIcons name="target" size={20} color="#FF9800" />
            <Text style={styles.actionButtonText}>Switch Test Type</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Family')}>
            <MaterialCommunityIcons name="people" size={20} color="#9C27B0" />
            <Text style={styles.actionButtonText}>Family Challenge</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementGrid}>
            {achievements.slice(0, 3).map((ach) => (
              <TouchableOpacity key={ach.id} style={styles.achievementBadge} activeOpacity={0.7}>
                <Text style={styles.achievementEmoji}>{ach.icon}</Text>
                <Text style={styles.achievementName}>{ach.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <HomeBannerAd />
      </ScrollView>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

// 🎯 MODE SELECTOR SCREEN
function ModeSelectorScreen({ navigation }) {
  const { testDetails } = useContext(AppDataContext);
  const modes = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫', color: '#EC4899' },
    { type: 'naturalization100', title: 'Naturalization (100Q)', icon: '🏛️', color: '#3B82F6' },
    { type: 'naturalization128', title: 'Naturalization (128Q)', icon: '🇺🇸', color: '#10B981' },
  ];
  const selectedType = testDetails?.testType || 'naturalization128';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#7C3AED" />
          <Text style={{ color: '#7C3AED', fontWeight: '600', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Switch Test Type</Text>
        <Text style={styles.pageSubtitle}>Your current selection is highlighted</Text>

        {modes.map((mode) => {
          const isSelected = mode.type === selectedType;
          return (
            <TouchableOpacity
              key={mode.type}
              style={[styles.modeCard, { borderLeftColor: mode.color, borderLeftWidth: isSelected ? 6 : 3, backgroundColor: isSelected ? '#F3F0FF' : '#fff' }]}
              onPress={() => navigation.navigate('Quiz', { type: mode.type })}
              activeOpacity={0.7}
            >
              <View style={styles.modeIcon}>
                <Text style={styles.modeIconText}>{mode.icon}</Text>
              </View>
              <View style={styles.modeContent}>
                <Text style={[styles.modeTitle, isSelected && { color: '#7C3AED' }]}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{isSelected ? '✅ Your selected test' : 'Tap to start quiz'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={mode.color} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// 🎓 ADHD-FRIENDLY QUIZ SCREEN ✨
// Slow-paced, visual, with 4 answer options and clear explanations
function QuizScreen({ route, navigation }) {
  const { testDetails, pausedSession, savePausedSession, clearPausedSession, maybeShowInterstitial } = useContext(AppDataContext);
  const { type } = route.params;
  const fullPool = getQuestionBank(type); // Use official USCIS questions
  const forcedQuestionCount = Number(route?.params?.forceQuestionCount || 0);
  const sessionQuestionCount = testDetails?.studyPlan?.questionsPerDay
    ? Math.min(fullPool.length, Math.max(4, testDetails.studyPlan.questionsPerDay))
    : fullPool.length;
  const shouldResumeSession = Boolean(
    route?.params?.resumeSession &&
    pausedSession &&
    pausedSession.type === type &&
    Array.isArray(pausedSession.pool) &&
    pausedSession.pool.length > 0
  );
  const initialPool = shouldResumeSession
    ? pausedSession.pool
    : fullPool.slice(0, forcedQuestionCount > 0 ? Math.min(fullPool.length, forcedQuestionCount) : sessionQuestionCount);
  const initialCurrent = shouldResumeSession ? pausedSession.current || 0 : 0;
  const initialScore = shouldResumeSession ? pausedSession.score || 0 : 0;
  const initialHistory = shouldResumeSession ? pausedSession.history || [] : [];
  const initialDifficulty = shouldResumeSession ? pausedSession.difficulty || 'easy' : 'easy';
  const initialShowFeedback = shouldResumeSession ? Boolean(pausedSession.showFeedback) : false;
  const initialSelectedOption = shouldResumeSession ? pausedSession.selectedOption || null : null;
  const initialFeedbackMessage = shouldResumeSession ? pausedSession.feedbackMessage || '' : '';
  const initialIsAnswerCorrect = shouldResumeSession ? Boolean(pausedSession.isAnswerCorrect) : false;
  const initialShowExplanation = shouldResumeSession ? Boolean(pausedSession.showExplanation) : false;

  const [pool] = useState(() => initialPool);
  
  const [current, setCurrent] = useState(initialCurrent);
  const [score, setScore] = useState(initialScore);
  const [history, setHistory] = useState(initialHistory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback);
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption);
  const [feedbackMessage, setFeedbackMessage] = useState(initialFeedbackMessage);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(initialIsAnswerCorrect);
  const [showExplanation, setShowExplanation] = useState(initialShowExplanation);
  // Store generated question in state so options don't reshuffle on every re-render
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    shouldResumeSession && pausedSession.currentQuestion
      ? pausedSession.currentQuestion
      : pool && pool.length
        ? generateQuizQuestion(pool[initialCurrent], initialDifficulty, { userState: testDetails?.state })
        : null
  );
  const [justRestoredSession, setJustRestoredSession] = useState(shouldResumeSession);

  // Regenerate question when current index or difficulty changes
  useEffect(() => {
    if (justRestoredSession) {
      setJustRestoredSession(false);
      return;
    }

    if (pool && pool.length && pool[current]) {
      setCurrentQuestion(generateQuizQuestion(pool[current], difficulty, { userState: testDetails?.state }));
    }
  }, [current, testDetails?.state, justRestoredSession, pool, difficulty]);

  if (!pool || !pool.length || !currentQuestion) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>No questions found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const question = currentQuestion;
  const progress = ((current + 1) / pool.length) * 100;
  const acceptedAnswers = [
    question.answer,
    ...(Array.isArray(question.alternateAnswers) ? question.alternateAnswers : []),
  ].filter((item, idx, arr) => {
    const normalized = String(item || '').trim().toLowerCase();
    if (!normalized) return false;
    return arr.findIndex((entry) => String(entry || '').trim().toLowerCase() === normalized) === idx;
  });
  const isTwoAnswerQuestion = /name two|two important ideas|name 2|two ideas/i.test(question.question);

  // 📱 ADHD-FRIENDLY: Select answer with visual feedback
  const handleSelectAnswer = (selectedAnswer) => {
    if (showFeedback) return; // Prevent double-clicking

    setSelectedOption(selectedAnswer);

    // Check if answer is correct (including alternates)
    const correct = checkAnswerCorrect(selectedAnswer, question);
    setIsAnswerCorrect(correct);

    if (correct) {
      setFeedbackMessage('✅ Correct! Amazing job! 🎉');
      setScore((prev) => prev + 1);
    } else {
      setFeedbackMessage('❌ Good try! Review the correct answer below.');
    }

    // Update history
    const newHistory = [
      ...history,
      { id: question.id, topic: question.category, correct, difficulty }
    ];
    setHistory(newHistory);

    // Show feedback immediately after selection
    setShowFeedback(true);

    // Calculate performance for next question's difficulty
    const performance = calculatePerformance(newHistory);
    const nextDifficulty = getAdaptiveDifficulty(difficulty, performance);
    setDifficulty(nextDifficulty);
    // Note: next question is generated on setCurrent in handleNextQuestion
  };

  // 🎓 Show explanation after reading feedback (ADHD-friendly pacing)
  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handlePauseQuiz = () => {
    Alert.alert(
      'Pause Quiz',
      'Save your exact spot and return Home?',
      [
        { text: 'Keep Practicing', style: 'cancel' },
        {
          text: 'Save & Go Home',
          onPress: () => {
            savePausedSession({
              type,
              pool,
              current,
              score,
              history,
              difficulty,
              showFeedback,
              selectedOption,
              feedbackMessage,
              isAnswerCorrect,
              showExplanation,
              currentQuestion,
            });
            navigation.navigate('MainTabs');
          },
        },
      ]
    );
  };

  // 📍 ADHD-FRIENDLY: Slower pace - user controls next question
  const handleNextQuestion = async () => {
    if (current + 1 >= pool.length) {
      // Quiz complete
      const weak = weakAreaEstimator(history);
      clearPausedSession();
      await maybeShowInterstitial('quizComplete');
      navigation.replace('Review', {
        score,
        total: pool.length,
        weak,
        type,
      });
    } else {
      // Move to next question — generate it with the (possibly updated) difficulty
      const nextIdx = current + 1;
      const nextDiff = difficulty; // already updated above via setDifficulty
      setCurrentQuestion(generateQuizQuestion(pool[nextIdx], nextDiff, { userState: testDetails?.state }));
      setShowFeedback(false);
      setSelectedOption(null);
      setFeedbackMessage('');
      setIsAnswerCorrect(false);
      setShowExplanation(false);
      setCurrent(nextIdx);
    }
  };

  const visualImageUrl = getVisualImage(question.question, question.answer);

  return (
    <SafeAreaView style={styles.screen}>
      {/* 📊 Progress Bar */}
      <View style={styles.quizHeader}>
        <View style={styles.quizTopActions}>
          <TouchableOpacity style={styles.quizActionButton} onPress={handlePauseQuiz}>
            <MaterialCommunityIcons name="pause-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.quizActionText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quizActionButton} onPress={() => navigation.navigate('MainTabs')}>
            <MaterialCommunityIcons name="home-outline" size={20} color="#7C3AED" />
            <Text style={styles.quizActionText}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {current + 1} of {pool.length}
        </Text>
      </View>

      <ScrollView 
        style={styles.quizContent} 
        contentContainerStyle={styles.quizContainer}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {/* 🎯 Question */}
        <View style={styles.questionCard}>
          <Text style={[styles.questionText, { marginTop: 0 }]}>
            {question.question}
          </Text>
          {isTwoAnswerQuestion && (
            <Text style={styles.multiAnswerHint}>
              In this quiz, choose one valid idea. In the interview, give any two accepted ideas.
            </Text>
          )}
        </View>

        {/* 🔘 4-Answer Options (ADHD-Friendly: Large Buttons) */}
        <View style={styles.optionsContainer}>
          {question.options && question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const optionIsCorrect = option === question.answer;
            const showCorrect = showFeedback && optionIsCorrect;
            const showWrong = showFeedback && isSelected && !optionIsCorrect;

            return (
              <TouchableOpacity
                key={idx}
                disabled={showFeedback}
                onPress={() => handleSelectAnswer(option)}
                activeOpacity={0.7}
                style={[
                  styles.adhd_optionButton,
                  showFeedback && showCorrect && styles.adhd_optionCorrect,
                  showFeedback && showWrong && styles.adhd_optionWrong,
                  isSelected && !showFeedback && styles.adhd_optionSelected,
                ]}
              >
                {/* Visual Indicators */}
                <View
                  style={[
                    styles.optionDot,
                    showFeedback && showCorrect && styles.dotCorrect,
                    showFeedback && showWrong && styles.dotWrong,
                  ]}
                />

                {/* Option Text */}
                <Text
                  style={[
                    styles.adhd_optionText,
                    showFeedback && showCorrect && styles.adhd_textCorrect,
                    showFeedback && showWrong && styles.adhd_textWrong,
                  ]}
                >
                  {option}
                </Text>

                {/* Check/X Icons */}
                {showFeedback && showCorrect && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={28}
                    color="#10B981"
                    style={{ marginLeft: 8 }}
                  />
                )}
                {showFeedback && showWrong && (
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={28}
                    color="#EF4444"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 💬 Feedback Section (After answer selected) */}
        {showFeedback && (
          <Animated.View style={[styles.adhd_feedbackBox, { opacity: 1 }]}>
            {/* Emoji + Message */}
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackEmoji}>
                {isAnswerCorrect ? '🎉' : '📚'}
              </Text>
              <Text style={[styles.feedbackMessage, isAnswerCorrect ? styles.feedbackSuccess : styles.feedbackInfo]}>
                {feedbackMessage}
              </Text>
            </View>

            {/* Official Correct Answer - Always visible after answer */}
            <View style={styles.correctAnswerBox}>
              <Text style={styles.correctAnswerLabel}>
                {isTwoAnswerQuestion ? '✅ Accepted Answers:' : '✅ The Official Correct Answer:'}
              </Text>
              <Text style={styles.correctAnswerText}>{question.answer}</Text>

              {acceptedAnswers.length > 1 && (
                <View style={styles.alternateAnswersBox}>
                  <Text style={styles.alternateAnswersLabel}>
                    {isTwoAnswerQuestion ? 'Give any two of these:' : 'Also accepted:'}
                  </Text>
                  {acceptedAnswers.map((alt, idx) => (
                    <Text key={idx} style={styles.alternateAnswerItem}>• {alt}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* Visual Explanation - Reveal on demand (ADHD pacing) */}
            {!showExplanation && (
              <TouchableOpacity
                style={styles.adhd_explanationButton}
                onPress={handleShowExplanation}
              >
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#fff" />
                <Text style={styles.adhd_explanationButtonText}>
                  🖼️ Show Photo
                </Text>
              </TouchableOpacity>
            )}

            {/* Visual Image Explanation */}
            {showExplanation && (
              <View style={styles.adhd_explanationBox}>
                <Image
                  source={{ uri: visualImageUrl }}
                  style={styles.visualImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Continue Button - User controls pace */}
            <TouchableOpacity
              style={styles.adhd_continueButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.adhd_continueButtonText}>
                {current + 1 >= pool.length ? '📊 See Results' : '➡️ Next Question'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Helper text when no answer selected yet */}
        {!showFeedback && (
          <View style={styles.helperTextBox}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#6B7280" />
            <Text style={styles.helperText}>
              Take your time. There's no rush. Choose the best answer. ✨
            </Text>
          </View>
        )}
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

// 🎉 RESULTS SCREEN WITH CELEBRATION
function ReviewScreen({ route, navigation }) {
  const { trackAdEvent } = useContext(AppDataContext);
  const { score, total, type, weak } = route.params;
  const percentage = Math.round((score / total) * 100);
  const [showShare, setShowShare] = useState(false);
  const [bonusQuestionsUnlocked, setBonusQuestionsUnlocked] = useState(false);

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
    trackAdEvent('rewarded_attempt');
    try {
      await showRewardedAd();
      trackAdEvent('rewarded_completed');
      trackAdEvent('rewarded_bonus_unlock');
      setBonusQuestionsUnlocked(true);
      // Here you could navigate to a bonus quiz or unlock additional questions
      alert('Bonus questions unlocked! Keep practicing! 🎉');
    } catch (error) {
      trackAdEvent('rewarded_failed_or_closed');
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

        {!bonusQuestionsUnlocked && (
          <View style={[styles.card, styles.bonusCard]}>
            <Text style={styles.cardTitle}>🎁 Want More Practice?</Text>
            <Text style={styles.bonusText}>Watch a quick ad to unlock 5 bonus questions!</Text>
            <TouchableOpacity
              style={styles.rewardedAdButton}
              onPress={watchAdForBonusQuestions}
            >
              <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
              <Text style={styles.rewardedAdText}>Watch Ad for Bonus Questions</Text>
            </TouchableOpacity>
          </View>
        )}

        {bonusQuestionsUnlocked && (
          <View style={[styles.card, styles.bonusCard]}>
            <Text style={styles.cardTitle}>🎉 Bonus Questions Unlocked!</Text>
            <Text style={styles.bonusText}>Great job! Keep practicing to master the material.</Text>
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

// 👤 PROFILE SCREEN
function ProfileScreen({ navigation }) {
  const { testDetails } = useContext(AppDataContext);

  const [user, setUser] = useState({
    name: testDetails?.name || 'Future Citizen',
    email: 'user@example.com',
    points: 260,
    level: 3,
    avatar: '👤',
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Your Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.avatar}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{user.points}</Text>
              <Text style={styles.profileStatLabel}>Points</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{user.level}</Text>
              <Text style={styles.profileStatLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Test Details Section */}
        {testDetails && (
          <>
            <Text style={[styles.pageTitle, { marginTop: 20, fontSize: 18 }]}>Test Details</Text>
            <View style={styles.profileCard}>
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Type</Text>
                <Text style={styles.testDetailValue}>
                  {testDetails.testType === 'highschool' ? '🏫 High School Civics' : testDetails.testType === 'naturalization100' ? '🏛️ Naturalization (100Q)' : '🇺🇸 Naturalization (128Q)'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Location</Text>
                <Text style={styles.testDetailValue}>📍 {testDetails.state}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Date</Text>
                <Text style={styles.testDetailValue}>📅 {testDetails.testDate}</Text>
              </View>

              <TouchableOpacity
                style={[styles.editButton, { marginTop: 16 }]}
                onPress={() => navigation.navigate('EditTestDetails')}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit Test Details</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 👨‍👩‍👧‍👦 FAMILY DASHBOARD
function FamilyScreen({ navigation }) {
  const [family] = useState([
    { id: 1, name: 'Mom', points: 450, level: 5, initials: 'M', completed: 8 },
    { id: 2, name: 'You', points: 260, level: 3, initials: 'Y', completed: 5 },
    { id: 3, name: 'Brother', points: 320, level: 4, initials: 'B', completed: 6 },
  ]);

  const inviteFamilyMembers = async () => {
    try {
      await Share.share({
        message:
          'Join my family in Civics Coach so we can practice together and track our progress!',
      });
    } catch (error) {
      Alert.alert('Unable to Share', 'Please try again in a moment.');
    }
  };

  const sorted = [...family].sort((a, b) => b.points - a.points);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Family Dashboard</Text>
        <Text style={styles.pageSubtitle}>Compete and learn together!</Text>

        {sorted.map((member, idx) => (
          <View key={member.id} style={[styles.familyCard, idx === 0 && styles.familyCardLeader]}>
            <View style={styles.familyRank}>
              <Text style={styles.familyRankText}>#{idx + 1}</Text>
            </View>

            <View style={styles.familyAvatar}>
              <Text style={styles.familyAvatarText}>{member.initials[0]}</Text>
            </View>

            <View style={styles.familyInfo}>
              <Text style={styles.familyName}>{member.name}</Text>
              <Text style={styles.familyStats}>{member.completed} quizzes • Lv {member.level}</Text>
            </View>

            <View style={styles.familyPoints}>
              <Text style={styles.familyPointsValue}>{member.points}</Text>
              <Text style={styles.familyPointsLabel}>pts</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { marginTop: 20 }]}
          onPress={inviteFamilyMembers}
        >
          <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff', marginLeft: 8 }]}>Invite Family Members</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminScreen() {
  const { testDetails, adRuntime, resetAdAnalytics } = useContext(AppDataContext);
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

  const interstitialShown = adRuntime.analytics?.interstitialShown || 0;
  const rewardedCompleted = adRuntime.analytics?.rewardedCompleted || 0;

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

  useEffect(() => {
    const office = DYNAMIC_CIVICS_DATA.stateOfficeholders[stateName] || {};
    setGovernor(office.governor || '');
    setSenatorOne((office.senators && office.senators[0]) || '');
    setSenatorTwo((office.senators && office.senators[1]) || '');
    setCapitalValue(STATE_CAPITALS[stateName] || '');
  }, [stateName]);

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

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Admin: Update Officials</Text>
        <Text style={styles.pageSubtitle}>Last verified: {DYNAMIC_CIVICS_DATA.lastVerified}</Text>

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
          <Text style={styles.adminCardTitle}>Ad Analytics (Lightweight)</Text>
          <Text style={styles.analyticsLine}>Today key: {adRuntime.dayKey || 'N/A'}</Text>
          <Text style={styles.analyticsLine}>Interstitial attempts: {adRuntime.analytics?.interstitialAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Interstitial shown: {adRuntime.analytics?.interstitialShown || 0}</Text>
          <Text style={styles.analyticsLine}>Shown from Resume: {adRuntime.analytics?.interstitialResumeShown || 0}</Text>
          <Text style={styles.analyticsLine}>Shown from Quiz Complete: {adRuntime.analytics?.interstitialQuizCompleteShown || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (cooldown): {adRuntime.analytics?.interstitialSkippedCooldown || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (daily cap): {adRuntime.analytics?.interstitialSkippedDailyCap || 0}</Text>
          <Text style={styles.analyticsLine}>Skipped (trigger cap): {adRuntime.analytics?.interstitialSkippedTriggerCap || 0}</Text>
          <Text style={styles.analyticsLine}>Interstitial failures: {adRuntime.analytics?.interstitialFailed || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded attempts: {adRuntime.analytics?.rewardedAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded completed: {adRuntime.analytics?.rewardedCompleted || 0}</Text>
          <Text style={styles.analyticsLine}>Rewarded failed/closed: {adRuntime.analytics?.rewardedFailedOrClosed || 0}</Text>
          <Text style={styles.analyticsLine}>Sprint unlocks: {adRuntime.analytics?.rewardedSprintUnlocks || 0}</Text>
          <Text style={styles.analyticsLine}>Bonus unlocks: {adRuntime.analytics?.rewardedBonusUnlocks || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack attempts: {adRuntime.analytics?.rewardedFreePackAttempts || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack unlocked: {adRuntime.analytics?.rewardedFreePackUnlocked || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack blocked (daily): {adRuntime.analytics?.rewardedFreePackBlockedDailyLimit || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack blocked (cooldown): {adRuntime.analytics?.rewardedFreePackBlockedCooldown || 0}</Text>
          <Text style={styles.analyticsLine}>Daily free-pack ad failed: {adRuntime.analytics?.rewardedFreePackFailed || 0}</Text>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]} onPress={resetAdAnalytics}>
            <Text style={styles.buttonText}>Reset Analytics Counters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// TAB NAVIGATOR
function TabNavigator({ testDetails, onEditTestDetails }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        initialParams={{ testDetails }}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProfileScreen}
        initialParams={{ testDetails, onEditTestDetails }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FamilyTab"
        component={FamilyScreen}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="people" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AdminTab"
        component={AdminScreen}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shield-account" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 🚀 MAIN APP
export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [testDetails, setTestDetails] = useState(null);
  const [errorBank, setErrorBank] = useState([]);
  const [pausedSession, setPausedSession] = useState(null);
  const [adRuntime, setAdRuntime] = useState(createDefaultAdRuntime());

  useEffect(() => {
    let isMounted = true;

    const loadPausedSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(PAUSED_SESSION_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.pool) && parsed.currentQuestion) {
          setPausedSession(parsed);
        }
      } catch (error) {
        console.log('Failed to load paused session:', error);
      }
    };

    loadPausedSession();

    const loadAdRuntime = async () => {
      try {
        const stored = await AsyncStorage.getItem(AD_RUNTIME_STORAGE_KEY);
        if (!stored || !isMounted) return;

        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setAdRuntime((prev) => ({
            ...prev,
            ...parsed,
            history: Array.isArray(parsed.history) ? parsed.history : prev.history,
            analytics: {
              ...prev.analytics,
              ...(parsed.analytics || {}),
            },
          }));
        }
      } catch (error) {
        console.log('Failed to load ad runtime:', error);
      }
    };

    loadAdRuntime();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const persistPausedSession = async () => {
      try {
        if (pausedSession) {
          await AsyncStorage.setItem(PAUSED_SESSION_STORAGE_KEY, JSON.stringify(pausedSession));
        } else {
          await AsyncStorage.removeItem(PAUSED_SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.log('Failed to persist paused session:', error);
      }
    };

    persistPausedSession();
  }, [pausedSession]);

  useEffect(() => {
    const persistAdRuntime = async () => {
      try {
        await AsyncStorage.setItem(AD_RUNTIME_STORAGE_KEY, JSON.stringify(adRuntime));
      } catch (error) {
        console.log('Failed to persist ad runtime:', error);
      }
    };

    persistAdRuntime();
  }, [adRuntime]);

  useEffect(() => {
    const todayKey = adRuntime.dayKey || new Date().toISOString().slice(0, 10);
    const history = Array.isArray(adRuntime.history) ? adRuntime.history : [];
    const nextEntry = {
      dayKey: todayKey,
      interstitialShown: adRuntime.currentDayInterstitialShown || 0,
      rewardedCompleted: adRuntime.currentDayRewardedCompleted || 0,
    };

    const existingIndex = history.findIndex((entry) => entry.dayKey === todayKey);
    const nextHistory = [...history];

    if (existingIndex >= 0) {
      const currentEntry = nextHistory[existingIndex];
      if (
        currentEntry.interstitialShown === nextEntry.interstitialShown &&
        currentEntry.rewardedCompleted === nextEntry.rewardedCompleted
      ) {
        return;
      }
      nextHistory[existingIndex] = nextEntry;
    } else {
      nextHistory.push(nextEntry);
    }

    nextHistory.sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    const trimmedHistory = nextHistory.slice(-7);

    setAdRuntime((prev) => {
      const prevHistory = Array.isArray(prev.history) ? prev.history : [];
      if (JSON.stringify(prevHistory) === JSON.stringify(trimmedHistory)) {
        return prev;
      }
      return {
        ...prev,
        history: trimmedHistory,
      };
    });
  }, [adRuntime.dayKey, adRuntime.currentDayInterstitialShown, adRuntime.currentDayRewardedCompleted]);

  const handleOnboardingComplete = (details) => {
    setTestDetails(withAutoStudyPlan(details));
    setOnboardingComplete(true);
  };

  const handleEditTestDetails = (details) => {
    setTestDetails((prev) => withAutoStudyPlan(details, prev));
  };

  const addErrorItem = (item) => {
    setErrorBank((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) return prev;
      return [...prev, item];
    });
  };

  const savePausedSession = (sessionSnapshot) => {
    setPausedSession({
      ...sessionSnapshot,
      pausedAt: new Date().toISOString(),
    });
  };

  const clearPausedSession = () => {
    setPausedSession(null);
  };

  const trackAdEvent = (eventName) => {
    setAdRuntime((prev) => {
      const todayKey = new Date().toISOString().slice(0, 10);
      const next = prev.dayKey === todayKey
        ? {
            ...prev,
            analytics: {
              ...prev.analytics,
            },
          }
        : {
            ...prev,
            dayKey: todayKey,
            dailyCount: 0,
            resumeCount: 0,
            quizCompleteCount: 0,
            lastShownAt: 0,
            currentDayInterstitialShown: 0,
            currentDayRewardedCompleted: 0,
            analytics: {
              ...prev.analytics,
            },
          };

      switch (eventName) {
        case 'rewarded_attempt':
          next.analytics.rewardedAttempts += 1;
          break;
        case 'rewarded_completed':
          next.analytics.rewardedCompleted += 1;
          next.currentDayRewardedCompleted += 1;
          break;
        case 'rewarded_failed_or_closed':
          next.analytics.rewardedFailedOrClosed += 1;
          break;
        case 'rewarded_sprint_unlock':
          next.analytics.rewardedSprintUnlocks += 1;
          break;
        case 'rewarded_bonus_unlock':
          next.analytics.rewardedBonusUnlocks += 1;
          break;
        default:
          break;
      }

      return next;
    });
  };

  const resetAdAnalytics = () => {
    setAdRuntime((prev) => ({
      ...prev,
      analytics: createDefaultAdRuntime().analytics,
    }));
  };

  const unlockDailyFreePack = async () => {
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    const baseline = adRuntime.dayKey === todayKey
      ? { ...adRuntime }
      : {
          ...adRuntime,
          dayKey: todayKey,
          dailyCount: 0,
          resumeCount: 0,
          quizCompleteCount: 0,
          lastShownAt: 0,
          currentDayInterstitialShown: 0,
          currentDayRewardedCompleted: 0,
          freePackDayKey: todayKey,
          freePackUnlocksToday: 0,
        };

    if (baseline.freePackDayKey !== todayKey) {
      baseline.freePackDayKey = todayKey;
      baseline.freePackUnlocksToday = 0;
    }

    if (baseline.freePackUnlocksToday >= DAILY_FREE_PACK_LIMIT) {
      setAdRuntime({
        ...baseline,
        analytics: {
          ...baseline.analytics,
          rewardedFreePackBlockedDailyLimit: (baseline.analytics?.rewardedFreePackBlockedDailyLimit || 0) + 1,
        },
      });
      return { ok: false, reason: 'daily_limit' };
    }

    if (now < (baseline.freePackCooldownUntil || 0)) {
      setAdRuntime({
        ...baseline,
        analytics: {
          ...baseline.analytics,
          rewardedFreePackBlockedCooldown: (baseline.analytics?.rewardedFreePackBlockedCooldown || 0) + 1,
        },
      });
      return {
        ok: false,
        reason: 'cooldown',
        cooldownUntil: baseline.freePackCooldownUntil,
      };
    }

    const withAttempt = {
      ...baseline,
      analytics: {
        ...baseline.analytics,
        rewardedAttempts: (baseline.analytics?.rewardedAttempts || 0) + 1,
        rewardedFreePackAttempts: (baseline.analytics?.rewardedFreePackAttempts || 0) + 1,
      },
    };

    try {
      await showRewardedAd();

      const next = {
        ...withAttempt,
        freePackDayKey: todayKey,
        freePackUnlocksToday: (withAttempt.freePackUnlocksToday || 0) + 1,
        freePackCooldownUntil: now + FREE_PACK_COOLDOWN_MS,
        currentDayRewardedCompleted: (withAttempt.currentDayRewardedCompleted || 0) + 1,
        analytics: {
          ...withAttempt.analytics,
          rewardedCompleted: (withAttempt.analytics?.rewardedCompleted || 0) + 1,
          rewardedFreePackUnlocked: (withAttempt.analytics?.rewardedFreePackUnlocked || 0) + 1,
        },
      };

      setAdRuntime(next);
      return {
        ok: true,
        questionCount: FREE_PACK_QUESTION_COUNT,
        cooldownUntil: next.freePackCooldownUntil,
      };
    } catch (error) {
      setAdRuntime({
        ...withAttempt,
        freePackCooldownUntil: now + 5 * 60 * 1000,
        analytics: {
          ...withAttempt.analytics,
          rewardedFailedOrClosed: (withAttempt.analytics?.rewardedFailedOrClosed || 0) + 1,
          rewardedFreePackFailed: (withAttempt.analytics?.rewardedFreePackFailed || 0) + 1,
        },
      });
      return { ok: false, reason: 'ad_failed' };
    }
  };

  const maybeShowInterstitial = async (trigger = 'generic') => {
    const now = Date.now();
    const todayKey = new Date().toISOString().slice(0, 10);
    const baseline = adRuntime.dayKey === todayKey
      ? { ...adRuntime }
      : {
          ...adRuntime,
          dayKey: todayKey,
          dailyCount: 0,
          resumeCount: 0,
          quizCompleteCount: 0,
          lastShownAt: 0,
          currentDayInterstitialShown: 0,
          currentDayRewardedCompleted: 0,
          freePackDayKey: todayKey,
          freePackUnlocksToday: 0,
        };

    const cooldownMs = trigger === 'resume' ? 5 * 60 * 1000 : 2 * 60 * 1000;
    const maxDailyAds = 8;
    const maxResumeAds = 3;
    const maxQuizCompleteAds = 4;

    const withAttempt = {
      ...baseline,
      analytics: {
        ...baseline.analytics,
        interstitialAttempts: (baseline.analytics?.interstitialAttempts || 0) + 1,
      },
    };

    if (withAttempt.dailyCount >= maxDailyAds) {
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedDailyCap: (withAttempt.analytics?.interstitialSkippedDailyCap || 0) + 1,
        },
      });
      return false;
    }

    if (now - (withAttempt.lastShownAt || 0) < cooldownMs) {
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedCooldown: (withAttempt.analytics?.interstitialSkippedCooldown || 0) + 1,
        },
      });
      return false;
    }

    if (trigger === 'resume' && withAttempt.resumeCount >= maxResumeAds) {
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedTriggerCap: (withAttempt.analytics?.interstitialSkippedTriggerCap || 0) + 1,
        },
      });
      return false;
    }

    if (trigger === 'quizComplete' && withAttempt.quizCompleteCount >= maxQuizCompleteAds) {
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialSkippedTriggerCap: (withAttempt.analytics?.interstitialSkippedTriggerCap || 0) + 1,
        },
      });
      return false;
    }

    try {
      await showInterstitialAd();

      setAdRuntime({
        ...withAttempt,
        dailyCount: withAttempt.dailyCount + 1,
        resumeCount: trigger === 'resume' ? withAttempt.resumeCount + 1 : withAttempt.resumeCount,
        quizCompleteCount: trigger === 'quizComplete' ? withAttempt.quizCompleteCount + 1 : withAttempt.quizCompleteCount,
        lastShownAt: now,
        currentDayInterstitialShown: (withAttempt.currentDayInterstitialShown || 0) + 1,
        analytics: {
          ...withAttempt.analytics,
          interstitialShown: (withAttempt.analytics?.interstitialShown || 0) + 1,
          interstitialResumeShown: trigger === 'resume'
            ? (withAttempt.analytics?.interstitialResumeShown || 0) + 1
            : (withAttempt.analytics?.interstitialResumeShown || 0),
          interstitialQuizCompleteShown: trigger === 'quizComplete'
            ? (withAttempt.analytics?.interstitialQuizCompleteShown || 0) + 1
            : (withAttempt.analytics?.interstitialQuizCompleteShown || 0),
          interstitialGenericShown: trigger !== 'resume' && trigger !== 'quizComplete'
            ? (withAttempt.analytics?.interstitialGenericShown || 0) + 1
            : (withAttempt.analytics?.interstitialGenericShown || 0),
        },
      });
      return true;
    } catch (error) {
      setAdRuntime({
        ...withAttempt,
        analytics: {
          ...withAttempt.analytics,
          interstitialFailed: (withAttempt.analytics?.interstitialFailed || 0) + 1,
        },
      });
      console.log('Interstitial throttled flow failed:', error);
      return false;
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        testDetails,
        setTestDetails,
        errorBank,
        addErrorItem,
        pausedSession,
        savePausedSession,
        clearPausedSession,
        maybeShowInterstitial,
        adRuntime,
        trackAdEvent,
        resetAdAnalytics,
        unlockDailyFreePack,
      }}
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#f9fafb' },
          }}
        >
          {!onboardingComplete ? (
            <Stack.Screen
              name="Onboarding"
              options={{ animationEnabled: false }}
            >
              {(props) => <OnboardingScreen {...props} route={{ ...props.route, params: { onComplete: handleOnboardingComplete } }} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                options={{ animationEnabled: false }}
              >
                {(props) => <TabNavigator {...props} testDetails={testDetails} onEditTestDetails={handleEditTestDetails} />}
              </Stack.Screen>
              <Stack.Screen
                name="EditTestDetails"
                options={{ animationEnabled: true }}
              >
                {(props) => <EditTestDetailsScreen {...props} testDetails={testDetails} onSave={handleEditTestDetails} />}
              </Stack.Screen>
              <Stack.Screen name="ModeSelector" component={ModeSelectorScreen} options={{ animationEnabled: true }} />
              <Stack.Screen name="Quiz" component={QuizScreen} />
              <Stack.Screen name="Review" component={ReviewScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Family" component={FamilyScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppDataContext.Provider>
  );
}

// 🎨 STYLES - Modern, ADHD-Friendly
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    padding: 16,
    paddingBottom: 30,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Header Styles
  headerBg: {
    height: 260,
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  levelBadgeLevel: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    zIndex: 10,
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },

  // CTA Button
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaButtonSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  adaptiveCard: {
    borderWidth: 1,
    borderColor: '#EDE9FE',
    backgroundColor: '#FAFAF9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#1f2937',
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#666',
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  trendText: {
    color: '#10B981',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  milestoneText: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  confidenceText: {
    color: '#999',
    fontSize: 11,
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Quick Actions
  quickActionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },

  // Achievements
  achievementsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },

  // Quiz
  quizHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quizTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quizActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quizActionText: {
    color: '#6D28D9',
    fontWeight: '600',
    marginLeft: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'right',
  },
  quizContent: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  quizContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 28,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  hintText: {
    color: '#92400E',
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#DCFCE7',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  optionCorrectText: {
    color: '#10B981',
  },
  optionWrongText: {
    color: '#EF4444',
  },
  feedbackBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  feedbackCorrect: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
  },
  feedbackWrong: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  feedbackAnswer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 4,
  },

  // Review
  reviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  celebrationBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginVertical: 8,
  },
  scorePercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  praises: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
  },
  weakCard: {
    marginHorizontal: 0,
    marginBottom: 20,
  },
  weakItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  weakTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  weakBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  weakBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  weakPercent: {
    fontSize: 12,
    color: '#999',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#7C3AED',
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Page
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // Mode Card
  modeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIconText: {
    fontSize: 28,
  },
  modeContent: {
    flex: 1,
    marginLeft: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modeDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Profile
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 36,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Family
  familyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  familyCardLeader: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FFB84D',
  },
  familyRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB84D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyRankText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  familyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  familyStats: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  familyPoints: {
    alignItems: 'center',
  },
  familyPointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  familyPointsLabel: {
    fontSize: 10,
    color: '#999',
  },

  // Tab Bar
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  // Onboarding Styles
  onboardingProgress: {
    marginBottom: 32,
  },
  onboardingProgressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  onboardingStep: {
    alignItems: 'center',
    marginBottom: 32,
  },
  onboardingIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1f2937',
  },
  dateButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  onboardingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  onboardingOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#f3f0ff',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#999',
  },
  studyPlanPreview: {
    backgroundColor: '#f3f0ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  studyPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  studyPlanText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  studyPlanSmall: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  onboardingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  // Test Details Styles
  testDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studyPlanCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  studyPlanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studyPlanCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },
  studyPlanCardLine: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 2,
  },
  studyPlanCardHint: {
    fontSize: 12,
    color: '#047857',
    marginTop: 6,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  resumeButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  resumeButtonSubtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  rewardedHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardedHomeButtonDisabled: {
    opacity: 0.65,
  },
  rewardedHomeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  rewardedHomeSubtitle: {
    fontSize: 12,
    color: '#DDD6FE',
    marginTop: 2,
  },
  countdownBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countdownBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#4C1D95',
  },
  adminCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  analyticsLine: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  revenueSummaryBox: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  revenueLine: {
    fontSize: 13,
    color: '#1F2937',
    marginTop: 2,
  },
  trendChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  trendBarColumn: {
    flex: 1,
    alignItems: 'center',
  },
  trendValueLabel: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 4,
  },
  trendBarTrack: {
    width: 18,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 999,
  },
  trendBarLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
  },
  revenueBandLine: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    lineHeight: 18,
  },
  monthlyToggleButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F0FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  monthlyToggleText: {
    marginLeft: 4,
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '600',
  },
  revenueTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 8,
  },
  revenueHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
  testDetailsContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  testDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  testDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  spacer: {
    width: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },

  // Rewarded Ads Styles
  rewardedAdButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardedAdText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  explanationBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F3F0FF',
    borderRadius: 12,
    width: '100%',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  bonusCard: {
    marginHorizontal: 0,
    marginBottom: 20,
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#FFB84D',
    borderLeftWidth: 4,
  },
  bonusText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 20,
  },

  // ✨ ADHD-FRIENDLY QUIZ STYLES (Larger, Slower, Clearer)
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  multiAnswerHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // 🔘 ADHD-Friendly: Large 4-Answer Buttons
  adhd_optionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    minHeight: 70,
  },
  adhd_optionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  adhd_optionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  adhd_optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },

  // Option visual indicators
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    marginRight: 14,
    flexShrink: 0,
  },
  dotCorrect: {
    backgroundColor: '#10B981',
  },
  dotWrong: {
    backgroundColor: '#EF4444',
  },

  // ADHD-Friendly text
  adhd_optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 22,
  },
  adhd_textCorrect: {
    color: '#10B981',
    fontWeight: '600',
  },
  adhd_textWrong: {
    color: '#EF4444',
    fontWeight: '600',
  },

  // 💬 Feedback Box (Slow Paced - User Controls Next)
  adhd_feedbackBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: '#7C3AED',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  feedbackEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  feedbackMessage: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  feedbackSuccess: {
    color: '#10B981',
  },
  feedbackInfo: {
    color: '#6366F1',
  },

  // ✅ Official Correct Answer - Always visible
  correctAnswerBox: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    lineHeight: 22,
  },

  // 💡 Explanation Button (reveal on demand)
  adhd_explanationButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FBBF24',
  },
  adhd_explanationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },

  // 📖 Visual Explanation Content
  adhd_explanationBox: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  visualImage: {
    width: '100%',
    height: 220,
  },
  adhd_explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6D28D9',
    marginBottom: 10,
  },
  adhd_explanationText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 12,
  },

  // Alternate answers
  alternateAnswersBox: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  alternateAnswersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 8,
  },
  alternateAnswerItem: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Continue Button (User paces)
  adhd_continueButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  adhd_continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Helper text for ADHD
  helperTextBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '500',
  },
});
