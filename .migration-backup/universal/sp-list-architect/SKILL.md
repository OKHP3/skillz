---
name: sp-list-architect
description: >
  OverKill Hill P³ SharePoint List database architecture reviewer.
  Use when designing, reviewing, or hardening SharePoint Online Lists used as
  lightweight databases, controlled vocabularies, lookup-backed registries, or
  CMDB-lite data stores. Also activate when the user asks about list thresholds,
  indexed columns, lookup relationships, required fields, content types,
  attachments, offline sync, Quick Edit, SharePoint UI-only build constraints,
  or whether a SharePoint list setting is safe for database-like use. This is
  the authoritative SharePoint-list-as-database architecture skill for this repo
  -- use it even when the user only says "SharePoint list settings" or "list
  build".
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Review SharePoint Online list designs used as lightweight databases
    - Explain threshold, indexing, lookup, content type, and list setting tradeoffs
    - Translate Microsoft list limitations into practical UI-only build guidance
    - Flag settings that weaken governance, auditability, or future migration
  out_of_scope:
    - Automated SharePoint provisioning with PowerShell, Graph, SPFx, or PnP
    - Production database design outside SharePoint Online Lists
    - Security/legal/compliance approval beyond architecture risk notes
---

# sp-list-architect

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this skill to review SharePoint Online Lists that are intentionally being used as governed, database-like structures. The goal is not to pretend SharePoint is a relational database. The goal is to keep a SharePoint UI-only build inside known limits while preserving governance, queryability, and migration sanity.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| SharePoint Online Lists as controlled registries | SQL Server, Dataverse, ServiceNow, or full CMDB implementation |
| List/column settings chosen through SharePoint UI | PowerShell, SPFx, PnP, Graph automation |
| Indexing, lookup behavior, content types, Quick Edit, sync, attachments | Tenant security policy or legal records governance |
| CMDB-lite and portfolio list patterns | Transactional app backends or high-write workloads |

---

## Review Workflow

1. Read the local schema source before giving advice: `schema/v2-build-cards.md`, `schema/schema-fields.md`, `schema/v2-build-runbook.md`, and any relevant ADRs.
2. Classify the list's role: reference table, entity master, bridge list, evidence/audit list, hierarchy, or glossary.
3. Check permanent-name risks first: list URL name, internal column names, and v1/v2 collision decisions.
4. Check column types against SharePoint constraints. Pay special attention to multi-choice, multi-person, calculated, hyperlink, and multi-line fields because they limit indexing/filtering.
5. Check lookup behavior. Hard relationships should use Restrict Delete. Soft context links should use no enforcement. Cascade Delete is prohibited unless an ADR explicitly reverses that rule.
6. Check indexes against actual views and filters. Do not index every eligible column.
7. Check governance settings: attachments, folders, comments, Quick Edit, offline sync, content types, versioning, and search.
8. Produce a correction list split into `must fix before data load`, `should fix before broad use`, and `acceptable deviation if logged`.

---

## Platform Hard Limits

These are non-negotiable. No setting, admin override, or Microsoft support ticket changes them in SharePoint Online.

| Limit | Value | What breaks if exceeded |
|---|---|---|
| **List View Threshold (LVT)** | 5,000 items per view | View is blocked; users see throttle error |
| **Indexed columns per list** | 20 (hard) | Cannot create index 21; silent until you try |
| **Complex columns per view** | 12 (Lookup + Person/Group + Managed Metadata combined) | View render fails or drops columns |
| **Single line of text** | 255 characters | Truncated silently on save |
| **Multi-line text (plain)** | ~69,000 characters | Effectively unlimited for data use |
| **Enforce unique values** | Requires one index slot | Counts against the 20-index budget |
| **Lookup columns per list** | No hard limit on creation; 12 per view | View performance degrades; test before loading data |
| **Total user columns** | No hard limit; performance degrades at 300–400 | Forms slow; view rendering degrades |

---

## Default Traps (Settings That Are Wrong Out of the Box)

