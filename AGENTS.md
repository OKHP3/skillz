# AGENTS.md — OKHP3/skillz index

Check this file before deciding whether a task needs a skill. Skills loaded on demand are invoked correctly roughly half the time without a pointer like this one; a compressed index in always-on context closes most of that gap. This table is the index. Don't summarize it, don't skip it.

## Active skills

| Skill | Triggers when... | Path |
|---|---|---|
| `okhp3-mermaid-core` | Any Mermaid diagram task. Always load first — handles audience declaration, type selection, theming, naming, registry, validation gates | `mermaid/okhp3-mermaid-core/SKILL.md` |
| `okhp3-mermaid-bpmn` | Business process, workflow, swim lane, approval chain, gateway, or BPMN-flavored diagram. Load after core | `mermaid/okhp3-mermaid-bpmn/SKILL.md` |
| `okhp3-mermaid-architecture` | System/solution architecture, C4, infrastructure, service topology diagrams. Load after core | `mermaid/okhp3-mermaid-architecture/SKILL.md` |
| `okhp3-mermaid-data` | ERD, class diagrams, schema documentation. Load after core | `mermaid/okhp3-mermaid-data/SKILL.md` |
| `okhp3-mermaid-publish` | Rendering, exporting, or publishing a finished diagram (local PNG/SVG or Mermaid Chart MCP) | `mermaid/okhp3-mermaid-publish/SKILL.md` |
| `okhp3-linkedin-voice` | Drafting, editing, or auditing ANY LinkedIn-bound text. Apply last, after content exists | `linkedin/okhp3-linkedin-voice/SKILL.md` |
| `okhp3-linkedin-angles` | "Mine this for a post", "what's postable here", end-of-session content triage on a finished artifact | `linkedin/okhp3-linkedin-angles/SKILL.md` |
| `okhp3-linkedin-post` | Drafting a LinkedIn post from a chosen angle (output of angles, or a topic the user already picked) | `linkedin/okhp3-linkedin-post/SKILL.md` |
| `okhp3-process-capture` | User describes doing something for the 2nd/3rd time, says "make this a skill", "I keep doing X", or asks to capture a workflow just demonstrated | `process-capture/okhp3-process-capture/SKILL.md` |

## Planned (not yet built)

| Family | Intended trigger | Status |
|---|---|---|
| `glee-fully/*` | Tasks matching one of the 42 Glee-fully GPT domains (home/personal productivity, creative tools, etc.) | Awaiting clustering pass on the 42 GPTs to determine sub-family boundaries |
| `askjamie/*` | Career history, professional Q&A, resume-style requests about Jamie's background | Design not started |

## Cross-cutting rules

- BFS (employer) context is excluded from every skill in this repo by default. `okhp3-linkedin-post` runs an explicit scrub gate; other skills should not introduce employer references at all.
- Every Mermaid skill defers naming, registry, and validation gates to `okhp3-mermaid-core`. Domain skills (bpmn/architecture/data) are vocabulary and pattern libraries, not standalone entry points.
- `okhp3-linkedin-voice` is a filter, not a generator. It runs on existing text (from `okhp3-linkedin-post` or hand-written drafts).
