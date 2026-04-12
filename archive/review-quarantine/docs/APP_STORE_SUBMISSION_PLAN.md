# App Store Submission Plan
## iOS App Store & Google Play Store Requirements & Delivery Timeline

**Current Status:** Feature-complete MVP ready for store submission  
**Target Launch Date:** April 1-7, 2026  
**Owner:** Civic Citizenship Team

---

## Phase Overview

### Pre-Submission Phase (Phase 4: Mar 28-Mar 31)
- [ ] Finalize all features (Home integration, analytics)
- [ ] Complete testing (QA, Performance, Accessibility)
- [ ] Prepare store assets and metadata
- [ ] Create legal documents

### Submission Phase (Phase 5: Apr 1-2)
- [ ] Build production APK/IPA files
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Monitor review process

### Launch Phase (Apr 1-7)
- [ ] Coordinate simultaneous release
- [ ] Monitor bugs and analytics
- [ ] Prepare post-launch support

---

## App Metadata Requirements

### General Information
```
App Name: Civic Citizenship
App ID (iOS): com.civiceducation.citizenship
Package Name (Android): com.civiceducation.citizenship
Version: 1.0.0
Release Type: Initial Launch
Languages: English (US)
Target Age: 13+
Category: Education
```

### Version Management
- **Major Release:** 1.0.0 (initial launch)
- **Patch Release:** 1.0.1+ (bug fixes within 2 weeks of launch)
- **Minor Release:** 1.1.0+ (new question sets, features)
- **Version Increment:** Only when submitting new build to stores

### Supported Platforms
- **iOS:** Version 14.0+
- **Android:** API Level 24 (7.0) - API Level 35 (15.0)
- **Web:** Not included in store submission (internal testing only)

---

## iOS App Store Requirements

### Store Listing
| Requirement | Details | Status |
|---|---|---|
| **App Name** | Civic Citizenship | ✅ Ready |
| **Subtitle** | Learn civics through interactive quizzes | ✅ Ready |
| **Privacy Policy** | Must include URL | 🟡 Need to host |
| **Terms of Service** | Must include URL | 🟡 Need to host |
| **Support URL** | Contact email/website | 🟡 Need to configure |
| **Screenshots** (5-12) | iPad + iPhone sizes | 🔴 Need to create |
| **Preview Video** | Optional but recommended | 🔴 Need to record |
| **App Icon** | 1024×1024 PNG (no transparency) | ✅ Have (icon.png) |
| **Splash Screen** | 1024×1024 PNG | ✅ Have (splash-icon.png) |

### App Privacy
- [ ] Collect privacy policy
- [ ] Declare data collection: Firebase analytics, AdMob
- [ ] Declare permissions: Microphone (speech-to-text), Notifications
- [ ] Submit App Privacy & Safety information

### Configuration Requirements
```json
{
  "bundleIdentifier": "com.civiceducation.citizenship",
  "buildNumber": "1",
  "buildVersion": "1.0.0"
}
```

### Required Declarations

#### Microphone Usage (Critical)
- **Purpose:** Speech-to-text recording for civics interviews
- **Privacy Policy Must State:** How audio is used, stored, and deleted
- **Declaration:** `NSMicrophoneUsageDescription` in Info.plist

#### Push Notifications (Conditional)
- **Purpose:** Learning reminders and streak notifications
- **Privacy Policy Must State:** Opt-in/opt-out mechanism
- **Declaration:** Required capability in Xcode

#### Analytics (Firebase)
- **Purpose:** Track user engagement and feature usage
- **Privacy Policy Must State:** What data is collected
- **Declaration:** Covered under App Privacy form

#### In-App Ads (AdMob)
- **Purpose:** Monetization
- **Privacy Policy Must State:** Ad network data usage
- **Declaration:** Declared in App Privacy form

### Submission Checklist
- [ ] Build production IPA via EAS Build
- [ ] Test on real iOS device (minimum iPhone 12)
- [ ] Verify microphone permissions work
- [ ] Verify notifications work
- [ ] Test all 128 civics questions load correctly
- [ ] Verify no console errors in production
- [ ] Create App Store screenshots (5-12 images)
- [ ] Write app description (100-170 chars)
- [ ] Write keywords (100 chars, comma-separated)
- [ ] Select appropriate rating (PEGI/ESRB)
- [ ] Enable "User Privacy" in App Store Connect
- [ ] Declare data collection in App Privacy & Safety
- [ ] Upload IPA and all metadata
- [ ] Submit for review (Target: within 2 hours)
- [ ] Monitor review status daily

---

## Google Play Store Requirements

