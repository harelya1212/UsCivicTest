# Phase 4: Home Integration & Analytics Setup
## Kickoff Document

**Phase Timeline:** Mar 28 - Mar 31, 2026  
**Status:** 🟢 EXECUTION READY  
**Deliverables:** Home CTA + Analytics tracking + Store assets + release prep

---

## Phase 4 Objectives

### Primary Deliverables
1. ✅ **Home Screen Integration** 
   - Add Interview Mode CTA button
   - Style consistent with design system
   - Navigate to InterviewScreen
   - Analytics event: `home_interview_cta_clicked`

2. ✅ **Analytics Event Tracking**
   - Implement all required Firebase events
   - Track user engagement across all screens
   - Validate events firing correctly in Firestore mirror / Firebase
   - Use Admin verification panel and verification runbook

3. 📸 **App Store Assets Creation**
   - 5-12 screenshots (iOS: 1170×2532)
   - 2-8 screenshots (Android: 1080×1920)
   - Feature graphic (Android: 1024×500)
   - All text overlays explaining features

4. 🔄 **End-to-End Testing & Release Prep**
   - Complete flow: Home → Quiz → Interview
   - Test all quiz features
   - Test interview mode + follow-ups
   - Test analytics tracking
   - Prepare production build, smoke test, and submission sequence

### Success Criteria
- [x] Interview CTA appears on Home screen
- [x] Navigation to Interview works
- [ ] Analytics events verified in Firestore mirror / Firebase
- [ ] Store screenshots created
- [ ] End-to-end test completed without bugs
- [ ] Release-day build and QA runbooks ready

---

## Daily Breakdown

### Day 11 (Mar 28): Home Screen Integration
**Focus**: Add Interview CTA button to HomeScreen

- [x] Add Interview CTA button after main Quiz CTA
- [x] Implement navigation to InterviewScreen
- [x] Add analytics event: `home_interview_cta_clicked`
- [x] Style button consistent with design system
- [ ] Test on iPhone & Android
- [ ] Commit ready changes to git

**Code Changes**:
- File: `screens/HomeScreen.js`
  - Add button with Material icon (🎤 or 📝)
  - Text: "Start Interview Mode" or "Try Interview Mode"
  - Navigation: `navigation.navigate('Interview')`
  - Styling: Match existing CTA button (ctaButton style)

### Day 12 (Mar 29): Analytics Event Setup
**Focus**: Implement Firebase event tracking

- [x] Define all event names in constants.js
- [x] Implement event firing for:
  - `screen_view` - on each screen navigation
  - `quiz_started` - when quiz begins
  - `question_answered` - on each question
  - `interview_started` - when interview begins
  - `interview_completed` - when interview finishes
  - `interview_followup_scored` - when follow-up answered
  - `home_interview_cta_clicked` - when user clicks interview button
- [ ] Verify events in Firestore mirror / Firebase console
- [ ] Verify event properties (screen, timestamp, session metadata)
- [x] Add shared logging sink and Admin verification panel

**Code Changes**:
- File: `constants.js` - Add event name constants
- File: `HomeScreen.js` - Track Interview CTA clicks
- File: `InterviewScreen.js` - Track interview events
- File: `QuizScreen.js` - Track quiz events
- File: `analyticsService.js` - Mirror events for debug verification
- File: `screens/AdminScreen.js` - Add analytics verification UI
- Validate: `analytics_debug_events` and Admin panel show events

### Day 13 (Mar 30): Integration Testing
**Focus**: Validate all features work end-to-end

- [ ] Test: Home → Start Quiz → Complete question → Back
- [ ] Test: Home → Start Interview → Record answer → Score → Next
- [ ] Test: Home → Interview → Get C/D grade → See follow-up → Score follow-up
- [ ] Test: Verify all analytics events fire correctly
- [ ] Test: Multiple complete quiz sessions
- [ ] Performance test: App startup time <5s
- [ ] Memory test: No memory leaks
- [ ] Use `FIREBASE_ANALYTICS_VERIFICATION.md` during validation

**Test Coverage**:
- Home screen loads
- Quiz mode starts cleanly
- Interview mode starts cleanly
- Audio recording works
- Scoring works
- Follow-ups appear for C/D
- Progress persists
- No console errors

### Day 14 (Mar 31): Screenshot & Asset Creation
**Focus**: Create app store marketing assets

Reference brief: `STORE_ASSET_PRODUCTION_BRIEF.md`
Execution runbook: `SCREENSHOT_CAPTURE_RUNBOOK.md`
Tracking checklist: `STORE_ASSET_CAPTURE_CHECKLIST.md`

