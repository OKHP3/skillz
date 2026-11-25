---
name: okhp3-local-ai-stack-upgrade
description: >
  Check, upgrade, verify and document a self-hosted local AI stack on one macOS
  host: Open WebUI and other Docker containers, Ollama, LM Studio, Qdrant,
  SearXNG, an agent gateway such as OpenClaw, and Tailscale. Use when a new
  release is out, to check whether components are current, to retire old
  images or rollback containers, to confirm services are loopback or tailnet
  only, or to update the stack's docs after a change. Not for cloud,
  Kubernetes, Docker Compose stacks or first-time installs.
license: MIT
compatibility: >
  Target host: macOS with Docker Desktop, Homebrew, bash 3.2 or newer, python3
  3.9 or newer, curl and lsof. Optional: Tailscale, npm, gitleaks. The agent
  needs either a shell on the host or a way to open a launcher file there (a
  device bridge or computer use). Network access: HTTPS to api.github.com and
  hub.docker.com for release checks, the image registry for docker pull, and
  owner-configured loopback or tailnet health URLs.
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "0.1.0"
  maturity: "draftable"
  category: "infrastructure-operations"
  origin: "okhp3/mac-studio-local-ai-workbench"
  homepage: "https://overkillhill.com/projects/mac-studio-local-ai-workbench/"
  author-github: "https://github.com/OKHP3"
  in_scope: "Release checks, one-component-at-a-time upgrades with backup and automatic rollback, exposure verification, rollback retirement, and sanitized documentation updates for one owner-operated host."
  out_of_scope: "Handling credentials or tokens, changing firewall or tailnet ACLs, unattended upgrades, pushing to public repositories, multi-host orchestration, Compose or Kubernetes stacks."
---

# okhp3-local-ai-stack-upgrade

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Keep a personal local AI stack current without losing chat history, settings, or the privacy posture you built. Every change has a backup, a rollback that is one command away, a verification pass, and a dated record.

## Outcome

A finished run leaves:

1. every component either upgraded to the target version or deliberately deferred, with the reason;
2. the previous version of each upgraded container kept as a stopped `NAME-prev` rollback;
3. a verification report showing health, exposure (nothing reachable beyond loopback or the tailnet unless allowed) and remote reach;
4. updated, sanitized docs ready for the owner to commit and push.

## Scope

One owner-operated macOS host, with the owner available to approve each host change. Covers standalone Docker containers started with `docker run`, Homebrew formulas, global npm packages and desktop apps with built-in updaters. Compose stacks, Kubernetes, remote fleets, firewall or tailnet ACL changes and first-time installs are out of scope. A missing prerequisite (Docker not running, no data mount for a requested backup) is a stop, not a reason to improvise.

## Safety contract

1. **Owner present for host changes.** Check versions freely. Change the host only after the owner asks for that component, and only one component at a time.
2. **Back up before you change.** Databases are copied before a container upgrade. Vector stores get a snapshot. Model stores are left alone.
3. **Never touch credentials.** Do not read, type, print or store tokens, API keys or passwords. When a step needs one, the owner pastes it into a hidden prompt (`read -s`) or the app's own UI. Logs record environment variable names, never values.
4. **Keep the rollback until the soak ends.** Default soak is 7 days. Retire rollbacks with `scripts/prune_rollbacks.py`, dry run first.
5. **Upstream facts come from APIs.** Use the GitHub releases API or Docker Hub tags API, never a rendered release page, which can be cached hours behind.
6. **Read release notes before every upgrade.** Look for migrations, removed settings, renamed features and minimum runtime versions. A release that migrates data gets a longer health timeout and a fresh backup check.
7. **Nothing machine-specific goes public.** Hostnames, tailnet names, LAN or tailnet IPs, usernames, serials and private workspace links stay out of docs. Run `scripts/publish_guard.sh` before handing over a commit. The agent never pushes; the owner does.

## Setup (once per host)

