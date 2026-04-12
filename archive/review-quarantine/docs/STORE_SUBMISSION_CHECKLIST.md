# Store Submission Checklist
## iOS App Store & Google Play Store Launch Preparation

**Project**: Civic Citizenship  
**Version**: 1.0.0  
**Target Launch Date**: April 1-7, 2026  
**Last Updated**: March 27, 2026

---

## Phase 4 (Mar 28 - Mar 31): Feature Completion & Testing

### Feature Completion
- [x] **Home Screen Integration**: Interview CTA/button implemented
  - [x] Button styling matches design system
  - [x] Navigation to Interview mode wired
  - [x] Analytics event fires on tap
  - [ ] Back navigation from Interview verified on devices

- [x] **Analytics Tracking**: Event names and properties implemented
  - [x] `app_open` event wired
  - [x] `screen_view` event wired
  - [x] `quiz_started` event wired
  - [x] `question_answered` event wired
  - [x] `interview_completed` event wired
  - [x] `interview_followup_scored` event wired
  - [x] All events include required properties
  - [ ] Events verified in Firestore/Firebase

- [ ] **Interview Mode Finalization**: Complete Phase 3 integration
  - [ ] Q1-10 questions load correctly
  - [ ] Mock audio recording UI works
  - [ ] Scoring shows correct grades (A/B/C/D)
  - [ ] Follow-ups appear for C/D grades
  - [ ] Follow-up answers are scored
  - [ ] Progress persists across sessions
  - [ ] Can complete full interview end-to-end

### Code Quality & Performance
- [ ] **Testing**
  - [ ] Run full validation: `npm run validate:sprint1`
  - [ ] No TypeScript/ESLint errors ✅
  - [ ] No console errors or warnings in dev
  - [ ] Test at least 3 complete quiz sessions
  - [ ] Test all major features (home, quiz, interview, settings)

- [ ] **Performance**
  - [ ] App startup < 5 seconds on iPhone 12/Android 12
  - [ ] Quiz question loads < 2 seconds
  - [ ] No memory leaks (check dev console)
  - [ ] No noticeable lag during recording
  - [ ] Can run continuously for 30+ minutes

- [ ] **Device Testing**
  - [ ] iPhone 12 (minimum target)
  - [ ] iPhone 15 Pro (current flagship)
  - [ ] iPad Pro (tablet)
  - [ ] Pixel 7 (Android flagship)
  - [ ] Galaxy A10 (low-end Android)
  - [ ] Test both portrait and landscape

### Build Preparation
- [ ] **Update Version Numbers**
  - [ ] package.json: "version": "1.0.0" ✅
  - [ ] app.json: "version": "1.0.0" ✅
  - [ ] app.json ios.buildNumber: "1" ✅
  - [ ] app.json android.versionCode: 1 ✅

- [ ] **Configure Metadata**
  - [ ] App Name: "Civic Citizenship" ✅
  - [ ] bundleIdentifier (iOS): "com.civiceducation.citizenship" ✅
  - [ ] package (Android): "com.civiceducation.citizenship" ✅
  - [ ] Description in app.json ✅
  - [ ] Microphone permission text ✅
  - [ ] Notification permission text (optional)

- [ ] **Firebase Setup**
  - [ ] Firebase project created
  - [ ] Analytics enabled
  - [ ] AdMob linked (if using ads)
  - [ ] Firestore configured for data storage
  - [ ] Security rules set to production
  - [ ] Test data cleaned up
  - [ ] Staging project separate from production

- [ ] **Account & Credential Setup**
  - [x] Local EAS CLI installed and verified
  - [ ] Expo account logged in
  - [ ] Apple developer credentials confirmed
  - [ ] Google Play credentials confirmed
  - [ ] Follow `PRODUCTION_BUILD_PREFLIGHT.md`

