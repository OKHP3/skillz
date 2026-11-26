#!/usr/bin/env bash
# publish_guard.sh: block machine and network identifiers before docs go public.
#
#   publish_guard.sh --staged              scan lines added in the git index (pre-commit use)
#   publish_guard.sh FILE [FILE ...]       scan whole files
#
# Layers, all local:
#   1. literal denylist: one fixed string per line (hostnames, tailnet name, LAN IPs,
#      usernames, serials). Keep it OUT of the repo. Default: <git-dir>/info/publish-denylist,
#      override with PUBLISH_DENYLIST=/path.
#   2. gitleaks with the repo's .gitleaks.toml when gitleaks is installed
#   3. regex fallback for common identifiers when gitleaks is absent
# Exit 0 = clean, 1 = something to fix.
set -u
MODE=files
[ "${1:-}" = "--staged" ] && { MODE=staged; shift; }
fail=0

if [ $MODE = staged ]; then
  added=$(git diff --cached -U0 --no-color -- . ':!.gitleaks.toml' ':!.githooks' | grep -E '^\+[^+]' || true)
else
  [ $# -gt 0 ] || { echo "usage: $0 --staged | FILE..."; exit 2; }
  added=$(cat "$@")
fi
[ -n "$added" ] || { echo "publish_guard: nothing to scan"; exit 0; }

gitdir=$(git rev-parse --git-dir 2>/dev/null || echo .git)
deny="${PUBLISH_DENYLIST:-$gitdir/info/publish-denylist}"
if [ -s "$deny" ]; then
  hits=$(printf '%s\n' "$added" | grep -n -F -f "$deny" || true)
  [ -n "$hits" ] && { echo "publish_guard: denylisted value found:"; printf '%s\n' "$hits" | cut -c1-160; fail=1; }
else
  echo "publish_guard: no denylist at $deny (create one; see references/publication-hygiene.md)"
fi

re='[a-z0-9-]+\.tail[0-9a-f]{4,}\.ts\.net|Serial Number[^:]*:[[:space:]]*[A-Z0-9]{10,12}|Hardware[[:space:]]UUID:|Provisioning[[:space:]]UDID:|(^|[^0-9])(10\.[0-9]{1,3}|192\.168|172\.(1[6-9]|2[0-9]|3[01]))\.[0-9]{1,3}\.[0-9]{1,3}|(^|[^0-9])100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.[0-9]{1,3}\.[0-9]{1,3}|/Users/[A-Za-z0-9._-]+/|/home/[A-Za-z0-9._-]+/'
if command -v gitleaks >/dev/null 2>&1 && [ $MODE = staged ]; then
  cfg=(); [ -f .gitleaks.toml ] && cfg=(-c .gitleaks.toml)
  gitleaks git --pre-commit --staged --redact --no-banner ${cfg[@]+"${cfg[@]}"} || fail=1
fi
hits=$(printf "%s\n" "$added" | grep -n -E "$re" | grep -v -E "100\.64\.0\.0/10" || true)
[ -n "$hits" ] && { echo "publish_guard: identifier pattern found:"; printf '%s\n' "$hits" | cut -c1-160; fail=1; }

[ $fail -eq 0 ] && echo "publish_guard: clean" || \
  echo "Fix before publishing. Placeholders: <host>.<tailnet>.ts.net, <MAC_LAN_IP>, <TAILNET_IP>, ~"
exit $fail