1. Copy `assets/stack.example.json` to a private location outside any repo, for example `~/.config/local-ai-stack/stack.json`, and fill in container names, ports and tailnet probe URLs.
2. Pick a private working folder for launchers and logs, git-ignored or outside the repo. Logs and inspect snapshots can contain configuration values; keep them there.
3. Create a literal denylist for `publish_guard.sh` (one value per line: hostname, tailnet name, LAN IP, username). Keep it in `<git-dir>/info/publish-denylist` or point `PUBLISH_DENYLIST` at it. See [references/publication-hygiene.md](references/publication-hygiene.md).

## Workflow

### 1. Check

```bash
python3 scripts/check_versions.py --config ~/.config/local-ai-stack/stack.json
```

Exit 10 means updates are available. Use `--no-installed` when you are not on the host. For each `update` row, open the release notes and classify the risk: **routine** (fixes only), **migration** (schema or data format change), or **breaking** (removed or renamed settings). Report the table and the classification before changing anything.

### 2. Plan

Order the work: lowest risk first, one component per step, data-migrating releases when the owner can watch. State the rollback for each step. Component-specific procedures, health URLs and traps are in [references/component-notes.md](references/component-notes.md).

### 3. Upgrade a container

```bash
scripts/upgrade_container.sh --container open-webui --tag v0.13.5 \
  --health http://127.0.0.1:3000/health \
  --data-dir /app/backend/data --backup webui.db \
  --health-timeout 600 --log-dir <private-folder>
```

The script copies the live container's settings that differ from the image defaults (environment, port bindings including the loopback host IP, volumes and bind mounts, extra hosts, network, restart policy, user). It refuses Compose-managed, privileged, device-mapped or custom-command containers unless you pass `--force`. Then it:

1. pulls the target image before stopping anything;
2. stops the container and copies each `--backup` file next to itself as `FILE.pre-TAG-TIMESTAMP`;
3. renames the old container to `NAME-prev` with restart disabled, retiring any older `NAME-prev`;
4. starts the new container and waits for the health URL;
5. on failure, restores the backups, puts the old container back under its original name and exits `RESULT=ROLLED_BACK`. If any part of that recovery fails, it exits `RESULT=FAIL` with "Rollback incomplete", which means check the service by hand at once;
6. on success, prunes the image of the retired rollback if nothing uses it and exits `RESULT=PASS`.

Run `--dry-run` first on any container you have not upgraded with this script before.

### 4. Upgrade host packages and apps

Homebrew formulas (`brew upgrade ollama`), global npm packages, and apps with built-in updaters (LM Studio, Tailscale, Docker Desktop) each have their own path. Follow [references/component-notes.md](references/component-notes.md). After a host package upgrade, restart the service the way the host normally starts it (LaunchAgent or app), not from your shell, so it keeps its environment.

### 5. Verify

```bash
python3 scripts/verify_stack.py --config ~/.config/local-ai-stack/stack.json
```

All three sections must pass: health, exposure and remote. If `lsof` or `docker ps` cannot run, exposure fails rather than passing unverified; use `--skip-exposure` only as a deliberate choice. An exposure failure after an upgrade usually means a new default bound a port to all interfaces. Fix the binding, do not widen the allow list. Then ask the owner to open the app and confirm one real workflow, such as an older chat loading after a history migration.

### 6. Retire

```bash
python3 scripts/prune_rollbacks.py --older-than 7          # dry run
python3 scripts/prune_rollbacks.py --older-than 7 --apply  # after owner OK
```

Also offer `brew cleanup <formula>` for superseded host packages.

### 7. Document

Update the stack's dated docs: the version table, a dated history row with what changed and any migration, and the rollback state. Do not rewrite older dated records. Run:

```bash
scripts/publish_guard.sh --staged    # or: scripts/publish_guard.sh docs/*.md
```

Hand the owner a ready commit: the files changed and a one-line summary. Some Git GUIs refuse to commit with an empty summary, so give them one.

