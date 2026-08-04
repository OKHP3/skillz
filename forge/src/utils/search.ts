import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Skill, SearchResult, FilterState } from '../types/catalog';

const FUSE_OPTIONS: IFuseOptions<Skill> = {
  includeScore: true,
  threshold: 0.4,
  minMatchCharLength: 2,
  // Fuse's default location/distance scoring only rewards matches near the
  // start of a field. Several fields here (description, bodyText) run to
  // hundreds or thousands of characters, so without this a real match deep
  // in the text scores as "no match" and silently vanishes from results.
  ignoreLocation: true,
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
    // Full-text body of the SKILL.md (stripped of markdown syntax). Weighted
    // low so a stray word deep in prose doesn't outrank a name/description
    // match, but it means nothing written in a skill file is unsearchable.
    { name: 'bodyText',    weight: 0.08 },
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

  // Apply evidence filter
  if (filters.evidence) {
    results = results.filter(r => r.skill.evidenceStatus === filters.evidence);
  }

  // Apply release-readiness filter (evidence-contract v2)
  if (filters.releaseReadiness) {
    results = results.filter(r => r.skill.releaseReadiness === filters.releaseReadiness);
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
    case 'evidence': {
      const order: Record<string, number> = {
        live: 0, historical: 1, analytical: 2, 'local-checks': 3, designed: 4, 'not-run': 5, none: 6,
      };
      return [...results].sort((a, b) =>
        (order[a.skill.evidenceStatus] ?? 9) - (order[b.skill.evidenceStatus] ?? 9)
      );
    }
    case 'updated':
      return [...results].sort((a, b) =>
        (b.skill.lastModified ? Date.parse(b.skill.lastModified) : 0) -
        (a.skill.lastModified ? Date.parse(a.skill.lastModified) : 0)
      );
    case 'evidence-freshness': {
      // Freshest evidence first: a live/analytical record with a recent
      // lastEvidenceDate outranks a historical one, which outranks not-run.
      const order: Record<string, number> = { live: 0, analytical: 1, historical: 2, 'not-run': 3 };
      return [...results].sort((a, b) => {
        const statusDiff = (order[a.skill.evidence.status] ?? 9) - (order[b.skill.evidence.status] ?? 9);
        if (statusDiff !== 0) return statusDiff;
        const aDate = a.skill.evidence.lastEvidenceDate ? Date.parse(a.skill.evidence.lastEvidenceDate) : 0;
        const bDate = b.skill.evidence.lastEvidenceDate ? Date.parse(b.skill.evidence.lastEvidenceDate) : 0;
        return bDate - aDate;
      });
    }
    case 'version':
      // Missing versions sort last but remain present and sortable (6.5 test 3).
      return [...results].sort((a, b) => {
        if (!a.skill.version && !b.skill.version) return a.skill.name.localeCompare(b.skill.name);
        if (!a.skill.version) return 1;
        if (!b.skill.version) return -1;
        return compareVersions(b.skill.version, a.skill.version);
      });
    default:
      return results;
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
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

// ─── Workflow Pathway ────────────────────────────────────────────────────────

export interface PathNode {
  skill: Skill;
  isCurrent: boolean;
  /** Extra incoming edges beyond the one in the displayed chain (shows branching) */
  incomingBranches: number;
  /** Extra outgoing edges beyond the first companion (shows branching) */
  outgoingBranches: number;
}

/**
 * Traverse companion relationships to build an ordered pathway containing
 * `skill`.  Walks backward to the chain root, then forward through the main
 * (first-companion) path, returning at most MAX_TOTAL nodes.
 */
export function buildWorkflowPath(skill: Skill, allSkills: Skill[]): PathNode[] {
  const MAX_DEPTH = 5;
  const MAX_TOTAL = 10;
  const skillMap = new Map(allSkills.map(s => [s.name, s]));

  // Build predecessor index: predecessors.get(name) = all skills that list name as a companion
  const predecessors = new Map<string, string[]>();
  for (const s of allSkills) {
    for (const cName of s.companions) {
      if (!predecessors.has(cName)) predecessors.set(cName, []);
      predecessors.get(cName)!.push(s.name);
    }
  }

  // Walk backward to find chain root (the skill with no predecessor in the chain)
  function findRoot(name: string, depth: number, visited: Set<string>): string {
    if (depth >= MAX_DEPTH || visited.has(name)) return name;
    visited.add(name);
    const preds = (predecessors.get(name) ?? []).filter(p => !visited.has(p) && skillMap.has(p));
    if (preds.length === 0) return name;
    // Prefer a predecessor whose first companion is `name` (direct chain link)
    const primary =
      preds.find(p => skillMap.get(p)?.companions[0] === name) ?? preds[0];
    return findRoot(primary, depth + 1, visited);
  }

  const rootName = findRoot(skill.name, 0, new Set());

  // Walk forward from root following the first companion at each step
  const nodes: PathNode[] = [];
  const visited = new Set<string>();

  function walkForward(name: string, depth: number): void {
    if (visited.has(name) || depth >= MAX_TOTAL) return;
    visited.add(name);
    const s = skillMap.get(name);
    if (!s) return;

    const validCompanions = s.companions.filter(c => skillMap.has(c) && !visited.has(c));
    const totalPreds = (predecessors.get(name) ?? []).length;

    nodes.push({
      skill: s,
      isCurrent: name === skill.name,
      incomingBranches: Math.max(0, totalPreds - 1),
      outgoingBranches: Math.max(0, validCompanions.length - 1),
    });

    if (validCompanions.length > 0 && nodes.length < MAX_TOTAL) {
      walkForward(validCompanions[0], depth + 1);
    }
  }

  walkForward(rootName, 0);

  // Safety: if the current skill ended up outside the chain, return it alone
  if (!nodes.some(n => n.isCurrent)) {
    const validCompanions = skill.companions.filter(c => skillMap.has(c));
    return [{
      skill,
      isCurrent: true,
      incomingBranches: 0,
      outgoingBranches: Math.max(0, validCompanions.length - 1),
    }];
  }

  return nodes;
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
