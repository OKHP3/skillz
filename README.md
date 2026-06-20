# OKHP3/skillz

**Agent Skills by OverKill Hill.** Gotta have the skillz to pay the bills.

A personal repository of [Agent Skills](https://agentskills.io) (SKILL.md format) for delegating recurring work to Claude, OpenClaw (Larry), and other compatible agents. Each skill is a self-contained delegation contract: what the task is, what tools are available, what good output looks like.

## Stack position

`skillz` is the executable agent-skill substrate for the OKHP³ Visual Language Stack.

The conceptual evolution that produced it:

```
mega-prompt
→ reusable prompt kit
→ repo-scoped instruction file
→ SKILL.md
→ portable agent execution contract
→ composable skill family
```

A mega-prompt is authored once, used once, and forgotten. A SKILL.md is authored once and reused indefinitely.

`skillz` sits at the execution layer. [ReFolDec](refolddec/) names the transformation theory. [Mermaid Theme Builder](https://github.com/OKHP3/mermaid-theme-builder) is the visual-governance layer. [BPMN for Mermaid](https://github.com/OKHP3/mermaid-diagram-bpmn) is the process-notation layer.

See `docs/STACK-POSITION.md` for the full stack map.

## Start here

Read `AGENTS.md` first. It's a compressed index of every skill in this repo, what triggers it, and where it lives. Point any agent working in this repo at `AGENTS.md` before it does anything else.

## Core documents

| File | Purpose |
|---|---|
| `AGENTS.md` | Always-on agent routing index. Read first. |
| `SKILLS.md` | Human-facing skill catalog and maturity tracker. |
| `docs/STACK-POSITION.md` | Stack position, conceptual evolution, and layer map. |
| `PUBLIC_SURFACES.md` | Public information architecture for OverKill Hill, Glee-fully, and AskJamie touchpoints. |
| `PUBLISHING.md` | Validation, release, registry, and promotion checklist. |
| `SECURITY.md` | Skill supply-chain and employer-data safety posture. |
| `CHANGELOG.md` | Change log until the first release tag and beyond. |
| `skillz.manifest.json` | Lightweight machine-readable manifest for the skill library. |

## Families

| Family | Status | What it covers |
|---|---|---|
| `mermaid/` | Built (skeletons) | Mermaid diagram authoring. Core + BPMN + architecture + data + publish + update + repair |
| `linkedin/` | Built (skeletons) | LinkedIn content pipeline. Voice → angle mining → drafting |
| `process-capture/` | Built (skeleton) | Meta-skill. Captures recurring tasks and turns them into new skill drafts or backlog entries |
| `notion/` | Built (draftable) | Chat-to-Notion capture router. Routes AI threads into Chat Threads plus Extracts, dedupes, and reconciles against GitHub |
| `refolddec/` | Built (skeleton) | ReFolDec transformation skills. Fold, unfold, refold across representation types |
| `glee-fully/` | Placeholder | Conversion target for the Glee-fully custom GPT catalog. Awaiting clustering pass before sub-families are scaffolded |
| `askjamie/` | Placeholder | AskJamie conversational resume / helpdesk tool. Design not yet started |

## Install

Any agent that supports the Agent Skills standard can use these. For Claude Code / OpenCode / GitHub Copilot:

```bash
git clone https://github.com/OKHP3/skillz.git
cp -r skillz/mermaid/okhp3-mermaid-core .claude/skills/
```

Or, once tagged and released:

```bash
gh skill install OKHP3/skillz okhp3-mermaid-core
```

For OpenClaw (Larry, Glee-fully), mount this repo and point the system prompt at `AGENTS.md`.

## Structure

Every skill follows the standard anatomy:

```
skill-name/
├── SKILL.md          (required: frontmatter + instructions)
└── references/       (loaded on demand, not always in context)
```

## Public surface model

The canonical public landing page should live under OverKill Hill:

```text
overkillhill.com/projects/skillz/
```

Glee-fully and AskJamie should use lightweight contextual touchpoints that route back to the OverKill Hill project page. See `PUBLIC_SURFACES.md`.

## License

MIT. See `LICENSE`. Informed by the community Agent Skills ecosystem (2025-2026); no code or text reused from any external skill.

## Status note

Skills marked "Built (skeleton)" have complete frontmatter and section structure but reference files vary: some contain full content (flagged inline), others are tables-of-contents awaiting authoring. Treat the skeleton as the delegation contract's shape, not its finished text.