- [ ] **AdMob Setup** (if using ads)
  - [ ] AdMob account created
  - [ ] App registered in AdMob console
  - [ ] Banner ad unit created (iOS)
  - [ ] Banner ad unit created (Android)
  - [ ] Reward ad unit created (iOS & Android)
  - [ ] Production ad links configured
  - [ ] Test ads disabled in production

---

## Phase 5 (Apr 1 - Apr 2): Store Submission Preparation

### Legal Documents
- [ ] **Privacy Policy**
  - [ ] Created: [PRIVACY_POLICY.md](PRIVACY_POLICY.md) ✅
  - [ ] Hosted on public HTTPS URL
  - [ ] Contains required sections (data collection, sharing, retention)
  - [ ] References Firebase, AdMob, and third-party services
  - [ ] Includes COPPA section (age 13+ focus)
  - [ ] Includes CCPA section (California residents)
  - [ ] Includes GDPR section (EU residents)
  - [ ] Contact email: support@civiceducation.example.com
  - [ ] Updated date in document matches submission date

- [ ] **Terms of Service**
  - [ ] Created: [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) ✅
  - [ ] Hosted on same URL as privacy policy
  - [ ] Disclaims educational guarantees
  - [ ] Includes limitation of liability
  - [ ] Defines acceptable use
  - [ ] Covers user-generated content (for future)
  - [ ] Clear dispute resolution (arbitration)
  - [ ] DMCA copyright information
  - [ ] Contact email: legal@civiceducation.example.com
  - [ ] Updated date in document matches submission date

- [ ] **Content Ratings**
  - [ ] IARC questionnaire completed (Android)
  - [ ] ESRB/PEGI rating determined (iOS)
  - [ ] Age category selected: 13+
  - [ ] Appropriate for education category
  - [ ] No inappropriate content flagged

### Assets & Screenshots
- [ ] **App Icons**
  - [ ] 1024×1024 icon (no transparency) ✅
  - [ ] Meets Apple iTunes Connect specifications
  - [ ] Meets Google Play specifications
  - [ ] Consistent with brand identity
  - [ ] Clear and recognizable at small sizes

- [ ] **Splash Screen**
  - [ ] 1024×1024 splash screen image ✅
  - [ ] Clean, professional appearance
  - [ ] Loads within 3 seconds
  - [ ] Visible on all device sizes

- [ ] **Screenshots (iOS) — 5-12 images per device**
  - [ ] Follow `STORE_ASSET_PRODUCTION_BRIEF.md` shot order and overlay copy
  - [ ] Use `STORE_ASSET_CAPTURE_CHECKLIST.md` during capture/export
  - [ ] iPhone 6.1" (1170×2532): [Create 5-12 images]
    - [ ] Welcome/onboarding
    - [ ] Quiz question interface
    - [ ] Results feedback
    - [ ] Interview mode
    - [ ] Progress tracking
  - Recommended text overlays explaining each feature
  - [ ] iPad (1024×1024): [Create 2-3 images] (if supporting tablets)

- [ ] **Screenshots (Android) — Minimum 2, recommended 8**
  - [ ] Follow `STORE_ASSET_PRODUCTION_BRIEF.md` shot order and overlay copy
  - [ ] Use `STORE_ASSET_CAPTURE_CHECKLIST.md` during capture/export
  - [ ] Phone (1080×1920): [Create 5 images]
  - [ ] 7-inch tablet (1440×1440): [Create 2 images]
  - [ ] 10-inch tablet (1440×1440): [Create 2 images]
  - Recommended text overlays explaining features

- [ ] **Feature Graphic (Android Only)**
  - [ ] Follow `STORE_ASSET_PRODUCTION_BRIEF.md` layout and copy guidance
  - [ ] 1024×500 pixels PNG
  - [ ] Shows app name and key visual
  - [ ] Professional, attractive design
  - [ ] Matches app aesthetic

