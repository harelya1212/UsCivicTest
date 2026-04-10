# Sprint Plan Tracker

Status key: `not started` | `in progress` | `done` | `blocked`

## Goal
Ship the roadmap in a controlled sequence: stabilize architecture and data first, then deliver new modes, focus UX, collaboration, and monetization intelligence.

## Sprint 1 (Weeks 1-2): Foundation Lock + Data Guardrails
Status: `done`

- [x] Resolve duplicate architecture drift between root app and src tree
- [x] Unify navigation, shared state, analytics schema, and feature flags
- [x] Import usable fields from `app/civics-questions-2026-02-06.csv` (including why-this-answer and visual hooks)
- [x] Block `app/questions_ff_ready.csv` import until placeholders are replaced
- [x] Add validation checks for placeholder content in future imports

Definition of done:
- [x] Single runtime path documented and enforced
- [x] Trusted CSV imports pass, placeholder CSV imports fail validated
- [x] No regressions in quiz and monetization flows verified via Smart Queue tests
- [x] Canonical state/navigation patterns documented in SPRINT_1_STATE_UNIFICATION_GUIDE.md
- [x] Navigation validators created in utils/navigationValidators.js
- [x] App-old.js marked as archived with migration guide

## Sprint 2 (Weeks 3-4): Interview Mode v1 + Home Entry
Status: `in progress`

- [x] Build spoken prompt flow
- [x] Add answer capture
- [x] Add rubric scoring (clarity, completeness, accuracy)
- [x] Add follow-up questions based on weak dimensions
- [x] Add Interview quick action on Home
- [x] Track funnel analytics (start, responses, score, completion)
- [x] Hardened scoring against unseen phrasing (30/30 pass)
- [x] Module cleanup completed (ESM script compatibility + warning removal)
- [x] Checkpoint commit created for hardening + module cleanup
- [x] Follow-up skip flow polish: skip now advances to next question without re-trigger loop
- [x] Full regression rerun after polish: 12/12, 40/40, 30/30, Smart Queue 28 passed
- [ ] iOS simulator smoke pass (deferred - local Simulator.app has no available devices)

Definition of done:
- [x] End-to-end interview session completes
- [x] Scoring persisted and explainable
- [x] Admin surface shows interview funnel metrics
- [x] 8-stage funnel tracked: started → prompt played → recording started → response submitted → score revealed → follow-up shown → follow-up completed → session completed
- [x] Interview CTA visible on Home; quick-mode (3 questions, 5 min) launched from Home
- [x] No regressions in Quiz mode or monetization flows

## Sprint 3 (Weeks 5-6): Listen-and-Go + ADHD Focus Pack
Status: `not started`

- [ ] Build TTS question playback
- [ ] Add speed control and repeat
- [ ] Add screen-off-friendly queue behavior where OS allows
- [ ] Add low-clutter mode
- [ ] Add step pacing and micro-goals
- [ ] Add break nudges
- [ ] Add resume exactly where I was
- [ ] Add Listen quick action on Home

Definition of done:
- [ ] Full audio session works across a practice set
- [ ] ADHD pack toggles without progress loss
- [ ] Resume returns to exact question and context

## Sprint 4 (Weeks 7-8): Recovery + Modern Mastery Visualization
Status: `not started`

- [ ] Add weak-score recovery campaign (3-session path)
- [ ] Make first recovery session ad-light
- [ ] Add topic radar
- [ ] Add timeline trend strip
- [ ] Add weak-area urgency map
- [ ] Add next-step recommendations from visualization output

Definition of done:
- [ ] Weak users can complete structured recovery loops
- [ ] Visualizations reflect live mastery data correctly
- [ ] Recovery flow improves continuation to next session

## Sprint 5 (Weeks 9-10): Team Learning + Family Real Sync
Status: `not started`

- [ ] Add team creation and invite code
- [ ] Add shared goals and weekly challenge
- [ ] Upgrade Family mode from mock to real sync
- [ ] Add shared household board
- [ ] Add streak chain and parent-child nudges
- [ ] Add access control and anti-spam safeguards

Definition of done:
- [ ] Multiple users see synchronized team/family state
- [ ] Shared goals and streaks update reliably
- [ ] Invite and moderation controls prevent abuse

## Sprint 6 (Weeks 11-12): Scoreboard Seasons + Revenue Intelligence
Status: `not started`

- [ ] Add Team/Family scoreboard seasons with weekly reset
- [ ] Add rank tiers
- [ ] Add fair-play weighting by activity quality
- [ ] Add high-intent revenue segmentation
- [ ] Add comeback reward loops (day 2/day 5/day 10)
- [ ] Promote reward winner first, then copy winner
- [ ] Add confidence-decay auto-expiry for winner selection

Definition of done:
- [ ] Seasonal rankings remain stable and abuse-resistant
- [ ] Lift measured with holdout cohorts
- [ ] Winner automation expires/reverts correctly after confidence decay

## Cross-Sprint Guardrails
- [ ] Keep analytics events backward compatible unless migration is complete
- [ ] Require experiment sample-size threshold before winner promotion
- [ ] Enforce offer-frequency caps to reduce user fatigue
- [ ] Run regression test pass before sprint close

## Immediate Next Work (Ready Queue)
- [ ] Interview Mode flow polish and integration QA (active - pass 1 complete)
- [ ] Device/simulator smoke pass and release evidence capture (deferred blocker)
- [ ] Sprint 3 task breakdown into execution batches
