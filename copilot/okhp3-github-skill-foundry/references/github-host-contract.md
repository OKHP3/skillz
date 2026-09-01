# GitHub Copilot Agent Skills host contract

Retrieved 2026-09-01. This reference describes documented locations and
surfaces, not a guarantee that a particular repository, policy, plan, or IDE
will load a skill.

GitHub defines Agent Skills as folders of instructions, scripts, and resources
that Copilot can load for relevant specialized tasks. The documented project
locations are `.github/skills`, `.claude/skills`, and `.agents/skills`. The
documented personal locations are `~/.copilot/skills` and `~/.agents/skills`.
GitHub lists cloud agent, code review, Copilot CLI, the Copilot app, and agent
mode in VS Code and JetBrains as supported Agent Skills surfaces.

This Foundry keeps skill artifacts separate from custom agents and general
instruction files. Repository permissions and organization policy still govern
the runtime. Local editing, tests, commits, pushes, PRs, releases, and
credentialed operations are separate authority boundaries.

Primary source: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).
