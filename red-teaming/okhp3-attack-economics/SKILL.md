---
name: okhp3-attack-economics
description: >
  Track defense spending vs attacker cost to measure whether proportional-response
  is actually working. Quantify incident costs, response costs, and the defender/attacker
  cost ratio. Identifies whether defenses are economically sustainable.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-measurement
  origin: okhp3/skillz
  in_scope: "Cost accounting, ROI analysis, defense effectiveness metrics, budget rationalization"
  out_of_scope: "Budget approval decisions, resource allocation, staffing decisions"
---

# okhp3-attack-economics

Measure whether your 12-gauge squad is actually shooting down drones cheaper than the attacker sends them.

## Principle

Defense only works if the math makes sense. A defense that costs more than the asset being protected is economically irrational. A response that costs more than letting the attack succeed wastes money.

This skill quantifies:
- **What did the attack cost us?** (incident damage: data breach, downtime, etc.)
- **What did defense cost us?** (continuous security spending + incident response)
- **What did the attacker spend?** (estimated: reconnaissance, probes, tools)
- **What's the ratio?** (defender cost / attacker cost — goal is <5:1, disaster is >20:1)

## Key Metrics

### Attack Cost Estimation

Estimate what the attacker spent based on observables:

| Attack type | Estimated attacker cost | Observable signals |
|---|---|---|
| Distributed reconnaissance | $100-500 (compute + proxies) | 700K+ scanner IPs, multiple source geos, 2-5 day campaign |
| Credential testing (spray) | $50-200 (compute + wordlists) | 20+ failed logins, <1 sec/attempt velocity, distributed IPs |
| Known-CVE exploitation | $0-50 (free tool) | SQLi/RCE payload in logs, matches public exploit |
| AI-generated exploit | $4-50 (from agent swarm quote) | 40+ exploit variants, different payload structures, auto-tuning behavior |
| Custom zero-day | $500-50,000 (months of dev) | Sophisticated multi-stage chain, novel technique, targeted |

**Rule of thumb**: Assume <$500 for commodity agentic attacks, $500-5K for targeted attacks, $5K+ for zero-days.

### Incident Cost Estimation

Measure damage once breach occurs:

| Cost category | Estimation method | Example |
|---|---|---|
| Downtime | (hourly revenue × hours) | $10K/hour revenue × 2 hours = $20K |
| Data breach | (affected users × per-record cost) + notification | 50K users × $5 = $250K + $50K notification |
| Response labor | (salary × incident_hours) | 5 people × $75/hr × 24 hours = $9K |
| Legal/compliance | GDPR fines + regulatory reporting | $50K-$500K+ depending on regulation |
| Reputation | (customer churn × LTV) | 100 customers × $5K LTV = $500K |
| **Total incident cost** | Sum of above | $250K-$1M+ for serious breach |

### Defense Cost Tracking

Measure ongoing security spending:

| Category | Cost |
|---|---|
| Security team (salaries) | $500K-$2M/year |
| Security tools (SIEM, WAF, IDS) | $100K-$500K/year |
| Incident response (on-call, training) | $50K-$200K/year |
| Red-teaming automation (this family) | $50K-$150K (setup) + $10K-$30K/year (maintenance) |
| **Annual defense budget** | $750K-$3M+ |

### Cost-Per-Response Tracking

For each alert/incident, track response cost:

| Response | Cost |
|---|---|
| Rate limiting (auto) | $0.01 per request blocked |
| Credential rotation (auto) | $1-10 per account rotated |
| WAF rule deployment (auto) | $0 (rules already running) |
| Session termination (auto) | $0 (local operation) |
| On-call escalation (human) | $500-1,000 per incident (pager duty + analyst time) |
| Incident commander page (human) | $2,000-5,000 per major incident |
| Full incident response (team) | $5,000-50,000+ (depends on scope) |

### The Cost Ratio

The critical metric:

```
Cost Ratio = Defense Spending / (Attacks Prevented × Avg Attack Cost)

Example calculations:

Scenario A (Good):
  Annual defense budget: $1M
  Attacks attempted: 50,000 (commodity agentic)
  Attack cost: $100 each
  Attacks prevented: 49,950 (99.9% stopped before breach)
  Cost ratio = $1M / (49,950 × $100) = 0.2:1
  INTERPRETATION: Every $1 of attacker investment is stopped by $0.20 of defense
  STATUS: ✓ Excellent, sustainable

Scenario B (Mediocre):
  Annual defense budget: $1M
  Attacks attempted: 10,000
  Attacks prevented: 9,950 (99.5% stopped)
  Cost ratio = $1M / (9,950 × $100) = 1.0:1
  INTERPRETATION: Defender and attacker costs equal
  STATUS: ⚠ Barely sustainable; one breach wipes out savings

Scenario C (Bad):
  Annual defense budget: $1M
  Attacks attempted: 5,000
  Attacks prevented: 4,900 (98% stopped)
  Cost ratio = $1M / (4,900 × $100) = 2.0:1
  INTERPRETATION: Defender pays $2 for every $1 attacker spends
  STATUS: ✗ Unsustainable; need to improve defense or accept more risk

Scenario D (Disaster):
  Annual defense budget: $1M
  Successful breaches: 2
  Avg breach cost: $1M each
  Defense effectiveness: 99% of attacks stop, but 2 slip through
  Real cost = $1M defense + $2M breach = $3M total
  Cost ratio = $3M / (2 × $1M breach) = 1.5:1 (but only counting breaches)
  STATUS: ✗✗ Even with 99% defense rate, 2 breaches wipe out year's savings
  ACTION: Need to either increase defense budget or accept that breaches will happen
```

