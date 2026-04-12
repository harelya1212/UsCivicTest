# Sprint 6 Execution Plan: Seasons + Revenue Intelligence

Date: 2026-04-11
Owner: Copilot
Status: In Progress

## Objective
Ship a production-safe Sprint 6 in four implementation batches:
- Team/Family seasons with weekly reset and rank tiers
- Fair-play weighting by activity quality
- High-intent revenue segmentation
- Comeback loops + winner confidence-decay auto-expiry

## Scope Boundaries
- Reuse existing Family/Squad sync model and moderation rails from Sprint 5.
- Keep analytics backward compatible; only additive events.
- Gate revenue intelligence behavior behind feature flags until validated.

## Batch Plan

### S6-B1: Season Engine + Rank Tiers
Goal:
- Add season metadata to shared squad state (seasonId, seasonStartAt, seasonEndAt, reset cadence).
- Add rank-tier assignment model on top of weekly scoreboard.

Deliverables:
- Season state shape in squad payload.
- Weekly reset routine (time-based rollover).
- Rank tier computation for each member (for example: Bronze/Silver/Gold/Platinum).
- Admin surface showing current season window + tier distribution.

Acceptance checks:
- Weekly rollover creates a new season id and archives previous season stats.
- Member tiers are deterministic from same input data.
- No regression in existing Family sync behaviors.

Evidence template:
- `Evidence | Sprint 6 | Season rollover | status=done | date=YYYY-MM-DD | teamId=<teamId> | previousSeason=<id> | nextSeason=<id> | resetAt=<iso> | result=pass`
- `Evidence | Sprint 6 | Rank tiers | status=done | date=YYYY-MM-DD | members=<n> | tiers=<counts> | deterministic=true | result=pass`

### S6-B2: Fair-Play Weighting
Goal:
- Introduce quality-weighted scoring so low-quality/high-volume actions do not dominate rankings.

Deliverables:
- Weight function using quality signals (accuracy, completion quality, consistency).
- Weighted score fields persisted in season stats.
- Admin diagnostics card for raw vs weighted score deltas.

Acceptance checks:
- Weighted leaderboard order changes only when justified by quality signals.
- Extreme spam-like behavior receives lower effective contribution.
- Existing moderation rules remain authoritative.

Evidence template:
- `Evidence | Sprint 6 | Fair-play weighting | status=done | date=YYYY-MM-DD | members=<n> | rawLeader=<id> | weightedLeader=<id> | antiSpamDelta=<value> | result=pass`

### S6-B3: High-Intent Revenue Segmentation
Goal:
- Segment users by engagement and intent signals for smarter upsell timing.

Deliverables:
- Segment model (for example: high-intent, warming, low-intent).
- Segment assignment refresh job/hook.
- Offer-frequency cap and cooldown policy linked to segment.
- Admin visibility of segment counts and transitions.

Acceptance checks:
- Segment assignment is explainable and stable between refreshes.
- Offer caps are respected; no over-frequency regressions.
- Analytics events capture segment transitions and exposure decisions.

Evidence template:
- `Evidence | Sprint 6 | Segmentation | status=done | date=YYYY-MM-DD | usersEvaluated=<n> | highIntent=<n> | warming=<n> | lowIntent=<n> | capViolations=0`

### S6-B4: Comeback Loops + Winner Confidence Decay
Goal:
- Add D2/D5/D10 comeback rewards and winner lifecycle that auto-expires with confidence decay.

Deliverables:
- Comeback trigger scheduler/rules for D2/D5/D10 windows.
- Winner selection pipeline (reward winner first, copy winner second).
- Confidence score with decay curve and expiry threshold.

Acceptance checks:
- Comeback triggers fire in the correct windows.
- Winner auto-expiry reverts state safely after confidence threshold falls.
- Holdout-ready instrumentation included.

Evidence template:
- `Evidence | Sprint 6 | Comeback loops | status=done | date=YYYY-MM-DD | D2=<count> | D5=<count> | D10=<count> | triggerAccuracy=pass`
- `Evidence | Sprint 6 | Winner confidence decay | status=done | date=YYYY-MM-DD | winnerId=<id> | confidenceStart=<v> | confidenceEnd=<v> | expired=<true|false>`

## Suggested Implementation Order
1. S6-B1 Season engine + tiers
2. S6-B2 Fair-play weighting
3. S6-B3 Segmentation + offer caps
4. S6-B4 Comeback loops + confidence decay

## Guardrails
- Preserve additive-only analytics naming changes.
- Keep every batch behind feature flags until manual verification closes.
- Run regression checks before marking each batch done.

## Definition of Done (Sprint 6)
- Seasonal rankings reset correctly and remain abuse-resistant.
- Revenue-intelligence decisions are measurable and capped.
- Winner automation safely decays/expires without manual intervention.
- Evidence lines logged in `SPRINT_PLAN_TRACKER.md` for each batch.
