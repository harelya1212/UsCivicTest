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

9. Home Spatial UI refactor and safety guardrails
- Home entry should initialize the spatial 3D route runtime, with Mastery Map rendered as blurred background energy layer
- instrument 3D interactions vs fallback list/bento interactions for adoption measurement
- if 3D assets fail or runtime errors occur, fallback instantly to bento route (no blank/white screen)
- map active squad member pulse events from remote transport to island halo presence

10. Cinematic Fly-through hook
- trigger on APP_READY after Deep Swell signature
- animate from bird's-eye Mastery Map view to first-person current 3D island focus
- coordinate BlurView opacity + island scale/translate using reanimated
- trigger Success Tock when camera lands to signal control handoff

11. Focus-aware social nudge handling (Visual Queue)
- when Deep Focus is active, suppress interruptive nudge popups and suppress Double Knock audio
- represent inbound nudges as passive ambient signals on the active 3D island (glow dot or tiny friend avatar)
- fire Micro-Tick haptic only (tap-on-shoulder feel), not high-salience alerts
- queue incoming nudge events while suppression is active

12. Break-point social delivery and loop closure
- on flow exit, flush queued nudges into a frosted "Squad Energy" summary card
- summary copy style: "Your squad was cheering you on"
- include one-tap actions: Nudge Back and optional Mass Nudge
- Mass Nudge can be rewarded-gated and grants temporary squad energy bonus

13. Focus status and ambient presence
- publish focus status "In the Zone" to Family/Squad sync so peers see a glowing aura state
- map friend avatars to islands as ambient ghost presence in mid-ground layer
- when target user is in focus, sender-side nudge CTA shows "Silent Nudge" state

14. Nudge Back ghost interaction on completed islands
- show NudgeBack pill only when step_status == done and active_nudges > 0
- visual style: small glass pill with friend avatar + bolt/heart icon, spring entrance from island edge
- single tap sends immediate gratitude response (no confirmation)
- tactile + feedback: local Success Tock, remote Double Knock, dissolve-to-particles completion effect

15. Orbital emoji reaction picker (Long-Press Bloom)
- long-press NudgeBack pill blooms curated emojis around avatar (radial/orbital layout)
- slide-to-select interaction with Micro-Tick per emoji hit-box entry
- use spring animation for bloom in/out so emojis feel weighted
- if flow state is true, shrink picker by 20% and increase translucency for low-clutter mode

16. Spatial Home interaction layer hierarchy
- Foreground: 3D islands (vertical helix + haptic snapping)
- Overlay: Reaction Orb on completed islands (tap nudge back, long-press bloom)
- Mid-ground: Squad presence avatars with pulse halos
- Background: Blurred Mastery Map mesh reacting to focus state

17. Kinetic Streak Ghost (Love-at-First-Sight momentum entity)
- render a Ghost Runner (semi-transparent pulsing orb/trail) that follows user progression along the 3D helix
- map trail_intensity directly to focus_velocity telemetry for real-time momentum feedback
- color ramp shifts from calm blue to Miami-neon pink/purple as focus velocity climbs
- sync friend streak_intensity so squad ghosts are visible and scaled by streak depth (e.g., 10-day streak aura boost)

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
- [ ] Home Layer Stack: blurred Topic Radar/Trend/Urgency background + sharp foreground route islands + overlay dock
- [ ] Background Memoization: lock mastery background rerenders during active 3D scroll
- [ ] Variant Guardrails: production-safe fallback path to bento route when 3D route cannot initialize
- [ ] CameraFlyThrough: scripted landing transition from blurred data-engine layer to active route island
- [ ] Home route mount: spatial route is default when flag is enabled, fallback route remains production-safe
- [ ] Nudge Queue Manager: cache inbound Firestore nudge events while ad/focus suppression is active; flush on focus exit.
- [ ] Focus-Aware Delivery Rule: during focus, no modal nudge interruption and no Double Knock playback.
- [ ] Ambient Nudge Marker: show tiny avatar/glow marker on active island when queued nudges exist.
- [ ] Squad Energy Summary Card: render queued nudge recap card at break-point with "Nudge Back" + "Mass Nudge" actions.
- [ ] Focus Status Sync: publish/subscribe "In the Zone" status in Family/Squad transport layer.
- [ ] NudgeBack Visibility Guard: only render NudgeBack when active_nudges > 0 and step_status == done.
- [ ] Gesture Handler: implement LongPressGestureHandler for NudgeBack pill and slide-to-select flow.
- [ ] Radial Layout Math: use Math.cos/Math.sin to place 4-5 emojis in orbital ring around avatar.
- [ ] Nudge Response Payload: send nudge_response with response_type='gratitude' and optional reaction_id.
- [ ] Haptic Profiles: Micro-Tick on reaction hover, Success Tock on local send, remote Double Knock on recipient.
- [ ] Telemetry Additions: track nudge_back_sent, reaction_selected, queue_size_at_flush, and post-nudge session extension.
- [ ] Kinetic Ghost Particle Engine: render dynamic trail using react-native-canvas or Skia behind active island.
- [ ] Velocity Mapping Shader: bind trail_intensity to focus_velocity and update mesh-gradient tint in the same frame budget.
- [ ] Social Ghost Sync: broadcast streak_intensity over Firestore transport and visualize squad ghost states on route.
- [ ] Micro-Tick Streak Milestone: trigger Micro-Tick crackle on streak-of-5 momentum checkpoint.
- [ ] Ghost Visibility Guardrails: gracefully degrade to static glow if GPU budget or animation runtime degrades.

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

4. Context-aware monetization placement
- integrated Sponsor Island ad format with same glass styling and explicit value exchange
- Streak Shield prompt when streak-loss risk is detected (forgiving ad)
- deep-focus suppression and ad-light recovery windows remain enforced to protect retention
- Mass Nudge rewarded trade: watch 15s sponsor clip to nudge all queued friends + temporary squad effort bonus

5. Social monetization expansion
- premium emoji packs (cosmetic reactions) as one-time or high-effort unlock
- reward-gated Gold Nudge for multi-friend acknowledgement without session interruption
- reward-gated Ghost Ignite: watch 30s clip to boost ghost intensity (double XP-style bonus window)
- vanity Ghost skins (including motorsport-inspired silhouettes) as cosmetic monetization pack

6. Revenue quality scoring gate
- if retention/fatigue risk is low, allow safe ad-frequency elevation
- if retention/fatigue risk is high, reduce interruption pressure and prioritize optional rewarded surfaces

7. Monetization audit panel
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
