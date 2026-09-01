# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `eedc832721799b2bb22f1f269c370d687a7b24068f13195a59a87b4ed1588c82`; `evals/evals.json` SHA-256 `9a15c2655080f8d97460b48724c0141ab395d189c7bacadc31ab4c2ef38a59c1`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: turn explicit personal promises in bounded sources into a traceable, draft-only commitment ledger. Open requirement: distinguish promises by the user from promises made to the user. The added development case tests supersession without inventing ownership, recipients, or due dates.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, approval handling, and OneDrive/SharePoint deletion limits. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, precise skill-level approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries and a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, collision behavior, approval broadening, and supplied-source fallback in a permitted Cowork environment before promotion.
