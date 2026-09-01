# SharePoint Library skill maturation intake

**Intake ID:** `SP-LIB-MAT-20260901`  
**Status:** working analytical evidence record  
**Authorization:** user requested a requirements-to-review-to-Foundry maturity
pass for the twelve SharePoint Library skills, with a minor increment only
after a traceable improvement and validation. No tenant deployment, upload,
publication, or remote mutation is authorized.

## Decision question

What smallest common improvement makes each v1.0.0 Library skill more reliable
on the documented Copilot in SharePoint surface without representing an
analytical package review as live tenant proof?

## Preserved source manifest

| Package | Frozen v1.0.0 SKILL.md SHA-256 | Evidence status |
|---|---|---|
| `okhp3-sharepoint-library-accessibility-review` | `81bd293ee498f5b83a832e6a8b3609dfe5159df00db80d8536b9fe816efd865f` | observed local artifact |
| `okhp3-sharepoint-library-article-curator` | `22d336a1ec13da2bdd52b6dc0b7be82e3770d1ac14e96292754c27cd1eb41b96` | observed local artifact |
| `okhp3-sharepoint-library-canonical-source-finder` | `262025d5716d34f81ec35759bb74f6d855f6c1c3546fbd805c842346b34f1526` | observed local artifact |
| `okhp3-sharepoint-library-contract-extractor` | `1f4eb722ad4f5b3c9d065ac81f196d4f07cc5aaae1a60fa13e022a8ce49c2a44` | observed local artifact |
| `okhp3-sharepoint-library-document-quality-gate` | `98ae5063e230744a676103cc7db0b0879f9268b8c93317c6b860fbe180ce4407` | observed local artifact |
| `okhp3-sharepoint-library-handover-packager` | `9647550c785ca6ad12d8a26a6a6a6fc75398df23b39406c16b527b32ed5bdb1d` | observed local artifact |
| `okhp3-sharepoint-library-intake-classifier` | `b79d3aa5fb27842890bef06a626f6213acf700d2fcfd44a3eb19cd0dc94c7720` | observed local artifact |
| `okhp3-sharepoint-library-metadata-review` | `5f58710f5787e16bdbc402c9f03c82b66ca83f7c568c8b013942a1368745f219` | observed local artifact |
| `okhp3-sharepoint-library-policy-citations` | `4c78783c65398740f5a199ff95ba0f0d7d07e8f733f835782e242d1d8c93953b` | observed local artifact |
| `okhp3-sharepoint-library-publish-checkout-hygiene` | `5936a0faa3809cc6c47326b1c4142d4a1153580b7caadbea5fea98426d23c2be` | observed local artifact |
| `okhp3-sharepoint-library-records-readiness-review` | `beb4dbac377145af76227ae15bc23c1ef6574e12ea860adc964719673349630f` | observed local artifact |
| `okhp3-sharepoint-library-taxonomy-drift-report` | `22c17323232295f4b167bb960f45a9cc0b12445eb852548ff988809b78bb23b9` | observed local artifact |

The input set contains a `SKILL.md` and three analytical evaluation cases per
package. No live benchmark, tenant test, or protected unseen holdout exists.

## Requirements ledger and elicitation plan

| ID | Requirement or question | Status | Use in maturity pass |
|---|---|---|---|
| R-01 | Preserve Library-specific task boundaries; do not turn these into generic document prompts. | confirmed | Review outcome fit. |
| R-02 | Preserve existing user permissions, explicit confirmation for mutations, and no external systems or custom code. | confirmed | Safety/portability review. |
| R-03 | Distinguish a structurally valid package from confirmed SharePoint discovery and execution. | confirmed | Add activation-evidence gate. |
| R-04 | Check that selected files are the explicit task input where the host allows selection. | confirmed | Add selected-file preflight. |
| R-05 | Record a version-specific evidence and learning trail before raising a version. | confirmed | Add per-package learning record. |
| Q-01 | Which disposable site/library and user role may verify native discovery? | open | Live-test prerequisite; do not invent. |
| Q-02 | Which taxonomy, records, accessibility, quality, and canonical-source standards are authoritative for a real tenant? | open | Runtime input; return `NEEDS INPUT` when absent. |
| Q-03 | Which actions are enabled on the target site and require an additional owner approval? | open | Runtime capability check; do not infer. |

## Source-backed research ledger

| ID | Source and retrieval | Authority | Claim used |
|---|---|---|---|
| S-01 | [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills), Microsoft Learn, retrieved 2026-09-01 | Primary product documentation | Skills are preview-native reusable workflows; supported capability depends on the site; no external systems or custom code; user permission is not expanded; files reside in `/Agent Assets/Skills/<skill-name>/SKILL.md`; selected files and the skill indicator card support testing. |

## Proposed evolution hypothesis

**H-01:** Each package should explicitly verify its host activation context
before claiming to operate on a selected Library set. The v1.1.0 procedure will:

1. ask the user to identify the Library and selected files when relevant;
2. require checking the SharePoint skill indicator card or an explicit named
   invocation during a real host test;
3. return `NOT SUPPORTED` when the host cannot load the skill or expose the
   necessary selected-file/context capability; and
4. add an analytical evaluation case that rejects a claim of completed work
   when activation cannot be confirmed.

This is a host-contract improvement, not evidence that the feature works in a
tenant. Each reviewer must reject the change if it weakens a package's narrower
purpose, duplicates an existing rule without value, or asserts unsupported
product behavior.

## Equilibrium-review acceptance criteria

For each package, reviewers must determine whether the candidate v1.1.0 change:

- preserves the user-facing outcome and named Library boundary;
- adds a concrete activation/discovery safeguard grounded in S-01;
- retains confirmation, permission, `NEEDS INPUT`, `NOT SUPPORTED`, and
  `INSUFFICIENT PERMISSION` handling;
- adds a version-specific analytical learning record and evaluation case; and
- makes no live, tenant, legal, records, accessibility-certification, or
  task-quality claim.

Record the decision as `approve-with-limits`, `defer-for-evidence`, or `reject`.
The independent reviewer contexts share this source ledger and therefore cannot
be treated as fully independent evidence sources.
