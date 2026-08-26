# Skill maturity audit: 2026-07-29

## Decision summary

This audit inventories the 75 distribution skills in `OKHP3/skillz`, records
their current package version and Git provenance, and separates maturity from
evaluation evidence. It is a read-only audit generated from the repository
catalog and Git history. It does not promote a skill merely because it is old,
long, versioned, or accompanied by a benchmark design.

The current baseline is:

- 75 distribution skills across 12 active families.
- 62 `draftable`, 13 `skeleton`, 0 `usable`, 0 `validated`, and 0 `published`.
- Evidence states: 2 `live`, 17 `analytical`, 19 `local-checks`, 5 `not-run`, 6
  `historical`, and 26 with no package evidence record.
- First Git records range from 2026-06-12 through 2026-07-29.
- Last skill-file updates range from 2026-07-21 through 2026-07-29.
- Cloud `origin/main` is commit `6b1025f`; its tree matches the local `HEAD`
  tree at `4ea6151`. The local branch history is divergent because a previous
  merge preserved both histories, but there is no content delta to recover
  before this audit.

The most important finding is not that every skill needs a higher badge. The
catalog previously had no visible distinction between a written evaluation
design, local checks, historical runs, and current live evidence. The Forge now
records an `evidenceStatus` and `evidenceNote` separately from maturity, and it
preserves `usable` as distinct from `validated`.

## Evidence rules

The audit applies the current `okhp3-skill-foundry` contract and its equilibrium
review protocol:

1. A maturity label describes the contract state, not task quality by itself.
2. A version-matched live executor run may support `live` evidence.
3. A benchmark from an earlier version is `historical`, even if the package is
   otherwise unchanged.
4. Evaluation cases, fixtures, scripts, and tests can establish design or local
   evidence, but do not establish production performance.
5. `validated` remains reserved for a fresh, version-matched benchmark with a
   measurable quality criterion and a protected release holdout.
6. Safety, authorization, privacy, synchronization, and data-loss failures are
   blocking rather than averaged away by a score.

The named standalone `okhp3-equilibrium-review` skill is not present in this
repository or the local skill roots. The review logic used here is the
Foundry-provided `references/equilibrium-review-protocol.md`, and this limit is
recorded rather than silently treating a missing package as installed.

## Family summary

| Family | Skills | Current maturity | Evidence state |
|---|---:|---|---|
| Abrahamic | 4 | 4 draftable | 4 historical |
| Agent Foundry | 3 | 3 draftable | 3 analytical |
| Community | 13 | 6 draftable, 7 skeleton | 3 local-checks, 10 none |
| Context Extraction | 9 | 9 draftable | 9 analytical |
| LifeTrkr | 2 | 2 draftable | 2 live |
| LinkedIn | 3 | 1 draftable, 2 skeleton | 3 none |
| Mermaid | 9 | 7 draftable, 2 skeleton | 1 local-checks, 8 none |
| Notion | 1 | 1 draftable | 1 none |
| Outcome Modeling | 5 | 5 draftable | 5 not-run |
| Process Capture | 16 | 15 draftable, 1 skeleton | 15 local-checks, 1 none |
| ReFolDec | 1 | 1 draftable | 1 none |
| Universal | 9 | 8 draftable, 1 skeleton | 5 analytical, 2 historical, 2 none |

## Complete inventory

Resource abbreviations: `A` agents, `As` assets, `B` benchmarks, `E` evals,
`Ex` examples, `R` references, `S` scripts, and `T` tests. Dates and short SHAs
come from Git path history. A first-added record can reflect a repository import
or migration commit rather than the original upstream authoring date.

