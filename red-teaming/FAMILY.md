---
name: red-teaming
description: >
  Defensive agentic-attack mitigation through proportional detection and response.
  Patterns, baselines, precursor detection, cost-proportional automation, and
  threat intelligence for organizations protecting against saturation attacks
  from distributed agentic threats. Includes governance checkpoints to prevent
  weaponization.
family_version: "1.0.0"
compatibility: Agent Skills compatible
author: Jamie Hill (OverKill Hill P³)
---

# Red Teaming Family

**OverKill Hill P³** — Defensive agentic red-teaming and proportional response automation.

This family implements a closed-loop defensive model based on the principle that when attack cost approaches zero and arrives at machine speed, defense must also be automated, cost-proportional, and measured. Inspired by military counter-drone doctrine (Phalanx CIWS, shotgun-squad point defense) and threat economics (Shahed-136 vs Patriot missile asymmetry), scaled to cyber.

## Core Principle

Defense cannot out-expert an attacker swarm. Instead, it must:

1. **Establish normal** (behavioral-baselining) — understand what's not an attack
2. **Anticipate threats** (pattern observatory + forecasting) — know what's coming before it arrives
3. **Detect precursors** (precursor detection + anomaly detection) — catch early stages before breach
4. **Respond automatically** (proportional-response + lateral-movement-tracking) — match attacker speed
5. **Understand failures** (post-breach-forensics) — convert incidents into institutional knowledge
6. **Close the loop** (emerging-threat-lab) — evolve defenses faster than attackers

This is the 12-gauge squad approach, not Phalanx: cheap, distributed, accepting some losses, unsustainable for the attacker.

## Skill Categories

### Foundation Layer (Pre-Attack)
- **okhp3-behavioral-baselining**: Establish baseline normal for agent behavior, detect deviation
- **okhp3-agent-capability-inventory**: Audit agents, permissions, tools, assess compromise impact
- **okhp3-supply-chain-agent-provenance**: Track agent/model/tool integrity with crypto verification
- **okhp3-threat-intelligence-synthesis**: Aggregate external signals to anticipate patterns

### Detection Layer (Attack Recognition)
- **okhp3-agentic-attack-patterns**: Pattern library + rules for recon → credential test → exploitation → persistence
- **okhp3-agentic-pattern-observatory**: Monitor academic, advisory, and threat sources for NEW patterns
- **okhp3-adversary-capability-forecasting**: Predict adoption timeline for emerging patterns (4-12 week horizon)
- **okhp3-threat-pattern-validator**: Test whether emerging patterns actually affect YOUR systems
- **okhp3-precursor-detection**: Catch reconnaissance, credential testing BEFORE breach
- **okhp3-model-behavior-anomaly-detection**: Detect subtle deviations, jailbreaks, prompt injection, model poisoning
- **okhp3-lateral-movement-tracking**: Monitor agent-to-agent calls, tool chaining, escalation attempts

### Response Layer (Automated Containment)
- **okhp3-proportional-response**: Cost-proportional automation tied to each attack stage
- **okhp3-response-cost-benefit-calculator**: Real-time triage: defend cost vs breach cost
- **okhp3-decision-chain-audit-trail**: Record full reasoning path for forensics + audit

### Intelligence & Learning Layer (Post-Attack)
- **okhp3-emerging-threat-lab**: Autonomous mutation testing, countermeasure development (24-48 hr latency)
- **okhp3-post-breach-forensics**: Structured investigation playbook, root-cause analysis
- **okhp3-attack-economics**: Track defense spending vs attacker cost, measure improvements
- **okhp3-safe-intelligence-amplifier**: Share threat patterns with peers via anonymization, community early-warning

### Governance Layer (Weaponization Prevention)
- **okhp3-authorization-governance-checkpoint**: Enforce who authorizes each response level, audit trails, human-in-loop

## Integration Model

Skills feed in sequence: baseline → detect precursor → score cost-benefit → execute proportional-response (with audit trail) → capture forensics → run lab mutations → update pattern library → improve baseline → repeat.

A defender never touches a skill in isolation; they flow as a pipeline.

## Use When

You need to:
- Establish what "normal" looks like for your agentic systems
- Detect early-stage attacks before they escalate
- Automate response at the speed of the attacker (seconds, not tickets)
- Share threat intelligence with peers without attribution
- Measure whether your defenses are working economically
- Build institutional knowledge from failures
- Prevent defensive tooling from becoming offensive

## Do Not Use For

- Unauthorized access to other systems
- Developing exploits or attack code
- Circumventing your own authorization checkpoints
- Operating lab mutations against non-sandboxed systems
- Sharing threat intelligence without heuristic anonymization

## Key Constraints

- **Right-sized defense**: spending scales to target value, not to theoretical perfection
- **No exploitation**: every skill either detects, defends, or measures; none generate attack code
- **Governance-first**: authorization checkpoint is load-bearing, not optional
- **Feedback loop**: no skill makes sense in isolation; all feed the next
- **Sandbox-only lab**: threat lab operates in controlled environment; no production testing without explicit human authorization

---

See individual SKILL.md files for implementation details, examples, and governance rules.
