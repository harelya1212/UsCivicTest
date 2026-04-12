import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Audio Wrapper - Encapsulates audio recording and playback
 * Handles microphone permissions, file storage, and error cases
 */

class AudioManager {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.isRecording = false;
    this.isPlaying = false;
    this.recordingPath = null;
    this.recordingDuration = 0;
  }

  /**
   * Initialize audio session
   * Call this once on app startup to set up audio mode
   * @returns {Promise<boolean>}
   */
  async initializeAudioSession() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: false,
        interruptionHandlerIOS: {
          shouldDuckAudio: true,
          shouldPauseAudio: false,
        },
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (error) {
      console.error('[Audio] Failed to initialize audio session:', error);
      return false;
    }
  }

  /**
   * Request microphone permissions
   * @returns {Promise<boolean>} - true if permission granted
   */
  async requestMicrophonePermission() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error('[Audio] Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Check if microphone permission is granted
   * @returns {Promise<boolean>}
   */
  async checkMicrophonePermission() {
    try {
      const permission = await Audio.getPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error('[Audio] Error checking microphone permission:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   * @param {object} options - Configuration
   *   - onRecordingStatusUpdate: callback with recording status updates
   *   - maxDuration: max recording duration in ms (default 90000 = 90 sec)
   * @returns {Promise<boolean>} - true if recording started successfully
   */
  async startRecording(options = {}) {
    try {
      // Check permissions first
      const hasPermission = await this.checkMicrophonePermission();
      if (!hasPermission) {
        const granted = await this.requestMicrophonePermission();
        if (!granted) {
          console.warn('[Audio] Microphone permission not granted');
          return false;
        }
      }

      // Stop any existing recording
      if (this.isRecording) {
        await this.stopRecording();
      }

      // Clean up old files
      if (this.recordingPath) {
        try {
          await FileSystem.deleteAsync(this.recordingPath, { idempotent: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Create new recording
      const { maxDuration = 90000, onRecordingStatusUpdate = null } = options;

      this.recording = new Audio.Recording();
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (onRecordingStatusUpdate) {
          onRecordingStatusUpdate(status);
        }
        this.recordingDuration = status.durationMillis;
      });

      // Set recording options for quality
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.aac',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.aac',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: true,
        },
      });

      await this.recording.startAsync();
      this.isRecording = true;
      this.recordingDuration = 0;

      // Auto-stop after maxDuration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, maxDuration);

      return true;
    } catch (error) {
      console.error('[Audio] Error starting recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Stop current recording
   * @returns {Promise<string|null>} - Path to recorded file, or null on error
   */
  async stopRecording() {
    try {
      if (!this.isRecording || !this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      this.recordingPath = this.recording.getURI();
      this.isRecording = false;

      console.log('[Audio] Recording stopped:', this.recordingPath);
      return this.recordingPath;
    } catch (error) {
      console.error('[Audio] Error stopping recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Play recorded audio
   * @param {string} recordingPath - Path to audio file to play
   * @param {object} options - Configuration
   *   - onDone: callback when playback finishes
   *   - onError: callback on error
   * @returns {Promise<boolean>} - true if playback started
   */
  async playRecording(recordingPath, options = {}) {
    try {
      if (!recordingPath) {
        console.warn('[Audio] No recording path provided');
        return false;
      }

      // Stop any existing playback
      if (this.isPlaying) {
        await this.stopPlayback();
      }

      const { onDone = null, onError = null } = options;

      this.sound = new Audio.Sound();
      await this.sound.loadAsync({ uri: recordingPath });

      // Set up playback status updates
      await this.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          this.isPlaying = false;
          if (onDone) {
            onDone();
          }
        }
      });

      await this.sound.playAsync();
      this.isPlaying = true;

      return true;
    } catch (error) {
      console.error('[Audio] Error playing recording:', error);
      if (options.onError) {
        options.onError(error);
      }
      return false;
    }
  }

  /**
   * Stop current playback
   * @returns {Promise<boolean>}
   */
  async stopPlayback() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.isPlaying = false;
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Audio] Error stopping playback:', error);
      this.isPlaying = false;
      return false;
    }
  }

  /**
   * Get current recording duration
   * @returns {number} - Duration in milliseconds
   */
  getRecordingDuration() {
    return this.recordingDuration;
  }

  /**
   * Get current recording path
   * @returns {string|null}
   */
  getRecordingPath() {
    return this.recordingPath;
  }

  /**
   * Check if currently recording
   * @returns {boolean}
   */
  isRecordingNow() {
    return this.isRecording;
  }

  /**
   * Check if currently playing
   * @returns {boolean}
   */
  isPlayingNow() {
    return this.isPlaying;
  }

  /**
   * Clean up recording file
   * @param {string} recordingPath - Path to file to delete
   * @returns {Promise<boolean>}
   */
  async deleteRecording(recordingPath) {
    try {
      if (!recordingPath) return false;
      await FileSystem.deleteAsync(recordingPath, { idempotent: true });
      if (this.recordingPath === recordingPath) {
        this.recordingPath = null;
      }
      return true;
    } catch (error) {
      console.error('[Audio] Error deleting recording:', error);
      return false;
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

export default audioManager;
