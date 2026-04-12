# Day 11 Testing Checklist - Interview CTA Integration

**Date**: March 28, 2026  
**Feature**: Interview Mode CTA Button on HomeScreen  
**Status**: ✅ Code Complete - Ready for Testing

---

## Code Implementation Verification ✅

### Files Modified
- ✅ `screens/HomeScreen.js` - Interview CTA button added (lines 336-351)
- ✅ `styles.js` - Button styles added (interviewCtaButton, interviewCtaButtonText, interviewCtaButtonSub)
- ✅ `constants.js` - APP_EVENT_NAMES.HOME_INTERVIEW_CTA_CLICKED defined
- ✅ `firebaseConfig.js` - measurementId added for web analytics (G-DEMOKEY1234567890)

### Implementation Details
```
Button Component:
- Icon: 🎤 microphone-outline (28px, white)
- Text: "Start Interview Mode"
- Subtitle: "🎤 Answer with your voice • Get instant feedback"
- Color: Purple (#7C3AED) background
- Analytics Event: home_interview_cta_clicked
- Navigation Target: Interview screen
```

---

## Manual Testing Checklist

### Device: iPhone Simulator

#### 1. Visual Verification
- [ ] Open HomeScreen and scroll down to Interview CTA button
- [ ] Button appears AFTER "Start Practice Quiz" button
- [ ] Button has purple background (#7C3AED)
- [ ] Microphone icon displays (white, 28px)
- [ ] Text reads "Start Interview Mode" (white, bold)
- [ ] Subtitle reads "🎤 Answer with your voice • Get instant feedback" (white, smaller)
- [ ] Right arrow icon displays (white, 20px)
- [ ] Button has proper shadow/elevation effect
- [ ] Button is fully clickable (no UI cutoff)

#### 2. Interaction Testing
- [ ] Tap Interview CTA button
- [ ] Navigation to InterviewScreen occurs immediately
- [ ] No crashes or console errors
- [ ] Previous quiz session is cleared (clearPausedSession called)
- [ ] App returns to HomeScreen when Interview back button tapped
- [ ] Can tap Interview CTA multiple times without issues

#### 3. Analytics Event Testing
- [ ] Check browser DevTools or Firebase debug collection for event
- [ ] Event name: `home_interview_cta_clicked`
- [ ] Event includes parameter: `from_screen: "HomeTab"`
- [ ] Event timestamp is correct
- [ ] Event reaches Firebase or Firestore debug mirror

#### 4. Accessibility Testing
- [ ] Button is tappable (min 48px height for iOS)
- [ ] Button text contrasts with purple background
- [ ] VoiceOver can identify button text and icon
- [ ] Button responds to accessibility focus

---

### Device: Android Emulator

#### 1. Visual Verification
- [ ] Button renders with correct purple background
- [ ] Microphone icon displays at correct size
- [ ] Text and subtitle display correctly
- [ ] Shadow/elevation renders properly on Android
- [ ] Button scales correctly for different screen sizes

#### 2. Interaction Testing
- [ ] Tap Interview CTA button on Android
- [ ] Navigation to InterviewScreen works
- [ ] No crashes
- [ ] Back button returns to HomeScreen

#### 3. Analytics Event Testing
- [ ] Event fires on Android tap
- [ ] Event data matches iOS event
- [ ] Platform value in debug event is "android"

---

## Firebase Analytics Verification (Day 12)

### Pre-requisites
- [ ] Firebase credentials configured in firebaseConfig.js
- [ ] Project has Google Analytics enabled
- [ ] measurementId is valid (replace demo key)

### Events to Monitor
```javascript
Event: home_interview_cta_clicked
Parameters:
  - from_screen: "HomeTab"
  - debug_mode: true (if __DEV__)
  - timestamp: auto
```

---

## Pass/Fail Criteria

### ✅ PASS if:
1. Button renders with correct styling on both iOS & Android
2. Navigation to InterviewScreen works without crashes
3. Analytics event fires and reaches Firebase/Firestore
4. No console errors or warnings
5. Back navigation works smoothly
6. Button is accessible via touch and screen readers

### ❌ FAIL if:
1. Button doesn't render or is invisible
2. Navigation crashes the app
3. Analytics event doesn't fire
4. Console errors appear
5. Button becomes unresponsive after multiple taps
6. Text or icons display incorrectly

---

## Testing Timeline
- **iOS Simulator**: ~5-10 minutes
- **Android Emulator**: ~5-10 minutes
- **Firebase Verification**: ~10 minutes (Day 12)
- **Total**: ~30 minutes

---

## Next Steps After Passing
1. Commit code: `git add . && git commit -m "feat: add Interview Mode CTA to HomeScreen"`
2. Create PR for review
3. Move to Day 12: Analytics Event Tracking setup
4. Create Firebase dashboard for monitoring
5. Run full end-to-end test suite

---

## Debugging Notes

If button doesn't appear:
- Check HomeScreen.js syntax around line 336-351
- Verify styles.js has interviewCtaButton definitions
- Check import of MaterialCommunityIcons
- Verify navigation prop is available

If navigation fails:
- Check that 'Interview' route exists in App.js Stack.Navigator
- Verify InterviewScreen component is imported
- Check console for route name typos

If analytics doesn't fire:
- Verify APP_EVENT_NAMES.HOME_INTERVIEW_CTA_CLICKED is defined
- Check analyticsService.js is imported in HomeScreen
- Verify trackAppEvent function is available in context
- Check Firebase credentials are valid

---

## Date Completed
- [ ] Started: March 28, 2026
- [ ] Passed: March 28, 2026
- [ ] Code Committed: March 28, 2026
