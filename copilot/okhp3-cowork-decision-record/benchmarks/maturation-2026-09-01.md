# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `310d1a550cad4d39e17e5e7287479061335bd97136670f77dc8348d2f43cdd76`; `evals/evals.json` SHA-256 `6ed282c7a2b02134b0bf8a054c5a4cb5ca2e850b9b447146b7e681a3245f03d5`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: turn evidence-backed discussion into a durable decision-record draft. Open requirement: what source proves a choice is final and who has authority. The added development case prevents a chat assertion from becoming an unauthorized published decision.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, and approval handling. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, precise skill-level approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries and a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, authority evidence, approval broadening, and supplied-source fallback in a permitted Cowork environment before promotion.
