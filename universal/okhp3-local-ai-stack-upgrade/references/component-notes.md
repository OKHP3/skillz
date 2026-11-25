# Component notes

Per-component upgrade paths, health checks and traps, from repeated upgrades on a single-owner macOS host (Sept to Nov 2026). Versions move; confirm commands against the release notes of the version you are installing.

## Reference topology

Every service binds to loopback. Only Tailscale Serve publishes anything, and only to the tailnet.

| Service | Runs as | Local bind | Published |
|---|---|---|---|
| Open WebUI | Docker container | `127.0.0.1:3000` | Tailscale Serve HTTPS, own port (for example `:8443`) |
| Ollama | Homebrew service, LaunchAgent sets env | `127.0.0.1:11434` | optional Tailscale Serve TCP `:11434` for tailnet clients |
| LM Studio | macOS app, local server | `127.0.0.1:1234` | none; "Serve on Local Network" off |
| Qdrant | Docker container | `127.0.0.1:6333-6334` | none |
| SearXNG | Docker container | `127.0.0.1:8888` | none |
| Agent gateway (OpenClaw) | global npm package, LaunchAgent | `127.0.0.1:18789` | Tailscale Serve HTTPS `:443` |

Containers reach host services through `host.docker.internal`.

## Open WebUI

- **Path:** `scripts/upgrade_container.sh --container open-webui --data-dir /app/backend/data --backup webui.db`.
- **Health:** `GET /health` returns 200; `GET /api/version` returns the running version.
- **Settings:** most admin settings live in the `config` table of `webui.db`, so they survive the container swap. Environment variables only seed first boot unless the app is told to prefer them. If you must edit the DB directly, stop the container first and run the edit with the same image against the volume.
- **Sessions:** set `WEBUI_SECRET_KEY_FILE` to a path on the data volume. Otherwise each new container generates a new key and every device is logged out.
- **Migrations:** releases run Alembic migrations on first start. A release that restructures chat storage can take minutes on a large history; use `--health-timeout 600` and keep the DB backup until an older chat has been opened and checked.
- **Connections to local runtimes:** API keys for LM Studio or other OpenAI-compatible backends are stored in the DB. They survive upgrades; never re-enter them from an agent.
- **Popup:** the in-app "new version available" banner is a reliable trigger, but confirm the tag through the GitHub API before acting.

## Ollama

- **Path:** `brew upgrade ollama`, then restart through the LaunchAgent or `brew services restart ollama`, so the service inherits `OLLAMA_HOST=127.0.0.1:11434` and the other `OLLAMA_*` settings.
- **Health:** `GET /api/version`.
- **Models:** `ollama list` shows installed models. `ollama pull <name>` refreshes a model when the registry copy changed. Check unified memory and disk before adding any model.
- **Remove a model:** `ollama rm <name>`, then confirm the disk was reclaimed.
- **Old kegs:** `brew cleanup ollama` after the soak period. With `HOMEBREW_NO_INSTALL_CLEANUP=1` set, old versions stay in the Cellar until you do.
- **Tailnet clients:** if other machines use this Ollama over the tailnet, they break when you narrow the bind. Ask before changing exposure; publish with `tailscale serve --bg --tcp 11434 tcp://127.0.0.1:11434` rather than binding to all interfaces.

## LM Studio

- **Path:** in-app updater. The app must be open and the owner present.
- **Health:** `GET /v1/models` returns 200, or 401 when authentication is required. 401 means the server is up.
- **Auth:** with "Require Authentication" on, give each client its own key and store it in that client (a keychain entry, an app's DB), never in a repo or a shell history. The owner creates keys in the app UI and pastes them.
- **Exposure:** keep "Serve on Local Network" off. Re-check after every app update.

## Qdrant

- **Path:** `upgrade_container.sh --container qdrant --health http://127.0.0.1:6333/healthz`.
- **Backup:** before upgrading, take a snapshot of each collection with `POST /collections/<name>/snapshots`, or copy the storage volume while the container is stopped. The DB-file `--backup` option is not the right tool for Qdrant storage.
- **Compatibility:** read the release notes for storage format changes and supported upgrade paths across minor versions.

## SearXNG

- **Path:** `upgrade_container.sh --container searxng --health http://127.0.0.1:8888/healthz`.
- **Versions:** rolling date tags on Docker Hub (`YYYY.M.D-<commit>`), no GitHub releases. `check_versions.py` uses the Docker Hub tags API with a regex.
- **Settings:** `settings.yml` is a bind mount and carries over. A new release can deprecate keys; check the container log for warnings after the upgrade.

## Agent gateway (OpenClaw)

- **Path:** global npm package (`npm install -g openclaw@<version>`), or its built-in updater when enabled. Restart through its LaunchAgent.
- **Tailscale dependency:** a gateway configured for Tailscale Serve can refuse to start while Tailscale is stopped. A small LaunchAgent that starts Tailscale when it is down, run every minute, keeps a cold boot clean.
- **Device approvals:** new clients and new roles need approval from an already-paired device. That is the owner's step.

## Tailscale

- **Path:** the macOS app updates itself. Confirm with `tailscale version` and compare to the GitHub release. On the standalone build, `tailscale update --yes` can exit cleanly without updating; use the app's Check for Updates, then relaunch Tailscale from its About window.
- **Serve config:** `tailscale serve status` should show the same mappings after an update. A mapping an app registers itself (an agent gateway on `:443`, for example) may not appear there; probe it with curl instead.
- **Remote probes:** probe the tailnet URLs from `verify_stack.py`. A 200 from the host itself proves the Serve mapping, not that another device can reach it; spot-check from a second device after big changes.

## Docker Desktop

- **Path:** in-app updater. All containers stop during the update and restart according to their restart policies. Rollback containers have `restart=no` and stay stopped, which is what you want.
- **After update:** run `verify_stack.py`; Docker Desktop updates have been known to reset resource limits.

## Node.js

- Upgrade only to a version the agent gateway and other global packages support. After a major Node upgrade, reinstall global packages that ship native modules.

## Power and reboot

- `sudo pmset -a autorestart 1` brings the host back after a power loss.
- With FileVault on and no auto-login, LaunchAgents do not run until someone logs in. Plan remote recovery around that.
- After big changes, run a cold reboot test: reboot, log in, wait two minutes, run `verify_stack.py`.
