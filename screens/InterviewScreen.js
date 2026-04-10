import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { AppDataContext } from '../context/AppDataContext';
import InterviewPromptPhase from './components/InterviewPromptPhase';
import InterviewRecordingPhase from './components/InterviewRecordingPhase';
import InterviewScoringPhase from './components/InterviewScoringPhase';
import { audioManager } from '../utils/audioWrapper';
import { scoreAnswer } from '../utils/interviewScoringEngine';
import civicsData from '../civics_128.json';
import { followUpQuestions } from '../data/followUpQuestions';
import { APP_EVENT_NAMES } from '../constants';

/**
 * InterviewScreen - Main container for interview mode
 * Orchestrates flow through phases: Prompt → Recording → Scoring → (optional Follow-Up) → Next
 */
const InterviewScreen = ({ route, navigation }) => {
  const appData = useContext(AppDataContext);

  // Session state
  const [sessionId] = useState(() => Date.now().toString()); // Simple UUID
  const [mode] = useState(route?.params?.mode || 'quick'); // 'quick' = 3 questions, 'full' = 10
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const responsesRef = useRef([]);
  const completionEmittedRef = useRef(false);

  // Phase state: 'prompt' | 'recording' | 'scoring' | 'followup' | 'complete'
  const [currentPhase, setCurrentPhase] = useState('prompt');
  const [isLoading, setIsLoading] = useState(true);

  // Current question data
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentScore, setCurrentScore] = useState(null);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Follow-up question state
  const [followUp, setFollowUp] = useState(null);
  const [followUpScore, setFollowUpScore] = useState(null);
  const [followUpFeedback, setFollowUpFeedback] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  const trackInterviewEvent = (eventName, extras = {}) => {
    appData?.trackAppEvent(eventName, {
      sessionId,
      mode,
      questionId: currentQuestion?.id,
      questionIndex: currentQuestionIndex,
      questionCount: questions.length,
      ...extras,
    });
  };

  const initializeSession = async () => {
    try {
      // Initialize audio session
      await audioManager.initializeAudioSession();

      // Load questions from civics_128.json
      // Questions 1-10 have enriched rubrics from Phase 2 Step 1
      const questionsWithRubrics = civicsData
        .slice(0, 10)  // Use questions 1-10 (enriched with rubrics)
        .map((q, idx) => ({
          id: `q${idx + 1}`,
          question: q.question,
          answers: q.answers || [],
          topicId: q.topic || 'civics',
          rubric: q.rubric || {
            A: 'Advanced understanding demonstrated',
            B: 'Proficient understanding shown',
            C: 'Developing understanding with gaps',
            D: 'Insufficient or incorrect understanding',
          },
          source: 'civics_128',
        }));

      // Select questions based on mode
      const selectedQuestions = mode === 'quick' 
        ? questionsWithRubrics.slice(0, 3)
        : questionsWithRubrics;

      setQuestions(selectedQuestions);
      setCurrentQuestion(selectedQuestions[0]);
      setIsLoading(false);

      // Track event
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_STARTED, {
        mode,
        questionCount: selectedQuestions.length,
      });
    } catch (error) {
      console.error('[Interview] Error initializing session:', error);
      Alert.alert('Error', 'Failed to initialize interview session. Please try again.');
      navigation.goBack();
    }
  };

  const handlePromptComplete = () => {
    // Transition from prompt to recording phase
    setCurrentPhase('recording');
    trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_PROMPT_PLAYED, {
      phase: 'main',
    });
  };

  const trackRecordingStarted = (phase = 'main') => {
    trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_RECORDING_STARTED, {
      phase,
      hasFollowUp: Boolean(followUp),
    });
  };

  const handleRecordingSubmit = async (payload) => {
    try {
      setCurrentPhase('scoring');

      const recordingPath = typeof payload === 'string' ? payload : payload?.recordingPath;
      const transcriptText = typeof payload === 'string' ? '' : (payload?.transcriptText || '');

      // Track event
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED, {
        phase: 'main',
        skipped: false,
      });

      const studentAnswer = transcriptText || generateMockTranscription(currentQuestion?.question, responses.length);
      const scoreResult = scoreAnswer(studentAnswer, currentQuestion?.rubric, {
        questionId: currentQuestion?.id,
        expectedAnswers: currentQuestion?.answers || [],
      });

      setCurrentScore(scoreResult.grade);
      setCurrentFeedback(scoreResult.feedback);

      // Store response
      setResponses((prev) => [
        ...prev,
        {
          questionId: currentQuestion?.id,
          recordingPath,
          studentAnswer,
          grade: scoreResult.grade,
          feedback: scoreResult.feedback,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Track event
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_SCORE_REVEALED, {
        grade: scoreResult.grade,
      });
    } catch (error) {
      console.error('[Interview] Error processing response:', error);
      Alert.alert('Error', 'Failed to score response. Please try again.');
    }
  };

  /**
   * Generate mock transcription for testing
   * In production, this would use speech-to-text API
   */
  const generateMockTranscription = (question, attemptNumber) => {
    // Different responses based on question topic and attempt number
    const responsesByTopic = {
      default: [
        'The Constitution is important for the United States.',
        'I think it helps protect people and their rights.',
        'Um, I am not completely sure about that.',
      ],
    };

    const responses = responsesByTopic.default;
    const index = Math.min(attemptNumber, responses.length - 1);
    return responses[index];
  };

  const handleNextQuestion = ({ skipFollowUp = false } = {}) => {
    // Check if we need to show follow-up question
    if (!skipFollowUp && (currentScore === 'C' || currentScore === 'D') && !followUp) {
      // Find and show follow-up question
      const followUpData = followUpQuestions.find(
        (q) => q.mainQuestionId === currentQuestion?.id
      );
      
      if (followUpData) {
        setFollowUp(followUpData);
        setCurrentPhase('followup');
        trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SHOWN, {
          mainGrade: currentScore,
        });
        return;
      }
    }

    // Otherwise proceed to next question
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      // Move to next question
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setCurrentPhase('prompt');
      setCurrentScore(null);
      setCurrentFeedback(null);
      setFollowUp(null);
      setFollowUpScore(null);
      setFollowUpFeedback(null);
    } else {
      // Session complete
      completeSession();
    }
  };

  const handleSkipQuestion = (phase = 'main') => {
    if (phase === 'followup') {
      handleSkipFollowUp();
      return;
    }

    const skippedResponse = {
      questionId: currentQuestion?.id,
      recordingPath: null,
      studentAnswer: '[skipped]',
      grade: 'SKIPPED',
      feedback: 'Question skipped by user.',
      timestamp: new Date().toISOString(),
      skipped: true,
      phase,
    };

    setResponses((prev) => [...prev, skippedResponse]);
    trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_RESPONSE_SUBMITTED, {
      phase,
      skipped: true,
    });

    handleNextQuestion({ skipFollowUp: true });
  };

  const handleFollowUpSubmit = async (payload) => {
    try {
      const recordingPath = typeof payload === 'string' ? payload : payload?.recordingPath;
      const transcriptText = typeof payload === 'string' ? '' : (payload?.transcriptText || '');
      const studentAnswer = transcriptText || generateMockTranscription(followUp.followUpQuestion, responses.length);
      const scoreResult = scoreAnswer(studentAnswer, followUp.followUpRubric, {
        questionId: `${currentQuestion?.id}_followup`,
        expectedAnswers: [],
      });

      setFollowUpScore(scoreResult.grade);
      setFollowUpFeedback(scoreResult.feedback);

      // Store follow-up response
      setResponses((prev) => [
        ...prev,
        {
          questionId: `${currentQuestion?.id}_followup`,
          recordingPath,
          studentAnswer,
          grade: scoreResult.grade,
          feedback: scoreResult.feedback,
          timestamp: new Date().toISOString(),
          isFollowUp: true,
        },
      ]);

      // Track event
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED, {
        mainQuestionId: currentQuestion?.id,
        mainGrade: currentScore,
        followUpGrade: scoreResult.grade,
        skipped: false,
      });

      // Backward compatibility event used by existing dashboards.
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_SCORED, {
        mainQuestionId: currentQuestion?.id,
        mainGrade: currentScore,
        followUpGrade: scoreResult.grade,
      });
    } catch (error) {
      console.error('[Interview] Error scoring follow-up:', error);
      Alert.alert('Error', 'Failed to score follow-up response. Please try again.');
    }
  };

  const handleSkipFollowUp = () => {
    trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_FOLLOWUP_COMPLETED, {
      mainQuestionId: currentQuestion?.id,
      mainGrade: currentScore,
      followUpGrade: 'SKIPPED',
      skipped: true,
    });

    // Clear follow-up state and move to next question
    setFollowUp(null);
    setFollowUpScore(null);
    setFollowUpFeedback(null);
    handleNextQuestion();
  };

  const completeSession = async () => {
    try {
      if (completionEmittedRef.current) return;
      completionEmittedRef.current = true;

      setCurrentPhase('complete');

      // Calculate session stats
      const finalResponses = responsesRef.current;
      const correctCount = finalResponses.filter((r) => r.grade === 'A' || r.grade === 'B').length;
      const totalCount = finalResponses.length;

      // Track event
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_SESSION_COMPLETED, {
        sessionId,
        questionCount: questions.length,
        correctCount,
        totalCount,
        mode,
      });

      // Backward compatibility event used by existing dashboards.
      trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_COMPLETED, {
        sessionId,
        questionCount: questions.length,
        correctCount,
        totalCount,
        mode,
      });

      // Update mastery map in context (if available)
      if (appData?.recordMasterySession) {
        appData.recordMasterySession({
          mode: 'interview',
          questionCount: questions.length,
          correctCount,
          sessionData: finalResponses,
        });
      }
    } catch (error) {
      console.error('[Interview] Error completing session:', error);
    }
  };

  const handleExitSession = () => {
    // Confirm exit
    Alert.alert('Exit Interview', 'Your progress will not be saved. Continue?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Exit',
        onPress: () => {
          trackInterviewEvent(APP_EVENT_NAMES.INTERVIEW_SESSION_EXITED, {
            phase: currentPhase,
            exitEarly: true,
          });
          navigation.goBack();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading interview session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Interview Mode
        </Text>
        <Text style={styles.headerSubtitle}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      <View style={styles.phaseContainer}>
        {currentPhase === 'prompt' && (
          <InterviewPromptPhase
            question={currentQuestion}
            onComplete={handlePromptComplete}
            onExit={handleExitSession}
          />
        )}

        {currentPhase === 'recording' && (
          <InterviewRecordingPhase
            question={currentQuestion}
            onSubmit={handleRecordingSubmit}
            onSkip={() => handleSkipQuestion('main')}
            onExit={handleExitSession}
            onRecordingStart={() => trackRecordingStarted('main')}
          />
        )}

        {currentPhase === 'scoring' && (
          <InterviewScoringPhase
            question={currentQuestion}
            grade={currentScore}
            feedback={currentFeedback}
            shouldShowFollowUp={currentScore === 'C' || currentScore === 'D'}
            onNext={handleNextQuestion}
            onSkipFollowUp={handleSkipFollowUp}
          />
        )}

        {currentPhase === 'followup' && followUp && !followUpScore && (
          <View style={styles.followUpContainer}>
            <Text style={styles.followUpTitle}>Let's try another way</Text>
            <Text style={styles.followUpQuestion}>{followUp.followUpQuestion}</Text>
            <InterviewRecordingPhase
              question={{ question: followUp.followUpQuestion }}
              onSubmit={handleFollowUpSubmit}
              onSkip={() => handleSkipQuestion('followup')}
              onExit={handleExitSession}
              onRecordingStart={() => trackRecordingStarted('followup')}
            />
          </View>
        )}

        {currentPhase === 'followup' && followUpScore && (
          <View style={styles.followUpContainer}>
            <Text style={styles.followUpScoreTitle}>Follow-up Result</Text>
            <View style={styles.scoreContainer}>
              <Text style={[styles.gradeBadge, styles[`grade${followUpScore}`]]}>
                {followUpScore}
              </Text>
            </View>
            <Text style={styles.followUpFeedback}>{followUpFeedback}</Text>
            <View style={styles.actionContainer}>
              <Text style={styles.actionButton} onPress={handleNextQuestion}>
                Continue →
              </Text>
            </View>
          </View>
        )}

        {currentPhase === 'complete' && (
          <View style={styles.completeContainer}>
            <Text style={styles.completeTitle}>Interview Complete! 🎉</Text>
            <Text style={styles.completeStats}>
              {responses.filter((r) => r.grade === 'A' || r.grade === 'B').length} strengthened
            </Text>
            <Text style={styles.completeSubtitle}>
              Review your mastery or continue practicing.
            </Text>

            <View style={styles.completeActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs')}
                style={styles.primaryCompleteButton}
              >
                <Text style={styles.primaryCompleteButtonText}>Back to Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.replace('Interview', { mode })}
                style={styles.secondaryCompleteButton}
              >
                <Text style={styles.secondaryCompleteButtonText}>Start Another Interview</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  phaseContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 24,
    textAlign: 'center',
  },
  completeStats: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  completeActions: {
    width: '100%',
    gap: 10,
  },
  primaryCompleteButton: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryCompleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryCompleteButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryCompleteButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },
  followUpContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  followUpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#d97706',
    marginBottom: 16,
    textAlign: 'center',
  },
  followUpScoreTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 16,
    textAlign: 'center',
  },
  followUpQuestion: {
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gradeBadge: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    lineHeight: 120,
  },
  gradeA: {
    color: '#fff',
    backgroundColor: '#166534',
  },
  gradeB: {
    color: '#fff',
    backgroundColor: '#0f766e',
  },
  gradeC: {
    color: '#fff',
    backgroundColor: '#d97706',
  },
  gradeD: {
    color: '#fff',
    backgroundColor: '#dc2626',
  },
  followUpFeedback: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
  },
});

export default InterviewScreen;
