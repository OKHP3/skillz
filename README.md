# OKHP3/skillz

**Agent Skills by OverKill Hill.** Gotta have the skillz to pay the bills.

A personal repository of [Agent Skills](https://agentskills.io) (SKILL.md format) for delegating recurring work to Claude, OpenClaw (Larry), and other compatible agents. Each skill is a self-contained delegation contract: what the task is, what tools are available, what good output looks like.

## Start here

Read `AGENTS.md` first. It's a compressed index of every skill in this repo, what triggers it, and where it lives. Point any agent working in this repo at `AGENTS.md` before it does anything else.

## Families

| Family | Status | What it covers |
|---|---|---|
| `mermaid/` | Built (skeletons) | Mermaid diagram authoring. Core foundation + four domain skills (BPMN, architecture, data, publish) |
| `linkedin/` | Built (skeletons) | LinkedIn content pipeline. Voice → angle mining → drafting |
| `process-capture/` | Built (skeleton) | Meta-skill. Captures recurring tasks and turns them into new skill drafts or backlog entries |
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

## License

MIT. See `LICENSE`. Informed by the community Agent Skills ecosystem (2025-2026); no code or text reused from any external skill.

## Status note

Skills marked "Built (skeleton)" have complete frontmatter and section structure but reference files vary: some contain full content (flagged inline), others are tables-of-contents awaiting authoring. Treat the skeleton as the delegation contract's shape, not its finished text.
