---
name: okhp3-proportional-response
description: >
  Execute cost-proportional automated response tied to attack stage severity.
  Maps precursor alerts to low-cost containment actions (rate limiting, credential rotation,
  WAF rules, session termination). Includes audit trail and human override. NOT for high-consequence
  actions without explicit authorization.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-response
  origin: okhp3/skillz
  in_scope: "Low-cost automated responses, rate limiting, credential rotation, WAF rules, session kill, audit logging"
  out_of_scope: "High-consequence actions (system shutdown, data deletion), unlogged responses, bypassing authorization"
---

# okhp3-proportional-response

Execute cheap, fast, logged responses that match attacker speed without bankrupting the defender.

## Principle

The attacker's cost-per-attempt approaches zero. Your response cost must also approach zero, or the math breaks and the attacker wins through volume attrition.

A $500K system defending against $500 attacks with $50K response-per-engagement is the $4M-missile-per-$20K-drone problem. You lose. Response automation must make the marginal cost of response near-zero (milliseconds of compute, no human wait time), while leaving complex decisions to humans via human-in-the-loop governance.

## Response Severity Tiers

Map alert severity to response cost. Higher severity = more expensive responses allowed.

### Tier 0: Observe Only (Cost: ~$0)
- **Trigger**: LOW confidence precursor alert
- **Actions**: Log to analysis system, no user-facing change
- **Example**: one failed login from new IP (could be legitimate)

### Tier 1: Rate Limit (Cost: ~$0.01 per request)
- **Trigger**: MEDIUM confidence recon or credential-testing alert
- **Actions**: 
  - Apply rate limit to source IP (10 req/min instead of 100 req/sec)
  - Increase delay on auth failures (exponential backoff, max 5sec)
  - Require CAPTCHA after N failures
- **Example**: 20 404s from one source → rate limit to 1 req/sec

### Tier 2: Credential Rotation (Cost: ~$1-10, automated)
- **Trigger**: HIGH confidence credential-testing alert OR successful breach
- **Actions**:
  - Rotate credentials for high-value accounts (API keys, service principals, admin accounts)
  - Force password reset with temporary token
  - Revoke active sessions
  - Notify account owner
- **Example**: 50 failed logins on admin account → rotate admin creds, force re-auth

### Tier 3: WAF Rule Deployment (Cost: ~$0, seconds)
- **Trigger**: exploitation or injection pattern detected
- **Actions**:
  - Add WAF rule blocking detected payload pattern
  - Block requests matching known CVE patterns
  - Blacklist source IPs for 24 hours
  - Auto-update blocklist as new patterns detected
- **Example**: SQLi payload detected → WAF rule deployed to all instances in 10 seconds

### Tier 4: Session Termination (Cost: ~$0)
- **Trigger**: suspected compromise of active session
- **Actions**:
  - Terminate all sessions for compromised user
  - Revoke all active tokens/cookies
  - Force re-authentication on next action
  - Log the termination for audit trail
- **Example**: lateral movement detected from user session → kill all sessions, user re-auths

### Tier 5: System Isolation (Cost: ~$10K-100K, high consequence)
- **Trigger**: confirmed data breach or active exploitation in progress
- **Actions**:
  - Isolate system from network (requires human approval)
  - Kill processes running with compromised credentials
  - Snapshot system state for forensics (requires human approval)
  - Disable automated tasks on isolated system
- **Example**: ransomware detected → isolate system (REQUIRES HUMAN APPROVAL)

### Tier 6: Full Incident Response (Cost: $10K-$1M, highest consequence)
- **Trigger**: confirmed multi-system breach or data exfiltration
- **Actions**:
  - Escalate to incident commander (requires human decision)
  - No automated action; human decides next steps
- **Example**: C2 detected exfiltrating customer data → page on-call team immediately

## Response Rule Examples

These map alert outputs from okhp3-precursor-detection to response actions:

**Rule 1: Reconnaissance Response**
```
WHEN precursor_alert.type = RECONNAISSANCE
  AND precursor_alert.confidence >= MEDIUM
  AND source_ip not in trusted_ips
THEN
  - Apply rate limit to source_ip (1 req/sec)
  - Log to analysis system
  - Alert security team (if confidence = HIGH)
  - WHITELIST IF: user provides legitimate reason within 1 hour
```

**Rule 2: Credential Testing Response**
```
WHEN precursor_alert.type = CREDENTIAL_TESTING
  AND failed_login_count >= 10
  AND alert.confidence >= HIGH
THEN
  - Block source_ip for 30 minutes
  - Increase auth delay (exponential backoff, max 10 sec)
  - Rotate credentials for targeted accounts
  - Alert security team immediately
  - ESCALATE TO TIER 5 IF: breach confirmed (successful login after failures)
```