- [ ] **Preview Video (Optional)**
  - [ ] 15-30 second demo video
  - [ ] Shows quiz flow and key features
  - [ ] High quality (720p minimum, 1080p recommended)
  - [ ] MP4 format, H.264 codec
  - [ ] <500MB file size
  - [ ] Captions/text overlays (optional)

### App Store Listing Content
- [ ] **iOS App Store (iTunes Connect)**
  - [ ] **App Name**: "Civic Citizenship" (30 chars) ✅
  - [ ] **Subtitle**: "Learn civics through interactive quizzes" (30 chars) ✅
  - [ ] **Privacy Policy URL**: https://civiceducation.example.com/privacy
  - [ ] **Support URL**: https://civiceducation.example.com/support
  - [ ] **Marketing URL**: https://civiceducation.example.com
  - [ ] **Keywords**: "civics, citizenship, government, education, quiz" (100 chars max)
  - [ ] **Description** (4000 chars max):
    ```
    Civic Citizenship is an interactive educational app that helps you master American civics through:
    
    📚 Comprehensive Quiz Mode
    - 128 civics questions covering government, constitution, rights
    - Instant feedback and detailed explanations
    - Progress tracking and performance analytics
    
    🎤 Interview Mode (Unique Feature)
    - Answer civics questions using voice or text
    - AI-scored responses with adaptive feedback
    - Follow-up questions for deeper learning on difficult topics
    
    📊 Personalized Learning
    - Adaptive quizzes that match your level
    - Progress charts to track improvement
    - Retry questions with simplified alternatives
    
    Perfect for:
    - High school civics students
    - Citizenship test preparation
    - Adults refreshing civics knowledge
    - Test prep for civics exams
    
    Features include:
    ✅ 128 questions across all major civics topics
    ✅ Voice recording with speech-to-text
    ✅ Instant AI scoring and feedback
    ✅ Offline mode (questions pre-loaded)
    ✅ Free with optional ad-free premium
    ✅ No account required (optional for saved progress)
    
    Privacy First:
    - We never sell your data
    - Audio not permanently stored
    - Optional account creation
    - Clear privacy settings
    
    Requirements: iOS 14.0+
    Privacy: See https://civiceducation.example.com/privacy
    Terms: See https://civiceducation.example.com/terms
    ```
  - [ ] **Category**: Education
  - [ ] **Age Rating**: 4+ (no controversial content)
  - [ ] **Requires Health Kit**: No
  - [ ] **Screenshots uploaded** (5-12 per device)
  - [ ] All metadata reviewed for spelling/grammar

- [ ] **Google Play Store**
  - [ ] **App Name**: "Civic Citizenship" ✅
  - [ ] **Short Description**: "Learn civics through quizzes and voice interviews" (80 chars)
  - [ ] **Full Description**: [Same as iOS, 80-4000 chars]
  - [ ] **Privacy Policy URL**: https://civiceducation.example.com/privacy
  - [ ] **Permissions Listed**:
    - [ ] RECORD_AUDIO: For speech-to-text
    - [ ] INTERNET: For Firebase and ads
  - [ ] **Content Rating**: Complete IARC questionnaire
  - [ ] **Advertising**: Declare AdMob usage
  - [ ] **Screenshots uploaded** (minimum 2, recommend 8)
  - [ ] **Feature graphic uploaded** (1024×500)
  - [ ] **Category**: Education
  - [ ] **Target age**: 13+

### Production Build Configuration
- [ ] **EAS Build Setup**
  - [x] Local EAS CLI installed in workspace
  - [x] Local EAS CLI verified: `npx eas --version`
  - [ ] Login to Expo: `eas login`
  - [ ] Configure project: `eas build:configure`
  - [ ] Verify ios and android folders created
  - [ ] Follow `PRODUCTION_BUILD_PREFLIGHT.md`

