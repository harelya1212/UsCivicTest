# Sprint 2 Execution Plan: Interview Mode v1
**Status:** 🚀 LAUNCHING (Mar 27, 2026)  
**Duration:** ~3 weeks (Apr 1 — Apr 21)  
**Objective:** Deliver spoken-prompt interview format with rubric scoring and follow-up questions

---

## Vision & Success Criteria

### What We're Building
A new learning modality where students answer civics questions via **spoken response** instead of multiple choice. The app plays the question, captures their answer, scores it against a rubric, and asks intelligent follow-ups to deepen understanding.

### Why It Matters
- **Engagement:** Spoken interaction feels more natural and conversational
- **Assessment Quality:** Free-response answers reveal deeper understanding gaps than MC
- **Differentiator:** Separates from traditional test prep (positioning for B2B edu partners)
- **Analytics:** New funnel data (attempt→response quality→follow-up receptivity) informs monetization

### Success Metrics
- ✅ Spoken prompts play reliably (audio delivery latency < 500ms)
- ✅ Answer capture works offline and online (graceful fallback)
- ✅ Rubric scoring matches expected grade distribution (A/B/C/D)
- ✅ Follow-up quality correlates with initial answer quality
- ✅ Interview flow completion rate ≥ 70% (vs. Quiz ~85%)
- ✅ Analytics tracks funnel: attempt → response → follow-up → result

---

## Feature Breakdown

### Feature 1: Spoken Prompt Delivery (POC)
**User Story:** As a student, I hear a civics question read aloud so I can focus on thinking rather than reading.

**Acceptance Criteria:**
- [ ] Question text is converted to speech using device TTS (native iOS/Android)
- [ ] Audio plays at 1.0x speed by default
- [ ] User can tap "Repeat" to hear question again (up to 3x)
- [ ] Prompt can be paused during audio playback
- [ ] Playback starts automatically when Interview screen loads

**Technical Scope:**
- Use native TTS APIs:
  - iOS: `AVSpeechSynthesizer`
  - Android: `TextToSpeech`
  - React Native bridge: Expo `expo-speech` or custom module
- Audio persists across screen rotations
- Graceful fallback to text-only if TTS unavailable

**DependsOn:** None (can start immediately)

---

### Feature 2: Answer Capture & Validation (POC)
**User Story:** As a student, I can speak my answer and the app captures it so I don't have to type.

**Acceptance Criteria:**
- [ ] "Start Recording" button appears after question prompt finishes
- [ ] Audio recording starts/stops cleanly with visual feedback (animated recording indicator)
- [ ] Captured audio is encoded (WAV or AAC) and stored locally
- [ ] User can playback their recording before submission
- [ ] User can re-record up to 3 times before committing
- [ ] Recording times out after 90 seconds
- [ ] Submission only enabled if recording > 3 seconds

**Technical Scope:**
- Use React Native audio libraries:
  - `expo-av` for recording/playback
  - Store locally in app cache or Documents folder
  - Minimal file size (AAC or lossy format)
- UI: Animated record button + waveform visualizer during capture
- Validation: Check duration before allowing submit

**DependsOn:** None (can start concurrently with Feature 1)

---

### Feature 3: Rubric Scoring Engine (Lite)
**User Story:** As the app, I grade the student's spoken answer in real-time against a scoring rubric so they get instant feedback.

**Acceptance Criteria:**
- [ ] Rubric schema supports 4-level scoring (Advanced/Proficient/Developing/Emerging = A/B/C/D)
- [ ] Rubric criteria are stored in question bank alongside question + answer
- [ ] Scoring algorithm returns grade + explanatory feedback (< 100 chars)
- [ ] Score distribution across 100 sample answers matches expected bell curve
- [ ] Scoring is deterministic (same answer = same score)
- [ ] Instructor can override score if needed (future; flag for now)

**Technical Scope:**
- Add `rubric` object to question bank schema:
  ```json
  {
    "id": "q123",
    "question": "...",
    "rubric": {
      "A": "Identifies main idea + two supporting examples",
      "B": "Identifies main idea + one example",
      "C": "Attempts answer but incomplete reasoning",
      "D": "Off-topic or no relevant content"
    }
  }
  ```
