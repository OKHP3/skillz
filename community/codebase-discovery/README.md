# codebase-discovery

Extract **domain, architecture, business rules, workflows and a business glossary** out of
an existing — often poorly-documented — codebase, and turn them into lean **onboarding
documents** a new team member (human or AI) can use to get productive. Designed to give an
AI harness (e.g. Spec Kit) enough grounded context before any specification or change work.

## Why this exists

Most real codebases are under-documented, and documentation tends to drift from the code over
time. Before you can apply harness engineering or spec-driven development, the agent needs real
context: what the system does, the domain and its language, the architecture, and the business
rules that live in the code. This skill reconstructs that context and writes it down.

## The core idea

> The code is ground truth for **what** the system does. Only people hold the **why**.

So it mines the code first to form evidence-backed hypotheses, then validates intent with a
senior BA / Product Owner **one question at a time** — spending their time on explanation and
judgement, not on re-deriving mechanics the code already states. Existing docs are a useful
starting point, and everything drawn from them is **verified against the code** (the source of
truth) before it's relied on.

## How it works — five phases

0. **Pre-check** — read any existing `README` / `CLAUDE.md` / `AGENTS.md` / `docs`, and
   capture what they state, to verify against the code.
1. **Deep recon** — tiered, evidence-cited code analysis (structure → data model →
   contracts/edges → business-logic hotspots), token-efficient via sub-agents where
   available. Validates the Phase 0 claims against the code and records drift.
2. **Interview** — one-question-at-a-time conversation with the BA/PO, each question seeded
   by a recon hypothesis; contradictions raised with a code-based suggested fix. *(Skipped
   in code-only mode.)*
3. **Synthesis** — write the lean onboarding docs, each dated and provenance-flagged.
4. **Verify** — adversarial check that every claim traces to code evidence or a named
   stakeholder.

Then: a **doc-drift summary**, and an optional **CLAUDE.md / AGENTS.md** generated or
augmented (detect-and-match; offer both if neither exists).

## Modes

- **full** — with a stakeholder to validate findings.
- **code-only** — no interview; everything needing confirmation is flagged
  `[assumption]` / `[unverified]` for later. For when no SME is available yet.

## Host-agnostic by design

No hooks, MCP servers or plugin format are required. Working memory and staleness detection
use plain files (`docs/_discovery/`), so the skill resumes across sessions and runs on any
capable agent. Optional inputs (git history, code-intelligence MCP, sub-agents, a live SME)
are used when present and skipped cleanly when not.

## Output

The project-root `README.md` is the onboarding entry point (created if missing, or merged into
conservatively); the detail docs are written under `docs/`, grouped and kept onboarding-lean.
There is no `docs/README.md`.

```
README.md                         # project-root: onboarding index / entry point — the file CLAUDE.md/AGENTS.md links
docs/
├── business/
│   ├── business-requirements.md  # functional + non-functional
│   ├── user-personas.md          # users & stakeholders
│   └── workflows.md              # business/process workflows (+ Mermaid)
├── domain/
│   ├── domain-model.md           # entities, relationships, lifecycles (+ Mermaid)
│   ├── domain-glossary.md        # business language
│   └── business-rules.md         # rules, each with provenance
├── tech/
│   ├── current-architecture.md   # as-is architecture (+ Mermaid), dated
│   └── integrations.md           # external systems, dependencies, data feeds
└── _discovery/                   # provenance & working state — NOT onboarding docs, not linked
    ├── assumptions-register.md
    ├── traceability-index.md
    ├── discovery-state.md
    └── recon-manifest.md
```

`_discovery/` is deliberately kept out of the onboarding set and should not be linked from
`CLAUDE.md` / `AGENTS.md` — it holds provenance and process state, not onboarding material.
Git-ignoring it is recommended at finish (so it isn't committed); it's the skill's
resume/staleness memory, safe to delete, but deleting it makes the next run start cold.

## Status model (exception-only)

Accepted knowledge is unmarked. Only exceptions are flagged: `[unverified]`,
`[assumption]`, `[outdated]`, `[contradicted]` — so the reader's attention goes straight to
what still needs resolving.

## Layout of this skill

```
codebase-discovery/               # (this skill, under skills/ in the repo)
├── SKILL.md                      # orchestrator — start here
├── playbooks/
│   ├── 00-pre-check.md
│   ├── 01-deep-recon.md
│   ├── 02-interview.md
│   ├── 03-synthesis.md
│   └── 04-verification.md
├── references/
│   ├── question-bank.md
│   ├── recon-heuristics.md
│   ├── provenance-and-status.md
│   └── output-conventions.md
└── templates/
    ├── project-readme.md
    ├── business-requirements.md
    ├── user-personas.md
    ├── workflows.md
    ├── domain-model.md
    ├── domain-glossary.md
    ├── business-rules.md
    ├── current-architecture.md
    ├── integrations.md
    ├── assumptions-register.md
    ├── traceability-index.md
    ├── discovery-state.md
    ├── recon-manifest.md
    └── agent-onboarding-file.md
```

## Using it

Point your agent at this folder and follow `SKILL.md`. In Claude Code, drop the folder in
`.claude/skills/`. In any other tool, `SKILL.md` and the playbooks read as plain instructions.
