# Deployment Prep Execution Plan

Status: not started
Start condition: begin after Sprint 7, Sprint 8, and Sprint 9 complete.

## Phase D1: Quality Gate
- Run full regression suites and record outputs
- Run manual runtime checks on Home, Quiz, Review, Interview, Family, Admin
- Validate treatment vs holdout runtime paths
- Validate all monetization safety guardrails still enforced

Exit criteria:
- no P0/P1 regressions
- all critical user paths pass on at least one iOS and one Android device

## Phase D2: Performance and Stability
- Build production-like binaries
- Smoke test startup, screen transitions, quiz session loops, and background resume
- Verify no white-screen routes and no persistent crash loops
- Capture memory/CPU snapshots for long quiz sessions

Exit criteria:
- startup and runtime smoothness acceptable
- crash-free smoke pass across tested devices

## Phase D3: Release Configuration
- Verify bundle IDs, app names, versioning, and build numbers
- Verify required environment variables and secrets
- Verify analytics mode and event taxonomies
- Verify privacy policy, terms, and permission texts

Exit criteria:
- release config checklist fully green

## Phase D4: Store Submission Packet
- Execute screenshot capture runbook
- Finalize store descriptions and keyword copy
- Assemble support links and legal URLs
- Create submission metadata for App Store and Play Store

Exit criteria:
- submission packet complete and review-ready

## Phase D5: Launch Readiness and Rollout
- Define release channel and rollout strategy
- Define rollback conditions and hotfix playbook
- Set post-release monitoring dashboard and alert thresholds

Exit criteria:
- go/no-go decision signed off
- rollout and rollback instructions documented

## Post-Launch (First 7 Days)
- Track crash-free sessions, retention trend, and revenue trend
- Watch holdout parity and fatigue guardrail dashboards
- Run daily triage on top issues and publish fixes
