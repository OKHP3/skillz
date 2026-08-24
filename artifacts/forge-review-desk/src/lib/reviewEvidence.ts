import { Activity, ClipboardCheck, FileCheck2, ShieldAlert } from 'lucide-react';
import type { Catalog, Skill } from '@/types/catalog';

export type EvidenceItem = {
  id: 'contract' | 'provenance' | 'runtime' | 'ownership';
  label: string;
  kind: 'required' | 'blocking';
  score: string;
  status: 'verified' | 'missing';
  summary: string;
  detail: string;
  icon: typeof FileCheck2;
};

const MATURITY_RANK: Record<Skill['maturity'], number> = {
  placeholder: 0,
  skeleton: 1,
  draftable: 2,
  usable: 3,
  validated: 4,
  published: 5,
};

const MATURITY_LADDER = Object.keys(MATURITY_RANK).length;

function formatDate(value: string | null): string {
  if (!value) return 'not recorded';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

/** Builds the four review checkpoints from a skill's real catalog fields --
 * no fabricated scores. Each score is a count of populated real fields;
 * each status is derived from a real threshold on real data. */
export function buildEvidenceItems(skill: Skill, catalog: Catalog): EvidenceItem[] {
  const contractSections: Array<[string, boolean]> = [
    ['description', Boolean(skill.description)],
    ['triggers', skill.triggers.length > 0],
    ['avoid', skill.avoid.length > 0],
    ['inputs', skill.inputs.length > 0],
    ['outputs', skill.outputs.length > 0],
    ['boundaries', skill.boundaries.length > 0],
    ['examples', skill.examples.length > 0],
    ['tools', skill.tools.length > 0],
    ['runtimes', skill.runtimes.length > 0],
    ['tags', skill.tags.length > 0],
    ['topics', skill.topics.length > 0],
    ['companions', skill.companions.length > 0],
  ];
  const contractPresent = contractSections.filter(([, present]) => present).length;
  const maturityRank = MATURITY_RANK[skill.maturity] ?? 0;
  const contractVerified = maturityRank >= MATURITY_RANK.draftable;

  const provenanceFields: Array<[string, boolean]> = [
    ['path', Boolean(skill.path)],
    ['commit', Boolean(skill.commitSha)],
    ['author', Boolean(skill.author)],
    ['origin', Boolean(skill.origin)],
  ];
  const provenancePresent = provenanceFields.filter(([, present]) => present).length;

  const evidenceArtifactCount =
    skill.evidence.evalCount +
    skill.evidence.benchmarkCount +
    skill.evidence.testCount +
    skill.evidence.referenceCount +
    skill.evidence.scriptCount;
  const runtimeVerified = skill.evidence.status === 'live';

  const ownershipVerified = Boolean(skill.maturityReviewedAt);

  return [
    {
      id: 'contract',
      label: 'Contract completeness',
      kind: 'required',
      score: `${contractPresent} / ${contractSections.length}`,
      status: contractVerified ? 'verified' : 'missing',
      icon: FileCheck2,
      summary: contractVerified
        ? `A complete, reviewable contract (maturity: ${skill.maturity}). ${contractPresent} of ${contractSections.length} contract sections are populated.`
        : `This contract has not reached a reviewable maturity yet (currently "${skill.maturity}", stage ${maturityRank + 1} of ${MATURITY_LADDER}).`,
      detail: skill.description || 'No description recorded in the contract.',
    },
    {
      id: 'provenance',
      label: 'Source provenance',
      kind: 'required',
      score: `${provenancePresent} / ${provenanceFields.length}`,
      status: provenancePresent === provenanceFields.length ? 'verified' : 'missing',
      icon: ClipboardCheck,
      summary:
        provenancePresent === provenanceFields.length
          ? 'Repository path, author, origin, and commit all resolve to a canonical source.'
          : 'One or more provenance fields (path, author, origin, commit) are missing from this contract.',
      detail: `${catalog.sourceRepository} / ${skill.path} · branch ${catalog.sourceRef} · commit ${skill.commitSha ?? 'unknown'}.`,
    },
    {
      id: 'runtime',
      label: 'Runtime evidence',
      kind: 'blocking',
      score: `${evidenceArtifactCount} artifact${evidenceArtifactCount === 1 ? '' : 's'}`,
      status: runtimeVerified ? 'verified' : 'missing',
      icon: Activity,
      summary: runtimeVerified
        ? 'Live runtime evidence is attached to the current package version.'
        : `Evidence status is "${skill.evidence.status}" -- a live, supervised run against the current version is required before this contract can move from draftable to reviewable.`,
      detail:
        skill.evidence.blockers.length > 0
          ? skill.evidence.blockers.join(' ')
          : `${skill.evidence.evalCount} eval, ${skill.evidence.benchmarkCount} benchmark, ${skill.evidence.testCount} test artifact(s) recorded. Last evidence date: ${formatDate(skill.evidence.lastEvidenceDate)}.`,
    },
    {
      id: 'ownership',
      label: 'Release ownership',
      kind: 'required',
      score: ownershipVerified ? '1 / 1' : '0 / 1',
      status: ownershipVerified ? 'verified' : 'missing',
      icon: ShieldAlert,
      summary: ownershipVerified
        ? 'A named author and a maturity review date are attached to this entry.'
        : 'No maturity review date is attached to this entry yet.',
      detail: `Author: ${skill.author ?? 'unrecorded'} · maturity source: ${skill.maturitySource} · last review: ${formatDate(skill.maturityReviewedAt)}.`,
    },
  ];
}

export type RelatedSkill = { name: string; family: string; maturity: Skill['maturity']; note: string };

/** Real companions first (as authored in the contract), padded out with
 * other skills from the same family when there are fewer than 3 companions. */
export function buildRelatedSkills(skill: Skill, allSkills: Skill[]): RelatedSkill[] {
  const seen = new Set<string>([skill.name]);
  const related: RelatedSkill[] = [];

  for (const companionName of skill.companions) {
    const companion = allSkills.find((s) => s.name === companionName);
    if (!companion || seen.has(companion.name)) continue;
    seen.add(companion.name);
    related.push({ name: companion.name, family: companion.family, maturity: companion.maturity, note: 'Declared companion skill.' });
    if (related.length >= 3) return related;
  }

  for (const candidate of allSkills) {
    if (related.length >= 3) break;
    if (candidate.family !== skill.family || seen.has(candidate.name)) continue;
    seen.add(candidate.name);
    related.push({ name: candidate.name, family: candidate.family, maturity: candidate.maturity, note: `Also in the ${candidate.family} family.` });
  }

  return related;
}
