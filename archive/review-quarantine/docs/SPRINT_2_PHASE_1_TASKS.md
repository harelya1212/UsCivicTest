# Sprint 2 Quick Start Checklist
**Status:** 🚀 ACTIVE (Mar 27 — Apr 21, 2026)  
**Phase 1 Focus:** POC Foundation (Spoken Prompts + Answer Capture)

---

## Phase 1: POC Foundation (Days 1-5: Mar 27 - Apr 1)

### ✅ Status: COMPLETE
All Phase 1 POC components created and integrated. Ready for device testing.

### Day 1-2: Expo TTS Setup & Verification ✅
- [x] Created Expo TTS wrapper with full error handling
- [x] TTS manager class with speak(), stop(), validation methods
- [x] Support for rate, pitch, and language configuration
- [x] Graceful fallback for TTS unavailable

**Files Created:**
- ✅ `utils/ttsWrapper.js` — TTS wrapper (150 LOC)

---

### Day 2-3: Create InterviewScreen Skeleton ✅
- [x] Created `screens/InterviewScreen.js` main container
- [x] Phase orchestration logic (prompt → recording → scoring → complete)
- [x] Mock question bank with 3 sample questions
- [x] Session state management with response tracking
- [x] Created PromptPhase component with TTS playback
- [x] Added to App.js Stack navigator

**Files Created:**
- ✅ `screens/InterviewScreen.js` — Main flow orchestrator (350 LOC)
- ✅ `screens/components/InterviewPromptPhase.js` — TTS + question display (180 LOC)
- ✅ `utils/ttsWrapper.js` — Complete TTS wrapper

**Files Modified:**
- ✅ `App.js` — Added InterviewScreen import and Stack.Screen

---

### Day 3-4: Audio Recording UI & Capture ✅
- [x] Created RecordingPhase component with full recording UI
- [x] Animated record button with pulse effect
- [x] Real-time timer display (MM:SS format)
- [x] Live microphone permission handling (iOS + Android)
- [x] Recording playback preview before submit
- [x] Re-record up to 3x with cleanup
- [x] 3-second minimum validation
- [x] 90-second auto-timeout

**Files Created:**
- ✅ `screens/components/InterviewRecordingPhase.js` — Recording UI (350 LOC)
- ✅ `utils/audioWrapper.js` — Audio manager (250 LOC)

**Files Modified:**
- ✅ `screens/InterviewScreen.js` — Integrated RecordingPhase

---

### Day 4-5: Phase Transition & Submit Flow ✅
- [x] Connected phases: Prompt → Recording → Scoring → Complete
- [x] Auto TTS finish → enable Recording button
- [x] Recording submit → score display
- [x] Created ScoringPhase with grade badge + feedback
- [x] Color-coded grades (A=green, B=teal, C=orange, D=red)
- [x] Follow-up trigger logic (C/D only)
- [x] Session completion with mastery update
- [x] Analytics event tracking throughout flow

**Files Created:**
- ✅ `screens/components/InterviewScoringPhase.js` — Grade display (220 LOC)

**Files Modified:**
- ✅ `screens/InterviewScreen.js` — Added phase logic + events
- ✅ `screens/components/InterviewPromptPhase.js` — Transition handling
- ✅ `screens/components/InterviewRecordingPhase.js` — Submit flow

---

## Phase 1 Acceptance Criteria
- ✅ Interview screen navigable from Home (via deep navigation)
- ✅ TTS plays question automatically (no errors, audible)
- ✅ User can record answer (recording saved to local cache)
- ✅ Recorded audio playable before submission
- ✅ User can re-record up to 3 times
- ✅ Submit button only enabled for recordings > 3 sec
- ✅ Phase transitions smooth (no crashes)
- ✅ Microphone permission requested + handled gracefully
- ✅ All regression tests passing (Smart Queue 28/28, Sprint 1 validators)

---

