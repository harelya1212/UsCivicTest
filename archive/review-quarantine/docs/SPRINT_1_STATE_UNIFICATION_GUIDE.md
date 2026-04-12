# Sprint 1: State & Navigation Unification Audit & Standards

**Completion Date:** March 27, 2026  
**Status:** Foundation locked and validated

## Executive Summary

Sprint 1 establishes the canonical pattern for state management and navigation across the app to prevent future split-brain issues (similar to the root/src architecture drift we resolved). This document captures the audit findings and provides enforceable standards for future development.

---

## Current State Architecture (Validated)

### Global State Layer (App.js)
Manages the global app state through React Context (`AppDataContext`).

**App-level state (React.useState):**
```javascript
- onboardingComplete: boolean
- testDetails: object | null
- errorBank: array
- pausedSession: object | null
- adRuntime: object (ad/monetization runtime)
- masteryMap: object (learning progress)
```

**Persistence (AsyncStorage):**
```javascript
- PAUSED_SESSION_STORAGE_KEY
- AD_RUNTIME_STORAGE_KEY
- MASTERY_MAP_STORAGE_KEY
```

### Context API Surface (AppDataContext)
**Read-only:**
- `testDetails`, `adRuntime`, `masteryMap`, `errorBank`, `pausedSession`

**Mutations:**
- `setTestDetails()`, `trackAdEvent()`, `recordMasterySession()`
- `setPinnedOfferVariant()`, `resetOfferVariantStats()`, `resetAdAnalytics()`
- `unlockDailyFreePack()`, `maybeShowInterstitial()`
- `savePausedSession()`, `clearPausedSession()`
- `recordMasterySession()`, `resetMasteryMap()`
- `addErrorItem()`

### Navigation Structure
```
Stack.Navigator (root)
├─ Onboarding (conditional)
└─ MainTabs (post-onboarding)
   ├─ Tab.Screen: Home (HomeScreen)
   ├─ Tab.Screen: Mastery (MasteryMapScreen)
   ├─ Tab.Screen: Profile (ProfileScreen)
   └─ Tab.Screen: Admin (AdminScreen)

Modal/Stack Screens:
├─ EditTestDetails (modal-like, callback to App.js)
├─ Quiz (modal-like, persists state to context)
├─ Review (modal-like, uses context data)
├─ ModeSelector
├─ Family
└─ CaseProgress
```

---

## Issues Found in Sprint 1 Audit

### 1. **State Duplication (EditTestDetailsScreen)**
**Issue:** Local state mirrors context state, then calls `onSave` callback instead of directly calling `setTestDetails`.

**Impact:** Two-path mutation pattern and callback indirection; risk of desynchronization.

**Status:** FIXED in Sprint 1
- Consolidated to use context directly via `setTestDetails()` callback passed in context.

### 2. **Mock Local State (FamilyScreen)**
**Issue:** Hardcoded mock family array; not using any context or persistence.

**Impact:** Family features are UI-only and don't reflect real data or persist.

**Status:** KNOWN - Planned for Sprint 5 (Team + Family Real Sync)
- Currently acceptable as placeholder until backend is added.

### 3. **Admin Screen: Local State Sprawl (AdminScreen)**
**Issue:** 9+ `useState` hooks for dynamic data (president, governor, senators, etc.) that should be sourced from context or a unified admin state provider.

**Impact:** Hard to maintain, difficult to test, not persisted across sessions.

**Status:** DEFERRED - Acceptable for admin tool but should be consolidated if admin features scale.

**Recommendation:** Create `AdminDataContext` separate from app data if admin complexity grows beyond current scope.

### 4. **Dead Code (App-old.js)**
**Issue:** Old app implementation still present; not imported but increases confusion.

**Status:** MARKED FOR ARCHIVAL
- Documented in this file; not removed to preserve as reference until v2 development complete.
- Add .gitignore rule or move to archive folder if it causes confusion.

### 5. **Navigation Parameter Pattern Inconsistency**
**Issue:** Some screens pass complex objects via navigation params; others use context. No validation on params.

**Examples:**
- `Quiz` receives `type`, `forceQuestionCount`, `focusMode`, `topicFilter` as params.
- `Review` receives `score`, `total`, `type`, `weak` as params.
- But `HomeScreen` pulls `testDetails` and `adRuntime` from context instead.

**Status:** DOCUMENTED
- Both patterns are valid; params for "transient session data", context for "global state".
- See **Navigation Parameters Policy** below.

---

## State Management Standards (Sprint 1 Definition of Done)

### Rule 1: Context for Global, Persistent State
**Use `AppDataContext` when:**
- State is needed by multiple screens
- State should persist across session
- State changes should be reflected app-wide

**Example:** `testDetails`, `adRuntime`, `masteryMap`, `errorBank`

### Rule 2: Navigation Params for Transient Session Data
**Use `navigation.navigate(screenName, params)` when:**
- Data is specific to a single screen or navigation action
- Data does NOT need to persist
- Data is derived or filtered for one flow

**Example:** Quiz({ type, forceQuestionCount }), Review({ score, total, weak })

### Rule 3: Local State for UI-Only Ephemeral State
**Use `useState` when:**
- State is ephemeral (e.g., form input, toggle, animation frame)
- State is only meaningful to a single screen
- State does NOT affect other screens

**Example:** EditTestDetailsScreen's text inputs, AdminScreen's ecpm input fields, showMonthlyProjection toggle

### Rule 4: Avoid Direct AsyncStorage Calls in Screens
**Only App.js should call `AsyncStorage.getItem/setItem`.**
Screens should mutate state via context only; persistence happens in App.js effects.

