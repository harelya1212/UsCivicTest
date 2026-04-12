# Build Credentials And Accounts Checklist
## Civic Citizenship

**Purpose:** Track the remaining external setup required before production builds and store submission  
**Owner:** Store submission lead  
**Target completion:** Before Apr 1 production build

---

## 1. Expo Account
- [ ] Confirm the correct Expo account/team owns the project
- [ ] Run `npx eas whoami`
- [ ] Run `npx eas login` if not authenticated
- [ ] Confirm Expo project owner matches `app.json`
- [ ] Confirm the project is linked to the intended Expo account

## 2. Apple Developer Setup
- [ ] Active Apple Developer membership available
- [ ] App Store Connect access available
- [ ] Bundle ID confirmed: `com.civiceducation.citizenship`
- [ ] App record created in App Store Connect or ready to create
- [ ] Certificates/provisioning permissions available to EAS
- [ ] Team ID known for the Apple account

## 3. Google Play Setup
- [ ] Google Play Console access available
- [ ] App record created or ready to create
- [ ] Package name confirmed: `com.civiceducation.citizenship`
- [ ] Play App Signing path understood
- [ ] Release manager permissions confirmed
- [ ] Service account ready if automated submission is used

## 4. Firebase / Backend Production Readiness
- [ ] Production Firebase project confirmed
- [ ] Firebase config values reviewed for production use
- [ ] Firestore rules reviewed
- [ ] Analytics collection/debug mirror confirmed working
- [ ] Real measurement ID added if web DebugView is needed

## 5. Legal / Public URLs
- [ ] Privacy policy hosted publicly over HTTPS
- [ ] Terms of service hosted publicly over HTTPS
- [ ] Support URL created and reachable
- [ ] Marketing/homepage URL created if needed for store listing
- [ ] Contact email inboxes working

## 6. Build Day Commands
Run in order once all accounts are ready:

```bash
npx eas whoami
npx eas login
npx eas build:configure
npm run build:ios
npm run build:android
```

## 7. Submission Day Commands
Use after successful builds and final QA:

```bash
npm run submit:ios
npm run submit:android
```

## 8. Go / No-Go Gate
Only proceed to build when all of these are true:
- [ ] Expo account confirmed
- [ ] Apple credentials confirmed
- [ ] Google Play credentials confirmed
- [ ] Legal URLs hosted
- [ ] Assets exported
- [ ] Final QA ready

---

**Related Docs:**
- `PRODUCTION_BUILD_PREFLIGHT.md`
- `STORE_SUBMISSION_CHECKLIST.md`
- `DELIVERY_PLAN_SUMMARY.md`
