# Output conventions

Rules for the `docs/` set so every run produces consistent, lean, linkable onboarding
documents.

---

## Golden rule: onboarding, not encyclopedia

Every document exists to get a new team member (human or AI) productive. If a section doesn't
serve that, cut it. These docs are linked from `CLAUDE.md` / `AGENTS.md`, so length is a cost
paid in context tokens on every session — be ruthless about signal.

---

## Folder layout

The onboarding entry point is the **project-root `README.md`** (created if missing, or merged
into conservatively — see the synthesis playbook). It's the only file the agent file links, and
there is **no `docs/README.md`**. The detail docs live under `docs/`:

```
README.md                         # project-root: onboarding index / entry point — the only file the agent file links
docs/
├── business/
│   ├── business-requirements.md
│   ├── user-personas.md
│   └── workflows.md
├── domain/
│   ├── domain-model.md
│   ├── domain-glossary.md
│   └── business-rules.md
├── tech/
│   ├── current-architecture.md
│   └── integrations.md
└── _discovery/                   # provenance & working state — NOT onboarding, never linked
    ├── assumptions-register.md
    ├── traceability-index.md
    ├── discovery-state.md
    └── recon-manifest.md
```

Only create a doc if the system gives it real content. Do not create empty placeholders.

`docs/_discovery/` is the skill's working state (provenance + resume/staleness memory), not an
onboarding deliverable. At finish, recommend the user git-ignore it (add `docs/_discovery/` to
`.gitignore`) rather than doing so automatically. It's safe to delete, but deleting it makes
the next run start cold — no resume, no staleness detection, no cached traceability.

---

## Naming

- Hyphenated, lower-case filenames: `current-architecture.md`, `business-rules.md`.
- Keep the names above; don't invent variants.

---

## Required header block (every doc)

Start every file with:

```markdown
# <Document title>

> **Last updated:** YYYY-MM-DD (use the real current date)
> **Scope:** <one line — what this covers>
> **Mode:** full | code-only
> **Status:** accepted knowledge unless flagged — see docs/_discovery/assumptions-register.md
```

The `Last updated` date is mandatory — it's how staleness is judged at a glance, alongside
the recon manifest.

The project-root `README.md` is the exception: it's the project's own front door, not a
`docs/` file, so it carries **no** discovery header block and no inline flags. Keep that
metadata out of it — provenance lives in the traceability index.

---

## Soft length ceilings (guidance, not law)

Aim for onboarding density, not completeness:

| Doc | Target |
|---|---|
| project-root README.md (onboarding index) | ~1 page |
| current-architecture.md | ~1–2 pages + 1 diagram |
| domain-model.md | ~1–2 pages + 1 diagram |
| business-rules.md | the load-bearing rules, grouped; not every conditional in the code |
| workflows.md | the key flows only, each with a diagram |
| domain-glossary.md | one line per term |
| business-requirements.md | ~1–2 pages, functional + NFR |
| integrations.md | a table of systems + purpose + direction |

If a doc wants to grow past this, push the detail into a clearly-marked appendix section that
isn't loaded by default — don't bloat the linked doc.

---

## Formatting

- Prefer prose and small tables over deep bullet nesting.
- Use Mermaid for the domain model, key workflows and the architecture context diagram.
- Keep exception flags (`[unverified]` etc.) inline and sparing; keep citations in the
  traceability index, not the prose.
- Terminology must match the glossary across every doc.

---

## Progressive disclosure

The project-root `README.md` is the summary and the map. Everything else is reached from it.
Never duplicate content between the README and a detail doc — link instead.
