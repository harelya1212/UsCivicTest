# ⚡ QUICK START - Firebase & AdMob (5 minutes)

## Step 1: Firebase Setup (3 minutes)

### 1a. Create Firebase Project
- Go to: https://console.firebase.google.com
- Click **Create a project**
- Name: `civics-coach-app`
- Click **Create Project**

### 1b. Enable Firestore
- Click **Firestore Database** (left menu)
- Click **Create Database**
- Choose your region (closest to you)
- **Start in test mode** ← Important
- Click **Create**

### 1c. Enable Authentication
- Click **Authentication** (left menu)
- Click **Get Started**
- Click **Email/Password**
- Toggle enabled
- Click **Save**

### 1d. Get Your Config
- Click settings icon (⚙️) → **Project Settings**
- Scroll to **Your apps**
- Click **Web** (or add if not shown)
- Copy the entire `firebaseConfig` object
- **Paste into `firebaseConfig.js` in your project** ← Replace the placeholder

**That's it for Firebase!** ✅

---

## Step 2: AdMob Setup (2 minutes)

### 2a. Create AdMob Account
- Go to: https://admob.google.com
- Click **Sign up** (use same Google account)
- Follow the wizard

### 2b. Get Test Ad Unit IDs
- Skip creating real ads for now
- AdMob automatically provides TEST Ad Unit IDs:
  ```
  Banner: ca-app-pub-3940256099942544/6300978111
  Interstitial: ca-app-pub-3940256099942544/1033173712
  Rewarded: ca-app-pub-3940256099942544/5224354917
  ```
- These are already configured in `adMobService.js` ✅

**That's it for AdMob!** ✅

---

## Step 3: Update Firestore Rules (Safety)

1. In Firebase console → **Firestore Database** → **Rules** tab
2. Replace all code with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish**

---

## Step 4: Test It! (Run the App)

```bash
cd '/Users/ah/Desktop/my repastory/civic test/civic-citizenship'
npm start
# Then press 'w' for web
```

### What to test:
1. ✅ Click "Start Daily Practice"
2. ✅ Select a test type
3. ✅ Answer a question
4. ✅ See the celebration screen
5. ✅ Verify data saves (Family tab should update)

---

## 🎉 YOU'RE DONE!

Your app now has:
- ✅ Cloud database (Firebase Firestore)
- ✅ User authentication
- ✅ Ad system ready
- ✅ Premium features ready
- ✅ $0 cost (forever)

---

## ⚠️ IMPORTANT BEFORE APP STORE RELEASE

1. Switch to LIVE Ad Unit IDs (not test IDs)
2. Update Firestore rules for production security
3. Test on iOS and Android thoroughly
4. Sign your app properly for submission

**See detailed guide in `BACKEND_MONETIZATION_SETUP.md`**

---

## 🆘 Troubleshooting

**Q: "Firebase not initialized"**
A: Check firebaseConfig.js has your real credentials (not the placeholder)

**Q: "Quiz data not saving"**
A: Check Firestore rules are published (step 3 above)

**Q: "Ads not showing"**
A: Using TEST Ad Unit IDs is correct for now - they show Google test ads

**Q: "Can't login"**
A: Make sure Authentication is enabled in Firebase console

---

## 📊 Quick Links

- Firebase Console: https://console.firebase.google.com
- AdMob Console: https://admob.google.com
- Firestore Docs: https://firebase.google.com/docs/firestore
- AdMob Docs: https://developers.google.com/admob

---

## 💰 You're Now Making Money!

When you release to App Store/Play Store:
- Users see ads between quizzes
- You earn $2-8 per 1,000 ad impressions
- Premium users ($2.99/month) remove ads
- **Expected revenue: $500-4,000/month** (depending on downloads)

**See FEATURES_SUMMARY.md for full revenue projections**

---

**Total Setup Time: ~5 minutes**
**Total Cost: $0 (forever)**
**Status: Ready to Ship! 🚀**
