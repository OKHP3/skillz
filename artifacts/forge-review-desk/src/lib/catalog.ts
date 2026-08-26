import type { Catalog, Skill } from '@/types/catalog';

/**
 * Fetches the Forge catalog snapshot that scripts/sync-catalog-data.mjs
 * copies into this artifact's own public/data folder at dev/build time.
 * Same-origin, relative to this artifact's base path -- no dependency on
 * another service being up.
 */
export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/catalog.json`);
  if (!res.ok) {
    throw new Error(`Failed to load catalog data (${res.status})`);
  }
  return res.json() as Promise<Catalog>;
}

export function findSkill(catalog: Catalog, family: string, name: string): Skill | undefined {
  return catalog.skills.find((s) => s.family === family && s.name === name);
}

export type SkillReplacement = {
  skill: Skill;
  score: number;
  reason: 'same family' | 'similar name' | 'same family + similar name';
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column];
      previous[column] = left[row - 1] === right[column - 1]
        ? diagonal
        : Math.min(diagonal, above, previous[column - 1]) + 1;
      diagonal = above;
    }
  }
  return previous[right.length];
}

function nameSimilarity(query: string, name: string): number {
  const normalizedQuery = normalize(query);
  const normalizedName = normalize(name);
  if (!normalizedQuery || !normalizedName) return 0;
  const distance = levenshtein(normalizedQuery, normalizedName);
  const editSimilarity = 1 - distance / Math.max(normalizedQuery.length, normalizedName.length);
  const queryTokens = new Set(normalizedQuery.split(' '));
  const nameTokens = new Set(normalizedName.split(' '));
  const sharedTokens = [...queryTokens].filter((token) => nameTokens.has(token)).length;
  const tokenSimilarity = sharedTokens / Math.max(queryTokens.size, nameTokens.size);
  const prefixBonus = normalizedName.startsWith(normalizedQuery) || normalizedQuery.startsWith(normalizedName) ? 0.12 : 0;
  return Math.min(1, editSimilarity * 0.55 + tokenSimilarity * 0.45 + prefixBonus);
}

/**
 * Finds current catalog entries that are plausible replacements for a stale
 * name. This intentionally ranks the full catalog instead of requiring an
 * exact search match, so a typo or renamed skill can still recover.
 */
export function findLikelyReplacements(query: string, family: string, skills: Skill[], limit = 3): SkillReplacement[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  return skills
    .map((skill) => {
      const similarity = nameSimilarity(query, skill.name);
      const sameFamily = Boolean(family) && skill.family.toLowerCase() === family.toLowerCase();
      const score = similarity * 0.75 + (sameFamily ? 0.25 : 0);
      return {
        skill,
        score,
        reason: sameFamily && similarity >= 0.45
          ? 'same family + similar name' as const
          : sameFamily
            ? 'same family' as const
            : 'similar name' as const,
      };
    })
    .filter((item) => item.score >= 0.3)
    .sort((left, right) => right.score - left.score || left.skill.name.localeCompare(right.skill.name))
    .slice(0, limit);
}
