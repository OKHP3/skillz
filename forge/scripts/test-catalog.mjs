#!/usr/bin/env node
/**
 * test-catalog.mjs
 * Deterministic, dependency-free checks against the built catalog.json and
 * skillz.manifest.json. Run after `node scripts/build-catalog.js` (via
 * `pnpm run catalog` or the `prebuild`/`predev` hooks) — this script reads
 * the already-generated output, it does not rebuild it.
 *
 * These are structural/contract tests, not a benchmark executor: they check
 * that the evidence-contract v2 fields the build script derives are
 * internally consistent, not that any individual skill's claims are true.
 * No test here promotes or fabricates evidence — see the non-goals in the
 * PRD this implements.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '..', 'public', 'data', 'catalog.json');
const MANIFEST_PATH = join(__dirname, '..', '..', 'skillz.manifest.json');

let catalog, manifest;
try {
  catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'));
} catch (err) {
  console.error(`FATAL: could not read ${CATALOG_PATH} — run \`node scripts/build-catalog.js\` first.\n${err.message}`);
  process.exit(1);
}
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
} catch (err) {
  console.error(`FATAL: could not read ${MANIFEST_PATH}.\n${err.message}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, message: err.message });
    console.log(`  ✗ ${name}\n      ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const RELEASE_READINESS = new Set([
  'needs-contract-work', 'needs-live-evidence', 'ready-for-supervised-use', 'ready-for-peer-review', 'published',
]);
const EVIDENCE_V2_STATUSES = new Set(['live', 'analytical', 'historical', 'not-run']);
const EVIDENCE_V1_STATUSES = new Set(['live', 'historical', 'analytical', 'local-checks', 'designed', 'not-run', 'none']);
const MATURITY_SOURCES = new Set(['explicit-frontmatter', 'evidence-policy', 'fallback-structure']);

console.log(`Testing catalog: ${catalog.skillCount} skills, ${catalog.families.length} families\n`);

// 1. Catalog is non-empty and internally consistent on top-level counts.
test('catalog.skillCount matches catalog.skills.length', () => {
  assert(catalog.skillCount === catalog.skills.length,
    `skillCount=${catalog.skillCount} but skills.length=${catalog.skills.length}`);
  assert(catalog.skillCount > 0, 'catalog has zero skills');
});

// 2. Every skill has a family that exists in catalog.families.
test('every skill.family resolves to a real Family entry', () => {
  const familyNames = new Set(catalog.families.map(f => f.name));
  for (const s of catalog.skills) {
    assert(familyNames.has(s.family), `skill "${s.name}" has unknown family "${s.family}"`);
  }
});

// 3. Family skillCount / skills[] agree with the actual skill list (A2-adjacent).
test('Family.skillCount and Family.skills[] match actual per-family skill counts', () => {
  for (const f of catalog.families) {
    const actual = catalog.skills.filter(s => s.family === f.name);
    assert(f.skillCount === actual.length,
      `family "${f.name}" says skillCount=${f.skillCount} but ${actual.length} skills reference it`);
    assert(f.skills.length === actual.length,
      `family "${f.name}" skills[] has ${f.skills.length} entries, expected ${actual.length}`);
  }
});

// 4. A2: skillz.manifest.json counts are in lockstep with the catalog that was
// just built, not stale numbers from a prior run.
test('manifest maturityCounts sum to distributionSkillCount, matching catalog.skillCount', () => {
  assert(manifest.distributionSkillCount === catalog.skillCount,
    `manifest.distributionSkillCount=${manifest.distributionSkillCount} !== catalog.skillCount=${catalog.skillCount}`);
  const sum = Object.values(manifest.maturityCounts || {}).reduce((a, b) => a + b, 0);
  assert(sum === manifest.distributionSkillCount,
    `maturityCounts sum to ${sum}, expected ${manifest.distributionSkillCount}`);
});

test('manifest distributionFamilyCount matches catalog family count', () => {
  assert(manifest.distributionFamilyCount === catalog.families.length,
    `manifest.distributionFamilyCount=${manifest.distributionFamilyCount} !== ${catalog.families.length}`);
});

// 5. Vocabulary reconciliation: v1 evidenceStatus and v2 evidence.status use
// their own distinct enums and are NOT silently merged into one field.
test('v1 evidenceStatus and v2 evidence.status use their own distinct (non-merged) vocabularies', () => {
  for (const s of catalog.skills) {
    assert(EVIDENCE_V1_STATUSES.has(s.evidenceStatus),
      `skill "${s.name}" has invalid v1 evidenceStatus "${s.evidenceStatus}"`);
    assert(EVIDENCE_V2_STATUSES.has(s.evidence.status),
      `skill "${s.name}" has invalid v2 evidence.status "${s.evidence.status}"`);
  }
});

// 6. Rule 7: a `live` v2 evidence record must carry evaluatedSkillVersion and
// lastEvidenceDate — the build already throws on violation, but re-assert on
// the shipped artifact in case a future change bypasses the build-time check.
test('every "live" evidence.status has evaluatedSkillVersion and lastEvidenceDate (rule 7)', () => {
  for (const s of catalog.skills) {
    if (s.evidence.status === 'live') {
      assert(!!s.evidence.evaluatedSkillVersion, `skill "${s.name}" is live but missing evaluatedSkillVersion`);
      assert(!!s.evidence.lastEvidenceDate, `skill "${s.name}" is live but missing lastEvidenceDate`);
    }
  }
});

// 7. Rule 8: non-Community packages carry the full Foundry baseline
// (version + packageMetadata fields) — the build throws if violated, this
// re-checks the shipped artifact.
test('every non-community skill has version and full packageMetadata (rule 8)', () => {
  for (const s of catalog.skills) {
    if (s.family === 'community') continue;
    assert(!!s.version, `skill "${s.name}" (family ${s.family}) is missing version`);
    for (const field of ['author', 'category', 'origin', 'homepage', 'authorGithub', 'inScope', 'outOfScope']) {
      assert(!!s.packageMetadata[field], `skill "${s.name}" is missing packageMetadata.${field}`);
    }
  }
});

// 8. releaseReadiness is always one of the 5 documented buckets — a derived
// UI field, never a raw stored maturity/evidence value.
test('releaseReadiness is always one of the 5 documented buckets', () => {
  for (const s of catalog.skills) {
    assert(RELEASE_READINESS.has(s.releaseReadiness),
      `skill "${s.name}" has invalid releaseReadiness "${s.releaseReadiness}"`);
  }
});

// 9. maturitySource is always a declared enum value (documents the known gap
// that "evidence-policy" has no derivation logic yet, rather than silently
// producing an undefined/invalid value).
test('maturitySource is always one of the declared enum values', () => {
  for (const s of catalog.skills) {
    assert(MATURITY_SOURCES.has(s.maturitySource),
      `skill "${s.name}" has invalid maturitySource "${s.maturitySource}"`);
  }
});

// 10. Sorting by version does not throw and produces a stable total order
// even with missing versions (spec 6.5 test: version sort must not crash on
// partially-versioned data, and un-versioned skills sort deterministically).
test('version-comparable sort handles missing versions without throwing', () => {
  function compareVersions(a, b) {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0);
    const pb = b.split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }
  const sorted = [...catalog.skills].sort((a, b) => {
    if (!a.version && !b.version) return a.name.localeCompare(b.name);
    if (!a.version) return 1;
    if (!b.version) return -1;
    return compareVersions(b.version, a.version);
  });
  assert(sorted.length === catalog.skills.length, 'version sort dropped or duplicated entries');
  // versioned skills must precede all unversioned skills
  const firstUnversionedIdx = sorted.findIndex(s => !s.version);
  if (firstUnversionedIdx !== -1) {
    for (let i = firstUnversionedIdx; i < sorted.length; i++) {
      assert(!sorted[i].version, `unversioned skill "${sorted[firstUnversionedIdx].name}" sorted before a versioned skill`);
    }
  }
});

// 11. A7: tags/topics are real arrays derived from source frontmatter, not a
// permanently-empty dead field.
test('tags/topics are arrays (A7: not a hardcoded dead field)', () => {
  let anyPopulated = false;
  for (const s of catalog.skills) {
    assert(Array.isArray(s.tags), `skill "${s.name}" tags is not an array`);
    assert(Array.isArray(s.topics), `skill "${s.name}" topics is not an array`);
    if (s.tags.length > 0 || s.topics.length > 0) anyPopulated = true;
  }
  assert(anyPopulated, 'no skill in the catalog has any tags or topics populated — check frontmatter parsing');
});

// 12. C1: every family with a non-null narrativeBody actually has prose
// content (not just whitespace or the generated summary marker leaking
// through), so /families/:family never renders an empty page silently.
test('families with a narrativeBody have real, non-trivial prose', () => {
  for (const f of catalog.families) {
    if (f.narrativeBody !== null) {
      assert(f.narrativeBody.trim().length > 20,
        `family "${f.name}" has a narrativeBody but it is suspiciously short: "${f.narrativeBody}"`);
      assert(!f.narrativeBody.includes('FAMILY_SUMMARY_START'),
        `family "${f.name}" narrativeBody leaked a generated marker`);
    }
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nFAILED TESTS:');
  for (const f of failures) console.error(`  - ${f.name}: ${f.message}`);
  process.exit(1);
}
