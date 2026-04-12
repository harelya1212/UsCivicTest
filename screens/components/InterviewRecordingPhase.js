import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { audioManager } from '../../utils/audioWrapper';

/**
 * InterviewRecordingPhase - Capture user's spoken response
 * User can record, playback, and re-record up to 3x
 */
const InterviewRecordingPhase = ({ question, onSubmit, onSkip, onExit, onRecordingStart }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPath, setRecordingPath] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingCount, setRecordingCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [shortRecordingMessage, setShortRecordingMessage] = useState('');
  const [transcriptText, setTranscriptText] = useState('');

  // Animated recording indicator
  const [pulseAnim] = useState(new Animated.Value(0));

  const minRecordingDuration = 3000; // 3 seconds minimum
  const maxRerecords = 3;
  const canStopRecording = recordingDuration >= minRecordingDuration;

  // Timer for recording duration
  useEffect(() => {
    let interval;

    if (isRecording) {
      // Update duration periodically
      interval = setInterval(() => {
        const duration = audioManager.getRecordingDuration();
        setRecordingDuration(duration);

        // Auto-stop at 90 seconds
        if (duration >= 90000) {
          stopRecording();
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  // Pulse animation during recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      const success = await audioManager.initializeAudioSession();
      if (!success) {
        Alert.alert('Error', 'Failed to initialize audio session.');
        return;
      }

      const recordSuccess = await audioManager.startRecording({
        maxDuration: 90000,
        onRecordingStatusUpdate: (status) => {
          setRecordingDuration(status.durationMillis);
        },
      });

      if (recordSuccess) {
        setIsRecording(true);
        setRecordingDuration(0);
        setRecordingCount(recordingCount + 1);
        setHasRecorded(true);
        setShortRecordingMessage('');
        onRecordingStart?.();
      } else {
        Alert.alert('Error', 'Failed to start recording. Check microphone permissions.');
      }
    } catch (error) {
      console.error('[Recording] Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      const path = await audioManager.stopRecording();
      setIsRecording(false);

      if (path && recordingDuration >= minRecordingDuration) {
        setRecordingPath(path);
        setShortRecordingMessage('');
      } else if (recordingDuration < minRecordingDuration) {
        if (path) {
          await audioManager.deleteRecording(path);
        }
        setRecordingPath(null);
        setShortRecordingMessage(`Recording too short. Please record at least 3 seconds. Last attempt: ${Math.round(recordingDuration / 1000)} second(s).`);
      }
    } catch (error) {
      console.error('[Recording] Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (!canStopRecording) {
        return;
      }
      await stopRecording();
    } else {
      if (recordingCount >= maxRerecords && recordingPath) {
        Alert.alert('Limit Reached', `You can re-record up to ${maxRerecords} times.`);
        return;
      }
      await startRecording();
    }
  };

  const handlePlayback = async () => {
    if (!recordingPath) return;

    try {
      setIsPlaying(true);
      const success = await audioManager.playRecording(recordingPath, {
        onDone: () => {
          setIsPlaying(false);
        },
        onError: (error) => {
          console.error('[Recording] Playback error:', error);
          setIsPlaying(false);
          Alert.alert('Error', 'Failed to play recording.');
        },
      });

      if (!success) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('[Recording] Error playing:', error);
      setIsPlaying(false);
    }
  };

  const handleRerecord = async () => {
    if (recordingPath) {
      await audioManager.deleteRecording(recordingPath);
    }
    setRecordingPath(null);
    setShortRecordingMessage('');
    await startRecording();
  };

  const handleTryAgain = () => {
    setRecordingPath(null);
    setRecordingDuration(0);
    setShortRecordingMessage('');
  };

  const handleSubmit = async () => {
    if (!recordingPath) {
      Alert.alert('No Recording', 'Please record your answer before submitting.');
      return;
    }

    if (recordingDuration < minRecordingDuration) {
      Alert.alert('Recording Too Short', 'Please record at least 3 seconds.');
      return;
    }

    onSubmit({
      recordingPath,
      transcriptText: (transcriptText || '').trim(),
    });
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const recordButtonColor = isRecording ? '#F87171' : '#2DD4BF';

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Record Your Answer</Text>
        <Text style={styles.instructionText}>
          Tap the button below and speak your answer. You have up to 90 seconds.
        </Text>
      </View>

      {/* Recording Status */}
      <View style={styles.statusContainer}>
        {isRecording && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {Math.floor(recordingDuration / 1000)}:{String(Math.floor((recordingDuration % 1000) / 10)).padStart(2, '0')}
            </Text>
          </View>
        )}

        {recordingPath && !isRecording && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Recording saved</Text>
          </View>
        )}

        {!recordingPath && !isRecording && hasRecorded && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Recording not saved</Text>
            <Text style={styles.warningText}>{shortRecordingMessage || 'Your last recording was too short.'}</Text>
          </View>
        )}
      </View>

      {/* Record Button */}
      <View style={styles.recordButtonContainer}>
        <Animated.View
          style={[
            styles.recordButton,
            isRecording && { transform: [{ scale: pulseScale }] },
          ]}
        >
          <TouchableOpacity
            onPress={toggleRecording}
            disabled={isRecording && !canStopRecording}
            style={[
              styles.recordButtonInner,
              { backgroundColor: recordButtonColor },
              isRecording && !canStopRecording && styles.recordButtonDisabled,
            ]}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '⏹ Stop' : '🎤 Record'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {isRecording && !canStopRecording && (
        <Text style={styles.recordingLockHint}>
          Stop available after 3 seconds
        </Text>
      )}

      {/* Playback Section */}
      {recordingPath && (
        <View style={styles.playbackSection}>
          <Text style={styles.playbackLabel}>Preview your response:</Text>
          <TouchableOpacity
            onPress={handlePlayback}
            disabled={isPlaying}
            style={[styles.playButton, isPlaying && styles.buttonDisabled]}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸ Playing...' : '▶ Play Recording'}
            </Text>
          </TouchableOpacity>

          {recordingCount < maxRerecords && (
            <TouchableOpacity
              onPress={handleRerecord}
              style={styles.rerecordButton}
            >
              <Text style={styles.rerecordButtonText}>
                🔄 Re-record ({recordingCount}/{maxRerecords})
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.transcriptLabel}>What did you say? (helps scoring accuracy)</Text>
          <TextInput
            style={styles.transcriptInput}
            placeholder="Type your spoken answer here"
            value={transcriptText}
            onChangeText={setTranscriptText}
            multiline
          />
        </View>
      )}

      {!recordingPath && !isRecording && hasRecorded && (
        <View style={styles.recoverySection}>
          <TouchableOpacity onPress={handleTryAgain} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkip} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionButtonText}>Skip Question</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onExit} style={styles.exitActionButton}>
            <Text style={styles.exitActionButtonText}>Exit to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Button (only when recording exists) */}
      {recordingPath && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isRecording || isPlaying}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSkip}
            disabled={isRecording || isPlaying}
            style={styles.inlineSecondaryButton}
          >
            <Text style={styles.inlineSecondaryButtonText}>Skip Question</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onExit}
            disabled={isRecording || isPlaying}
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>Exit to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {!recordingPath && !hasRecorded && (
        <View style={styles.idleActions}>
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            disabled={isRecording}
          >
            <Text style={styles.skipButtonText}>Skip Question</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onExit}
            style={styles.exitButton}
            disabled={isRecording}
          >
            <Text style={styles.exitButtonText}>Exit to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  instructionCard: {
    backgroundColor: 'rgba(14,165,233,0.08)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2DD4BF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    backgroundColor: '#1A1A2A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#F87171',
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F87171',
    fontVariant: ['tabular-nums'],
  },
  successContainer: {
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  successText: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: 'rgba(251,146,60,0.10)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.3)',
    maxWidth: 360,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FB923C',
    marginBottom: 6,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#FBBF24',
    textAlign: 'center',
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  recordButtonInner: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  recordButtonDisabled: {
    opacity: 0.45,
  },
  recordingLockHint: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginTop: -16,
    marginBottom: 12,
  },
  playbackSection: {
    marginVertical: 16,
  },
  playbackLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 10,
  },
  transcriptLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  transcriptInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#12121E',
    color: '#F1F5F9',
    textAlignVertical: 'top',
  },
  playButton: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
  },
  rerecordButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rerecordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitContainer: {
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#2DD4BF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  recoverySection: {
    gap: 10,
    marginBottom: 12,
  },
  secondaryActionButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  inlineSecondaryButton: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inlineSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  idleActions: {
    gap: 10,
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  exitActionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  exitButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  exitActionButtonText: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  exitButtonText: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});

export default InterviewRecordingPhase;
