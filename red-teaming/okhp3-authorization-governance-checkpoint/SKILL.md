---
name: okhp3-authorization-governance-checkpoint
description: >
  Authorization framework and enforcement for red-teaming tooling. Defines who
  authorizes each response severity, logs all decisions immutably, enforces human-in-loop
  for high-consequence actions, and prevents weaponization of defensive tools.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-governance
  origin: okhp3/skillz
  in_scope: "Authorization policy, approval workflows, audit trails, compliance enforcement"
  out_of_scope: "Determining technical feasibility, overriding business policy, operating without authorization"
---

# okhp3-authorization-governance-checkpoint

This skill is load-bearing. Remove it and the toolkit becomes an unguarded attack platform. Keep it.

## Principle

This entire Red Teaming family can be weaponized. The same automation that defends (block malicious IP) can attack (block legitimate competitor). The same patterns that detect attacks can be used to craft them. The same response automation that stops intruders can be turned against insiders.

Therefore: **authorization and audit are not nice-to-have, they are the defense**.

This skill defines:
- Who can authorize each response tier
- What documentation is required before action
- How decisions are logged immutably
- What appeals/overrides exist
- How to detect misuse

## Authorization Tiers

Tie approval authority to response consequence:

### Tier 0-1 (Low consequence): Automatic
- **Response type**: Observe only, rate limiting
- **Approval**: None required
- **Conditions**: Only if precursor-detection confidence >= MEDIUM
- **Audit**: Logged but not pre-approved

### Tier 2 (Moderate consequence): Team Lead
- **Response type**: Credential rotation
- **Approval**: Team lead sign-off required before execution
- **Max delay**: 2 minutes (fail-secure to Tier 1 if no approval)
- **Conditions**: precursor-detection confidence >= HIGH

### Tier 3-4 (High consequence): Team Lead + Policy Pre-authorization
- **Response type**: WAF rule deployment, session termination
- **Approval path A**: Immediate pre-authorized if matches defined policy
- **Approval path B**: Team lead approval within 3 minutes
- **Fallback**: If no approval, escalate to on-call manager
- **Conditions**: precursor-detection confidence >= HIGH AND pattern matches known attack

### Tier 5 (Very high consequence): Incident Commander
- **Response type**: System isolation
- **Approval**: Explicit incident commander approval REQUIRED
- **Max delay**: 2 minutes (fail-safe to containment, escalate if timeout)
- **Requires**: Incident declaration, incident number, escalation justification
- **Audit**: Full audit trail including approval text

### Tier 6 (Highest consequence): CISO + Incident Commander
- **Response type**: Full incident response, multi-system impact
- **Approval**: Both CISO and incident commander approve
- **Max delay**: 1 minute (critical incident)
- **Requires**: Executive incident briefing, legal review if data breach suspected
- **Audit**: Executive review and sign-off

## Pre-Authorization Policies

Teams can define "these attacks matching these patterns are automatically approved at Tier 3-4":

**Example Policy 1: Known CVE Auto-Response**
```
POLICY: Known CVE Exploitation
IF attack_pattern = known_cve
  AND cve_id in [CVE-2024-1234, CVE-2024-5678, ...] (known vuln to YOUR stack)
  AND confidence >= 95%
  AND source_ip not in whitelist
THEN
  - Auto-approve: Deploy WAF rule (Tier 3)
  - Auto-approve: Block source IP 24 hours (Tier 1)
  - Notify: Team lead async (no wait)
  - Audit: Log under POLICY-AUTO-APPROVED

AUTHORIZATION: Approved by [CISO name], [date], expires [date+90d]
OVERRIDE: Team lead can override within 5 min of execution
```

**Example Policy 2: Credential Stuffing Response**
```
POLICY: Credential Stuffing Auto-Response
IF attack_pattern = credential_testing
  AND failed_login_count > 20 within 5 min
  AND confidence >= 90%
THEN
  - Auto-approve: Rotate credentials for targeted account (Tier 2)
  - Auto-approve: Rate limit source IP (Tier 1)
  - Auto-approve: Force password reset (Tier 2)
  - Notify: Account owner + security team
  - Audit: Log under POLICY-AUTO-APPROVED

AUTHORIZATION: Approved by [CISO name], [date], expires [date+90d]
OVERRIDE: Account owner can request reversal within 30 min
```

## Approval Workflow

### Phase 1: Pre-Check (No approval needed)
```
Alert from precursor-detection
  ↓
Classify severity (Tiers 0-6)
  ↓
Check if matches pre-authorized policy
  ├─ YES: Skip to Phase 3 (execute)
  └─ NO: Continue to Phase 2
```

### Phase 2: Approval Gate (Depends on tier)
```
For Tiers 0-1: No approval needed
  ↓ Proceed immediately

For Tiers 2-4:
  ├─ Page team lead
  ├─ Wait for approval (max 2-3 min)
  ├─ If approved: Proceed
  ├─ If rejected: Log rejection reason, escalate to manager
  └─ If timeout: Escalate or fail-safe to lower tier

For Tiers 5-6:
  ├─ Page incident commander + CISO
  ├─ Wait for both approvals (max 1-2 min)
  ├─ If both approve: Execute as authorized
  ├─ If either rejects: Log rejection, manual investigation required
  └─ If timeout: Fail-safe to Tier 4 (isolate but don't destroy)
```

### Phase 3: Execute & Audit
```
Execute approved action
  ↓
Log immutably:
  - timestamp
  - alert_id
  - response_tier
  - action_type + parameters
  - who approved it
  - approval_timestamp
  - execution_result (success/failure)
  ↓
Notify team (async, already approved)
```