## When the agent has no shell on the host

A device bridge that runs in a VM, or a chat with only computer use, cannot run Docker on the host directly. Copy `assets/launcher.command.template` into the private working folder, fill it in, `chmod +x` it, and open it in Finder (or have computer use double-click it). Read the log back and act on its last `RESULT=` line. The token set is `PASS`, `NOOP`, `ROLLED_BACK` and `FAIL`. After any `sed -i` edit to a launcher, run `chmod +x` again.

## Network use

Every network destination is fixed or owner-configured, and nothing is sent except plain HTTP requests without credentials:

| Script | Destination | Why |
|---|---|---|
| `scripts/check_versions.py` | api.github.com and hub.docker.com (enforced in code) | read the latest release tag; no token is read or sent |
| `scripts/upgrade_container.sh` | the image registry named in `--image` (for example ghcr.io), through `docker pull` | fetch the target image |
| `scripts/upgrade_container.sh` | the `--health` and `--probe` URLs you pass, normally loopback or your own tailnet | confirm the new container is healthy |
| `scripts/verify_stack.py` | the `health` and `remote_probes` URLs in your private stack config | health and reachability checks |

`scripts/prune_rollbacks.py` and `scripts/publish_guard.sh` make no network requests. No script uploads files, logs or configuration anywhere.

## Report format

Lead with the outcome in one sentence, then:

| Component | Before | After | Result | Rollback |
|---|---|---|---|---|

Follow with what the release changed that the owner will notice, the verification summary, anything deferred and why, and the dated next action (for example, when the rollback can be retired).

## Gotchas

The short list. The full set with causes is in [references/lessons-learned.md](references/lessons-learned.md).

- A new container gets a new session secret unless the app's secret key file lives on the data volume. Users are logged out on every upgrade until that is fixed.
- macOS `sed` has no `\?`; use `sed -E`. `sed -i` on macOS can drop the executable bit.
- Finder-launched scripts get a minimal `PATH`; the scripts add the Homebrew and Docker Desktop paths.
- Tailscale Serve dependents can refuse to start when Tailscale is stopped. Keep a guard that restarts Tailscale before them after reboot.
- Docker binds a published port to all interfaces unless told otherwise. Bind published ports to loopback and publish to the tailnet with Tailscale Serve instead.

## Getting the scripts

The scripts, assets, references and tests travel with this file. Install the whole `okhp3-local-ai-stack-upgrade` folder, not `SKILL.md` alone. See [INSTALL.md](INSTALL.md) for the download bundle and install steps. Sources:

- distribution copy: `universal/okhp3-local-ai-stack-upgrade/` in `OKHP3/skillz`, listed in the Skillz Forge catalog at <https://okhp3.github.io/skillz/#/skills/universal/okhp3-local-ai-stack-upgrade>;
- canonical source: `skills/okhp3-local-ai-stack-upgrade/` in `OKHP3/mac-studio-local-ai-workbench`, the build journal it came from.

## Files

- `scripts/check_versions.py`: installed versus upstream table. Read-only.
- `scripts/upgrade_container.sh`: one-container upgrade with backup and automatic rollback.
- `scripts/verify_stack.py`: health, exposure and remote checks. Read-only.
- `scripts/prune_rollbacks.py`: retire `NAME-prev` containers and their images. Dry run by default.
- `scripts/publish_guard.sh`: denylist, gitleaks and identifier regex scan before publishing.
- `assets/stack.example.json`: config template with placeholders.
- `assets/launcher.command.template`: double-clickable macOS launcher.
- `references/component-notes.md`, `references/lessons-learned.md`, `references/publication-hygiene.md`.
- `INSTALL.md`: download, install and first-run steps.
- `tests/`: standard-library tests; `upgrade_container.sh` runs against a stateful Docker stand-in. Run `python3 -m unittest discover -s tests -v`.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
