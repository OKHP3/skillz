---
name: okhp3-behavioral-baselining
description: >
  Establish and maintain baseline profiles of normal agent behavior, request patterns,
  resource consumption, decision distributions, and tool access. Detect behavioral
  deviation that signals compromise, jailbreak, or model poisoning before damage occurs.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-foundation
  origin: okhp3/skillz
  in_scope: "Baseline profiling, anomaly detection, behavioral drift tracking, statistical deviation analysis"
  out_of_scope: "Determining intent, business logic validation, performance tuning, user behavior analysis"
---

# okhp3-behavioral-baselining

Establish what "normal" looks like for your agentic systems, so you can detect when something is not normal.

## Purpose

Anomaly detection is worthless without baselines. Most compromises are invisible until you know what normal behavior looks like. This skill establishes quantitative profiles of:

- **Agent decision patterns**: reasoning chain length, tool-call sequences, confidence/entropy distributions
- **Request patterns**: frequency, size, latency, error rates, retry patterns
- **Resource consumption**: token usage, compute time, API call velocity, concurrent sessions
- **Tool access patterns**: which tools called by which agents, in what sequences, at what rates
- **Data flow**: inbound data size/source, outbound data size/destination, encryption status

Once established, these baselines become the foundation for precursor-detection, anomaly-detection, and lateral-movement-tracking skills.

## Scope

| In scope | Out of scope |
|---|---|
| Quantitative behavioral profiling (statistical patterns in logs/telemetry) | Determining whether behavior is "intentional" or "malicious" |
| Detecting statistical deviation from established baseline | Judging whether requests are legitimate business logic |
| Time-series analysis, distribution changes, outlier detection | Performance optimization or tuning |
| Continuous baseline update as normal behavior evolves | Replacing security policy or access controls |

## Core Workflow

### Step 1: Define Baseline Dimensions

Before profiling, declare what you're measuring. Minimum set:

| Dimension | Metric | Data Source |
|---|---|---|
| Decision chains | Avg reasoning steps, distribution of tool-call sequences | Agent logs (reasoning traces) |
| Request volume | Requests/hour by agent, by time-of-day pattern | API/request logs |
| Tool access | Tool X called by agent Y at time Z, frequency, sequences | Tool instrumentation logs |
| Resource consumption | Tokens/request, compute time/request, concurrent sessions | LLM + infra metrics |
| Error patterns | Error rate, retry frequency, failure types by tool | Error logs |
| Latency | P50/P95/P99 response time by tool, by request type | Request/response timing |

### Step 2: Collect Clean Baseline Data

Baseline collection period: minimum 2-4 weeks of KNOWN-CLEAN operation.

- Capture data during periods when you're confident systems are not compromised
- If starting from zero, use this first period to build the profile
- Segment by agent type, environment (dev/staging/prod), time-of-day if patterns vary
- Store baseline snapshots; they evolve over time as systems legitimately change

**Baseline snapshot includes**:
- Statistical summary (mean, median, p95, p99 for each metric)
- Distribution shape (normal, bimodal, long-tail)
- Confidence intervals or tolerance bands
- Collection period, data volume, known constraints

### Step 3: Detect Deviation

Run continuous comparison against baseline. Deviation signals include:

| Signal | What it may indicate | Response priority |
|---|---|---|
| Tool access sequence never seen before (out-of-distribution) | Compromised agent exploring new capabilities or lateral movement | HIGH |
| Request rate 10x normal for an agent (velocity spike) | Brute-force attack, credential stuffing, scanning | HIGH |
| Reasoning chain 2-3x longer than historical normal | Model jailbreak, prompt injection causing loops, confusion | MEDIUM |
| Agent suddenly accessing tool it never accessed before | Lateral movement, permission escalation test | MEDIUM |
| Concurrent session count 5x normal | Session hijacking, distributed attack from one agent | HIGH |
| Response latency >2x baseline P99 for specific tool | Tool compromise, external dependency attack, network degradation | LOW-MEDIUM |
| Error rate 5x normal, specific error type | Exploitation attempt triggering defensive errors | MEDIUM |

### Step 4: Baseline Maintenance

Baselines must evolve as systems legitimately change:

- **Monthly review**: check whether normal behavior has shifted (new features, seasonal patterns, growth)
- **Update rules**: if change is legitimate (new tool deployed, new agent type), update baseline snapshot
- **Archive old baselines**: keep historical versions for forensics (answer "when did this behavior first appear?")
- **Control baseline drift**: require explicit approval to widen tolerance bands; don't auto-widen

## Implementation Checklist

- [ ] Define baseline dimensions (minimum table above)
- [ ] Identify data sources for each dimension (agent logs, API logs, infra metrics)
- [ ] Establish collection infrastructure (log aggregation, time-series DB if needed)
- [ ] Collect 2-4 week clean baseline for each agent type
- [ ] Compute statistical summaries: mean, median, p95, p99, distribution
- [ ] Document baseline snapshot: values, confidence intervals, collection period, known constraints
- [ ] Instrument anomaly detection alerts tied to defined deviation thresholds
- [ ] Set up baseline review process (monthly, with approval gate for updates)
- [ ] Integrate with precursor-detection skill (flag deviations for human triage)

## Integration Points

This skill feeds:
- **okhp3-precursor-detection**: behavioral anomalies are early-stage attack signals
- **okhp3-model-behavior-anomaly-detection**: baselines for reasoning chains + decision entropy
- **okhp3-lateral-movement-tracking**: baseline for "tool access sequences never seen before"
- **okhp3-proportional-response**: baseline deviation severity informs response cost-benefit scoring

This skill depends on:
- Infrastructure for collecting logs (agent traces, API logs, infra metrics)
- Time-series data storage or statistical analysis tooling
- Agent/system instrumentation (logging enabled, traces captured)

## Common Pitfalls

**Pitfall 1: "Collecting normal for 1 week is enough"**
- One week misses time-of-day patterns, weekly cycles, seasonal shifts
- Minimum 2 weeks; 4 weeks preferred
- Collect from multiple environments if possible (dev patterns differ from prod)

**Pitfall 2: "One baseline for all agents"**
- Different agent types (LLM-driven vs tool-driven vs decision-only) have different normal patterns
- Baseline per agent type, or per agent if behavior varies significantly
- Mixing patterns destroys statistical power

**Pitfall 3: "Baselines never change, lock them in"**
- Legitimate system changes (new tools, new agents, feature launches) shift baselines
- But don't auto-widen tolerances; require explicit review + approval
- Archive old baselines for forensics

**Pitfall 4: "Baseline == security policy"**
- Baselines describe what IS, not what SHOULD BE
- A tool being accessed frequently is a detection signal, not a security verdict
- Response decisions live in precursor-detection and proportional-response skills

## Governance Requirements

- Baseline snapshots are stored immutably (with version history)
- Baseline updates require documented approval (what changed, why, who authorized)
- Anomaly alerts feed precursor-detection for human triage; no automatic containment from baseline alone
- Baselines are considered security-sensitive (exposure reveals system structure); restrict access

## Success Metrics

- Baseline collection completes within agreed window (2-4 weeks)
- Anomaly detector achieves <2% false-positive rate against clean baseline
- Behavioral deviations from known attacks detected within median 30 seconds
- Baseline stability: <5% month-over-month drift in normal behavior (indicates legitimate vs compromised change)
- Forensic value: historical baselines enable root-cause analysis post-incident

