# Phase 3 — Synthesis

**Role:** Technical Writer + Solution Architect.
**Goal:** Turn the validated understanding into a small set of **onboarding documents** —
detail docs under `docs/`, indexed by the **project-root `README.md`** — enough to get a new
team member (human or AI) productive, and no more.

---

## The onboarding test

Before writing each document, and before keeping each paragraph, ask:

> *Does this help a new joiner (or an AI harness) become productive?*

If it doesn't, cut it. These are **onboarding docs, not a knowledge base.** Favour the
load-bearing entities, rules and workflows over exhaustive catalogues. Keep each document
lean enough to link from `CLAUDE.md` / `AGENTS.md` without wrecking the context budget. See
[`../references/output-conventions.md`](../references/output-conventions.md) for structure,
naming, length ceilings and the required header block.

---

## What to write

Create only the documents the system warrants (skip ones with nothing meaningful to say).
Use the matching file in `../templates/`.

```
docs/
├── business/
│   ├── business-requirements.md  # functional + non-functional
│   ├── user-personas.md          # users & stakeholders
│   └── workflows.md              # business/process workflows (+ Mermaid)
├── domain/
│   ├── domain-model.md           # entities, relationships, lifecycles (+ Mermaid)
│   ├── domain-glossary.md        # business language
│   └── business-rules.md         # rules, each with provenance
└── tech/
    ├── current-architecture.md   # as-is architecture (+ Mermaid)
    └── integrations.md           # external systems, dependencies, data feeds
```

The **project-root `README.md`** is the onboarding index / entry point for this set — **not** a
file under `docs/`, and **there is no `docs/README.md`**. See
[Project-root README.md](#project-root-readmemd--the-entry-point) below.

`docs/_discovery/` (assumptions register, traceability index, discovery state, recon
manifest) is maintained throughout — it is **not** an onboarding doc and must not be linked
from the agent file.

---

## Rules for every document

1. **Header block, every file.** Start with the standard block including
   `Last updated: YYYY-MM-DD` (use the real current date), the mode used, and a one-line
   scope. See output-conventions.
2. **Exception-only flags.** Accepted knowledge is written plainly and unmarked. Only
   `[unverified]`, `[assumption]`, `[outdated]`, `[contradicted]` appear inline, sparingly,
   where a reader must know something isn't settled.
3. **Provenance without clutter.** Don't inline citations into prose. Keep the
   claim→evidence mapping in `docs/_discovery/traceability-index.md`; reference it if needed.
4. **Diagrams where they earn their place.** Use Mermaid for the domain model, key workflows,
   and the architecture context — a diagram often replaces paragraphs.
5. **Progressive disclosure.** The project-root `README.md` is the essential summary and
   index; deeper detail lives in the specific `docs/` file, not the index. Don't duplicate
   content across files.
6. **No invention.** If it isn't in the code or confirmed by a stakeholder, either flag it as
   an assumption or leave it out. Never invent business rules.

---

## Project-root README.md — the entry point

The onboarding set has **one entry point: the project-root `README.md`** — the front door for
humans and agents landing on the repo, and the one file the agent onboarding file links.
**There is no `docs/README.md`;** the index that used to live there now lives in the root
README. In a page or so it must:

- Say what the system is and who it's for (2–3 sentences).
- Link out to each `docs/` doc with a one-line description of what's inside (paths relative to
  the root, e.g. `docs/tech/current-architecture.md`).
- List the top open assumptions/risks, linking `docs/_discovery/assumptions-register.md` for
  the full list.
- Where the code reveals it, a short "how to run / get started".

Produce it from the findings using
[`../templates/project-readme.md`](../templates/project-readme.md):

- **If no root `README.md` exists, create one** from that template — concise,
  onboarding-lean, with depth pushed into `docs/` rather than duplicated.
- **If a root `README.md` already exists, merge into it conservatively** — treat it as a
  human-authored artifact, not a scratch file:
  - Preserve the maintainers' existing content, structure and voice. Add the onboarding index
    (system summary, the `docs/` map, top risks) and fill gaps the discovery genuinely
    improves, rather than rewriting what's already there.
  - Where the existing README **conflicts with the code**, don't silently rewrite the front
    door. Documentation drifts over time — record the discrepancy in
    `docs/_discovery/assumptions-register.md` and raise it, rather than overwriting it with an
    unverified correction.
  - **No invention.** Anything not grounded in the code or confirmed by a stakeholder stays
    out, or is flagged for the interview — never invent capabilities or instructions.
  - **Confirm before writing.** Because it's an existing, outward-facing file the skill didn't
    author, summarise the proposed changes for the user and get sign-off before applying them.

- **Keep discovery metadata off the README.** Unlike the `docs/` set, do **not** stamp it with
  the `Last updated / Mode / Status` header block or inline `[assumption]`-style flags — it's
  the project's own README, not a `docs/` file. Provenance stays in the traceability index.

---

## Exit criteria

- Relevant detail docs written under `docs/`, each with a dated header block.
- Accepted knowledge unmarked; only genuine exceptions flagged inline.
- Project-root `README.md` is the entry point: created (if it was missing) or conservatively
  merged with sign-off, indexing the `docs/` set; **no `docs/README.md` is produced.**
  Conflicts with existing README content are logged, not overwritten.
- Traceability index maps claims to evidence; assumptions register is current.
- Ready for verification.
