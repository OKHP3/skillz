#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ARCHIVE_README =
  "docs/archive/migration-backup-20260826/legacy-distribution-README.md";
export const MIGRATION_LEDGER = "MIGRATION.md";

const ARCHIVE_NOTICE = "Historical archive notice:";
const AUDIT_HEADING = "## Archived README link audit";
const AUDIT_SCOPE = /excluded\s+from\s+active-content\s+link\s+failures/;

function stripFencedCode(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

function parseDestination(rawDestination) {
  let destination = rawDestination.trim();
  if (destination.startsWith("<")) {
    const closing = destination.indexOf(">");
    if (closing === -1) return null;
    destination = destination.slice(1, closing);
  } else {
    destination = destination.split(/\s+/)[0];
  }
  return destination.trim();
}

function extractDestinations(markdown) {
  const destinations = [];
  const failures = [];
  const body = stripFencedCode(markdown);
  for (const match of body.matchAll(/!?\[[^\]]*\]\(([^)\n]*)\)/g)) {
    const destination = parseDestination(match[1]);
    if (destination === null || !destination) {
      failures.push(`malformed archive link destination: ${match[0]}`);
      continue;
    }
    if (
      destination.startsWith("#") ||
      /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(destination)
    ) {
      continue;
    }
    destinations.push(destination);
  }
  return { destinations, failures };
}

export function extractLocalDestinations(markdown) {
  return extractDestinations(markdown).destinations;
}

export function validateArchiveLinks(root) {
  const failures = [];
  const archivePath = resolve(root, ARCHIVE_README);
  const migrationPath = resolve(root, MIGRATION_LEDGER);

  if (!existsSync(archivePath)) {
    failures.push(`missing archive README: ${ARCHIVE_README}`);
    return { failures, localLinkCount: 0, sourcePaths: [ARCHIVE_README] };
  }
  if (!existsSync(migrationPath)) {
    failures.push(`missing migration ledger: ${MIGRATION_LEDGER}`);
  }

  const archiveBody = readFileSync(archivePath, "utf8");
  if (!archiveBody.includes(ARCHIVE_NOTICE)) {
    failures.push(`archive README is missing the "${ARCHIVE_NOTICE}" notice`);
  }

  if (existsSync(migrationPath)) {
    const migrationBody = readFileSync(migrationPath, "utf8");
    if (!migrationBody.includes(AUDIT_HEADING)) {
      failures.push(`migration ledger is missing "${AUDIT_HEADING}"`);
    }
    if (!AUDIT_SCOPE.test(migrationBody)) {
      failures.push(
        'migration ledger is missing the active-content scope "excluded from active-content link failures"',
      );
    }
  }

  const extracted = extractDestinations(archiveBody);
  failures.push(...extracted.failures);
  const destinations = extracted.destinations;
  for (const destination of destinations) {
    const targetPath = destination.split(/[?#]/, 1)[0];
    if (!targetPath) continue;
    const resolvedTarget = resolve(dirname(archivePath), targetPath);
    const relativeTarget = relative(root, resolvedTarget);
    if (relativeTarget === ".." || relativeTarget.startsWith(`..${sep}`)) {
      failures.push(`archive link escapes repository root: ${destination}`);
      continue;
    }
    if (existsSync(resolvedTarget)) continue;

    // The preserved README contains some deliberately unrebased references
    // from the former repository root. They are valid historical references
    // when their former-root target still exists in the consolidated layout.
    const formerRootTarget = resolve(root, targetPath);
    const isFormerRootReference =
      !targetPath.startsWith("../") && !targetPath.startsWith("./");
    if (isFormerRootReference && existsSync(formerRootTarget)) continue;

    failures.push(`missing archive link target: ${destination}`);
  }

  return {
    failures,
    localLinkCount: destinations.length,
    sourcePaths: [ARCHIVE_README, MIGRATION_LEDGER],
  };
}

function writeReport(reportPath, result) {
  mkdirSync(dirname(resolve(reportPath)), { recursive: true });
  writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        check: "archive-link-validation",
        status: result.failures.length ? "failed" : "passed",
        severity: "release-blocking",
        sourcePaths: result.sourcePaths,
        checks: [
          {
            name: "archived README local destinations",
            status: result.failures.length ? "failed" : "passed",
            localLinkCount: result.localLinkCount,
          },
        ],
        failures: result.failures,
      },
      null,
      2,
    )}\n`,
  );
}

function main() {
  const jsonIndex = process.argv.indexOf("--json");
  const reportPath = jsonIndex === -1 ? null : process.argv[jsonIndex + 1];
  if (jsonIndex !== -1 && (!reportPath || reportPath.startsWith("--"))) {
    console.error(
      "Usage: node scripts/verify-archive-links.mjs [--json <path>]",
    );
    process.exit(2);
  }

  const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
  const result = validateArchiveLinks(root);
  if (reportPath) writeReport(reportPath, result);
  if (result.failures.length) {
    for (const failure of result.failures) console.error(`✗ ${failure}`);
    process.exit(1);
  }
  console.log(
    `✓ archived README link integrity: ${result.localLinkCount} local destinations resolve`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
