# Sprint 3 Execution Batch Plan

Date: 2026-04-10
Sprint: Sprint 3 (Weeks 5-6)
Theme: Listen-and-Go + ADHD Focus Pack

## Objective
Ship Sprint 3 in small, testable batches while Sprint 2 device smoke is deferred by local simulator availability.

## Batch 1 (Kickoff): Audio Playback Core
Status: in progress

Progress update (2026-04-10):
- Implemented Listen mode launch from Home into Quiz flow
- Implemented Quiz TTS play/repeat control
- Implemented Quiz speed toggle (0.75x, 1.0x, 1.25x)
- Added analytics events for play/repeat/speed change

Validation update (2026-04-10):
- `node scripts/test-interview-scoring.mjs` -> 12/12 passed
- `node scripts/comprehensive-scoring-tests.mjs` -> 40/40 passed
- `node scripts/unseen-phrasing-scoring-tests.mjs` -> 30/30 passed
- `node scripts/test-smartQueue.mjs` -> 28 passed
- `npx expo export --platform web` -> Exported `dist`
- Remaining: manual in-app Listen mode walkthrough + analytics payload spot-check

Scope:
- Implement TTS playback for question prompt in Listen mode
- Add speed controls (0.75x, 1.0x, 1.25x)
- Add repeat action for current question
- Add analytics events for play, pause, repeat, and speed change

Acceptance criteria:
- Prompt plays and can be repeated without navigation reset
- Speed changes apply immediately to subsequent playback
- Playback controls are accessible and do not block answer flow
- No regressions in Interview or Quiz mode navigation

Validation:
- Manual Listen mode pass for 10 questions
- Existing regression suites remain green:
  - `node scripts/test-interview-scoring.mjs`
  - `node scripts/comprehensive-scoring-tests.mjs`
  - `node scripts/unseen-phrasing-scoring-tests.mjs`
  - `node scripts/test-smartQueue.mjs`

## Batch 2: Queue + Resume Reliability
Status: planned

Scope:
- Implement screen-off-friendly queue handling where OS permits
- Persist exact resume pointer (question id + position context)
- Restore queue state on app relaunch

Acceptance criteria:
- Resume returns to exact question and context
- Queue progression remains stable after app background/foreground
- No duplicate queue entries after resume

Validation:
- Manual background/foreground stress pass (>=5 cycles)
- Resume verification from at least 3 different queue positions

## Batch 3: ADHD Focus Pack UI
Status: planned

Scope:
- Low-clutter mode toggle
- Step pacing and micro-goals
- Break nudge timing and display behavior

Acceptance criteria:
- Focus-pack toggles can be enabled/disabled without progress loss
- UI remains readable and consistent on small mobile screens
- Nudge cadence follows pacing settings

Validation:
- Manual UX pass on compact and regular device sizes
- Verify state persistence after app restart

## Batch 4: Integration + QA Closure
Status: planned

Scope:
- Wire Listen quick action on Home for final Sprint 3 flow
- Complete Sprint 3 analytics event audit
- Run full regression + Sprint 3 smoke checklist

Acceptance criteria:
- Home Listen CTA launches Sprint 3 flow directly
- Event payloads match taxonomy and are backward compatible
- Sprint 3 definition-of-done checks pass

Validation:
- Full regression suite
- Sprint 3 smoke checklist pass
- Documentation updates in tracker + plan dashboard

## Dependencies and Risks
- iOS simulator availability remains a known local risk for device smoke evidence.
- Audio behavior may vary across OS versions; keep feature flags available if needed.
- Persisted resume state must remain schema-compatible with existing queue data.

## Next Immediate Action
Start Batch 1 implementation: TTS playback controls and event instrumentation.
