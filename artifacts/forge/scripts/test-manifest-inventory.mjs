import assert from 'node:assert/strict';
import { deriveManifestInventory, manifestInventoryDrift } from './build-catalog.js';

// Data-only fixtures: no package instructions or scripts are executed.
const catalog = {
  skillCount: 2,
  familyCount: 1,
  families: [{ name: 'example' }],
  skills: [
    { family: 'example', name: 'first', maturity: 'draftable', evidenceStatus: 'not-run' },
    { family: 'example', name: 'second', maturity: 'skeleton', evidenceStatus: 'none' },
  ],
};
const manifest = {
  name: 'fixture',
  families: [{ name: 'example', status: 'draftable', skills: [] }],
};
Object.assign(manifest, deriveManifestInventory(manifest, catalog, 3));
const before = JSON.stringify(manifest);
assert.deepEqual(manifestInventoryDrift(manifest, catalog, 3), []);

const staleCount = { ...manifest, distributionSkillCount: 1 };
assert.deepEqual(manifestInventoryDrift(staleCount, catalog, 3), ['distributionSkillCount']);
// Equal totals must not conceal changes between evidence or maturity categories.
assert.deepEqual(manifestInventoryDrift({ ...manifest, maturityCounts: { draftable: 2 } }, catalog, 3), ['maturityCounts']);
assert.deepEqual(manifestInventoryDrift({ ...manifest, evidenceStatusCounts: { none: 2 } }, catalog, 3), ['evidenceStatusCounts']);
assert.deepEqual(manifestInventoryDrift({ ...manifest, projectLocalSupportSkillCount: 2 }, catalog, 3), ['projectLocalSupportSkillCount']);
assert.deepEqual(manifestInventoryDrift({ ...manifest, activeFamilyCount: 0 }, catalog, 3), ['activeFamilyCount']);
assert.deepEqual(manifestInventoryDrift({ ...manifest, families: [{ name: 'example', status: 'draftable', skills: ['retired'] }] }, catalog, 3), ['families']);

// Build timestamps and object-key order are not inventory changes.
assert.deepEqual(manifestInventoryDrift({
  ...manifest,
  countsGeneratedAt: 'earlier-build',
  maturityCounts: { skeleton: 1, draftable: 1 },
}, catalog, 3), []);
assert.equal(JSON.stringify(manifest), before, 'checking drift must not repair the input');
console.log('Manifest inventory: stale totals, category maps, family membership and support counts rejected without mutation.');
