import * as Speech from 'expo-speech';

/**
 * TTS Wrapper - Encapsulates text-to-speech functionality
 * Provides consistent error handling and device compatibility
 */

class TTSManager {
  constructor() {
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Speak text with optional callbacks
   * @param {string} text - Text to speak
   * @param {object} options - Configuration
   *   - rate: speech rate (0.5 - 2.0, default 1.0)
   *   - pitch: voice pitch (0.5 - 2.0, default 1.0)
   *   - language: language code (default 'en-US')
   *   - onStart: callback when speech begins
   *   - onDone: callback when speech finishes
   *   - onError: callback on error (receives error object)
   * @returns {Promise<boolean>} - true if speech started successfully
   */
  async speak(text, options = {}) {
    try {
      if (!text || text.trim().length === 0) {
        console.warn('[TTS] Empty text provided');
        return false;
      }

      // Stop any existing speech
      if (this.isSpeaking) {
        await this.stop();
      }

      const {
        rate = 1.0,
        pitch = 1.0,
        language = 'en-US',
        onStart = null,
        onDone = null,
        onError = null,
      } = options;

      this.isSpeaking = true;
      this.currentUtterance = { text, rate, pitch, language };

      // Emit onStart callback if provided
      if (onStart) {
        onStart();
      }

      await Speech.speak(text, {
        rate,
        pitch,
        language,
        onDone: () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          if (onDone) {
            onDone();
          }
        },
      });

      return true;
    } catch (error) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.error('[TTS] Error speaking:', error);
      if (options.onError) {
        options.onError(error);
      }
      return false;
    }
  }

  /**
   * Stop current speech
   * @returns {Promise<boolean>} - true if stopped successfully
   */
  async stop() {
    try {
      if (this.isSpeaking) {
        await Speech.stop();
        this.isSpeaking = false;
        this.currentUtterance = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TTS] Error stopping speech:', error);
      this.isSpeaking = false;
      return false;
    }
  }

  /**
   * Pause current speech (if supported)
   * Note: Not all platforms support pause
   * @returns {Promise<boolean>}
   */
  async pause() {
    try {
      if (this.isSpeaking) {
        // Expo Speech doesn't have pause, so we stop
        // In a real app, you'd use native bridges for pause support
        await this.stop();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[TTS] Error pausing speech:', error);
      return false;
    }
  }

  /**
   * Check if currently speaking
   * @returns {boolean}
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   * Note: Available voices vary by platform and device
   * @returns {Promise<Array>} - Array of voice objects
   */
  async getVoices() {
    try {
      // Expo Speech provides basic voice support
      // On iOS: system selects best voice automatically
      // On Android: may need native module for voice selection
      return []; // Placeholder - Expo doesn't expose voice list
    } catch (error) {
      console.error('[TTS] Error getting voices:', error);
      return [];
    }
  }

  /**
   * Validate TTS available on device
   * @returns {Promise<boolean>}
   */
  async validateAvailable() {
    try {
      // Attempt to speak empty text to validate
      // If TTS not available, this will fail
      await Speech.speak('', {
        rate: 0, // Invisible test
      });
      return true;
    } catch (error) {
      console.warn('[TTS] TTS not available on this device:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ttsManager = new TTSManager();

export default ttsManager;
