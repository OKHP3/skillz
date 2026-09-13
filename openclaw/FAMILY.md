---
family: openclaw
display_name: OpenClaw Agent Skills
skill_count: 6
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-13T00:03:20Z
---

# openclaw

The openclaw family is the host-oriented distribution surface for task-focused
Agent Skills targeting OpenClaw-branded agent runtimes. It provides one
catalog home for every OpenClaw deployment in the OKHP3 ecosystem: Larry (Mac
Studio M4 Max) and Glee-fully (GJS-LAPTOP), and any future OpenClaw instance
that gets stood up.

Unlike the copilot family, which spans genuinely different Copilot products,
every skill here targets one runtime (OpenClaw) across multiple named
deployments. A skill is portable across deployments unless it names a
deployment-specific dependency (a local model tag, a mounted volume path, a
paired device).

## Family boundary

In scope:

- `SKILL.md` workflows written for OpenClaw's own skill loader (frontmatter:
  `name`, `description`, optional `metadata.openclaw.requires.*` dependency
  gates), invoked via OpenClaw's `exec` tool or native tool calls.
- Local-first workflows: skills should prefer local models, local CLIs
  (`git`, `ollama`, `docker`, `gh`), and local filesystem state over any
  Frontier API call, consistent with the local-first routing goal documented
  for this lab.
- Personal productivity and infrastructure-hygiene workflows scoped to
  Jamie's own OKHP3 ecosystem: repo hygiene, local-model stack health,
  content-pipeline drafting, diagram QA, and quick capture.

Out of scope:

- Anything that requires a Frontier provider key to function (defeats the
  purpose of this family; put those in a cross-host family instead if ever
  needed).
- Destructive git operations (`push --force`, `reset --hard`, deleting
  branches) without an explicit human approval step in the skill's own
  instructions.
- Skills that assume infrastructure not yet configured on the target
  deployment (an MCP server, a paired device) without a graceful "not
  configured" fallback message.

## Deployment taxonomy

Use the deployment token in each package name only when a skill is
deployment-specific; most skills here are deployment-neutral and use no
token.

| Deployment token | Target host | Notes |
|---|---|---|
| (none) | Any OpenClaw deployment | Default. Works identically on Larry and Glee-fully. |
| `mac-studio` | Larry, on the Mac Studio M4 Max | Use when a skill depends on Mac-only tooling (LM Studio, Docker Desktop, macOS-specific paths). |
| `gjs-laptop` | Glee-fully, on the Windows ASUS Vivobook | Use when a skill depends on Windows-specific tooling or the Discord bot integration. |

## Naming convention

```text
okhp3-openclaw-[object]-[action]
```

Examples: `okhp3-openclaw-repo-pulse`, `okhp3-openclaw-stack-status`,
`okhp3-openclaw-skillz-sync`, `okhp3-openclaw-linkedin-drop`,
`okhp3-openclaw-mermaid-lint`, `okhp3-openclaw-capture-note`.

## Shared package contract

Every package's `SKILL.md` must:

- Declare `name` and `description` per OpenClaw's skill schema.
- State which local binaries or paths it depends on, and what it does when
  one is missing (never fail silently; report what's missing).
- Default to read-only / reporting behavior. Anything that writes to disk
  or git must say so plainly in its own output before or as it acts, so a
  human reading the chat transcript can see what changed.
- Avoid any network call to a Frontier provider. Local exec, local files,
  local model calls (via Ollama) only.

## Relationships

- Depends on the OKHP3 GitHub registry conventions documented in
  `okhp3-github-registry` (three-tier golden-master model) for repo-pulse.
- Depends on the LinkedIn brand-voice rules already established for the
  `askjamie`/OKHP3 LinkedIn skill family for linkedin-drop.
- Depends on the Mermaid renderer gotchas documented in the OKHP3
  mermaid-diagram-bpmn project for mermaid-lint.

## Installation

This folder is the canonical git-tracked source. It reaches a running
OpenClaw instance via a symlink from that instance's highest-precedence
skill root (`<workspace>/skills`) into this folder — see each deployment's
`openclaw.json` for the exact `skills.load.allowSymlinkTargets` entry. Do
not copy these files into `~/.openclaw`; edit them here and let the symlink
carry the change.

## Maturity and validation

These are newly authored, not yet exercised against a live OpenClaw agent
session. Before relying on one, run it once manually (`/skill <name>`) and
confirm the exec calls it issues match what's described here.

<!-- FAMILY_SUMMARY_START -->
Host-oriented Agent Skills for OpenClaw-branded runtimes (Larry on Mac Studio, Glee-fully on GJS-LAPTOP).
<!-- FAMILY_SUMMARY_END -->

## Skills (6)

<!-- FAMILY_INVENTORY_START -->
*6 skills &nbsp;·&nbsp; inventory last updated: **September 13, 2026 at 00:03 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-openclaw-capture-note](okhp3-openclaw-capture-note/SKILL.md) | Append a quick capture note to a dated local inbox file, for later triage into Notion. Use when J... | 0.1.0 |
| [okhp3-openclaw-linkedin-drop](okhp3-openclaw-linkedin-drop/SKILL.md) | Turn a rough brain-dump into a reviewable LinkedIn draft file in a drop folder, using the OKHP3 b... | 0.1.0 |
| [okhp3-openclaw-mermaid-lint](okhp3-openclaw-mermaid-lint/SKILL.md) | Check a Mermaid file against documented renderer gotchas before it goes into a repo or gets publi... | 0.1.0 |
| [okhp3-openclaw-repo-pulse](okhp3-openclaw-repo-pulse/SKILL.md) | Sweep the OKHP3 GitHub mirrors for uncommitted changes, unpushed commits, and stale .git locks; s... | 0.1.0 |
| [okhp3-openclaw-skillz-sync](okhp3-openclaw-skillz-sync/SKILL.md) | Run the skillz repo's own cataloger/integrity scripts on demand and summarize what changed. Use w... | 0.1.1 |
| [okhp3-openclaw-stack-status](okhp3-openclaw-stack-status/SKILL.md) | One-shot health report on the local AI stack -- Ollama, LM Studio, and the Docker-hosted Open Web... | 0.1.1 |
<!-- FAMILY_INVENTORY_END -->
