// Temporary ad service compatibility shim.
// expo-ads-admob is not compatible with the current Android Gradle toolchain,
// so ads are disabled here until migration to a supported ads SDK.

import React from 'react';
import { View, Text, Platform } from 'react-native';

// ============ AD UNIT IDs (REPLACE WITH YOURS FROM AdMob) ============
// https://admob.google.com -> Get your Ad Unit IDs
// Test IDs below - replace for production

export const AD_UNIT_IDS = {
    // BANNER ADS (Non-intrusive, appears at bottom of screen)
    HOME_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx', // Replace with real AdMob ID
    QUIZ_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    RESULTS_BANNER: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',

    // INTERSTITIAL ADS (Full screen, shown between quiz sessions)
    QUIZ_COMPLETE_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    SESSION_END_INTERSTITIAL: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',

    // REWARDED ADS (Users watch to unlock premium questions)
    UNLOCK_QUESTIONS_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    PREMIUM_TRIAL_REWARD: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
};

// Test Ad Unit IDs (Use for development - AdMob detects these automatically)
export const TEST_AD_UNIT_IDS = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

// ============ BANNER ADS ============
export const HomeBannerAd = () => {
    if (Platform.OS === 'web') {
        return null;
    }

    return (
        <View
            style={{
                width: '100%',
                minHeight: 56,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
            }}
        >
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>Ads temporarily disabled in this build</Text>
        </View>
    );
};

// ============ INTERSTITIAL ADS (Shows between sessions) ============
export const showInterstitialAd = async () => {
    return false;
};

// ============ REWARDED ADS (Premium content unlock) ============
export const showRewardedAd = async () => {
    // Keep API shape for existing flows that expect a reward object.
    return { type: 'stub', amount: 1 };
};

// ============ AD SCHEDULING ============
// Show interstitial every few quiz sessions (non-intrusive)
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

// ============ MONETIZATION STRATEGY ============
/*
REVENUE MODEL (Apple & Google Compliant):

1. **Banner Ads (Non-intrusive)**
   - Place at bottom of home screen
   - Quick question review modes
   - YIELD: $0.50-2.00 per 1000 impressions (CPM)

2. **Interstitial Ads (Between Sessions)**
   - Show after every 3 completed quizzes
   - Full-screen, user can close
   - YIELD: $2-8 per 1000 impressions (higher CPM)

3. **Rewarded Ads (User-initiated)**
   - "Watch ad to unlock 10 premium questions"
   - "Watch ad for 24-hour premium trial"
   - User gets instant reward
   - YIELD: $5-15 per 1000 impressions (highest CPM)

4. **Optional Premium Subscription** (Future)
   - Remove all ads
   - Unlock exclusive question packs
   - Family sharing features
   - $2.99-4.99/month or $19.99/year

EXPECTED REVENUE (per 1000 active users/month):
- Ad-only model: $500-2000/month
- With 10% premium conversion: $800-3000/month
- With 20% premium conversion: $1000-4000/month
*/
