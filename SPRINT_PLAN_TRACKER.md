# Sprint Plan Tracker

Status key: `not started` | `in progress` | `done` | `blocked`

## Goal
Ship the roadmap in a controlled sequence: stabilize architecture and data first, then deliver new modes, focus UX, collaboration, and monetization intelligence.

## Status Dashboard (Web)
- Color status page: [sprint-plan.html](sprint-plan.html)
- Primary checklist source of truth: [SPRINT_PLAN_TRACKER.md](SPRINT_PLAN_TRACKER.md)
- Current stop point: Sprint 6 is closed with manual validation complete; next active work is Sprint 7 experiment planning and execution, then capability/revenue expansion and deployment prep

## Latest Evidence Log
- `Evidence Summary | sprint=2 | date=2026-04-10 | owner=Copilot | passed=4/4 | blocked=1 | next=Close runtime flow-polish QA on real device`
- `Evidence | Sprint 2 | Regression rerun | status=done | date=2026-04-10 | interview=12/12 | comprehensive=40/40 | unseen=30/30 | smartQueue=28`
- `Evidence Summary | sprint=3 | date=2026-04-10 | owner=Copilot | passed=3/3 coding batches + telemetry | blocked=0 | next=Strict runtime-manual closure pass (B1/B2/B3)`
- `Evidence Summary | sprint=3 | date=2026-04-10 | owner=Copilot | status=in-progress | scope=Manual Listen + resume + focus-pack runtime validation sweep | runtime=localhost:8081 (already running)`
- `Evidence | Sprint 3 | Batch 4 integration | status=done | date=2026-04-10 | implemented=quiz_listen_auto_advanced wired to Admin funnel + synthetic validator + runtime script`
- `Evidence | Sprint 3 | Admin validation pass | status=done | date=2026-04-10 | event=quiz_listen_auto_advanced | method=analytics_debug_events count check | before=0 | after=1 | delta=+1`
- `Evidence | Sprint 3 | Exact resume reliability | status=done | date=2026-04-10 | implemented=debounced checkpoint autosave for active quiz state to restore latest context after abrupt exits`
- `Evidence | Sprint 5 | Team sync foundation | status=done | date=2026-04-10 | implemented=persistent squad state + invite code lifecycle + weekly goal/challenge controls in Family screen`
- `Evidence | Sprint 5 | Household board + streak + anti-spam | status=done | date=2026-04-10 | implemented=shared household board UI/model + streak chain updates + nudge/invite anti-spam controls`
- `Evidence | Sprint 5 | Roles + per-member cooldown + reconciliation | status=done | date=2026-04-10 | implemented=parent/admin permissions + per-target nudge cooldown map + field-clock revision conflict merge baseline`
- `Evidence | Sprint 5 | Remote sync transport pull/push | status=done | date=2026-04-10 | implemented=Firestore squads/{teamId} snapshot pull every 15s + debounced push on revision updates + reconcile merge on pull`
- `Evidence | Sprint 5 | Moderation policy hardening | status=done | date=2026-04-10 | implemented=role rate buckets + temporary mute + escalation counters + audit trail persisted in squads/{teamId}/auditTrail`
- `Evidence | Sprint 5 | Server-authoritative moderation enforcement | status=done | date=2026-04-10 | implemented=Firestore transaction-based policy decisions + server-written revision/fieldClock updates + authoritative audit writes`
- `Evidence | Sprint 5 | Admin moderation controls | status=done | date=2026-04-10 | implemented=Admin panel controls to refresh server snapshot, clear actor mute, reset escalation, reset rate buckets, and clear local audit trail`
- `Evidence Summary | sprint=5 | date=2026-04-11 | owner=Copilot | status=done | run=Measured two-runtime conflict-validation rerun | teamId=sprint5-two-runtime-2026-04-11 | file=SPRINT_5_TWO_DEVICE_VALIDATION_CHECKLIST.md`
- `Evidence | Sprint 5 | Conflict scenario: simultaneous edits | status=done | date=2026-04-11 | teamId=sprint5-two-runtime-2026-04-11 | A.rev=4->5 | B.rev=4->5 | weeklyGoal=3->4 | inviteCode=BASE123->INV7364 | board=board-1 false->true | converged=true`
- `Evidence | Sprint 5 | Conflict scenario: mute/escalation propagation | status=done | date=2026-04-11 | actorId=actor-validation-child | actionType=nudge_send | rateLimitHitAttempt=5 | muteUntil=2026-04-11T01:22:40.155Z | escalation=0->1 | runtimeBReason=temporary_mute | propagated=true`
- `Evidence | Sprint 5 | Conflict scenario: audit trail consistency | status=done | date=2026-04-11 | docIds=q7Y0LDEUUMB5zgxbzcF5,lw0bUU1FJdlTfD2OJkA8,hV4xgKUt7hyS4XRFrijH,tQ0UjgJtIF4NifcStA03,ZWwpRV84eN6uzg11fpcU,SRibUPNti9WrLA3PJnvf | allowed=audit-1775869959317-se6vt3:ok | blocked=audit-1775869962106-nrgcvp:temporary_mute | reasonMatch=true | timestampsMonotonic=true`
- `Evidence Summary | sprint=6 | date=2026-04-11 | owner=Copilot | status=in-progress | kickoff=done | plan=SPRINT_6_EXECUTION_PLAN.md | next=S6-B1 Season Engine + Rank Tiers`
- `Evidence | Sprint 6 | Season rollover + rank tiers | status=done | date=2026-04-11 | method=node scripts/test-sprint6-season-engine.mjs | previousSeason=season-expired-window | nextSeason=season-2026-04-06 | resetAt=2026-04-06T00:00:00.000Z | members=4 | tiers=bronze:2,silver:1,gold:1,platinum:0 | deterministic=true | result=pass`
- `Evidence | Sprint 6 | Fair-play weighting | status=done | date=2026-04-11 | members=4 | rawLeader=steady-ava | weightedLeader=steady-ava | antiSpamDelta=-460 | result=pass`
- `Evidence | Sprint 6 | Segmentation scaffold | status=in-progress | date=2026-04-10 | implemented=season intentSegment+intentScore+signals fields and Admin intent segment counts panel | result=pass`
- `Evidence | Sprint 6 | Segmentation transitions + cap policy | status=in-progress | date=2026-04-10 | implemented=previous->current intent transition summary in season state + Admin transition counts table + segment-based offer frequency multipliers for rewarded/interstitial gating | result=pass`
- `Evidence | Sprint 6 | Transition analytics instrumentation | status=in-progress | date=2026-04-10 | implemented=segment_transition and offer_cap_decision events + Admin 7-day trend table from mirrored analytics events | result=pass`
- `Evidence | Sprint 6 | Segmentation trend validation hook | status=in-progress | date=2026-04-11 | implemented=Admin synthetic trigger for segment_transition + offer_cap_decision events to populate trend rows on demand | result=pass`
- `Evidence | Sprint 6 | Segmentation analytics validation | status=done | date=2026-04-11 | method=node scripts/test-sprint6-segmentation-analytics.mjs | segmentTransitionBefore=0 | segmentTransitionAfter=1 | offerCapDecisionBefore=0 | offerCapDecisionAfter=2 | delta=segment_transition:+1,offer_cap_decision:+2 | result=pass`
- `Evidence | Sprint 6 | Comeback scheduler scaffold | status=in-progress | date=2026-04-11 | implemented=persistent D2/D5/D10 comeback window derivation + comeback_triggered analytics + Admin comeback diagnostics card | result=pass`
- `Evidence | Sprint 6 | Comeback reward claim path | status=in-progress | date=2026-04-11 | implemented=claimComebackReward runtime action + Home CTA for active D2/D5/D10 window + comeback_reward_claimed analytics | result=pass`
- `Evidence | Sprint 6 | Comeback loops | status=done | date=2026-04-11 | method=node scripts/test-sprint6-comeback-loops.mjs | D2=1 | D5=1 | D10=1 | triggerAccuracy=pass`
- `Evidence | Sprint 6 | Reward-first winner pipeline | status=done | date=2026-04-11 | method=node scripts/test-sprint6-winner-confidence-decay.mjs | rewardFirstGate=pass | copyBlockedWithoutReward=pass | rewardWinner=extended | copyWinner=urgency | result=pass`
- `Evidence | Sprint 6 | Winner confidence decay | status=done | date=2026-04-11 | method=node scripts/test-sprint6-winner-confidence-decay.mjs | winnerId=extended | confidenceStart=0.833 | confidenceEnd=0.34 | expired=true | result=pass`
- `Evidence | Sprint 6 | Holdout cohort scaffold | status=in-progress | date=2026-04-11 | implemented=deterministic revenue_intelligence cohort assignment + Admin cohort visibility + experiment_cohort_assigned analytics | result=pass`
- `Evidence | Sprint 6 | Holdout cohort validation | status=done | date=2026-04-11 | method=node scripts/test-sprint6-holdout-cohort.mjs | treatmentBucket=59 | holdoutBucket=15 | deterministic=true | splitRespected=true | result=pass`
- `Evidence | Sprint 6 | Treatment-only revenue gating | status=done | date=2026-04-11 | method=node scripts/test-sprint6-treatment-gating.mjs | treatmentRewardVariant=extended | holdoutRewardVariant=standard | treatmentRewardedDailyMult=1.25 | holdoutRewardedDailyMult=1 | treatmentComebackWindow=d2 | holdoutComebackWindow=none | result=pass`
- `Evidence | Sprint 6 | Web runtime QA launch | status=blocked | date=2026-04-11 | method=npm run web -- --port 19006 | bundle=pass | pageOpened=true | blocker=browser_content_tools_not_enabled`
- `Evidence | Sprint 6 | Manual Home/Admin QA closeout | status=done | date=2026-04-12 | runtime=http://localhost:19006 | steps=6/6 | cohortOverride=treatment+holdout pass | selfCheckPaths=pass | copySummary=pass | homeScroll=pass | adminStability=pass`
- `Evidence | Backlog Quick Fixes | status=done | date=2026-04-12 | implemented=Admin inline copy feedback + Home scroll-to-top + Admin offer-rows memoization | result=pass`