## Immutable Audit Trail

Every decision must be logged such that it cannot be altered retroactively:

```
{
  "audit_id": "AUD-20260828-001234",
  "timestamp": "2026-08-28T12:34:56Z",
  "alert_id": "PRECURSOR-5678",
  "attack_pattern": "credential_testing",
  "severity_tier": 2,
  "confidence": 0.92,
  "approval_required": true,
  "approval_type": "team_lead",
  "approval_requested_at": "2026-08-28T12:34:58Z",
  "approval_received_at": "2026-08-28T12:35:15Z",
  "approved_by": "alice@company.com",
  "approval_justification": "Matches policy CRED-STUFF-001, 25 failed logins in 4 min",
  "action_type": "credential_rotation",
  "action_parameters": {
    "target_account": "admin-svc",
    "rotation_type": "api_key",
    "old_key_id": "key-12345",
    "new_key_id": "key-67890"
  },
  "action_executed_at": "2026-08-28T12:35:16Z",
  "action_result": "SUCCESS",
  "audit_status": "IMMUTABLE"
}
```

This log is:
- Written to append-only storage (database, journal, event stream)
- Signed or hashed so tampering is detectable
- Accessible to auditors, never deleted
- Queryable by: timestamp, alert_id, approver, action_type, outcome

## Misuse Detection

Monitor for signs that the toolkit is being used for offense, not defense:

| Red flag | Investigation | Action |
|---|---|---|
| Multiple Tier 5 approvals from one person in 24 hours | Review each approval justification | If unjustified: revoke approval authority |
| Approval for action against competitor/partner IP | Is this legitimate defense or targeted attack? | Require executive review |
| Response action blocking all traffic to business-critical service | Is this over-response? | Incident review, possibly override |
| Credential rotation for accounts not targeted in alert | Why rotate unrelated accounts? | Audit trail review, possible policy violation |
| Pre-authorized policy used for non-attack scenario | Was the policy misapplied? | Update policy, audit trail notation |

Response to red flag: **Suspend the responder's approval authority, escalate to CISO, investigate**.

## Appeals & Overrides

Humans can appeal or reverse decisions:

### Appeal (Rejected approval)
```
IF approval was rejected
  AND requester believes decision was wrong
THEN
  - Escalate to next-level manager
  - Provide additional justification
  - Manager re-reviews within 15 minutes
  - If approved: execute action retroactively
  - If still rejected: log and close
```

### Override (Approved action reversed)
```
IF action was executed
  AND requester believes it was wrong or had unintended consequence
THEN
  - Account owner (or higher) can request reversal
  - Reversal is logged as counteraction (not deletion)
  - Original approval + reversal both in audit trail
  - Example: "Rate limit was applied in error, removed after 5 min, user re-established service"
```

## Governance Requirements for Tier 5-6

High-consequence actions require documented context:

**Tier 5 (System Isolation):**
- Incident number or incident declaration timestamp
- Justification (why is isolation the right response?)
- Estimated impact (how many users affected?)
- Approval from incident commander (name + timestamp)
- CISO notification (even if not explicit approval)

**Tier 6 (Multi-system incident):**
- Incident number (required)
- Executive briefing (what happened, what's the scope?)
- Legal review if customer data involved (data breach or threatened breach)
- Joint approval: incident commander + CISO (both required)
- Customer/regulator notification plan (GDPR, SOC2, etc.)

## Authorization Role Definitions

Define who holds each role and who can grant/revoke it:

| Role | Responsibilities | Who appoints | Term |
|---|---|---|---|
| **Team Lead** | Approve Tier 2-4 actions for their team | CISO + Department head | 1 year |
| **Incident Commander** | Approve Tier 5-6 actions during incident | CISO | Per incident |
| **On-Call Manager** | Escalation point during off-hours, Tier 4-5 | CISO | 1 week rotation |
| **CISO** | Policy approval, Tier 6, misuse investigation | CEO | Defined role |
| **Auditor** | Access to audit trail, compliance review | CISO | Ongoing |

## Compliance Integration

Connect this framework to your compliance requirements:

- **SOC 2 Type II**: Audit trail demonstrates change control + approval
- **ISO 27001**: Authorization framework matches change management procedure
- **HIPAA/PCI**: Approval workflow matches audit trail requirements
- **GDPR**: Data processing (credential rotation, IP blocking) requires documented justification

Document how this skill satisfies your compliance requirements. Annual audit should verify:
- Authorization policies match actual enforcement
- Audit trail is complete and immutable
- No unauthorized actions were taken
- Approval authority was never bypassed

## Implementation Checklist

- [ ] Define authorization tiers (0-6) with approval requirements
- [ ] Identify role holders: team leads, incident commanders, CISO
- [ ] Design approval workflow: who pages whom, max delay per tier, escalation path
- [ ] Set up immutable audit logging (append-only, signed, accessible)
- [ ] Create pre-authorization policy template and approval process
- [ ] Define Tier 5-6 governance requirements (documentation, legal review)
- [ ] Set up misuse detection monitoring (red flag detection)
- [ ] Document compliance mappings (SOC 2, ISO, HIPAA, GDPR)
- [ ] Define appeals/override process
- [ ] Annual audit plan (verify authorization and audit trail)

## Success Metrics

- **Approval timeliness**: Tier 2-3 approvals <2 min, Tier 5 <2 min
- **Audit completeness**: 100% of responses have audit entry with approval context
- **False approvals**: 0% (no actions approved that later regretted)
- **Misuse detection rate**: >95% of policy violations caught by monitoring
- **Compliance**: Annual audit finds no gaps in authorization or audit trail

