// Minimal mirror of artifacts/forge/src/types/catalog.ts -- only the fields
// the Review Desk actually renders. Kept as a separate, independently
// deployed package, so this intentionally does not import from the Forge
// package; if Forge's catalog shape changes, update both.
export type Maturity = 'placeholder' | 'skeleton' | 'draftable' | 'usable' | 'validated' | 'published';
export type EvidenceStatusV2 = 'live' | 'analytical' | 'historical' | 'not-run' | 'none';
export type MaturitySource = 'explicit-frontmatter' | 'evidence-policy' | 'fallback-structure';
export type ReleaseReadiness =
  | 'needs-contract-work'
  | 'needs-live-evidence'
  | 'ready-for-supervised-use'
  | 'ready-for-peer-review'
  | 'published';

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

export interface Skill {
  name: string;
  displayName: string;
  family: string;
  path: string;
  description: string;
  version: string | null;
  license: string;
  category: string;
  origin: string | null;
  author: string | null;
  homepage: string | null;
  maturity: Maturity;
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
  createdAt: string | null;
  evidence: SkillEvidence;
  maturitySource: MaturitySource;
  maturityReviewedAt: string | null;
  releaseReadiness: ReleaseReadiness;
}

export interface Family {
  name: string;
  displayName: string;
  skillCount: number;
  skills: string[];
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
