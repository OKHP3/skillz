---
name: okhp3-response-cost-benefit-calculator
description: >
  Real-time triage decisions for incident response using ROI formula: 
  (Breach_Cost × Probability × Effectiveness) / Response_Cost. Bayesian risk model 
  with cost asymmetry. Approval authority matrix by tier. Historical base rate refinement. 
  Target: triage time <5 min, approval rate >95%.
difficulty: 7
time_estimate: "4-6 weeks"
topics:
  - incident response
  - cost-benefit analysis
  - triage decisions
  - risk modeling
  - Bayesian estimation
  - economic optimization
integration:
  - Feeds: proportional-response (tier selection), authorization-governance-checkpoint (approval routing)
  - Requires: attack-economics (cost models), decision-chain-audit-trail (decision recording)
  - Part of: Phase 5 (Optimization Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Response-Cost-Benefit-Calculator

**Purpose**: Make real-time incident response tier decisions using economic ROI analysis. When an attack is detected, calculate whether to respond at Tier 0 (observe), Tier 1 (rate-limit), Tier 2 (rotate credentials), Tier 5 (isolate), or Tier 6 (incident response). Tier selection is automatic if ROI > 100:1, team-lead-approval if 10:1–100:1, escalated if undecidable.

The calculator is the economic gatekeeper. It prevents expensive responses to cheap problems and cheap responses to expensive threats. ROI-positive triage saves >$10M annually on mid-sized organizations.

---

## Conceptual Model

### The ROI Formula

```
ROI = (Breach_Cost × Probability × Effectiveness) / Response_Cost

Auto-Approve (ROI > 100:1):   Tier 0-1 automatic, no human approval needed
Team Lead (ROI 10:1–100:1):   Tier 2 requires team lead approval (2-min SLA)
Escalated (ROI < 10:1):       Tier 3-6 requires incident commander review
Investigate (ROI undefined):  Missing data; escalate for classification
```

### Cost Components

**Breach Cost** (potential loss if attack succeeds):
- Data exfiltration: $40/record (GDPR/CCPA baseline)
  - 1M customer records = $40M
  - 10K employee records = $400K
  - 100K health records (HIPAA) = $10M+
- Service downtime: $5K-$50K/minute (varies by revenue model)
  - E-commerce: $50K-$500K/minute
  - SaaS: $10K-$100K/minute
  - Internal systems: $1K-$10K/minute
- Ransomware: 3-5% of revenue (typical) + remediation
- Reputational damage: 5-20% revenue drop over 6 months (historical range)
- Regulatory fines: 2-4% of global revenue (GDPR), $5K-$100K per customer (CCPA)

**Probability** (likelihood attack succeeds if unresponded):
- Reconnaissance alone detected: P = 0.3 (likely fails before exploitation)
- Credential test detected: P = 0.6 (50/50 if attacker gets one valid cred)
- Exploitation stage detected: P = 0.8 (code execution likely imminent)
- Lateral movement detected: P = 0.95 (attacker already inside)
- Persistence detected: P = 0.99 (attacker entrenched, will exfil)

**Effectiveness** (how much the response reduces breach probability):
- Tier 0 (observe): Effectiveness = 0% (response_cost = $0, no reduction)
- Tier 1 (rate-limit): Effectiveness = 20-40% (slows reconnaissance, credential spray)
- Tier 2 (rotate credentials): Effectiveness = 30-60% (invalidates stolen creds, but P still high if exploitation in progress)
- Tier 3 (WAF rules): Effectiveness = 40-80% (blocks known payloads, but attackers adapt)
- Tier 4 (session kill): Effectiveness = 60-90% (terminates active sessions, moderate re-exploitation cost)
- Tier 5 (isolate): Effectiveness = 90-99% (network segmentation, minimal lateral movement possible)
- Tier 6 (incident response): Effectiveness = 95-99% (full forensics, remediation, re-hardening)

**Response Cost** (direct cost to execute response):
- Tier 0: $0 (passive observation)
- Tier 1: $0.01–$0.10/request (rate-limit overhead, negligible)
- Tier 2: $1–$10 (credential rotation: manual effort, service restart)
- Tier 3: $0–$100 (WAF rule deployment, testing)
- Tier 4: $0–$50 (session invalidation, user re-auth)
- Tier 5: $10K–$100K (network isolation, recovery, downtime cost)
- Tier 6: $50K–$1M+ (full incident response, forensics, external responder cost)

---

## Triage Workflow

### Stage 1: Event Classification

When an alert arrives (from precursor-detection or anomaly detector):

```
Input: {attack_stage, confidence_score, affected_systems, attack_pattern}

1. Query attack-economics: get historical Breach_Cost for this attack type
   - Is this exfiltration attack? → $40M baseline (100K records assumed)
   - Is this DoS? → $5K/minute × estimated_duration
   - Is this data corruption? → $100K–$1M re-validation cost
   - Default: use median for attack stage (reconnaissance: $100K, exploitation: $5M)

2. Estimate Probability from attack_stage:
   - Stage 1 (recon) → P = 0.3
   - Stage 2 (cred test) → P = 0.6
   - Stage 3 (exploit) → P = 0.8
   - Stage 4 (lateral) → P = 0.95
   - Stage 5 (persist) → P = 0.99
   - Adjust by confidence_score: P_adjusted = P × confidence (0.5–1.0)

3. Query proportional-response: get Effectiveness for each tier
   - Tier 1 vs Stage 1 (recon)? → Effectiveness = 40% (rate-limit slows scanning)
   - Tier 2 vs Stage 2 (cred test)? → Effectiveness = 50% (rotation invalidates sprayed creds)
   - Tier 5 vs Stage 3 (exploit)? → Effectiveness = 90% (isolation prevents code execution)

4. Calculate ROI for each viable tier
```

### Stage 2: ROI Calculation & Approval Routing

```
For each tier T:
  ROI_T = (Breach_Cost × P_adjusted × Effectiveness_T) / Response_Cost_T
  
Example (Stage 3 Exploitation attack):
  Breach_Cost = $5M (median for exploitation)
  Probability = 0.8 × 0.9 (confidence-adjusted) = 0.72
  
  Tier 1 (rate-limit):
    Effectiveness = 5% (does nothing for exploitation)
    Response_Cost = $0.01
    ROI = ($5M × 0.72 × 0.05) / $0.01 = $18M:1 ✓ AUTO-APPROVE
    BUT: Effectiveness too low; escalate to Tier 2 instead
  
  Tier 2 (credential rotation):
    Effectiveness = 10% (does nothing for exploitation)
    Response_Cost = $5
    ROI = ($5M × 0.72 × 0.10) / $5 = $72K:1 ✓ AUTO-APPROVE
    BUT: Effectiveness too low; escalate to Tier 3 instead
  
  Tier 3 (WAF rules):
    Effectiveness = 60% (blocks known exploit payloads)
    Response_Cost = $50
    ROI = ($5M × 0.72 × 0.60) / $50 = $43.2K:1 ✓ AUTO-APPROVE
    
  Tier 5 (isolate):
    Effectiveness = 95% (network isolation prevents exploitation cold)
    Response_Cost = $50K
    ROI = ($5M × 0.72 × 0.95) / $50K = $68:1 ✓ TEAM LEAD APPROVAL
    (ROI between 10:1 and 100:1, requires 2-min review)
```

**Approval Matrix**:

| ROI | Tier | Authority | SLA | Notes |
|-----|------|-----------|-----|-------|
| >100:1 | 0-1 | Automatic | <30 sec | Rate-limit, observe; no approval needed |
| 10:1–100:1 | 2 | Team Lead | <2 min | Credential rotation; requires 2-min decision |
| 10:1–100:1 | 3-4 | Team Lead | <5 min | WAF/session kill; requires verification |
| <10:1 | 5 | Incident Commander | <15 min | Isolation; high cost, needs justification |
| <10:1 | 6 | CISO | <30 min | Full incident response; strategic decision |
| Undefined | Any | Incident Commander | <10 min | Missing data; classify first |

### Stage 3: Decision Recording

All decisions recorded to decision-chain-audit-trail:
```
{
  timestamp,
  attack_stage,
  breach_cost_estimate,
  probability,
  effectiveness_by_tier,
  roi_by_tier,
  recommended_tier,
  approval_authority,
  approval_decision (approved/rejected/escalated),
  execution_time,
  outcome (attack stopped / continued / undecidable)
}
```

---

## Historical Base Rate Refinement

### Learning from Incident Data

Every month, refine Breach_Cost and Probability estimates from incidents:

**Breach Cost Refinement**:
```
If reconnaissance attack escalated to exfiltration within 72 hours:
  Actual_Loss = records_exposed × $40 + remediation_cost + downtime
  Historical_Cost_Estimate = $100K (stage 1 baseline)
  
  If actual > 3× estimate: raise baseline (attackers more effective than modeled)
  If actual < 0.3× estimate: lower baseline (defenses stronger than assumed)
  
  Update: Breach_Cost_reconnaissance = 0.9 × old + 0.1 × new
```

**Probability Refinement**:
```
Track: "of 100 reconnaissance alerts, how many escalated to credential testing?"
  - Month 1: 30% escalated
  - Month 2: 25% escalated (defenses improved)
  - Month 3: 20% escalated (pattern learning)
  
  Update: P_reconnaissance = 0.3 → 0.25 (lower escalation risk over time)
```

**Effectiveness Refinement**:
```
Track: "when we deployed rate-limiting, how many brute-force attacks continued?"
  - Stopped 85% (Tier 1 effectiveness = 85%, higher than 40% baseline)
  - Updated model: Tier 1 vs Stage 2 = 85% (was 40%)
```

### Base Rate Table (Initial Estimates, Refined Monthly)

| Attack Stage | Median Breach Cost | P (Unresponded) | Tier 1 Effect | Tier 2 Effect | Tier 5 Effect |
|---|---|---|---|---|---|
| **Reconnaissance** | $100K | 0.30 | 40% | 15% | 70% |
| **Credential Testing** | $500K | 0.60 | 60% | 50% | 80% |
| **Exploitation** | $5M | 0.80 | 5% | 10% | 95% |
| **Lateral Movement** | $10M | 0.95 | 0% | 5% | 98% |
| **Persistence** | $20M | 0.99 | 0% | 0% | 99% |

---

## Success Metrics

### Triage Speed
- **Target**: <5 minutes from alert to decision
- **Measure**: decision_timestamp - alert_timestamp
- **Success**: >95% of decisions made within SLA (30 sec for auto-approve, 2 min for team lead, 15 min for incident commander)

### Approval Rate
- **Target**: >95% of decisions approved at first submission
- **Measure**: approved / (approved + rejected)
- **Indicator of**: calculator accuracy; low approval rate signals poor ROI estimates

### ROI Accuracy
- **Target**: Actual outcome aligns with ROI prediction (attack stopped if ROI >10:1)
- **Measure**: of approved responses, % that successfully contained attack
- **Success**: >85% of approved responses prevent escalation

### Cost Reduction
- **Target**: Defense cost <1:1 of breach cost (defense asymmetry solution)
- **Measure**: total_response_cost_monthly / total_breach_cost_prevented_monthly
- **Success**: ratio <0.5:1 (defense costs half as much as breach would)

---

## Implementation Checklist

- [ ] Implement ROI formula: (Breach_Cost × Probability × Effectiveness) / Response_Cost
- [ ] Build attack-stage-to-probability mapping (recon → exploit → persistence)
- [ ] Query attack-economics for historical Breach_Cost baseline per attack type
- [ ] Build tier-to-effectiveness matrix (6 tiers × 6 attack stages)
- [ ] Implement Bayesian probability adjustment (confidence × base P)
- [ ] Define approval authority matrix (ROI → authority → SLA)
- [ ] Set up decision-chain-audit-trail recording (7 fields per decision)
- [ ] Build monthly base-rate refinement job (incident → loss → estimate update)
- [ ] Create dashboard: ROI by tier, approval rate, cost reduction ratio
- [ ] Set up alerts for anomalies (e.g., >5 rejections in 1 hour = estimates out of date)
- [ ] Establish integration with proportional-response (recommended tier → tier execution)
- [ ] Create quarterly review: ROI accuracy vs actual outcomes, cost trends