SharePoint applies these defaults silently. Every one requires deliberate action to correct on a database-pattern list.

**Trap 1 — Choice columns default to multi-select (Checkboxes).**
When you create a Choice column — including via post-CSV-import conversion — SP sets "Display choices using" to "Checkboxes (allow multiple selections)". A Checkboxes field stores multiple values as a delimited string. Partition keys, status fields, and any single-value vocabulary field must be explicitly set to **Drop-Down Menu**. This is the most common silent misconfiguration in SP list builds.

Fix: Edit Column → Display choices using → **Drop-Down Menu**. Also set: Allow 'Fill-in' choices → **No** for all controlled vocabulary fields.

**Trap 2 — Attachments are enabled by default.**
Database-pattern lists have no use for file attachments. Leaving them on creates ungoverned shadow storage.
Fix: List Settings → Advanced Settings → Attachments → **Disabled** → OK. Do before any data entry (disabling deletes existing attachments).

**Trap 3 — Automatic Index Management (AIM) is enabled by default.**
AIM starts auto-indexing columns when a list exceeds ~2,500 items. Auto-indexes consume the 20-index budget on columns SP picks, not columns you planned.
Fix: List Settings → Advanced Settings → Allow automatic management of indices → **No** → OK. Disable on every list with a deliberate index plan before data load.

**Trap 4 — Number columns default to Automatic decimal places.**
"Automatic" means SP decides the display format. An integer sort-order field may render as "10.00".
Fix: Set Number of decimal places to **0** for integer fields; **2** for currency-style fields.

**Trap 5 — Multi-line text sub-type is not visible in the column list.**
You cannot see whether a Multi-line field is Plain text, Rich text, or Enhanced rich text from the list settings column list. Rich text and Enhanced rich text store HTML in the field value (breaking CSV exports and API consumers).
Fix: Verify and explicitly set Plain text in Edit Column for every Multi-line field.

**Trap 6 — Lookup Restrict Delete is opt-in and hidden behind two checkboxes.**
"Enforce relationship behavior" is unchecked by default. Without it, deleting a parent item leaves orphaned child lookup values (empty, not cascaded).
Fix: Edit Column → Relationship → Enforce relationship behavior → **checked** → Delete behavior → **Restrict Delete**. Never select Cascade Delete on production lists.

**Trap 7 — "Allow management of content types" may be on.**
Adds a visible Content Type field to forms and complicates the column editing UI unnecessarily for single-content-type lists.
Fix: List Settings → Advanced Settings → Allow management of content types → **No**.

**Trap 8 — Append-Only text requires versioning enabled first.**
Setting Append Changes to Existing Text = Yes on a list without versioning enabled is silently ignored or throws an error depending on SP version.
Fix: Enable versioning (List Settings → Versioning Settings → Yes) before setting any column to Append-Only.

---

## Column Type Decision Matrix

| Need | Column type | Critical settings |
|---|---|---|
| Short identifier / code (≤ 255 chars) | Single line of text | Enforce unique values: Yes if globally unique |
| Long text, notes, definition | Multiple lines of text | Text type: **Plain text**; Append-Only: No unless audit log |
| Controlled single-value vocabulary | Choice | Display: **Drop-Down Menu**; Fill-in: **No** |
| Boolean flag | Yes/No | Set default (Yes or No) explicitly |
| Integer count / sort order | Number | Decimal places: **0** |
| FK to another list (hard / required) | Lookup | Enforce relationship: Yes; Delete: **Restrict Delete** |
| FK to another list (soft / enrichment) | Lookup | Enforce relationship: No (soft link, may go null) |
| Self-referential hierarchy (parent) | Lookup → same list | Enforce: Yes; Delete: Restrict Delete |
| Named person | Person (People only) | Do not use "People and Groups" unless groups needed |
| URL | Hyperlink | Renders clickable in modern experience |
| Migration provenance (hidden post-load) | Single line of text | Set Hidden = Yes after data load |
| Time-stamped audit note | Multiple lines (Append-Only) | **Versioning must be enabled first** |