**Allowed:** `const { adRuntime, trackAdEvent } = useContext(AppDataContext);`

**NOT Allowed:** `AsyncStorage.setItem('custom_key', value)` in a screen.

### Rule 5: Don't Duplicate Context State Locally
**Problem Pattern:**
```javascript
const { testDetails } = useContext(AppDataContext);
const [localDetails, setLocalDetails] = useState(testDetails);
// Now testDetails and localDetails can diverge
```

**Correct Pattern:**
```javascript
const { testDetails, setTestDetails } = useContext(AppDataContext);
// Mutate directly via context method
```

---

## Navigation Parameters Policy

### Approved Parameter Patterns

#### Quiz Screen
```javascript
navigation.navigate('Quiz', {
  type: 'naturalization128',           // Test type
  forceQuestionCount: 25,              // Override default
  focusMode: 'minimal',                // ADHD mode flag
  topicFilter: 'American Government',  // Topic filter
  skipInterstitial: false,             // Ad skip flag
});
```

#### Review Screen
```javascript
navigation.navigate('Review', {
  score: 18,                           // Session score
  total: 25,                           // Questions shown
  type: 'naturalization128',           // Test type
  weak: [                              // Weak topics
    { topic: 'Amendments', ratio: 0.4 },
  ],
});
```

### Important: Never Pass Complex Objects in Params Without Serialization
Navigation params are serialized under the hood. Objects with methods, circular refs, or large data should use context instead.

**NOT Allowed:**
```javascript
navigation.navigate('Quiz', { questionPool: [...questions] }); // ❌ Large arrays
navigation.navigate('Quiz', { callback: () => {} });            // ❌ Functions
```

**Allowed:**
```javascript
navigation.navigate('Quiz', { type: 'naturalization128' });
// Then QuizScreen reads full pool from context or generates it locally
```

---

## Context Methods Reference

### AppDataContext Canonical Methods

**User Profile:**
- `setTestDetails(details)` — Update test profile (name, testType, location, date)

**Ad Runtime:**
- `trackAdEvent(eventName | { eventName, experiments, phase, variantKey })` — Log ad event with optional variant tracking
- `getOfferVariant(variantKey)` — Get current offer variant (respects pinning)
- `setPinnedOfferVariant(variantKey, variantName)` — Pin a specific variant
- `resetOfferVariantStats()` — Clear variant experiment data (admin only)
- `resetAdAnalytics()` — Clear all ad analytics (admin only)
- `unlockDailyFreePack()` — Unlock rewarded free practice pack
- `maybeShowInterstitial(trigger | { trigger, sessionQuestionCount, score })` — Show interstitial ad if policy allows

**Learning Progress:**
- `recordMasterySession(sessionData)` — Record quiz completion and update mastery map
- `resetMasteryMap()` — Clear mastery data (admin only)

**Session Management:**
- `savePausedSession(sessionSnapshot)` — Persist incomplete quiz session
- `clearPausedSession()` — Remove saved session (e.g., after resume completes)

**Error Tracking:**
- `addErrorItem(question)` — Log a question the user got wrong

---

## Enforcement Mechanisms (Sprint 1 & Beyond)

### 1. ESLint Rule (Recommended Future Work)
Document a custom ESLint rule to flag:
- Direct `AsyncStorage` calls outside App.js
- `useState` for data that exists in context
- Navigation params with complex types

### 2. Code Review Checklist
Before merging a new screen, verify:
- [ ] Does it pull persistence state via context (not AsyncStorage)?
- [ ] Does it mutate state only via context methods (not local setState)?
- [ ] Are navigation params serializable (no functions/circular refs)?
- [ ] Are error cases handled (context methods are async)?

### 3. Documentation Standard
Every new screen should have a header comment:
```javascript
/**
 * ScreenName
 * 
 * State Sources:
 *   - Context: testDetails, adRuntime, masteryMap
 *   - Params: score (from Review flow)
 * 
 * Mutations:
 *   - recordMasterySession() — on quiz complete
 *   - trackAdEvent() — on ad interaction
 * 
 * Persistence: N/A (data persisted via context in App.js)
 */
```

---

## Sprint 1 Completion Checklist

- [x] Audit global state layer (App.js + AppDataContext)
- [x] Identify state duplication and divergence risk
- [x] Document canonical state management patterns
- [x] Consolidate EditTestDetailsScreen callback pattern
- [x] Validate navigation parameter usage across screens
- [x] Mark App-old.js as archived code
- [x] Create this standards document for future teams
- [x] Regression test all state mutations (via App.js trackAdEvent handler)

---

## Recommendations for Future Sprints

### Sprint 2+: Interview Mode & Listen-and-Go
- Add `audioMode` flag to AppDataContext (bool or enum)
- Pass audio session state via context (not params)
- Persist audio progress in mastery map

### Sprint 5: Team + Family Real Sync
- Create separate `TeamDataContext` for team/family state
- Wire to backend sync (not AsyncStorage; persist to API)
- Mark FamilyScreen's local state as deprecated

### Sprint 6: Revenue Intelligence
- Consider splitting `adRuntime` into smaller contexts if it grows beyond ~20 fields
- Add cohort/segmentation data to context for high-intent upsell logic

---

## Related Documents

- [SPRINT_PLAN_TRACKER.md](SPRINT_PLAN_TRACKER.md) — Sprint delivery timeline
- [App.js](../App.js) — Global state orchestration (canonical implementation)
- [context/AppDataContext.js](../context/AppDataContext.js) — Context API definition
- [scripts/validate-architecture-drift.js](../scripts/validate-architecture-drift.js) — Drift prevention validator
