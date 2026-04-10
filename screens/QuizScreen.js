import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Animated,
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

function QuizScreen({ route, navigation }) {
  const { testDetails, pausedSession, savePausedSession, clearPausedSession, maybeShowInterstitial, recordMasterySession, trackAppEvent } = useContext(AppDataContext);
  const { type, topicFilter, subTopicFilter } = route.params;
  const requestedQuestionIds = Array.isArray(route?.params?.questionIds)
    ? route.params.questionIds.map((id) => String(id))
    : [];
  const focusModeMinimal = route?.params?.focusMode === 'minimal';
  const listenMode = Boolean(route?.params?.listenMode);
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
  const [speechRateIndex, setSpeechRateIndex] = useState(1);
  // Store generated question in state so options don't reshuffle on every re-render
  const [currentQuestion, setCurrentQuestion] = useState(() =>
    shouldResumeSession && pausedSession.currentQuestion
      ? pausedSession.currentQuestion
      : pool && pool.length
        ? generateQuizQuestion(pool[initialCurrent], initialDifficulty, { userState: testDetails?.state })
        : null
  );
  const [justRestoredSession, setJustRestoredSession] = useState(shouldResumeSession);

  useEffect(() => {
    trackAppEvent(APP_EVENT_NAMES.QUIZ_STARTED, {
      quiz_type: type,
      question_count: initialPool.length,
      resumed: shouldResumeSession,
      topic_filter: activeTopicFilter || 'none',
      subtopic_filter: activeSubTopicFilter || 'none',
      listen_mode: listenMode,
    });
  }, []);

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
      onDone: () => setIsSpeaking(false),
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

  useEffect(() => () => {
    ttsManager.stop();
  }, []);

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

  // Select answer with visual feedback
  const handleSelectAnswer = (selectedAnswer) => {
    if (showFeedback) return; // Prevent double-clicking

    if (listenMode && ttsManager.isSpeakingNow()) {
      ttsManager.stop();
      setIsSpeaking(false);
    }

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

    // Show feedback immediately after selection
    setShowFeedback(true);

    // Calculate performance for next question's difficulty
    const performance = calculatePerformance(newHistory);
    const nextDifficulty = getAdaptiveDifficulty(difficulty, performance);
    setDifficulty(nextDifficulty);
    // Note: next question is generated on setCurrent in handleNextQuestion
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

  // Slower pace - user controls next question
  const handleNextQuestion = async () => {
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
      {/* 📊 Progress Bar */}
      <View style={styles.quizHeader}>
        <View style={styles.quizTopActions}>
          <TouchableOpacity style={styles.quizActionButton} onPress={handlePauseQuiz}>
            <MaterialCommunityIcons name="pause-circle-outline" size={20} color="#7C3AED" />
            <Text style={styles.quizActionText}>Pause</Text>
          </TouchableOpacity>
          {!focusModeMinimal && (
            <TouchableOpacity style={styles.quizActionButton} onPress={() => navigation.navigate('MainTabs')}>
              <MaterialCommunityIcons name="home-outline" size={20} color="#7C3AED" />
              <Text style={styles.quizActionText}>Home</Text>
            </TouchableOpacity>
          )}
        </View>
        {listenMode && (
          <View style={styles.listenControlsRow}>
            <TouchableOpacity
              style={styles.listenControlButton}
              onPress={() => speakCurrentQuestion({ repeated: true })}
              disabled={isSpeaking}
            >
              <MaterialCommunityIcons name={isSpeaking ? 'volume-high' : 'play-circle-outline'} size={18} color="#0F766E" />
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
              <MaterialCommunityIcons name="speedometer" size={18} color="#0C4A6E" />
              <Text style={styles.listenControlText}>Speed {speechRates[speechRateIndex]}x</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {current + 1} of {pool.length}
        </Text>
        {explicitQueuePool.length > 0 && (
          <View style={styles.smartQueueBadge}>
            <MaterialCommunityIcons name="brain" size={14} color="#0C4A6E" />
            <Text style={styles.smartQueueBadgeText}>Smart Queue: mixed weak + due topics</Text>
          </View>
        )}
        {focusModeMinimal && (
          <View style={styles.focusModeBadge}>
            <MaterialCommunityIcons name="target-variant" size={14} color="#3F6212" />
            <Text style={styles.focusModeBadgeText}>Focus Mode: minimal distractions</Text>
          </View>
        )}
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
          {visualImageUrl ? (
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
        {!showFeedback && !focusModeMinimal && (
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

export default QuizScreen;
