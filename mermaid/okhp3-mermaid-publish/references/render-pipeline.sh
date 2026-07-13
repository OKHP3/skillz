#!/usr/bin/env bash
#
# OKHP3 Mermaid render pipeline
# Usage: render-pipeline.sh <input.mmd> [output.png]
#
# Design notes:
#   - Never deletes input or output. The render is the deliverable.
#   - Fails LOUDLY and CLEARLY if Node/npx is unavailable. No silent
#     fallback, no confusing raw mmdc stack trace as the only signal.
#   - Exit codes: 0 = success, 1 = bad usage, 2 = missing dependency,
#     3 = mmdc render failure (syntax error — return to core Gate 1).

set -euo pipefail

INPUT="${1:-}"
OUTPUT="${2:-}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: render-pipeline.sh <input.mmd> [output.png]" >&2
  echo "  If output is omitted, defaults to <input-basename>.png in the same directory." >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "ERROR: input file not found: $INPUT" >&2
  exit 1
fi

if [[ -z "$OUTPUT" ]]; then
  OUTPUT="${INPUT%.mmd}.png"
fi

# Dependency check — clear, actionable error, not a silent failure.
if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: npx (Node.js) not found on this system." >&2
  echo "Local Mermaid rendering requires Node.js. Install it, or:" >&2
  echo "  - skip local render and use okhp3-mermaid-publish's MCP path instead, or" >&2
  echo "  - validate syntax manually at https://mermaid.live and note this in DIAGRAMS.md" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_FILE="$SCRIPT_DIR/../package.json"

if [[ ! -f "$PACKAGE_FILE" ]]; then
  echo "ERROR: Mermaid CLI package manifest not found at $PACKAGE_FILE" >&2
  exit 1
fi

CLI_VERSION="$(node -p 'require(process.argv[1]).devDependencies["@mermaid-js/mermaid-cli"]' "$PACKAGE_FILE")"

if [[ -z "$CLI_VERSION" || "$CLI_VERSION" == "undefined" ]]; then
  echo "ERROR: @mermaid-js/mermaid-cli version is not declared in $PACKAGE_FILE" >&2
  exit 1
fi

echo "Rendering $INPUT -> $OUTPUT with Mermaid CLI $CLI_VERSION (first run may take ~30s)..."

if npx --yes "@mermaid-js/mermaid-cli@$CLI_VERSION" -i "$INPUT" -o "$OUTPUT"; then
  echo "OK: $OUTPUT written. Input preserved at $INPUT."
  echo "Next: view $OUTPUT and check against the audience profile (Gate 3)."
  exit 0
else
  echo "FAILED: mmdc reported a syntax error." >&2
  echo "Return to okhp3-mermaid-core Gate 1. Common causes: unquoted special" >&2
  echo "characters in labels, 'graph' instead of 'flowchart', or an unquoted" >&2
  echo "node whose label is literally 'end'." >&2
  echo "Input file preserved at $INPUT for debugging." >&2
  exit 3
fi