## Measuring Effectiveness

Track whether responses actually work:

**Metric 1: Attack stopped?**
```
IF response applied at Stage 1-2 (reconnaissance/credential test)
THEN measure: Did attacker abandon attack or escalate despite response?
  - Abandoned: Response worked (cost to attacker increased, cost to us near-zero)
  - Escalated: Response didn't work (attacker better equipped than we thought)
  - Switched IP/technique: Response partially worked (slowed, not stopped)
```

**Metric 2: Detection latency vs response cost**
```
Example:
  Stage 1 (recon) detected at T+5 min, responded at T+6 min
    Cost: Rate limit ($0.01/req)
    Effectiveness: Attacker continued (switched IP)
    
  Stage 2 (cred test) detected at T+10 min, responded at T+11 min
    Cost: Credential rotation ($5)
    Effectiveness: Attacker locked out temporarily
    
  Stage 3 (exploitation) detected at T+15 min, responded at T+20 min
    Cost: WAF rule deployment ($0)
    Effectiveness: Initial exploit blocked but lateral movement already successful
    
  Stage 4 (lateral move) detected at T+115 min (95 min after compromise)
    Cost: Incident response ($10K)
    Effectiveness: Damage already done; containment only stops future movement
    
INSIGHT: Latency between stages 3-4 is our critical vulnerability
ACTION: Reduce detection latency for lateral movement from 95 min to <1 min
```

**Metric 3: False positive cost**
```
Every false positive costs:
  - Analyst time to triage: $50
  - Potential override of legitimate action: $100-$1,000
  - Alert fatigue reducing team vigilance: ???
  
If alert system triggers 1,000 alerts/day and 50 are false positives:
  False positive cost = 50 × $50 = $2,500/day = $912,500/year

This is why confidence scoring matters (filter for HIGH confidence only)
and why context filtering matters (known legitimate patterns ignored)
```

## Reporting

Track these metrics monthly:

```
Monthly Security Economics Report

ATTACKS & DETECTION
- Attacks attempted: 12,500
- Attacks detected: 12,350 (98.8%)
- Attacks detected in Stage 1-2: 11,200 (89.6%) — early catch
- Attacks detected in Stage 3+: 1,150 (9.2%) — late catch
- Attacks that breached (slipped through): 150 (1.2%) — failure rate

RESPONSE EFFECTIVENESS
- Stage 1-2 responses: 11,200, stopped: 10,500 (93.8%)
- Stage 1-2 responses: 11,200, attacker escalated: 700 (6.2%)
- Stage 3+ responses: 1,150, contained: 850 (73.9%)
- Stage 3+ responses: 1,150, breach succeeded: 300 (26.1%)

COSTS
- Defense spending this month: $85,000 (annual budget / 12)
- Response costs (auto): $5,000 (rate limits, credential rotations, WAF)
- Response costs (human): $15,000 (incident commanders, on-call)
- Incident damages: $0 (all breaches contained before major damage)
- Total this month: $105,000

ECONOMICS
- Attacks prevented: 12,350
- Cost per attack prevented: $85,000 / 12,350 = $6.88
- Attacker cost per attempt: ~$100 (commodity attacks)
- Cost ratio: $6.88 / $100 = 0.069:1 ✓ Excellent

ANOMALIES
- Stage 3+ detection latency spike: 45 min → 120 min mid-month
- ROOT CAUSE: Lateral-movement-tracking not yet deployed
- ACTION: Deploy okhp3-lateral-movement-tracking by end of month
- IMPACT: Expect detection latency to drop to <2 min
```

## Integration Points

**Inputs:**
- okhp3-decision-chain-audit-trail: Response times, types, effectiveness
- okhp3-post-breach-forensics: Incident costs, damage assessment
- Incident tracking system: Breach counts, severity assessments
- Finance system: Security budget allocation

**Outputs:**
- Monthly economics report (for leadership + budget planning)
- Cost-per-response trending (for automation investment decisions)
- Effectiveness metrics (for threshold tuning in precursor-detection)
- ROI justification (for funding future improvements)

## Success Metrics

- **Cost ratio**: Target <1:1 (defender cost < attacker cost), acceptable <5:1, disaster >10:1
- **Early catch rate**: Stage 1-2 detection >85% (where cost is lowest)
- **False positive rate**: <5% (so analysts don't suffer alert fatigue)
- **Monthly reporting**: 100% of months have economics report
- **Decision impact**: Economics data drives at least one infrastructure decision per quarter

