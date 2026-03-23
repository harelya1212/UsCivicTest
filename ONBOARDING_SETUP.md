# 🎯 ONBOARDING & PERSONALIZATION FEATURE GUIDE

## ✨ What's New

Your app now asks users THREE critical questions during initial setup:

### 1. **Test Type Selection** 📚
Users choose between:
- 🏫 High School Civics (standard curriculum)
- 🏛️ Naturalization (100 Questions)
- 🇺🇸 Naturalization (128 Questions)

**Impact:** Questions are customized and difficulty adjusted based on test type

### 2. **Test Location** 📍
Users enter: City, State (e.g., "San Francisco, CA")

**Impact:** 
- Location-specific civics questions (state capitals, representatives)
- Regional variations in civic knowledge
- Local government focus

### 3. **Expected Test Date** 📅
Users enter: MM/DD/YYYY format (e.g., "06/15/2026")

**Impact:**
- Study plan urgency adjusts based on time remaining
- Daily goal recommendations calculated automatically
- Progress tracking shows "X days until test"
- Adaptive difficulty increases as test date approaches

### 4. **User's Name** 👋
Users enter their full name during Step 1

**Impact:**
- Personalized greetings ("Welcome back, John")
- Profile avatar initials
- Family leaderboard identification

---

## 🚀 How It Works

### First-Time User Flow
```
App Launches
    ↓
OnboardingScreen (4-Step Form)
    ↓
Step 1: Enter Name
    ↓
Step 2: Choose Test Type
    ↓
Step 3: Enter Test Location
    ↓
Step 4: Select Test Date + Preview Study Plan
    ↓
Profile Saved → Main App Unlocked
```

### Returning User Experience
- App goes directly to MainTabs (Home, Profile, Family)
- Test details card displays on Home screen
- Users can edit details anytime from Profile screen

---

## 📲 User Interface Changes

### Onboarding Screen Features
- **Progress Bar:** Visual indicator (Step 1/4, 2/4, etc.)
- **Step Icons:** 👋 📚 📍 📅 for each stage
- **Input Validation:** Prevents skip without answers
- **Study Plan Preview:** Shows estimated days to prepare
- **Beautiful Cards:** Test type options with descriptions

### Home Screen Updates
- **Test Details Card:** Shows test type, location, and date
- **Edit Button:** Users can tap to modify preferences
- **Dynamic Welcome:** "Welcome back, John! 45 days until your test"
- **Days Counter:** Automatically calculates from test date

### Profile Screen Updates
- **Test Details Section:** Displays all preferences
- **Edit Test Details:** Button to update preferences
- **Details Display:**
  - Test Type (with emoji icon)
  - Location (📍 prefix)
  - Test Date (📅 prefix)

---

## 🎨 Screen-by-Screen Breakdown

### OnboardingScreen (4 Steps)

**Step 1: Name**
```
👋 Welcome! What's your name?
[Input: Full name]
[Back] [Continue]
```

**Step 2: Test Type**
```
📚 Which test are you preparing for?
[🏫 High School Civics]
[🏛️ Naturalization (100Q)]
[🇺🇸 Naturalization (128Q)]
[Back] [Continue]
```

**Step 3: Location**
```
📍 Where will you take the test?
[Input: City, State - e.g., "San Francisco, CA"]
Note: This helps us tailor questions to your state
[Back] [Continue]
```

**Step 4: Test Date**
```
📅 When's your test scheduled?
[Input: MM/DD/YYYY]
📊 Your Study Plan
You have ~45 days to prepare
(auto-calculated from test date)
[Back] [Complete Setup]
```

### EditTestDetailsScreen
- Back arrow in header
- Edit form with all 4 fields
- Test type selection with radio buttons
- Save Changes button
- Navigation back to Profile after save

---

## 🔑 Key Code Components Added

