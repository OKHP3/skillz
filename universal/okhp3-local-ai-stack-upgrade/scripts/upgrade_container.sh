#!/usr/bin/env bash
# upgrade_container.sh: move one Docker container to a new image tag without losing
# its configuration or data, keep the old container as a stopped rollback, and roll
# back automatically when the new one fails its health check.
#
# Works with the bash 3.2 that ships with macOS. Run it ON the host that owns the
# container. It never reads, prints or stores credentials: environment values are
# copied container-to-container and only their NAMES are logged.
#
# Exit tokens (last line of the log): RESULT=PASS | RESULT=NOOP | RESULT=ROLLED_BACK | RESULT=FAIL
set -uo pipefail
# Append (not prepend) so Finder-launched shells find docker and tests can shadow it.
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:/Applications/Docker.app/Contents/Resources/bin"

usage() {
  cat <<'EOF'
Usage: upgrade_container.sh --container NAME --tag TAG --health URL [options]

Required
  --container NAME       Running container to upgrade (for example open-webui)
  --tag TAG              Target image tag (for example v0.13.5)
  --health URL           URL that must return HTTP 2xx when the new container is up

Options
  --image REPO           Image repository; default = repository of the current image
  --data-dir PATH        In-container path of the data mount used for backups
  --backup FILE          File under --data-dir to copy before upgrading (repeatable)
  --health-timeout SEC   Seconds to wait for health (default 600; migrations can be slow)
  --stop-timeout SEC     Graceful stop timeout (default 30)
  --rollback-name NAME   Name for the kept rollback container (default NAME-prev)
  --probe URL            Extra URL to report after success, e.g. a tailnet address (repeatable)
  --log-dir DIR          Where to write the log and inspect snapshot (default: script dir)
  --force                Proceed even when the container uses settings this script does not copy
  --dry-run              Show the plan and the copied run arguments, change nothing
  -h, --help             This help
EOF
}

C=""; TAG=""; HEALTH=""; REPO=""; DATA_DIR=""; HT=600; ST=30; PREV=""; LOG_DIR=""; FORCE=0; DRY=0
BACKUPS=(); PROBES=()
while [ $# -gt 0 ]; do
  case "$1" in
    --container) C="$2"; shift 2;;
    --tag) TAG="$2"; shift 2;;
    --health) HEALTH="$2"; shift 2;;
    --image) REPO="$2"; shift 2;;
    --data-dir) DATA_DIR="$2"; shift 2;;
    --backup) BACKUPS+=("$2"); shift 2;;
    --health-timeout) HT="$2"; shift 2;;
    --stop-timeout) ST="$2"; shift 2;;
    --rollback-name) PREV="$2"; shift 2;;
    --probe) PROBES+=("$2"); shift 2;;
    --log-dir) LOG_DIR="$2"; shift 2;;
    --force) FORCE=1; shift;;
    --dry-run) DRY=1; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown argument: $1"; usage; exit 2;;
  esac
done
[ -n "$C" ] && [ -n "$TAG" ] && [ -n "$HEALTH" ] || { usage; exit 2; }
[ -n "$PREV" ] || PREV="${C}-prev"
[ -n "$LOG_DIR" ] || LOG_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$LOG_DIR"
TS=$(date +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/upgrade-${C}-${TS}.log"
exec > >(tee -a "$LOG") 2>&1

say() { echo "[$(date +%H:%M:%S)] $*"; }
die() { say "ABORT: $*"; say "RESULT=FAIL"; exit 1; }
TMP=$(mktemp -d "${TMPDIR:-/tmp}/upgrade-${C}.XXXXXX"); trap 'rm -rf "$TMP"' EXIT

docker info >/dev/null 2>&1 || die "Docker is not running"
docker inspect "$C" >/dev/null 2>&1 || die "no container named $C"
OLD_IMG=$(docker inspect -f '{{.Config.Image}}' "$C")
OLD_IMG_ID=$(docker inspect -f '{{.Image}}' "$C")
if [ -z "$REPO" ]; then
  REPO="${OLD_IMG%@*}"
  case "${REPO##*/}" in *:*) REPO="${REPO%:*}";; esac
fi
NEW_IMG="${REPO}:${TAG}"
say "Container $C: $OLD_IMG -> $NEW_IMG"
[ "$OLD_IMG" = "$NEW_IMG" ] && { say "Already on target"; say "RESULT=NOOP"; exit 0; }

# Refuse configurations this script would silently drop.
UNSUPPORTED=""
[ -n "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$C" 2>/dev/null)" ] \
  && UNSUPPORTED="$UNSUPPORTED compose-managed(use docker compose pull && up -d)"
