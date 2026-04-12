# Sprint 7 Execution Plan

Status: in progress (Batch 2)
Window: Weeks 13-14
Objective: increase rewarded conversion and revenue efficiency without hurting retention or user trust.

## Updated Sprint Sequence (Apr 12, 2026)
- Sprint 7 (Batch 2) priority: Instrumentation
  - Log Focus State entry/exit to define ad-suppression windows.
- Sprint 8 priority: Cinematic UI
  - Implement CameraFlyThrough targeting the 3D route experience.
- Sprint 9 priority: Revenue Intelligence
  - Enforce Dynamic Cap Policy + Intent Segmentation so interruptions occur only when retention risk is low.

## North-Star Targets
- Primary: rewarded conversion rate +15% over Sprint 6 baseline
- Primary: rewarded completions per active user +10%
- Guardrail: no drop >3% in day-1 return rate
- Guardrail: no increase >5% in early-session exits

## Scope
1. Home Sprint copy framing experiment
- Variants:
  - control: current
  - urgency: immediate action framing
  - outcome: confidence/test-outcome framing
- Placement:
  - Home rewarded sprint CTA title/subtitle
- Success metric:
  - conversion rate by variant with sample floor

2. Reward framing experiment
- Variants:
  - control: current reward string
  - instant-value: immediate gain framing
  - milestone-value: progress-to-goal framing
- Placement:
  - rewarded CTA subtitle and unlock confirmation text
- Success metric:
  - completion rate and downstream quiz starts

3. Comeback timing optimization
- D2/D5/D10 windows tested by local hour buckets:
  - morning (7-11)
  - afternoon (12-17)
  - evening (18-22)
- Success metric:
  - comeback claim rate and next-session completion

4. Focus-state instrumentation and guardrails
- log focus state entry/exit events from Home/Quiz interaction cadence
- define deep-focus suppression windows for interstitial avoidance
- during suppression, shift surfaced value toward rewarded power-ups instead of interruption
- enforce ad-light recovery paths inside focus windows

## Batch Plan

### S7-B1: Experiment Design + Data Contracts
- Define variant keys and canonical names
- Add sample-size threshold per variant (min 50 attempts per branch)
- Add guardrail event collection and dashboard rows
- Deliverable: experiment matrix and event map

### S7-B2: Home Sprint Copy Experiment Implementation
- Add copy variant mapping layer
- Ensure holdout behavior remains baseline-safe
- Add Admin rows for branch attempts/completions/lift
- Deliverable: togglable experiment in runtime

### S7-B3: Reward Framing Experiment Implementation
- Add reward framing variant logic
- Track branch-specific conversions and downstream starts
- Deliverable: Admin comparison rows + exportable summary

### S7-B4: Comeback Timing + Winner Promotion Rules
- Add hour-bucket routing and tracking
- Add winner promotion gate:
  - minimum attempts
  - minimum lift threshold
  - guardrail checks pass
- Deliverable: automated recommendation + pin suggestion

## Validation Plan
- Automated:
  - add scripts for branch assignment determinism
  - add scripts for winner-promotion gate behavior
- Manual:
  - treatment path walkthrough on Home/Admin
  - holdout path parity check (no unintended experiment behavior)
  - self-check and copy-summary verification

## Exit Criteria
- One promoted winner for copy framing and one for reward framing
- Guardrails green for 3 consecutive daily snapshots
- Admin report includes attempt counts, conversion lift, and recommendation confidence

## Risks and Mitigations
- Risk: false winner from low sample size
  - Mitigation: enforce sample floor and confidence thresholds
- Risk: revenue gain but retention damage
  - Mitigation: guardrail block on winner promotion
- Risk: variant fatigue
  - Mitigation: frequency cap checks before exposure
