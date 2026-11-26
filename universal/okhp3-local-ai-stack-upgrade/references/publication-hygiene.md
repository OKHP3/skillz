# Publication hygiene

Stack docs are useful in public only if they cannot be used to find or fingerprint the host.

## Never publish

- hostnames, Bonjour names, tailnet names and full `*.ts.net` addresses
- LAN, tailnet or public IP addresses, MAC addresses, Wi-Fi network names
- home-directory paths with a username, serial numbers, hardware UUIDs
- tokens, API keys, key file contents, keychain service names tied to a real account
- private workspace links (note-taking apps, shared drives)
- raw logs and `docker inspect` output, which contain environment values

## Placeholders

| Real value | Write |
|---|---|
| `myhost.tailXXXX.ts.net` | `<host>.<tailnet>.ts.net` |
| `192.168.x.y` | `<MAC_LAN_IP>` |
| `100.x.y.z` | `<TAILNET_IP>` |
| `/Users/<you>/...` | `~/...` |
| external volume name | `/Volumes/<external-ai-volume>/...` |

## Denylist

`publish_guard.sh` reads a literal denylist, one value per line, from `<git-dir>/info/publish-denylist` (inside `.git`, so it is never committed) or from `PUBLISH_DENYLIST`. Seed it with the host name, tailnet name, LAN and tailnet IPs, username and any project codenames that must stay private. The regex layer catches common shapes the denylist misses.

## Hook

To run the guard on every commit in a docs repo:

```bash
mkdir -p .githooks
printf '#!/usr/bin/env bash\nexec "<path-to-skill>/scripts/publish_guard.sh" --staged\n' > .githooks/pre-commit
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

## Ignore the working folder

Keep launchers, logs and inspect snapshots in a folder listed in `.git/info/exclude` (local only) or `.gitignore`, so they cannot be staged by accident.
