# ACCELERATED EXECUTION PLAN
## April 1-7, 2026 Launch (Compressed Phase 4-5)

**Timeline**: Mar 28 - Apr 7 (11 days total)  
**Compression**: Phase 4 (10 days → 4 days) + Phase 5 (7 days → 2 days)  
**Status**: 🟢 ACTIVE - All prerequisites complete  
**Launch Target**: April 1-7, 2026 (Both stores)

---

## Timeline At A Glance

```
Mar 27 (Evening)  ✅ PREP COMPLETE
└─ All docs created, Interview CTA implemented

Mar 28-31 (Phase 4: 4 days) 🔄 HOME INTEGRATION SPRINT
├─ Mar 28: Home CTA + foundation
├─ Mar 29: Analytics setup
├─ Mar 30: Store assets
└─ Mar 31: Testing & freeze

Apr 1-2 (Phase 5: 2 days) 🚀 BUILD & SUBMIT
├─ Apr 1: Production builds
└─ Apr 2: Store submission

Apr 1-7 (Launch Window) 📱 GO LIVE
└─ Monitor approvals, launch when ready
```

---

## CRITICAL PATH (What Must Complete Each Day)

### ✅ DONE: Mar 27 (Evening Setup)
- [x] Interview CTA button implemented
- [x] Button styling created
- [x] Navigation to InterviewScreen
- [x] Analytics event tracked
- [x] All delivery plan docs created
- [x] Legal documents ready

**Status**: Interview Mode + Home ready for Phase 4

---

## PHASE 4: SPRINT (Mar 28-31)

### 🔴 CRITICAL: Mar 28 (TODAY - Day 1)

**What Must Happen**:
1. ✅ Test Interview CTA on simulators/emulators
2. ✅ Verify navigation works
3. ✅ Verify analytics event fires
4. ✅ Commit code to main branch
5. □ Plan analytics events for tomorrow

**Estimated Duration**: 4-6 hours

**Success Criteria**:
- Interview button visible on home ✅
- Clicking navigates to Interview ✅
- Analytics event logged ✅
- No console errors ✅
- Code committed ✅

**If Blocked**: 
- Interview doesn't navigate? → Check InterviewScreen imports
- Analytics doesn't log? → Check Firebase console + event handler

---

### 🟡 IMPORTANT: Mar 29 (Day 2 - Analytics Sprint)

**What Must Happen**:
1. Define all analytics event names in constants.js:
   - `app_open` - App launch
   - `screen_view` - Screen navigation
   - `quiz_started` - Quiz begins
   - `question_answered` - Question submitted
   - `interview_started` - Interview begins
   - `interview_completed` - Interview finishes
   - `interview_followup_scored` - Follow-up answered
   - `home_interview_cta_clicked` - CTA tapped

2. Implement event firing in:
   - HomeScreen: Interview CTA click
   - InterviewScreen: Start, complete, follow-up
   - QuizScreen: Start, question answer

3. Test in Firebase console:
   - Events appear in real-time
   - Properties included correctly

4. Create Firebase dashboards (optional but nice):
   - Funnel: Started → Completed
   - Event frequency by screen

**Estimated Duration**: 6-8 hours

**Success Criteria**:
- [ ] Events defined in constants.js
- [ ] Events firing in Firebase console
- [ ] All required events present
- [ ] Properties correct
- [ ] Code committed

**Critical**: All events must be firing by EOD Mar 29, or assets deadline impossible

---

### 🟡 IMPORTANT: Mar 30 (Day 3 - Assets Creation)

**What Must Happen**:
1. Create iOS App Store Screenshots (5-12 images):
   - Size: 1170×2532 pixels
   - Show: Home screen, Quiz, Interview, Results
   - Add text overlays: Feature descriptions
   - Get design approval

2. Create Android Play Store Screenshots (2-8 images):
   - Size: 1080×1920 pixels
   - Same content as iOS
   - Get design approval

3. Create Feature Graphic (Android only):
   - Size: 1024×500 pixels
   - Show: App icon + "Civic Citizenship" + tagline
   - Professional, colorful design

4. Prepare store listing text:
   - App description (4000 chars max)
   - Keywords (100 chars)
   - Short description (80 chars)

**Estimated Duration**: 8-10 hours (most time-consuming Phase 4 task)

**Success Criteria**:
- [ ] iOS screenshots created (5+ images)
- [ ] Android screenshots created (2+ images)
- [ ] Feature graphic created
- [ ] All images in correct sizes
- [ ] Store listing text finalized
- [ ] Design review approved
- [ ] Files saved in accessible location