## Practical Next Checklist

Sprint 5 strict two-device validation:
- [x] Create strict runbook: [SPRINT_5_TWO_DEVICE_VALIDATION_CHECKLIST.md](SPRINT_5_TWO_DEVICE_VALIDATION_CHECKLIST.md)
- [x] Execute checklist pass and log scenario-level evidence
- [x] Re-run with two active runtimes and replace blocked entries with measured values

Sprint 6 kickoff:
- [x] Create execution plan: [SPRINT_6_EXECUTION_PLAN.md](SPRINT_6_EXECUTION_PLAN.md)
- [x] Implement S6-B1: season engine + weekly reset + rank tiers
- [x] Add Sprint 6 analytics events and Admin diagnostics hooks
- [x] Capture Sprint 6 batch evidence lines and keep dashboard synced

Sprint 2 immediate:
- [ ] Run one full Interview end-to-end on real runtime
- [ ] Verify 8-stage interview funnel events in Admin
- [ ] Capture evidence for flow polish complete
- [ ] Resolve device smoke blocker by testing on physical iPhone if simulator is unavailable

Sprint 3 after that:
- [ ] Complete B1 manual Listen walkthrough
- [ ] Complete B2 resume stress pass (5 cycles)
- [ ] Complete B3 focus/pacing/break-nudge UX sweep
- [ ] Mark those checkboxes in [SPRINT_PLAN_TRACKER.md](SPRINT_PLAN_TRACKER.md) and keep [sprint-plan.html](sprint-plan.html) in sync