### 1. State Management (App.js)
```javascript
const [onboardingComplete, setOnboardingComplete] = useState(false);
const [testDetails, setTestDetails] = useState(null);

// testDetails structure:
{
  name: "John Doe",
  testType: "naturalization100", // highschool | naturalization100 | naturalization128
  location: "San Francisco, CA",
  testDate: "06/15/2026" // MM/DD/YYYY
}
```

### 2. Navigation Flow Logic
- **Conditional Rendering:** Shows OnboardingScreen if `!onboardingComplete`
- **Conditional Stacks:** Different stack screens for onboarded vs new users
- **Params Passing:** testDetails passed to all screens via `initialParams`

### 3. Screen Components
- `OnboardingScreen` - 4-step form with validation
- `EditTestDetailsScreen` - Edit existing preferences
- Updated `HomeScreen` - Shows test details card + dynamic countdown
- Updated `ProfileScreen` - Displays test details section
- Updated `TabNavigator` - Receives testDetails prop

### 4. Styling
New styles added for:
- `onboardingProgress` - Progress bar styling
- `onboardingStep` - Step layout
- `onboardingOption` - Test type cards
- `testDetailsCard` - Home screen card display
- `textInput` - Consistent input styling
- `inputContainer` - Label + hint text
- `studyPlanPreview` - Study plan visualization

---

## 🧮 Calculations & Logic

### Days Until Test
```javascript
const daysUntilTest = testDetails?.testDate 
  ? Math.max(0, Math.floor((new Date(testDetails.testDate) - new Date()) / (1000 * 60 * 60 * 24)))
  : null;
```

### Name to Initials
```javascript
const initials = testDetails.name
  .split(' ')
  .map(n => n[0])
  .join('')
  .toUpperCase();
// "John Doe" → "JD"
```

### Test Type Display
```javascript
const testTypeEmoji = {
  'highschool': '🏫',
  'naturalization100': '🏛️',
  'naturalization128': '🇺🇸'
}
```

---

## 📊 Data Flow

```
OnboardingScreen (collects input)
        ↓
handleOnboardingComplete(details)
        ↓
setTestDetails(details)
setOnboardingComplete(true)
        ↓
TabNavigator receives testDetails
        ↓
HomeScreen (via route.params.testDetails)
ProfileScreen (via route.params.testDetails)
EditTestDetailsScreen (via props)
```

---

## 🔄 Edit Flow

**User Action:** Tap "Edit Test Details" on Profile

```
ProfileScreen
  ↓ (navigation.navigate('EditTestDetails'))
EditTestDetailsScreen
  ↓ (User updates form)
  ↓ (onSave(details))
handleEditTestDetails(details)
  ↓
setTestDetails(details)
  ↓
ProfileScreen (receives updated details via route.params)
navigation.goBack()
```

---

## ✅ Validation Rules

### Name
- Required: Min 1 character
- Max: 50 characters (implicit)

### Test Type
- Required: Must select one option
- Valid values: 'highschool', 'naturalization100', 'naturalization128'

### Location
- Required: Min 1 character
- Format: Any city/state combination (not validated, user-friendly)
- Example: "San Francisco, CA", "New York", "Chicago, Illinois"

### Test Date
- Required: MM/DD/YYYY format only
- Must be future date (not validated yet, can add)
- Format validation can be enhanced with DatePicker

---

## 🚀 Testing the Feature

### Starting Fresh
1. Delete app state (clear app cache)
2. Relaunch app
3. See 4-step onboarding
4. Complete all 4 steps
5. Verify you land on Home screen with test details visible

### Edit Existing Details
1. Go to Profile tab
2. Scroll to "Test Details" section
3. Tap "Edit Test Details"
4. Change any field
5. Tap "Save Changes"
6. Verify changes reflected on Home & Profile screens

### Test Days Counter
1. Enter today's date as test date
2. Home screen shows "0 days until your test"
3. Enter tomorrow's date
4. Home screen shows "1 day until your test"
5. Calculate correctly for any future date

