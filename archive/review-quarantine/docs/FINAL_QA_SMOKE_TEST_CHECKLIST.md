# Final QA Smoke Test Checklist
## Civic Citizenship

**Purpose:** Final release-validation checklist for production build artifacts  
**Use On:** Apr 1 build verification and Apr 2 submission gate  
**Platforms:** iOS and Android

---

## Pass Criteria

Release can move to store submission only if:
- No launch crash on either platform
- Home, Quiz, and Interview flows work end-to-end
- Microphone permission flow works or fails gracefully
- Analytics verification panel still shows mirrored events
- No blocking UI defects in primary flows

---

## iOS Smoke Test

### Install / Launch
- [ ] IPA installs successfully
- [ ] App launches without crash
- [ ] Splash screen appears correctly
- [ ] Home screen loads fully

### Core Flow
- [ ] Home screen shows Quiz CTA
- [ ] Home screen shows Interview CTA
- [ ] Tap Interview CTA opens Interview screen
- [ ] Tap Quiz CTA opens Quiz screen

### Quiz Flow
- [ ] Complete at least 1 quiz question
- [ ] Feedback appears correctly
- [ ] Progress advances correctly

### Interview Flow
- [ ] Interview screen loads question prompt
- [ ] Microphone permission prompt appears when needed
- [ ] Permission granted path works
- [ ] Response submission proceeds to scoring
- [ ] Score/feedback appears
- [ ] Follow-up appears when expected for weak response path

### Profile / Progress
- [ ] Profile or progress screen loads
- [ ] Stats render without obvious empty-state bug

### Analytics / Stability
- [ ] Admin analytics verification panel loads
- [ ] Test event can be sent
- [ ] Mirrored event list refreshes
- [ ] No blocking console/runtime error known

---

## Android Smoke Test

### Install / Launch
- [ ] Android build installs successfully
- [ ] App launches without crash
- [ ] Splash screen appears correctly
- [ ] Home screen loads fully

### Core Flow
- [ ] Home screen shows Quiz CTA
- [ ] Home screen shows Interview CTA
- [ ] Tap Interview CTA opens Interview screen
- [ ] Tap Quiz CTA opens Quiz screen

### Quiz Flow
- [ ] Complete at least 1 quiz question
- [ ] Feedback appears correctly
- [ ] Progress advances correctly

### Interview Flow
- [ ] Interview screen loads question prompt
- [ ] Microphone permission prompt appears when needed
- [ ] Permission granted path works
- [ ] Response submission proceeds to scoring
- [ ] Score/feedback appears
- [ ] Follow-up appears when expected for weak response path

### Profile / Progress
- [ ] Profile or progress screen loads
- [ ] Stats render without obvious empty-state bug

### Analytics / Stability
- [ ] Admin analytics verification panel loads
- [ ] Test event can be sent
- [ ] Mirrored event list refreshes
- [ ] No blocking console/runtime error known

---

## Cross-Platform Regression Checks

- [ ] App startup feels acceptable
- [ ] Question load time acceptable
- [ ] No obvious navigation dead ends
- [ ] No clipped CTA buttons on key screens
- [ ] No privacy/support links missing from metadata prep package
- [ ] Store screenshots still match live product experience

---

## Submission Gate

Only submit when all are true:
- [ ] iOS smoke test passed
- [ ] Android smoke test passed
- [ ] Legal URLs are live
- [ ] Store assets finalized
- [ ] No P0/P1 issues open

---

## Result Log

- QA owner: __________________
- Test date: __________________
- iOS result: Pass / Fail
- Android result: Pass / Fail
- Blocking issues: __________________

---

**Related Docs:**
- `PRODUCTION_BUILD_PREFLIGHT.md`
- `BUILD_CREDENTIALS_AND_ACCOUNTS_CHECKLIST.md`
- `STORE_SUBMISSION_CHECKLIST.md`