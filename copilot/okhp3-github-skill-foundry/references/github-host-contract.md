# GitHub Copilot Agent Skills host contract

Checked 2026-10-21. This reference describes documented locations and
surfaces, not a guarantee that a particular repository, policy, plan, or IDE
will load a skill.

GitHub defines Agent Skills as folders of instructions, scripts, and resources
that Copilot can load for relevant specialized tasks. The documented project
locations are `.github/skills`, `.claude/skills`, and `.agents/skills`. The
documented personal locations are `~/.copilot/skills` and `~/.agents/skills`.
GitHub lists several skill-capable surfaces, including cloud agent, code review,
Copilot CLI, the app, and VS Code agent mode. Record the exact client and version;
the documented locations do not make every personal directory visible to a
remote agent or guarantee support in an unspecified IDE.

GitHub documents an optional `allowed-tools` frontmatter field. It may allow
tools to run without the usual confirmation prompt. The documented warning is
material: pre-approving shell or bash after a prompt injection or malicious
script could enable arbitrary command execution. This Foundry therefore makes
an absent `allowed-tools` declaration the default and requires a package review
and explicit justification before an exception. That default is OKHP3 house
policy. Effective approvals may also come from runtime, session, and organization
configuration outside the package.

The `gh skill` command can search, preview, install, update, and publish skills,
but GitHub documents it as public preview and warns that third-party skills may
contain malicious instructions or scripts. Treat `gh skill preview` as an
installation review aid, not an automatic trust decision.

This Foundry keeps skill artifacts separate from custom agents and general
instruction files. Repository permissions and organization policy still govern
the runtime. Local editing, tests, commits, pushes, PRs, releases, and
credentialed operations are separate authority boundaries.

Primary sources: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) and [Adding agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).
