const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const packageDir = path.resolve(__dirname, '..');
const repositoryRoot = path.basename(path.dirname(packageDir)) === 'skills'
  ? path.resolve(packageDir, '..', '..', '..') : path.resolve(packageDir, '..', '..');
const localMirror = path.join(repositoryRoot, '.agents', 'skills', 'okhp3-skill-foundry');
const validator = path.join(packageDir, 'scripts', 'validate-skill-suite.cjs');

function versionFixture(versionLine, body = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semver-validator-'));
  const target = path.join(root, 'okhp3-semver-fixture');
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, 'SKILL.md'),
    ['---', 'name: okhp3-semver-fixture', 'description: Validate version syntax.',
      'metadata:', versionLine, '---', '## Scope', 'Verify versions.', body, '## About', 'Test fixture.'].join('\n'));
  try { return run(target); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

for (const version of ['1.2.3', '"1.2.3"', "'1.2.3'", '1.2.3-alpha.1+build.01']) {
  test(`accepts strict version ${version}`, () => {
    const result = versionFixture(`  version: ${version}`);
    assert.equal(result.status, 0, result.stderr);
  });
}
for (const version of ['', 'true', '1.2', '01.2.3', '1.2.3-01', '1.2.3-', '1.2.3+',
  'v1.2.3', '"garbage"', "'1.2.3\"", '1.2.3 trailing', '[1.2.3]']) {
  test(`rejects invalid version ${version}`, () => {
    const result = versionFixture(`  version: ${version}`);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /metadata.version must be strict SemVer/);
  });
}
for (const reference of ['references/missing-guide.md', 'references/0.1.0.md']) {
  test(`plain version does not exempt missing reference ${reference}`, () => {
    const result = versionFixture('  version: 1.2.3', `Read \`${reference}\` before validation.`);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing referenced file/);
  });
}
test('rejects absent and duplicate metadata versions', () => {
  for (const versionLine of ['', '  version: 1.2.3\n  version: 1.2.3']) {
    assert.notEqual(versionFixture(versionLine).status, 0);
  }
});

function run(target) {
  return spawnSync(process.execPath, [validator, '--root', target], { encoding: 'utf8' });
}

function temporaryPackage(mutator) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'foundry-validator-'));
  const target = path.join(root, 'okhp3-skill-foundry');
  fs.cpSync(packageDir, target, { recursive: true, filter: source => !source.includes(`${path.sep}workspace${path.sep}`) });
  try {
    mutator(target);
    return { root, target, result: run(target) };
  } finally {
    // The caller reads the result before the temporary package is removed.
  }
}

function mutateJson(target, relative, mutate) {
  const file = path.join(target, relative);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(value);
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function expectRejected(name, mutate, expected) {
  test(name, () => {
    const { root, result } = temporaryPackage(mutate);
    try {
      assert.notEqual(result.status, 0, result.stdout);
      assert.match(result.stderr, expected);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

test('accepts the frozen Foundry package', () => {
  const result = run(packageDir);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('accepts the synchronized project-local Foundry mirror', () => {
  const result = run(localMirror);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

expectRejected('rejects a protected holdout that was seen', target => {
  mutateJson(target, 'evals/evals.json', evals => {
    evals.release_holdout.status = 'protected';
    evals.release_holdout.holdout_seen = true;
    evals.evals[0].partition = 'holdout';
  });
}, /protected holdout state/);

expectRejected('rejects a protected holdout without a packaged holdout case', target => {
  mutateJson(target, 'evals/evals.json', evals => {
    evals.release_holdout.status = 'protected';
    evals.release_holdout.holdout_seen = false;
  });
}, /protected holdout state/);

expectRejected('rejects an unknown holdout state', target => {
  mutateJson(target, 'evals/evals.json', evals => { evals.release_holdout.status = 'perhaps'; });
}, /valid release holdout state/);

expectRejected('rejects a live benchmark for a prior version', target => {
  mutateJson(target, 'benchmarks/benchmark.json', benchmark => {
    benchmark.metadata.evaluation_status = 'live';
  });
}, /version-mismatched benchmark/);

expectRejected('rejects a mismatched eval design version', target => {
  mutateJson(target, 'evals/evals.json', evals => { evals.skill_version = '9.9.9'; });
}, /evals\/evals\.json must declare version/);

expectRejected('rejects a tampered recorded core hash', target => {
  const record = fs.readdirSync(path.join(target, 'benchmarks')).find(name => name.startsWith('sync-verification-'));
  mutateJson(target, path.join('benchmarks', record), verification => {
    verification.core_file_hashes['SKILL.md'] = '0'.repeat(64);
  });
}, /core-file hash mismatch/);