- [ ] **Build Configuration Files**
  - [x] `eas.json` created with production profile
  - [ ] app.json updated with store metadata ✅
  - [ ] No test/debug flags enabled
  - [ ] environment variables configured for production Firebase
  - [ ] API endpoints point to production servers
  - [ ] AdMob ad unit IDs are production IDs
  - [ ] Analytics tracking enabled

- [ ] **Code Cleanup**
  - [ ] Remove all console.log() statements (or use production logger)
  - [ ] Remove all TODO/FIXME comments (or update to production status)
  - [ ] Remove test data or clearly mark as test
  - [ ] Remove development-only features
  - [ ] Ensure no hardcoded test API keys
  - [ ] Verify no analytics test events firing

### Testing (Final Phase 5 Testing)
- [ ] Follow `FINAL_QA_SMOKE_TEST_CHECKLIST.md`
- [ ] **Functional Testing**
  - [ ] App launches and loads home screen
  - [ ] Quiz mode works end-to-end
  - [ ] Can complete at least 3 full quiz sessions
  - [ ] Interview mode records and scores answers
  - [ ] Follow-up questions appear for C/D grades
  - [ ] Settings screen accessible and functional
  - [ ] Data persists across sessions
  - [ ] Logout and re-login works (if account feature enabled)

- [ ] **Microphone Permission Testing**
  - [ ] First launch prompts for microphone permission
  - [ ] Permission denied gracefully (fallback to text)
  - [ ] Can revoke permission and re-enable
  - [ ] Audio recording works after permission granted
  - [ ] Works on both iOS and Android

- [ ] **Ad Testing (If Using AdMob)**
  - [ ] Banner ads appear on quiz screen
  - [ ] Ads are responsive to orientation change
  - [ ] Ads don't interfere with quiz functionality
  - [ ] Reward ads work for optional features
  - [ ] Ads don't appear in tutorial/first-run

- [ ] **Analytics Testing**
  - [ ] Firebase console shows test events
  - [ ] All key events firing (app_open, screen_view, quiz_started, etc.)
  - [ ] Events include correct properties
  - [ ] User counts increasing correctly

- [ ] **Performance Testing**
  - [ ] Startup time: < 5 seconds ✅
  - [ ] Question load: < 2 seconds
  - [ ] Memory usage: < 200MB
  - [ ] No crashes in 30-minute session
  - [ ] Battery drain acceptable (no runaway processes)

- [ ] **Device Testing (Final)**
  - [ ] iOS 14+ devices tested
  - [ ] iPhone (6.1", 6.7")
  - [ ] iPad (landscape and portrait)
  - [ ] Android 7.0+ devices tested
  - [ ] Various screen sizes (phone, tablet)
  - [ ] Test on WiFi and cellular networks
  - [ ] Test with airplane mode off (requires network)

- [ ] **Edge Cases**
  - [ ] App backgrounded and resumed
  - [ ] Network disconnected mid-session
  - [ ] Audio permission denied
  - [ ] Low storage device
  - [ ] Slow network connection
  - [ ] Long quiz session (45+ minutes)

### Security & Compliance
- [ ] **Security Review**
  - [ ] No hardcoded API keys or secrets
  - [ ] HTTPS used for all network calls
  - [ ] Firebase security rules in production mode (read-only public)
  - [ ] No sensitive data logged to console
  - [ ] No user data persisted to disk (except quiz progress)
  - [ ] Audio files not saved permanently
  - [ ] Passwords not stored in plain text (if applicable)

- [ ] **Privacy Compliance**
  - [ ] Privacy Policy hosted and accessible
  - [ ] COPPA compliance (age 13+)
  - [ ] CCPA compliance (CA residents)
  - [ ] GDPR compliance (EU residents)
  - [ ] Data deletion request mechanism functional
  - [ ] User can clear all data from settings
  - [ ] No tracking pixels or third-party trackers

