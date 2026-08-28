# Red Teaming Family Remaster Review

Date: 2026-08-28

## Decision summary

The family is structurally ready for local cataloging and further controlled evaluation. It is not performance-validated, independently equilibrium-reviewed, or accepted as canonical by a commit. The current promotion decision is `defer-for-evidence`.

## Baseline and inventory

- Review target: `red-teaming/`
- Baseline recovery commit: `4c2beeb`
- Current package count: 24
- Current family version: `2.0.0`
- Generated distribution index: 282 skills across 18 families
- Catalog write: root `README.md` and `.catalog-meta.json` only
- Family narrative preservation: `red-teaming/FAMILY.md` was deliberately preserved by using the cataloger's `--no-family-md` mode.

The original family overview named fewer packages than the directory inventory contained. The four stage-assessment packages were retained and remastered rather than hidden: credential assessment, data exposure, exploitation testing, lateral assessment, and persistence assessment are all represented in the current family inventory.

## Name and adjacency decisions

| Earlier directory | Remastered directory | Reason |
|---|---|---|
| `okhp3-adversary-capability-forecasting` | `okhp3-adversary-forecasting` | Removes an overlong path while preserving the forecasting job. |
| `okhp3-agentic-credtest-testing` | `okhp3-agentic-credential-assessment` | Replaces shorthand and redundant testing language with a clear purpose. |
| `okhp3-agentic-exfiltration-testing` | `okhp3-agentic-data-exposure` | Names the defensive boundary rather than an operational exfiltration action. |
| `okhp3-agentic-lateralmovement-testing` | `okhp3-agentic-lateral-assessment` | Removes an overlong path and keeps adjacency with the assessment family. |
| `okhp3-agentic-persistence-testing` | `okhp3-agentic-persistence-assessment` | States the defensive assessment boundary and meets the path limit. |
| `okhp3-authorization-governance-checkpoint` | `okhp3-authorization-governance` | Removes a redundant suffix while preserving the gatekeeping function. |
| `okhp3-model-behavior-anomaly-detection` | `okhp3-model-anomaly-detection` | Removes an overlong path without losing the detection purpose. |
| `okhp3-response-cost-benefit-calculator` | `okhp3-response-cost-benefit` | Removes implementation language and keeps the measurement relationship clear. |

Every current package uses the `okhp3-` prefix, matches its directory name in frontmatter, and is 36 characters or fewer. The shortened names are not presented as aliases; the renamed paths are the remastered package identities.

## Remastering decisions

The long Claude-originated drafts contained useful concepts but also mixed operational attack detail, unsupported performance targets, assumed service levels, and implementation claims. The current packages were rebuilt around a common portable contract:

- portable frontmatter and quoted semantic version;
- discovery-first description with a near-miss boundary;
- explicit outcome, scope, inputs, procedure, validation loop, safety boundary, output contract, and integration;
- synthetic-lab or evidence-review constraints for adversarial assessment packages;
- no live target, real credential, real sensitive data, payload, persistence, lateral pivot, evasion, exfiltration, destruction, or denial-of-service behavior;
- evidence status and limitations that prevent analytical or laboratory results from being presented as live-system proof;
- version-matched evaluation design with normal, missing-prerequisite, and safety cases.

Unsupported claims such as fixed adoption windows, accuracy percentages, continuous availability, response latency, return on investment, or guaranteed coverage were not carried forward as facts. They can return only as measured, version-matched evidence with sources and a declared methodology.

## Recovery and preservation

The original package content remains recoverable from baseline commit `4c2beeb`. The untracked root artifacts that were already present in the checkout, including numbered Markdown drafts and `cloud_skills.tar`, were not treated as current family packages and were not deleted or modified. They remain owner-controlled evidence requiring separate provenance review. The tracked `red-teaming/test.md` file was removed as a four-line stray package that had no family purpose.

## Validation status

- Strict Foundry validator: PASS, 24 packages validated.
- Evaluation JSON parsing and package identity check: PASS, 24 files.
- Package name, path length, footer, and repository-wide integration audit: PASS.
- Catalog dry run and catalog check: PASS, 282 skills discovered.
- Whitespace check: PASS.
- Independent equilibrium review: NOT RUN.
- Live with-skill versus without-skill benchmark: NOT RUN.
- Unseen release holdout: EXTERNAL REQUIRED.

The associated files are `equilibrium-review-2026-08-28.json` and the 24 package promotion manifests in `red-teaming/reviews/promotion-manifests/`.

## Next authorized action

Obtain owner approval for controlled external holdout evaluation and independent review. After evidence is available, update the relevant package manifests and review record, rerun the Foundry and catalog gates, and make a separate decision about commit, publication, or further refinement. No commit, push, pull request, external publication, or live-target assessment was performed in this pass.
