---
name: okhp3-precursor-detection
description: >
  Detect reconnaissance, credential testing, and early exploitation attempts
  BEFORE they escalate to lateral movement or data breach. Applies agentic-attack-patterns
  to behavioral baseline deviations, alerts for human triage or automated proportional response.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-detection
  origin: okhp3/skillz
  in_scope: "Early-stage attack detection, precursor pattern matching, behavioral anomaly correlation"
  out_of_scope: "Automated response, investigation, forensics, or determining attacker identity"
---

# okhp3-precursor-detection

Catch reconnaissance and credential testing BEFORE they become exploitation and breach.

## Purpose

The first two stages of agentic attack (reconnaissance and credential testing) are observable and happen BEFORE the attacker can breach or move laterally. This is your actual defense window.

Most defenses trigger during stages 3-5 (exploitation, lateral movement, persistence). By then, the attacker has already won—they're past the initial boundary. This skill triggers during stages 1-2, when the attack is still gathering information or probing credentials.

The cost-benefit math: detect and respond during reconnaissance/credential-testing costs near-zero (rate-limit a scanner, rotate credentials). Detect during exploitation costs medium (isolate a system, revoke access). Detect during persistence costs high (full incident response, forensic investigation, multi-system recovery).

## Core Workflow

### Input: Attack Patterns + Behavioral Baseline

This skill requires two inputs from upstream skills:

1. **okhp3-agentic-attack-patterns** — the pattern library (recon signatures, credential-test signatures)
2. **okhp3-behavioral-baselining** — the normal behavior profile for each agent

### Detection Pipeline

```
Incoming request/event
  ↓
Match against baseline (okhp3-behavioral-baselining)
  ├─ Within normal? → Log, continue
  └─ Deviation detected → Continue to pattern matching
  ↓
Match against attack patterns (okhp3-agentic-attack-patterns)
  ├─ No pattern match → Anomaly (flag for okhp3-model-behavior-anomaly-detection)
  └─ Stage 1 or 2 pattern match → Precursor alert
  ↓
Score confidence: how confident is this Stage 1-2 attack?
  ├─ >80% confidence → High priority alert
  ├─ 50-80% confidence → Medium priority alert
  └─ <50% confidence → Low priority, check context
  ↓
Alert for triage / response (okhp3-proportional-response decides action)
```

### Stage 1: Reconnaissance Detection

Detect when an agent or external source is surveying your systems.

**Common signals:**

| Signal | Confidence | Action priority |
|---|---|---|
| 50+ distinct 404 errors from single source to endpoints not in agent baseline | HIGH | Block IP, rate limit |
| DNS queries for .com/.net/.io variants of your domain (typosquatting recon) | MEDIUM | Block DNS source, monitor |
| Requests to /.git, /.env, /config.php within 5min of domain discovery | HIGH | Alert, monitor for exploitation |
| User-Agent fingerprinting (repeated HEAD requests inspecting headers) | MEDIUM | Log, rate-limit source |
| Port scan activity detected (SYN scans on multiple ports) → followed by service probing | HIGH | Block source at firewall |
| Subdomain enumeration (DNS lookups for subdomain.your-domain.com, variants not in DNS records) | MEDIUM | Monitor DNS for follow-up |

**Example detection rule:**
```
IF agent_X makes GET requests to 20+ distinct paths
   AND response_codes are mostly 404
   AND these paths include [/.git, /.env, /config, /admin]
   AND paths not in agent_X baseline
   AND all within 2 minutes
THEN confidence = HIGH
  AND alert_type = RECONNAISSANCE
  AND alert_severity = MEDIUM (not yet attempted breach)
```

### Stage 2: Credential Testing Detection

Detect when an agent is enumerating or testing user credentials.

**Common signals:**