- Scoring engine (v1): Simple keyword-matching + length heuristic
  - Future (v2): LLM-based scoring (OpenAI API)
  - For now: Manual tagging of answer keywords and required concepts
- Feedback template: "Good start! You mentioned [keyword]. Next time, try also explaining..."

**DependsOn:** Questions must have rubric metadata (add during CSV import phase)

---

### Feature 4: Follow-Up Question Generation
**User Story:** As a student, after my answer is scored, I get a smart follow-up question based on what I missed so I can deepen my learning.

**Acceptance Criteria:**
- [ ] Follow-up question appears only if initial score is C or D
- [ ] Follow-up content is contextually relevant to student's weakness (not random)
- [ ] Follow-up uses different modality (e.g., if main was spoken, follow-up could be MC or image-based)
- [ ] Student can opt out of follow-up
- [ ] Follow-up score rolls into session mastery calculation

**Technical Scope:**
- Add `followUp` field to question schema:
  ```json
  {
    "id": "q123_followup_weak",
    "relatedTo": "q123",
    "triggerGrade": "C,D",
    "type": "multipleChoice",  // or "matchingPair", "imageSelect", etc.
    "content": "..."
  }
  ```
- Question bank loader must link follow-ups with parents
- Interview screen logic: After score, query for follow-up candidates and display

**DependsOn:** Question bank must have follow-up metadata

---

### Feature 5: Home Screen Quick Action + Entry Point
**User Story:** As a student, I see an "Interview Mode" button on Home so I can easily start a spoken-answer session.

**Acceptance Criteria:**
- [ ] Home screen has visible "Interview Mode" CTA (button or card)
- [ ] Tapping opens quick-mode Interview (3 random questions, 5 min time limit)
- [ ] Interview mode is launched via `navigation.navigate('Interview', {...})`
- [ ] Home screen tracks interview attempt in analytics
- [ ] Follow-up to Interview result shows "Continue to Mastery Map" or "Home" option

**Technical Scope:**
- Modify HomeScreen.js:
  - Add interview CTA button below Quiz button
  - Add tap handler: `trackAdEvent(AD_EVENT_NAMES.INTERVIEW_STARTED)`
  - Navigate: `navigation.navigate('Interview', { mode: 'quick' })`
- Create new screen: `InterviewScreen.js` (will be fleshed out in later features)
- Update nav params validator in navigationValidators.js

**DependsOn:** Spoken prompt + answer capture + rubric scoring

---

### Feature 6: Interview Funnel Analytics
**User Story:** As a product team, I can see drop-off rates across the interview funnel so we can optimize for completion.

**Acceptance Criteria:**
- [ ] Events tracked:
  - `INTERVIEW_STARTED` (user taps Interview button)
  - `INTERVIEW_PROMPT_PLAYED` (question audio plays)
  - `INTERVIEW_RECORDING_STARTED` (user hits record)
  - `INTERVIEW_RESPONSE_SUBMITTED` (user submits answer)
  - `INTERVIEW_SCORE_REVEALED` (rubric score shown)
  - `INTERVIEW_FOLLOWUP_SHOWN` (follow-up question appears)
  - `INTERVIEW_FOLLOWUP_COMPLETED` (student answers follow-up)
  - `INTERVIEW_SESSION_COMPLETED` (all questions done)
- [ ] Each event includes session ID, question ID, timestamp, device info
- [ ] Admin dashboard can filter by event and date range
- [ ] Funnel visualization shows completion % at each stage

