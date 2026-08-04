export type Maturity = 'placeholder' | 'skeleton' | 'draftable' | 'usable' | 'validated' | 'published';
export type EvidenceStatus = 'none' | 'local-checks' | 'designed' | 'analytical' | 'not-run' | 'historical' | 'live';

// --- Evidence contract v2 (2026-07-31 spec) --------------------------------
// This is a second, narrower evidence vocabulary layered alongside the
// original 7-value `EvidenceStatus` above. The two are intentionally NOT
// merged: `EvidenceStatus` keeps the finer-grained categories (`none`,
// `local-checks`, `designed`) that Explore's filter, Compare's column, and
// the FAQ copy already depend on; `SkillEvidence.status` is the coarser
// 4-value classification the evidence-contract-v2 spec defines, plus the
// richer per-package counts, blockers, and review metadata that spec adds.
// Mapping from v1 -> v2 status (documented, not silent): `live` -> `live`,
// `historical` -> `historical`, `not-run` -> `not-run`, `none` -> `none`;
// `analytical` and the v1 `local-checks`/`designed` categories collapse to
// `analytical` (see `deriveEvidenceV2` in build-catalog.js for the exact
// rule). `none` is distinct from `not-run`: `not-run` means an evaluation
// design/plan exists but hasn't executed yet, `none` means no evaluation of
// any kind — design or executed — exists for this package at all.
export type EvidenceStatusV2 = 'live' | 'analytical' | 'historical' | 'not-run' | 'none';

export interface SkillEvidence {
  status: EvidenceStatusV2;
  evaluatedSkillVersion: string | null;
  evalCount: number;
  benchmarkCount: number;
  testCount: number;
  referenceCount: number;
  scriptCount: number;
  lastEvidenceDate: string | null;
  reviewDecision: 'approve' | 'approve-with-limits' | 'defer-for-evidence' | 'reject' | null;
  blockers: string[];
}

export interface SkillPackageMetadata {
  author: string | null;
  category: string | null;
  origin: string | null;
  homepage: string | null;
  authorGithub: string | null;
  inScope: string | null;
  outOfScope: string | null;
}

export type MaturitySource = 'explicit-frontmatter' | 'evidence-policy' | 'fallback-structure';

// Derived UI convenience field, not a stored maturity value. Computed from
// maturity + evidence.status so Explore can offer a single release-oriented
// filter instead of forcing visitors to reason about maturity and evidence
// together. See `deriveReleaseReadiness` in build-catalog.js for the mapping.
export type ReleaseReadiness =
  | 'needs-contract-work'
  | 'needs-live-evidence'
  | 'ready-for-supervised-use'
  | 'ready-for-peer-review'
  | 'published';

export interface Skill {
  name: string;
  displayName: string;
  family: string;
  skillDir: string;
  path: string;
  description: string;
  version: string | null;
  license: string;
  category: string;
  origin: string | null;
  author: string | null;
  homepage: string | null;
  maturity: Maturity;
  evidenceStatus: EvidenceStatus;
  evidenceNote: string;
  status: string | null;
  tags: string[];
  topics: string[];
  triggers: string[];
  avoid: string[];
  companions: string[];
  examples: string[];
  inputs: string[];
  outputs: string[];
  tools: string[];
  runtimes: string[];
  boundaries: string[];
  rawUrl: string;
  githubUrl: string;
  lastModified: string | null;
  commitSha: string | null;
  /** Oldest tracked SKILL.md commit date (`git log --follow`), or null if unavailable. */
  createdAt: string | null;
  packageMetadata: SkillPackageMetadata;
  evidence: SkillEvidence;
  maturitySource: MaturitySource;
  /** Date of the latest review record, or null if the package has never been reviewed. */
  maturityReviewedAt: string | null;
  releaseReadiness: ReleaseReadiness;
}

export interface Family {
  name: string;
  displayName: string;
  skillCount: number;
  skills: string[];
  /** Hand-written narrative body from FAMILY.md (between the H1 and the
   *  generated summary/inventory markers), or null if the family has no
   *  narrative beyond its auto-generated one-line summary. */
  narrativeBody: string | null;
}

export interface Catalog {
  generatedAt: string;
  sourceRepository: string;
  sourceRef: string;
  sourceCommit: string | null;
  skillCount: number;
  familyCount: number;
  families: Family[];
  skills: Skill[];
}

export interface StackStep {
  label: string;
  skillNames: string[];
  purpose: string;
  inputs?: string;
  outputs?: string;
  optional?: boolean;
}

export interface Stack {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  audience: string;
  steps: StackStep[];
  installNote?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  links?: Array<{ label: string; href: string }>;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export interface SearchResult {
  skill: Skill;
  score: number;
  matchReason?: string;
}

/** One entry in the compact full-text search index (`data/search-index.json`),
 *  fetched only by Explore when a visitor searches — not part of the main
 *  catalog payload every route pays for. `bodyText` is markdown-stripped
 *  plain text, weighted low in ranking (see utils/search.ts). */
export interface SearchIndexEntry {
  name: string;
  family: string;
  bodyText: string;
}

/** A single skill's Full Contract body (`data/skills/:family/:name.json`),
 *  fetched on demand by SkillDetail. `rawBody` is the *unstripped* markdown
 *  body (headings, links, code fences intact) — distinct from the
 *  plain-text `bodyText` used for search. */
export interface SkillDetailBody {
  name: string;
  family: string;
  rawBody: string;
}

export type SortKey =
  | 'relevance'
  | 'alpha'
  | 'family'
  | 'maturity'
  | 'evidence'
  | 'updated'
  | 'evidence-freshness'
  | 'version';

export interface FilterState {
  query: string;
  family: string;
  maturity: Maturity | '';
  evidence: EvidenceStatus | '';
  releaseReadiness: ReleaseReadiness | '';
  sort: SortKey;
}
