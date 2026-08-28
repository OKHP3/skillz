---
name: okhp3-decision-chain-audit-trail
description: >
  Record the full reasoning path for every detection and response decision: what
  triggered it, why, what data was considered, what response was chosen, and what
  happened next. Foundation for post-incident forensics and institutional learning.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-forensics
  origin: okhp3/skillz
  in_scope: "Decision logging, reasoning path capture, audit trail structure, forensic reconstruction"
  out_of_scope: "Analyzing audit trails, determining root cause, or drawing conclusions from logs"
---

# okhp3-decision-chain-audit-trail

Record WHY things happened, not just THAT they happened. This is the foundation for forensics.

## Purpose

When an incident occurs, the audit trail must answer:
- What triggered the alert?
- Why did that pattern match?
- What was the confidence score and how was it calculated?
- Who approved the response (if approval was needed)?
- What response action was taken?
- Did the action succeed or fail?
- What was the outcome?

Without this trail, forensics becomes speculation. With it, you can replay the exact reasoning, identify where defenses failed, and improve baselines.

## Core Concepts

### The Decision Chain

Every detection + response flows through this chain:

```
1. EVENT: Request/behavior arrives
   ├─ timestamp
   ├─ source (IP, agent, user)
   ├─ content (request body, tool call, etc.)
   └─ metadata (environment, threat intel, etc.)

2. BASELINE CHECK: Compare against normal
   ├─ baseline_id (which baseline used?)
   ├─ dimension (tool access? request volume? decision length?)
   ├─ current_value
   ├─ baseline_mean / baseline_p95
   ├─ deviation_score (how far from normal?)
   └─ baseline_check_result (NORMAL / ANOMALY)

3. PATTERN MATCH: Does it match known attack?
   ├─ pattern_library_version
   ├─ patterns_checked (recon signatures, cred-test sigs, etc.)
   ├─ pattern_id (e.g., "RECON-001-ENDPOINT-ENUM")
   ├─ pattern_matched (yes/no)
   ├─ confidence_score (50%-99%)
   │  ├─ base_score (60% for single match)
   │  ├─ modifiers (behavioral anomaly +20%, threat intel +10%)
   │  └─ final_confidence
   └─ evidence_cited (which specific indicators triggered?)

4. ALERT GENERATED
   ├─ alert_id (unique identifier)
   ├─ severity (LOW/MEDIUM/HIGH/VERY_HIGH)
   ├─ recommended_response_tier (0-6)
   └─ alert_timestamp

5. AUTHORIZATION GATE
   ├─ response_tier
   ├─ approval_required (yes/no)
   ├─ approval_authority (none/team_lead/incident_commander/ciso)
   ├─ approval_requested_at
   ├─ approval_received_from (name, role, timestamp)
   ├─ approval_justification (why was this approved?)
   └─ pre_authorized_policy_id (if matched known policy)

6. RESPONSE EXECUTION
   ├─ response_type (rate_limit, rotate_creds, WAF_rule, etc.)
   ├─ action_parameters (specific IP, specific account, specific rule)
   ├─ execution_timestamp
   ├─ execution_result (SUCCESS/FAILURE/PARTIAL)
   └─ error_details (if failed)

7. OUTCOME
   ├─ attack_escalated? (yes/no)
   ├─ response_effectiveness (did it stop the attack?)
   ├─ unintended_consequences (false positives? blocked legitimate traffic?)
   └─ follow_up_actions_needed (yes/no)
```

### Immutability & Storage

Every decision chain entry is:
- **Append-only**: never modified, only new entries added
- **Signed/hashed**: tampering is detectable
- **Timestamped**: precise sequencing
- **Indexed**: queryable by alert_id, timestamp, source IP, response type, outcome
- **Retained**: kept for minimum 90 days (regulatory), preferably 1+ year