**Technical Scope:**
- Add event names to constants.AD_EVENT_NAMES:
  ```js
  AD_EVENT_NAMES = {
    // ... existing events
    INTERVIEW_STARTED: 'interview_started',
    INTERVIEW_PROMPT_PLAYED: 'interview_prompt_played',
    INTERVIEW_RECORDING_STARTED: 'interview_recording_started',
    INTERVIEW_RESPONSE_SUBMITTED: 'interview_response_submitted',
    INTERVIEW_SCORE_REVEALED: 'interview_score_revealed',
    INTERVIEW_FOLLOWUP_SHOWN: 'interview_followup_shown',
    INTERVIEW_FOLLOWUP_COMPLETED: 'interview_followup_completed',
    INTERVIEW_SESSION_COMPLETED: 'interview_session_completed',
  }
  ```
- Call `trackAdEvent()` at each stage in InterviewScreen
- Firebase Analytics integration (existing setup; just add new events)
- Admin screen: Add "Interview Funnel" chart

**DependsOn:** All other Interview features (events emit throughout flow)

---

## Implementation Roadmap

### Phase 1: POC Foundation (Days 1-5)
**Goal:** Get working prototype of spoken prompt + answer capture

**Tasks:**
1. [ ] Set up Expo TTS module + verify APIs available in current SDK
2. [ ] Create `InterviewScreen.js` skeleton with prompt playback
3. [ ] Implement audio recording with Expo AVAudioSession
4. [ ] Add recording UI (button + animation)
5. [ ] Test end-to-end: prompt plays → record → submit

**Output:** Runnable screen showing prompt audio + capturing spoken response

---

### Phase 2: Rubric & Scoring (Days 6-10)
**Goal:** Add scoring engine and show grades

**Tasks:**
1. [ ] Design rubric schema (A/B/C/D criteria)
2. [ ] Update question bank CSV with rubric metadata (first 10 questions)
3. [ ] Build scoring engine (v1: keyword-matching heuristic)
4. [ ] Create score reveal UI (grade badge + feedback text)
5. [ ] Add score → Interview context state management
6. [ ] Test scoring accuracy on sample answers

**Output:** Interview screen shows grade + feedback after response

---

### Phase 3: Follow-Ups & Variants (Days 11-15)
**Goal:** Add intelligent follow-up question logic

**Tasks:**
1. [ ] Design follow-up question schema
2. [ ] Create follow-up questions for first 10 main questions
3. [ ] Build conditional logic (show follow-up if score ≤ C)
4. [ ] Implement follow-up answer handling (may be MC, not spoken)
5. [ ] Add follow-up score to session mastery
6. [ ] Test follow-up triggering and scoring

**Output:** Interview session can span main + follow-up questions

---

### Phase 4: Home Integration + Analytics (Days 16-20)
**Goal:** Make it accessible and tracked

**Tasks:**
1. [ ] Add Interview CTA to HomeScreen
2. [ ] Implement navigation from Home → Interview
3. [ ] Add interview event names to constants
4. [ ] Emit events at each funnel stage
5. [ ] Update navigationValidators.js with interview params
6. [ ] Add interview funnel chart to Admin screen
7. [ ] Test end-to-end: Home tap → full interview → analytics logged

**Output:** Live in-app Interview Mode with analytics tracking

---

### Phase 5: Polish + Launch (Days 21+)
**Goal:** Refinement and platform-specific tuning

**Tasks:**
1. [ ] iOS TTS voices + speed controls
2. [ ] Android TTS performance + fallback
3. [ ] Recording quality: test on low-end devices
4. [ ] Error handling: no mic permission, TTS unavailable, offline
5. [ ] Accessibility: screen reader support for buttons + feedback
6. [ ] Performance: measure bundle size impact of audio libs
7. [ ] A/B test: Interview vs. Quiz completion rates
8. [ ] Launch announcement + onboarding

