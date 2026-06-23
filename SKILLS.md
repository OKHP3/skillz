# OKHP3 Skill Catalog

This is the human-facing catalog for `OKHP3/skillz`.

For agent routing, read `AGENTS.md` first. `AGENTS.md` is the always-on pointer map. This file is the browsable catalog for people evaluating what exists, what is usable, and what should mature next.

## Maturity model

| Level | Label | Meaning |
|---:|---|---|
| 0 | Placeholder | Family or concept exists only |
| 1 | Skeleton | `SKILL.md` shell and section structure exist |
| 2 | Draftable | Instructions are coherent but not fully tested |
| 3 | Usable | Can be used manually with acceptable output |
| 4 | Validated | Has examples, validation gates, and review checklist |
| 5 | Published | Release-tagged, registry-ready, and public-facing |

## Active skills

| Skill | Family | Maturity | Trigger | Path |
|---|---|---:|---|---|
| `okhp3-mermaid-core` | Mermaid | 1 | Any Mermaid diagram task. Always load first. | `mermaid/okhp3-mermaid-core/SKILL.md` |
| `okhp3-mermaid-bpmn` | Mermaid | 1 | Business process, workflow, swim lane, approval chain, gateway, or BPMN-flavored diagram. | `mermaid/okhp3-mermaid-bpmn/SKILL.md` |
| `okhp3-mermaid-architecture` | Mermaid | 1 | System architecture, solution architecture, C4, infrastructure, or service topology diagrams. | `mermaid/okhp3-mermaid-architecture/SKILL.md` |
| `okhp3-mermaid-data` | Mermaid | 1 | ERD, class diagrams, schema documentation, data model explanation. | `mermaid/okhp3-mermaid-data/SKILL.md` |
| `okhp3-mermaid-publish` | Mermaid | 1 | Rendering, exporting, or publishing a finished diagram. | `mermaid/okhp3-mermaid-publish/SKILL.md` |
| `okhp3-mermaid-update` | Mermaid | 1 | Apply changes to an existing .mmd file while preserving style, classDef config, and init block. | `mermaid/okhp3-mermaid-update/SKILL.md` |
| `okhp3-mermaid-repair` | Mermaid | 1 | Fix a broken Mermaid diagram using minimum intervention. Syntax only. No content changes. | `mermaid/okhp3-mermaid-repair/SKILL.md` |
| `okhp3-linkedin-voice` | LinkedIn | 1 | Drafting, editing, or auditing LinkedIn-bound text. Runs last. | `linkedin/okhp3-linkedin-voice/SKILL.md` |
| `okhp3-linkedin-angles` | LinkedIn | 1 | Mine a finished artifact, repo, PRD, thread, or writeup for postable angles. | `linkedin/okhp3-linkedin-angles/SKILL.md` |
| `okhp3-linkedin-post` | LinkedIn | 1 | Draft a LinkedIn post from a chosen angle or topic. | `linkedin/okhp3-linkedin-post/SKILL.md` |
| `okhp3-process-capture` | Process Capture | 1 | Convert recurring work into a new skill skeleton or backlog entry. | `process-capture/okhp3-process-capture/SKILL.md` |
| `okhp3-notion-capture-router` | Notion Capture | 2 | Capture AI conversations into Notion, dedupe Chat Threads and Extracts, route through Domains, and reconcile against OKHP3 GitHub. | `notion/okhp3-notion-capture-router/SKILL.md` |
| `okhp3-refolddec-core` | ReFolDec | 1 | Transform an artifact from one representation type to another: fold, unfold, refold, or track semantic loss across a transformation. | `refolddec/okhp3-refolddec-core/SKILL.md` |
| `xquik-x-data` | Community | 1 | Plan read-only public X data workflows with Xquik REST, MCP, SDKs, webhooks, monitors, and exports. | `community/xquik-x-data/SKILL.md` |

## Active families

| Family | Status | Intended scope |
|---|---|---|
| `notion/` | Built (draftable) | Chat-to-Notion capture, dedupe, extraction, routing, archive gate, and GitHub reconciliation. |
| `community/` | Built (usable) | Community-contributed public data and automation helper skills. |

## Planned families

| Family | Status | Intended scope |
|---|---|---|
| `glee-fully/` | Placeholder | Convert Glee-fully Custom GPT domains into portable Agent Skills after clustering. |
| `askjamie/` | Placeholder | Convert selected AskJamie lens behaviors into portable professional-support skills. |

## Near-term promotion path

The first family to mature should be Mermaid.

Priority order:

1. `okhp3-mermaid-core`
2. `okhp3-mermaid-bpmn`
3. `okhp3-mermaid-publish`
4. `okhp3-mermaid-update`
5. `okhp3-mermaid-repair`
6. `okhp3-mermaid-architecture`
7. `okhp3-mermaid-data`

Reason: `core + bpmn + publish` produces the strongest differentiated claim: BPMN-aware Mermaid generation with validation and publishing discipline. `update + repair` complete the lifecycle: generation is incomplete without a maintenance path.

The first LinkedIn skill to promote should be `okhp3-linkedin-angles`, because artifact-mining is more differentiated than generic voice polishing or post drafting.

`okhp3-refolddec-core` promotes when at least one full fold / publish / refold cycle has been run end-to-end and the instructions can be followed without explanation.

## Catalog maintenance rules

- Update this file whenever a skill is added, removed, renamed, or promoted to a new maturity level.
- Keep `AGENTS.md` and this catalog synchronized.
- Do not mark a skill above Level 1 until it has enough instruction content to be used without tribal knowledge.
- Do not mark a skill Level 4 until at least one worked example and validation checklist exist.
- Do not mark a skill Level 5 until the repo has a release tag and publishing checklist complete.
