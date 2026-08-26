import { STACKS } from '../data/stacks';
import type { Skill } from '../types/catalog';

// ─── Guided discovery aid (Release 2) ──────────────────────────────────────
// Deterministic, grounded entirely in the 5 hand-authored curated stacks —
// never a fabricated marketing taxonomy. Q1 picks an outcome (a real stack's
// tagline/problem statement); Q2 annotates the resulting candidate skills
// using real releaseReadiness/evidence fields. Q2 only ever reorders and
// notes — it must never claim a skill is "incompatible", since compatibility
// is not a fact this aid is allowed to assert.

export interface DiscoveryOutcomeOption {
  stackId: string;
  label: string;
  description: string;
}

export function getDiscoveryOutcomeOptions(): DiscoveryOutcomeOption[] {
  return STACKS.map(s => ({ stackId: s.id, label: s.tagline, description: s.problem }));
}

export type DiscoveryContext = 'exploring' | 'production';

export const DISCOVERY_CONTEXT_OPTIONS: { value: DiscoveryContext; label: string; description: string }[] = [
  {
    value: 'exploring',
    label: 'Just exploring',
    description: 'Show the full candidate set as authored, in the stack\'s intended order.',
  },
  {
    value: 'production',
    label: 'Heading toward production use',
    description: 'Surface the most release-ready candidates first, with a note on any that still need more evidence.',
  },
];

const READINESS_RANK: Record<string, number> = {
  published: 5,
  'ready-for-peer-review': 4,
  'ready-for-supervised-use': 3,
  'needs-live-evidence': 2,
  'needs-contract-work': 1,
};

export interface DiscoveryCandidate {
  skill: Skill;
  /** Informational context note from Q2 — never asserts incompatibility. */
  note: string | null;
}

export interface DiscoveryResult {
  stackId: string;
  stackName: string;
  candidates: DiscoveryCandidate[];
  /** Skill names the stack references that no longer resolve in the current
   *  catalog — never fabricated, just surfaced as a fact so nothing silently
   *  disappears without explanation. */
  unresolvedNames: string[];
}

export function getDiscoveryResult(stackId: string, context: DiscoveryContext, allSkills: Skill[]): DiscoveryResult | null {
  const stack = STACKS.find(s => s.id === stackId);
  if (!stack) return null;

  const orderedNames = [...new Set(stack.steps.flatMap(s => s.skillNames))];
  const resolved: Skill[] = [];
  const unresolvedNames: string[] = [];
  for (const name of orderedNames) {
    const found = allSkills.find(s => s.name === name);
    if (found) resolved.push(found);
    else unresolvedNames.push(name);
  }

  let candidates: DiscoveryCandidate[] = resolved.map(skill => ({ skill, note: null }));

  if (context === 'production') {
    candidates = candidates.map(c => {
      const isEvidenceStale = Boolean(
        c.skill.evidence.evaluatedSkillVersion &&
        c.skill.version &&
        c.skill.evidence.evaluatedSkillVersion !== c.skill.version
      );
      let note: string | null = null;
      if (c.skill.releaseReadiness === 'needs-contract-work' || c.skill.releaseReadiness === 'needs-live-evidence') {
        note = `Still "${c.skill.releaseReadiness.replace(/-/g, ' ')}" — review its evidence before relying on it in production.`;
      } else if (isEvidenceStale) {
        note = 'Evidence on file predates the current package version — worth a fresh look before production use.';
      }
      return { ...c, note };
    });
    // Reorder only — never remove a candidate. Ties keep the stack's
    // original authored order (stable sort).
    candidates = candidates
      .map((c, i) => ({ c, i }))
      .sort((a, b) => {
        const rankDiff = (READINESS_RANK[b.c.skill.releaseReadiness] ?? 0) - (READINESS_RANK[a.c.skill.releaseReadiness] ?? 0);
        return rankDiff !== 0 ? rankDiff : a.i - b.i;
      })
      .map(({ c }) => c);
  }

  return { stackId: stack.id, stackName: stack.name, candidates, unresolvedNames };
}