| Skill | Version | Maturity | Evidence | First Git record | Last modified | Resources |
|---|---:|---|---|---|---|---|
| `okhp3-cross-tradition-compare` | 1.2.0 | draftable | historical | 2026-06-25 / 56cc45b | 2026-07-21 / a6bfd72 | As, B, E |
| `okhp3-tradition-observance-calendar` | 1.2.0 | draftable | historical | 2026-06-25 / 56cc45b | 2026-07-24 / 3026887 | B, E, R, S |
| `okhp3-tradition-reference` | 1.2.0 | draftable | historical | 2026-06-25 / 56cc45b | 2026-07-21 / a6bfd72 | B, E |
| `okhp3-verse-lookup` | 1.2.0 | draftable | historical | 2026-06-25 / 56cc45b | 2026-07-24 / 3026887 | B, E, R, S, T |
| `okhp3-custom-gpt-builder` | 1.3.0 | draftable | analytical | 2026-07-21 / 7ff8e03 | 2026-07-24 / 3026887 | E, R |
| `okhp3-custom-gpt-readiness` | 1.2.0 | draftable | analytical | 2026-07-21 / 7ff8e03 | 2026-07-21 / 159332f | E, R |
| `okhp3-gpt-skill-conversion-plan` | 1.2.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | E, R |
| `ai-social-media-content` | - | draftable | none | 2026-06-22 / e59a44c | 2026-07-21 / a6bfd72 | - |
| `architecture-decision-records` | - | draftable | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `brand-guidelines` | - | skeleton | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `find-skills` | - | skeleton | none | 2026-06-22 / e59a44c | 2026-07-21 / a6bfd72 | - |
| `frontend-design` | - | skeleton | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `mcp-builder` | - | skeleton | local-checks | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | S |
| `mermaid-diagrams` | - | draftable | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | R |
| `skill-creator` | - | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | A, As, R, S |
| `theme-factory` | - | skeleton | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `vercel-react-best-practices` | 1.0.0 | draftable | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `vercel-react-native-skills` | 1.0.0 | draftable | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `web-artifacts-builder` | - | skeleton | local-checks | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | S |
| `web-design-guidelines` | 1.0.0 | skeleton | none | 2026-06-23 / 276561b | 2026-07-21 / a6bfd72 | - |
| `okhp3-chatgpt-project-migration` | 1.0.0 | draftable | analytical | 2026-07-21 / 159332f | 2026-07-22 / 58d54a7 | E, R |
| `okhp3-thread-context-extraction` | 2.0.0 | draftable | analytical | 2026-07-21 / 159332f | 2026-07-22 / 58d54a7 | A, As, E, R, S |
| `okhp3-thread-context-extraction-grok` | 2.0.0 | draftable | analytical | 2026-07-21 / 159332f | 2026-07-22 / 58d54a7 | A, As, E, R, S |
| `okhp3-thread-extract-chatgpt` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-thread-extract-claude` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-thread-extract-copilot-m365` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-thread-extract-gemini` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-thread-extract-mistral-vibe` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-thread-extract-perplexity` | 2.0.0 | draftable | analytical | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-celestial-data` | 1.3.0 | draftable | live | 2026-06-22 / e59a44c | 2026-07-21 / 159332f | A, B, E, R, S |
| `okhp3-daily-oracle` | 1.3.0 | draftable | live | 2026-06-22 / e59a44c | 2026-07-21 / 159332f | A, As, B, E, R, S |
| `okhp3-linkedin-angles` | 1.1.0 | draftable | none | 2026-06-12 / b529fb9 | 2026-07-21 / a6bfd72 | R |
| `okhp3-linkedin-post` | 1.1.0 | skeleton | none | 2026-06-12 / b529fb9 | 2026-07-21 / a6bfd72 | R |
| `okhp3-linkedin-voice` | 1.1.0 | skeleton | none | 2026-06-12 / b529fb9 | 2026-07-21 / a6bfd72 | R |
| `okhp3-mermaid-architecture` | 0.2.0 | skeleton | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-bpmn` | 0.2.0 | draftable | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-core` | 0.2.0 | draftable | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-data` | 0.2.0 | skeleton | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-governance` | 1.1.0 | draftable | none | 2026-06-24 / bad7c05 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-publish` | 0.2.0 | draftable | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | R |
| `okhp3-mermaid-repair` | 0.2.0 | draftable | none | 2026-06-20 / e1d2abe | 2026-07-24 / 3026887 | - |
| `okhp3-mermaid-theme-builder` | 0.5.1 | draftable | local-checks | 2026-06-22 / e59a44c | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-mermaid-update` | 0.2.0 | draftable | none | 2026-06-20 / e1d2abe | 2026-07-24 / 3026887 | - |
| `okhp3-notion-capture-router` | 0.3.0 | draftable | none | 2026-06-20 / 74ccb9b | 2026-07-21 / a6bfd72 | As, R |
| `okhp3-nfl-fantasy-picks` | 1.1.0 | draftable | not-run | 2026-07-28 / 6144b56 | 2026-07-29 / d251cf7 | B, E, Ex, R, S, T |
| `okhp3-outcome-modeling-core` | 1.1.0 | draftable | not-run | 2026-07-28 / 6144b56 | 2026-07-29 / d251cf7 | B, E, Ex, R, S, T |
| `okhp3-outcome-modeling-markets` | 1.1.0 | draftable | not-run | 2026-07-28 / 6144b56 | 2026-07-29 / d251cf7 | B, E, Ex, R, S, T |
| `okhp3-outcome-modeling-sales` | 1.1.0 | draftable | not-run | 2026-07-28 / 6144b56 | 2026-07-29 / d251cf7 | B, E, Ex, R, S, T |
| `okhp3-outcome-modeling-sports` | 1.1.0 | draftable | not-run | 2026-07-28 / 6144b56 | 2026-07-29 / d251cf7 | B, E, Ex, R, S, T |
| `okhp3-as-is-process-capture` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-decision-model-authoring` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-elicitation-interviews` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-future-state-strategy` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-handoff-packaging` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-process-capture` | 1.1.0 | skeleton | none | 2026-06-12 / b529fb9 | 2026-07-24 / 3026887 | - |
| `okhp3-process-controls-metrics` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-process-gap-analysis` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-process-intake-and-scope` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-process-narrative-authoring` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-process-quality-validation` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-raci-governance-matrix` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-sipoc-generation` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-sop-work-instructions` | 0.1.0 | draftable | local-checks | 2026-07-24 / 9bcf8ee | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-stakeholder-and-role-mapping` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-visual-process-modeling` | 0.1.0 | draftable | local-checks | 2026-06-23 / 276561b | 2026-07-24 / 3026887 | As, R, S, T |
| `okhp3-refolddec-core` | 1.1.0 | draftable | none | 2026-06-20 / e1d2abe | 2026-07-24 / 3026887 | - |
| `okhp3-brand-style-registry` | 1.1.0 | draftable | analytical | 2026-07-25 / 7fcdef0 | 2026-07-25 / 7175eed8 | A, As, E, R, S |
| `okhp3-cloudflare-worker-api-proxy` | 1.1.0 | draftable | none | 2026-06-22 / e59a44c | 2026-07-21 / a6bfd72 | - |
| `okhp3-database-cartographer` | 1.1.0 | draftable | analytical | 2026-07-24 / 2dcc4f2 | 2026-07-24 / 2dcc4f2 | A, E, R, S |
| `okhp3-foundry-repo-creator` | 1.1.0 | skeleton | none | 2026-06-22 / e59a44c | 2026-07-24 / 3026887 | - |
| `okhp3-google-gis-client-auth` | 1.2.0 | draftable | historical | 2026-06-22 / e59a44c | 2026-07-21 / 159332f | A, As, B, E, R, S |
| `okhp3-repository-organizer` | 1.1.1 | draftable | analytical | 2026-07-27 / 8853306 | 2026-07-27 / 8853306 | A, E, R, S |
| `okhp3-skill-cataloger` | 1.6.1 | draftable | analytical | 2026-06-23 / 2b494ed | 2026-07-24 / 3026887 | A, As, E, R, S |
| `okhp3-skill-foundry` | 3.1.0 | draftable | historical | 2026-06-25 / 56cc45b | 2026-07-28 / f292ad5 | A, As, B, E, R, S, T |
| `okhp3-vite-github-pages` | 1.0.0 | draftable | analytical | 2026-06-22 / e59a44c | 2026-07-21 / 159332f | A, E |