**Critical**: All assets must be ready by EOD Mar 30 for Apr 1-2 store submission

**Quick Assets Strategy** (If time short):
- Use screenshots directly from running app (save via device)
- Use simple Canva templates for feature graphic
- Keep text overlays minimal
- Focus on clarity over fancy design

---

### 🔴 CRITICAL: Mar 31 (Day 4 - Test & Freeze)

**What Must Happen**:
1. Full end-to-end testing:
   - [ ] App launches without crashes
   - [ ] Home screen shows Interview CTA ✅
   - [ ] Click InterviewCTA → Interview loads ✅
   - [ ] Record answer → Score → Results
   - [ ] Get C/D grade → Follow-up appears
   - [ ] Complete follow-up → Continue to next
   - [ ] Quiz mode works (sanity check)

2. Validate all features:
   - [ ] Interview with 5+ questions
   - [ ] Multiple follow-up completions
   - [ ] Analytics events in Firebase
   - [ ] No console errors
   - [ ] No memory leaks (30-min session)

3. Performance testing:
   - [ ] Startup time < 5 seconds
   - [ ] Question load < 2 seconds
   - [ ] Memory < 200MB
   - [ ] Smooth animation/recording

4. Code freeze:
   - [ ] No more code changes
   - [ ] All commits to main
   - [ ] Tag version 1.0.0 in git
   - [ ] Document any known issues

**Estimated Duration**: 4-6 hours

**Success Criteria**:
- [ ] End-to-end flow works
- [ ] No blocking issues found
- [ ] All analytics confirmed
- [ ] Performance acceptable
- [ ] Code frozen for builds
- [ ] Ready for production binaries

**If Issues Found**:
- Blocking crash? → Fix immediately, re-test
- Performance slow? → Optimize critical paths only
- Analytics not firing? → Debug today, must work for launch

**If Testing Passes**:
→ READY FOR PHASE 5 BUILDS

---

## PHASE 5: BUILD & SUBMIT (Apr 1-2)

### 🚀 CRITICAL: Apr 1 (Day 1 - Production Builds)

**What Must Happen**:
1. Build production IPA (iOS):
   - [ ] Install EAS CLI (if not done)
   - [ ] Run: `eas build --platform ios`
   - [ ] Download IPA file
   - [ ] Verify integrity (SHA256)
   - [ ] Test on real iOS device (if possible)
   - [ ] Document build timestamp + git commit

2. Build production APK (Android):
   - [ ] Run: `eas build --platform android`
   - [ ] Download APK file
   - [ ] Verify integrity (SHA256)
   - [ ] Test on real Android device (if possible)
   - [ ] Document build timestamp + git commit

3. Backup builds:
   - [ ] Copy IPA & APK to secure location
   - [ ] Create checksums (MD5/SHA256)
   - [ ] Document version info
   - [ ] Save build logs

**Estimated Duration**: 2-4 hours (builds run in EAS)

**Success Criteria**:
- [ ] Both IPA & APK built successfully
- [ ] Files downloaded and verified
- [ ] Quick smoke test on device
- [ ] Ready for store submission Apr 2

**If Build Fails**:
- Check error logs in EAS console
- Most common: .env or configuration issue
- Re-check app.json bundle IDs
- May delay submission, but must launch Apr 2

---

### 🚀 CRITICAL: Apr 2 (Day 2 - Store Submission)

**What Must Happen**:

#### iOS App Store (Option 1: Fast-Track)
1. [ ] Open iTunes Connect / App Store Connect
2. [ ] Select "Civic Citizenship" app
3. [ ] Create new version 1.0.0
4. [ ] Upload IPA file
5. [ ] Wait for processing (5-10 min)
6. [ ] Add store listing metadata:
   - [ ] Description
   - [ ] Screenshots (upload 5+)
   - [ ] Keywords
   - [ ] Support URL / Privacy Policy
   - [ ] Content rating
   - [ ] Pricing (Free)
7. [ ] Review before submission
8. [ ] Submit for review

**Estimated Duration**: 1-2 hours

#### Android Google Play (Simultaneous)
1. [ ] Open Google Play Console
2. [ ] Select "Civic Citizenship" app
3. [ ] Create new release
4. [ ] Upload signed APK
5. [ ] Fill store listing:
   - [ ] Title, description
   - [ ] Screenshots (2-8)
   - [ ] Feature graphic
   - [ ] Privacy policy link
   - [ ] Content rating
   - [ ] Permissions explanation
6. [ ] Review before publishing
7. [ ] Publish to Play Store

**Estimated Duration**: 1-2 hours