Storage options:
- Append-only database (MongoDB, PostgreSQL with triggers)
- Event stream (Kafka, EventHubs) feeding immutable log
- Journal/ledger system (blockchain-style, though overkill for most)
- Syslog to central collector (if immutability enforced at collector)

### Forensic Reconstruction

After an incident, you can replay the chain:

```
Question: "How did the attacker get in?"

Answer from audit trail:
- 2026-08-28 12:34:00 — Recon alert (50+ 404s to /.git, /.env, etc.)
  └─ Confidence: 92%, Pattern: RECON-001
  └─ Response: Rate limit (Tier 1, auto-approved)
  └─ Outcome: SUCCESS (attacker slowed)

- 2026-08-28 12:35:30 — Cred test alert (15 failed logins)
  └─ Confidence: 88%, Pattern: CRED-TEST-001
  └─ Response: Credential rotation (Tier 2, team lead approved)
  └─ Outcome: SUCCESS (creds rotated, attacker locked out temporarily)

- 2026-08-28 12:37:15 — Cred test alert (25 failed logins, new source IP)
  └─ Confidence: 94%, Pattern: CRED-TEST-002 (distributed attempt)
  └─ Response: Rate limit + block new source (Tier 1, auto-approved)
  └─ Outcome: PARTIAL (slowed but new IP continued)

- 2026-08-28 12:39:00 — Exploitation alert (SQLi pattern)
  └─ Confidence: 96%, Pattern: EXPLOIT-001-SQLi
  └─ Response: Deploy WAF rule (Tier 3, team lead approved)
  └─ Outcome: SUCCESS (initial exploitation blocked)

- 2026-08-28 12:40:30 — Lateral movement alert (agent access to admin tool)
  └─ Confidence: 91%, Pattern: LATERAL-MOVE-001
  └─ Response: Terminate sessions (Tier 4, team lead approved)
  └─ Outcome: FAILURE (lateral movement was successful before termination)
  └─ ROOT CAUSE: Response delay between exploitation and lateral move
```

From this chain, forensics identifies: **Response delay between stages 3 and 4 allowed attacker to escape**. Solution: **Reduce detection latency between exploitation and lateral movement**.

## Implementation

### What to Log at Each Stage

**Stage 1: Event Arrival**
```json
{
  "log_id": "LOG-20260828-001",
  "timestamp": "2026-08-28T12:34:56Z",
  "event_source": "API_request",
  "source_ip": "203.0.113.42",
  "source_agent": "user_session_xyz",
  "request_path": "/.git",
  "request_method": "GET",
  "user_agent": "curl/7.64.1",
  "environment": "prod"
}
```

**Stage 2: Baseline Comparison**
```json
{
  "log_id": "LOG-20260828-001",
  "baseline_check": {
    "baseline_id": "BL-prod-apis-v2",
    "dimension_checked": "endpoint_diversity",
    "current_value": 0.92,
    "baseline_mean": 0.15,
    "baseline_p95": 0.35,
    "deviation_sigma": 3.8,
    "result": "ANOMALY"
  }
}
```

**Stage 3: Pattern Match**
```json
{
  "log_id": "LOG-20260828-001",
  "pattern_match": {
    "pattern_library_version": "v1.2.3",
    "stage_checked": ["recon", "cred_test", "exploit"],
    "pattern_hit": "RECON-001-ENDPOINT-ENUM",
    "indicators_matched": [
      "404_rate_spike",
      "sensitive_path_access",
      "rapid_sequence"
    ],
    "base_confidence": 0.60,
    "modifier_behavioral_anomaly": 0.20,
    "modifier_threat_intel": 0.12,
    "final_confidence": 0.92
  }
}
```

**Stage 4: Alert**
```json
{
  "alert_id": "PRECURSOR-12345",
  "log_id": "LOG-20260828-001",
  "alert_type": "RECONNAISSANCE",
  "severity": "MEDIUM",
  "confidence": 0.92,
  "recommended_tier": 1,
  "alert_timestamp": "2026-08-28T12:34:58Z"
}
```

