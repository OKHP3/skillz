import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Skill, SearchResult, FilterState } from '../types/catalog';

const FUSE_OPTIONS: IFuseOptions<Skill> = {
  includeScore: true,
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: [
    { name: 'name',        weight: 0.25 },
    { name: 'displayName', weight: 0.20 },
    { name: 'description', weight: 0.18 },
    { name: 'triggers',    weight: 0.12 },
    { name: 'inputs',      weight: 0.06 },
    { name: 'outputs',     weight: 0.06 },
    { name: 'family',      weight: 0.05 },
    { name: 'category',    weight: 0.04 },
    { name: 'topics',      weight: 0.03 },
    { name: 'tools',       weight: 0.03 },
    { name: 'runtimes',    weight: 0.02 },
    { name: 'companions',  weight: 0.02 },
    { name: 'boundaries',  weight: 0.02 },
    { name: 'examples',    weight: 0.02 },
  ],
};

let fuseIndex: Fuse<Skill> | null = null;

export function buildSearchIndex(skills: Skill[]): void {
  fuseIndex = new Fuse(skills, FUSE_OPTIONS);
}

export function searchSkills(skills: Skill[], filters: FilterState): SearchResult[] {
  let results: SearchResult[] = [];

  if (filters.query.trim()) {
    if (!fuseIndex) buildSearchIndex(skills);
    const raw = fuseIndex!.search(filters.query.trim());
    results = raw.map(r => ({
      skill: r.item,
      score: 1 - (r.score ?? 0.5),
      matchReason: buildMatchReason(r.item, filters.query),
    }));
  } else {
    results = skills.map(s => ({ skill: s, score: 0.5, matchReason: undefined }));
  }

  // Apply family filter
  if (filters.family) {
    results = results.filter(r => r.skill.family === filters.family);
  }

  // Apply maturity filter
  if (filters.maturity) {
    results = results.filter(r => r.skill.maturity === filters.maturity);
  }

  // Sort
  results = sortResults(results, filters.sort);

  return results;
}

function sortResults(results: SearchResult[], sort: FilterState['sort']): SearchResult[] {
  switch (sort) {
    case 'relevance':
      return [...results].sort((a, b) => b.score - a.score);
    case 'alpha':
      return [...results].sort((a, b) => a.skill.name.localeCompare(b.skill.name));
    case 'family':
      return [...results].sort((a, b) =>
        a.skill.family.localeCompare(b.skill.family) || a.skill.name.localeCompare(b.skill.name)
      );
    case 'maturity': {
      const order: Record<string, number> = {
        published: 0, validated: 1, usable: 2, draftable: 3, skeleton: 4, placeholder: 5,
      };
      return [...results].sort((a, b) =>
        (order[a.skill.maturity] ?? 9) - (order[b.skill.maturity] ?? 9)
      );
    }
    default:
      return results;
  }
}

function buildMatchReason(skill: Skill, query: string): string {
  const q = query.toLowerCase();
  if (skill.name.toLowerCase().includes(q)) return `Matches skill name "${skill.name}"`;
  const dn = skill.displayName || '';
  if (dn && dn.toLowerCase().includes(q)) return `Matches display name "${dn}"`;
  if (skill.description.toLowerCase().includes(q)) return `Matches description`;
  if (skill.triggers.some(t => t.toLowerCase().includes(q))) return `Matches trigger phrase`;
  if (skill.inputs.some(t => t.toLowerCase().includes(q))) return `Matches input: "${skill.inputs.find(t => t.toLowerCase().includes(q))}"`;
  if (skill.outputs.some(t => t.toLowerCase().includes(q))) return `Matches output: "${skill.outputs.find(t => t.toLowerCase().includes(q))}"`;
  if (skill.tools.some(t => t.toLowerCase().includes(q))) return `Matches tool: ${skill.tools.find(t => t.toLowerCase().includes(q))}`;
  if (skill.companions.some(c => c.toLowerCase().includes(q))) return `Companion of ${skill.companions.find(c => c.toLowerCase().includes(q))}`;
  if (skill.family.toLowerCase().includes(q)) return `Matches family "${skill.family}"`;
  return `Related to "${query}"`;
}

export function getRelatedSkills(skill: Skill, allSkills: Skill[]): Skill[] {
  const related: Skill[] = [];

  // Explicit companions first
  for (const name of skill.companions) {
    const found = allSkills.find(s => s.name === name);
    if (found && found.name !== skill.name) related.push(found);
  }

  // Same family, by maturity
  if (related.length < 5) {
    const sameFamily = allSkills
      .filter(s => s.family === skill.family && s.name !== skill.name && !related.includes(s))
      .slice(0, 5 - related.length);
    related.push(...sameFamily);
  }

  return related.slice(0, 6);
}
