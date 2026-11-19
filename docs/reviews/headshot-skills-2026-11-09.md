# Portrait and still-photo skill extraction

Date: 2026-11-09. Owner: Codex for the repository owner.
Task: [Skillz #232](https://github.com/OKHP3/skillz/issues/232).
Base: `4eefc3b6a5a933d657e0c9e0a2da33df0017cce3`.

## Candidate decision and architecture

| Candidate | Durable knowledge and output | Decision |
|---|---|---|
| Professional headshot | Reference roles, current likeness versus older style, expression-only transfer, visible review and version/delivery provenance | Publish `askjamie/okhp3-professional-headshot` |
| Guided still-photo session | Capability preflight, direct readiness/stop/relax cues, bounded posing, capture/save/verify counts and partial results | Publish `universal/okhp3-guided-photo-session` |
| Verified media handoff | Inventory, collisions, byte readback, version mapping and sync limits | Supporting contract; do not duplicate record-location or career-file-routing skills |
| Background generation and smile refinement | Modes of the same portrait/capture jobs, not distinct recurring outcomes | References within the two packages |

These are skills because they encode recurring decisions, state transitions,
output contracts and failure handling beyond a reusable prose prompt. The
portrait skill consumes supplied/authorized photos and produces a private
reviewable image with a source/version record. The capture skill consumes a
bounded still request plus verified controls and produces verified stills with a
session record. Neither skill grants account publication or destructive writes.

The portable core is independent of a particular camera app or connector.
Camo is a conditional historical adapter; usable controls and timing must be
verified at runtime. The portrait editor is the host's available image tool.
No fallback sends private photos to a new service.

## Evidence ledger and boundaries

- SRC-USER: the repository owner's request authorizes packaging and publication.
  It does not authorize publishing private photos, source locators or accounts.
- SRC-HISTORY: prior workflow notes motivate the design. They are historical
  context, not a replay, performance test, or independent validation of 0.1.0.
  Only abstract failure patterns are included; no private fixtures are published.
- SRC-FOUNDRY: [Skill Foundry 3.1.1](https://github.com/OKHP3/skillz/blob/4eefc3b6a5a933d657e0c9e0a2da33df0017cce3/universal/okhp3-skill-foundry/SKILL.md).
- SRC-EQUILIBRIUM: [Equilibrium Review 1.0.1](https://github.com/OKHP3/skillz/blob/4eefc3b6a5a933d657e0c9e0a2da33df0017cce3/universal/okhp3-equilibrium-review/SKILL.md).
- SRC-EXISTING: [record-location boundary](https://github.com/OKHP3/skillz/blob/4eefc3b6a5a933d657e0c9e0a2da33df0017cce3/knowledge-operations/okhp3-record-location-reconciliation/SKILL.md).
  Existing-record reconciliation excludes copy-delete migrations.
- SRC-REPO: root AGENTS and social-posting FAMILY at the pinned base.
  Social Posting remains text drafting; these are external companion routes.
- SRC-ARTIFACT: frozen package core, references and development fixture hashes
  recorded in each package's release protocol.

## Frozen review question and acceptance criteria

May the exact frozen packages be released as public, draftable 0.1.0 skills?

1. Clear recurring outcome, scoped inputs/outputs and useful domain decisions.
2. No private source material, implicit account access or destructive migration.
3. Reference coverage and likeness limits remain explicit; available tools are
   verified and no result is claimed when a tool is unavailable.
4. Live capture protects user readiness and stop/relax communication; an
   unbounded tool cannot justify a bounded pose promise.
5. All package resources resolve, branding and portable metadata conform,
   public fixtures cover normal, edge, incomplete, failure and safety cases.
6. Historical observations, static checks, author-visible cases, live results
   and protected holdout are distinguished. No invented metrics or maturity.

Critical scope/privacy/data-loss failures block release regardless of score.

## Review and release method

Freeze the operative core and fixture hashes before separate evidence, outcome,
and safety/portability reviewers inspect them. Reviewers do not edit the artifact.
If initial findings agree, run a falsifiable disruptor; otherwise negotiate the
material disagreement directly. A negotiator records the final decision and
remaining limits. Revisions require an updated freeze and review of the diff.

These are separate contexts with shared host-selected model family, sources and
criteria. This reduces editorial self-review but is not independent empirical
evidence. Exact model and sampling configuration are not exposed by the host.
No live image generation, camera capture, model comparison or discovery test is
part of this release. An external evaluator must supply an unseen holdout.

## Completed review and validation

Final decision: **approve-with-limits**, frozen review-4, draftable 0.1.0.

Three separate initial contexts reviewed evidence, outcome, and safety/portability.
Evidence and safety identified a real contradiction between heuristic fixture
flags and the noncompensatory privacy/authority rubric. Revision 2 removed
critical flags, made all 56 anchored expectations required, and made the
all-required/no-averaging rule explicit. All three reviewers independently
verified the fixture-only correction and hashes, then approved with limits.

Revision 3 adds only explicit draftable maturity metadata. The conditional
disruptor and negotiator verified that removing this one line reconstructs both
review-2 SKILL hashes. They challenged hidden operative changes, maturity
laundering, later blocking camera calls, and hidden standalone dependencies.
No material source counterexample survived; runtime effectiveness remains
unmeasured. The final ledgers retain the original defect and its resolution.

Validation: both portable package checks passed; catalog freshness passed; the
full-history catalog integrity suite passed 51 checks with zero failures.
AskJamie integration baseline passed manifest, registry, public artifact checks,
and 180 governance tests under Python 3.11. An initial subprocess PATH issue
was corrected in the isolated environment; no repository code fix was needed.
These are structural/governance results, not executed image/camera evaluations.

Final package records:
- [Portrait review](../../askjamie/okhp3-professional-headshot/benchmarks/equilibrium-review-2026-11-09.json)
- [Capture review](../../universal/okhp3-guided-photo-session/benchmarks/equilibrium-review-2026-11-09.json)

A protected unseen holdout, matched live comparison, trigger measurements, and
real-host image/capture evaluation remain open before stronger maturity claims.


## Scanner clarification and final revision

The first unchanged CI scan completed both packages. Cisco reported no findings;
SkillSpector flagged P3 (high) on an evaluation expectation forbidding covert
photo transfer and EA2 (medium) on the blocking-call posing prohibition.
The original report remains review-required; it was not suppressed or relabeled.

Review-4 states these safeguards affirmatively: photos remain within the user's
approved service/destination scope, and automated posing requires a verified
timeout/cancellation path within the pose budget. Otherwise the person stays
relaxed with user-operated alternatives. The safety reviewer and negotiator
verified all ten hashes, exact reconstruction of review-3, all 56 required
expectations and unchanged consequential gates. They approved with limits.

The unchanged scanner and release checks must accept the exact final revision
before merge. Their actual results are revision-bound on
[Skillz PR #234](https://github.com/OKHP3/skillz/pull/234). No private photos,
scanner exclusions, policy changes or self-approved exceptions were introduced.
