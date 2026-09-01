---
name: okhp3-sharepoint-list-vendor-obligation-review
description: >
  Review a SharePoint List of vendors or obligations for supplied expiry,
  ownership, and compliance-field exceptions. Use when a controlled review
  needs next-review candidates and evidence without changing agreements or
  making legal conclusions. Do not use to determine compliance or take action.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only vendor and obligation exception review from a SharePoint List."
  out_of_scope: "Legal advice, compliance determination, contract action, or unapproved writes."
---

# okhp3-sharepoint-list-vendor-obligation-review

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Identify owner-supplied review exceptions in a vendor or obligation List,
including expiry windows, missing owners, required fields, and next review
dates. The result is a review queue, not a contract or compliance decision.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Portable core | Rule-led exception detection, evidence table, and owner routing |
| Host adapter | Reads accessible vendor or obligation List items only |
| Mutation | Read-only. Any record update requires a reviewed, explicitly confirmed action. |
| Evidence | Analytical design only. No live contract or compliance review has run. |

## Procedure

1. Confirm List, review date and time zone, expiry window, required fields,
   owner rules, and the designated business or legal reviewer.
2. Inspect accessible item fields. Do not infer a contract's terms from a title
   or filename.
3. Classify items as `EXPIRING`, `MISSING_OWNER`, `MISSING_REQUIRED_FIELD`,
   `NEXT_REVIEW_DUE`, `NEEDS RULE`, or `NEEDS INPUT` using supplied rules only.
4. Return:

   | Item | Observed date or field | Rule | Exception | Owner | Next review | Evidence |
   |---|---|---|---|---|---|---|

5. Validate each exception against a visible field and supplied rule. Route
   interpretation or action to the named owner.

## Safe outcomes

- `NEEDS INPUT`: list, review clock, expiry rule, owner, or field meaning is missing.
- `NOT SUPPORTED`: required fields are unavailable to the host.
- `INSUFFICIENT PERMISSION`: the current user cannot inspect necessary records.

## Boundaries

- Do not determine legal compliance, obligation validity, or contract status.
- Do not contact vendors, amend agreements, or change compliance fields.
- Do not treat a missing file as evidence that an obligation does not exist.

## Validation

Use `evals/evals.json` to validate controlled exception reporting, missing-rule
handling, and legal-action refusal. No live tenant evidence exists.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
