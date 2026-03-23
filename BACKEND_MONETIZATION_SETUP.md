
# 🚀 CIVICS COACH - Backend & Monetization Setup Guide

## Overview
This guide covers the FREE-tier backend (Firebase) and monetization (Google AdMob) setup. Total cost: $0 (forever on free tier).

---

## 🔥 FIREBASE SETUP (Backend - Free Tier)

### Step 1: Create Firebase Project
1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"**
3. Name: `civics-coach-app`
4. Continue (disable analytics for now - can add later)
5. Click **Create Project**

### Step 2: Configure Firestore Database
1. In Firebase console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Location: Choose closest to your users
4. **Start in test mode** (for development)
5. Click **Create**

### Step 3: Enable Authentication
1. Go to **Build** → **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google Sign-in** for easy login

### Step 4: Get Your Firebase Config
1. In Firebase console, click the settings gear (⚙️) → **Project settings**
2. Scroll to **Your apps** section
3. Click the **Web** icon (if not shown, click **Add app** → **Web**)
4. Copy the Firebase config object
5. Replace the placeholder in `firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "civics-coach-app",
  storageBucket: "civics-coach-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://civics-coach-app.firebaseio.com"
};
```

### Step 5: Setup Firestore Security Rules (Important!)
1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with this for development (secure later for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - each user can access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Subcollections - quiz history, etc
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

---

## 📱 GOOGLE AdMOB SETUP (Monetization - Free)

### Step 1: Register AdMob Account
1. Go to **https://admob.google.com**
2. Click **Sign Up** (use same Google account as Firebase)
3. For app name, use "Civics Coach"
4. Choose **Android** and/or **iOS**
5. Accept terms and continue

### Step 2: Create Ad Unit IDs
1. In AdMob, go to **Apps** → **Add App**
2. Choose your platform (iOS first)
3. Enter app info:
   - App name: `Civics Coach`
   - App category: `Education`
4. Click **Create app** → **Continue**
5. Create ad units (banner, interstitial, rewarded)
6. **Copy each Ad Unit ID** and update in `adMobService.js`

### Step 3: Get Your Publisher Account ID
1. Go to **AdMob Settings** → **Account Settings**
2. Copy your **Publisher ID** (starts with `ca-app-pub-`)
3. This is used in app.json for Expo

### Step 4: Update app.json with AdMob ID
Open `app.json` and add:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "userTrackingPermission": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ]
  }
}
```

---

## 💰 MONETIZATION STRATEGY

### Revenue Model (Apple & Google Approved)

#### 1. **Banner Ads** (Bottom of Home Screen)
- Non-intrusive, always visible
- Low revenue but high impression count
- Best for: Free users
- CPM: $0.50-2.00

#### 2. **Interstitial Ads** (Between Quiz Sessions)
- Full-screen ads shown every 3 quizzes
- User can skip after 5 seconds
- Higher revenue potential
- CPM: $2-8

#### 3. **Rewarded Ads** (Highest Value!)
- "Watch ad to unlock 10 bonus questions"
- User chooses to watch
- Highest revenue + best user sentiment
- CPM: $5-15
- **Don't force these** - optional only!

#### 4. **Premium Subscription** (Future)
```
Free: $0 (ad-supported)
  ✓ Core civics questions
  ✓ Family dashboard
  ✓ Progress tracking
  ✗ Limited to 50 questions

Premium Monthly: $2.99
  ✓ Everything in Free
  ✓ Ad-free experience
  ✓ 100+ question packs
  ✓ State-specific questions
  ✓ Interview prep mode

Premium Annual: $19.99 (save 45%)
  ✓ Everything in Monthly
  ✓ Offline mode (download)
  ✓ Custom study plans
  ✓ Family group sharing
```

### Expected Revenue (Per 1,000 Active Users/Month)

| Scenario | Monthly Revenue | Annual |
|----------|----------------|---------|
| Ad-only (100% users) | $600-2,000 | $7,200-24,000 |
| 10% premium conversion | $900-3,000 | $10,800-36,000 |
| 20% premium conversion | $1,200-4,000 | $14,400-48,000 |

---

## 🎯 INTEGRATION CHECKLIST

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Authentication enabled
- [ ] Firebase config added to `firebaseConfig.js`
- [ ] Firestore rules configured
- [ ] AdMob account created
- [ ] Ad Unit IDs obtained
- [ ] AdMob IDs added to `adMobService.js`
- [ ] app.json updated with AdMob plugin
- [ ] Test ads showing in development
- [ ] Payment processor integrated (Stripe/RevenueCat - optional)

---

## 🧪 TESTING

### Test Firebase
1. Uncomment imports in `App.js`
2. Run app: `npm start`
3. Create test account
4. Verify quiz data saves to Firestore

### Test AdMob
1. Use TEST Ad Unit IDs (already configured)
2. Build to iOS/Android
3. Verify ads appear correctly
4. **Switch to LIVE Ad Unit IDs only after app release**

---

## ⚠️ IMPORTANT NOTES

1. **Never hardcode real Ad Unit IDs in development** - use TEST IDs
2. **Firestore free tier limits**: 50K reads/day, 20K writes/day (plenty for MVP)
3. **Setup auto-delete old quiz history** to save database quota
4. **Monitor AdMob earnings** - can vary 20-30% monthly
5. **Best practices for ad placement**:
   - Don't show interstitial on first quiz
   - Don't show banner on quiz screens
   - Always provide option to remove ads with premium
   - Never force rewarded ads

---

## 📊 FIRESTORE DATA STRUCTURE

```
users/
  {userId}/
    - userName
    - email
    - points
    - level
    - streak
    - isPremium
    - createdAt
    - familyMembers[] (array of connected family)
    quizHistory/ (subcollection)
      {quizId}/
        - type (highschool, naturalization100, etc)
        - score
        - accuracy
        - answeredAt
        - weakAreas

familyGroups/
  {groupId}/
    - name
    - createdBy
    - members[]
    - createdAt

analytics/
  revenue/
    - daily earnings
    - user counts
    - conversion rates
```

---

## 🚀 NEXT STEPS

1. **Complete Firebase setup above**
2. **Get AdMob Test IDs for testing**
3. **Switch to LIVE AdMob IDs when deploying to App Store/Play Store**
4. **Monitor earnings dashboard** (AdMob Reports section)
5. **A/B test ad placements** for optimal revenue/UX
6. **Setup payment processor** (Stripe/RevenueCat) for premium subscriptions

---

## 💬 SUPPORT

- Firebase docs: https://firebase.google.com/docs
- AdMob help: https://support.google.com/admob
- Expo AdMob: https://docs.expo.dev/versions/latest/sdk/admob/
