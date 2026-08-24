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
