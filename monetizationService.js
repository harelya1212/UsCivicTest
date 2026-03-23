// Monetization & Premium Features Logic

import { upgradeToPremium, checkPremiumStatus } from './firebaseServices';

export class PremiumManager {
    constructor(uid) {
        this.uid = uid;
        this.isPremium = false;
    }

    async checkStatus() {
        this.isPremium = await checkPremiumStatus(this.uid);
        return this.isPremium;
    }

    async upgradePremium(durationMonths = 1) {
        try {
            const result = await upgradeToPremium(this.uid, durationMonths);
            this.isPremium = true;
            return result;
        } catch (error) {
            console.error('Upgrade failed:', error);
            throw error;
        }
    }

    // Unlock logic - check if user can access content
    canAccessPremiumContent(contentType = 'questions') {
        return this.isPremium;
    }
}

// ============ QUESTION PACKS (Monetization Strategy) ============
export const QUESTION_PACKS = {
    free: {
        id: 'free',
        name: 'Free Questions',
        description: 'Core civics questions (ad-supported)',
        questionCount: 50,
        price: 0,
        requiresPremium: false,
        requiresReward: false,
    },
    stateMastery: {
        id: 'state_specific',
        name: 'State-Specific Questions',
        description: 'Customized questions for your state',
        questionCount: 100,
        price: 2.99,
        requiresPremium: true,
        requiresReward: false,
    },
    interviewPrep: {
        id: 'interview_prep',
        name: 'Interview Prep Bundle',
        description: 'Real interview scenario questions',
        questionCount: 150,
        price: 4.99,
        requiresPremium: true,
        requiresReward: false,
    },
    spaceRepetition: {
        id: 'space_rep',
        name: 'Spaced Repetition Pack',
        description: 'AI-optimized review questions',
        questionCount: 200,
        price: 6.99,
        requiresPremium: true,
        requiresReward: false,
    },
    dailyUnlock: {
        id: 'daily_unlock',
        name: 'Daily Bonus (Free with Ad)',
        description: 'Unlock 10 bonus questions - watch 30 second ad',
        questionCount: 10,
        price: 0,
        requiresPremium: false,
        requiresReward: true,
    },
};

// ============ AD-FREE CONVERSIONS ============
export const PREMIUM_TIERS = {
    free: {
        name: 'Free (Ad-Supported)',
        price: 0,
        features: [
            'Core civics questions',
            'Basic progress tracking',
            'Family challenges',
            'Performance analytics',
            'Ads between sessions',
        ],
    },
    monthly: {
        name: 'Premium Monthly',
        price: 2.99,
        billingPeriod: 'month',
        features: [
            'Everything in Free',
            'Ad-free experience',
            'State-specific questions',
            'Interview preparation',
            'Unlimited question packs',
            'Priority support',
        ],
    },
    annual: {
        name: 'Premium Annual',
        price: 19.99,
        billingPeriod: 'year',
        savings: '44%',
        features: [
            'Everything in Premium Monthly',
            'Early access to new features',
            'Offline mode (download questions)',
            'Custom study plans',
            'Family group sharing',
        ],
    },
};

// ============ REVENUE TRACKING / ANALYTICS ============
export const trackMonetizationEvent = async (eventType, data = {}) => {
    // Send to analytics service (Firebase Analytics, Mixpanel, Amplitude, etc.)
    console.log(`[MONETIZATION] ${eventType}:`, data);

    // You can integrate with Firebase Analytics:
    // analytics().logEvent(eventType, data);
};

export const logAdImpression = (adType, adUnit) => {
    trackMonetizationEvent('ad_impression', {
        adType,
        adUnit,
        timestamp: new Date(),
    });
};

export const logAdClick = (adType) => {
    trackMonetizationEvent('ad_click', {
        adType,
        timestamp: new Date(),
    });
};

export const logRewardedAdCompletion = (rewardType, rewardAmount) => {
    trackMonetizationEvent('rewarded_ad_complete', {
        rewardType,
        rewardAmount,
        timestamp: new Date(),
    });
};

export const logPremiumConversion = (tier, price) => {
    trackMonetizationEvent('premium_conversion', {
        tier,
        price,
        timestamp: new Date(),
        revenue: price,
    });
};

// ============ REVENUE OPTIMIZATION FORMULAS ============
/*
ARPU (Average Revenue Per User) = Total Revenue / Total Users
ARPPU (Average Revenue Per Paying User) = Total Revenue / Paying Users
LTV (Lifetime Value) = ARPU × Average User Lifetime
CAC (Customer Acquisition Cost) = Marketing Spend / New Customers

GOAL for Civics Coach:
- ARPU: $2-5/user/month
- Conversion Rate: 10-20% of free users upgrade
- LTV: $50-100 per user
*/