## Improvement disposition by family

The audit recommends a staged renewal, not a one-shot badge promotion.

| Family | Safe improvement now | Evidence required for next maturity gate |
|---|---|---|
| Abrahamic | Refresh version-mismatched benchmark metadata as historical and add current fixtures or adapters where needed. | Re-run version-matched source and neutrality cases with an external holdout. |
| Agent Foundry | Keep the analytical evaluation design and add current package-level structural checks. | Fresh executor runs, including portability and authorization dissent cases. |
| Community | Add missing versioned metadata, scope, explicit boundaries, and validation loops before promotion. | One representative task per imported skill plus a public-safe regression fixture. |
| Context Extraction | Preserve the shared contract and platform adapters; make current evidence status visible. | Fresh runs on balanced, rapid, comprehensive, and adversarial captures, plus protected sidecars. |
| LifeTrkr | Preserve existing live evidence as version-scoped and expose its date and limitations. | Re-run after any code/reference change and add an unseen date/API fallback case. |
| LinkedIn | Complete the two skeleton contracts and add voice, employer-context, and non-generation tests. | With/without comparison and a human editorial review gate. |
| Mermaid | Complete architecture/data skeletons, add syntax fixtures, and make repair/update non-regression tests explicit. | Renderer-backed checks across supported profiles and a protected malformed-input set. |
| Notion | Add destination-resolution fixtures, dry-run examples, and explicit consent/write gates. | Connector-backed dry-run and verification cases without private workspace data. |
| Outcome Modeling | Retain the computational payloads and glossary; keep live performance unclaimed. | Version-matched historical backtest, calibration metrics, leakage audit, and external holdout. |
| Process Capture | Use the existing local scripts/tests as a base and add cross-skill fixture handoffs. | End-to-end process suite with adversarial gaps and publication controls. |
| ReFolDec | Add a compact transformation fixture, semantic-loss ledger example, and validation loop. | Human review of loss accounting across at least three transformations. |
| Universal | Preserve the stronger Foundry/cataloger evidence, but complete skeletons and refresh stale benchmarks. | Fresh task runs plus security and portability review for each side-effect-capable workflow. |

## Release decision

Decision: **approve with limits** for the catalog/evidence-model improvement;
**defer** any global maturity promotion until fresh, version-matched evidence is
available. The repository now exposes why a skill remains draftable instead of
making every package appear equivalent. The next renewal should work from this
inventory, select a family, run the equilibrium review record, and promote only
the packages whose evidence changes the decision.

## Reproduction

```bash
python3 .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py \
  --full --no-absorb-readme --check
node forge/scripts/build-catalog.js
python3 scripts/audit-skill-maturity.py --markdown
node universal/okhp3-skill-foundry/scripts/validate-skill-suite.cjs --root .
```