- [ ] **App Store Compliance**
  - [ ] No mention of other app stores
  - [ ] No external links to payment systems (except Apple/Google)
  - [ ] No private APIs used
  - [ ] No crashing on app startup
  - [ ] No missing required frameworks
  - [ ] Follows App Store design guidelines
  - [ ] No spam, misleading content, or deceptive practices

---

## Apr 1: Build Production Binaries

- [ ] **iOS Production Build**
  - [ ] Run: `npm run build:ios`
  - [ ] Build completes without errors
  - [ ] Download IPA from EAS dashboard
  - [ ] Verify file integrity (SHA256 hash)

- [ ] **Android Production Build**
  - [ ] Run: `npm run build:android`
  - [ ] Build completes without errors
  - [ ] Download APK from EAS dashboard
  - [ ] Verify file integrity

- [ ] **Backup Builds**
  - [ ] Save IPA and APK to secure location
  - [ ] Document build timestamps and git commits
  - [ ] Create MD5/SHA256 checksums
  - [ ] Test downloaded files before submission

---

## Week of Apr 10-13: Final Testing & Submission Prep

- [ ] **Final QA Round**
  - [ ] Install production IPA on iPhone via Xcode
  - [ ] Install production APK on Android device
  - [ ] Run full user flow (home → quiz → interview → results)
  - [ ] Verify all screenshots match app appearance
  - [ ] Check that version number displays correctly
  - [ ] Confirm no test data or debug features

- [ ] **Submission Package Assembly**
  - [ ] Screenshots ready (iOS: 5-12, Android: 2-8)
  - [ ] Feature graphic ready (Android: 1024×500)
  - [ ] Privacy policy URL confirmed
  - [ ] Terms of service URL confirmed
  - [ ] Support contact email ready
  - [ ] App description in plain text ready
  - [ ] Keywords/categories selected

- [ ] **Account Preparation**
  - [ ] **Apple Developer Account**
    - [ ] Account created and verified
    - [ ] Payment method on file
    - [ ] Team members added (if applicable)
    - [ ] App ID created for "Civic Citizenship" (bundle: com.civiceducation.citizenship)
    - [ ] Certificates generated (can be auto-managed by EAS)
    - [ ] Provisioning profiles created
    - [ ] Signed into iTunes Connect

  - [ ] **Google Play Account**
    - [ ] Google Play Developer account created
    - [ ] Payment method configured
    - [ ] Tax information provided
    - [ ] Signed into Google Play Console
    - [ ] App created in Play Console
    - [ ] Package name configured (com.civiceducation.citizenship)
    - [ ] Release management section reviewed

---

## Apr 1-2: Final Checks Before Submission

- [ ] **Compliance Verification**
  - [ ] Terms & Privacy Policy approved by legal
  - [ ] Age appropriateness verified (13+)
  - [ ] No copyrighted content used without permission
  - [ ] Content ratings match guidelines
  - [ ] Accessibility standards met (large text, contrast, etc.)

- [ ] **Marketing Copy Review**
  - [ ] App descriptions reviewed for accuracy
  - [ ] No false claims about functionality
  - [ ] No comparison to competitors
  - [ ] Keywords relevant to app features
  - [ ] Screenshots match current app version
  - [ ] Spelling/grammar checked

- [ ] **Store Requirements Met**
  - [ ] All required metadata complete
  - [ ] All screenshots uploaded (correct sizes)
  - [ ] Privacy policy external link works
  - [ ] Support email functional
  - [ ] App category appropriate
  - [ ] Rating declared
  - [ ] No pending review flags

- [ ] **Version Lock**
  - [ ] Version number locked: 1.0.0 ✅
  - [ ] Build number locked: iOS 1, Android 1
  - [ ] No code changes after this point
  - [ ] No metadata changes after submission

---

## Apr 2: Submission Day (iOS & Android)

### iOS App Store Submission
- [ ] **Final Checks**
  - [ ] iTunes Connect open
  - [ ] Version 1.0.0 selected
  - [ ] All required metadata complete
  - [ ] IPA uploaded successfully
  - [ ] Build processing shows green checkmark
  - [ ] Screenshots show preview correctly

