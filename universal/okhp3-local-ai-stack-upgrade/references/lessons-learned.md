# Lessons learned

Each entry is a failure that happened at least once during real upgrades, what caused it, and what the skill now does about it.

| Symptom | Cause | Rule now |
|---|---|---|
| Release check said "current" while the app showed an update banner | The rendered GitHub releases page was cached behind the API | Upstream versions come from the releases API or the Docker Hub tags API only |
| Every device logged out after an Open WebUI upgrade | The session secret was generated inside the container, not on the volume | Point `WEBUI_SECRET_KEY_FILE` at the data volume; check before the first upgrade |
| An old image stayed on disk after an upgrade | Nothing removed the retired rollback's image | `upgrade_container.sh` prunes it when unused; `prune_rollbacks.py` retires rollbacks after the soak |
| Rebind check flagged loopback hosts as exposed | macOS BSD `sed` has no `\?` | Use `sed -E` or Python for parsing; the exposure check is Python |
| Launcher would not run after an edit | `sed -i` replaced the file and dropped the executable bit | `chmod +x` after every in-place edit |
| `docker: command not found` from a Finder launch | Finder-launched shells get a minimal `PATH` | Scripts append the Homebrew and Docker Desktop paths |
| A pasted key returned 401 | The key was pasted twice into one prompt | Any hidden-prompt helper you write checks for an exact doubled value and keeps one copy |
| Agent gateway would not start after reboot | Tailscale was stopped and the gateway requires it | A one-minute LaunchAgent guard starts Tailscale first |
| A "nothing uses this" claim turned out wrong | Another machine used the service over the tailnet | Check tailnet clients before narrowing a bind |
| Git GUI refused to commit | Empty summary field, then an unverified author email | Hand over a summary line; use the account's no-reply email |
| Git GUI showed no changes | The app does not refresh while in the background | Bring it to the front before committing |
| `.git/index.lock` left behind | A git status from a sync tool or bridge raced another process | Read-only git commands use `git --no-optional-locks` |
| A long migration looked like a hang | Chat-history migration took minutes on large histories | Data-migrating releases get `--health-timeout 600` and progress logging |
| Script output folder disappeared | A personal downloads folder was cleaned up | Keep launchers in a dedicated git-ignored folder inside the repo or under `~/.config` |
| Review found the log could show part of an environment value | Values were stripped from a flattened argument string, which breaks on spaces | Environment arguments live in their own array and are never printed |
| Review found a failed recovery still reported `ROLLED_BACK` | Restore, rename and restart results were not checked | Every recovery step is checked; any failure ends in `RESULT=FAIL` |
| Review found exposure could pass with no evidence | `lsof` or `docker ps` failures were treated as "no listeners" | A discovery command that cannot run fails the exposure check |
