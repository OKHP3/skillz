---
name: okhp3-sharepoint-library-contract-extractor
description: >
  Extract specified obligation, renewal, notice, owner, counterparty, and risk
  fields from selected SharePoint contract files into a review queue. Use when
  contracts need operational visibility. Do not use to interpret legal obligations, update records, or send notices automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Source-linked extraction of supplied contract fields into a review queue."
  out_of_scope: "Legal advice, definitive interpretation, automated notices, or unapproved writes."
---

# okhp3-sharepoint-library-contract-extractor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Create a source-linked contract review queue that exposes specified operational
fields and ambiguity without asserting legal conclusions or changing records.

## Scope

Use only for selected contract files and a user-supplied extraction schema. It
captures text evidence and review needs; it is not legal interpretation.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected contract documents and accessible metadata |
| Portable core | Field extraction, source citation, ambiguity handling, and review queue |
| Host adapter | Reads only content available through native capability and current permission |
| Mutation | Never updates a list, label, or document without a separately confirmed supported action |
| Evidence | Analytical design only; no live contract review has occurred |

## Activation evidence preflight

1. Confirm the named Library and the selected files or inspection scope required
   by this task.
2. In a real SharePoint test, confirm either explicit invocation of this skill
   or the SharePoint skill indicator card. The presence of this package alone
   is not evidence that the host discovered or loaded it.
3. If the host cannot load the skill or expose the required Library context,
   return `NOT SUPPORTED`, identify the missing capability, and do not claim
   that the review or draft was completed.
4. Keep the result analytical until a test records the site, user role, input
   scope, and observed host behavior.

## Procedure

1. Confirm selected contracts, the extraction schema, date convention, and the
   responsible reviewer for ambiguous results.
2. Extract only requested fields such as renewal, notice, owner, counterparty,
   obligation, or risk, preserving a short source locator or passage.
3. Use `NEEDS REVIEW` when wording is ambiguous, conflicting, incomplete, or
   inaccessible. Do not resolve it from general legal knowledge.
4. Return this queue:

   | Contract | Field | Extracted value | Source evidence | Confidence | Review status |
   |---|---|---|---|---|---|

5. Validate that every value has source evidence and every missing or uncertain
   value is explicitly marked.
6. If the user requests record updates or notices, show the exact proposed
   target and change, then require confirmation and supported host capability.

## Safe outcomes

- `NEEDS INPUT`: the files, field schema, or reviewer are missing.
- `NOT SUPPORTED`: the host cannot inspect the required contract content.
- `INSUFFICIENT PERMISSION`: the user cannot read the selected contracts.

## Boundaries

- Do not provide legal advice, decide enforceability, or infer unquoted terms.
- Do not send notices, create tasks, or update external systems.
- Do not change contract files, labels, or list records by default.

## Validation

Read `evals/evals.json` for analytical extraction, ambiguity, and action-
boundary cases. No live tenant or legal-review evidence exists for version 1.1.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## v1.1 maturation record

The analytical [learning ledger](benchmarks/learning-ledger-2026-09-01.json)
preserves the frozen v1.0 input, official-source constraint, review limits, and
the concrete activation-evidence revision. It is not a live tenant test.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