| Signal | Confidence | Action priority |
|---|---|---|
| Failed login attempts >10 from single source within 5 min | HIGH | Block source, rate limit, alert |
| Login attempts with 20+ distinct usernames, 3 passwords (spray pattern) | HIGH | Alert, rotate high-value accounts |
| Login attempts using credentials from known breach DB (check against HaveIBeenPwned) | HIGH | Alert immediately, force password reset |
| MFA bypass attempts (TOTP enumeration, backup code testing) | VERY HIGH | Block source, review MFA config |
| Sudden successful login immediately after 50 failed attempts (breach succeeded) | VERY HIGH | Alert immediately, initiate incident response |
| Velocity spike in auth attempts across multiple agents simultaneously (distributed test) | HIGH | Alert on coordination pattern |

**Example detection rule:**
```
IF login_failures > 5 from source_IP within 5 min
   AND source_IP not in trusted_admin_ips
   AND attempt_count growing (1/sec or faster)
THEN confidence = HIGH
  AND alert_type = CREDENTIAL_TESTING
  AND alert_severity = HIGH
  AND recommend_action = [rate_limit, block_after_N_fails]

IF login_success immediately follows 20+ failures from same source
THEN confidence = VERY_HIGH
  AND alert_type = BREACH_LIKELY
  AND alert_severity = VERY_HIGH
  AND recommend_action = [initiate_incident, isolate_account, reset_creds]
```

### Confidence Scoring

Don't just flag everything. Score confidence so response automation can triage:

```
confidence = base_score + modifiers

base_score:
  - Single pattern match: 60%
  - Multiple patterns from same stage: +15% each
  - Pattern match + behavioral anomaly: +20%

modifiers:
  - Source IP in threat intel feeds: +10%
  - Attempt from known VPN/proxy: -5%
  - Source during business hours for agent: -5% (more likely legitimate)
  - Attempt on high-value account: +10%

MIN confidence threshold for alert: 50%
```

### Context Filtering (False Positive Reduction)

Not every failed login is an attack. Filter obvious false positives:

- **New admin during onboarding**: failed login attempts expected
- **Legitimate tools with credential errors**: known tools allowed N retries before alert
- **Rate-limit response**: tool retrying due to 429 error is not a breach attempt
- **Testing environments**: dev/staging have higher tolerance for auth anomalies
- **Authorized penetration testing**: skip patterns matching authorized red-team activity

## Integration Points

**Inputs:**
- okhp3-behavioral-baselining: normal behavior for each agent
- okhp3-agentic-attack-patterns: stage 1-2 signatures to match against

**Outputs (feeds):**
- okhp3-proportional-response: precursor alerts → response decisions
- okhp3-decision-chain-audit-trail: record the detection (for forensics)
- okhp3-lateral-movement-tracking: credential test success → watch for stage 4

## Implementation Checklist

- [ ] Feed baseline deviations into pattern matcher
- [ ] Implement stage 1 detection rules (recon signatures)
- [ ] Implement stage 2 detection rules (credential test signatures)
- [ ] Implement confidence scoring (base + modifiers)
- [ ] Add context filters (authorized testing, legitimate tools, etc.)
- [ ] Set up alerting pipeline (high confidence → immediate alert, medium confidence → queue, low confidence → log only)
- [ ] Integrate with proportional-response skill
- [ ] Test detection against known attack patterns (measure true positive rate, false positive rate)
- [ ] Document tuning (why confidence thresholds chosen, how to update as normal evolves)

## Success Metrics

- **Detection latency**: detect stage 1-2 attack within 30 seconds of precursor appearance
- **Confidence accuracy**: when we flag HIGH confidence, actual attack confirmed >85% of the time
- **False positive rate**: <2% of alerts are false positives (important for alert fatigue)
- **Stage catch rate**: detect >80% of real stage 1-2 attacks before they reach stage 3

## Constraints & Limitations

- **Requires good baselines**: if baselines are poor, anomaly detection is unreliable
- **Doesn't work offline**: needs real-time or near-real-time log stream
- **Can't catch zero-days in recon phase**: if attacker doesn't touch known paths, may not trigger
- **Requires instrumentation**: agents/tools must emit sufficient telemetry
- **Not a replacement for authentication**: this detects attacks, not prevents them

