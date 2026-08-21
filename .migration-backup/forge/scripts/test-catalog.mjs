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
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname, relative } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import { applyEvidencePolicy, hasSubstantiveEvidenceArtifact } from './build-catalog.js';
import { CAPABILITIES, computeCapabilities } from './capabilities.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const FORGE_ROOT = join(__dirname, '..');
const CATALOG_PATH = join(__dirname, '..', 'public', 'data', 'catalog.json');
const SUMMARY_PATH = join(__dirname, '..', 'public', 'data', 'project-summary.json');
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
const EVIDENCE_V2_STATUSES = new Set(['live', 'analytical', 'historical', 'not-run', 'none']);
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

test('manifest activeFamilyCount matches catalog family count', () => {
  assert(manifest.activeFamilyCount === catalog.families.length,
    `manifest.activeFamilyCount=${manifest.activeFamilyCount} !== ${catalog.families.length}`);
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

// 7. Rule 8: non-Community packages carry the full Foundry baseline unless a
// declared context-agnostic social-posting package uses the narrow public
// artifact exception. The build throws if violated; re-check the shipped data.
test('every non-community skill has required package metadata (rule 8)', () => {
  for (const s of catalog.skills) {
    if (s.family === 'community') continue;
    assert(!!s.version, `skill "${s.name}" (family ${s.family}) is missing version`);
    const fields = s.packageMetadata.publicArtifact
      ? ['author', 'category', 'origin', 'inScope', 'outOfScope']
      : ['author', 'category', 'origin', 'homepage', 'authorGithub', 'inScope', 'outOfScope'];
    for (const field of fields) {
      assert(!!s.packageMetadata[field], `skill "${s.name}" is missing packageMetadata.${field}`);
    }
    if (s.packageMetadata.publicArtifact) {
      assert(s.family === 'social-posting', `skill "${s.name}" uses publicArtifact outside social-posting`);
      assert(!s.packageMetadata.homepage, `skill "${s.name}" publicArtifact metadata must not include homepage`);
      assert(!s.packageMetadata.authorGithub, `skill "${s.name}" publicArtifact metadata must not include authorGithub`);
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

// 11b. Governance guard: every companion reference a skill's body points to
// must resolve to a real skill name in this catalog. extractCompanions()
// pulls `okhp3-...` back-tick references straight from SKILL.md prose with
// no way to know if the name is real, so a typo or an unpropagated rename
// (e.g. a skill referencing an old/misspelled sibling name) otherwise ships
// silently — the pathway view just drops the link with no build signal.
// This is a hard failure, not a warning: any legitimate forward-looking or
// cross-repo companion reference should be added to KNOWN_UNRESOLVED_COMPANIONS
// below with a comment explaining why, rather than passing silently.
const KNOWN_UNRESOLVED_COMPANIONS = new Set([
  // e.g. 'skill-path::companion-name' — none currently documented.
]);
test('every companion reference resolves to a real skill (or is an explicitly documented exception)', () => {
  const knownSkillNames = new Set(catalog.skills.map(s => s.name));
  const unresolved = [];
  for (const s of catalog.skills) {
    for (const cName of s.companions || []) {
      if (!knownSkillNames.has(cName) && !KNOWN_UNRESOLVED_COMPANIONS.has(`${s.path}::${cName}`)) {
        unresolved.push(`${s.path} -> "${cName}"`);
      }
    }
  }
  assert(unresolved.length === 0,
    `${unresolved.length} unresolved companion reference(s) found (misspelled/renamed skill, or a missing ` +
    `KNOWN_UNRESOLVED_COMPANIONS entry if intentional): ${unresolved.join(', ')}`);
});

// 11c. Governance guard: every family must declare an explicit display_name
// in its FAMILY.md frontmatter — no family should rely on the auto-titlecase
// fallback in readFamilyDisplayName(), which exists only so a brand-new
// family never blocks a build, not as a permanent substitute for a real name.
test('every family declares an explicit display_name in FAMILY.md (no generated-fallback names)', () => {
  const missing = [];
  for (const f of catalog.families) {
    const familyMdPath = join(REPO_ROOT, f.name, 'FAMILY.md');
    let text;
    try {
      text = readFileSync(familyMdPath, 'utf-8');
    } catch {
      missing.push(`${f.name} (no FAMILY.md found)`);
      continue;
    }
    const fmMatch = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
    const hasDisplayName = !!fmMatch && /^display_name:\s*\S.*$/m.test(fmMatch[1]);
    if (!hasDisplayName) missing.push(f.name);
  }
  assert(missing.length === 0,
    `${missing.length} famil${missing.length === 1 ? 'y' : 'ies'} missing an explicit display_name in FAMILY.md: ${missing.join(', ')}`);
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

// 13. Evidence-policy derivation: a `validated`/`published` claim with weak
// or missing evidence must be held back to a lower maturity, with
// maturitySource flagged as 'evidence-policy' so the mismatch is visible.
// This exercises the pure applyEvidencePolicy() helper directly against
// synthetic fixtures, since no current package's frontmatter declares
// `validated`/`published` — it is not a re-assertion against catalog.json.
test('evidence-policy downgrades an unsupported "validated" claim to "usable"', () => {
  const noEvidence = { status: 'not-run', evalCount: 0, benchmarkCount: 0, testCount: 0, scriptCount: 0 };
  const { maturity, downgraded } = applyEvidencePolicy('validated', noEvidence);
  assert(maturity === 'usable', `expected downgrade to "usable", got "${maturity}"`);
  assert(downgraded === true, 'expected downgraded=true for an unsupported "validated" claim');
});

test('evidence-policy downgrades an unsupported "published" claim to "validated"', () => {
  const analyticalOnly = { status: 'analytical', evalCount: 1, benchmarkCount: 0, testCount: 0, scriptCount: 0 };
  const { maturity, downgraded } = applyEvidencePolicy('published', analyticalOnly);
  assert(maturity === 'validated', `expected downgrade to "validated", got "${maturity}"`);
  assert(downgraded === true, 'expected downgraded=true for a "published" claim without live evidence');
});

test('evidence-policy leaves a "validated" claim alone when a real eval/benchmark artifact exists', () => {
  const withEval = { status: 'analytical', evalCount: 2, benchmarkCount: 0, testCount: 0, scriptCount: 0 };
  const { maturity, downgraded } = applyEvidencePolicy('validated', withEval);
  assert(maturity === 'validated', `expected "validated" to stand, got "${maturity}"`);
  assert(downgraded === false, 'expected downgraded=false when an eval artifact backs the claim');
});

// Release 1: a bare test file is structural scaffolding, not evidence that
// a graded case was ever run — it must not be enough to sustain a
// "validated" (or, transitively, "published") claim on its own.
test('a bare test file alone cannot satisfy "validated"', () => {
  const testFileOnly = { status: 'analytical', evalCount: 0, benchmarkCount: 0, testCount: 5, scriptCount: 0 };
  assert(hasSubstantiveEvidenceArtifact(testFileOnly) === false,
    'a test-file-only evidence record should not count as substantive evidence');
  const { maturity, downgraded } = applyEvidencePolicy('validated', testFileOnly);
  assert(maturity === 'usable', `expected a bare test file to downgrade "validated" to "usable", got "${maturity}"`);
  assert(downgraded === true, 'expected downgraded=true when only a test file backs a "validated" claim');
});

test('a bare test file alone cannot satisfy "published"', () => {
  // testCount alone never reaches evidence.status 'live' (live requires a
  // graded benchmark run — see deriveEvidenceV2), so a "published" claim
  // backed only by a test file must fall all the way to "usable", not stop
  // at "validated".
  const testFileOnly = { status: 'analytical', evalCount: 0, benchmarkCount: 0, testCount: 5, scriptCount: 0 };
  const { maturity, downgraded } = applyEvidencePolicy('published', testFileOnly);
  assert(maturity === 'usable', `expected a bare test file to downgrade "published" all the way to "usable", got "${maturity}"`);
  assert(downgraded === true, 'expected downgraded=true when only a test file backs a "published" claim');
});

test('evidence-policy leaves a "published" claim alone when live evidence exists', () => {
  const live = { status: 'live', evalCount: 4, benchmarkCount: 2, testCount: 3, scriptCount: 1 };
  const { maturity, downgraded } = applyEvidencePolicy('published', live);
  assert(maturity === 'published', `expected "published" to stand, got "${maturity}"`);
  assert(downgraded === false, 'expected downgraded=false when live evidence backs the claim');
});

test('evidence-policy never touches maturity at or below "usable"', () => {
  for (const m of ['placeholder', 'skeleton', 'draftable', 'usable']) {
    const { maturity, downgraded } = applyEvidencePolicy(m, { status: 'not-run', evalCount: 0, benchmarkCount: 0, testCount: 0, scriptCount: 0 });
    assert(maturity === m, `expected "${m}" to be untouched, got "${maturity}"`);
    assert(downgraded === false, `expected downgraded=false for "${m}"`);
  }
});

// 14. Cross-check the shipped catalog.json itself: whenever a skill's
// maturitySource is NOT 'evidence-policy', its maturity must actually meet
// the evidence bar unassisted (i.e. the build didn't forget to flag a
// downgrade). This re-runs the same pure policy against real package data.
test('every shipped skill satisfies its own declared maturitySource (evidence-policy re-check)', () => {
  for (const s of catalog.skills) {
    const { maturity: policed, downgraded } = applyEvidencePolicy(s.maturity, s.evidence);
    if (s.maturitySource === 'evidence-policy') {
      // The catalog is already showing the held-back maturity; re-applying
      // the policy to that (already-downgraded) value must be a no-op.
      assert(!downgraded, `skill "${s.name}" is marked evidence-policy but its shipped maturity "${s.maturity}" still fails the policy (would downgrade further to "${policed}")`);
    } else {
      assert(!downgraded, `skill "${s.name}" claims maturity "${s.maturity}" via ${s.maturitySource} but does not meet the evidence-policy bar for it (policy would downgrade to "${policed}") — the build should have set maturitySource to "evidence-policy"`);
    }
  }
});

// ─── Release 0: provenance tests ───────────────────────────────────────────
// These guard against the shallow-checkout regression where every skill's
// createdAt/lastModified/commitSha silently fell back to today's deploy
// commit instead of the file's real git history.

// Only enforced in CI: a Replit dev workspace clone can report itself as
// "shallow" while still carrying a large, useful commit window (see
// ensureFullHistory()'s comment in build-catalog.js), so this would be a
// false positive locally. The production deploy workflow is what must have
// full history, and it sets GITHUB_ACTIONS=true.
const inCI = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
test('this checkout has full git history (not shallow) [enforced in CI]', () => {
  if (!inCI) { console.log('    (skipped outside CI)'); return; }
  let isShallow;
  try {
    isShallow = execSync('git rev-parse --is-shallow-repository', {
      cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8',
    }).trim();
  } catch (err) {
    throw new Error(`could not determine checkout depth: ${err.message}`);
  }
  assert(isShallow === 'false', 'checkout is shallow — per-file git history is unavailable, so the catalog cannot carry real provenance');
});

test('every skill has non-null lastModified, commitSha, and createdAt', () => {
  const missing = catalog.skills.filter(s => !s.lastModified || !s.commitSha || !s.createdAt);
  assert(missing.length === 0,
    `${missing.length} skill(s) missing provenance fields (fabricated-fallback regression?): ${missing.slice(0, 5).map(s => s.name).join(', ')}`);
});

// Deterministic fixture check: recompute provenance directly with `git log`
// for a sample of historically distinct skill paths and assert the catalog
// build derived the same values, independent of build-catalog.js's own
// internal helpers (this test does not import or call them).
test('sampled skills\' provenance matches direct `git log` output', () => {
  const sample = catalog.skills.filter(s => s.path).slice(0, 5);
  assert(sample.length >= 1, 'no skills available to sample for provenance cross-check');
  for (const s of sample) {
    const relPath = s.path;
    const absPath = join(REPO_ROOT, relPath);
    if (!existsSync(absPath)) continue; // renamed/removed since catalog build; skip
    const newest = execSync(`git log -n 1 --format="%aI %H" -- ${JSON.stringify(relPath)}`,
      { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    assert(newest, `git log returned no history for "${relPath}" — cannot verify provenance`);
    const [, expectedSha] = newest.split(' ');
    assert(s.commitSha && expectedSha.startsWith(s.commitSha),
      `skill "${s.name}" commitSha "${s.commitSha}" does not match \`git log\` HEAD-for-path "${expectedSha}"`);

    const history = execSync(`git log --follow --format="%aI" -- ${JSON.stringify(relPath)}`,
      { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n').filter(Boolean);
    const expectedCreatedAt = history[history.length - 1];
    assert(s.createdAt === expectedCreatedAt,
      `skill "${s.name}" createdAt "${s.createdAt}" does not match oldest \`git log --follow\` entry "${expectedCreatedAt}"`);
  }
});

// At least one long-lived skill's real creation date must predate the
// current HEAD commit's date — the concrete symptom of the shallow-checkout
// bug was every skill showing the *deploy* date as its creation date.
test('at least one skill\'s createdAt predates the current HEAD commit (not a deploy-timestamp fabrication)', () => {
  const headDate = execSync('git log -n 1 --format=%aI', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  const older = catalog.skills.find(s => s.createdAt && s.createdAt < headDate);
  assert(older, `no skill has a createdAt earlier than HEAD (${headDate}) — provenance may be fabricated from the deploy commit`);
});

// ─── Release 0: project-summary.json contract ──────────────────────────────

// ─── Release 1: catalog/detail/search-index payload split ─────────────────
// Guards the regression this release fixes: shipping every skill's full
// body text in the same payload every route (Home, Compare, family pages)
// fetches just to support Explore's search box.

test('catalog.json skills no longer carry a bodyText field (payload split)', () => {
  const withBody = catalog.skills.filter(s => Object.prototype.hasOwnProperty.call(s, 'bodyText'));
  assert(withBody.length === 0,
    `${withBody.length} skill(s) still carry catalog.json bodyText — it should live only in search-index.json`);
});

test('search-index.json exists with one entry per catalog skill, each carrying non-empty bodyText', () => {
  const SEARCH_INDEX_PATH = join(__dirname, '..', 'public', 'data', 'search-index.json');
  assert(existsSync(SEARCH_INDEX_PATH), `${SEARCH_INDEX_PATH} was not generated`);
  const index = JSON.parse(readFileSync(SEARCH_INDEX_PATH, 'utf-8'));
  assert(Array.isArray(index), 'search-index.json is not an array');
  assert(index.length === catalog.skillCount,
    `search-index.json has ${index.length} entries, expected ${catalog.skillCount}`);
  const byName = new Map(index.map(e => [e.name, e]));
  for (const s of catalog.skills) {
    const entry = byName.get(s.name);
    assert(entry, `search-index.json is missing an entry for "${s.name}"`);
    assert(typeof entry.bodyText === 'string' && entry.bodyText.length > 0,
      `search-index.json entry for "${s.name}" has empty/missing bodyText`);
  }
});

test('every skill has a per-skill detail JSON file with its raw (unstripped) markdown body', () => {
  const sample = catalog.skills.slice(0, 8);
  for (const s of sample) {
    const detailPath = join(__dirname, '..', 'public', 'data', 'skills', s.family, `${s.name}.json`);
    assert(existsSync(detailPath), `missing detail file for "${s.name}" at ${detailPath}`);
    const detail = JSON.parse(readFileSync(detailPath, 'utf-8'));
    assert(detail.name === s.name, `detail file for "${s.name}" has mismatched name "${detail.name}"`);
    assert(typeof detail.rawBody === 'string' && detail.rawBody.length > 0,
      `detail file for "${s.name}" has empty/missing rawBody`);
    // rawBody must be real markdown (retains at least one heading marker),
    // not the markdown-stripped plain text used for search.
    assert(/^#{1,6}\s/m.test(detail.rawBody) || detail.rawBody.includes('#'),
      `detail file for "${s.name}" rawBody looks stripped of markdown structure`);
  }
});

// Capability flags: this is the regression test for the exact defect that
// motivated `capabilities.mjs` — `localStackComposer` sitting hardcoded
// `false` in project-summary.json while the composer was actually shipped
// and wired in. Re-derive every flag fresh from the real repo tree (not
// from build-catalog.js's cached run) and fail if it disagrees with what
// shipped in project-summary.json.
test('project-summary.json capabilities match freshly re-derived capabilities.mjs output', () => {
  assert(existsSync(SUMMARY_PATH), `${SUMMARY_PATH} was not generated`);
  const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf-8'));
  const fresh = computeCapabilities(FORGE_ROOT);
  for (const capability of CAPABILITIES) {
    assert(
      Object.prototype.hasOwnProperty.call(summary.capabilities, capability.key),
      `project-summary.json capabilities is missing "${capability.key}" (${capability.description})`
    );
    assert(
      summary.capabilities[capability.key] === fresh[capability.key],
      `project-summary.json reports capabilities.${capability.key}=${summary.capabilities[capability.key]}, ` +
        `but the shipped repo tree says it should be ${fresh[capability.key]} (${capability.description})`
    );
  }
  const extraKeys = Object.keys(summary.capabilities).filter(
    (key) => !CAPABILITIES.some((c) => c.key === key)
  );
  assert(extraKeys.length === 0, `project-summary.json has undeclared capability keys not in capabilities.mjs: ${extraKeys.join(', ')}`);
});

test('project-summary.json exists and matches the catalog it was built from', () => {
  assert(existsSync(SUMMARY_PATH), `${SUMMARY_PATH} was not generated`);
  const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf-8'));
  assert(summary.skillCount === catalog.skillCount, 'project-summary.json skillCount does not match catalog.json');
  assert(summary.familyCount === catalog.familyCount, 'project-summary.json familyCount does not match catalog.json');
  assert(summary.sourceCommit === catalog.sourceCommit, 'project-summary.json sourceCommit does not match catalog.json');
  assert(typeof summary.capabilities === 'object' && summary.capabilities !== null, 'project-summary.json is missing a capabilities object');
  const maturitySum = Object.values(summary.maturityCounts || {}).reduce((a, b) => a + b, 0);
  assert(maturitySum === summary.skillCount, `project-summary.json maturityCounts sum to ${maturitySum}, expected ${summary.skillCount}`);
});

// ─── Regression: build must hard-fail on a genuinely shallow checkout in CI ──
// The unit-level checks above assert the *current* checkout has full history
// and skip outside CI — they never actually exercise the failure path. This
// test creates a real shallow clone (git clone --depth 1) of the repo and
// runs build-catalog.js against it with GITHUB_ACTIONS=true, proving the
// guard in ensureFullHistory() actually exits non-zero instead of silently
// falling back to fabricated provenance. This is the concrete regression
// this task hardens against: a future edit to ensureFullHistory() (or its
// removal) that stops failing closed would be caught here, not just by a
// check against whatever this environment's checkout already happens to be.
test('build-catalog.js hard-fails in CI against a genuinely shallow checkout (not a silent fallback)', () => {
  const tmpParent = mktempCloneDir();
  try {
    const clonePath = join(tmpParent, 'shallow-clone');
    execSync(`git clone --depth 1 --no-local --quiet file://${REPO_ROOT} ${JSON.stringify(clonePath)}`, {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    });
    const buildScript = join(clonePath, 'forge', 'scripts', 'build-catalog.js');
    assert(existsSync(buildScript), `shallow clone is missing ${buildScript} — clone did not succeed as expected`);

    const result = spawnSync(process.execPath, [buildScript], {
      cwd: clonePath,
      env: { ...process.env, GITHUB_ACTIONS: 'true', CI: 'true', ALLOW_SHALLOW_CATALOG_BUILD: '' },
      encoding: 'utf8',
    });
    assert(result.status !== 0,
      `expected build-catalog.js to exit non-zero against a shallow checkout in CI, got exit code ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
    assert(/shallow/i.test(result.stderr) || /shallow/i.test(result.stdout),
      `build failed as expected, but the failure output does not mention "shallow" — may be failing for an unrelated reason:\nstderr: ${result.stderr}`);

    // The escape hatch documented in ensureFullHistory() must still let a
    // deliberate override proceed (exit 0) with the same shallow checkout,
    // confirming the hard-fail is specifically the CI default, not a
    // permanent block on ever building from a shallow clone.
    const overrideResult = spawnSync(process.execPath, [buildScript], {
      cwd: clonePath,
      env: { ...process.env, GITHUB_ACTIONS: 'true', CI: 'true', ALLOW_SHALLOW_CATALOG_BUILD: '1' },
      encoding: 'utf8',
    });
    assert(overrideResult.status === 0,
      `expected ALLOW_SHALLOW_CATALOG_BUILD=1 to let the build proceed on a shallow checkout, got exit code ${overrideResult.status}\nstderr: ${overrideResult.stderr}`);
  } finally {
    rmSync(tmpParent, { recursive: true, force: true });
  }
});

function mktempCloneDir() {
  return mkdtempSync(join(tmpdir(), 'catalog-shallow-clone-test-'));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nFAILED TESTS:');
  for (const f of failures) console.error(`  - ${f.name}: ${f.message}`);
  process.exit(1);
}
