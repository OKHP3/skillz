import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { findSkillFiles } from './build-catalog.js';

const root = mkdtempSync(join(tmpdir(), 'catalog-discovery-'));
try {
  const family = join(root, 'openclaw');
  const skill = join(family, 'sample');
  mkdirSync(skill, { recursive: true });
  writeFileSync(join(family, 'FAMILY.md'), '# Family');
  writeFileSync(join(skill, 'SKILL.md'), '# Skill');
  assert.deepEqual(findSkillFiles(root), [join(skill, 'SKILL.md')]);
  symlinkSync(family, join(family, 'openclaw'), 'dir');
  assert.deepEqual(findSkillFiles(root), [join(skill, 'SKILL.md')]);
  symlinkSync(join(skill, 'SKILL.md'), join(family, 'SKILL.md'));
  assert.deepEqual(findSkillFiles(root), [join(skill, 'SKILL.md')]);
  symlinkSync(join(root, 'missing'), join(family, 'missing'), 'dir');
  assert.deepEqual(findSkillFiles(root), [join(skill, 'SKILL.md')]);
  console.log('PASS: regular source, cyclic directory link, linked skill, dangling link');
} finally {
  rmSync(root, { recursive: true, force: true });
}
