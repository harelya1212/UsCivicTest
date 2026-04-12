# Day 12 Plan - Analytics Event Tracking & Firebase Dashboard Setup

**Date**: March 29, 2026  
**Phase**: Phase 4 Analytics Foundation  
**Duration**: 1 full day  
**Status**: 🟢 READY TO EXECUTE

---

## Overview

Today we establish comprehensive analytics tracking for Interview Mode and other app events. By end of day:
- ✅ All analytics events fire correctly
- ✅ Firebase console displays real-time events
- ✅ Firestore debug mirror captures all events
- ✅ Analytics dashboard created for KPI monitoring

---

## Task 1: Firebase Configuration Validation (30 min)

### 1.1 Update Firebase Credentials

**File**: `firebaseConfig.js`

```javascript
// Get your real credentials from Firebase Console:
// https://console.firebase.google.com

const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",              // ← Replace
    authDomain: "YOUR_PROJECT.firebaseapp.com", // ← Replace
    projectId: "YOUR_PROJECT_ID",               // ← Replace
    storageBucket: "YOUR_PROJECT.appspot.com",  // ← Replace
    messagingSenderId: "YOUR_SENDER_ID",        // ← Replace
    appId: "YOUR_APP_ID",                       // ← Replace
    databaseURL: "https://YOUR_PROJECT.firebaseio.com", // ← Replace
    measurementId: "G-YOUR_MEASUREMENT_ID"      // ← IMPORTANT for web analytics
};
```

**How to Get These:**
1. Go to: https://console.firebase.google.com
2. Click your project
3. Settings → Project Settings
4. Copy credentials from "Web" app section
5. For measurementId: Google Analytics → Admin → Property Settings

### 1.2 Enable Google Analytics in Firebase

If not enabled:
1. Firebase Console → Analytics
2. Click "Enable Google Analytics"
3. Accept terms
4. Wait 2-3 minutes for initialization
5. Get Measurement ID and add to firebaseConfig.js

### 1.3 Verify Imports in App.js

Check that these imports exist:
```javascript
import { logAppAnalyticsEvent } from './analyticsService';
import { APP_EVENT_NAMES } from './constants';
```

---

## Task 2: Verify Event Tracking Implementation (45 min)

### 2.1 Check HomeScreen Analytics Integration

**File**: `screens/HomeScreen.js` (lines 336-351)

```javascript
// Interview CTA Button
<TouchableOpacity
  style={styles.interviewCtaButton}
  onPress={() => {
    clearPausedSession();
    trackAppEvent(APP_EVENT_NAMES.HOME_INTERVIEW_CTA_CLICKED, {  // ← Verify
      from_screen: 'HomeTab',
    });
    navigation.navigate('Interview');
  }}
  activeOpacity={0.8}
>
```

**Verification**:
- [ ] trackAppEvent function exists in context
- [ ] APP_EVENT_NAMES.HOME_INTERVIEW_CTA_CLICKED is defined
- [ ] Event includes from_screen parameter
- [ ] Navigate happens after event logged

### 2.2 Check AppDataContext Event Logging

**File**: `context/AppDataContext.js`

Verify trackAppEvent exists and looks similar to:
```javascript
const trackAppEvent = async (eventName, params = {}) => {
  try {
    await logAppAnalyticsEvent(eventName, params);
  } catch (error) {
    console.error('Analytics event failed:', eventName, error);
  }
};
```

### 2.3 Verify All Event Names Are Defined

**File**: `constants.js`

Check these APP_EVENT_NAMES exist:
```javascript
export const APP_EVENT_NAMES = Object.freeze({
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  QUIZ_STARTED: 'quiz_started',
  QUESTION_ANSWERED: 'question_answered',
  INTERVIEW_STARTED: 'interview_started',
  INTERVIEW_PROMPT_PLAYED: 'interview_prompt_played',
  INTERVIEW_RESPONSE_SUBMITTED: 'interview_response_submitted',
  INTERVIEW_SCORE_REVEALED: 'interview_score_revealed',
  INTERVIEW_FOLLOWUP_SCORED: 'interview_followup_scored',
  INTERVIEW_COMPLETED: 'interview_completed',
  HOME_INTERVIEW_CTA_CLICKED: 'home_interview_cta_clicked',
  ADMIN_DEBUG_PING: 'admin_debug_ping',
});
```

---

## Task 3: Testing Event Firing (1 hour)

### 3.1 iOS Simulator Testing

```bash
# Start simulator with debug mode enabled
npm start
# Select 'i' for iOS Simulator

# In app:
1. Open Developer Menu (Cmd+D in simulator)
2. Click "Toggle Remote JS Debugging" to enable console
3. Navigate to HomeScreen
4. Open browser DevTools (in debugger window)
5. Go to Console tab
6. Tap Interview CTA button
7. Check console for: "[Analytics]" logs
```

**Expected Console Output**:
```
[Analytics] Logging event: home_interview_cta_clicked
[Analytics] Event logged to Firebase Analytics
[Analytics] Event also mirrored to Firestore debug collection
```

### 3.2 Check Firestore Debug Mirror

1. Firebase Console → Firestore Database
2. Look for collection: `analytics_debug_events`
3. Should see recent documents with:
   - `eventName: "home_interview_cta_clicked"`
   - `params: { from_screen: "HomeTab" }`
   - `createdAt: <timestamp>`
   - `debugBuild: true`

