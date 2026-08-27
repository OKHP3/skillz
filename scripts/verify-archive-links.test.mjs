import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  ARCHIVE_README,
  MIGRATION_LEDGER,
  validateArchiveLinks,
} from "./verify-archive-links.mjs";

function fixture({
  archiveBody,
  migrationBody = "## Archived README link audit\nexcluded from active-content link failures",
}) {
  const root = mkdtempSync(join(tmpdir(), "archive-link-validation-"));
  const archivePath = join(root, ARCHIVE_README);
  mkdirSync(join(root, "docs/archive/migration-backup-20260826"), {
    recursive: true,
  });
  writeFileSync(archivePath, archiveBody);
  writeFileSync(join(root, MIGRATION_LEDGER), migrationBody);
  return root;
}

test("accepts resolving local Markdown and image destinations", () => {
  const root = fixture({
    archiveBody: [
      "> **Historical archive notice:** preserved snapshot",
      "[current document](../../../current.md)",
      "![asset](../../../assets/preview.png)",
      "```md",
      "[ignored example](missing.md)",
      "```",
    ].join("\n"),
  });
  mkdirSync(join(root, "assets"), { recursive: true });
  writeFileSync(join(root, "current.md"), "# Current");
  writeFileSync(join(root, "assets/preview.png"), "fixture");

  const result = validateArchiveLinks(root);
  assert.deepEqual(result.failures, []);
  assert.equal(result.localLinkCount, 2);
  rmSync(root, { recursive: true, force: true });
});

test("accepts an intentionally historical former-root destination", () => {
  const root = fixture({
    archiveBody:
      "> **Historical archive notice:** preserved snapshot\n[historical](legacy.md)",
  });
  writeFileSync(join(root, "legacy.md"), "# Preserved former-root target");

  const result = validateArchiveLinks(root);
  assert.deepEqual(result.failures, []);
  assert.equal(result.localLinkCount, 1);
  rmSync(root, { recursive: true, force: true });
});

test("rejects a missing local destination", () => {
  const root = fixture({
    archiveBody:
      "> **Historical archive notice:** preserved snapshot\n[missing](../../../missing.md)",
  });
  const result = validateArchiveLinks(root);
  assert.match(result.failures.join("\n"), /missing archive link target/);
  rmSync(root, { recursive: true, force: true });
});

test("rejects an archive destination that escapes the repository", () => {
  const root = fixture({
    archiveBody:
      "> **Historical archive notice:** preserved snapshot\n[outside](../../../../outside.md)",
  });
  const result = validateArchiveLinks(root);
  assert.match(result.failures.join("\n"), /escapes repository root/);
  rmSync(root, { recursive: true, force: true });
});

test("rejects malformed Markdown destinations", () => {
  const root = fixture({
    archiveBody:
      "> **Historical archive notice:** preserved snapshot\n[empty]()\n[unclosed](<missing.md)",
  });
  const result = validateArchiveLinks(root);
  assert.equal(
    result.failures.filter((failure) =>
      failure.startsWith("malformed archive link destination"),
    ).length,
    2,
  );
  rmSync(root, { recursive: true, force: true });
});

test("rejects removal of the archive notice or ledger scope", () => {
  const root = fixture({
    archiveBody: "[current document](../../../current.md)",
    migrationBody: "Migration notes without the archive audit contract",
  });
  writeFileSync(join(root, "current.md"), "# Current");
  const result = validateArchiveLinks(root);
  assert.match(result.failures.join("\n"), /Historical archive notice/);
  assert.match(result.failures.join("\n"), /Archived README link audit/);
  assert.match(result.failures.join("\n"), /active-content link failures/);
  rmSync(root, { recursive: true, force: true });
});
