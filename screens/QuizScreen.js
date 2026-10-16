import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Animated,
  AppState,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import ProgressBar from '../components/ui/ProgressBar';
import { colors, radius, spacing, typography, shadows } from '../theme';
import {
  getQuestionTopic,
  getQuestionSubTopic,
  weakAreaEstimator,
} from '../utils/helpers';
import { APP_EVENT_NAMES } from '../constants';
import {
  generateQuizQuestion,
  getAdaptiveDifficulty,
  calculatePerformance,
  getVisualImage,
  getQuestionBank,
  isAnswerCorrect as checkAnswerCorrect,
  shuffleArray,
} from '../quizHelpers';
import { ttsManager } from '../utils/ttsWrapper';
import { useHapticEngine } from '../context/HapticProvider';

function QuizScreen({ route, navigation }) {
  const {
    testDetails,
    pausedSession,
    savePausedSession,
    clearPausedSession,
    maybeShowInterstitial,
    recordMasterySession,
    trackAppEvent,
    reportFocusInteraction,
    activateFocusShieldRewarded,
    adRuntime,
  } = useContext(AppDataContext);
  const { triggerSensoryEvent, events: sensoryEvents } = useHapticEngine();
  const { type, topicFilter, subTopicFilter } = route.params;
  const requestedQuestionIds = Array.isArray(route?.params?.questionIds)
    ? route.params.questionIds.map((id) => String(id))
    : [];
  const focusModeMinimal = route?.params?.focusMode === 'minimal';
  const requestedListenMode = Boolean(route?.params?.listenMode);
  const recoveryCampaignActive = Boolean(route?.params?.recoveryCampaignActive);
  const recoveryStepNumber = Number(route?.params?.recoveryStepNumber || 0);
  const speechRates = [0.75, 1.0, 1.25];
  const fullPool = getQuestionBank(type); // Use official USCIS questions
  const activeTopicFilter = topicFilter ? String(topicFilter).trim() : null;
  const activeSubTopicFilter = subTopicFilter ? String(subTopicFilter).trim() : null;

  const explicitQueuePool = requestedQuestionIds.length
    ? requestedQuestionIds
      .map((id) => fullPool.find((question) => String(question.id) === id))
      .filter(Boolean)
    : [];

  const filteredPool = fullPool.filter((question) => {
    const questionTopic = getQuestionTopic(question);
    const questionSubTopic = getQuestionSubTopic(question);
    const topicMatch = !activeTopicFilter || questionTopic === activeTopicFilter;
    const subTopicMatch = !activeSubTopicFilter || questionSubTopic === activeSubTopicFilter;
    return topicMatch && subTopicMatch;
  });
  const effectivePool = explicitQueuePool.length
    ? explicitQueuePool
    : filteredPool.length
      ? filteredPool
      : fullPool;
  const forcedQuestionCount = Number(route?.params?.forceQuestionCount || 0);
  const sessionQuestionCount = testDetails?.studyPlan?.questionsPerDay
    ? Math.min(effectivePool.length, Math.max(4, testDetails.studyPlan.questionsPerDay))
    : effectivePool.length;
  const shouldResumeSession = Boolean(
    route?.params?.resumeSession &&
    pausedSession &&
    pausedSession.type === type &&
    Array.isArray(pausedSession.pool) &&
    pausedSession.pool.length > 0
  );
  const restoredListenMode = shouldResumeSession ? Boolean(pausedSession.listenMode) : false;
  const listenMode = requestedListenMode || restoredListenMode;
  const initialPool = shouldResumeSession
    ? pausedSession.pool
    : shuffleArray(effectivePool).slice(0, forcedQuestionCount > 0 ? Math.min(effectivePool.length, forcedQuestionCount) : sessionQuestionCount);
  const initialCurrent = shouldResumeSession ? pausedSession.current || 0 : 0;
  const initialScore = shouldResumeSession ? pausedSession.score || 0 : 0;
  const initialHistory = shouldResumeSession ? pausedSession.history || [] : [];
  const initialDifficulty = shouldResumeSession ? pausedSession.difficulty || 'easy' : 'easy';
  const initialShowFeedback = shouldResumeSession ? Boolean(pausedSession.showFeedback) : false;
  const initialSelectedOption = shouldResumeSession ? pausedSession.selectedOption || null : null;
  const initialFeedbackMessage = shouldResumeSession ? pausedSession.feedbackMessage || '' : '';
  const initialIsAnswerCorrect = shouldResumeSession ? Boolean(pausedSession.isAnswerCorrect) : false;
  const initialShowExplanation = shouldResumeSession ? Boolean(pausedSession.showExplanation) : false;
  const initialLowClutterMode = shouldResumeSession
    ? Boolean(pausedSession.lowClutterMode)
    : focusModeMinimal;
  const initialSpeechRateIndex = shouldResumeSession && Number.isInteger(pausedSession.speechRateIndex)
    ? Math.max(0, Math.min(speechRates.length - 1, pausedSession.speechRateIndex))
    : 1;

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lowClutterMode, setLowClutterMode] = useState(initialLowClutterMode);
  const [speechRateIndex, setSpeechRateIndex] = useState(initialSpeechRateIndex);
  // Store generated question in state so options don't reshuffle on every re-render.
  // On resume, regenerate with current logic (saved questions may have stale distractors).
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    pool && pool.length
      ? generateQuizQuestion(pool[initialCurrent], initialDifficulty, { userState: testDetails?.state })
      : null
  );
  const [justRestoredSession, setJustRestoredSession] = useState(shouldResumeSession);
  const lastStepGoalTrackedCountRef = useRef(0);
  const lastBreakNudgeTrackedCountRef = useRef(0);
  // Screen-off-friendly queue: auto-advance for hands-free listen mode
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
  const [autoAdvancePhase, setAutoAdvancePhase] = useState(null); // 'reveal' | 'next' | null
  const autoAdvanceTimerRef = useRef(null);
  const autoAdvanceCounterRef = useRef(null);
  const questionShownAtRef = useRef(Date.now());
  const sessionStartedAtRef = useRef(Date.now());
  const recentCorrectAnswerTsRef = useRef([]);
  const recentAllAnswerTsRef = useRef([]);
  const consecutiveCorrectRef = useRef(0);
  const consecutiveIncorrectRef = useRef(0);
  const skipActionsRef = useRef(0);
  const [focusActionBusy, setFocusActionBusy] = useState(false);
  const stepGoalPulse = useRef(new Animated.Value(0)).current;
  const meshBreathingPulse = useRef(new Animated.Value(0.22)).current;
  const showFeedbackRef = useRef(showFeedback);
  const latestSnapshotRef = useRef({
    current,
    score,
    history,
    difficulty,
    showFeedback,
    selectedOption,
    feedbackMessage,
    isAnswerCorrect,
    showExplanation,
    lowClutterMode,
    currentQuestion,
    speechRateIndex,
  });

  useEffect(() => {
    latestSnapshotRef.current = {
      current,
      score,
      history,
      difficulty,
      showFeedback,
      selectedOption,
      feedbackMessage,
      isAnswerCorrect,
      showExplanation,
      lowClutterMode,
      currentQuestion,
      speechRateIndex,
    };
  }, [
    current,
    score,
    history,
    difficulty,
    showFeedback,
    selectedOption,
    feedbackMessage,
    isAnswerCorrect,
    showExplanation,
    lowClutterMode,
    currentQuestion,
    speechRateIndex,
  ]);

  const buildSessionSnapshot = (reason = 'manual') => {
    const snap = latestSnapshotRef.current;
    const questionId = snap.currentQuestion?.id ? String(snap.currentQuestion.id) : null;
    const progressPercent = pool.length ? Math.round(((snap.current + 1) / pool.length) * 100) : 0;

    return {
      type,
      pool,
      current: snap.current,
      score: snap.score,
      history: snap.history,
      difficulty: snap.difficulty,
      showFeedback: snap.showFeedback,
      selectedOption: snap.selectedOption,
      feedbackMessage: snap.feedbackMessage,
      isAnswerCorrect: snap.isAnswerCorrect,
      showExplanation: snap.showExplanation,
      currentQuestion: snap.currentQuestion,
      lowClutterMode: snap.lowClutterMode,
      listenMode,
      speechRateIndex: snap.speechRateIndex,
      resumeContext: {
        questionId,
        progressPercent,
        queueLength: pool.length,
        savedReason: reason,
        savedAt: new Date().toISOString(),
      },
    };
  };

  useEffect(() => {
    trackAppEvent(APP_EVENT_NAMES.QUIZ_STARTED, {
      quiz_type: type,
      question_count: initialPool.length,
      resumed: shouldResumeSession,
      topic_filter: activeTopicFilter || 'none',
      subtopic_filter: activeSubTopicFilter || 'none',
      listen_mode: listenMode,
      recovery_campaign_active: recoveryCampaignActive,
      recovery_step: recoveryStepNumber || 0,
    });
  }, []);

  // Keep showFeedbackRef in sync so AppState handler can read it without stale closure
  useEffect(() => { showFeedbackRef.current = showFeedback; }, [showFeedback]);

  // ── Screen-off-friendly queue: auto-advance delay constants ──────────────
  const LISTEN_AUTO_REVEAL_DELAY_MS = 2500; // after question TTS → auto-reveal correct answer
  const LISTEN_AUTO_NEXT_DELAY_MS = 3000;   // after answer TTS → auto-advance to next question

  const clearAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (autoAdvanceCounterRef.current) {
      clearInterval(autoAdvanceCounterRef.current);
      autoAdvanceCounterRef.current = null;
    }
    setAutoAdvanceCountdown(0);
    setAutoAdvancePhase(null);
  };

  const startAutoAdvance = (delayMs, phase, callback) => {
    clearAutoAdvance();
    setAutoAdvancePhase(phase);
    const totalSeconds = Math.ceil(delayMs / 1000);
    setAutoAdvanceCountdown(totalSeconds);
    autoAdvanceCounterRef.current = setInterval(() => {
      setAutoAdvanceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(autoAdvanceCounterRef.current);
          autoAdvanceCounterRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    autoAdvanceTimerRef.current = setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      setAutoAdvancePhase(null);
      callback();
    }, delayMs);
  };

  const speakCurrentQuestion = async ({ repeated = false } = {}) => {
    if (!listenMode || !currentQuestion?.question) return;

    const rate = speechRates[speechRateIndex];
    const eventName = repeated
      ? APP_EVENT_NAMES.QUIZ_TTS_REPEATED
      : APP_EVENT_NAMES.QUIZ_TTS_PLAYED;

    const success = await ttsManager.speak(currentQuestion.question, {
      rate,
      pitch: 1.0,
      language: 'en-US',
      onStart: () => setIsSpeaking(true),
      onDone: () => {
        setIsSpeaking(false);
        // Screen-off-friendly: after question plays (not a repeat), schedule auto-reveal
        if (!repeated && !showFeedbackRef.current) {
          startAutoAdvance(LISTEN_AUTO_REVEAL_DELAY_MS, 'reveal', handleAutoRevealAnswer);
        }
      },
      onError: () => setIsSpeaking(false),
    });

    if (success) {
      trackAppEvent(eventName, {
        quiz_type: type,
        question_id: String(currentQuestion.id),
        question_index: current,
        total_questions: pool.length,
        rate,
      });
    }
  };

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

  useEffect(() => {
    if (!listenMode || !currentQuestion || showFeedback) return;
    speakCurrentQuestion();
  }, [listenMode, current, currentQuestion?.id, showFeedback, speechRateIndex]);

  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, [currentQuestion?.id]);

  useEffect(() => {
    const focusTelemetry = adRuntime?.focusTelemetry || {};
    if (!focusTelemetry.adSuppressionActive) {
      meshBreathingPulse.stopAnimation();
      meshBreathingPulse.setValue(0.22);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(meshBreathingPulse, {
          toValue: 0.34,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(meshBreathingPulse, {
          toValue: 0.18,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      meshBreathingPulse.stopAnimation();
    };
  }, [adRuntime?.focusTelemetry?.adSuppressionActive, meshBreathingPulse]);

  useEffect(() => () => {
    ttsManager.stop();
    clearAutoAdvance();
  }, []);

  useEffect(() => {
    const onAppStateChange = (nextState) => {
      if (nextState !== 'active') {
        // Going to background/inactive: always save session
        if (current + 1 < pool.length) {
          savePausedSession(buildSessionSnapshot('background'));
        }
        // Only stop TTS if NOT in listen mode — screen-off listening should continue
        if (!listenMode && ttsManager.isSpeakingNow()) {
          ttsManager.stop();
          setIsSpeaking(false);
        }
      } else if (listenMode && !showFeedbackRef.current) {
        // Returning to foreground mid-question in listen mode: re-speak current question
        clearAutoAdvance();
        speakCurrentQuestion();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [current, pool.length, savePausedSession, listenMode]);

  useEffect(() => {
    const answeredCount = history.length;
    if (answeredCount > 0 && answeredCount % 3 === 0 && lastStepGoalTrackedCountRef.current !== answeredCount) {
      lastStepGoalTrackedCountRef.current = answeredCount;
      triggerSensoryEvent(sensoryEvents.QUIZ_PROGRESS_WAVE);
      stepGoalPulse.setValue(1);
      Animated.spring(stepGoalPulse, {
        toValue: 0,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
      trackAppEvent(APP_EVENT_NAMES.QUIZ_STEP_GOAL_REACHED, {
        quiz_type: type,
        answered_count: answeredCount,
        total_questions: pool.length,
        step_size: 3,
      });
    }
  }, [history.length, pool.length, sensoryEvents.QUIZ_PROGRESS_WAVE, stepGoalPulse, trackAppEvent, triggerSensoryEvent, type]);

  useEffect(() => {
    const answeredCount = history.length;
    if (!showFeedback || answeredCount === 0 || answeredCount % 6 !== 0) return;
    if (lastBreakNudgeTrackedCountRef.current === answeredCount) return;

    lastBreakNudgeTrackedCountRef.current = answeredCount;
    trackAppEvent(APP_EVENT_NAMES.QUIZ_BREAK_NUDGE_SHOWN, {
      quiz_type: type,
      answered_count: answeredCount,
      total_questions: pool.length,
      break_step: 6,
    });
  }, [showFeedback, history.length, pool.length, trackAppEvent, type]);

  useEffect(() => {
    if (current + 1 >= pool.length) return;

    // Keep a near-real-time checkpoint so resume is exact even after abrupt exits.
    const checkpointTimer = setTimeout(() => {
      savePausedSession(buildSessionSnapshot('checkpoint'));
    }, 500);

    return () => clearTimeout(checkpointTimer);
  }, [
    current,
    score,
    history,
    difficulty,
    showFeedback,
    selectedOption,
    feedbackMessage,
    isAnswerCorrect,
    showExplanation,
    lowClutterMode,
    currentQuestion,
    speechRateIndex,
    pool.length,
    savePausedSession,
  ]);

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
  const answeredCount = history.length;
  const pacingStep = 3;
  const breakStep = 6;
  const currentGoalStart = Math.floor(answeredCount / pacingStep) * pacingStep;
  const currentGoalTarget = Math.min(pool.length, currentGoalStart + pacingStep);
  const currentGoalProgress = Math.min(pacingStep, answeredCount - currentGoalStart);
  const shouldShowBreakNudge = showFeedback && answeredCount > 0 && answeredCount % breakStep === 0;
  const acceptedAnswers = [
    question.answer,
    ...(Array.isArray(question.alternateAnswers) ? question.alternateAnswers : []),
  ].filter((item, idx, arr) => {
    const normalized = String(item || '').trim().toLowerCase();
    if (!normalized) return false;
    return arr.findIndex((entry) => String(entry || '').trim().toLowerCase() === normalized) === idx;
  });
  const isTwoAnswerQuestion = /name two|two important ideas|name 2|two ideas/i.test(question.question);
  const stepGoalScale = stepGoalPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  // Speak the official answer aloud in listen mode, then schedule auto-next
  const speakAnswer = async () => {
    const answerText = latestSnapshotRef.current.currentQuestion?.answer;
    if (!listenMode || !answerText) {
      startAutoAdvance(LISTEN_AUTO_NEXT_DELAY_MS, 'next', handleNextQuestion);
      return;
    }
    const rate = speechRates[latestSnapshotRef.current.speechRateIndex ?? speechRateIndex];
    await ttsManager.speak(`The answer is: ${answerText}`, {
      rate,
      pitch: 1.0,
      language: 'en-US',
      onStart: () => setIsSpeaking(true),
      onDone: () => {
        setIsSpeaking(false);
        startAutoAdvance(LISTEN_AUTO_NEXT_DELAY_MS, 'next', handleNextQuestion);
      },
      onError: () => {
        setIsSpeaking(false);
        startAutoAdvance(LISTEN_AUTO_NEXT_DELAY_MS, 'next', handleNextQuestion);
      },
    });
  };

  // Called automatically after question TTS ends (hands-free queue)
  const handleAutoRevealAnswer = () => {
    if (showFeedbackRef.current) return; // user already answered
    const correctAnswer = latestSnapshotRef.current.currentQuestion?.answer;
    if (!correctAnswer) return;
    trackAppEvent(APP_EVENT_NAMES.QUIZ_LISTEN_AUTO_ADVANCED, {
      quiz_type: type,
      question_id: String(latestSnapshotRef.current.currentQuestion?.id || ''),
      question_index: latestSnapshotRef.current.current,
      total_questions: pool.length,
    });
    handleSelectAnswer(correctAnswer, { auto: true });
  };

  // Select answer with visual feedback
  const handleSelectAnswer = (selectedAnswer, opts = {}) => {
    if (showFeedback) return; // Prevent double-clicking

    // Cancel any pending auto-advance when user (or auto) selects an answer
    clearAutoAdvance();

    if (listenMode && ttsManager.isSpeakingNow()) {
      ttsManager.stop();
      setIsSpeaking(false);
    }

    setSelectedOption(selectedAnswer);

    // Check if answer is correct (including alternates)
    const correct = checkAnswerCorrect(selectedAnswer, question);
    const now = Date.now();
    const interactionLatencyMs = Math.max(0, now - questionShownAtRef.current);
    setIsAnswerCorrect(correct);

    if (correct) {
      triggerSensoryEvent(sensoryEvents.QUIZ_ANSWER_CORRECT);
      setFeedbackMessage('✅ Correct! Amazing job! 🎉');
      setScore((prev) => prev + 1);
    } else {
      triggerSensoryEvent(sensoryEvents.QUIZ_ANSWER_INCORRECT);
      setFeedbackMessage('❌ Good try! Review the correct answer below.');
    }

    trackAppEvent(APP_EVENT_NAMES.QUESTION_ANSWERED, {
      quiz_type: type,
      question_id: String(question.id),
      correct,
      difficulty,
      question_index: current,
      total_questions: pool.length,
    });

    // Update history
    const newHistory = [
      ...history,
      {
        id: question.id,
        topic: question.topic || question.category || 'General',
        subTopic: question.subTopic || 'General',
        correct,
        difficulty,
        answeredAt: new Date().toISOString(),
      }
    ];
    setHistory(newHistory);

    if (correct) {
      consecutiveCorrectRef.current += 1;
      consecutiveIncorrectRef.current = 0;
      recentCorrectAnswerTsRef.current = [...recentCorrectAnswerTsRef.current, now].slice(-5);
    } else {
      consecutiveIncorrectRef.current += 1;
      consecutiveCorrectRef.current = 0;
    }

    recentAllAnswerTsRef.current = [...recentAllAnswerTsRef.current, now]
      .filter((timestamp) => now - timestamp <= 60 * 1000);
    const focusVelocity = Math.round(recentAllAnswerTsRef.current.length * 10) / 10;
    const firstRecentCorrectTs = recentCorrectAnswerTsRef.current[0] || 0;
    const focusWindowQualified = recentCorrectAnswerTsRef.current.length >= 5
      && (now - firstRecentCorrectTs) <= 45 * 1000
      && skipActionsRef.current === 0;
    const adsViewedInSession = Number(adRuntime?.currentDayInterstitialShown || 0) + Number(adRuntime?.currentDayRewardedCompleted || 0);
    const elapsedSessionMinutes = Math.max(0, (now - sessionStartedAtRef.current) / (60 * 1000));
    const sessionFatigueScore = Number((elapsedSessionMinutes + (adsViewedInSession * 1.2)).toFixed(2));

    reportFocusInteraction({
      focusVelocity,
      accuracyStreak: consecutiveCorrectRef.current,
      interactionLatencyMs,
      sessionFatigueScore,
      skipActionsInWindow: skipActionsRef.current,
      focusWindowQualified,
      consecutiveIncorrect: consecutiveIncorrectRef.current,
    });

    // Show feedback immediately after selection
    setShowFeedback(true);

    // Calculate performance for next question's difficulty
    const performance = calculatePerformance(newHistory);
    const nextDifficulty = getAdaptiveDifficulty(difficulty, performance);
    setDifficulty(nextDifficulty);
    // Note: next question is generated on setCurrent in handleNextQuestion

    // Screen-off-friendly: in listen mode, speak the answer then schedule auto-next
    if (listenMode) {
      speakAnswer();
    }

    questionShownAtRef.current = now;
  };

  const handleFocusRewardedAction = async () => {
    if (focusActionBusy) return;
    setFocusActionBusy(true);
    try {
      const result = await activateFocusShieldRewarded();
      if (!result?.ok) {
        Alert.alert('Ad skipped', 'Rewarded video was not completed. Focus shield was not activated.');
      }
    } finally {
      setFocusActionBusy(false);
    }
  };

  // Show explanation after reading feedback
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
            savePausedSession(buildSessionSnapshot('pause_button'));
            navigation.navigate('MainTabs');
          },
        },
      ]
    );
  };

  // Slower pace - user controls next question
  const handleNextQuestion = async () => {
    clearAutoAdvance(); // Cancel any pending auto-advance
    if (listenMode && ttsManager.isSpeakingNow()) {
      await ttsManager.stop();
      setIsSpeaking(false);
    }

    if (current + 1 >= pool.length) {
      // Quiz complete
      const weak = weakAreaEstimator(history);
      recordMasterySession(history, type);
      clearPausedSession();
      await maybeShowInterstitial({
        trigger: 'quizComplete',
        sessionQuestionCount: pool.length,
        score,
      });
      navigation.replace('Review', {
        score,
        total: pool.length,
        weak,
        type,
        recoveryCampaignCompleted: recoveryCampaignActive,
        recoveryStepNumber: recoveryCampaignActive ? recoveryStepNumber : 0,
        recoveryTopic: activeTopicFilter || null,
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

  const visualImageUrl = question.imageUrl || getVisualImage(question.question, question.answer);

  return (
    <SafeAreaView style={quizStyles.screen}>
      {/* Clean header: actions + progress */}
      <View style={quizStyles.header}>
        <View style={quizStyles.headerActions}>
          <TouchableOpacity style={quizStyles.headerBtn} onPress={handlePauseQuiz}>
            <MaterialCommunityIcons name="pause" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {!focusModeMinimal && (
            <TouchableOpacity
              style={quizStyles.headerBtn}
              onPress={() => {
                if (current + 1 < pool.length) {
                  savePausedSession(buildSessionSnapshot('home_button'));
                }
                navigation.navigate('MainTabs');
              }}
            >
              <MaterialCommunityIcons name="home-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <View style={quizStyles.headerSpacer} />
          <Text style={quizStyles.counter}>
            {current + 1} / {pool.length}
          </Text>
        </View>
        <ProgressBar progress={(current + 1) / pool.length} height={8} />
        {listenMode && (
          <View style={quizStyles.listenRow}>
            <TouchableOpacity
              style={quizStyles.listenBtn}
              onPress={() => { clearAutoAdvance(); speakCurrentQuestion({ repeated: true }); }}
              disabled={isSpeaking}
            >
              <MaterialCommunityIcons name={isSpeaking ? 'volume-high' : 'play'} size={18} color={colors.primary} />
              <Text style={quizStyles.listenText}>{isSpeaking ? 'Playing' : 'Listen'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={quizStyles.listenBtn}
              onPress={() => {
                const nextIndex = (speechRateIndex + 1) % speechRates.length;
                setSpeechRateIndex(nextIndex);
              }}
            >
              <MaterialCommunityIcons name="speedometer" size={18} color={colors.primary} />
              <Text style={quizStyles.listenText}>{speechRates[speechRateIndex]}x</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={quizStyles.content}
        contentContainerStyle={quizStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Question card - image hidden until after answering to avoid spoiling */}
        <View style={quizStyles.questionCard}>
          <Text style={quizStyles.questionText}>
            {question.question}
          </Text>
          {isTwoAnswerQuestion && (
            <Text style={quizStyles.multiHint}>
              Choose one valid idea. In the interview, give any two accepted ideas.
            </Text>
          )}
        </View>

        {/* Options */}
        <View style={quizStyles.options}>
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
                  quizStyles.option,
                  isSelected && !showFeedback && quizStyles.optionSelected,
                  showCorrect && quizStyles.optionCorrect,
                  showWrong && quizStyles.optionWrong,
                ]}
              >
                <Text
                  style={[
                    quizStyles.optionText,
                    (showCorrect || showWrong) && quizStyles.optionTextFeedback,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && (
                  <MaterialCommunityIcons name="check-circle" size={26} color={colors.success} />
                )}
                {showWrong && (
                  <MaterialCommunityIcons name="close-circle" size={26} color={colors.danger} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {showFeedback && (
          <View style={[
            quizStyles.feedback,
            isAnswerCorrect ? quizStyles.feedbackGood : quizStyles.feedbackBad,
          ]}>
            <View style={quizStyles.feedbackHeader}>
              <Text style={quizStyles.feedbackEmoji}>
                {isAnswerCorrect ? '🎉' : '📚'}
              </Text>
              <Text style={quizStyles.feedbackMessage}>
                {isAnswerCorrect ? 'Correct! Amazing job!' : 'Good try! Here is the correct answer:'}
              </Text>
            </View>

            <View style={quizStyles.answerBox}>
              <Text style={quizStyles.answerLabel}>
                {isTwoAnswerQuestion ? 'Accepted answers:' : 'Correct answer:'}
              </Text>
              <Text style={quizStyles.answerText}>{question.answer}</Text>
              {acceptedAnswers.length > 1 && (
                <View style={quizStyles.alternates}>
                  {acceptedAnswers.filter(a => a !== question.answer).map((alt, idx) => (
                    <Text key={idx} style={quizStyles.alternateItem}>- {alt}</Text>
                  ))}
                </View>
              )}
            </View>

            {question.whyThisAnswer && (
              <>
                {!showExplanation ? (
                  <TouchableOpacity
                    style={quizStyles.whyBtn}
                    onPress={handleShowExplanation}
                  >
                    <MaterialCommunityIcons name="lightbulb-on" size={18} color={colors.primary} />
                    <Text style={quizStyles.whyBtnText}>Why this answer?</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={quizStyles.whyBox}>
                    <Text style={quizStyles.whyText}>{question.whyThisAnswer}</Text>
                  </View>
                )}
              </>
            )}

            {question.mnemonic && (
              <View style={quizStyles.mnemonicBox}>
                <View style={quizStyles.mnemonicHeader}>
                  <MaterialCommunityIcons name="brain" size={18} color={colors.accent} />
                  <Text style={quizStyles.mnemonicLabel}>Memory hook</Text>
                </View>
                <Text style={quizStyles.mnemonicText}>{question.mnemonic}</Text>
              </View>
            )}

            {!lowClutterMode && visualImageUrl ? (
              <Image
                source={{ uri: visualImageUrl }}
                style={quizStyles.feedbackImage}
                resizeMode="contain"
              />
            ) : null}

            <TouchableOpacity
              style={quizStyles.nextBtn}
              onPress={handleNextQuestion}
            >
              <Text style={quizStyles.nextBtnText}>
                {listenMode && autoAdvancePhase === 'next' && autoAdvanceCountdown > 0
                  ? `Next in ${autoAdvanceCountdown}s (tap to skip)`
                  : current + 1 >= pool.length ? 'See Results' : 'Next Question'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {!showFeedback && !lowClutterMode && (
          <Text style={quizStyles.helperText}>
            Take your time. Choose the best answer.
          </Text>
        )}
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const quizStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  headerBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm, ...shadows.card,
  },
  headerSpacer: { flex: 1 },
  counter: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.textSecondary },
  listenRow: { flexDirection: 'row', marginTop: spacing.sm },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingVertical: 8, paddingHorizontal: 14, marginRight: spacing.sm,
  },
  listenText: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.primary, marginLeft: 6 },

  content: { flex: 1 },
  container: { padding: spacing.md, paddingBottom: spacing.xl },

  questionCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight, ...shadows.card,
  },
  questionImage: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: '#f1f5f9' },
  feedbackImage: { width: '100%', height: 180, borderRadius: radius.md, marginTop: spacing.md, marginBottom: spacing.md, backgroundColor: '#f1f5f9' },
  questionText: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, lineHeight: 26 },
  multiHint: { fontSize: typography.caption, color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' },

  options: { marginBottom: spacing.md },
  option: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: colors.borderLight, ...shadows.card,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.successLight },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  optionText: { flex: 1, fontSize: typography.body, color: colors.text, fontWeight: typography.medium },
  optionTextFeedback: { fontWeight: typography.semibold },

  feedback: {
    borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  feedbackGood: { backgroundColor: colors.successLight, borderColor: colors.success },
  feedbackBad: { backgroundColor: colors.infoLight, borderColor: colors.info },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  feedbackEmoji: { fontSize: 28, marginRight: spacing.sm },
  feedbackMessage: { flex: 1, fontSize: typography.body, fontWeight: typography.bold, color: colors.text },

  answerBox: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
  },
  answerLabel: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.textSecondary, marginBottom: 4 },
  answerText: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text },
  alternates: { marginTop: spacing.sm },
  alternateItem: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },

  whyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.primary,
  },
  whyBtnText: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.primary, marginLeft: 6 },
  whyBox: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  whyText: { fontSize: typography.caption, color: colors.text, lineHeight: 20 },

  mnemonicBox: {
    backgroundColor: colors.xpLight, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    borderLeftWidth: 3, borderLeftColor: colors.accent,
  },
  mnemonicHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  mnemonicLabel: { fontSize: typography.small, fontWeight: typography.bold, color: colors.accent, marginLeft: 6, textTransform: 'uppercase' },
  mnemonicText: { fontSize: typography.caption, color: colors.text, lineHeight: 20, fontStyle: 'italic' },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: typography.body, fontWeight: typography.bold, color: '#fff', marginRight: 6 },

  helperText: { textAlign: 'center', fontSize: typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
});

export default QuizScreen;