### Active Run: Sprint 3 Runtime Sweep (2026-04-10)
Status: `skipped — return later`
Runtime target: `http://localhost:8081`

- [ ] B1 Listen walkthrough complete *(skipped 2026-04-10)*
- [ ] B1 Admin listen events verified *(skipped 2026-04-10)*
- [ ] B2 Resume stress 5/5 complete *(skipped 2026-04-10)*
- [ ] B3 Focus-pack UX sweep complete *(skipped 2026-04-10)*
- [ ] B3 Admin focus events verified *(skipped 2026-04-10)*

> Skipped to implement Screen-off-friendly queue behavior. Return to close these when ready.

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
Status: `in progress`

- [x] Create Sprint 3 execution batch plan (B1-B4)
- [x] Build TTS question playback (Quiz Listen mode)
- [x] Add speed control and repeat (0.75x / 1.0x / 1.25x)
- [x] Add screen-off-friendly queue behavior where OS allows (auto-save on background)
- [x] Add low-clutter mode (Focus/Classic toggle in Quiz)
- [x] Add step pacing and micro-goals (header step-goal indicator)
- [x] Add break nudges (prompt every 6 answered questions)
- [x] Add resume exactly where I was (exact pointer metadata + listen-mode context restore)
- [x] Add Listen quick action on Home
- [x] Complete Sprint 3 analytics event audit (Listen + Focus-pack telemetry)