**Stage 5: Authorization**
```json
{
  "alert_id": "PRECURSOR-12345",
  "response_tier": 1,
  "approval_required": false,
  "auto_approved_by": "tier_1_policy",
  "policy_id": "TIER1_AUTO_APPROVE",
  "authorization_timestamp": "2026-08-28T12:34:59Z"
}
```

**Stage 6: Execution**
```json
{
  "alert_id": "PRECURSOR-12345",
  "response_action": "rate_limit",
  "action_parameters": {
    "target": "203.0.113.42",
    "rate_limit_rps": 1,
    "duration_seconds": 1800
  },
  "execution_timestamp": "2026-08-28T12:35:00Z",
  "execution_result": "SUCCESS"
}
```

**Stage 7: Outcome**
```json
{
  "alert_id": "PRECURSOR-12345",
  "outcome_observed": {
    "attack_continued": true,
    "attacker_response": "switched_to_new_source_ip",
    "new_source_ip": "203.0.113.99",
    "response_effectiveness": "slowed_not_stopped",
    "outcome_timestamp": "2026-08-28T12:39:15Z"
  }
}
```

### Querying the Audit Trail

Enable forensics to ask questions:

```sql
-- "Show me all decisions made about this alert"
SELECT * FROM decision_chain WHERE alert_id = "PRECURSOR-12345"

-- "How many times did we see this pattern in the last 30 days?"
SELECT COUNT(*) FROM decision_chain 
  WHERE pattern_id = "RECON-001-ENDPOINT-ENUM"
  AND timestamp > NOW() - INTERVAL 30 DAY

-- "Which responses were ineffective (attack continued despite response)?"
SELECT * FROM decision_chain
  WHERE outcome.attack_continued = true
  AND response_effectiveness = "slowed_not_stopped"
  ORDER BY outcome_timestamp DESC

-- "Show me the time from detection to response for each alert"
SELECT 
  alert_id,
  pattern_match.timestamp as detected_at,
  execution.timestamp as responded_at,
  DATEDIFF(ms, pattern_match.timestamp, execution.timestamp) as latency_ms
FROM decision_chain
WHERE execution_result = "SUCCESS"
ORDER BY latency_ms DESC
```

## Integration Points

**Inputs:**
- okhp3-behavioral-baselining: baseline IDs, comparisons
- okhp3-agentic-attack-patterns: pattern IDs, confidence calculations
- okhp3-precursor-detection: alerts with severity + confidence
- okhp3-proportional-response: response actions + outcomes
- okhp3-authorization-governance-checkpoint: approvals + audit context

**Outputs:**
- okhp3-post-breach-forensics: complete decision chains for investigation
- okhp3-attack-economics: latency metrics, effectiveness data
- okhp3-emerging-threat-lab: effectiveness data for pattern refinement
- Compliance/audit: immutable audit trail for SOC2, ISO27001, etc.

## Implementation Checklist

- [ ] Design decision chain structure (7 stages above)
- [ ] Choose immutable storage system (append-only DB or event stream)
- [ ] Implement logging at each stage (events, baseline checks, pattern matches, alerts, auth, execution, outcomes)
- [ ] Set up indexing for forensic queries (by alert_id, timestamp, source, response type, outcome)
- [ ] Implement retention policy (90 days minimum, 1+ year preferred)
- [ ] Set up immutability enforcement (signing, hashing, or blockchain-style)
- [ ] Create forensic query templates (effectiveness, latency, patterns, outcomes)
- [ ] Wire into okhp3-proportional-response (log responses as they execute)
- [ ] Document query examples for post-incident investigators

## Success Metrics

- **Completeness**: 100% of alerts have full decision chain logged
- **Latency**: Logging adds <5ms overhead per decision
- **Queryability**: Forensic queries return results <1 second
- **Retention**: No logs deleted within retention window; deletion enforced at window boundary
- **Integrity**: Audit trail tampering attempt detected 100% of the time

