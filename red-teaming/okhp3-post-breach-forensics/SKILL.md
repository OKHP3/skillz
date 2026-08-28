---
name: okhp3-post-breach-forensics
description: >
  Structured incident investigation playbook. Trace attack vector, identify point
  of first compromise, map lateral movement, assess data exposure, and extract
  learnings to improve future baselines. Closes the incident-to-learning feedback loop.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-forensics
  origin: okhp3/skillz
  in_scope: "Incident investigation, attack timeline reconstruction, root cause analysis, learning extraction"
  out_of_scope: "Legal proceedings, evidence handling for law enforcement, criminal attribution"
---

# okhp3-post-breach-forensics

Convert incidents from "bad thing that happened" into "institutional knowledge that makes us better."

## Purpose

When an incident occurs, most organizations ask: "How do we stop this attack?" After stopping it, they ask: "What happened?" A few minutes later, everyone moves on. The incident becomes a forgotten war story instead of a learning opportunity.

This skill forces a structured investigation that answers:
1. **How did the attacker get in?** (Initial compromise vector)
2. **When did it happen?** (Timeline from first access to discovery)
3. **How deep did they go?** (Lateral movement scope)
4. **What did they touch?** (Data exposure assessment)
5. **Why didn't our defenses catch it?** (Defense gap analysis)
6. **What do we change so this doesn't happen again?** (Baseline updates + pattern library improvements)

## Forensic Investigation Phases

### Phase 1: Incident Triage (First 30 minutes)

**Goal**: Understand scope, establish incident commander, begin containment.

**Questions to answer:**
- When was the incident discovered? (timestamp)
- Who discovered it? (team, system)
- How was it discovered? (alert, manual report, third party)
- What system(s) are affected? (list)
- Is the attack active or historical? (ongoing/stopped)
- Who is the incident commander? (name, role)

**Outputs:**
- Incident number (INC-20260828-001)
- Incident timeline started
- Affected systems listed
- Severity assessment (P1/P2/P3)
- Initial containment decision (isolate, monitor, or no action)

**Use the decision-chain-audit-trail:**
- Pull all alerts from affected system(s) in the past 24 hours
- Identify which alert first indicated compromise
- Note when alerts stopped (attack stopped or alerts bypassed?)

### Phase 2: Attack Timeline Reconstruction (First 2 hours)

**Goal**: Map the exact sequence of attacker actions.

**Starting point**: The decision-chain-audit-trail from Phase 1.

**Build the timeline:**

```
2026-08-28 12:34:56 — RECON alert (endpoint enumeration)
  Source IP: 203.0.113.42
  Confidence: 92%
  Response: Rate limit applied
  Outcome: Slowed, attacker didn't abandon

2026-08-28 12:35:30 — CRED-TEST alert (credential testing)
  Source IP: 203.0.113.42 (same attacker)
  Target accounts: admin, test, service
  Failed attempts: 15
  Response: Rotate credentials, rate limit
  Outcome: Success (credentials rotated)

2026-08-28 12:37:15 — CRED-TEST alert (new source IP)
  Source IP: 203.0.113.99 (distributed attempt)
  Failed attempts: 25
  Response: Rate limit
  Outcome: Slowed but continued

2026-08-28 12:39:00 — EXPLOITATION alert (SQLi payload)
  Source IP: 203.0.113.99
  Target endpoint: /api/users
  Payload: "1' UNION SELECT * FROM admin_creds --"
  Response: WAF rule deployed
  Outcome: Initial attempt blocked... BUT

2026-08-28 12:40:30 — LATERAL-MOVE alert (service-to-service call)
  Source agent: Web service (compromised at 12:39)
  Target: Admin API (internal)
  Tool accessed: kubectl get secrets
  Response: Sessions terminated
  Outcome: Too late, secrets accessed at 12:39:15 (BEFORE detection)
```

**Questions to answer for each event:**
- What time did this happen?
- What evidence shows this happened? (log entry, alert, signature)
- Did our defenses detect it? (yes/no/delayed)
- Did our response stop it? (yes/no/partial)
- What did the attacker accomplish? (reconnaissance/access/credential/data)

**Forensic data sources:**
- Decision-chain-audit-trail logs (detection + response timeline)
- Web server logs (timestamps, source IPs, request sequences)
- API logs (tool calls, access patterns, what data returned)
- System logs (process creation, file access, network connections)
- Credential logs (login attempts, password changes, token generation)
- Network traffic (captured packets, firewall logs, IDS alerts)

### Phase 3: Defense Gap Analysis (First 4 hours)

**Goal**: Identify where defenses failed.

**For each stage of the attack, ask:**

| Stage | Defense layer | Did it detect? | Did it respond? | Gap |
|---|---|---|---|---|
| Recon | Precursor-detection + baseline | YES (92% conf) | YES (rate limit) | Attacker didn't stop; maybe rate limit too lenient? |
| Cred-test | Precursor-detection | YES (88% conf) | YES (rotate creds) | Attacker switched IPs; distributed cred-test not caught early |
| Exploitation | Precursor-detection? | YES (96% conf) | YES (WAF rule) | **Gap: Latency** — WAF deployed at 12:39:05, exploit at 12:39:00, 5-second delay |
| Lateral movement | Lateral-movement-tracking | PARTIAL (detected at 12:40:30) | YES (terminate) | **Gap: Latency** — detected 90 seconds AFTER compromise; secrets accessed before detection |

**Critical gaps found:**
1. **Detection latency for exploitation**: 5 seconds between exploit attempt and WAF deployment
2. **Detection latency for lateral movement**: 90 seconds between compromise and alert
3. **Distributed credential testing not correlated**: Attacker switched IPs; second IP not recognized as same attacker

