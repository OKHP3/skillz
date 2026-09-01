# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `cae3c9d7e2c3a1f7a28a266085c18df13a9c667d65c3a9427686311b2bab18c4`; `evals/evals.json` SHA-256 `2c86fa46ad970cc4e155de31931c28a78facb54a6707906ef361f7d40c7c7101`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: reconcile personal work, commitments, and calendar load into a realistic next-week draft. Open requirement: how duplicate references to the same commitment are reconciled. The added development case requires traceable cross-source deduplication without scheduling an action.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, approval handling, and documented inability to delete OneDrive or SharePoint files or folders. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, precise skill-level approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries, clarified the deletion limit, and added a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, selected-work-window boundaries, documented deletion refusal, and supplied-source fallback in a permitted Cowork environment before promotion.
