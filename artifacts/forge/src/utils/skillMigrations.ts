import registry from '../../../../docs/skill-migrations.json';

export interface SkillIdentity {
  family: string;
  name: string;
}

interface SkillMigration {
  from: SkillIdentity;
  to: SkillIdentity;
  context?: string;
  profile?: { label: string; path: string };
}

const migrations: SkillMigration[] = registry.migrations;
export function skillMigration(name: string): SkillMigration | undefined {
  return migrations.find(migration => migration.from.name === name);
}

const byIdentity = new Map(registry.migrations.map(({ from, to }) => [`${from.family}/${from.name}`, to]));
const byName = new Map(registry.migrations.map(({ from, to }) => [from.name, to.name]));

/** Resolve only declared aliases, never fuzzy-match a contract. */
export function canonicalSkillIdentity(family: string, name: string): SkillIdentity {
  return byIdentity.get(`${family}/${name}`) ?? { family, name };
}

export function canonicalSkillName(name: string): string {
  return byName.get(name) ?? name;
}

export function canonicalSkillNames(names: string[]): string[] {
  return [...new Set(names.map(canonicalSkillName))];
}