Definition of done:
- [ ] Full audio session works across a practice set
- [ ] ADHD pack toggles without progress loss
- [ ] Resume returns to exact question and context

## Sprint 4 (Weeks 7-8): Recovery + Modern Mastery Visualization
Status: `in progress`

- [x] Add weak-score recovery campaign foundation (3-session path scaffold in Review)
- [x] Make first recovery session ad-light (session 1 starts without rewarded unlock)
- [x] Add topic radar
- [x] Add timeline trend strip
- [x] Add weak-area urgency map
- [x] Add next-step recommendations from visualization output (auto-generated 3-step study route)
- [x] Onboarding state-picker clarity polish (dimmed placeholder + selected-state confirmation)
- [x] Add selected-state identity cues (state code + exact state-flag image)
- [x] Profile personalization polish (camera/library photo + remove photo + nickname auto-save on blur)

Definition of done:
- [ ] Weak users can complete structured recovery loops
- [ ] Visualizations reflect live mastery data correctly
- [ ] Recovery flow improves continuation to next session

## Sprint 5 (Weeks 9-10): Team Learning + Family Real Sync
Status: `in progress`

- [x] Add team creation and invite code
- [x] Add shared goals and weekly challenge
- [x] Upgrade Family mode from mock to real sync
- [x] Add shared household board
- [x] Add streak chain and parent-child nudges
- [x] Add access control and anti-spam safeguards

Definition of done:
- [x] Multiple users see synchronized team/family state
- [x] Shared goals and streaks update reliably
- [x] Invite and moderation controls prevent abuse

## Sprint 6 (Weeks 11-12): Scoreboard Seasons + Revenue Intelligence
Status: `done`

- [x] Create Sprint 6 execution batch plan
- [x] Add Team/Family scoreboard seasons with weekly reset
- [x] Add rank tiers
- [x] Add fair-play weighting by activity quality
- [x] Add high-intent revenue segmentation
- [x] Add comeback reward loops (day 2/day 5/day 10)
- [x] Promote reward winner first, then copy winner
- [x] Add confidence-decay auto-expiry for winner selection

Definition of done:
- [x] Seasonal rankings remain stable and abuse-resistant
- [x] Lift measured with holdout cohorts
- [x] Winner automation expires/reverts correctly after confidence decay

## Sprint 7 (Weeks 13-14): Growth Experiments + Win-Rate Lift
Status: `not started`
Plan file: [SPRINT_7_EXECUTION_PLAN.md](SPRINT_7_EXECUTION_PLAN.md)

- [ ] Create Sprint 7 execution plan and experiment matrix
- [ ] Run Home Sprint copy A/B/C test (urgency vs value vs outcome framing)
- [ ] Run reward framing test (instant gain vs milestone framing)
- [ ] Run comeback timing test (D2/D5/D10 send hour windows by segment)
- [ ] Add Admin experiment dashboard blocks (sample size, lift trend, guardrail flags)

Definition of done:
- [ ] One promoted winner for copy + reward framing with statistically sane sample floor
- [ ] No measurable retention regression against holdout baseline

## Sprint 8 (Weeks 15-16): Capability Expansion (Outcomes)
Status: `not started`
Plan file: [SPRINT_8_9_CAPABILITY_REVENUE_PLAN.md](SPRINT_8_9_CAPABILITY_REVENUE_PLAN.md)