**Output:** Production-ready Interview Mode v1

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     HomeScreen.js                           │
│  [Quiz Button] [Interview Button] [Mastery Map Button]     │
└──────────────────────┬──────────────────────────────────────┘
                       │ tap Interview
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   InterviewScreen.js                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Prompt Phase:                                        │   │
│  │  - Display question text                             │   │
│  │  - Play audio via TTS (expo-speech)                  │   │
│  │  - [Repeat] button (plays again)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼ user taps "Record"                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Recording Phase:                                     │   │
│  │  - Start audio capture (expo-av)                     │   │
│  │  - Show animated record button + timer               │   │
│  │  - On stop: playback for preview                     │   │
│  │  - [Submit] / [Re-Record] buttons                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼ user taps "Submit"                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Scoring Phase:                                       │   │
│  │  - Send response to scoring engine                   │   │
│  │  - Calculate grade (A/B/C/D) + feedback              │   │
│  │  - Show score badge + explanation                    │   │
│  │  - Emit INTERVIEW_SCORE_REVEALED analytics event     │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│              ┌────────┴─────────┐                            │
│              ▼                  ▼                            │
│         Score A/B              Score C/D                     │
│         [Next Q]               [Attempt Follow-Up?]          │
│              │                  │                            │
│              └────────┬─────────┘                            │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Follow-Up Phase (if triggered):                      │   │
│  │  - Display follow-up question (may be MC, not TTS)   │   │
│  │  - Handle answer (could be different modality)       │   │
│  │  - Score follow-up answer                            │   │
│  │  - Emit INTERVIEW_FOLLOWUP_COMPLETED event           │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Session Complete:                                    │   │
│  │  - Show interview summary (X/Y correct)              │   │
│  │  - Update mastery map with new data                  │   │
│  │  - Emit INTERVIEW_SESSION_COMPLETED event            │   │
│  │  - [View Mastery] / [Home] buttons                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                       
                    Analytics Events:
                    - INTERVIEW_STARTED (from Home tap)
                    - INTERVIEW_PROMPT_PLAYED (audio starts)
                    - INTERVIEW_RECORDING_STARTED (user records)
                    - INTERVIEW_RESPONSE_SUBMITTED (answer sent)
                    - INTERVIEW_SCORE_REVEALED (grade shown)
                    - INTERVIEW_FOLLOWUP_SHOWN (follow-up appears)
                    - INTERVIEW_FOLLOWUP_COMPLETED (answer graded)
                    - INTERVIEW_SESSION_COMPLETED (session end)
                       ▼
                    Admin Dashboard
                    Funnel visualization: see drop-off at each stage