### Phase 4: Data Exposure Assessment (Parallel, 0-4 hours)

**Goal**: Understand what an attacker accessed.

**Questions:**
- Which databases did they query? (What tables? How many rows returned?)
- Which files did they read? (system files? customer data? configs?)
- Which secrets/credentials did they access? (API keys? DB passwords? tokens?)
- Did they exfiltrate data? (where did it go? detected?)
- Did they modify anything? (what was changed? when was it changed back?)

**Scope:**
- Customer PII: Count affected customers
- Payment data: Were credit cards/tokens accessed?
- Internal data: Source code, configs, API keys
- Regulatory implications: GDPR? PCI? HIPAA? SOC2?

### Phase 5: Root Cause & Countermeasure Planning (Hours 4-24)

**Goal**: Identify root causes, plan improvements.

**Questions per gap:**

**Gap 1: Exploitation detection latency (5 seconds)**
- Root cause: WAF rule generation delay?
- Countermeasure: Pre-generate WAF rules for known CVEs in your stack
- Improvement: Deploy known-CVE rules within 1 second of exploitation detection
- Owner: Security team
- Timeline: Implement within 1 week

**Gap 2: Lateral movement detection latency (90 seconds)**
- Root cause: Lateral-movement-tracking was not wired in; precursor-detection only
- Countermeasure: Build okhp3-lateral-movement-tracking skill
- Improvement: Detect agent-to-agent tool calls within 1 second
- Owner: Platform team
- Timeline: Implement within 2 weeks

**Gap 3: Distributed credential testing not correlated**
- Root cause: Each source IP treated independently; no cross-IP pattern matching
- Countermeasure: Aggregate credential-test alerts across source IPs by target account
- Improvement: If 5+ IPs attempt same accounts within 10 minutes, flag as distributed
- Owner: Security team
- Timeline: Implement within 1 week

### Phase 6: Baseline & Pattern Library Updates (Hours 24-72)

**Goal**: Make future baselines and patterns smarter.

**Updates to okhp3-behavioral-baselining:**
- Pre-compromise baseline: What did the compromised service normally do?
- Post-compromise baseline: What changed? (More API calls? Different tool access?)
- Update baseline to flag similar patterns in future

**Updates to okhp3-agentic-attack-patterns:**
- New detection rule: Distributed credential testing across source IPs
- New pattern for lateral movement via tool-chaining
- Tighten confidence scoring for exploitation attempts (add +5% for WAF-triggering payloads)

**Updates to okhp3-precursor-detection:**
- Add distributed-cred-test detection rule
- Reduce latency between exploitation detection and response

**Documentation:**
- Incident report: What happened, timeline, scope, resolution
- Lessons learned: What worked, what didn't
- Action items: What to change, who's responsible, timeline
- Pattern updates: New signatures to prevent recurrence

## Investigation Checklist

### Phase 1: Triage (30 min)
- [ ] Incident number assigned
- [ ] Incident commander identified
- [ ] Affected systems listed
- [ ] Severity assessed (P1-P3)
- [ ] Initial containment decision made

### Phase 2: Timeline (2 hours)
- [ ] Pull decision-chain-audit-trail for affected system
- [ ] Identify first alert triggered
- [ ] Map each subsequent alert chronologically
- [ ] Identify when attack likely achieved access (not just when detected)
- [ ] Timeline validated against 3+ independent sources (logs, alerts, system events)

### Phase 3: Gap Analysis (4 hours)
- [ ] For each attack stage, document: detected? responded? effectiveness
- [ ] Identify latency gaps (detection lag, response delay)
- [ ] Identify coverage gaps (which attack stages slipped through?)
- [ ] Trace why each gap existed

### Phase 4: Data Exposure (4 hours parallel)
- [ ] Identify systems compromised
- [ ] List data accessed (PII/payment/internal/credentials)
- [ ] Count affected customers/records
- [ ] Assess regulatory notification requirement (GDPR/PCI/HIPAA/SOC2)
- [ ] If exfiltration suspected, trace to where data went

### Phase 5: Countermeasures (24 hours)
- [ ] Root cause identified for each gap
- [ ] Countermeasure proposed for each gap
- [ ] Improvement measurable (what metric changes?)
- [ ] Owner assigned for each improvement
- [ ] Timeline committed for each improvement

### Phase 6: Updates (72 hours)
- [ ] Baseline updated (pre/post-compromise patterns)
- [ ] Pattern library updated (new signatures)
- [ ] Detection rules updated (latency reduced?)
- [ ] Incident report published (internal)
- [ ] Lessons learned documented
- [ ] Action items tracked to completion

## Integration Points

**Inputs:**
- okhp3-decision-chain-audit-trail: Complete decision history for reconstruction
- okhp3-behavioral-baselining: Pre-compromise baselines
- System/security logs: Raw evidence

**Outputs:**
- Incident report (timeline, scope, root cause, countermeasures)
- Baseline updates (fed back to behavioral-baselining)
- Pattern library updates (fed back to agentic-attack-patterns)
- Action items (assigned to precursor-detection, proportional-response, etc.)
- okhp3-attack-economics: Incident cost data (damage scope, response cost)

## Success Metrics

- **Investigation speed**: Triage <30 min, timeline <2 hours, full analysis <24 hours
- **Completeness**: No critical questions left unanswered
- **Actionability**: Every gap has measurable countermeasure with owner + timeline
- **Learning velocity**: Pattern/baseline updates deployed within 1 week of incident
- **Recurrence**: Same incident pattern doesn't repeat; metrics show improvement