- [ ] Add smart mission engine (daily + weekly + catch-up missions)
- [ ] Add explain-why coaching cards with weak-topic drill links
- [ ] Add adaptive weekly plan regeneration using mastery + urgency + test date
- [ ] Add family accountability nudges tied to milestones and session completions

Definition of done:
- [ ] Session completion and next-day return improve vs Sprint 6 baseline

## Sprint 9 (Weeks 17-18): Revenue Expansion + Monetization Safety
Status: `not started`
Plan file: [SPRINT_8_9_CAPABILITY_REVENUE_PLAN.md](SPRINT_8_9_CAPABILITY_REVENUE_PLAN.md)

- [ ] Add value-based rewarded bundles (bonus drills, interview prep, weak-area rescue)
- [ ] Add revenue quality scoring (completion quality, fatigue risk, bounce risk)
- [ ] Add dynamic cap policy by segment + session depth with guardrails
- [ ] Add Admin monetization audit panel for pacing and holdout parity

Definition of done:
- [ ] Revenue per active user improves while churn/fatigue remain within guardrails

## Deployment Prep (Post Sprint 9)
Status: `not started`
Plan file: [DEPLOYMENT_PREP_EXECUTION_PLAN.md](DEPLOYMENT_PREP_EXECUTION_PLAN.md)

- [ ] Run full regression on web + iOS + Android and capture evidence
- [ ] Validate release configs (bundle IDs, permissions, env vars, analytics mode)
- [ ] Run production-like performance/crash smoke tests
- [ ] Complete App Store / Play Store submission packet and screenshots

Definition of done:
- [ ] Signed release candidates ready with QA evidence attached

## Cross-Sprint Guardrails
- [ ] Keep analytics events backward compatible unless migration is complete
- [ ] Require experiment sample-size threshold before winner promotion
- [ ] Enforce offer-frequency caps to reduce user fatigue
- [ ] Run regression test pass before sprint close

## Immediate Next Work (Ready Queue)
- [ ] Sprint 7 execution plan + experiment matrix finalization
- [ ] Sprint 7 experiment implementation pass 1 (copy framing + reward framing)
- [ ] Sprint 7 comeback timing instrumentation
- [ ] Sprint 8 capability architecture draft (mission engine + adaptive plan)
- [ ] Sprint 9 monetization safety model draft (quality score + fatigue guardrail)
- [ ] Deployment prep checklist execution after Sprint 7/8/9 complete
- [ ] Interview Mode flow polish and integration QA (active - pass 1 complete)
- [ ] Sprint 3 strict runtime-manual closure pass (B1/B2/B3)
- [ ] Device/simulator smoke pass and release evidence capture (deferred blocker)
- [x] Prepared one-page manual runtime script (`SPRINT_3_MANUAL_RUNTIME_TEST_SCRIPT.md`)
- [x] Sprint 3 task breakdown into execution batches
- [x] Sprint 3 Batch 1 automated validation: regressions + web export smoke
- [x] Sprint 3 one-pass validation sweep (regressions + web export + code-path checks for Listen/resume/focus pack)
- [x] Sprint 3 Batch 4 telemetry instrumentation sweep (focus toggle + step goal + break nudge analytics)
- [x] Sprint 4 kickoff: recovery campaign scaffold + analytics visibility
- [x] Sprint 4 manual runtime checklist wired (script + tracker)
- [x] Onboarding state picker clarity + selected-state flag identity polish
- [x] Profile personalization polish (camera/library photo + nickname auto-save on blur)
- [x] Sprint 5 kickoff: persistent squad sync foundation (team create/invite + weekly goal/challenge)
- [ ] Sprint 3 Batch 1 manual validation: Listen-mode walkthrough + Admin listen-event payload verification
- [ ] Sprint 3 Batch 2 validation: background/foreground resume stress pass (>=5 cycles)
- [ ] Sprint 3 Batch 3 validation: low-clutter + pacing + break-nudge UX sweep

