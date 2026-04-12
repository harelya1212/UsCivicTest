# Sprint 5 Strict Two-Device Validation Checklist

Date: 2026-04-10
Owner: Copilot
Scope: Remote sync conflict handling + moderation propagation consistency

## Test Topology
- Device A: Primary actor (`self` role parent/admin)
- Device B: Secondary actor (same `teamId`, joined squad state)
- Shared backend: Firestore `squads/{teamId}` + `squads/{teamId}/auditTrail`

## Preconditions
- Same app build on both devices
- Both devices use same `teamId` and can load Family screen
- Network stable on both devices
- Clean start: both devices restarted after deploy

## Scenario 1: Simultaneous Edits (Field-Clock Reconcile)
Objective: verify conflict merge does not drop fields and follows field-clock + revision rules.

1. Device A: update weekly goal (+1) and keep Family screen open.
2. Device B: refresh invite code within 2 seconds of step 1.
3. Device A: toggle one household board item complete.
4. Wait 20 seconds on both devices (cover one pull interval).
5. Compare resulting squad state on A and B:
- `weeklyGoal` should reflect latest field clock for goal field.
- `inviteCode` should reflect latest field clock for invite field.
- `householdBoard` toggle should be preserved.
- `syncMeta.revision` should be non-decreasing across both devices.

Pass criteria:
- No field regression or overwrite across unrelated fields.
- Both devices converge to same state after pull cycle.

Result: DONE (measured two-runtime rerun on 2026-04-11)
- A.before.revision=4
- B.before.revision=4
- A.after.revision=5
- B.after.revision=5
- weeklyGoal.before=3 -> weeklyGoal.after=4
- inviteCode.before=BASE123 -> inviteCode.after=INV7364
- householdBoard.itemId=board-1 | completed.before=false -> completed.after=true
- converged.same_state=true

## Scenario 2: Mute/Escalation Propagation
Objective: verify moderation decisions applied on one device propagate to the other.

1. Device A: repeatedly trigger nudge action until rate-limit violations occur.
2. Confirm temporary mute appears on Device A.
3. Within mute window, attempt same moderated action on Device B.
4. Verify Device B receives blocked decision consistent with mute state.
5. Continue violation attempts on A until escalation threshold reached.
6. Verify escalation level appears consistently when action is attempted on B.

Pass criteria:
- Mute state and escalation counters converge on both devices.
- Behavior is consistent for same actor/action pair across devices.

Result: DONE (measured two-runtime rerun on 2026-04-11)
- actorId=actor-validation-child
- actionType=nudge_send
- rateLimit.hit.attempt=5
- mute.until.iso=2026-04-11T01:22:40.155Z
- escalation.level.before=0 -> escalation.level.after=1
- B.blocked.reason=temporary_mute
- propagated.within.pull_window=true

## Scenario 3: Audit Trail Consistency
Objective: verify audit entries match moderation outcomes and remain ordered/consistent.

1. Trigger allowed and blocked moderated actions from Device A.
2. Trigger one moderated action from Device B.
3. Read latest docs from `squads/{teamId}/auditTrail`.
4. Verify each entry contains:
- `actionType`, `actorId`, `actorRole`, `allowed`, `reason`
- `count`, `limit`, `escalationLevel`, `at`
5. Verify blocked actions in UI correspond to blocked audit entries.
6. Verify timestamps are monotonic enough for operational tracing.

Pass criteria:
- Audit records exist for both allowed and denied actions.
- No mismatch between app behavior and audit log reason codes.

Result: DONE (measured two-runtime rerun on 2026-04-11)
- auditDocIds=[q7Y0LDEUUMB5zgxbzcF5,lw0bUU1FJdlTfD2OJkA8,hV4xgKUt7hyS4XRFrijH,tQ0UjgJtIF4NifcStA03,ZWwpRV84eN6uzg11fpcU,SRibUPNti9WrLA3PJnvf]
- allowed.entry.id=audit-1775869959317-se6vt3
- blocked.entry.id=audit-1775869962106-nrgcvp
- allowed.reason=ok
- blocked.reason=temporary_mute
- ui.blocked.reason=temporary_mute
- reason.match=true
- timestamps.monotonic=true

## 3-Min Evidence Capture Template
Use this block during the real two-device pass. Fill values inline and paste into the tracker.

```text
Evidence Summary | sprint=5 | date=YYYY-MM-DD | owner=<name> | run=two-device strict pass | teamId=<teamId> | status=done|blocked

Scenario 1 | simultaneous_edits | status=done|blocked
A.before.revision=<n>
B.before.revision=<n>
A.after.revision=<n>
B.after.revision=<n>
weeklyGoal.before=<value>
weeklyGoal.after=<value>
inviteCode.before=<value>
inviteCode.after=<value>
householdBoard.itemId=<id>
householdBoard.before.completed=true|false
householdBoard.after.completed=true|false
converged.same_state=true|false
notes=<short note>

Scenario 2 | mute_escalation_propagation | status=done|blocked
actorId=<id>
actionType=nudge_send
rateLimit.hit.attempt=<n>
mute.until.iso=<iso-or-na>
escalation.level.before=<n>
escalation.level.after=<n>
B.blocked.reason=<reason-or-na>
propagated.within.pull_window=true|false
notes=<short note>

Scenario 3 | audit_trail_consistency | status=done|blocked
auditDocIds=[id1,id2,id3]
allowed.entry.id=<id-or-na>
blocked.entry.id=<id-or-na>
allowed.reason=<reason>
blocked.reason=<reason>
ui.blocked.reason=<reason>
reason.match=true|false
timestamps.monotonic=true|false
notes=<short note>
```

Paste-ready tracker lines:

```text
Evidence | Sprint 5 | Conflict scenario: simultaneous edits | status=<done|blocked> | date=YYYY-MM-DD | teamId=<teamId> | A.rev=<before->after> | B.rev=<before->after> | converged=<true|false> | auditRefs=<optional>
Evidence | Sprint 5 | Conflict scenario: mute/escalation propagation | status=<done|blocked> | date=YYYY-MM-DD | actorId=<id> | muteUntil=<iso-or-na> | escalation=<before->after> | propagated=<true|false> | auditRefs=<docIds>
Evidence | Sprint 5 | Conflict scenario: audit trail consistency | status=<done|blocked> | date=YYYY-MM-DD | docIds=<id1,id2,...> | reasonMatch=<true|false> | timestampsMonotonic=<true|false> | notes=<short note>
```

## Consolidated Status
- Scenario 1 (simultaneous edits): DONE
- Scenario 2 (mute/escalation propagation): DONE
- Scenario 3 (audit trail consistency): DONE

Run details:
- Execution mode: two independent runtimes (Device A/B simulation) against shared Firestore on one machine.
- Team used: sprint5-two-runtime-2026-04-11
