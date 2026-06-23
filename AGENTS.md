# AGENTS.md — OKHP3/skillz

This is the always-on index for the `OKHP3/skillz` repo. It serves two purposes:

1. **Agent routing index** — the skill trigger table every agent reads before deciding what to load.
2. **Project identity and conventions** — stack position, naming rules, brand rules, and related repos for any agent working in this codebase.

Read this file first. Don't summarize it, don't skip it.

---

## Project Identity

- **Suite**: OverKill Hill
- **Type**: Agent Skills Repository (SKILL.md spec)
- **GitHub**: https://github.com/OKHP3/skillz
- **Notion Anchor**: https://app.notion.com/p/37d812e0ced4812ab899dd0cfc9e99c0
- **License**: MIT — public, open
- **Status**: Active — initial families scaffolded, mermaid + linkedin approaching usable maturity

## Purpose

`skillz` is the executable agent-skill substrate for the OKHP³ Visual Language Stack. It packages reusable methods into durable, portable, agent-readable execution contracts in SKILL.md format.

The conceptual evolution: mega-prompt → reusable prompt kit → repo-scoped instruction file → SKILL.md → portable agent execution contract → composable skill family.

A SKILL.md is a delegation contract, not a prompt. Write it once; the recurring task stops needing a human in the loop.

## Stack Position

`skillz` is the execution layer of the OKHP³ Visual Language Stack:

- **ReFolDec** — transformation theory. Names the fold/unfold/refold operations. `skillz` packages them as executable contracts.
- **Mermaid Theme Builder** — visual-governance layer. Defines palette tokens, semantic class bundles, renderer profiles. `okhp3-mermaid-core` pulls its classDef recipes from here.
- **BPMN for Mermaid** — process-notation layer. Vocabulary catalog for BPMN 2.0 semantics in Mermaid syntax. `okhp3-mermaid-bpmn` draws its element patterns from here.

See `docs/STACK-POSITION.md` for the full map.

---

## Active skills

Skills loaded on demand are invoked correctly roughly half the time without a pointer like this one; a compressed index in always-on context closes most of that gap. This table is the index.

| Skill | Triggers when... | Path |
|---|---|---|
| `okhp3-mermaid-core` | Any Mermaid diagram task. Always load first — handles audience declaration, type selection, theming, naming, registry, validation gates | `mermaid/okhp3-mermaid-core/SKILL.md` |
| `okhp3-mermaid-bpmn` | Business process, workflow, swim lane, approval chain, gateway, or BPMN-flavored diagram. Load after core | `mermaid/okhp3-mermaid-bpmn/SKILL.md` |
| `okhp3-mermaid-architecture` | System/solution architecture, C4, infrastructure, service topology diagrams. Load after core | `mermaid/okhp3-mermaid-architecture/SKILL.md` |
| `okhp3-mermaid-data` | ERD, class diagrams, schema documentation. Load after core | `mermaid/okhp3-mermaid-data/SKILL.md` |
| `okhp3-mermaid-publish` | Rendering, exporting, or publishing a finished diagram (local PNG/SVG or Mermaid Chart MCP) | `mermaid/okhp3-mermaid-publish/SKILL.md` |
| `okhp3-mermaid-update` | User provides an existing .mmd file or diagram block and wants changes applied — new nodes, revised labels, restructured flow — without touching style or classDef config. Load after core | `mermaid/okhp3-mermaid-update/SKILL.md` |
| `okhp3-mermaid-repair` | A .mmd file or fenced block fails to parse — mmdc errors, Mermaid Live shows red, or rendered output is malformed. Minimum fix only | `mermaid/okhp3-mermaid-repair/SKILL.md` |
| `okhp3-mermaid-theme-builder` | User asks to apply, generate, or change a visual theme, color palette, or renderer profile on a Mermaid diagram | `mermaid/okhp3-mermaid-theme-builder/SKILL.md` |
| `okhp3-linkedin-voice` | Drafting, editing, or auditing ANY LinkedIn-bound text. Apply last, after content exists | `linkedin/okhp3-linkedin-voice/SKILL.md` |
| `okhp3-linkedin-angles` | "Mine this for a post", "what's postable here", end-of-session content triage on a finished artifact | `linkedin/okhp3-linkedin-angles/SKILL.md` |
| `okhp3-linkedin-post` | Drafting a LinkedIn post from a chosen angle (output of angles, or a topic the user already picked) | `linkedin/okhp3-linkedin-post/SKILL.md` |
| `okhp3-process-capture` | User describes doing something for the 2nd/3rd time, says "make this a skill", "I keep doing X", or asks to capture a workflow just demonstrated | `process-capture/okhp3-process-capture/SKILL.md` |
| `okhp3-notion-capture-router` | ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF exports, or pasted AI conversations need to be captured into Notion, deduped, routed through Domains, split into Chat Threads plus Extracts, or reconciled against OKHP3 GitHub | `notion/okhp3-notion-capture-router/SKILL.md` |
| `okhp3-refolddec-core` | Task is explicitly about transforming an artifact from one representation type to another — folding an idea into a diagram or SKILL.md, unfolding a skill into its steps, refolding a diagram into documentation, or tracking semantic loss across a transformation | `refolddec/okhp3-refolddec-core/SKILL.md` |
| `xquik-x-data` | Public X post, profile, follower, search, trend, monitor, webhook, export, SDK, or MCP workflows need a read-only Xquik route | `community/xquik-x-data/SKILL.md` |

