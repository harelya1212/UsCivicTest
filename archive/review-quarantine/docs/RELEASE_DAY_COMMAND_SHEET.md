# Release-Day Command Sheet
## Civic Citizenship

**Use Window:** April 1-2, 2026  
**Purpose:** One-page command order for build, smoke test, and submission

---

## Preconditions

Confirm these before running commands:
- Expo account credentials available
- Apple and Google submission credentials available
- Public privacy policy and support URLs are live
- Store assets exported in `assets/store/`
- Final QA device list ready

Reference runbooks:
- `PRODUCTION_BUILD_PREFLIGHT.md`
- `BUILD_CREDENTIALS_AND_ACCOUNTS_CHECKLIST.md`
- `FINAL_QA_SMOKE_TEST_CHECKLIST.md`
- `SUBMISSION_CREDENTIALS_RUNBOOK.md`

---

## 1. Confirm Tooling And Login

```bash
npx eas --version
npx eas whoami
npx eas login
npx eas build:configure
```

Expected outcome:
- Correct Expo account confirmed
- Build configuration prompts completed

---

## 2. Run Production Builds

### iOS
```bash
npm run build:ios
```

### Android
```bash
npm run build:android
```

### Optional Combined Build
```bash
npm run build:all
```

Expected outcome:
- Remote iOS build completes and outputs `.ipa`
- Remote Android build completes and outputs `.aab` / `.apk`

---

## 3. Capture Build Outputs

Record these immediately after builds finish:
- EAS build URL for iOS
- EAS build URL for Android
- Build number and timestamp
- Binary filenames downloaded for QA

---

## 4. Run Smoke Test

Use `FINAL_QA_SMOKE_TEST_CHECKLIST.md` and verify:
- App launches on iPhone and Android device/emulator
- Quiz flow works end-to-end
- Interview flow works end-to-end
- Microphone permission prompt behaves correctly
- Admin analytics verification shows mirrored events

If a critical issue is found:
- Stop submission
- Log the failing flow, platform, build URL, and blocking issue

---

## 5. Submit Builds

### iOS
```bash
npm run submit:ios
```

### Android
```bash
npm run submit:android
```

Expected outcome:
- Submission process starts with the correct store credentials
- Upload identifiers are captured for tracking

---

## 6. Submission Log

Record after submission:
- Date and time submitted
- Submitter name
- Apple submission status / build number
- Google submission status / release track
- Any warnings shown by EAS, App Store Connect, or Play Console

---

## Stop Conditions

Do not proceed to submission if any of these are true:
- Legal URLs are not live
- Critical smoke-test issue is open
- Wrong Expo owner or project selected
- Credentials are incomplete or point to the wrong store account

---

## Fast Reference Order

```bash
npx eas --version
npx eas whoami
npx eas login
npx eas build:configure
npm run build:ios
npm run build:android
npm run submit:ios
npm run submit:android
```

---

**Status:** Ready for April 1-2 execution