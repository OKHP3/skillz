# Export: skillz Strategy Surface

> This is a public-safe, redacted Markdown export of the private Notion strategy page for `skillz: Agent Skills by OverKill Hill`.
>
> The full Notion page remains private to Genie. Private Notion URLs, workspace links, page IDs, database IDs, and relationship anchors are intentionally omitted from this repository artifact.

## Repository identity

- **Repository:** [OKHP3/skillz](https://github.com/OKHP3/skillz)
- **Visibility:** Public
- **License:** MIT
- **Purpose:** Portable Agent Skills in the `SKILL.md` format for compatible agent runtimes.
- **Public landing surface:** [OverKill Hill / projects / skillz](https://overkillhill.com/projects/skillz/)

## Why this exists

A `SKILL.md` is a delegation contract, not merely a prompt. It can be handed to a compatible agent runtime so recurring work can be carried out without repeating the same human explanation.

The repository began with three recurring-work families:

- Mermaid diagram authoring
- LinkedIn content triage and drafting
- Process capture for turning repeated work into reusable Agent Skills

## Architecture snapshot

The following is a historical strategy snapshot from June 2026. The repository's current files and generated catalog are authoritative when this snapshot differs from them.

| Family | Strategy status at capture | Purpose |
|---|---|---|
| `mermaid/` | Built as skeletons | Diagram authoring, with a core skill for audience, type, theming, and validation plus domain skills for vocabulary |
| `linkedin/` | Built as skeletons | Content pipeline for voice filtering, angle mining, and post drafting |
| `process-capture/` | Built as a skeleton | Turns repeated work into a backlog item or a new skill skeleton |
| `glee-fully/` | Placeholder | Future conversion of Glee-fully capabilities |
| `askjamie/` | Placeholder | Future conversational resume and helpdesk brand layer |

## Repository conventions

- `AGENTS.md` is the always-on routing index for the repository.
- Skill identifiers normally use `okhp3-<family>-<domain>` and match their directory names.
- Every public skill excludes employer references by default.
- `okhp3-linkedin-post` applies a final generic employer-context scrub.
- GitHub is the installable artifact source of truth.
- Notion is a private strategy and decision ledger.
- OverKill Hill is the canonical public landing surface.

## Historical status at capture

- The repository, MIT license, root governance files, and top-level family areas were established.
- Compliance review of every active `SKILL.md` frontmatter block remained open.
- GitHub topic tags and a first release tag remained follow-up work.
- Public-surface, publishing, and security documentation were identified as governance artifacts.

## ReFolDec relationship

The strategy page describes ReFolDec as the upstream framework for the `process-capture/` family:

```text
ReFolDec = codec/framework for folding and unfolding process artifacts
Process Skills = executable packaging of unfolded primitives
SKILL.md = portable delegation contract for agents
skillz = public library of executable capture contracts
```

When a mature ReFolDec artifact is unfolded, reusable primitives may become a `SKILL.md`, prompt template, runbook, SOP fragment, diagram-node catalog, or validation checklist.

## Export provenance

- **Source:** Private Notion strategy page, accessed through the connected Notion workspace.
- **Export type:** Redacted public-safe Markdown export.
- **Private-source handling:** The source locator and private related-page anchors are not reproduced here.
- **Use:** Context for the Notion capture router; do not treat this historical snapshot as a replacement for current repository files or a private anchor map.