## Planned (not yet built)

| Family | Intended trigger | Status |
|---|---|---|
| `glee-fully/*` | Tasks matching one of the 42 Glee-fully GPT domains (home/personal productivity, creative tools, etc.) | Awaiting clustering pass on the 42 GPTs to determine sub-family boundaries |
| `askjamie/*` | Career history, professional Q&A, resume-style requests about Jamie's background | Design not started |

## Skill families summary

| Family | Path | Skills | Status |
|---|---|---|---|
| Mermaid | `mermaid/` | 8: core, bpmn, architecture, data, publish, update, repair, theme-builder | Built (skeletons) |
| LinkedIn | `linkedin/` | 3: voice, angles, post | Built (skeletons) |
| Process Capture | `process-capture/` | 1: okhp3-process-capture | Built (skeleton) |
| Notion | `notion/` | 1: okhp3-notion-capture-router | Built (skeleton) |
| ReFolDec | `refolddec/` | 1: okhp3-refolddec-core | Built (skeleton) |
| Community | `community/` | 1: xquik-x-data | Built (usable) |
| Glee-fully | `glee-fully/` | 0 | Placeholder — ~42 GPTs need clustering pass first |
| AskJamie | `askjamie/` | 0 | Placeholder — design not started |

---

## Repository support docs

| File | When to read |
|---|---|
| `SKILLS.md` | A human-facing list of skills, maturity levels, and promotion priorities is needed. |
| `docs/STACK-POSITION.md` | The task concerns the stack architecture, ReFolDec theory, or where skillz fits in the OKHP³ Visual Language Stack. |
| `PUBLIC_SURFACES.md` | The task concerns public pages, advertising, promotion, brand routing, or where `skillz` should be explained. |
| `PUBLISHING.md` | The task concerns release readiness, registry submission, public promotion, or validation gates. |
| `SECURITY.md` | The task could expose private, employer, proprietary, or unsafe execution behavior. |
| `CHANGELOG.md` | The task changes repo structure, skill maturity, or release-relevant documentation. |
| `skillz.manifest.json` | Machine-readable repo metadata, family status, or external indexing is needed. |

---

## Cross-cutting rules

