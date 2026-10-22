#!/usr/bin/env bash
#
# OKHP3 Mermaid render pipeline
# Usage: render-pipeline.sh <input.mmd> [output.png] [puppeteer-config.json]
#
# Design notes:
#   - Never deletes input or output. The render is the deliverable.
#   - Fails LOUDLY and CLEARLY if Node/npx is unavailable. No silent
#     fallback, no confusing raw mmdc stack trace as the only signal.
#   - Uses the exact CLI version declared in the adjacent package.json.
#   - Exit codes: 0 = success, 1 = bad usage, 2 = missing dependency,
#     3 = CLI failure (inspect diagnostics; syntax errors return to core Gate 1).

set -euo pipefail

INPUT="${1:-}"
OUTPUT="${2:-}"
PUPPETEER_CONFIG="${3:-}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: render-pipeline.sh <input.mmd> [output.png] [puppeteer-config.json]" >&2
  echo "  If output is omitted, defaults to <input-basename>.png in the same directory." >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "ERROR: input file not found: $INPUT" >&2
  exit 1
fi

if [[ -n "$PUPPETEER_CONFIG" && ! -f "$PUPPETEER_CONFIG" ]]; then
  echo "ERROR: Puppeteer config file not found: $PUPPETEER_CONFIG" >&2
  exit 1
fi

if [[ -z "$OUTPUT" ]]; then
  OUTPUT="${INPUT%.mmd}.png"
fi

# Dependency check - clear, actionable error, not a silent failure.
if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: Node.js and npx are required for local rendering." >&2
  echo "Install Node.js to render locally, or use an authorized Mermaid Chart MCP path." >&2
  exit 2
fi

PACKAGE_JSON="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/package.json"
CLI_VERSION="$(node -p 'require(process.argv[1]).devDependencies["@mermaid-js/mermaid-cli"]' "$PACKAGE_JSON")"
if [[ ! "$CLI_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "ERROR: package.json must pin @mermaid-js/mermaid-cli to an exact version." >&2
  exit 2
fi

LOCAL_CLI="$(dirname "$PACKAGE_JSON")/node_modules/.bin/mmdc"
CLI_COMMAND=(npx --yes --package="@mermaid-js/mermaid-cli@$CLI_VERSION" mmdc)
if [[ -x "$LOCAL_CLI" ]] && [[ "$("$LOCAL_CLI" --version)" == "$CLI_VERSION" ]]; then
  CLI_COMMAND=("$LOCAL_CLI")
fi

echo "Rendering $INPUT -> $OUTPUT with mermaid-cli $CLI_VERSION (first run may download it)..."

CLI_ARGS=(-i "$INPUT" -o "$OUTPUT")
if [[ -n "$PUPPETEER_CONFIG" ]]; then
  CLI_ARGS+=(-p "$PUPPETEER_CONFIG")
fi

if "${CLI_COMMAND[@]}" "${CLI_ARGS[@]}"; then
  echo "OK: $OUTPUT written. Input preserved at $INPUT."
  echo "Next: view $OUTPUT and check against the audience profile (Gate 3)."
  exit 0
else
  echo "FAILED: Mermaid CLI could not render the diagram." >&2
  echo "Inspect the error above. For a syntax error, return to" >&2
  echo "okhp3-mermaid-core Gate 1; for a browser or dependency error," >&2
  echo "repair the local renderer before changing valid diagram source." >&2
  echo "Input file preserved at $INPUT for debugging." >&2
  exit 3
fi
