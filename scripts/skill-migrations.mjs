import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SKILL_MIGRATIONS_PATH = 'docs/skill-migrations.json';
const token = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const key = ({ family, name }) => `${family}/${name}`;

/** One-hop, repository-relative redirects only. No aliases are skill packages. */
export function validateSkillMigrations(registry) {
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry.migrations)) {
    throw new Error('Invalid skill migration registry schema');
  }
  const fromPaths = new Set();
  const nameTargets = new Map();
  for (const migration of registry.migrations) {
    for (const identity of [migration?.from, migration?.to]) {
      if (!identity || typeof identity.family !== 'string' || typeof identity.name !== 'string' ||
          !token.test(identity.family) || !token.test(identity.name)) {
        throw new Error('Skill migration identities must use safe family and package names');
      }
    }
    const from = key(migration.from);
    const to = key(migration.to);
    if (from === to || fromPaths.has(from)) throw new Error(`Duplicate or self migration: ${from}`);
    if (nameTargets.has(migration.from.name) && nameTargets.get(migration.from.name) !== migration.to.name) {
      throw new Error(`Ambiguous migrated skill name: ${migration.from.name}`);
    }
    fromPaths.add(from);
    nameTargets.set(migration.from.name, migration.to.name);
    if (migration.context !== undefined && (typeof migration.context !== 'string' || !migration.context.trim())) {
      throw new Error(`Invalid migration context: ${from}`);
    }
    if (migration.profile !== undefined && (typeof migration.profile?.label !== 'string' ||
        !migration.profile.label.trim() || typeof migration.profile.path !== 'string' ||
        !/^references\/brand-profiles\/[a-z0-9-]+\.md$/.test(migration.profile.path))) {
      throw new Error(`Unsafe migration profile: ${from}`);
    }
  }
  for (const migration of registry.migrations) {
    if (fromPaths.has(key(migration.to))) throw new Error(`Chained or cyclic migration: ${key(migration.from)}`);
  }
  return registry.migrations;
}

export function readSkillMigrations(root) {
  return validateSkillMigrations(JSON.parse(readFileSync(join(root, SKILL_MIGRATIONS_PATH), 'utf8')));
}

/** Preserve the historical document; resolve its old package-relative target. */
export function resolveMigratedSkillPath(repositoryPath, migrations) {
  for (const migration of migrations) {
    const oldPath = key(migration.from);
    if (repositoryPath === oldPath || repositoryPath.startsWith(`${oldPath}/`)) {
      return `${key(migration.to)}${repositoryPath.slice(oldPath.length)}`;
    }
  }
  return repositoryPath;
}

export function validateMigrationCatalog(migrations, skills) {
  const paths = new Set(skills.map(key));
  for (const migration of migrations) {
    if (!paths.has(key(migration.to))) throw new Error(`Missing migration target: ${key(migration.to)}`);
    if (paths.has(key(migration.from))) throw new Error(`Legacy migration remains installable: ${key(migration.from)}`);
  }
}
