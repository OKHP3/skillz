# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `9db93192dcd40b4b05fba96ae1e8b41044693e075e819bca20400e80018be419`; `evals/evals.json` SHA-256 `a33341a4697f5aa4634dab6792f0194624c79065c3b4f5238158c42e496d3156`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: build a claim-level evidence ledger that makes uncertainty inspectable. Open requirement: how to handle a primary and secondary source conflict. The added development case preserves both sources, records authority rationale, and asks for current authoritative evidence.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, built-in Deep Research, and approval handling. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, precise skill-level approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries, clarified the bounded use of Deep Research, and added a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, explicit source-boundary behavior for Deep Research, and supplied-source fallback in a permitted Cowork environment before promotion.
