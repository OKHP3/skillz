#!/usr/bin/env bash
# Verify the renderer selects the manifest pin and only passes browser config when requested.
set -euo pipefail

PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="$(mktemp -d)"
trap 'rm -rf "$TEST_DIR"' EXIT
mkdir -p "$TEST_DIR/package/references" "$TEST_DIR/bin"
cp "$PACKAGE_DIR/package.json" "$TEST_DIR/package/package.json"
cp "$PACKAGE_DIR/references/render-pipeline.sh" "$TEST_DIR/package/references/render-pipeline.sh"
printf 'flowchart LR\n  A --> B\n' > "$TEST_DIR/input.mmd"

cat > "$TEST_DIR/bin/npx" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$RENDER_ARGS_FILE"
SH
chmod +x "$TEST_DIR/bin/npx"

export RENDER_ARGS_FILE="$TEST_DIR/args.txt"
export PATH="$TEST_DIR/bin:$PATH"
VERSION="$(node -p 'require(process.argv[1]).devDependencies["@mermaid-js/mermaid-cli"]' "$PACKAGE_DIR/package.json")"

bash "$TEST_DIR/package/references/render-pipeline.sh" "$TEST_DIR/input.mmd" "$TEST_DIR/output.svg"
grep -Fxq -- "--package=@mermaid-js/mermaid-cli@$VERSION" "$RENDER_ARGS_FILE"
if grep -Fxq -- '-p' "$RENDER_ARGS_FILE" || grep -Fq -- '--no-sandbox' "$RENDER_ARGS_FILE"; then
  echo 'Default render unexpectedly changed browser sandbox settings' >&2
  exit 1
fi

printf '%s\n' '{"args":["--no-sandbox"]}' > "$TEST_DIR/puppeteer-config.json"
bash "$TEST_DIR/package/references/render-pipeline.sh" "$TEST_DIR/input.mmd" "$TEST_DIR/output.svg" "$TEST_DIR/puppeteer-config.json"
grep -Fxq -- '-p' "$RENDER_ARGS_FILE"
grep -Fxq -- "$TEST_DIR/puppeteer-config.json" "$RENDER_ARGS_FILE"
if grep -Fq -- '--no-sandbox' "$RENDER_ARGS_FILE"; then
  echo 'Browser configuration contents leaked into renderer arguments' >&2
  exit 1
fi
