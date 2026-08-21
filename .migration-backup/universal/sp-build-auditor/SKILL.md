---
name: sp-build-auditor
description: >
  OverKill Hill P³ SharePoint List build screenshot auditor.
  Use when reviewing screenshots of SharePoint Online list settings, column
  settings, indexed columns, content types, views, or Advanced Settings against
  a repo schema, build card, runbook, ADR, or CSV header. Also activate when the
  user says they captured SharePoint build screenshots, asks whether a list or
  column was configured correctly, points to arrows/markups in images, or needs
  a defect list before continuing manual SharePoint build work. This is the
  authoritative screenshot-review skill for this repo's UI-only SharePoint
  build process.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Review SharePoint list and column settings screenshots
    - Compare screenshots against build cards, schema fields, and CSV headers
    - Interpret user arrows, highlights, and markups in UI screenshots
    - Produce fix-before-load and log-as-deviation findings
  out_of_scope:
    - Direct SharePoint changes
    - Image editing or redrawing screenshots
    - Automated browser control of a live SharePoint tenant
---

# sp-build-auditor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this skill to audit SharePoint UI screenshots captured during a manual list build. It turns screenshots into actionable build findings by comparing the visible UI settings against the repo's build cards, schema, and ADR decisions.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Screenshot review for list settings, column settings, indexes, views, and content types | Making live SharePoint changes |
| Matching UI evidence to `schema/v2-build-cards.md` | Replacing human site-owner approval |
| Finding sticky-name, type, required, hidden, index, and delete-behavior issues | Optical perfection or image cleanup |
| Producing build corrections and `v2-delta.md` notes | Full data migration validation |

---

## Audit Workflow

1. Inventory the screenshot folder. Preserve filename order and list every image reviewed.
2. Read the matching build card from `schema/v2-build-cards.md`.
3. Read the matching field section from `schema/schema-fields.md` if the card is ambiguous.
4. Read the beachhead CSV header for the list and confirm screenshots do not imply extra/missing columns.
5. Inspect each screenshot visually. Pay attention to user arrows, brackets, circles, and highlighted options.
6. For each visible setting, classify it as `matches build card`, `must fix before data load`, `should fix before broad use`, `acceptable deviation if logged`, or `needs another screenshot`.
7. Produce a concise findings table with screenshot filename, UI evidence, expected setting, actual setting, severity, and action.
8. If the finding changes schema intent, recommend an ADR or `v2-delta.md` note. If it only corrects execution, recommend a SharePoint UI fix.

---

## Critical Platform Constraint — Choice Columns Cannot Be Indexed

**Choice columns (single-select or multi-select) cannot be indexed in SharePoint Online.** The Edit Index UI does not offer Choice columns in the Primary Column dropdown. Any build card or plan that lists a Choice column as a planned index is incorrect and must be corrected before build.

**Indexable types:** Single line of text, Number, Date and Time, Yes/No, Lookup, Person/Group, Managed Metadata.
**Non-indexable types:** Choice, Multiple lines of text, Hyperlink, Calculated, Currency.

**Impact on auditing:** When reviewing an Indexed Columns screenshot, do not flag the absence of a Choice column as a missing index. Flag it as a build card correction required. If the builder created an index on an alternative non-Choice column instead, evaluate whether that substitution is documented and intentional.

---

## What To Check

For list-level screenshots:

- URL and display name;
- description;
- content type management;
- attachments;
- comments;
- folders;
- search visibility;
- offline sync;
- Quick Edit;
- automatic index management;
- default view and mobile default view;
- indexed columns.

For column screenshots:

- display name and inferred internal name;
- final column type;
- required flag;
- unique values flag;
- max length or decimal places;
- default value;
- choice values;
- single-choice vs multi-choice display mode;
- fill-in choices;
- multi-line plain/rich/enhanced text;
- append changes;
- hidden status from content type page where available;
- index status where visible.

---

## Severity Rules

| Severity | Use when |
|---|---|
| `P0 stop build` | Sticky URL/internal name is wrong, wrong list created, or wrong column exists that would require rebuild. |
| `P1 fix before data load` | Column type, multi-choice vs single-choice, required setting, lookup behavior, index, or attachment setting conflicts with schema. |
| `P2 fix before broad use` | Governance setting weakens reliability but does not corrupt data immediately, such as Quick Edit or offline sync. |
| `P3 document` | Acceptable deviation, empty descriptions, or useful extra index that should be logged. |

---

## ReferenceValues Confirmed Findings (2026-06-30 Screenshot Review)

From the `analysis/artifacts/build-screenshots/01_ReferenceValues/` set reviewed in session `sp-build-findings.md`:

| Screenshot | Finding | Severity | Action |
|---|---|---|---|
| `ReferenceGroup.png` | Display choices using = **Checkboxes** (multi-select). Expected: Drop-Down Menu (single-select). | P1 fix before data load | Edit Column → Display choices using: Drop-Down Menu; Fill-in: No |
| `SourceSystem.png` | Display choices using = **Checkboxes** (multi-select). Expected: Drop-Down Menu. | P1 fix before data load | Edit Column → Display choices using: Drop-Down Menu; Fill-in: No |
| `SortOrder.png` | Number of decimal places = **Automatic**. Expected: 0. | P1 fix before data load | Edit Column → Decimal places: 0 |
| `ValueLabel.png` | Description field empty. Max chars = 255 (correct for Single line of text). | P3 document | Add description text to column |
| `Definition.png` | Text type = Plain text (correct). Description empty. | P3 document | Add description text |
| `MapsFromValues.png` | Text type = Plain text (correct). Description empty. | P3 document | Add description text |
| `adv-01.png` | Attachments = **Enabled**. Expected: Disabled. | P1 fix before data load | List Settings → Advanced Settings → Attachments: Disabled |
| `adv-02.png` | Automatic Index Management = **Yes**. Expected: No for lists with manual index plan. | P1 fix before data load | List Settings → Advanced Settings → AIM: No |
| `indexes.png` | Index being created on `Reference Code` (Single line of text). Build card listed `ReferenceGroup` as an index — but **ReferenceGroup is a Choice column and cannot be indexed**. The builder discovered this at build time. `ReferenceCode` is a valid substitute. `IsActive` should also be indexed. | Build card correction required | Remove `ReferenceGroup` from Card 01 index list; add `ReferenceCode` as deliberate index substitute; confirm `IsActive` is indexed |
| `content-type.png` | Content type management appears enabled. Single content type "Item" present. `IsActive` shows Optional. | P3 document | IsActive is required per build card — verify required setting is confirmed in Edit Column, not only in content type view |

---

## Reference Loading

Read `references/shot-review.md` when reviewing a new screenshot folder or when the user asks for image-by-image findings.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
