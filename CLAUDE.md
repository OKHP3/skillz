# skillz

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

Active families: BPMN-aware Mermaid diagram authoring (7 skills), a LinkedIn voice-to-post pipeline (3 skills), a process-capture meta-skill, and a ReFolDec transformation family. `glee-fully/` and `askjamie/` are scaffolded but empty pending design work.

A SKILL.md is a delegation contract, not a prompt. Write it once; the recurring task stops needing a human in the loop.

## Stack Position
`skillz` is the execution layer of the OKHP³ Visual Language Stack:

- **ReFolDec** — transformation theory. Names the fold/unfold/refold operations. `skillz` packages them as executable contracts.
- **Mermaid Theme Builder** — visual-governance layer. Defines palette tokens, semantic class bundles, renderer profiles. `okhp3-mermaid-core` pulls its classDef recipes from here.
- **BPMN for Mermaid** — process-notation layer. Vocabulary catalog for BPMN 2.0 semantics in Mermaid syntax. `okhp3-mermaid-bpmn` draws its element patterns from here.

See `docs/STACK-POSITION.md` for the full map.

## Skill Families
| Family | Path | Skills | Status |
|---|---|---|---|
| Mermaid | `mermaid/` | 7: core, bpmn, architecture, data, publish, update, repair | Built (skeletons) |
| LinkedIn | `linkedin/` | 3: voice, angles, post | Built (skeletons) |
| Process Capture | `process-capture/` | 1: okhp3-process-capture | Built (skeleton) |
| ReFolDec | `refolddec/` | 1: okhp3-refolddec-core | Built (skeleton) |
| Glee-fully | `glee-fully/` | 0 | Placeholder — ~42 GPTs need clustering pass first |
| AskJamie | `askjamie/` | 0 | Placeholder — design not started |

## Tech Stack
- SKILL.md spec (agentskills.io compliant)
- Compatible runtimes: Claude (Cowork/Code), OpenClaw, Codex
- Mermaid.js (diagram authoring target)
- GitHub topic tags: `agent-skills`, `claude-skills`, `skill-md`, `skills-sh`, `openclaw-skills`, `mermaid`, `linkedin`

## Local Paths
- **Windows**: `C:\Users\jamie\OKH-Local\Projects\skillz`
- **Mac**: `/Volumes/OKH-Local/04_GitHub_Mirrors/skillz`

## Key Conventions
**Naming.** Skill identifiers follow `okhp3-<family>-<domain>`. Matches folder name. Required format for `gh skill install OKHP3/skillz <name>`.

**Diagram files.** `[domain]-[process]-[view]-[audience]-v[version].mmd` — registered in the consuming project's own `DIAGRAMS.md`, not here.

**AGENTS.md index.** Root-level compressed table mapping every skill to its trigger condition and path. This is load-bearing — Vercel evals found skills present-but-unused 44-56% of the time without an explicit pointer in always-on context. Do not let it drift from actual skill inventory.

**BFS exclusion.** Every skill excludes employer references by default. `okhp3-linkedin-post` runs an explicit scrub checklist as its final gate. Hard. Non-negotiable.

**Open backlog items (as of 2026-06-20):**
- Verify all active skills have spec-compliant SKILL.md frontmatter
- Add GitHub topic tags (listed above)
- Tag first release after Mermaid Core + BPMN + Publish reach usable maturity
- Promote `okhp3-refolddec-core` and mermaid update/repair skills from skeleton to draftable

## Related Repos
- [mermaid-theme-builder](https://github.com/OKHP3/mermaid-theme-builder) — visual-governance layer. `okhp3-mermaid-core` pulls its 4 palettes (Ocean Depth, Forest Sage, Slate Ember, Violet Mist) as classDef recipes
- [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) — process-notation layer. `okhp3-mermaid-bpmn`'s vocabulary catalog; candidate reference if BPMN becomes native Mermaid
- [OverKill-Hill](https://github.com/OKHP3/OverKill-Hill) — parent brand platform; canonical public landing for skillz at overkillhill.com/projects/skillz/
- [Glee-fullyTools](https://github.com/OKHP3/Glee-fullyTools) — future `glee-fully/` family source
- [AskJamie](https://github.com/OKHP3/AskJamie) — future `askjamie/` family source

## OverKill Hill P3 Brand Rules
- No em dashes in any generated content
- Preserve standalone punchy lines — do not consolidate into paragraphs
- ROY principle: understanding produced / explanation invested — verbosity must earn its space
- AutoCAD version is R10 (locked, not negotiable)
- BFS employer references excluded from all skills by design — never add them back
- Mermaid.ai links never appear in article or post body — route through overkillhill.com

---
*Updated: 2026-06-20 | Source: Notion Anchor + Repo inspection*