```

---

## Dependencies & Prerequisites

### Required by Sprint 2
| Item | Status | ETA |
|------|--------|-----|
| Expo SDK with TTS support | ✅ Verified | Now |
| Audio recording libs (expo-av) | ✅ Verified | Now |
| Question bank CSV with rubric metadata | 🔄 In progress | Apr 2 |
| Navigation validators updated | 🔄 In progress | Apr 1 |
| Interview event names in constants | 🔄 In progress | Apr 1 |

### Blockers
- ❌ None currently. Sprint 1 provided all guardrails and standards.

---

## State Management Plan

### New Context Fields (in AppDataContext)
```js
const [interviewSession, setInterviewSession] = useState({
  sessionId: UUID,
  mode: 'quick' | 'full',  // quick = 3 questions; full = all
  currentQuestionIndex: 0,
  questions: [],
  responses: [
    {
      questionId: 'q123',
      recordingPath: '/cache/...',
      grade: 'A',
      feedback: 'Great job...',
      attemptedFollowUp: true,
      followUpId: 'q123_followup_weak',
      followUpGrade: 'B',
    }
  ],
  startedAt: timestamp,
  completedAt: null,
});
```

### New Navigation Params
- `InterviewScreen`: `{ mode: 'quick' | 'full', questionIds: [] }`
- Validated by `validateInterviewParams()` in navigationValidators.js

### New Context Methods
```js
const startInterviewSession = (mode, questions) => {...}
const recordInterviewResponse = (questionId, recordingPath) => {...}
const submitInterviewAnswer = (questionId) => {...}  // triggers scoring
const recordFollowUpResponse = (followUpId, answer) => {...}
const completeInterviewSession = () => {...}
```

---

## Testing & Validation Plan

### Unit Tests
- [ ] Rubric scoring algorithm: 10 sample answers → expected grades
- [ ] Follow-up triggering logic: test C/D branching
- [ ] Navigation params validation: invalid params rejected

### Integration Tests
- [ ] Full interview flow: prompt → record → score → follow-up → complete
- [ ] Analytics events emitted at each stage
- [ ] Mastery map updated after interview session
- [ ] No crashes or permission errors

### End-to-End Tests (Manual)
- [ ] TTS plays on iOS + Android
- [ ] Recording works on low-end devices
- [ ] Offline recording captured + synced when online
- [ ] Admin dashboard shows funnel data correctly
- [ ] Home CTA visible + navigates correctly

### Regression (Must Not Break)
- [ ] Quiz mode still works (quiz flow independent)
- [ ] Mastery map updates from both quiz + interview modes
- [ ] Monetization events unaffected (no new ad blocking)
- [ ] Login/onboarding flow unchanged

---

## File Changes Checklist

### New Files to Create
- [ ] `screens/InterviewScreen.js` (main interview container)
- [ ] `screens/InterviewPromptPhase.js` (TTS + prompt display)
- [ ] `screens/InterviewRecordingPhase.js` (audio recording UI)
- [ ] `screens/InterviewScoringPhase.js` (grade + feedback display)
- [ ] `screens/InterviewFollowUpPhase.js` (follow-up question handler)
- [ ] `utils/interviewScoringEngine.js` (rubric scoring logic)
- [ ] `utils/interviewHelpers.js` (session ID generation, question loading)

### Modified Files
- [ ] `App.js` — Add Interview screen to Stack navigator
- [ ] `HomeScreen.js` — Add Interview CTA button + event tracking
- [ ] `constants.js` — Add INTERVIEW_* event names
- [ ] `utils/navigationValidators.js` — Add `validateInterviewParams()`
- [ ] `civicsQuestionBank.js` — Load rubric metadata on import
- [ ] `AdminScreen.js` — Add Interview funnel chart

### Updated Documentation
- [ ] `SPRINT_2_STATE_ADDITIONS.md` (context fields, methods, params)
- [ ] Interview mode how-to in README.md

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TTS unavailable on some devices | Medium | Could ship text-only fallback; hide Interview mode | Test on 5+ devices; implement graceful fallback in TTS wrapper |
| Audio recording permission denied | Low | Session fails | Request permission on screen entry; show friendly error |
| Rubric scoring inaccuracy | Medium | Bad student experience | Use human-graded sample set to validate heuristics; v2 upgrade to LLM |
| Performance impact of audio libs | Low | App slowdown | Monitor bundle size; lazy-load audio modules |
| Follow-up questions poorly matched | Medium | Reduces follow-up value | Carefully curate first 10 follow-ups; iterate based on data |

---

## Success Handoff Criteria

Sprint 2 is complete when:
1. ✅ Spoken prompts play reliably (tested on iOS + Android)
2. ✅ Audio recording works and stores locally
3. ✅ Rubric scoring matches expected accuracy (90%+ on sample set)
4. ✅ Follow-up triggering works correctly (C/D grades only)
5. ✅ Home screen Interview CTA visible and functional
6. ✅ All 8 interview events tracked in analytics
7. ✅ No regressions in quiz or monetization flows
8. ✅ Interview funnel visible in Admin dashboard
9. ✅ Documentation updated and accessible to future teams
10. ✅ Code review passed with zero critical issues

---

## Next Steps

### Immediate (Today)
1. Break down Feature 1 (Spoken Prompts) into granular tasks
2. Set up branch `sprint-2-interview-mode`
3. Begin POC: Expo TTS integration + InterviewScreen skeleton

### This Week
1. Complete Phase 1 POC (prompt + recording)
2. Update question bank CSV with rubric data
3. Begin Phase 2 (scoring engine)

### By End of Sprint (Apr 21)
1. All 5 features implemented
2. Funnel analytics live in Admin dashboard
3. Ready for soft launch (internal testing)

---

**Owner:** Engineering Team  
**Stakeholders:** Product (feature scope), Design (UI/UX), Analytics (funnel tracking), Customer Success (educator feedback)  
**Review Date:** Apr 14 (mid-sprint check-in)