### Sprint 3 Runtime Manual Pass (Tap-by-Tap)
- [ ] B1-01 Home: tap Start Listen Mode
- [ ] B1-02 Quiz: Play / Repeat verified
- [ ] B1-03 Quiz: speed cycle (0.75x/1.0x/1.25x) verified
- [ ] B1-04 Admin: listen events visible after refresh
- [ ] B2-01 Resume stress cycle 1/5 passed
- [ ] B2-02 Resume stress cycle 2/5 passed
- [ ] B2-03 Resume stress cycle 3/5 passed
- [ ] B2-04 Resume stress cycle 4/5 passed
- [ ] B2-05 Resume stress cycle 5/5 passed
- [ ] B2-06 Background during TTS: no stuck audio on return
- [ ] B3-01 Focus/Classic toggle x2 without progress loss
- [ ] B3-02 Step-goal progression updates after 3 answers
- [ ] B3-03 Break nudge appears after 6 answered questions
- [ ] B3-04 Admin: focus-pack events visible after refresh

### Sprint 4 Recovery Runtime Pass (Tap-by-Tap)
- [ ] S4-01 Review: recovery card visible on weak-score path
- [ ] S4-02 Session 1/3 starts ad-light (no rewarded gate)
- [ ] S4-03 Session 1 timestamp populated in Review
- [ ] S4-04 Session 2/3 requires rewarded flow
- [ ] S4-05 Session 2 timestamp populated in Review
- [ ] S4-06 Session 3/3 requires rewarded flow
- [ ] S4-07 Session 3 timestamp populated in Review
- [ ] S4-08 Admin refresh shows 3/3 recovery completion + step timestamps

## Done-Criteria Evidence Templates (Copy/Paste)

Use these lines when a run is complete. Replace bracket values and paste under the relevant sprint section.

### Sprint 2 Evidence Template (Flow Polish + Integration QA)
- `Evidence | Sprint 2 | Interview E2E | status=done | date=[YYYY-MM-DD] | device=[ios-sim|ios-physical|android|web] | runId=[id] | result=[pass/fail] | notes=[short note]`
- `Evidence | Sprint 2 | 8-stage funnel visible in Admin | status=done | date=[YYYY-MM-DD] | result=[pass/fail] | missingEvents=[none or list]`
- `Evidence | Sprint 2 | Home Interview CTA + quick mode | status=done | date=[YYYY-MM-DD] | result=[pass/fail]`
- `Evidence | Sprint 2 | Regression rerun | status=done | date=[YYYY-MM-DD] | interview=[12/12] | comprehensive=[40/40] | unseen=[30/30] | smartQueue=[28]`
- `Evidence | Sprint 2 | Device smoke | status=[done/blocked] | date=[YYYY-MM-DD] | target=[ios-sim|ios-physical] | blocker=[none or reason]`

### Sprint 3 Evidence Template (Strict Runtime-Manual Closure)
- `Evidence | Sprint 3 | B1 Listen walkthrough | status=done | date=[YYYY-MM-DD] | questions=[count] | playRepeat=[pass/fail] | speedCycle=[pass/fail]`
- `Evidence | Sprint 3 | B1 Admin listen events | status=done | date=[YYYY-MM-DD] | eventsSeen=[list] | result=[pass/fail]`
- `Evidence | Sprint 3 | B2 Resume stress | status=done | date=[YYYY-MM-DD] | cycles=[5/5] | stuckAudio=[yes/no] | result=[pass/fail]`
- `Evidence | Sprint 3 | B3 Focus pack UX | status=done | date=[YYYY-MM-DD] | toggleLoss=[yes/no] | stepGoal=[pass/fail] | breakNudge=[pass/fail]`
- `Evidence | Sprint 3 | B3 Admin focus events | status=done | date=[YYYY-MM-DD] | eventsSeen=[quiz_focus_mode_toggled, quiz_step_goal_reached, quiz_break_nudge_shown] | result=[pass/fail]`

### Optional Quick Summary Line (Any Sprint)
- `Evidence Summary | sprint=[2|3|4] | date=[YYYY-MM-DD] | owner=[name] | passed=[x/y] | blocked=[n] | next=[single next action]`