### Store Listing
| Requirement | Details | Status |
|---|---|---|
| **App Name** | Civic Citizenship | ✅ Ready |
| **Short Description** | Learn civics through interactive quizzes | ✅ Ready |
| **Full Description** | Features, benefits, how to use | 🟡 Need detailed version |
| **Privacy Policy** | Mandatory URL (can be same as iOS) | 🟡 Need to host |
| **Screenshots** (2-8) | Phone + Tablet layouts required | 🔴 Need to create |
| **Feature Graphic** | 1024×500 PNG | 🔴 Need to create |
| **Icon** | 512×512 PNG (square, no transparency) | ✅ Have |
| **Content Rating** | Questionnaire required | 🟡 Need to complete |

### App Signing
- [ ] Create upload key (Google Play Console)
- [ ] Configure app signing (Google manages)
- [ ] Build signed APK via EAS Build

### Required Permissions Declaration
```
Permissions Used:
- RECORD_AUDIO: For speech-to-text civics interview recording
- INTERNET: For Firebase, Analytics, AdMob
- CAMERA: Reserved for future features (video interviews)
- READ_EXTERNAL_STORAGE: Reserved for future features
```

### Content Rating Questionnaire
- [ ] Complete IARC questionnaire
- [ ] Age Category: 13+
- [ ] Content Rating: All ages (educational content)
- [ ] Advertising: Yes (AdMob)
- [ ] Privacy: Data collection declared

### Submission Checklist
- [ ] Build production APK via EAS Build
- [ ] Test on AVD emulator (API 33, API 35)
- [ ] Test on real Android device (minimum Android 7.0)
- [ ] Verify microphone permissions request
- [ ] Verify Firebase initialization
- [ ] Verify AdMob initialization
- [ ] Test all 128 civics questions load
- [ ] Verify no ANR (app not responding) errors
- [ ] Verify battery consumption is acceptable
- [ ] Create screenshots (2-8 images)
- [ ] Create feature graphic (1024×500)
- [ ] Write full app description (80-4000 chars)
- [ ] Complete content rating questionnaire
- [ ] Review privacy policy compliance
- [ ] Configure pricing: Free with ads
- [ ] Upload signed APK
- [ ] Submit for review (Target: within 2-3 hours, review typically 24-48h)
- [ ] Monitor review status daily

---

## Shared Requirements (Both Stores)

### Privacy & Legal Documents

#### 1. Privacy Policy
**Location:** Hosted on HTTPS domain (required)
**Must Include:**
- What data is collected
- How it's used (learning analytics, ad targeting)
- How long it's retained (30 days for analytics)
- User controls (clear data button in settings)
- Third-party services (Firebase, AdMob)
- Children's privacy (COPPA compliance for users <13)
- Contact for privacy questions

**Sample URL:** `https://civiceducation.example.com/privacy`

#### 2. Terms of Service
**Location:** Same domain as Privacy Policy
**Must Include:**
- License grant (limited use of the app)
- Restrictions (no reverse engineering, etc.)
- Data responsibility (user-generated content)
- Liability limitations
- Termination clause
- Dispute resolution

**Sample URL:** `https://civiceducation.example.com/terms`

#### 3. COPPA Compliance (if supporting <13)
- [ ] Parental gate for user accounts
- [ ] Parental consent verification
- [ ] Limited data collection for minors
- [ ] No behavioral targeting for <13 users
- [ ] Clear privacy communication

### Asset Requirements

#### Screenshots (Store-Specific)
**iOS Requirements:**
- Minimum: 5 screenshots per device type
- Sizes: iPhone (1170×2532 pixels), iPad (2048×1536 pixels)
- Text overlay: Feature highlights
- No QR codes
- All text must be legible

**Android Requirements:**
- Minimum: 2 screenshots (phone)
- Recommended: 8 (2 per device type: phone, 7-inch, 10-inch)
- Size: 1080×1920 pixels (phones), 1440×1440 (tablets)
- Text overlay: Feature highlights

**Content Suggestions:**
1. Screenshot: "Ace your civics test" - Quiz interface
2. Screenshot: "Interview mode" - Speech-to-text in action
3. Screenshot: "Get feedback" - Score and explanation
4. Screenshot: "Track progress" - Stats/analytics screen
5. Screenshot: "Follow-up questions" - Learning support feature

#### Feature Graphic (Android Only)
- **Size:** 1024×500 pixels
- **Content:** "Civic Citizenship - Learn Civics" with app icon
- **Style:** Same as app design system

### Testing Requirements

#### Functional Testing
- [ ] Start app successfully on real devices
- [ ] Complete at least 3 full quiz sessions
- [ ] Test microphone permission flow
- [ ] Test audio recording and transcription
- [ ] Verify all 10 initial questions load
- [ ] Test follow-up question flow (C/D grades)
- [ ] Verify scoring feedback displays correctly
- [ ] Test all UI screens for layout issues

