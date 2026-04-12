# Sprint 8-9 Capability and Revenue Expansion Plan

Status: not started
Sequence: Sprint 8 first, then Sprint 9

## Product Capability Vision (User-Centric)
The app should become a practical daily coach that:
- tells users exactly what to do next in short sessions
- adapts when they fall behind without guilt loops
- improves confidence for real civics interview outcomes
- supports family/squad accountability with low friction

## Revenue Vision (Trust-Centric)
Revenue should grow by increasing user-perceived value first:
- rewarded opportunities should feel helpful, not intrusive
- segmentation should personalize pacing, not pressure users
- holdout parity and fatigue caps must remain enforced

---

## Sprint 8: Capability Expansion (Outcomes)

### Objectives
- Raise session completion and next-day return
- Improve weak-topic recovery completion

### Scope
1. Smart mission engine
- daily mission
- weekly mission
- catch-up mission when user misses streak

2. Explain-why coaching cards
- short rationale after mistakes
- direct weak-topic drill link

3. Adaptive weekly plan regeneration
- combine mastery signals + urgency + test date proximity

4. Family accountability upgrades
- milestone-based nudges
- shared completion celebrations

5. 3D Learning Path (Glass Ascent)
- replace flat route view with a vertical helix or floating island chain presentation
- use a 3/4 isometric perspective with depth motion and parallax
- render each step of the existing auto-generated 3-step route as a glassmorphism squircle island
- apply fog-of-war: unlocked islands are clear, future islands are blurred/translucent

6. Haptic Scroll and Snap behavior
- magnetic snapping: each island springs into center focus while scrolling
- haptic dial click: emit Success Tock on each snap focus event
- parallax depth: background stars/mesh blobs move slower than path layer

7. Mastery signal fusion for 3D route
- urgency glow under islands linked to weak-area urgency signals
- trend indicators as energy lines between islands for 7-day trend continuity
- effort badge ghost avatar for squad member presence on same island

8. ADHD pacing layer on 3D route
- adaptive pacing nudge: if user scrolls rapidly without entering a step, trigger Soft Thud and suggest slower progression

### Success Metrics
- +10% session completion rate
- +8% next-day return rate
- +12% weak-topic drill completion rate
- +15% 3-step route entry rate from mastery surface

### Exit Criteria
- all mission flows stable in manual QA
- adaptive plans regenerate without regressions
- metrics move positively vs Sprint 6 baseline
- 3D route renders smoothly with snap/haptic feedback and no interaction regressions

### Sprint 8 Implementation Tasks (3D Path)
- [ ] 3D Path Component: build vertical scroll route using react-native-reanimated (or Three/Fiber if needed) for floating-island layout
- [ ] Haptic Dial Logic: map route snap points to HapticProvider click events
- [ ] Urgency Layer Integration: color islands dynamically from weak-area urgency map
- [ ] Adaptive Pacing Nudges: if scroll speed exceeds threshold without step entry, emit Soft Thud and show low-stress guidance

---

## Sprint 9: Revenue Expansion + Monetization Safety

### Objectives
- Increase revenue per active user while protecting retention

### Scope
1. Value-based rewarded bundles
- bonus drill bundle
- interview prep bundle
- weak-area rescue bundle

2. Revenue quality scoring
- completion quality score
- fatigue risk score
- bounce risk score

3. Dynamic pacing policy
- adjust cap multipliers by intent segment + session depth
- enforce cooldown/frequency safety limits

4. Monetization audit panel
- daily pacing
- holdout parity
- guardrail breaches
- top revenue surfaces with quality context

### Success Metrics
- +12% revenue per active user
- churn impact <= +2% relative
- fatigue-risk exposure reduced in low-intent segment

### Exit Criteria
- revenue lift achieved with guardrails green
- no holdout contamination
- audit panel fully populated and reviewed

---

## Dependencies and Order
1. Sprint 7 experiment outputs feed promotion logic and copy defaults
2. Sprint 8 capability improvements stabilize engagement
3. Sprint 9 applies monetization expansion on top of stronger engagement foundation
4. Deployment prep starts after Sprint 9 closure
