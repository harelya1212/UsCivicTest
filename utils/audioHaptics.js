import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

const BRAND_SOUNDS = {
  correct: require('../assets/sounds/correct_crystal.wav'),
  wrong: require('../assets/sounds/wrong_thud.wav'),
  highscore: require('../assets/sounds/highscore_rise.wav'),
  invite: require('../assets/sounds/invite_knock.wav'),
  logo: require('../assets/sounds/logo_swell.wav'),
  adStart: require('../assets/sounds/ad_start_mute.wav'),
};

let audioReady = false;

const ensureAudioMode = async () => {
  if (audioReady) return;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: 1,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioReady = true;
  } catch (error) {
    console.log('Audio mode setup failed', error);
  }
};

const playSound = async (source, volume = 0.6) => {
  try {
    await ensureAudioMode();
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume,
    });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status?.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (error) {
    console.log('Sound playback failed', error);
  }
};

export const playCorrectFeedback = async () => {
  Vibration.vibrate([0, 10, 30, 10]);
  await playSound(BRAND_SOUNDS.correct, 0.55);
};

export const playWrongFeedback = async () => {
  Vibration.vibrate(30);
  await playSound(BRAND_SOUNDS.wrong, 0.45);
};

export const playHighScoreFeedback = async () => {
  Vibration.vibrate([0, 20, 35, 35, 55]);
  await playSound(BRAND_SOUNDS.highscore, 0.65);
};

export const playInviteNudgeFeedback = async () => {
  Vibration.vibrate([0, 20, 60, 20]);
  await playSound(BRAND_SOUNDS.invite, 0.5);
};

export const playLogoSwell = async () => {
  await playSound(BRAND_SOUNDS.logo, 0.4);
};

export const playAdStartFeedback = async () => {
  await playSound(BRAND_SOUNDS.adStart, 0.2);
};