#### Performance Testing
- [ ] App startup time < 5 seconds
- [ ] Quiz question load time < 2 seconds
- [ ] No UI lag during recording
- [ ] Memory footprint < 200MB
- [ ] Battery drain acceptable (< 10% per hour)
- [ ] Network requests complete within 5 seconds

#### Security Testing
- [ ] HTTPS used for all API calls
- [ ] Firebase rules properly configured (read-only public)
- [ ] No hardcoded secrets in code
- [ ] Microphone data not persisted to disk
- [ ] User data clearable from settings
- [ ] No sensitive data logged to console

#### Accessibility Testing
- [ ] Text size adjustable (iOS: Dynamic Type, Android: Font Size)
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Screen reader navigation functional
- [ ] Touch targets ≥ 48×48 dp
- [ ] No vibration/flash without toggle
- [ ] Keyboard navigation (if applicable)

#### Localization
- [ ] All strings properly extracted
- [ ] Numbers/dates formatted correctly
- [ ] RTL languages tested (future consideration)
- [ ] Emoji rendering correct

---

## Build & Release Process

### Production Build Configuration
```json
{
  "expo": {
    "name": "civic-citizenship",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.civiceducation.citizenship",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.civiceducation.citizenship",
      "versionCode": 1
    }
  }
}
```

### EAS Build Configuration
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project for EAS
eas build:configure

# Build for iOS
eas build --platform ios --auto-submit

# Build for Android
eas build --platform android --auto-submit
```

### Version Control Strategy
- **Build Version Increment Schedule:**
  - 1.0.0: Initial submission
  - 1.0.1: First patch (within 1 week if critical bugs found)
  - 1.1.0: Second release (2-4 weeks after launch, new features)
  - 2.0.0: Major features (3+ months)

---

## Monetization & Analytics Setup

### Firebase Analytics Events (Already Configured)
- `app_open`: User opens app
- `screen_view`: User navigates to screen
- `quiz_started`: Start quiz session
- `question_answered`: Submit answer
- `home_interview_cta_clicked`: Tap Interview CTA from Home
- `interview_started`: Begin interview session
- `interview_completed`: Finish interview mode
- `interview_followup_scored`: Complete follow-up question
- `ad_impression`: Ad shown
- `ad_click`: User clicks ad

### Analytics Verification Workflow
- Primary verification path: Firestore mirror collection `analytics_debug_events`
- Secondary verification path: Firebase DebugView when a valid analytics `measurementId` is available
- In-app verification surface: Admin screen `Analytics Verification` card
- Reference document: `FIREBASE_ANALYTICS_VERIFICATION.md`

### AdMob Setup (Required)
- [ ] Create AdMob account
- [ ] Link App ID (iOS)
- [ ] Link Package Name (Android)
- [ ] Create banner ad unit
- [ ] Create reward ad unit
- [ ] Test ads in development
- [ ] Switch to production ads before launch

### Revenue Tracking
- **Free with Ads Model**
  - Expected RPM: $0.50-$2.00 (education category lower)
  - Estimated monthly: $100-$500 (assuming 500-1000 daily active users)
- **Future Monetization:** In-app purchase for ad-free

---

## Marketing Collateral Checklist

### App Store Screenshots (Create These)
- [ ] Welcome/onboarding screen
- [ ] Quiz interface with question loading
- [ ] Interview mode recording screen
- [ ] Results/feedback screen
- [ ] Progress/analytics screen

### Video (Optional but Recommended)
- [ ] 15-30 second demo video
- [ ] Show quiz question → answer → feedback flow
- [ ] Highlight unique features (interview mode, follow-ups)
- **File Format:** MP4, H.264 codec, up to 500MB

### Social Media Assets
- [ ] App icon for social posting
- [ ] "Coming to iOS/Android" announcement graphics
- [ ] Launch day announcement posts
- [ ] Feature highlight graphics

---

## Pre-Launch Checklist (2 Weeks Before)

### Code Quality
- [ ] Run full test suite: `npm run validate:sprint1`
- [ ] No console errors in production build
- [ ] No TypeScript/ESLint warnings
- [ ] All imports resolved
- [ ] No hardcoded test values
- [ ] Analytics events properly formatted
- [ ] Analytics verification confirmed through Admin panel / Firestore mirror

### Configuration
- [ ] app.json version updated to 1.0.0
- [ ] Bundle identifiers set correctly
- [ ] Privacy policy URL configured
- [ ] Support email configured
- [ ] Firebase project linked
- [ ] AdMob ad units linked
- [ ] Environment variables set for production
- [ ] `npx eas whoami` confirms correct Expo owner
- [ ] `npx eas build:configure` completed if prompted

### Documentation
- [ ] README updated with latest features
- [ ] Installation instructions clear
- [ ] Feature list complete
- [ ] Known limitations documented
- [ ] Troubleshooting guide created
- [ ] Build preflight reviewed (`PRODUCTION_BUILD_PREFLIGHT.md`)
- [ ] Final smoke test plan reviewed (`FINAL_QA_SMOKE_TEST_CHECKLIST.md`)

### Team Preparation
- [ ] Apple Developer account activated
- [ ] Google Play Developer account activated
- [ ] Team members added with correct roles
- [ ] Payment methods configured
- [ ] Review process timeline communicated

---

## Post-Launch Plan

### Day 1 (Launch)
- [ ] Monitor app store reviews 3x daily
- [ ] Check analytics dashboard every 2 hours
- [ ] Have support team on standby

### Week 1
- [ ] Monitor crash reports
- [ ] Review user feedback
- [ ] Track installation metrics
- [ ] Identify top bugs

### Week 2-4
- [ ] Plan patch release if critical bugs found
- [ ] Gather user feature requests
- [ ] Analyze usage patterns
- [ ] Create roadmap for 1.1.0

### Ongoing
- [ ] Weekly analytics review
- [ ] Monthly feature planning
- [ ] Respond to store reviews (target: within 48h)
- [ ] Update changelog before each release

---

## Success Metrics

### Launch Requirements (MVP)
- [ ] 0 critical bugs in first 48 hours
- [ ] 4.0+ star rating (target)
- [ ] 500+ installs in first week
- [ ] 30% 7-day retention (typical for education apps)

### Growth Targets (First 3 Months)
- [ ] 5,000+ installs
- [ ] 1,000+ monthly active users
- [ ] 4.2+ star rating
- [ ] <2% crash rate

### Engagement Targets (Users)
- [ ] 50% complete 1st quiz session
- [ ] 30% try interview mode
- [ ] 20% use follow-up questions
- [ ] 15% return to app weekly

---

## Risk Management

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| Build fails for specific iOS version | Test on iOS 14, 15, 16, 17 |
| Microphone permissions denied | Graceful fallback to text input |
| Analytics not tracking | Manual testing before submission |
| Ads not loading | Fallback to banner if creative fails |

### Business Risks
| Risk | Mitigation |
|------|-----------|
| Slow review (30+ days) | Submit to both stores simultaneously |
| Negative reviews (low ratings) | Respond publicly, address bugs quickly |
| Low install rate | Follow SEO best practices in store listing |
| High crash rate | Comprehensive testing before submit |

### Legal Risks
| Risk | Mitigation |
|------|-----------|
| COPPA violation (<13 tracking) | Parental controls, clear data button |
| Missing privacy policy | Link mandatory, clear data practices |
| Trademark issues | Verify "Civic Citizenship" availability |

---

## Timeline Summary

```
Phase 4: Mar 28 - Mar 31
├─ Day 1: Home integration + CTA validation
├─ Day 2: Analytics event wiring + verification panel
├─ Day 3: Store assets + metadata
└─ Day 4: End-to-end testing + code freeze