#### Post-Submission
- [ ] Document submission time (both stores)
- [ ] Save confirmation emails
- [ ] Monitor for rejection (check email hourly)
- [ ] If rejected: Fix issue + resubmit same day
- [ ] If approved: Prepare launch announcement

**Success Criteria**:
- [ ] Both apps submitted to stores
- [ ] Submission confirmations received
- [ ] No errors in submission process
- [ ] Ready for launch window (Apr 1-7)

**Timeline Expectation**:
- iOS: Typically 1-3 days for review
- Android: Typically 24-48 hours for review
- Target: Both approved by Apr 4-5
- Launch announcement: Apr 1-7

---

## LAUNCH WINDOW: Apr 1-7

### Apr 1-2
- [ ] Apps under review in both stores
- [ ] Monitor email for any questions
- [ ] Prepare launch announcement
- [ ] Ready to go live when approved

### Apr 3-5 (Approval Window)
- [ ] Check app status 3x daily
- [ ] Respond immediately to any store questions
- [ ] If rejected: Fix and resubmit same day
- [ ] Track approval time estimations

### Apr 6-7 (Go Live)
- [ ] One/both apps approved ✅
- [ ] Post launch announcement
- [ ] Share app store links publicly
- [ ] Monitor first reviews and ratings
- [ ] Be ready for support questions

---

## DAILY STANDUP TEMPLATE

**Each Evening (5 min sync)**:

```
✅ COMPLETED TODAY:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

🎯 PLAN FOR TOMORROW:
- [ ] Task A
- [ ] Task B
- [ ] Task C

🚨 BLOCKERS/RISKS:
- None / Issue X (mitigation plan)

📊 STATUS:
- On track / At risk / Off track
```

---

## CRITICAL DEPENDENCIES & GOTCHAS

### Must Work Before Build (Apr 1)
✅ **Interview CTA** - Implemented, tested
✅ **Analytics events** - Must fire by Mar 29
✅ **Code freeze** - No changes after Mar 31
⚠️ **App icon** - Verify appears correctly
⚠️ **Bundle IDs** - Must match app.json exactly
⚠️ **Firebase config** - Must be production (not staging)

### Common Build Issues
- **Bundle ID mismatch** → App won't build, check app.json
- **Missing permissions** → Add to app.json before build
- **Firebase initialization** → Test in simulator Mar 31
- **Old certificates** → EAS auto-manages, shouldn't be issue

### Store Submission Gotchas
- **Privacy policy not accessible** → Must be on HTTPS domain
- **Misleading description** → Use only factual feature descriptions
- **Missing permissions explanation** → Microphone usage required
- **Screenshots too blurry** → Use minimum 1080×1920 (Android)
- **Rejection on review** → Most common: privacy policy issues

### Launch Gotchas
- **Both stores don't approve simultaneously** → Have backup plan
- **Low ratings on day 1** → Respond professionally within 48h
- **Download spike crashes analytics** → Not blocking, monitor only
- **Negative reviews about missing features** → Have roadmap ready

---

## SUCCESS CRITERIA FOR LAUNCH

### Prerequisites (Mar 28-31) ✅
- [x] Interview CTA working
- [x] Analytics ready
- [x] Store assets created
- [x] All testing passed
- [x] Code frozen

### Build & Submission (Apr 1-2)
- [ ] Production IPA downloaded & verified
- [ ] Production APK downloaded & verified
- [ ] Both apps submitted to stores
- [ ] No errors in submission process

### Launch Success (Apr 1-7)
- [ ] At least one app approved (ideally both)
- [ ] App live in at least one store
- [ ] Positive launch momentum
- [ ] User acquisition beginning

### Post-Launch (After Apr 7)
- [ ] 500+ installs
- [ ] 4.0+ star rating
- [ ] <5% crash rate
- [ ] 30% 7-day retention

---

## RESOURCE ALLOCATION

### Team Roles for Accelerated Sprint

| Role | Responsibility | Owner |
|------|---|---|
| **Dev Lead** | Code, builds, deployments | |
| **QA Lead** | Testing, validation | |
| **Product/Design** | Screenshots, store assets | |
| **Legal/Compliance** | Verify Privacy Policy URL | |
| **Analytics** | Event setup & validation | |
| **Launch Manager** | Store submissions, monitoring | |

**Team Commitment**: Everyone on-call Mar 28-Apr 2 (potential 12h days)

---

## ROLLOUT PLAN IF APPROVALS DELAYED

**Contingency (If Apr 2 Submission Rejected)**:

