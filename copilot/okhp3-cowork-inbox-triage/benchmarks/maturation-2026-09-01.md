# 1.1.0 maturation circuit

## Preservation intake

- Frozen baseline: `SKILL.md` SHA-256 `fcde18be0580edc988d6f1bcce0af5ea48ee2819228d5b9000acf23cd4cce15b`; `evals/evals.json` SHA-256 `c65e6d0f67eb35410616290f714588a4c828e3a236b1384ec80e098955a864b1`.
- Working artifact: the versioned package copy; no live Microsoft 365 source, tenant data, or credentials were collected.

## Elicited requirements

Initial vision: classify a bounded inbox into a useful personal action queue without acting on messages. Open requirement: how stated deadlines, sender cues, and user context establish priority. The added development case prevents invented due dates and proves bounded ordering reasons.

## Research and equilibrium review

Official [Cowork use documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) and [application card](https://learn.microsoft.com/en-us/microsoft-365/copilot/responsible-ai/copilot-cowork-application-card), retrieved 2026-09-01, establish permission-scoped context, custom-skill discovery, and approval handling. Independent evidence, outcome, and safety reviewers plus a disruptor approved with limits: use a draft-only automation boundary, mailbox- and message-specific skill approval policy, portable supplied-material fallback, and non-exclusive sibling handoffs.

## Foundry decision

Incremented from `1.0.0` to `1.1.0`. Added activation, approval, portability, mobile, and handoff boundaries and a fourth development case. Evidence status remains `analytical-design-only`; no protected holdout or live Cowork execution was run.

## External validation needed

Test interactive discovery, selected-mailbox boundaries, approval broadening, and supplied-message fallback in a permitted Cowork environment before promotion.
