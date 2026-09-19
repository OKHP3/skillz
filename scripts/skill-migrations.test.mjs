import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSkillMigrations, resolveMigratedSkillPath, validateMigrationCatalog } from './skill-migrations.mjs';

const migration = {
  from: { family: 'universal', name: 'old' },
  to: { family: 'replit', name: 'current' },
};
const registry = migrations => ({ schemaVersion: 1, migrations });

test('resolves package children and leaves unrelated historical paths alone', () => {
  const entries = validateSkillMigrations(registry([migration]));
  assert.equal(resolveMigratedSkillPath('universal/old/references/guide.md', entries), 'replit/current/references/guide.md');
  assert.equal(resolveMigratedSkillPath('universal/old-extra/SKILL.md', entries), 'universal/old-extra/SKILL.md');
});

test('rejects unsafe, duplicate, cyclic, and ambiguous identity mappings', () => {
  assert.throws(() => validateSkillMigrations(registry([{ ...migration, from: {} }])));
  assert.throws(() => validateSkillMigrations(registry([{ ...migration, from: { family: 123, name: 'old' } }])));
  assert.throws(() => validateSkillMigrations(registry([{ ...migration, to: { family: '..', name: 'escape' } }])));
  assert.throws(() => validateSkillMigrations(registry([migration, migration])));
  assert.throws(() => validateSkillMigrations(registry([migration, { from: migration.to, to: migration.from }])));
  assert.throws(() => validateSkillMigrations(registry([migration, {
    from: { family: 'copilot', name: 'old' }, to: { family: 'copilot', name: 'different' },
  }])));
});

test('fails closed on a missing canonical target or retained installable alias', () => {
  assert.doesNotThrow(() => validateMigrationCatalog([migration], [migration.to]));
  assert.throws(() => validateMigrationCatalog([migration], []), /Missing migration target/);
  assert.throws(() => validateMigrationCatalog([migration], [migration.from, migration.to]), /remains installable/);
});