**Rule 3: Exploitation Detection Response**
```
WHEN precursor_alert.type = EXPLOITATION_ATTEMPT
  AND payload_type in [SQLi, RCE, XXE]
  AND alert.confidence >= HIGH
THEN
  - Deploy WAF rule blocking this pattern
  - Block source_ip for 24 hours
  - Alert security team
  - Escalate to TIER 5 IF: exploitation successful (RCE confirmed)
```

**Rule 4: Lateral Movement Response**
```
WHEN lateral_movement_alert.type = TOOL_ACCESS_ANOMALY
  AND tool_access_stage = 4 (lateral movement tools)
  AND agent not in expected_list
THEN
  - Revoke session/credentials for compromised agent
  - Kill all active connections from compromised agent
  - Isolate agent from tool access (remove permissions)
  - Alert security team immediately
  - ESCALATE TO TIER 5: This is confirmed compromise
```

## Human-in-the-Loop Governance

Tiers 0-4 can auto-execute. Tiers 5-6 REQUIRE human approval before action.

```
Alert from precursor-detection
  ↓
Map to severity tier (1-6)
  ├─ Tier 0-4: Execute automated response
  │  ├─ Log action + timestamp + justification
  │  ├─ Notify team (async, no wait)
  │  └─ Continue
  │
  └─ Tier 5-6: Human approval gate
     ├─ Page on-call team / incident commander
     ├─ Wait for human decision (max timeout 5 min, then fail-secure)
     ├─ IF approval: execute as authorized
     ├─ IF rejection: log rejection reason, escalate
     └─ IF timeout: escalate (better to over-respond to critical)
```

**Approval authority by tier:**
- Tier 0-1: No approval needed (automatic)
- Tier 2-3: Team lead approval OR pre-authorized policy
- Tier 4: Team lead OR automated if policy pre-authorizes
- Tier 5+: Incident commander + CISO for company-wide impact

## Audit Trail Requirements

Every response action must be logged immutably:

```
{
  "timestamp": "2026-08-28T12:34:56Z",
  "alert_id": "PRECURSOR-12345",
  "trigger": "credential_testing",
  "source": "10.0.0.5",
  "action_tier": 2,
  "action_type": "rate_limit",
  "action_parameters": {"limit": "1 req/sec", "duration": "30 min"},
  "confidence": 0.95,
  "executed_by": "automated_response_policy",
  "approval_required": false,
  "audit_status": "LOGGED_IMMUTABLY"
}
```

This log becomes evidence for:
- Post-incident forensics (what was the response timeline?)
- Audit compliance (prove you responded to alerts)
- Learning (did this response slow down the attack?)
- Legal (if you're sued: "here's what we did and when")

## Override Mechanism

Humans can always override or reverse response actions:

```
IF human_request.action = OVERRIDE_RESPONSE
  AND human_auth = valid_incident_commander
THEN
  - Reverse action (restore rate limit, restore sessions, etc.)
  - Log override + reason + who authorized
  - Notify team
```

Example: "That was a legitimate user failing to log in 5 times, override the rate limit."

## Integration Points

**Inputs:**
- okhp3-precursor-detection: HIGH/MEDIUM confidence alerts → response severity
- okhp3-response-cost-benefit-calculator: cost vs benefit → decision on whether to execute
- okhp3-authorization-governance-checkpoint: pre-approved policies → what responses are allowed
- okhp3-decision-chain-audit-trail: record response execution

**Outputs:**
- Audit trail (immutable log)
- Notifications (team alert)
- Configuration changes (WAF rules, rate limits, etc.)
- Status updates (response executed, success/failure)

## Implementation Checklist

- [ ] Define severity tiers (0-6) with cost estimates
- [ ] Implement response rules (Tier 0-4 automation)
- [ ] Implement approval gate (Tier 5-6 human approval)
- [ ] Set up audit logging (immutable, structured)
- [ ] Set up approval workflow (escalation, timeout behavior)
- [ ] Implement override mechanism (reverse responses when legitimate)
- [ ] Test responses against simulated attacks (measure response latency)
- [ ] Document override procedures and approval authority
- [ ] Wire into precursor-detection + authorization-governance-checkpoint

## Success Metrics

- **Response latency**: Tier 1-3 responses execute within 5 seconds of alert
- **False positive cost**: <$10 cost per false positive (because Tier 0-1 is cheap)
- **Approval latency**: Tier 5-6 approvals processed within 2 minutes
- **Audit completeness**: 100% of responses logged with full context
- **Override acceptance**: legitimate overrides processed within 1 minute