---

## Beachhead CSV Import Pattern

The only safe way to control SharePoint internal column names via the UI.

SharePoint locks internal column names at column creation time. A column created as "Reference Group" gets internal name `Reference_x0020_Group` permanently. You cannot change it without deleting and recreating the column.

**The pattern:**
1. Create a header-only CSV with exactly the PascalCase internal names you want (e.g., `ReferenceGroup`, `SortOrder`, `IsActive`).
2. Import the CSV to SharePoint — this creates the list with clean internal names locked in.
3. All columns import as Single Line of Text — this is correct.
4. Execute post-import conversion: change each column to its final type in the SP column Edit Column UI.
5. Rename display names (not internal names) after conversion.

**Column naming rules:** PascalCase, no spaces, no special chars, max 32 chars. Suffix `Id` for lookup columns (e.g., `ParentOrgId`). Suffix `Date` for date fields.

---

## Index Strategy

- **Create all indexes before loading data.** Indexing an existing large list runs as an online background operation; until complete, views using that column throttle.
- **Disable Automatic Index Management before data load** on any list with a deliberate index plan.
- **Compound indexes** (primary + secondary column) count as one of the 20 slots. Use when a view always filters by two fields together.
- **"Enforce unique values" consumes one index slot.** Budget accordingly.
- **Lookup column indexes do not help LVT.** Indexed lookup columns improve view performance but do not exempt lookup filters from the 5,000-item threshold in all scenarios. Test before relying on them for LVT-threatened lists.

---

## SharePoint List Database Rules

Use these rules as defaults unless the repo schema or an ADR says otherwise:

- SharePoint is a constrained list store, not a relational database. Use it for governed registries, not high-volume transactional writes.
- Internal names and list URLs are sticky. Correct URL and internal column names before importing or creating data.
- List View Threshold matters at 5,000 items. Design indexed views before loading large lists.
- Index selectively. Prioritize columns used for filters, sorts, relationship enforcement, and operational views.
- Avoid multi-choice for partition keys. Multi-choice fields are poor keys for filtering, indexing, migration, and downstream reporting.
- Avoid Cascade Delete in governance data. It can silently remove dependent rows that should remain auditable.
- Prefer Restrict Delete for hard dependencies. It blocks parent deletion while dependent rows exist.
- Use no enforcement for soft enrichment links. Optional context pointers should not block source-row maintenance.
- Disable attachments for database-like lists unless the list is explicitly an evidence repository.
- Disable folders unless folder grouping is a conscious information architecture decision. Metadata beats folders for database-style filtering.
- Consider disabling Quick Edit for governed reference and master lists after initial build. Bulk edit is useful during build but can bypass careful form review.
- Consider disabling offline sync for governed lists. Offline edits increase drift and conflict risk for controlled vocabularies.
- Use list descriptions and column descriptions where they reduce future build errors. Empty descriptions are not schema blockers, but they weaken maintainability.

---

## CMDB-Lite Defaults

For this repo:

- Use `schema/v2-build-cards.md` as the field-level build reference.
- Use `schema/v2-build-runbook.md` for sequence and gates.
- Log actual SharePoint deviations in `schema/v2-delta.md`.
- Preserve v1 source context and migration provenance with `SourceSystem` and `SourceRecordKey`.
- Treat `ReferenceValues` as a governed reference table. It should favor single-value choice fields, indexed filters, attachments off, no folders, and limited casual editing.
- Treat `BusinessCapabilities` as large-list sensitive. Required indexes must exist before the 6,652-row load.

---

## Reference Loading

- `references/sp-list-db-rules.md` — exact limitations, Microsoft-source-backed rules, and per-setting guidance. Read when the task requires specific numbers, UI paths, or a decision about an individual Advanced Settings toggle.

Read the reference file when: you need the exact navigation path to a setting, you are unsure about an edge case (e.g., whether a lookup index helps LVT), or you are producing a build card that needs to specify every option on a settings page.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