- Employer context is excluded from every skill in this repo by default. `okhp3-linkedin-post` runs an explicit scrub gate; no other skill should introduce employer references.
- Every Mermaid skill defers naming, registry, and validation gates to `okhp3-mermaid-core`. Domain skills (bpmn/architecture/data) are vocabulary and pattern libraries, not standalone entry points.
- `okhp3-mermaid-update` changes content while preserving style. `okhp3-mermaid-repair` fixes syntax while preserving everything. They do not overlap.
- `okhp3-linkedin-voice` is a filter, not a generator. It runs on existing text (from `okhp3-linkedin-post` or hand-written drafts).
- `okhp3-refolddec-core` is a transformation-aware skill. Load the appropriate domain skill alongside it when the transformation target is a diagram or SKILL.md skeleton.
- `okhp3-notion-capture-router` is the ingestion router for AI thread migration. It is not a generic Notion note-taker.
- Public-surface decisions route through `PUBLIC_SURFACES.md`: OverKill Hill is canonical; Glee-fully and AskJamie are contextual side doors.
- Publishing decisions route through `PUBLISHING.md`; do not promote a skill just because a folder exists.

---

## Key Conventions

**Naming.** Skill identifiers follow `okhp3-<family>-<domain>`. Matches folder name. Required format for `gh skill install OKHP3/skillz <name>`.

**File names.** `SKILL.md` and `README.md` are always uppercase. Lowercase variants (`skill.md`, `readme.md`) are non-compliant.

**Diagram files.** `[domain]-[process]-[view]-[audience]-v[version].mmd` — registered in the consuming project's own `DIAGRAMS.md`, not here.

**AGENTS.md index.** This file is load-bearing — Vercel evals found skills present-but-unused 44-56% of the time without an explicit pointer in always-on context. Do not let it drift from actual skill inventory.

**BFS exclusion.** Every skill excludes employer references by default. `okhp3-linkedin-post` runs an explicit scrub checklist as its final gate. Hard. Non-negotiable.

**Tech stack.** SKILL.md spec (agentskills.io compliant). Compatible runtimes: Claude (Cowork/Code), OpenClaw, Codex. Mermaid.js is the diagram authoring target.

**Open backlog items (as of 2026-06-20):**
- Verify all active skills have spec-compliant SKILL.md frontmatter
- Add GitHub topic tags: `agent-skills`, `claude-skills`, `skill-md`, `skills-sh`, `openclaw-skills`, `mermaid`, `linkedin`
- Tag first release after Mermaid Core + BPMN + Publish reach usable maturity
- Promote `okhp3-refolddec-core` and mermaid update/repair skills from skeleton to draftable

---

## Brand Rules

- No em dashes in any generated content
- Preserve standalone punchy lines — do not consolidate into paragraphs
- ROY principle: understanding produced / explanation invested — verbosity must earn its space
- AutoCAD version is R10 (locked, not negotiable)
- BFS employer references excluded from all skills by design — never add them back
- Mermaid.ai links never appear in article or post body — route through overkillhill.com

---

## Related Repos

- [mermaid-theme-builder](https://github.com/OKHP3/mermaid-theme-builder) — visual-governance layer. `okhp3-mermaid-core` pulls its 4 palettes (Ocean Depth, Forest Sage, Slate Ember, Violet Mist) as classDef recipes
- [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) — process-notation layer. `okhp3-mermaid-bpmn`'s vocabulary catalog; candidate reference if BPMN becomes native Mermaid
- [OverKill-Hill](https://github.com/OKHP3/OverKill-Hill) — parent brand platform; canonical public landing for skillz at overkillhill.com/projects/skillz/
- [Glee-fullyTools](https://github.com/OKHP3/Glee-fullyTools) — future `glee-fully/` family source
- [AskJamie](https://github.com/OKHP3/AskJamie) — future `askjamie/` family source

## Local Paths

- **Windows**: `C:\Users\jamie\OKH-Local\Projects\skillz`
- **Mac**: `/Volumes/OKH-Local/04_GitHub_Mirrors/skillz`

---

*Updated: 2026-06-20*
