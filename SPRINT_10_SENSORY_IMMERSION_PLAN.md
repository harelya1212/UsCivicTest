# Sprint 10: Sensory Immersion & "Love at First Sight" Polish

## Goal
Elevate Civic Citizenship from a functional utility to a premium 2026 product by adding emotional, tactile, and social polish that resonates with both younger and older users.

## Why This Sprint
- For younger users: stronger momentum loops, more energy, and instant reward feedback.
- For older users: cleaner premium feel, confidence, and low-friction social flow.
- For the product: better stickiness, clearer brand identity, and stronger referral potential.

## Batch Plan

### Batch 1: The Sensory Signature (Audio + Haptics)
- Tactile Feedback Engine
  - Implement a HapticProvider that centralizes event-to-pattern mapping.
  - Replace generic system buzzes with named patterns:
    - Correct answer: Crystal Chime + Success Tock
    - Incorrect answer: Soft Thud
    - Progress completion: Wave
- Audio Branding
  - Add 0.8s "Deep Swell" launch signature sound to startup flow.
- Contextual Audio
  - Add "Double Knock" percussive cue for squad nudge receives.

### Batch 2: The Immersive Canvas (Visual Polish)
- Glassmorphism Overhaul
  - Apply layered translucency to bottom sheets and menus.
  - Use 20px-40px background blur where platform support is stable.
- Kinetic Typography
  - Animate milestone headers with subtle glow/twist on study milestones.
- Spring Animation Suite
  - Use elastic spring physics for card swipes and bento tilt interactions.
- Ghost Progress Visualization
  - Ambient social presence: when a squad member is studying, show a subtle pulsing aura around their shared Topic Radar segment.
  - Effort heatmap: replace list-only social effort views with a squishy 3D tile grid whose glow intensity follows study-hours ranking.
- Micro-Goal Confetti Logic
  - Haptic-visual sync when a pacing micro-goal is reached: Success Wave haptic + kinetic score pop/ripple.
  - Celebration style uses mesh gradients (moving soft color fields), not flat icon bursts.

### Batch 3: The Squad War Room (Advanced Social UX)
- Live Presence Halos
  - Green halo: currently studying.
  - Gold halo: high-accuracy streak window.
- Digital Presence Ghosts
  - Add low-clutter blurred shared heatmap showing effort energy, not private details.
- Squad Power-ups
  - Add shared boost monetization logic:
    - If one member completes rewarded ad, squad gets +20% effort points for 1 hour.
- Squad Live Pulse Events
  - Extend Firestore transport/session signaling so active card-swiping emits a lightweight live pulse event for presence/aura updates.

### Batch 4: The Brag-Ready Viral Layer
- Dynamic Social Cards
  - Generate high-contrast shareables featuring Topic Radar in a tech-noir visual style.
- Zero-Friction Invite
  - Optimize team invite lifecycle with rich media link previews including avatar + rank context.
- Brag-Card Template
  - Add a glassmorphism share-card template for high-energy group sharing moments.

### Sprint 8/9 Expansion Hooks (ADHD-Specific Polish)
- Focus Breathing UI
  - When low-clutter mode is active, background motion should follow a slow breathing rhythm.
- Adaptive Difficulty Nudges
  - If Interview mode sees three failed checks in a row, trigger Soft Thud and offer a Listen-and-Go review card automatically.

## Technical Definition: Haptic and Audio Trigger Mapping

### 1. Quiz Mode Triggers
- Correct Answer (Success Tock)
  - Trigger: onAnswerCorrect
  - Haptic: medium tap (15ms)
  - Audio: Crystal Chime
  - Intent: immediate positive reinforcement with premium confirmation
- Incorrect Answer (Soft Thud)
  - Trigger: onAnswerIncorrect
  - Haptic: low-intensity heavy pulse (40ms)
  - Audio: Soft Thud
  - Intent: low-stress correction cue (nudge, not punishment)
- Progress Ring Completion (Wave)
  - Trigger: Topic Radar or 7-day trend segment completion
  - Haptic: ramping hum over 200ms
  - Intent: make mastery progress feel alive and tangible

### 2. Interview Mode Triggers
- Recording Start (Listen Pulse)
  - Trigger: recording state changes to active
  - Haptic: single feather tap (5ms)
  - Intent: confirms listening state without visual dependency
- Successful STT Match (Validation Tick)
  - Trigger: interview scoring pass after speech processing
  - Haptic: two micro taps (10ms each)
  - Intent: premium tactile confirmation of understanding

### 3. Squad + Family Social Triggers
- Nudge Received (Double Knock)
  - Trigger: squad_nudge_event receive via Firestore/sync pipeline
  - Haptic: two medium pulses (heartbeat cadence)
  - Audio: Double Knock
  - Intent: personal and urgent, without becoming noisy

## Implementation Checklist
- [ ] Haptic Bridge: create HapticProvider and map runtime events in React Native/Expo.
- [ ] Audio-Haptic Sync: keep Crystal Chime and Success Tock within ~5ms sync.
- [ ] Silent Mode Logic: haptics still fire when Quiz TTS is muted.
- [ ] Interview Safety: interview haptics remain subtle to avoid microphone interference.
- [ ] Squad Trigger Wiring: nudge receive path emits Double Knock + haptic pattern exactly once.
- [ ] Visual Haptic Mirroring: each named haptic has matching micro-animation (ripple, blur, shake, or glow).
- [ ] Squad Live State: Firestore transport emits live pulse events during active study swipes.
- [ ] Brag-Card Template: glassmorphism shareable card finalized for viral sharing flow.

## Definition of Done
- Sensory Check: 100% of correct/incorrect answers trigger the mapped sensory signature (sound + haptic).
- Fluidity Check: all navigation transitions in scope use spring/morph logic with no hard cuts.
- Social Check: invite and join flow to War Room can be completed in under 3 taps.
- Emotional Check: manual QA confirms premium/"new" feel on two-device pass for age-range targets.

## Suggested Rollout Order
1. Batch 1 first for measurable tactile/auditory impact with minimal visual risk.
2. Batch 2 visual pass once sensory telemetry is stable.
3. Batch 3 social immersion with strict privacy defaults.
4. Batch 4 viral layer before deployment prep evidence capture.