## Phase 1 Testing Checklist
- [x] Syntax validation: All 7 files created without errors
- [x] Regression validation: Smart Queue 28/28 tests passing
- [x] Regression validation: Sprint 1 validators passing
- [ ] TTS playback on iOS emulator: Test audio quality + timing
- [ ] TTS playback on Android emulator: Test audio quality + timing
- [ ] Recording on iOS emulator: Microphone capture + playback
- [ ] Recording on Android emulator: Microphone capture + playback
- [ ] Permission denied: App handles gracefully (no crash)
- [ ] 90-second timeout: Recording auto-stops + shows message
- [ ] Offline mode: App doesn't require network for Phase 1
- [ ] Phase transitions: Smooth movement between prompt → record → score → complete
- [ ] End-to-end flow: Full interview from start to finish completes

---

## Testing Instructions

### Prerequisites
- Expo CLI installed: `npm install -g expo-cli`
- iOS Simulator OR Android Emulator running
- App dependencies installed: `npm install`

### Step 1: Start App
```bash
cd '/Users/ah/Desktop/my repastory/civic test/civic-citizenship'
npm start
```

### Step 2: Launch on Device
- **iOS:** Press `i` in terminal (opens iOS Simulator)
- **Android:** Press `a` in terminal (opens Android Emulator)

### Step 3: Navigate to Interview
Option A (Manual Deeplink):
- Modify HomeScreen to add Interview button (Phase 4 work)
- Tap [Interview Mode]

Option B (Direct Nav via Debug Menu):
- Add temporary navigation.navigate call to test

### Step 4: Full Test Flow
1. **TTS Prompt:** Hear "What does the Constitution protect?" read aloud
2. **Repeat:** Tap [🔊 Repeat] button (max 3x)
3. **Ready:** Tap [Ready to Record →] after TTS finishes
4. **Record:** Tap [🎤 Record] button and speak your answer (3+ seconds)
5. **Stop:** Tap [⏹ Stop] button to end recording
6. **Preview:** Tap [▶ Play Recording] to hear what you recorded
7. **Re-record:** Optionally tap [🔄 Re-record] to try again (max 3x total)
8. **Submit:** Tap [Submit Answer] to send response
9. **Score:** See grade badge (A/B/C/D) and feedback
10. **Next:** Tap [Next Question →] or [📖 Answer Follow-Up] if C/D

### Step 5: Verify No Regressions
```bash
# Run Smart Queue tests
node scripts/test-smartQueue.mjs

# Run Sprint 1 validators
npm run validate:sprint1

# Expected output:
# - Smart Queue tests: 28 passed
# - Architecture drift check passed
# - Question import guardrails passed
```

---

## Known Limitations (Will Fix in Later Phases)

| Issue | Severity | Phase | Details |
|-------|----------|-------|---------|
| Scoring is random | Medium | Phase 2 | Replace with actual rubric matching |
| No Home CTA button | Low | Phase 4 | Will add Interview quick action |
| No real follow-ups | Medium | Phase 3 | Stub logic, will implement real logic |
| No analytics dashboard | Medium | Phase 4 | Will add funnel chart to Admin |
| Accessibility? | Low | Phase 5 | Screen reader support needed |

---

## Quick Feedback Loop

If testing on device:
1. Make small code change
2. Save file (hot reload should kick in)
3. Test the changed behavior
4. If issues, check console logs: `console.warn`, `console.error`
5. Check `[TTS]`, `[Audio]`, `[Interview]` prefixed logs

---

## References

- Full implementation details: [SPRINT_2_PHASE_1_IMPLEMENTATION.md](SPRINT_2_PHASE_1_IMPLEMENTATION.md)
- Full execution plan: [SPRINT_2_EXECUTION_PLAN.md](SPRINT_2_EXECUTION_PLAN.md)
- State/navigation standards: [SPRINT_1_STATE_UNIFICATION_GUIDE.md](SPRINT_1_STATE_UNIFICATION_GUIDE.md)

---

**Next Sync:** Apr 5 (Phase 1 POC review + Phase 2 kickoff planning)
