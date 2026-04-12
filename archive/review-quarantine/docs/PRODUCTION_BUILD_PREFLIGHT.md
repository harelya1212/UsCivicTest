# Production Build Preflight
## Civic Citizenship

**Purpose:** Exact readiness checklist before running production builds  
**Build Window:** April 1, 2026  
**Submission Window:** April 2, 2026

---

## Current Status

### Already Ready
- `app.json` contains iOS bundle ID and Android package
- `eas.json` exists with production profile
- `package.json` includes build and submit scripts
- Local `eas-cli` is installed in the workspace
- Store asset folder structure exists

### Still Needs Confirmation Before Build
- Expo account login
- Apple developer credentials
- Google Play service account / credentials
- Production Firebase values confirmed
- Privacy policy and support URLs hosted publicly
- Final store assets exported and reviewed

---

## Command Baseline

Run from project root:

```bash
npm run build:ios
npm run build:android
npm run build:all
npm run submit:ios
npm run submit:android
```

Useful direct commands:

```bash
npx eas --version
npx eas login
npx eas whoami
npx eas build:configure
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

---

## Preflight Checklist

### 1. Tooling
- [x] `eas-cli` installed locally
- [ ] `npx eas whoami` confirms correct Expo account
- [ ] `npx eas build:configure` completed if credentials/project setup prompts appear

### 2. Expo Project Identity
- [ ] Expo owner is correct
- [ ] Expo slug is correct
- [ ] Production project is linked to the intended Expo account

### 3. iOS Readiness
- [ ] Apple Developer account active
- [ ] App ID matches `com.civiceducation.citizenship`
- [ ] Certificates/provisioning can be managed by EAS
- [ ] App Store Connect app record exists or is ready to create

### 4. Android Readiness
- [ ] Google Play Console app exists
- [ ] Package name matches `com.civiceducation.citizenship`
- [ ] Play signing/app signing path is understood
- [ ] Service account or submission credentials prepared if submitting through EAS

### 5. Production Configuration
- [ ] Firebase config is production-ready
- [ ] AdMob IDs are production-ready
- [ ] No debug-only flags left enabled
- [ ] Privacy policy URL works publicly
- [ ] Terms/support URLs work publicly

### 6. Quality Gate Before Build
- [ ] Core flows manually tested
- [ ] Analytics mirror working in Admin panel
- [ ] Store assets exported to `assets/store/`
- [ ] No blocking console/runtime issues known

---

## Build Sequence

### iOS
1. `npx eas login`
2. `npm run build:ios`
3. Wait for remote build to finish
4. Download `.ipa`
5. Install/test on physical iPhone if available

### Android
1. `npx eas login`
2. `npm run build:android`
3. Wait for remote build to finish
4. Download `.aab` or `.apk` output from EAS
5. Install/test on physical Android device if available

### Combined
- `npm run build:all`

---

## Post-Build Checks

### iOS
- [ ] Build downloads successfully
- [ ] App installs
- [ ] Launches without crash
- [ ] Microphone permission flow works
- [ ] Interview mode reachable

### Android
- [ ] Build downloads successfully
- [ ] App installs
- [ ] Launches without crash
- [ ] Microphone permission flow works
- [ ] Interview mode reachable

---

## Submission Readiness Gate

Only submit when all are true:
- [ ] Production binaries built successfully
- [ ] Assets finalized
- [ ] Privacy/support URLs live
- [ ] Manual smoke test passed on both platforms
- [ ] No critical analytics or navigation issues

---

## Known Current Gaps

These are not solved automatically by EAS:
- Firebase Analytics true DebugView still requires a valid measurement ID or native analytics path
- Legal URLs must be publicly hosted before submission
- Store screenshots and feature graphic still need final exported assets

---

## Recommended Next Commands

```bash
npx eas whoami
npx eas login
npx eas build:configure
npm run build:ios
npm run build:android
```

---

**Status:** Preflight document ready  
**Next Step:** Confirm Expo login and credentials, then run `npx eas build:configure`
