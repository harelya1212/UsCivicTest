# Firebase Analytics Verification

## Current Implementation

The app now sends analytics through a shared sink with two behaviors:

1. Web with Firebase GA4 configured
- Events go to Firebase Analytics using the Firebase web SDK.
- Requirement: `measurementId` must be present in `firebaseConfig.js`.

2. Expo/native dev builds or missing `measurementId`
- Events are mirrored to Firestore collection: `analytics_debug_events`
- This provides immediate verification even when Firebase Analytics DebugView is not available in the current runtime.

## Event Sources Wired

- `app_open`
- `screen_view`
- `quiz_started`
- `question_answered`
- `interview_started`
- `interview_prompt_played`
- `interview_response_submitted`
- `interview_score_revealed`
- `interview_followup_scored`
- `interview_completed`
- `home_interview_cta_clicked`

## Immediate Verification Path

Use this path now with the current Expo/native setup.

You can verify in-app from the Admin tab as well.

### Admin Panel Shortcut

Open Admin tab and use the `Analytics Verification` card:

1. Tap `Send Test Event`
2. Tap `Refresh Events`
3. Confirm recent entries appear in the list
4. Review the `Recent Funnel Snapshot` counts for quiz/interview flow events

The panel reads from Firestore collection `analytics_debug_events`.

### 1. Start the app

Run:

```bash
npm start
```

Then open the app in Expo Go, simulator, or emulator.

### 2. Trigger analytics events

Minimum flow to verify:

1. Launch app
2. Navigate Home → Interview
3. Start an interview question
4. Submit one response
5. Open Quiz and answer one question

### 3. Verify in Firebase Console

Open Firestore in your Firebase project and check collection:

`analytics_debug_events`

Expected document fields:

- `eventName`
- `params`
- `platform`
- `createdAt`
- `createdAtIso`
- `debugBuild`

### 4. Expected events

You should see at least:

- `app_open`
- `screen_view`
- `home_interview_cta_clicked`
- `interview_started`
- `interview_response_submitted`
- `question_answered`

## Full Firebase Analytics DebugView Path

To use true Firebase Analytics DebugView instead of Firestore mirror:

### Requirement

Add a valid GA4 measurement ID to `firebaseConfig.js`:

```js
measurementId: 'G-XXXXXXXXXX'
```

### Verification Steps

1. Ensure the Firebase project has Analytics enabled
2. Add the real `measurementId`
3. Run the app on web or migrate to a native-supported Firebase Analytics SDK
4. Open Firebase Console → Analytics → DebugView
5. Trigger events in the app
6. Confirm events appear live

## Important Constraint

The current repo uses Expo managed workflow plus Firebase web SDK. In that setup, Firebase Analytics DebugView is only directly feasible on web when `measurementId` is configured. For Expo/native development, the Firestore debug mirror is the immediate verification mechanism unless the app adopts a native Firebase Analytics SDK.

## Launch Readiness Checklist

- [x] Shared analytics sink implemented
- [x] Core events wired in app flows
- [x] Firestore debug mirror enabled
- [ ] Real Firebase `measurementId` added
- [ ] DebugView verified in Firebase Analytics
- [ ] Event dashboard created