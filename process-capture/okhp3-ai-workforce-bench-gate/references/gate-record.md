# Bench gate record contract

## Status vocabulary
- Evidence: `observed` (specific inspected source); `owner-attested` (identified stakeholder statement); `hypothesis` (modeled proposition); `unknown`.
- Decision: `approve`, `approve-with-limits`, `defer-for-evidence`, `reject`.
- Task treatment: `automate`, `augment`, `cultivate`, `anchor`.

## Minimal example (fictional)

Proposal: Automate inbound product request triage in a hypothetical distributor. No staff reduction approved. Source: fictional process map F-1. Tasks: extract part numbers (automate with validation); resolve mismatched SKUs (augment); rotate trainees through exceptions (cultivate); negotiate customer commitments (anchor). Feeder route from support to account ownership is owner-attested but historical movement data is missing. P3 replacement: proposed trainee shadowing, untested. Gate: `approve-with-limits` for a task-only trial; `defer-for-evidence` for any headcount reduction pending P1–P5 and staffing controls.

## Decision precedence

A critical legal, privacy, safety or unauthorized-action defect blocks approval. Missing material feeder evidence forces `defer-for-evidence` before scaling. `approve-with-limits` may authorize only a separately approved narrow experiment that does not cause the unverified harm. `reject` requires a supported, high-consequence defect not acceptably mitigated. Never use an arithmetic score to override a failed gate.

## KPI examples (not targets)

- First-pass match accuracy = validated correct automated matches / all reviewed automated matches
- Human escalation rate = cases routed to trained humans / total processed cases
- Mentor bandwidth = hours available for formative coaching / planned coaching hours
- Apprentice proficiency = apprentices independently passing scenario assessment / apprentices assessed
- Succession coverage = critical roles with qualified, available successor / critical roles examined

For each reported KPI retain calculation grain, exclusions, source, period, owner and validation evidence. Where a quantity is unavailable, retain formula with `target: unknown`.
