/**
 * adMobService.js - Google Mobile Ads integration (react-native-google-mobile-ads).
 *
 * Product policy (see product vision): free app, banner ads + at most one
 * interstitial per quiz session (shown after the quiz). Rewarded ads remain
 * for user-initiated unlocks (free packs, focus shield).
 *
 * SETUP REQUIRED BEFORE PRODUCTION (native change - needs an EAS rebuild):
 * 1. Create an AdMob account at https://admob.google.com and register the app
 *    (Android package: com.civiceducation.citizenship,
 *     iOS bundle id: com.civiceducation.citizenship).
 * 2. In AdMob, create ad units and paste their IDs into AD_UNIT_IDS below,
 *    replacing every 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx' placeholder.
 * 3. Paste the AdMob *app* IDs into app.json under the
 *    "react-native-google-mobile-ads" plugin (androidAppId / iosAppId).
 * 4. Rebuild with EAS (the plugin injects native config - Expo Go will not work).
 *
 * Development: __DEV__ builds automatically use Google's test ad units,
 * so no real IDs are needed to develop and test the flows.
 */

import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// ============ AD UNIT IDs (REPLACE WITH YOURS FROM AdMob) ============
// https://admob.google.com -> Apps -> Ad units. Keep the 'ca-app-pub-' format.
export const AD_UNIT_IDS = {
  // BANNER ADS (non-intrusive, bottom of screen)
  HOME_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  QUIZ_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  RESULTS_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',

  // INTERSTITIAL ADS (full screen, after quiz sessions - max 1 per session)
  QUIZ_COMPLETE_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  SESSION_END_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',

  // REWARDED ADS (user-initiated unlocks)
  UNLOCK_QUESTIONS_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  PREMIUM_TRIAL_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
};

// Google's official test ad units (used automatically in __DEV__ builds)
export const TEST_AD_UNIT_IDS = {
  BANNER: TestIds.BANNER,
  INTERSTITIAL: TestIds.INTERSTITIAL,
  REWARDED: TestIds.REWARDED,
};

const resolveUnitId = (realId, testId) => (__DEV__ ? testId : realId);
const isWeb = Platform.OS === 'web';

const waitFor = (condition, timeoutMs, intervalMs = 120) =>
  new Promise((resolve) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (condition()) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(timer);
        resolve(false);
      }
    }, intervalMs);
  });

// ============ BANNER ADS ============
export const HomeBannerAd = () => {
  if (isWeb) {
    return null;
  }
  return (
    <View style={styles.bannerContainer}>
      <BannerAd
        unitId={resolveUnitId(AD_UNIT_IDS.HOME_BANNER, TestIds.BANNER)}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
};

// ============ INTERSTITIAL ADS ============
// Frequency policy (max 1 per session, cooldowns, daily caps) is enforced by
// the caller (App.js ad-decision layer). This service only shows on demand.
let interstitial = null;
let interstitialLoaded = false;

function createInterstitial() {
  const ad = InterstitialAd.createForAdRequest(
    resolveUnitId(AD_UNIT_IDS.QUIZ_COMPLETE_INTERSTITIAL, TestIds.INTERSTITIAL)
  );
  ad.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    // Discard after show; a fresh instance is created (and preloaded) next time.
    interstitial = null;
    interstitialLoaded = false;
  });
  interstitial = ad;
  interstitialLoaded = false;
  ad.load();
  return ad;
}

/** Preload an interstitial in the background so show is instant. Optional. */
export const preloadInterstitialAd = () => {
  if (isWeb) return;
  try {
    if (!interstitial) createInterstitial();
  } catch (error) {
    console.log('[ads] preload interstitial failed:', error?.message);
  }
};

export const showInterstitialAd = async () => {
  if (isWeb) return false;
  try {
    if (!interstitial) createInterstitial();
    if (!interstitialLoaded) {
      await waitFor(() => interstitialLoaded, 6000);
    }
    if (!interstitialLoaded || !interstitial) return false;
    await interstitial.show();
    return true;
  } catch (error) {
    console.log('[ads] show interstitial failed:', error?.message);
    return false;
  }
};

// ============ REWARDED ADS ============
// Resolves with { type, amount } when the reward is earned.
// Rejects when the ad fails to load, times out, or is closed early.
export const showRewardedAd = async () => {
  if (isWeb) {
    // Preserve the historical stub shape on web where ads are unavailable.
    return { type: 'stub', amount: 1 };
  }
  return new Promise((resolve, reject) => {
    let earned = null;
    let timer = null;
    let done = false;
    const listeners = [];
    const cleanup = () => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      listeners.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
    try {
      const ad = RewardedAd.createForAdRequest(
        resolveUnitId(AD_UNIT_IDS.UNLOCK_QUESTIONS_REWARD, TestIds.REWARDED)
      );
      listeners.push(
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          ad.show().catch((error) => {
            cleanup();
            reject(error);
          });
        })
      );
      listeners.push(
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
          earned = reward;
        })
      );
      listeners.push(
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          cleanup();
          if (earned) {
            resolve({ type: earned.type, amount: earned.amount });
          } else {
            reject(new Error('rewarded ad closed before earning reward'));
          }
        })
      );
      listeners.push(
        ad.addAdEventListener(AdEventType.ERROR, (error) => {
          cleanup();
          reject(new Error(error?.message || 'rewarded ad failed'));
        })
      );
      timer = setTimeout(() => {
        cleanup();
        reject(new Error('rewarded ad timed out'));
      }, 30000);
      ad.load();
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};

// ============ AD SCHEDULING ============
// Show interstitial every few quiz sessions (non-intrusive).
// NOTE: the App.js ad-decision layer now owns frequency policy;
// this helper remains for screens that schedule locally.
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
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});

// ============ MONETIZATION STRATEGY ============
/*
REVENUE MODEL (free app, ads only):

1. Banner ads (non-intrusive) - bottom of Home / Quiz / Results screens.
2. Interstitial ads - at most ONE per quiz session, shown after quiz
   completion. Frequency is enforced by the App.js ad-decision layer
   (segment policy, cooldowns, daily caps), not here.
3. Rewarded ads (user-initiated) - unlock free packs, focus shield, etc.

Expected at 250 DAU: ~$82/mo revenue vs ~$10/mo costs (see product plan).
*/