**iOS Screenshots (5-12 images, 1170×2532 each)**:
- [ ] 1: Welcome/home screen showing test details
- [ ] 2: Quiz question interface
- [ ] 3: Quiz results with feedback
- [ ] 4: Interview mode recording screen
- [ ] 5: Interview results and score
- [ ] Add text overlays: "Learn civics by answering questions", "Voice interviews with instant feedback", "Adaptive learning with follow-ups"

**Android Screenshots (2-8 images, 1080×1920 each)**:
- [ ] Same 5 as iOS (can scale down slightly)
- [ ] Add Android-specific text

**Feature Graphic (Android, 1024×500)**:
- [ ] App icon on left
- [ ] Text: "Civic Citizenship" + tagline
- [ ] Professional design, colorful, eye-catching

**Optional Preview Video (15-30 sec)**:
- [ ] Show: home → start interview → record voice → get score → see feedback
- [ ] Format: MP4, H.264
- [ ] Size: <500MB

### Day 15 (Apr 1-2): Final Testing & Documentation
**Focus**: Validate everything ready for Phase 5

- [ ] Complete end-to-end test with new Interview CTA
- [ ] Verify all analytics events present in Firestore mirror / Firebase
- [ ] Run full test suite: `npm run validate:sprint1`
- [ ] Check for console errors
- [ ] Performance: Startup, load times, memory
- [ ] Run production build preflight and credential checks
- [ ] Execute final smoke test checklist
- [ ] Use release-day command sheet for build/submission sequence

**Validation Checklist**:
- Interview mode works end-to-end
- Follow-ups appear and score correctly
- Analytics tracking functional
- Store assets created and reviewed
- No blocking issues for Phase 5
- Code ready for production build
- Build and submission runbooks reviewed

---

## Implementation: Add Interview CTA to HomeScreen

### Step 1: Find the Right Location in HomeScreen
The Interview CTA should go right after the main "Start Practice Quiz" button (around line 275).

### Step 2: Add Analytics Tracking Function
Add handler function to track Interview CTA click and navigate.

### Step 3: Update HomeScreen Imports
Ensure InterviewScreen is available for navigation.

---

## Implementation: Analytics Event Tracking

### Events to Track
```javascript
// Firebase events required:
app_open                          // When app launches
screen_view                       // When user navigates to screen
quiz_started                      // When quiz begins
question_answered                 // After each question
quiz_completed                    // When quiz finishes
interview_started                 // When interview mode starts
interview_completed               // When interview finishes
interview_followup_scored         // When follow-up answered
home_interview_cta_clicked        // When Interview CTA tapped
```

### Properties to Include
- `timestamp`: When event occurred
- `user_id`: User identifier (if logged in)
- `screen_name`: Current screen
- `question_number`: Which question (for Q-specific events)
- `grade`: Grade received (A/B/C/D for scoring events)
- `session_id`: Session identifier for grouping events

---

## File Changes Summary

### Phase 4 Files to Modify/Create

| File | Change | Priority |
|------|--------|----------|
| `screens/HomeScreen.js` | Add Interview CTA button | 🔴 HIGH |
| `constants.js` | Add analytics event names | 🔴 HIGH |
| `screens/InterviewScreen.js` | Add event tracking | 🔴 HIGH |
| `screens/QuizScreen.js` | Add event tracking | 🟡 MED |
| `firebaseServices.js` | Ensure tracking implemented | 🟡 MED |

---

## Testing Checklist

### Functional Testing
- [ ] Interview button appears on home screen
- [ ] Click Interview CTA → navigates to Interview
- [ ] Interview mode loads questions
- [ ] Record button works
- [ ] Scoring works (A/B/C/D grades)
- [ ] Follow-ups appear for C/D grades
- [ ] Follow-up scoring works
- [ ] Can complete full interview without crashes

### Analytics Testing
- [ ] Firebase console shows events
- [ ] `home_interview_cta_clicked` event fires
- [ ] `interview_started` event fires
- [ ] `interview_completed` event fires
- [ ] `interview_followup_scored` events fire
- [ ] All events have required properties
- [ ] User sessions group correctly

### Device Testing
- [ ] iPhone 12 (iOS 14+)
- [ ] iPhone 15 Pro (iOS 17+)
- [ ] iPhone SE (iOS 13+, smaller screen)
- [ ] iPad (landscape)
- [ ] Pixel 7 (Android 13)
- [ ] Galaxy A10 (Android 9, low-end)
- [ ] Network: WiFi and cellular