[ "$(docker inspect -f '{{.HostConfig.Privileged}}' "$C")" = "true" ] && UNSUPPORTED="$UNSUPPORTED privileged"
[ -n "$(docker inspect -f '{{range .HostConfig.CapAdd}}{{.}} {{end}}' "$C")" ] && UNSUPPORTED="$UNSUPPORTED cap-add"
[ -n "$(docker inspect -f '{{range .HostConfig.Devices}}{{.PathOnHost}} {{end}}' "$C")" ] && UNSUPPORTED="$UNSUPPORTED devices"
C_CMD=$(docker inspect -f '{{json .Config.Cmd}}' "$C"); I_CMD=$(docker image inspect -f '{{json .Config.Cmd}}' "$OLD_IMG_ID")
C_EP=$(docker inspect -f '{{json .Config.Entrypoint}}' "$C"); I_EP=$(docker image inspect -f '{{json .Config.Entrypoint}}' "$OLD_IMG_ID")
[ "$C_CMD" != "$I_CMD" ] && UNSUPPORTED="$UNSUPPORTED custom-cmd"
[ "$C_EP" != "$I_EP" ] && UNSUPPORTED="$UNSUPPORTED custom-entrypoint"
if [ -n "$UNSUPPORTED" ]; then
  if [ $FORCE -eq 1 ]; then say "WARNING: not copied:$UNSUPPORTED (continuing because of --force)"
  else die "container uses settings this script does not copy:$UNSUPPORTED (re-run with --force to accept)"; fi
fi

# Copy only what differs from the image defaults, so new image defaults still apply.
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$C" | sed '/^$/d' | sort > "$TMP/cenv"
docker image inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$OLD_IMG_ID" | sed '/^$/d' | sort > "$TMP/ienv"
# Environment values live only in ENVA and are never logged; ARGS holds everything that is safe to print.
ENVA=(); ARGS=(); ENV_NAMES=""
while IFS= read -r l; do [ -n "$l" ] && { ENVA+=(-e "$l"); ENV_NAMES="$ENV_NAMES ${l%%=*}"; }; done < <(comm -23 "$TMP/cenv" "$TMP/ienv")
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(-p "$l"); done < <(docker inspect -f '{{range $p,$b := .HostConfig.PortBindings}}{{range $b}}{{if .HostIp}}{{.HostIp}}:{{end}}{{.HostPort}}:{{$p}}{{"\n"}}{{end}}{{end}}' "$C")
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(-v "$l"); done < <(docker inspect -f '{{range .Mounts}}{{if eq .Type "volume"}}{{.Name}}{{else}}{{.Source}}{{end}}:{{.Destination}}{{if not .RW}}:ro{{end}}{{"\n"}}{{end}}' "$C")
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(--add-host "$l"); done < <(docker inspect -f '{{range .HostConfig.ExtraHosts}}{{println .}}{{end}}' "$C")
NET=$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$C"); case "$NET" in default|bridge|"") ;; *) ARGS+=(--network "$NET");; esac
RESTART=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$C"); case "$RESTART" in ""|no) RESTART=unless-stopped;; esac
USER_=$(docker inspect -f '{{.Config.User}}' "$C"); I_USER=$(docker image inspect -f '{{.Config.User}}' "$OLD_IMG_ID")
[ -n "$USER_" ] && [ "$USER_" != "$I_USER" ] && ARGS+=(--user "$USER_")

say "Copied env names:${ENV_NAMES:- (none)}"
say "Copied ports/mounts/hosts/network: ${ARGS[*]:-(none)}"
say "Restart policy: $RESTART"

VOL=""
if [ -n "$DATA_DIR" ]; then
  VOL=$(docker inspect -f "{{range .Mounts}}{{if eq .Destination \"$DATA_DIR\"}}{{if eq .Type \"volume\"}}{{.Name}}{{else}}{{.Source}}{{end}}{{end}}{{end}}" "$C")
  [ -n "$VOL" ] || die "no mount at $DATA_DIR"
