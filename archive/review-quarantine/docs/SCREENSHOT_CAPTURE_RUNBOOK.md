# Screenshot Capture Runbook
## Civic Citizenship

**Purpose:** Step-by-step simulator/emulator capture runbook for App Store and Google Play screenshots  
**Target Use:** Phase 4 asset capture day

---

## Capture Order

Use this exact order:
1. Home screen
2. Interview mode
3. Quiz question
4. Feedback / follow-up
5. Progress / profile

This order matches the asset brief and capture checklist.

---

## Before Launching Simulators

- [ ] Use latest app code
- [ ] Ensure no debug overlays or red screens
- [ ] Prepare test details so home screen looks realistic
- [ ] Prepare at least one progress-rich state
- [ ] Ensure Interview CTA is visible on Home
- [ ] Ensure one interview scoring state and one follow-up state can be reached quickly

---

## iOS Capture Runbook

### Device Target
- iPhone 6.1-inch equivalent
- Export target: 1170x2532

### Shot 1: Home
- Open Home tab
- Confirm test details card is visible
- Confirm quiz CTA and interview CTA are both visible
- Capture and save as `assets/store/ios/ios-01-home.png`

### Shot 2: Interview
- Tap Interview CTA
- Stop on prompt or recording-ready state
- Ensure question text and recording UI are visible
- Capture and save as `assets/store/ios/ios-02-interview.png`

### Shot 3: Quiz
- Return Home
- Start Quiz
- Stop on a clean multiple-choice question
- Ensure progress bar is visible
- Capture and save as `assets/store/ios/ios-03-quiz.png`

### Shot 4: Feedback / Follow-Up
- Answer a question or advance interview to scoring
- Prefer a screen with visible grade/feedback or follow-up prompt
- Capture and save as `assets/store/ios/ios-04-feedback.png`

### Shot 5: Progress / Profile
- Open Profile or progress-heavy screen
- Ensure visible stats: streak, accuracy, totals, or progress
- Capture and save as `assets/store/ios/ios-05-progress.png`

---

## Android Capture Runbook

### Device Target
- Phone target
- Export target: 1080x1920

### Shot 1: Home
- Open Home tab
- Capture and save as `assets/store/android/android-01-home.png`

### Shot 2: Interview
- Open Interview prompt or recording screen
- Capture and save as `assets/store/android/android-02-interview.png`

### Shot 3: Quiz
- Open a clean quiz question screen
- Capture and save as `assets/store/android/android-03-quiz.png`

### Shot 4: Feedback / Follow-Up
- Capture score/follow-up state
- Save as `assets/store/android/android-04-feedback.png`

### Shot 5: Progress / Profile
- Capture stats/progress screen
- Save as `assets/store/android/android-05-progress.png`

---

## Overlay Pass

After raw captures:
- [ ] Apply overlay copy from `STORE_ASSET_PRODUCTION_BRIEF.md`
- [ ] Keep one headline per image
- [ ] Keep support line short
- [ ] Maintain consistent placement and spacing
- [ ] Export final versions back to platform folders

---

## Quick Quality Rules

- No blurry text
- No cut-off buttons
- No empty states
- No visible debugging tools
- No misleading mock content
- Keep the UI readable first; overlays second

---

## Final Verification

- [ ] iOS folder contains 5 final PNGs
- [ ] Android folder contains 5 final PNGs
- [ ] Files match naming convention
- [ ] Screens match the order in `STORE_ASSET_PRODUCTION_BRIEF.md`
- [ ] Assets reviewed before upload

---

## Related Files
- `STORE_ASSET_PRODUCTION_BRIEF.md`
- `STORE_ASSET_CAPTURE_CHECKLIST.md`
- `assets/store/ios/`
- `assets/store/android/`

---

**Status:** Ready for capture operator use  
**Next Step:** Run captures and export final PNGs into `assets/store/ios/` and `assets/store/android/`