### 3.3 Android Emulator Testing

```bash
npm start
# Select 'a' for Android Emulator

# In emulator:
1. Open Android dev menu (Cmd+M or Ctrl+M)
2. Enable "Debug mode"
3. Open Chrome DevTools: chrome://inspect
4. Tap Interview CTA
5. Check console for analytics logs
```

### 3.4 Real Device Testing (iPhone)

**Requirements**: Expo Go app installed
```bash
npm start
# Scan QR code with iPhone camera
# Build will load on device

# Open JS debugger in browser
1. Navigate to HomeScreen
2. Tap Interview CTA
3. Check browser console
4. Verify Firestore shows event
```

---

## Task 4: Firebase Analytics Dashboard Setup (45 min)

### 4.1 Create Basic Dashboard

1. Firebase Console → Analytics → Realtime
   - You should see live event stream
   - Filter by event_name = "home_interview_cta_clicked"
   - Verify it fires when you tap button

### 4.2 Create Custom Dashboard

1. Firebase Console → Analytics → Dashboard
2. Create new custom dashboard
3. Add widgets:
   - **Event Count**: home_interview_cta_clicked (last 7 days)
   - **User Count**: Active users triggering the event
   - **Event Parameter**: from_screen distribution
   - **User Retention**: Day 1 retention of users who tap CTA

### 4.3 Create Funnels

1. Analytics → Explorations → Funnel
2. Create funnel: App Open → HomeScreen View → Interview CTA Click → Interview Start
3. Track conversion rates at each step

### 4.4 Create Segments

1. Analytics → Segments
2. Create segment: "Interview CTA Users" 
   - Users who tapped home_interview_cta_clicked
3. Create segment: "High-Engagement Users"
   - Users who clicked CTA + Completed Interview

---

## Task 5: Verify End-to-End Event Flow (30 min)

### 5.1 Complete User Journey Test

1. Open app → App opens (app_open event)
2. View HomeScreen → screen_view event
3. Tap Interview CTA → home_interview_cta_clicked event
4. Video plays → interview_prompt_played event
5. Submit response → interview_response_submitted event
6. Reveal score → interview_score_revealed event
7. Continue to follow-up → interview_followup_scored event
8. Complete → interview_completed event

### 5.2 Check Event Chain in Firebase

1. Realtime → Filter by user_id
2. See events appear in order
3. All events have correct parameters
4. No events are missing

### 5.3 Check Firestore Debug Mirror

1. Firestore → analytics_debug_events collection
2. Should have ~8 documents (one per event)
3. All have timestamps and parameters
4. No malformed events

---

## Deliverables

### By End of Day 12:

1. ✅ **Firebase Credentials Updated**
   - firebaseConfig.js with real credentials

2. ✅ **Events Firing Correctly**
   - All APP_EVENT_NAMES events fire
   - home_interview_cta_clicked verified

3. ✅ **Firestore Debug Mirror Active**
   - analytics_debug_events collection populated
   - Last 10 events visible

4. ✅ **Firebase Analytics Dashboard**
   - Custom dashboard created
   - Real-time events visible
   - Funnel tracking set up
   - Segments created

5. ✅ **Documentation**
   - Event catalog document created
   - Testing results recorded
   - Dashboard screenshots captured

---

## Debugging Checklist

If analytics don't fire:
- [ ] Check firebaseConfig.js credentials are real (not demo keys)
- [ ] Check Firebase project has Analytics enabled
- [ ] Check measurementId is correct
- [ ] Check Platform.OS detection (web vs native)
- [ ] Check __DEV__ flag (should be true in simulator)
- [ ] Check Firestore permission rules allow writes

If Firestore debug mirror doesn't populate:
- [ ] Verify db reference is initialized
- [ ] Check Firestore rules allow collection writes
- [ ] Check analytics_debug_events collection exists
- [ ] Look for errors in console

If Firebase Analytics shows no data:
- [ ] Wait 2-3 hours (sometimes takes time)
- [ ] Check Realtime explorer for events
- [ ] Verify measurementId is correct
- [ ] Check Google Analytics settings

---

## Success Criteria

✅ **PASS if**:
1. home_interview_cta_clicked event fires when button tapped
2. Event appears in Firebase Realtime dashboard within 5 minutes
3. Event appears in Firestore analytics_debug_events within 10 seconds
4. Custom dashboard shows event count > 0
5. Funnel shows Interview CTA as part of user journey
6. Segments identify "Interview CTA Users" with count > 0

❌ **FAIL if**:
1. Event doesn't fire at all
2. Event doesn't reach Firebase
3. Event parameters are missing or malformed
4. Firebase dashboard shows no events after 2+ hours
5. Firestore debug mirror is empty
6. Console shows error logs when firing event

---

## Rollover to Day 13

Once Day 12 is complete:
- [ ] All analytics events verified
- [ ] Firebase dashboard operational
- [ ] Firestore debug mirror working
- [ ] Ready for Day 13: End-to-End Testing

**Day 13 Focus**: 
- Complete full user journey (Home → Interview → Complete)
- Verify analytics flow
- Validate all events fire in sequence
- Prepare for production build
