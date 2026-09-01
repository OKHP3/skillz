# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `ddafb7e4b11b178ffee256c34feff369b47910b2db621a417ec51a8d12d440b8`; `evals/evals.json` SHA-256 `6be4bb8c054ded96f2c65131d12a53bce71c20f3c8cb2c48a547e93fdf5bd468`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: give an audience- and purpose-specific critique without pretending to approve or rewrite the document. Open requirement: what counts as a material blocker. The added development case tests a bounded severity-ranked critique without edits.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, and approval handling. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, precise skill-level approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries and a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, selected-document boundaries, approval broadening, and supplied-source fallback in a permitted Cowork environment before promotion.
