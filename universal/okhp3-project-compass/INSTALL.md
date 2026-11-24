# Install and invoke Project Compass

The source package is `universal/okhp3-project-compass/` in OKHP3/skillz. Install the whole directory under the skills path your host discovers, keeping its name and file layout. For Codex, a user-level installation makes one copy available from multiple project roots. Reload the skills list in a fresh turn.

Open `assets/standalone-prompt.md` in a host without skill installation. Supply the target and write scope at its top. When the host has no filesystem tools, attach the relevant files and prior state.

For an initial read-only run, ask: “Use Project Compass on this project in assess-only mode. Give me the intent evidence, existing tracking, proposed changes and open questions.” For an authorized discovery run, supply the specific clone and permit local state and managed views. Use one invocation per clone. Every clone has its own state.

From the extracted package run:

```sh
python3 -B scripts/selftest.py
python3 -B -m unittest discover -s tests
```

For a scheduled job, use a host with filesystem and scheduling support. Pin the package revision, choose the target, time zone and frequency, and serialize runs per target. Capture the host result on an unwritable target. A successful setup includes a job ID, next run and a completed dry run. Read the release decision in `evals/benchmark.json` before relying on unattended judgments.

The repository also carries an installable ZIP at `artifacts/skill-bundles/okhp3-project-compass.skill`. Its sibling receipt lists the source commit and SHA-256. Extract into the host's skills directory and check that exactly one directory named `okhp3-project-compass` contains `SKILL.md`.

To reproduce that bundle, set `COMPASS_SOURCE` to the source commit in the receipt and `NEW_BUNDLE_PATH` to an unused output filename. From the repository root, use Git with archive timestamp support.

```sh
stamp=$(git log -1 --format=%ct "$COMPASS_SOURCE")
TZ=UTC git archive --format=zip -0 --mtime="@$stamp" \
  --prefix=okhp3-project-compass/ --output="$NEW_BUNDLE_PATH" \
  "$COMPASS_SOURCE:universal/okhp3-project-compass"
shasum -a 256 "$NEW_BUNDLE_PATH"
```

### Handing a chat-only record to the installed GitHub helper

The standalone prompt and installed helper use the same version 2 pointer-index format. The installed helper reads the objective IDs from the same local state and builds a version 2 index from a complete, identity-checked pull. On first handoff, review the detected origin, then run `github_sync.py pull --root <target> --repo <owner/name> --apply`. This local save records the snapshot and its digest. Run `plan` after that pull succeeds. A historical or hand-written index cannot establish a fresh remote inventory.

For independent verification in the distribution checkout, run the release utility from the repository root. It compares every archived Git blob and executable bit, verifies the installed directory, and runs the bundled tests in a temporary directory. The release utility requires Git with archive timestamp support, Python 3.9 or newer, and the macOS sandbox or Linux bubblewrap.

```sh
python3 artifacts/skill-bundles/verify-compass.py --worktree . \
  --commit "$COMPASS_SOURCE" --output artifacts/skill-bundles/okhp3-project-compass.skill \
  --verify-only --installed "$INSTALLED_COMPASS_DIR"
```
