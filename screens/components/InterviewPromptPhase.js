import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ttsManager } from '../../utils/ttsWrapper';

/**
 * InterviewPromptPhase - Display question and play TTS audio
 * User can repeat the prompt up to 3x before moving to recording
 */
const InterviewPromptPhase = ({ question, onComplete, onExit }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const maxRepeats = 3;

  // Auto-play on mount
  useEffect(() => {
    playPrompt();
  }, []);

  const playPrompt = async () => {
    try {
      setIsSpeaking(true);

      const success = await ttsManager.speak(question.question, {
        rate: 1.0,
        pitch: 1.0,
        language: 'en-US',
        onStart: () => {
          setIsSpeaking(true);
        },
        onDone: () => {
          setIsSpeaking(false);
          setIsReady(true);
        },
        onError: (error) => {
          console.error('[Prompt] TTS error:', error);
          setIsSpeaking(false);
          Alert.alert('Audio Error', 'Could not play prompt. Try again?', [
            { text: 'Retry', onPress: playPrompt },
            { text: 'Skip', onPress: onComplete },
          ]);
        },
      });

      if (!success) {
        console.warn('[Prompt] Failed to start TTS');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('[Prompt] Error playing prompt:', error);
      setIsSpeaking(false);
    }
  };

  const handleRepeat = async () => {
    if (repeatCount >= maxRepeats) {
      Alert.alert('Repeat Limit', `You can repeat up to ${maxRepeats} times.`);
      return;
    }

    setRepeatCount(repeatCount + 1);
    setIsReady(false);
    await playPrompt();
  };

  const handleReady = () => {
    if (!isSpeaking && isReady) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Text Display */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusSection}>
        {isSpeaking ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#2DD4BF" style={styles.spinner} />
            <Text style={styles.statusText}>Playing audio...</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>
            {isReady ? '✓ Ready to record' : ''}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleRepeat}
          disabled={isSpeaking || repeatCount >= maxRepeats}
          style={[
            styles.button,
            styles.repeatButton,
            (isSpeaking || repeatCount >= maxRepeats) && styles.buttonDisabled,
          ]}
        >
          <Text style={[styles.buttonText, styles.repeatButtonText]}>
            🔊 Repeat ({repeatCount}/{maxRepeats})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReady}
          disabled={isSpeaking || !isReady}
          style={[
            styles.button,
            styles.readyButton,
            (isSpeaking || !isReady) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isSpeaking ? 'Playing...' : 'Ready to Record →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exit Button */}
      <TouchableOpacity
        onPress={onExit}
        style={styles.exitButton}
        disabled={isSpeaking}
      >
        <Text style={styles.exitButtonText}>Exit Interview</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  questionCard: {
    backgroundColor: '#12121E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    lineHeight: 26,
  },
  statusSection: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#2DD4BF',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatButton: {
    backgroundColor: 'rgba(56,189,248,0.10)',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  readyButton: {
    backgroundColor: '#2DD4BF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  repeatButtonText: {
    color: '#38BDF8',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  exitButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});

export default InterviewPromptPhase;
