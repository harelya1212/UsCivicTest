/**
 * adMobService.web.js - Web stub for the ads service.
 *
 * Google Mobile Ads has no web SDK through react-native-google-mobile-ads,
 * so on web every ad call is a safe no-op. Metro picks this file
 * automatically for web builds (adMobService.native.js is used on
 * iOS/Android). The export API matches adMobService.native.js exactly.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ============ AD UNIT IDs (REPLACE WITH YOURS FROM AdMob) ============
// https://admob.google.com -> Apps -> Ad units. Keep the 'ca-app-pub-' format.
export const AD_UNIT_IDS = {
  HOME_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  QUIZ_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  RESULTS_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  QUIZ_COMPLETE_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  SESSION_END_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  UNLOCK_QUESTIONS_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  PREMIUM_TRIAL_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
};

export const TEST_AD_UNIT_IDS = {
  BANNER: 'web-stub',
  INTERSTITIAL: 'web-stub',
  REWARDED: 'web-stub',
};

// ============ BANNER ADS ============
// Web stub: visible placeholder so beta testers can see and comment on ad placement.
// (Real AdMob only on native builds with real IDs)
export const HomeBannerAd = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Ad placeholder (banner)</Text>
    <Text style={styles.placeholderSub}>Testers: how does this placement feel?</Text>
  </View>
);

// ============ INTERSTITIAL ADS ============
export const preloadInterstitialAd = () => {};

export const showInterstitialAd = async () => false;

// ============ REWARDED ADS ============
export const showRewardedAd = async () => ({ type: 'stub', amount: 1 });

// ============ AD SCHEDULING ============
export class AdScheduler {
  constructor(showInterstitialEveryXQuizzes = 3) {
    this.quizCount = 0;
    this.showInterstitialEveryXQuizzes = showInterstitialEveryXQuizzes;
  }

  recordQuizCompletion() {
    this.quizCount += 1;
    if (this.quizCount % this.showInterstitialEveryXQuizzes === 0) {
      this.showAd();
    }
  }

  async showAd() {
    try {
      await showInterstitialAd();
    } catch (error) {
      console.log('Error showing ad:', error);
    }
  }

  reset() {
    this.quizCount = 0;
  }
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: 52,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9aa0a6',
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  placeholderText: {
    fontSize: 12,
    color: '#5f6368',
  },
});
