# Bench gate record contract

## Status vocabulary
- Evidence: `observed` (specific inspected source); `owner-attested` (identified stakeholder statement); `hypothesis` (modeled proposition); `unknown`.
- Decision: `approve`, `approve-with-limits`, `defer-for-evidence`, `reject`.
- Task treatment: `automate`, `augment`, `cultivate`, `anchor`.

## Minimal example (fictional)

Proposal: Automate inbound product request triage in a hypothetical distributor. No staff reduction approved. Source: fictional process map F-1. Tasks: extract part numbers (automate with validation); resolve mismatched SKUs (augment); rotate trainees through exceptions (cultivate); negotiate customer commitments (anchor). Feeder route from support to account ownership is owner-attested but historical movement data is missing. P3 replacement: proposed trainee shadowing, untested.

Primary record S-1, scaling with staff reductions: `defer-for-evidence`, pending P1–P5 and staffing controls. Optional separate record P-1, task-only experiment: `approve-with-limits` as an analytical recommendation, subject to an identified owner, capacity, validation and stop conditions. Neither record grants permission to start the experiment or change staffing.

## Decision precedence

A critical legal, privacy, safety or unauthorized-action defect blocks approval. Missing material feeder evidence forces `defer-for-evidence` before scaling. `approve-with-limits` may recommend only a narrow experiment that does not cause the unverified harm; actual execution needs its own authorization. `reject` requires a supported, high-consequence defect not acceptably mitigated. Never use an arithmetic score to override a failed gate. `automate` does not mean eliminate a role freely, and `anchor` does not promise that a task can never change.

## KPI examples (not targets)

- First-pass match accuracy = validated correct automated matches / all reviewed automated matches
- Human escalation rate = cases routed to trained humans / total processed cases
- Mentor bandwidth = hours available for formative coaching / planned coaching hours
- Apprentice proficiency = apprentices independently passing scenario assessment / apprentices assessed
- Succession coverage = critical roles with qualified, available successor / critical roles examined

For each reported KPI retain calculation grain, exclusions, source, period, owner and validation evidence. Where a quantity is unavailable, retain formula with `target: unknown`.