| Scenario | Action | Timeline |
|----------|--------|----------|
| Minor rejection (metadata) | Fix & resubmit same day | +1-2 hours |
| Privacy policy issue | Update policy page, link validation | +2-4 hours |
| Technical issue (crash) | Fix in code, rebuild, resubmit | +1 day |
| Both stores reject | Fix core issues, can still launch one | +1-2 days |

**Fallback**: If delayed past Apr 5, launch one store and follow with other

---

## MEASUREMENT (Launch Success Metrics)

### Hour 1
- [ ] Download links working
- [ ] App installations tracked
- [ ] No immediate crash reports

### Day 1 (Apr 7 or 8)
- [ ] 100+ installs
- [ ] 4.0+ average rating
- [ ] Zero critical bugs
- [ ] Analytics dashboard live

### Week 1
- [ ] 500+ installs
- [ ] 4.0+ average rating
- [ ] <5% crash rate
- [ ] 15-20% are interactive (opened app >1x)

### Month 1
- [ ] 2,000+ installs
- [ ] 4.0+ average rating
- [ ] 30% 7-day retention (education avg)
- [ ] Feature feedback collected

---

## ACCELERATION STRATEGY

To meet Apr 1-7 timeline, we're using:

1. **Pre-work completed** ✅
   - All docs created
   - Legal docs ready
   - Interview CTA implemented
   - → Saves 2-3 days

2. **Parallel execution**
   - Analytics setup happens while assets created
   - Build starts same day as submission
   - → Saves 1-2 days

3. **Lean assets approach**
   - Use real app screenshots (not custom design)
   - Simple feature graphic
   - Minimal text overlays
   - → Saves 1-2 days

4. **Minimal testing**
   - Focused on critical path only
   - No nice-to-have validation
   - Skip nice features if needed
   - → Saves 1 day

5. **Aggressive submission**
   - Submit both stores same day
   - No waiting for iOS before Android
   - → Saves 1 day

**Net Savings**: 5-7 days vs original 14-day process

---

## NEXT IMMEDIATE ACTIONS

### RIGHT NOW (Tonight, Mar 27)

1. [ ] Review this accelerated plan
2. [ ] Brief team on compression
3. [ ] Confirm resource availability Mar 28-Apr 2
4. [ ] Set up daily sync meeting (5 min, EOD)
5. [ ] Prepare testing devices for Mar 28

### TODAY (Mar 28)

1. [ ] Test Interview CTA on simulators
2. [ ] Verify Firebase event tracking
3. [ ] Commit code to main
4. [ ] Plan analytics events (draft list)
5. [ ] Block off calendars (all hands on deck)

### TOMORROW (Mar 29)

1. [ ] Implement all analytics events
2. [ ] Test in Firebase console
3. [ ] Start taking screenshots
4. [ ] Plan feature graphic design

### Mar 30

1. [ ] Complete all store assets
2. [ ] Get design review
3. [ ] Prepare store listing text
4. [ ] Final screenshot polish

### Mar 31

1. [ ] Run full end-to-end test
2. [ ] Verify all analytics
3. [ ] Performance validation
4. [ ] CODE FREEZE
5. [ ] Ready for Apr 1 builds

### Apr 1

1. [ ] Build IPA (iOS)
2. [ ] Build APK (Android)
3. [ ] Test on real devices
4. [ ] Prepare for submission

### Apr 2

1. [ ] Submit to App Store
2. [ ] Submit to Google Play
3. [ ] Monitor for questions
4. [ ] Prepare launch announcement

### Apr 1-7

1. [ ] Monitor app approval status
2. [ ] Launch when both approved
3. [ ] Track initial metrics
4. [ ] Respond to early reviews

---

## CONTACT & ESCALATION

### Critical Issues (Stop Work)
- Build error
- Analytics not firing
- Interview mode crashes
- **Action**: Immediate debugging + fix same day

### Blocking (Can't Continue)
- Screenshots taking too long
- Store asset design feedback slow
- **Action**: Use fallback templates, proceed

### Non-Blocking (Monitor)
- Minor UI polish
- Edge case crashes
- **Action**: Log for v1.0.1, don't block launch

---

**Status**: 🟢 READY FOR PHASE 4 SPRINT  
**Start**: TODAY (Mar 28)  
**End**: Apr 2 (Submission)  
**Launch**: Apr 1-7 (Go Live)  
**Target**: April 1-7, 2026

---

*Document created: March 27, 2026*  
*Next update: Every evening (progress + next day plan)*  
*Questions: Refer to [PHASE_4_KICKOFF.md](PHASE_4_KICKOFF.md) or [APP_STORE_SUBMISSION_PLAN.md](APP_STORE_SUBMISSION_PLAN.md)*
