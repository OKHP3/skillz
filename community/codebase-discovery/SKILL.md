---
name: "codebase-discovery"
description: "Extract domain, architecture, business rules, workflows and a business glossary from an existing (often poorly-documented) codebase, then validate the findings with a senior BA/Product Owner one question at a time. Produces onboarding-grade docs under docs/ that give a new team member — human or AI — enough context to be productive, ready for harness engineering / Spec Kit. Use when onboarding onto an unfamiliar codebase, reverse-engineering business knowledge, reconstructing lost documentation, or preparing a repo for spec-driven development."
argument-hint: "Point at the repo (or subsystem) you want to understand; optionally name the mode: full | code-only"
compatibility: "Host-agnostic. Runs as a Claude Code skill, or as plain Markdown any capable coding agent can follow. No hooks/MCP/plugin required."
metadata:
  author: "Bryan Signey"
  purpose: "Reverse-engineer business & domain knowledge from existing code for harness engineering"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). It identifies the
codebase (or subsystem) to analyse and, optionally, the mode.

---

## Purpose

Reverse-engineer enough business and domain knowledge out of an **existing codebase** to
onboard a new team member — human or AI — and to give AI harness tooling (e.g. Spec Kit)
the context it needs before any specification or change work begins.

The output is a small, lean set of **onboarding documents** under `docs/`, not a
comprehensive knowledge base. Each document is written so it can be linked from a
`CLAUDE.md` / `AGENTS.md` without consuming an unreasonable amount of context.

This skill is the orchestrator. It runs five phases, each defined in its own playbook
under `playbooks/`. Read and follow the relevant playbook at each phase.

---

## Core principle

> **The code is ground truth for _what_ the system does. Only people hold the _why_.**

So the method is: mine the code first to form **evidence-backed hypotheses**, then spend
the human's time **validating intent and explaining**, not re-deriving mechanics. Existing
docs (README, CLAUDE.md, AGENTS.md, wikis) are a valuable starting point, but because
documentation naturally drifts from code over time, the **source code is the source of
truth** — everything is verified against it before being relied on.

---

## Roles

Adopt the role that fits the phase:

- **Recon / synthesis:** act as a Senior Software Engineer + Solution Architect reading
  the system as-is. Understanding existing architecture is in scope; **designing new
  architecture or proposing changes is not**, unless explicitly asked.
- **Interview:** act as a Senior Business Analyst supported by a Product Manager.
  Understand business intent, users, rules and domain language.

---

## Modes

Determine the mode from the user input (default to **full** and confirm):

- **full** — Pre-check → Recon → Interview → Synthesis → Verify. Requires a stakeholder
  (senior BA / Product Owner / SME) to validate findings.
- **code-only** — Pre-check → Recon → Synthesis → Verify, with **no interview**.
  Everything that would need human confirmation is emitted as `[assumption]` /
  `[unverified]` for later validation. Use when no SME is available yet.

State the chosen mode before starting.

---

## Graceful degradation (optional inputs)

At the start of each phase, check what is available and adapt — never hard-fail:

- **Git history** — if a git tool is available, mine it selectively (see recon playbook)
  as a low-weight, low-confidence signal. If not, skip and note it in the recon manifest.
- **Navigation mode (user choice)** — at the start of recon, ask the user whether to
  navigate with grep + sub-agents (default, no setup) or a code-intelligence / LSP server
  (more precise on large repos, needs a configured server). If LSP is chosen but unavailable,
  fall back to grep. The two can be combined. See the recon playbook.
- **Sub-agents** — if the host can run isolated sub-agents, fan out recon reading to keep
  the main context lean. On Claude Code this skill ships two purpose-built subagents —
  **`codebase-recon-scout`** (recon) and **`codebase-doc-verifier`** (verification) — use them
  when available. On other hosts, use whatever generic sub-agent mechanism exists, or run the
  same steps sequentially with disciplined, excerpt-only reading.
- **Stakeholder (SME)** — if none is available, drop from `full` to `code-only` mode.

---

## Working state (resumable, no hooks)

This skill keeps its memory in plain files so it works on any host and resumes across
sessions:

- `docs/_discovery/discovery-state.md` — the evolving memory: facts, assumptions,
  unknowns, decisions, glossary-in-progress. **Read it at the start of every session and
  rewrite it as understanding changes.**
- `docs/_discovery/recon-manifest.md` — which source files (with hashes/timestamps) and
  which existing docs fed the recon, so later runs can detect staleness.

On invocation: if these exist, read them first and resume; do not restart from zero.

---

## Freshness check (staleness detection, no hooks)

If `docs/_discovery/recon-manifest.md` exists from a previous run, compare the recorded
file hashes/timestamps against the current tree before trusting prior findings. Report any
drift ("N source files changed since last recon") and re-recon the affected areas rather
than assuming the existing docs are still accurate.

---