- [ ] **Submission Process**
  1. [ ] Review and update pricing (Free)
  2. [ ] Confirm app availability
  3. [ ] Set availability date (immediate)
  4. [ ] Review compliance questionnaire
  5. [ ] Verify EULA (use our terms)
  6. [ ] Declare any beta testing
  7. [ ] Click "Submit for Review"
  8. [ ] Receive confirmation (email)
  9. [ ] Screen shot confirmation page
  10. [ ] Monitor status dashboard

- [ ] **Post-Submission**
  - [ ] Document submission time
  - [ ] Monitor email for Apple updates
  - [ ] Check status daily (usually 1-3 days)
  - [ ] Have update ready if rejected
  - [ ] No changes during review (wait for decision)

### Android (Google Play Store) Submission
- [ ] **Final Checks**
  - [ ] Google Play Console open
  - [ ] APK uploaded successfully
  - [ ] Build verification Green
  - [ ] All required screenshots added
  - [ ] Feature graphic added
  - [ ] Store listing complete
  - [ ] Content rating questionnaire complete

- [ ] **Submission Process**
  1. [ ] Review app content rating (IARC)
  2. [ ] Confirm app category (Education)
  3. [ ] Declare any permissions explanation
  4. [ ] Verify privacy policy link
  5. [ ] Set pricing (Free)
  6. [ ] Configure distribution (All countries)
  7. [ ] Review store listing
  8. [ ] Accept developer agreement
  9. [ ] Click "Review and Publish"
  10. [ ] Confirm publication
  11. [ ] Monitor status
  12. [ ] Receive confirmation email

- [ ] **Post-Submission**
  - [ ] Document submission time
  - [ ] Monitor email for Google response
  - [ ] Check status (typically 24-48 hours)
  - [ ] Android review is usually faster than iOS
  - [ ] Have update ready if rejected
  - [ ] Monitor analytics after approval

---

## Apr 1-7: Launch Window

### Day 1-2: Early Approval Monitoring
- [ ] **iOS Status**
  - [ ] Check status 3x daily
  - [ ] Be ready for rejections (respond within 24h)
  - [ ] Document approval time
  - [ ] Verify app appears in App Store search
  - [ ] Check feature image displays

- [ ] **Android Status**
  - [ ] Check status 2x daily
  - [ ] Usually faster (24-48h approval)
  - [ ] Verify app appears in Play Store
  - [ ] Confirm download link works
  - [ ] Check screenshot display

### Day 2-3: Pre-Launch Coordination
- [ ] **Marketing**
  - [ ] Prepare launch announcement
  - [ ] Draft social media posts
  - [ ] Email announcement ready
  - [ ] Website landing page ready
  - [ ] Press release (if applicable)

- [ ] **Support**
  - [ ] Support email monitored 2x daily
  - [ ] FAQ document ready
  - [ ] Common issues guide prepared
  - [ ] Support team briefed

- [ ] **Analytics Setup**
  - [ ] Firebase dashboard monitored
  - [ ] Custom dashboards created
  - [ ] Alerts set for error spikes
  - [ ] Daily reports configured

### Day 3: Simultaneous Launch
- [ ] **Simultaneous Release (If Both Approved)**
  - [ ] Coordinate iOS + Android release timing
  - [ ] Post social media announcements
  - [ ] Send email announcement
  - [ ] Update website with links
  - [ ] Monitor both stores for visibility

- [ ] **Staggered Release (If One Approved First)**
  - [ ] Launch approved platform immediately
  - [ ] Mention other platform coming soon
  - [ ] Prepare follow-up announcement
  - [ ] Launch second platform within 24-48h

