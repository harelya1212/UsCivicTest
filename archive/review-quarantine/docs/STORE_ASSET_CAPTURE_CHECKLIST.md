# Store Asset Capture Checklist
## Civic Citizenship

Use this checklist while capturing and exporting store assets.

---

## Output Folders
- iOS screenshots: `assets/store/ios/`
- Android screenshots: `assets/store/android/`
- Raw captures: `assets/store/raw/`
- Feature graphic: `assets/store/feature-graphic/`
- Preview video: `assets/store/video/`

---

## Raw Capture Preparation
- [ ] Use the current production-like build
- [ ] Disable notifications and popups
- [ ] Use seeded test data with visible progress
- [ ] Verify Home screen shows both Quiz and Interview CTA
- [ ] Verify Interview mode can reach score/follow-up states
- [ ] Verify Profile/Progress screen has non-empty stats
- [ ] Ensure no debug overlays or error banners are visible

---

## iOS Captures

### ios-01-home.png
- [ ] Capture Home screen
- [ ] Show profile header
- [ ] Show test details card
- [ ] Show main quiz CTA
- [ ] Show interview CTA
- [ ] Save to `assets/store/ios/ios-01-home.png`

### ios-02-interview.png
- [ ] Capture Interview prompt or recording screen
- [ ] Show question text
- [ ] Show recording interface clearly
- [ ] Save to `assets/store/ios/ios-02-interview.png`

### ios-03-quiz.png
- [ ] Capture Quiz question screen
- [ ] Show question + answers + progress bar
- [ ] Save to `assets/store/ios/ios-03-quiz.png`

### ios-04-feedback.png
- [ ] Capture Interview score or follow-up screen
- [ ] Show grade/feedback clearly
- [ ] Save to `assets/store/ios/ios-04-feedback.png`

### ios-05-progress.png
- [ ] Capture Progress/Profile or stats-rich Home state
- [ ] Show streak, accuracy, or study progress
- [ ] Save to `assets/store/ios/ios-05-progress.png`

---

## Android Captures

### android-01-home.png
- [ ] Capture Home screen
- [ ] Save to `assets/store/android/android-01-home.png`

### android-02-interview.png
- [ ] Capture Interview prompt or recording screen
- [ ] Save to `assets/store/android/android-02-interview.png`

### android-03-quiz.png
- [ ] Capture Quiz question screen
- [ ] Save to `assets/store/android/android-03-quiz.png`

### android-04-feedback.png
- [ ] Capture Interview score or follow-up screen
- [ ] Save to `assets/store/android/android-04-feedback.png`

### android-05-progress.png
- [ ] Capture Progress/Profile or stats-rich Home state
- [ ] Save to `assets/store/android/android-05-progress.png`

---

## Overlay Copy Application
- [ ] Apply approved copy from `STORE_ASSET_PRODUCTION_BRIEF.md`
- [ ] Keep one headline and one short support line max
- [ ] Verify text is readable on mobile-sized previews
- [ ] Keep overlay position consistent across platforms

---

## Android Feature Graphic
- [ ] Create 1024x500 PNG
- [ ] Use app icon and title treatment
- [ ] Use one approved headline/tagline
- [ ] Export to `assets/store/feature-graphic/android-feature-graphic.png`

---

## Optional Preview Video
- [ ] Record 15-30 second demo
- [ ] Show home -> interview -> score flow
- [ ] Export MP4 to `assets/store/video/civic-citizenship-preview.mp4`

---

## Final QA Before Upload
- [ ] All file names match naming convention
- [ ] All dimensions verified
- [ ] No blurry exports
- [ ] No placeholder text
- [ ] No cropped UI controls
- [ ] Assets reviewed against `STORE_ASSET_PRODUCTION_BRIEF.md`
- [ ] Upload-ready set confirmed
