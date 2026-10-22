const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const { finished } = require('node:stream/promises');
const test = require('node:test');

const packageDir = path.resolve(__dirname, '..');
const repositoryRoot = path.basename(path.dirname(packageDir)) === 'skills'
  ? path.resolve(packageDir, '..', '..', '..') : path.resolve(packageDir, '..', '..');
const localMirror = path.join(repositoryRoot, '.agents', 'skills', 'okhp3-skill-foundry');
const validator = path.join(packageDir, 'scripts', 'validate-skill-suite.cjs');

async function versionFixture(versionLine, body = '') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semver-validator-'));
  const target = path.join(root, 'okhp3-semver-fixture');
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, 'SKILL.md'),
    ['---', 'name: okhp3-semver-fixture', 'description: Validate version syntax.',
      'metadata:', versionLine, '---', '## Scope', 'Verify versions.', body, '## About', 'Test fixture.'].join('\n'));
  try { return await run(target); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

for (const version of ['1.2.3', '"1.2.3"', "'1.2.3'", '1.2.3-alpha.1+build.01']) {
  test(("accepts strict version " + (version)), async () => {
    const result = await versionFixture(("  version: " + (version)));
    assert.equal(result.status, 0, result.stderr);
  });
}
for (const version of ['', 'true', '1.2', '01.2.3', '1.2.3-01', '1.2.3-', '1.2.3+',
  'v1.2.3', '"garbage"', "'1.2.3\"", '1.2.3 trailing', '[1.2.3]']) {
  test(("rejects invalid version " + (version)), async () => {
    const result = await versionFixture(("  version: " + (version)));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /metadata.version must be strict SemVer/);
  });
}
for (const reference of ['references/missing-guide.md', 'references/0.1.0.md']) {
  test(("plain version does not exempt missing reference " + (reference)), async () => {
    const result = await versionFixture('  version: 1.2.3', ("Read `" + (reference) + "` before validation."));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing referenced file/);
  });
}
test('rejects absent and duplicate metadata versions', async () => {
  for (const versionLine of ['', '  version: 1.2.3\n  version: 1.2.3']) {
    assert.notEqual((await versionFixture(versionLine)).status, 0);
  }
});

test('rejects duplicate top-level metadata blocks', async () => {
  for (const overridingVersion of ['invalid', '1.2.3']) {
    const result = await versionFixture(
      '  version: 1.2.3\nmetadata:\n  version: ' + overridingVersion);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /metadata.version must be strict SemVer/);
  }
});

async function run(target) {
  // Run the unchanged CLI entry point in an isolated thread, never package code.
  const worker = new Worker(validator, {
    argv: ['--root', target],
    stdout: true,
    stderr: true,
  });
  let stdout = '', stderr = '', failure;
  worker.stdout.setEncoding('utf8');
  worker.stderr.setEncoding('utf8');
  worker.stdout.on('data', chunk => { stdout += chunk; });
  worker.stderr.on('data', chunk => { stderr += chunk; });
  worker.once('error', error => { failure = error; });
  const exit = new Promise(resolve => { worker.once('exit', resolve); });
  // All settled waits for exit and both stream ends even on an error.
  const completed = await Promise.allSettled([
    exit, finished(worker.stdout), finished(worker.stderr),
  ]);
  const rejected = completed.find(result => result.status === 'rejected');
  if (failure) throw failure;
  if (rejected) throw rejected.reason;
  return { status: completed[0].value, stdout, stderr };
}

async function temporaryPackage(mutator) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'foundry-validator-'));
  const target = path.join(root, 'okhp3-skill-foundry');
  fs.cpSync(packageDir, target, { recursive: true, filter: source => !source.includes(("" + (path.sep) + "workspace" + (path.sep))) });
  try {
    mutator(target);
    return { root, target, result: await run(target) };
  } catch (error) {
    fs.rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

function mutateJson(target, relative, mutate) {
  const file = path.join(target, relative);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(value);
  fs.writeFileSync(file, ("" + (JSON.stringify(value, null, 2)) + "\n"));
}

function expectRejected(name, mutate, expected) {
  test(name, async () => {
    const { root, result } = await temporaryPackage(mutate);
    try {
      assert.notEqual(result.status, 0, result.stdout);
      assert.match(result.stderr, expected);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

test('accepts the frozen Foundry package', async () => {
  const result = await run(packageDir);
  assert.equal(result.status, 0, ("" + (result.stdout) + "\n" + (result.stderr)));
});

test('accepts the synchronized project-local Foundry mirror', async () => {
  const result = await run(localMirror);
  assert.equal(result.status, 0, ("" + (result.stdout) + "\n" + (result.stderr)));
});

test('worker captures success stdout and exit zero', async () => {
  const result = await versionFixture('  version: 1.2.3');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'Validated 1 skill packages recursively.\n');
  assert.equal(result.stderr, '');
});

test('worker captures rejection stdout, stderr, and exit one', async () => {
  const result = await versionFixture('  version: invalid');
  assert.equal(result.status, 1);
  assert.equal(result.stdout, 'Validated 1 skill packages recursively.\n');
  assert.equal(result.stderr,
    'ERROR okhp3-semver-fixture: OKHP3 metadata.version must be strict SemVer, plain or in matching quotes\n');
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
  const record = fs.readdirSync(path.join(target, 'benchmarks'))
    .filter(name => name.startsWith('sync-verification-')).sort().at(-1);
  mutateJson(target, path.join('benchmarks', record), verification => {
    verification.core_file_hashes['SKILL.md'] = '0'.repeat(64);
  });
}, /core-file hash mismatch/);

test('keeps older dated synchronization receipts as historical evidence', async () => {
  const { root, result } = await temporaryPackage(target => {
    const record = fs.readdirSync(path.join(target, 'benchmarks'))
      .filter(name => name.startsWith('sync-verification-')).sort()[0];
    mutateJson(target, path.join('benchmarks', record), verification => {
      verification.core_file_hashes['SKILL.md'] = '0'.repeat(64);
    });
  });
  try {
    assert.equal(result.status, 0, result.stderr);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