elif [ ${#BACKUPS[@]} -gt 0 ]; then die "--backup needs --data-dir"
else say "WARNING: no --backup given; rollback relies on the old container reading data the new version may have migrated"; fi

if [ $DRY -eq 1 ]; then
  say "DRY RUN: would pull $NEW_IMG, stop $C, back up:${BACKUPS[*]:- nothing}, keep old as $PREV, run new $C"
  say "RESULT=NOOP"; exit 0
fi

docker pull "$NEW_IMG" >/dev/null || die "pull failed for $NEW_IMG"
docker inspect "$C" > "$LOG_DIR/inspect-${C}-pre-${TS}.json"
chmod 600 "$LOG_DIR/inspect-${C}-pre-${TS}.json" 2>/dev/null   # contains env values; keep it private

docker stop -t "$ST" "$C" >/dev/null || die "stop failed"
BK_NAMES=()
for f in ${BACKUPS[@]+"${BACKUPS[@]}"}; do
  bk="${f}.pre-${TAG}-${TS}"
  if docker run --rm --entrypoint cp -v "$VOL:$DATA_DIR" "$OLD_IMG_ID" "$DATA_DIR/$f" "$DATA_DIR/$bk"; then
    BK_NAMES+=("$f=$bk"); say "Backup: $DATA_DIR/$bk"
  else docker start "$C" >/dev/null; die "backup of $f failed (old container restarted)"; fi
done

DROP_IMG=""
if docker inspect "$PREV" >/dev/null 2>&1; then
  DROP_IMG=$(docker inspect -f '{{.Config.Image}}' "$PREV"); docker rm -f "$PREV" >/dev/null
  say "Retired previous rollback $PREV ($DROP_IMG)"
fi
docker rename "$C" "$PREV" || { docker start "$C" >/dev/null; die "rename failed (old container restarted)"; }
docker update --restart=no "$PREV" >/dev/null

# Returns non-zero unless every backup was restored and the old container is running again.
restore_old() {
  local ok=0 pair
  docker rm -f "$C" >/dev/null 2>&1
  for pair in ${BK_NAMES[@]+"${BK_NAMES[@]}"}; do
    if docker run --rm --entrypoint cp -v "$VOL:$DATA_DIR" "$OLD_IMG_ID" "$DATA_DIR/${pair#*=}" "$DATA_DIR/${pair%%=*}"; then
      say "Restored $DATA_DIR/${pair%%=*}"
    else say "ERROR: restore of ${pair%%=*} failed; backup is at ${pair#*=}"; ok=1; fi
  done
  docker rename "$PREV" "$C" || { say "ERROR: could not rename $PREV back to $C"; return 1; }
  docker update --restart="$RESTART" "$C" >/dev/null || { say "ERROR: could not restore restart policy on $C"; ok=1; }
  docker start "$C" >/dev/null || { say "ERROR: old container $C did not start"; return 1; }
  [ "$(docker inspect -f '{{.State.Running}}' "$C" 2>/dev/null)" = "true" ] || { say "ERROR: old container $C is not running"; return 1; }
  return $ok
}
finish_rollback() {
  if restore_old; then say "RESULT=ROLLED_BACK"
  else say "Rollback incomplete: the service may be down. Check $C and $PREV by hand."; say "RESULT=FAIL"; fi
  exit 1
}

say "Starting $C on $NEW_IMG"
if ! docker run -d --name "$C" --restart "$RESTART" ${ENVA[@]+"${ENVA[@]}"} ${ARGS[@]+"${ARGS[@]}"} "$NEW_IMG" >/dev/null; then
  say "run failed; rolling back"; finish_rollback
fi

say "Waiting up to ${HT}s for $HEALTH"
OK=0; i=0
while [ $i -lt "$HT" ]; do
  curl -fsS --max-time 5 "$HEALTH" >/dev/null 2>&1 && { OK=1; break; }
  [ "$(docker inspect -f '{{.State.Running}}' "$C" 2>/dev/null)" = "true" ] || { say "container exited"; break; }
  [ $((i % 60)) -eq 0 ] && [ $i -gt 0 ] && say "  still starting (${i}s): $(docker logs --tail 1 "$C" 2>&1 | cut -c1-140)"
  sleep 5; i=$((i + 5))
done

if [ $OK -ne 1 ]; then
  say "Health check FAILED. Last log lines:"; docker logs --tail 60 "$C" 2>&1
  say "Rolling back to $OLD_IMG"; finish_rollback
fi

say "Health OK after ~${i}s"
docker logs "$C" 2>&1 | grep -i -E 'error|traceback|migrat' | tail -8
if [ -n "$DROP_IMG" ] && [ "$DROP_IMG" != "$NEW_IMG" ] && [ "$DROP_IMG" != "$OLD_IMG" ] \
   && [ -z "$(docker ps -a -q --filter "ancestor=$DROP_IMG")" ]; then
  docker rmi "$DROP_IMG" >/dev/null 2>&1 && say "Pruned unused image $DROP_IMG"
fi
for u in ${PROBES[@]+"${PROBES[@]}"}; do
  say "probe $(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$u") $u"
done
docker ps -a --filter "name=^${C}" --format '{{.Names}}\t{{.Image}}\t{{.Status}}'
say "Rollback kept as $PREV (restart=no). Retire it after the soak period with prune_rollbacks.py."
say "RESULT=PASS"