## Phases

Run in order. Each has a playbook — read it when you enter the phase.

| Phase | Playbook | Outcome |
|---|---|---|
| 0. Pre-check | [`playbooks/00-pre-check.md`](./playbooks/00-pre-check.md) | Read existing README/CLAUDE.md/AGENTS.md/docs; capture what they state, to verify against the code; set up working state. |
| 1. Deep recon | [`playbooks/01-deep-recon.md`](./playbooks/01-deep-recon.md) | Tiered, evidence-cited analysis of structure, data model, contracts and business-logic hotspots; verify the Phase 0 statements against code. |
| 2. Interview | [`playbooks/02-interview.md`](./playbooks/02-interview.md) | One-question-at-a-time conversation with the BA/PO, seeded by recon hypotheses; reconcile contradictions with code-based suggestions. (Skipped in code-only mode.) |
| 3. Synthesis | [`playbooks/03-synthesis.md`](./playbooks/03-synthesis.md) | Write the lean onboarding docs under `docs/`, each dated and provenance-flagged. |
| 4. Verification | [`playbooks/04-verification.md`](./playbooks/04-verification.md) | Adversarial check that every claim traces to code or a named stakeholder; flag anything unsupported. |
| Finish | (this file) | Doc-drift summary + optionally generate/augment CLAUDE.md/AGENTS.md. |

Do not skip phases. In code-only mode, skip only Phase 2.

---

## Status / provenance model (exception-only)

Do **not** stamp settled knowledge as "confirmed" — accepted knowledge is unmarked. Only
flag exceptions inline, and track them in `docs/_discovery/assumptions-register.md`:

- `[unverified]` — derived from code but not yet validated by a person.
- `[assumption]` — inferred, not directly evidenced; record why and the impact if wrong.
- `[outdated]` — an existing doc/claim the code contradicts as no longer true.
- `[contradicted]` — two sources disagree and it is unresolved.

Every substantive claim links to its evidence in
`docs/_discovery/traceability-index.md` (code path / stakeholder). See
[`references/provenance-and-status.md`](./references/provenance-and-status.md).

---

## Finish: doc-drift + agent file

When Phases 0–4 are complete:

1. **Doc-drift summary.** In the completion report, list where existing docs
   (README/CLAUDE.md/AGENTS.md) have drifted from the current code, with the updated statement.
2. **Reconcile contradictions with the user.** For every `[contradicted]` / `[outdated]`
   item, ask the user — one at a time — to confirm the correct version, **including a
   suggested wording derived from the code**. Do not silently pick a version.
3. **Agent file (optional).** Offer to create or augment an agent onboarding file:
   - **Detect and match** whatever already exists (`CLAUDE.md` or `AGENTS.md`).
   - If **neither** exists, offer **both**.
   - Never overwrite an existing file — propose additions (links to the new `docs/`),
     and note anything that no longer matches the current code. Ask before writing.
   - Keep it lean; link the project-root `README.md` as the entry point. See
     [`templates/agent-onboarding-file.md`](./templates/agent-onboarding-file.md).
4. **Working state (`docs/_discovery/`).** Leave it in place — it's the skill's resume and
   staleness memory. **Recommend** (don't automatically apply) that the user add
   `docs/_discovery/` to the target repo's `.gitignore` so it isn't committed, and explain its
   disposition in the completion report (below).

---

## Completion report

When done, report:

- Mode used (full / code-only) and what optional inputs were available.
- The system in two or three sentences (what it does, for whom).
- Documents created or updated under `docs/`.
- Doc-drift findings (existing docs vs code).
- Open `[assumption]` / `[unverified]` / `[contradicted]` items and their impact.
- Whether a `CLAUDE.md` / `AGENTS.md` was created or proposed.
- **`docs/_discovery/` disposition.** It holds provenance + resume/staleness state (not
  onboarding material). Recommend the user git-ignore it (add `docs/_discovery/` to
  `.gitignore`) so it isn't committed. It's safe to delete — but **warn that deleting it makes
  the next run start cold**: no resume, no staleness detection, no cached traceability.
- Readiness for harness engineering / Spec Kit.

---

## Done when

- [ ] Mode and available inputs established
- [ ] Existing docs read and their statements captured for verification
- [ ] Recon complete: structure, data model, contracts, business-logic hotspots
- [ ] Existing-doc statements verified against code (any drift identified)
- [ ] (full mode) Interview complete; contradictions reconciled with the user
- [ ] Onboarding docs written under `docs/`, dated and provenance-flagged
- [ ] Verification pass complete; unsupported claims flagged
- [ ] Assumptions register and traceability index populated
- [ ] CLAUDE.md / AGENTS.md created or proposed
- [ ] docs/_discovery/ disposition explained: git-ignore recommended, and the cold-start cost of deleting it flagged
- [ ] Ready for harness engineering / Spec Kit
