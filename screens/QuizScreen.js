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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
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
    : effectivePool.slice(0, forcedQuestionCount > 0 ? Math.min(effectivePool.length, forcedQuestionCount) : sessionQuestionCount);
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
  // Store generated question in state so options don't reshuffle on every re-render
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    shouldResumeSession && pausedSession.currentQuestion
      ? pausedSession.currentQuestion
      : pool && pool.length
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
    <SafeAreaView style={styles.screen}>
      <Animated.View pointerEvents="none" style={[styles.focusMeshBreathingLayer, { opacity: meshBreathingPulse }]} />
      {/* 📊 Progress Bar */}
      <View style={styles.quizHeader}>
        <View style={styles.quizTopActions}>
          <TouchableOpacity style={styles.quizActionButton} onPress={handlePauseQuiz}>
            <MaterialCommunityIcons name="pause-circle-outline" size={20} color="#A78BFA" />
            <Text style={styles.quizActionText}>Pause</Text>
          </TouchableOpacity>
          {!focusModeMinimal && (
            <TouchableOpacity
              style={styles.quizActionButton}
              onPress={() => {
                if (current + 1 < pool.length) {
                  savePausedSession(buildSessionSnapshot('home_button'));
                }
                navigation.navigate('MainTabs');
              }}
            >
              <MaterialCommunityIcons name="home-outline" size={20} color="#A78BFA" />
              <Text style={styles.quizActionText}>Home</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.quizActionButton}
            onPress={() => {
              const nextLowClutterMode = !lowClutterMode;
              setLowClutterMode(nextLowClutterMode);
              trackAppEvent(APP_EVENT_NAMES.QUIZ_FOCUS_MODE_TOGGLED, {
                quiz_type: type,
                low_clutter_mode: nextLowClutterMode,
                question_index: current,
                total_questions: pool.length,
              });
            }}
          >
            <MaterialCommunityIcons name={lowClutterMode ? 'view-agenda-outline' : 'target-variant'} size={20} color="#A78BFA" />
            <Text style={styles.quizActionText}>{lowClutterMode ? 'Classic' : 'Focus'}</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.focusModeBadge, { transform: [{ scale: stepGoalScale }] }]}>
          <MaterialCommunityIcons name="progress-check" size={14} color="#6EE7B7" />
          <Text style={styles.focusModeBadgeText}>
            Step Goal: {Math.max(0, currentGoalProgress)}/{Math.max(1, Math.min(pacingStep, currentGoalTarget - currentGoalStart))} (to Q{currentGoalTarget})
          </Text>
        </Animated.View>
        {listenMode && (
          <>
            <View style={styles.listenControlsRow}>
              <TouchableOpacity
                style={styles.listenControlButton}
                onPress={() => { clearAutoAdvance(); speakCurrentQuestion({ repeated: true }); }}
                disabled={isSpeaking}
              >
                <MaterialCommunityIcons name={isSpeaking ? 'volume-high' : 'play-circle-outline'} size={18} color="#2DD4BF" />
                <Text style={styles.listenControlText}>{isSpeaking ? 'Playing' : 'Play / Repeat'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.listenControlButton}
                onPress={() => {
                  const nextIndex = (speechRateIndex + 1) % speechRates.length;
                  setSpeechRateIndex(nextIndex);
                  trackAppEvent(APP_EVENT_NAMES.QUIZ_TTS_SPEED_CHANGED, {
                    quiz_type: type,
                    question_id: String(question.id),
                    question_index: current,
                    total_questions: pool.length,
                    from_rate: speechRates[speechRateIndex],
                    to_rate: speechRates[nextIndex],
                  });
                }}
              >
                <MaterialCommunityIcons name="speedometer" size={18} color="#67E8F9" />
                <Text style={styles.listenControlText}>Speed {speechRates[speechRateIndex]}x</Text>
              </TouchableOpacity>
            </View>

            {autoAdvancePhase != null && autoAdvanceCountdown > 0 && (
              <View style={styles.listenAutoAdvanceBar}>
                <MaterialCommunityIcons name="timer-outline" size={14} color="#A78BFA" />
                <Text style={styles.listenAutoAdvanceText}>
                  {autoAdvancePhase === 'reveal' ? 'Auto-answering' : 'Next question'} in {autoAdvanceCountdown}s
                </Text>
                <TouchableOpacity onPress={clearAutoAdvance} style={styles.listenAutoAdvanceCancelBtn}>
                  <Text style={styles.listenAutoAdvanceCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {current + 1} of {pool.length}
        </Text>
        {explicitQueuePool.length > 0 && (
          <View style={styles.smartQueueBadge}>
            <MaterialCommunityIcons name="brain" size={14} color="#67E8F9" />
            <Text style={styles.smartQueueBadgeText}>Smart Queue: mixed weak + due topics</Text>
          </View>
        )}
        {focusModeMinimal && (
          <View style={styles.focusModeBadge}>
            <MaterialCommunityIcons name="target-variant" size={14} color="#6EE7B7" />
            <Text style={styles.focusModeBadgeText}>Focus Mode: minimal distractions</Text>
          </View>
        )}
        {adRuntime?.focusTelemetry?.adSuppressionActive && adRuntime?.focusTelemetry?.focusShieldEligible ? (
          <TouchableOpacity
            style={styles.focusShieldFloatingButton}
            onPress={handleFocusRewardedAction}
            disabled={focusActionBusy}
          >
            <MaterialCommunityIcons name="shield-star-outline" size={16} color="#FDE68A" />
            <Text style={styles.focusShieldFloatingButtonText}>
              {focusActionBusy ? 'Loading...' : 'Watch 1 ad: Keep ad-free 20m'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {adRuntime?.focusTelemetry?.recoveryRewardedPrompt ? (
          <TouchableOpacity
            style={[styles.focusShieldFloatingButton, styles.focusRecoveryButton]}
            onPress={handleFocusRewardedAction}
            disabled={focusActionBusy}
          >
            <MaterialCommunityIcons name="rocket-launch-outline" size={16} color="#86EFAC" />
            <Text style={styles.focusShieldFloatingButtonText}>
              {focusActionBusy ? 'Loading...' : 'Rewarded boost: get back on track'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView 
        style={styles.quizContent} 
        contentContainerStyle={styles.quizContainer}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {/* 🎯 Question */}
        <View style={styles.questionCard}>
          {/* Visual memory hook — always visible before answering */}
          {!lowClutterMode && visualImageUrl ? (
            <Image
              source={{ uri: visualImageUrl }}
              style={styles.questionImage}
              resizeMode="cover"
            />
          ) : null}
          <View style={{ padding: 20, paddingTop: visualImageUrl ? 16 : 20 }}>
            <Text style={[styles.questionText, { marginTop: 0 }]}>
              {question.question}
            </Text>
            {isTwoAnswerQuestion && (
              <Text style={styles.multiAnswerHint}>
                In this quiz, choose one valid idea. In the interview, give any two accepted ideas.
              </Text>
            )}
          </View>
        </View>

        {/* 4-answer options with large buttons */}
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
                    color="#34D399"
                    style={{ marginLeft: 8 }}
                  />
                )}
                {showFeedback && showWrong && (
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={28}
                    color="#F87171"
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

            {/* Visual explanation - reveal on demand */}
            {!showExplanation && (
              <TouchableOpacity
                style={styles.adhd_explanationButton}
                onPress={handleShowExplanation}
              >
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#fff" />
                <Text style={styles.adhd_explanationButtonText}>
                  � Why This Answer?
                </Text>
              </TouchableOpacity>
            )}

            {/* Memory tip placeholder (replaces duplicate image box) */}
            {showExplanation && (
              <View style={styles.adhd_explanationBox}>
                <Text style={styles.adhd_explanationText}>
                  {question.subTopic ? `📌 Topic: ${question.topic} → ${question.subTopic}` : ''}
                </Text>
              </View>
            )}

            {/* Continue Button - shows auto-advance countdown in listen mode */}
            <TouchableOpacity
              style={styles.adhd_continueButton}
              onPress={handleNextQuestion}
            >
              <Text style={styles.adhd_continueButtonText}>
                {listenMode && autoAdvancePhase === 'next' && autoAdvanceCountdown > 0
                  ? `➡️ Next in ${autoAdvanceCountdown}s  (tap to skip)`
                  : current + 1 >= pool.length ? '📊 See Results' : '➡️ Next Question'}
              </Text>
            </TouchableOpacity>

            {shouldShowBreakNudge && (
              <View style={styles.helperTextBox}>
                <MaterialCommunityIcons name="coffee-outline" size={16} color="#64748B" />
                <Text style={styles.helperText}>Great consistency. Consider a short break before the next set.</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Helper text when no answer selected yet */}
        {!showFeedback && !focusModeMinimal && !lowClutterMode && (
          <View style={styles.helperTextBox}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#64748B" />
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

export default QuizScreen;