Phase 5: Apr 1 - Apr 2
├─ Day 1: Build production binaries + preflight gate
└─ Day 2: Final QA + submit to both stores

Launch Window: Apr 1-7
├─ Monitor iOS approval status daily
├─ Monitor Android approval status daily
└─ Launch announcement when approved
```

### Execution Runbooks
- `PRODUCTION_BUILD_PREFLIGHT.md` - Tooling, credentials, and build gate
- `BUILD_CREDENTIALS_AND_ACCOUNTS_CHECKLIST.md` - External account blockers
- `SUBMISSION_CREDENTIALS_RUNBOOK.md` - Owner handoff for Expo / Apple / Google
- `SCREENSHOT_CAPTURE_RUNBOOK.md` - Exact screenshot capture workflow
- `FINAL_QA_SMOKE_TEST_CHECKLIST.md` - Post-build validation on both platforms
- `RELEASE_DAY_COMMAND_SHEET.md` - One-page command order for Apr 1-2

---

## Contacts & Resources

### Required Accounts
- [ ] Apple Developer Account: https://developer.apple.com/
- [ ] Google Play Developer Account: https://play.google.com/console
- [ ] Firebase Project: https://console.firebase.google.com/
- [ ] AdMob Account: https://admob.google.com/

### Documentation
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### Support Contacts
- Team Lead: [TO BE COMPLETED]
- App Store Submissions: [TO BE COMPLETED]
- Legal Review: [TO BE COMPLETED]
- Marketing: [TO BE COMPLETED]

---

## Approval Status
- [ ] Product Owner Review: __________
- [ ] Legal Review: __________
- [ ] Tech Lead Approval: __________
- [ ] QA Sign-off: __________

**Last Updated:** March 27, 2026  
**Next Review:** April 7, 2026 (before Phase 5)
