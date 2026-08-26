// Shared evidence/maturity vocabulary (docs/PUBLISHING.md, "Evidence and
// maturity vocabulary policy"). Every surface that shows maturity, evidence
// status, release readiness, or maturity source (SkillDetail, Compare, and
// any future surface) must import these instead of hand-writing its own
// copy — the policy exists specifically because two surfaces disagreeing
// about the same skill is the failure mode it was written to prevent.
import type { Skill, EvidenceStatusV2, Maturity, MaturitySource, ReleaseReadiness } from '../types/catalog';

export const RELEASE_READINESS_LABELS: Record<ReleaseReadiness, string> = {
  'needs-contract-work': 'Needs contract work',
  'needs-live-evidence': 'Needs live evidence',
  'ready-for-supervised-use': 'Ready for supervised use',
  'ready-for-peer-review': 'Ready for peer review',
  published: 'Published',
};

export const MATURITY_SOURCE_LABELS: Record<MaturitySource, string> = {
  'explicit-frontmatter': 'declared in SKILL.md frontmatter',
  'evidence-policy': 'derived from evidence policy',
  'fallback-structure': 'inferred from document structure (no explicit maturity declared)',
};

// A maturity description must never claim a stronger evidence state than
// that maturity level structurally requires — see the table in
// docs/PUBLISHING.md. Every description defers the specific evidence claim
// to the evidence fields instead of asserting it inline.
export const MATURITY_DESCRIPTIONS: Record<Maturity, string> = {
  placeholder: 'Directory reserved. No content yet.',
  skeleton: 'Structure and trigger phrases present. Body incomplete.',
  draftable: 'Contract is written and reviewable, and an agent can follow it under supervision. Evidence, if any, is shown separately below.',
  usable: 'Contract is complete and has been exercised on at least one real task, with its limits documented. This is a track-record claim about the contract, not a claim about recorded evaluation evidence -- check "Evidence state" below for what is actually on file.',
  validated: 'Has at least one recorded eval or benchmark artifact backing this claim. Whether that record is a current, historical, or design-only for this version is shown in "Evidence state" below.',
  published: 'Production-ready and release-tagged, backed by a live, version-matched evaluation. Official distribution surface.',
};

// Short labels for the 4-value evidence-contract-v2 vocabulary, distinct
// from the 7-value v1 EvidenceStatus labels Explore's filter uses (v1 keeps
// `local-checks`/`designed` broken out; v2 collapses those into
// `analytical`). `not-run` and `none` are deliberately worded differently:
// `not-run` means an evaluation is designed but has not executed yet,
// `none` means no evaluation of any kind exists for the package at all.
export const EVIDENCE_V2_LABELS: Record<EvidenceStatusV2, string> = {
  live: 'Live',
  historical: 'Historical (version-mismatched)',
  analytical: 'Analytical (design/review only, not executed)',
  'not-run': 'Not run (designed, not yet executed)',
  none: 'No evidence record',
};

// Longer, sentence-fragment form of the same distinction, used for the
// generated trust summary and anywhere a fuller explanation (not just a
// table cell) is useful.
export const EVIDENCE_V2_SUMMARY_LINES: Record<EvidenceStatusV2, (skill: Skill) => string> = {
  live: () => 'a live, version-matched evaluation is on file',
  historical: (skill) => `only a historical benchmark exists (evaluated against version ${skill.evidence.evaluatedSkillVersion ?? 'unknown'}), not the current ${skill.version ?? 'unversioned'} package`,
  analytical: () => 'only design or structural review exists; no graded run has been executed',
  'not-run': () => 'an evaluation is designed but has not yet been executed',
  none: () => 'no evaluation of any kind is recorded for this package',
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

/** Evidence is stale whenever it was evaluated against a different package
 *  version than the one currently shipping. Single definition shared by
 *  every surface that shows the "stale evidence" warning. */
export function isEvidenceStale(skill: Skill): boolean {
  return Boolean(
    skill.evidence.evaluatedSkillVersion &&
    skill.version &&
    skill.evidence.evaluatedSkillVersion !== skill.version
  );
}