### Week 1 : Post-Launch Monitoring
- [ ] **Daily (For First Week)**
  - [ ] Monitor reviews 3x daily
  - [ ] Check crash reports in Firebase
  - [ ] Review user feedback
  - [ ] Monitor app ratings/sentiment
  - [ ] Track installation rates

- [ ] **Critical Issue Response** (If Needed)
  - [ ] High crash rate: Submit hotfix immediately
  - [ ] Major bugs: Prioritize fix and re-submit
  - [ ] App store issues: Contact store support
  - [ ] Server issues: Investigate and resolve

- [ ] **Week 1 Metrics**
  - [ ] Target: 100+ installs (realistic for day 1)
  - [ ] Target: 4.0+ average rating
  - [ ] Target: <5% crash rate
  - [ ] Monitor engagement metrics

---

## Ongoing (Week 2+): Post-Launch Support

- [ ] **Weekly Tasks**
  - [ ] Review user ratings and comments
  - [ ] Respond to reviews (encourage positive, address negative)
  - [ ] Monitor crash reports
  - [ ] Track engagement metrics
  - [ ] Check for OS update compatibility issues

- [ ] **Bi-Weekly Tasks**
  - [ ] Analyze usage patterns
  - [ ] Identify feature requests
  - [ ] Plan feature improvements
  - [ ] Monitor competitor apps
  - [ ] Update store screenshots with user feedback

- [ ] **Monthly Tasks**
  - [ ] Generate reports on performance
  - [ ] Plan next release (v1.0.1, v1.1.0)
  - [ ] Coordinate with marketing on campaigns
  - [ ] Review and improve app store listing
  - [ ] Plan content updates (new questions, features)

---

## Success Metrics

### Launch Week Goals
- [ ] **Installs**: 500+ (optimistic for education app)
- [ ] **Rating**: 4.0+ stars
- [ ] **Crash Rate**: <5%
- [ ] **Media**: 1+ press mention (if pursuing PR)
- [ ] **Reviews**: Positive feedback on learning experience

### Month 1 Goals
- [ ] **Installs**: 2,000+
- [ ] **Rating**: 4.0+
- [ ] **DAU**: 200+
- [ ] **Retention**: 30% 7-day retention (typical for education)
- [ ] **Engagement**: 50% complete first quiz

### Month 3 Goals
- [ ] **Installs**: 5,000+
- [ ] **MAU**: 1,000+
- [ ] **Rating**: 4.2+
- [ ] **Revenue**: $100+ (from ads)
- [ ] **Retention**: 20% 30-day retention

---

## Emergency Contacts & Escalation

### Submit Issues to Stores
- **Apple**: https://appstoreconnect.apple.com/support
- **Google**: https://support.google.com/googleplay/android-developer/

### Key Contacts (Team-Specific)
- **App Owner**: [TO BE FILLED]
- **Tech Lead**: [TO BE FILLED]
- **Legal/Privacy**: [TO BE FILLED]
- **Marketing**: [TO BE FILLED]
- **Support Lead**: [TO BE FILLED]

### Common Issues & Solutions

| Issue | Resolution |
|-------|-----------|
| Build fails on iOS | Check certificate expiration, rebuild in EAS |
| App rejected - metadata | Review guidelines, update language, resubmit |
| App rejected - privacy | Ensure Privacy Policy URL works, update policy, resubmit |
| App rejected - functionality | Test all features, fix issues, provide detailed notes in resubmit |
| High crash rate post-launch | Monitor Firebase, identify culprit, submit hotfix |
| Low ratings - poor reviews | Respond publicly to feedback, fix issues, bump rating over time |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | ________ | _____ | __________ |
| Tech Lead | ________ | _____ | __________ |
| QA Lead | ________ | _____ | __________ |
| Legal/Compliance | ________ | _____ | __________ |

---

**Document Version**: 1.0  
**Last Updated**: March 27, 2026  
**Status**: Ready for Phase 4 Execution  
**Next Review**: April 7, 2026 (pre-Phase 5)