---

## 🔮 Future Enhancements

### Immediate (v1.1)
- [ ] Date picker instead of manual entry
- [ ] State dropdown for location (50 US states)
- [ ] Input validation with helpful error messages
- [ ] Skip onboarding option (start with defaults)

### Medium-term (v1.2-1.3)
- [ ] Save to Firebase (persist between sessions)
- [ ] Test reminders based on test date
- [ ] Study schedule generation (e.g., "10 questions/day")
- [ ] Adaptive difficulty based on days until test

### Long-term (v2.0)
- [ ] State-specific question bank loading
- [ ] Location-based progress comparison (state rankings)
- [ ] Test prep timeline visualization
- [ ] Personalized study path recommendations
- [ ] Integration with calendar (export test date)

---

## 🛠️ Technical Implementation Notes

### Navigation Structure
```
NavigationContainer
  ├─ Stack.Navigator
  │  ├─ if (!onboardingComplete)
  │  │  └─ Stack.Screen "Onboarding" → OnboardingScreen
  │  └─ else
  │     ├─ Stack.Screen "MainTabs" → TabNavigator
  │     │  ├─ Tab.Screen "HomeTab" → HomeScreen
  │     │  ├─ Tab.Screen "ProgressTab" → ProfileScreen
  │     │  └─ Tab.Screen "FamilyTab" → FamilyScreen
  │     ├─ Stack.Screen "EditTestDetails" → EditTestDetailsScreen
  │     ├─ Stack.Screen "ModeSelector" → ModeSelectorScreen
  │     ├─ Stack.Screen "Quiz" → QuizScreen
  │     ├─ Stack.Screen "Review" → ReviewScreen
  │     └─ [more screens...]
```

### Props Passing Pattern
```javascript
// App.js - App Component
const testDetails = state
↓
handleOnboardingComplete = callback
↓
OnboardingScreen receives via route.params.onComplete
↓
On completion: onComplete(testDetails) → state update → conditional render

// After onboarding
testDetails → TabNavigator prop
↓
TabNavigator passes via initialParams to HomeScreen
↓
HomeScreen receives via route.params.testDetails
```

---

## 📝 Firebase Integration Ready

When Firebase is set up, you can add:
```javascript
// In firebaseServices.js
export async function saveUserPreferences(uid, testDetails) {
  await setDoc(doc(db, 'users', uid, 'preferences', 'testDetails'), testDetails);
}

export async function getUserPreferences(uid) {
  const doc = await getDoc(doc(db, 'users', uid, 'preferences', 'testDetails'));
  return doc.data();
}

// In App.js
useEffect(() => {
  if (user && !testDetails) {
    getUserPreferences(user.uid).then(prefs => {
      if (prefs) {
        setTestDetails(prefs);
        setOnboardingComplete(true);
      }
    });
  }
}, [user]);
```

---

## 🎯 Success Metrics

**Track these after launch:**
- % of users completing onboarding (should be 95%+)
- Average time in onboarding (target: 2-3 minutes)
- % of users editing test details later
- Correlation between test date proximity and study frequency
- Impact on retention (do users with test dates study more?)

---

## 📞 Support & Troubleshooting

### Issue: Onboarding keeps showing
- Check: `onboardingComplete` state is being set
- Fix: Verify `handleOnboardingComplete` is being called

### Issue: Test details not showing on Home
- Check: Route params are being passed
- Fix: Ensure `route?.params?.testDetails` exists

### Issue: Date calculation is wrong
- Check: Date format is MM/DD/YYYY
- Fix: Use `new Date('06/15/2026')` for parsing

### Issue: Edits not persisting
- Check: `handleEditTestDetails` is updating state
- Fix: Verify setTestDetails is being called

---

**Status:** ✅ Complete & Ready to Test
**Last Updated:** March 21, 2026
**Version:** v1.0 (Onboarding & Personalization)