### Performance Testing
- [ ] App startup: <5 seconds
- [ ] Question load: <2 seconds
- [ ] Recording response: <1 second
- [ ] Scoring response: <3 seconds
- [ ] Memory: <200MB
- [ ] No memory leaks (30-min session)
- [ ] No runaway CPU/battery

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Interview screen crashes on load | Test thoroughly on all devices before commits |
| Analytics doesn't track correctly | Test Firebase integration early (Day 12) |
| Screenshots don't look good | Create multiple versions, get feedback |
| Performance issues discovered late | Perf test early (Day 13) |
| Code not ready for build by Apr 8 | Code freeze by Apr 3 (5 days buffer) |

---

## Dependencies

### Must Be Complete Before Phase 4
- ✅ Phase 2 (Rubric enrichment, scoring engine)
- ✅ Phase 3 (Follow-up questions, conditional flow)
- ✅ Interview mode features complete

### Must Be Complete By End of Phase 4
- ✅ Home screen integration
- ✅ Analytics event tracking
- ✅ Store assets creation
- ✅ End-to-end testing
- ✅ Code ready for production build

### Not Required Until Phase 5
- Production IPA/APK builds
- App store submission
- Legal documents hosted
- Final QA testing

---

## Sign-Off Criteria

**Phase 4 Is Complete When:**
1. Interview CTA appears on HomeScreen and navigates correctly
2. Analytics events firing in Firebase (all required events)
3. Store screenshots created and reviewed (5+ iOS, 2+ Android)
4. End-to-end test: Home → Interview → Follow-up → Next Question works
5. No console errors or crashes
6. All code committed to `main` branch
7. Ready for Phase 5 (production build)

---

## Success Metrics

### By End of Day 11
- [ ] Interview CTA visible on Home screen
- [ ] Navigation to Interview works
- [ ] Basic analytics event tracked

### By End of Day 12
- [ ] All analytics events defined in constants
- [ ] Events firing in Firebase console
- [ ] Firebase dashboards created

### By End of Day 13
- [ ] Full end-to-end flow works without crashes
- [ ] All analytics events appearing
- [ ] Performance acceptable

### By End of Day 15 (Phase 4 Complete)
- [ ] Code ready for Phase 5 production build
- [ ] Store assets created
- [ ] All testing passed
- [ ] No blocking issues

---

## Communication Plan

### Daily Standup (Team)
- Each team member: What completed yesterday, what's today's goal, any blockers
- 15 minutes max

### End of Day (Individual)
- Commit code changes with clear message
- Update this document with progress
- Note any issues discovered

### End of Phase (Full Team)
- Phase 4 completion review
- Blockers for Phase 5?
- Ready to proceed with production build?

---

## Reference Documents

- [APP_STORE_SUBMISSION_PLAN.md](APP_STORE_SUBMISSION_PLAN.md) - Full store requirements
- [STORE_SUBMISSION_CHECKLIST.md](STORE_SUBMISSION_CHECKLIST.md) - Week-by-week checklist
- [FIREBASE_ANALYTICS_VERIFICATION.md](FIREBASE_ANALYTICS_VERIFICATION.md) - Analytics validation flow
- [STORE_ASSET_PRODUCTION_BRIEF.md](STORE_ASSET_PRODUCTION_BRIEF.md) - Store asset brief
- [STORE_ASSET_CAPTURE_CHECKLIST.md](STORE_ASSET_CAPTURE_CHECKLIST.md) - Asset tracking list
- [SCREENSHOT_CAPTURE_RUNBOOK.md](SCREENSHOT_CAPTURE_RUNBOOK.md) - Screenshot capture steps
- [PRODUCTION_BUILD_PREFLIGHT.md](PRODUCTION_BUILD_PREFLIGHT.md) - Build-day readiness gate
- [FINAL_QA_SMOKE_TEST_CHECKLIST.md](FINAL_QA_SMOKE_TEST_CHECKLIST.md) - Release validation steps
- [RELEASE_DAY_COMMAND_SHEET.md](RELEASE_DAY_COMMAND_SHEET.md) - Build and submission command sequence
- [SPRINT_2_PHASES_2_3_SUMMARY.md](SPRINT_2_PHASES_2_3_SUMMARY.md) - Completed features reference

---

**Document Created**: March 27, 2026  
**Phase 4 Starts**: March 28, 2026  
**Phase 4 Ends**: March 31, 2026  
**Next Phase**: Phase 5 (Apr 1-2, Production Build & Submission)
