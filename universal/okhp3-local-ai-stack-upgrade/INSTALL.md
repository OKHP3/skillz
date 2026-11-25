# Install and run the local AI stack upgrade skill

**Release decision for 0.1.0: draftable, supervised use.** The workflow comes from six Open WebUI upgrades (v0.11.4 to v0.13.5) and the related stack maintenance on one Mac. The helper scripts pass 19 standard-library tests, including a simulated Docker run of every upgrade outcome. The generalized container script has not yet run against a real Docker host, so start with `--dry-run`.

## Download

- **Bundle:** [`okhp3-local-ai-stack-upgrade.skill`](https://github.com/OKHP3/skillz/raw/main/artifacts/skill-bundles/okhp3-local-ai-stack-upgrade.skill) is a ZIP of this folder. The sibling `.receipt.json` lists the source commit and SHA-256.
- **Folder:** `universal/okhp3-local-ai-stack-upgrade/` in [OKHP3/skillz](https://github.com/OKHP3/skillz/tree/main/universal/okhp3-local-ai-stack-upgrade).
- **Catalog page:** [Skillz Forge](https://okhp3.github.io/skillz/#/skills/universal/okhp3-local-ai-stack-upgrade).

Check the download before you extract it:

```sh
shasum -a 256 okhp3-local-ai-stack-upgrade.skill   # compare with the receipt
```

## Install

Extract the bundle into the skills directory your agent host discovers, keeping the folder name and layout. Exactly one directory named `okhp3-local-ai-stack-upgrade` should contain `SKILL.md`. Reload the host's skill list in a fresh turn.

If your unzip tool drops file permissions, restore them with `chmod +x scripts/*.sh scripts/*.py` from inside the folder.

To run the scripts on the Mac itself without an agent, extract the folder anywhere convenient. Nothing is installed system-wide.

## First run

From the extracted folder on the target Mac:

```sh
python3 -m unittest discover -s tests -v                  # 19 tests, no Docker needed
cp assets/stack.example.json ~/.config/local-ai-stack/stack.json   # then edit it
python3 scripts/check_versions.py --config ~/.config/local-ai-stack/stack.json
python3 scripts/verify_stack.py  --config ~/.config/local-ai-stack/stack.json
scripts/upgrade_container.sh --container <name> --tag <tag> --health <url> --dry-run
```

Create `~/.config/local-ai-stack/` first if it does not exist. Keep the filled-in config and all logs out of any repository; they can contain host names and configuration values.

Then ask your agent something like: "Open WebUI says a new version is available. Use the local AI stack upgrade skill to check it and plan the upgrade." The skill checks before it changes anything, and it changes the host only after you say which component to upgrade.

## Requirements

macOS with Docker Desktop and Homebrew, bash 3.2 or newer, python3 3.9 or newer, curl and lsof. Tailscale, npm and gitleaks are optional.
