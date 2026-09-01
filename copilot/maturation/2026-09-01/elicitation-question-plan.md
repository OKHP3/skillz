# SharePoint List Skill Maturation Question Plan

## Purpose

Elicit the minimum owner-confirmed requirements needed to turn the twelve
analytical SharePoint List skill packages from a sound generic contract into
site-tested host adapters. No interview has taken place; these are questions,
not confirmed facts.

## Common questions

1. Which named List, selected-item scope, and user role should each workflow
   support first?
2. Which fields are visible to the intended user, and which field identities
   are authoritative rather than inferred from display labels?
3. Which operation is read-only, proposed-only, or actually permitted after a
   user confirms it?
4. Which business rule, owner, time zone, source, and exception rule is
   authoritative for this site?
5. What should the user see when the current Copilot in SharePoint surface does
   not expose the necessary List capability?

## Package-specific probes

| Skill outcome | Highest-value question |
|---|---|
| Intake normalization | Which fields and controlled values have deterministic mappings? |
| Schema and view health | Which configuration facts are visible in the target Copilot surface? |
| Request triage | Which approved routing rules cover each intake category? |
| Risk and issue review | Which ranking and escalation rules are authoritative? |
| Decision-log curation | What proves an approval, authority, and effective date? |
| Meeting-action registration | What qualifies as an explicit commitment and duplicate action? |
| Duplicate review | Which matching key and owner decide a duplicate? |
| SLA watchlist | Which clock, time zone, calendar, and status rules govern a breach? |
| Data-quality review | Which required, unique, relationship, and quality rules are authoritative? |
| Portfolio brief | Which health rule and reporting population are approved? |
| Vendor obligation review | Which review date, expiry window, and authorized owner apply? |
| Knowledge-gap log | Which impact scale, research boundary, and content owner apply? |

## Evidence rule

Record confirmed answers with an owner and date. Keep uncertain responses as
`NEEDS INPUT`; no answer should be inferred from a prompt, existing List item,
or a general SharePoint convention.
