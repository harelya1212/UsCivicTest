# Sprint 3 Manual Runtime Test Script (One-Page)

Date: 2026-04-10
Goal: Close remaining Sprint 3 manual validation in one fast pass.
Runtime target: Expo app on simulator/device (or web + native where possible).

## Preflight (2 minutes)
- Open app to Home.
- Open Admin once and tap `Refresh Events`.
- Confirm no crash and UI renders.

## A) Listen Flow + Analytics (Batch 1)
Target time: 4-6 minutes

1. Home: tap `Start Listen Mode`.
2. Quiz Q1: tap `Play / Repeat` once.
3. Quiz Q1: tap `Speed` until it cycles through `0.75x`, `1.0x`, `1.25x`.
4. Quiz Q1: answer any option.
5. Quiz Q2-Q3: repeat steps 2-4 quickly.
6. Go to Admin: tap `Refresh Events`.
7. Verify non-zero events exist for:
   - `home_listen_cta_clicked`
   - `quiz_tts_played`
   - `quiz_tts_repeated`
   - `quiz_tts_speed_changed`
   - `quiz_listen_auto_advanced`
8. (Optional fast seed) tap `Send Listen Validation Events`, then `Refresh Events`.

Pass criteria:
- Audio plays/repeats without blocking answer flow.
- Speed change takes effect on next playback.
- Auto-advance events appear when listen flow runs hands-free.
- Admin funnel shows listen event activity.

## B) Resume Stress >=5 Cycles (Batch 2)
Target time: 5-7 minutes

1. Start a Quiz (listen mode or standard).
2. Answer until at least Q3.
3. Put app to background, wait 3-5 seconds, return to foreground.
4. Confirm same question context and progress remain correct.
5. Repeat steps 3-4 for 5 total cycles.
6. During one cycle, background app while TTS is playing.
7. Confirm no stuck audio after return and app remains responsive.

Pass criteria:
- Exact question context resumes every cycle.
- No duplicate queue jumps or resets.
- No lingering TTS playback after background transition.

## C) Focus/Classic + Pacing + Break Nudge (Batch 3)
Target time: 5-7 minutes

1. In Quiz header, toggle `Focus` and `Classic` twice.
2. Confirm image/helper text hide in Focus and return in Classic.
3. Answer 3 questions and verify step goal progression updates.
4. Continue to 6 answered questions.
5. On feedback view, verify break nudge appears.
6. Open Admin and tap `Refresh Events`.
7. Verify non-zero events for:
   - `quiz_focus_mode_toggled`
   - `quiz_step_goal_reached`
   - `quiz_break_nudge_shown`

Pass criteria:
- Toggle does not lose progress.
- Step goal increments correctly with answers.
- Break nudge appears at expected cadence.

## D) Recovery Campaign (Sprint 4)
Target time: 6-8 minutes

1. Complete or load a weak-score Review state (<70%).
2. In Review, locate `3-Session Recovery Path` card.
3. Tap `Start Recovery Session 1/3` and confirm it launches without rewarded ad gate.
4. Complete the recovery quiz and return to Review.
5. Verify Step 1 timestamp is populated.
6. Tap `Start Recovery Session 2/3` and confirm rewarded flow is used.
7. Complete session and verify Step 2 timestamp is populated.
8. Tap `Start Recovery Session 3/3`, complete it, and verify Step 3 timestamp.
9. Open Admin and tap `Refresh Recovery Metrics`.
10. Verify Admin shows 3/3 complete and all step timestamps.

Pass criteria:
- Session 1 is ad-light and sessions 2-3 are rewarded-gated.
- Recovery progress persists across returns to Review.
- Review and Admin timestamps match completed steps.

## Final Closeout (1 minute)
- If all pass criteria are met, mark all Sprint 3 + Sprint 4 manual validation checkboxes complete in tracker.
- If any step fails, capture: step number, expected vs actual, and screenshot.
