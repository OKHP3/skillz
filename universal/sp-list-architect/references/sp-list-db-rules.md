# SharePoint Online List Database Rules

Use this reference when reviewing SharePoint Online Lists used as lightweight databases or governed registries.

## Primary Sources

- Microsoft Learn, SharePoint Online limits: https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits
- Microsoft Support, working with the List View Threshold: https://support.microsoft.com/en-us/office/working-with-the-list-view-threshold-limit-for-all-versions-of-sharepoint-4a40bbdc-c5f8-4bbd-b9b6-745daf71c132
- Microsoft Support, add an index to a list or library column: https://support.microsoft.com/en-us/office/add-an-index-to-a-list-or-library-column-f3f00554-b7dc-44d1-a2ed-d477eac463b0
- Microsoft Support, create list relationships by using lookup columns: https://support.microsoft.com/en-US/SharePoint/lists/data-and-lists/create-list-relationships-by-using-lookup-columns

## Practical Limits

| Area | Practical rule |
|---|---|
| List View Threshold | Treat 5,000 items as the point where indexed views become mandatory. |
| Large lists | Create indexes before loading large data, especially before threshold-sensitive sizes. |
| Indexed columns | Stay under SharePoint's indexed-column cap. Do not spend indexes on fields that are not filtered or sorted. |
| Lookup columns | Count lookup and person/group columns carefully. Lookup columns affect list complexity and view behavior. |
| Multi-value fields | Avoid multi-choice and multi-person fields as keys. They are harder to filter, index, export, and migrate. |
| Attachments | Disable for database-like lists unless attachments are the point of the list. |
| Folders | Disable for database-like lists unless an ADR says folders are part of the information architecture. |
| Quick Edit | Useful during build, risky for governed master/reference data after go-live. |
| Offline sync | Useful for document collaboration, risky for controlled reference data and registry lists. |

## Hard Platform Limits (SharePoint Online)

| Limit | Value | Notes |
|---|---|---|
| List View Threshold | 5,000 items per view | Hard. Cannot be raised in SPO. |
| Indexed columns per list | **20** | Hard. "Enforce unique values" and AIM auto-indexes both consume slots. |
| Complex columns per view | **12** | Lookup + Person/Group + Managed Metadata combined. Exceeding causes view failure. |
| Single line of text | **255 characters** | Hard ceiling. Switch to Multi-line for longer content. |
| Multi-line text (plain) | ~69,000 characters | Effectively unlimited for data use. |
| Total columns per list | 2,000 (practical: 300–400) | Performance degrades well before hard limit. |

---

## Column Type Indexability

**Not all column types can be indexed.** Attempting to index a non-indexable column type fails silently or shows no option in the UI.

| Column Type | Can be indexed? | Notes |
|---|---|---|
| Single line of text | **Yes** | |
| Number | **Yes** | |
| Date and Time | **Yes** | |
| Yes/No | **Yes** | |
| Lookup | **Yes** | Helps view performance; does not fully bypass LVT in all scenarios |
| Person/Group | **Yes** | |
| Managed Metadata | **Yes** | |
| **Choice** | **NO** | Choice columns CANNOT be indexed in SharePoint Online. Neither single-select nor multi-select. |
| Multiple lines of text | No | |
| Hyperlink | No | |
| Calculated | No | |
| Currency | No | |

**Build card impact:** Any index listed against a Choice column in a build card is physically impossible to create. Remove all Choice columns from index lists. Where query performance on a Choice field is needed at LVT scale, design around that constraint using views filtered on indexable columns.

---

## Advanced Settings UI Navigation Paths

All paths start from: **List Settings gear → List settings**

| Setting | Navigation path | Database-pattern value |
|---|---|---|
| Attachments | List Settings → Advanced Settings → Attachments | **Disabled** |
| Automatic Index Management | List Settings → Advanced Settings → Allow automatic management of indices | **No** |
| Content type management | List Settings → Advanced Settings → Allow management of content types | **No** |
| Folders | List Settings → Advanced Settings → Make "New Folder" command available | **No** |
| Comments | List Settings → Advanced Settings → Allow comments | No |
| Dialogs | List Settings → Advanced Settings → Launch forms in a dialog | No |
| Versioning | List Settings → Versioning settings → Create a version each time you edit an item | Yes only if Append-Only or audit history needed |
| Indexed columns | List Settings → Indexed columns → Create a new index | Create after schema confirmed, before data load |

---

## Default Traps (Settings That Are Wrong Out of the Box)

**Trap 1 — Choice columns default to Checkboxes (multi-select).**
SP defaults all Choice columns to "Display choices using: Checkboxes (allow multiple selections)" including those created via post-CSV-import conversion. Single-value fields must be explicitly set to Drop-Down Menu. Multi-select breaks filtering, grouping, Power BI, and migration on partition keys and status fields.

Fix: Edit Column → Display choices using → **Drop-Down Menu**; Allow 'Fill-in' choices → **No**.

**Trap 2 — Attachments enabled on all new lists.**
Database-pattern lists have no use for file attachments. They create ungoverned shadow storage outside the data model.

Fix: List Settings → Advanced Settings → Attachments → **Disabled** → OK. Do before any data entry.

**Trap 3 — Automatic Index Management (AIM) enabled by default.**
AIM begins auto-indexing columns when a list exceeds ~2,500 items. Auto-indexes count against the 20-slot budget. On lists with a deliberate index plan, AIM may consume slots on unplanned columns.

Fix: List Settings → Advanced Settings → Allow automatic management of indices → **No** → OK. Do before data load on all lists with a manual index plan.

**Trap 4 — Number columns default to Automatic decimal places.**
Integers render as "10.00" in some SP view configurations.

Fix: Set Number of decimal places to **0** for integer fields during post-import conversion.

**Trap 5 — Multi-line text sub-type not visible in column list.**
Rich text and Enhanced rich text store HTML markup in the field value. Plain text is the correct type for database data fields.

Fix: Edit Column → verify or set text type to **Plain text** for every Multi-line column.

**Trap 6 — Lookup Restrict Delete is opt-in behind two checkboxes.**
Without checking "Enforce relationship behavior," parent items can be deleted leaving orphaned child lookup values.

Fix: Edit Column → Relationship → Enforce relationship behavior: **checked** → Delete behavior: **Restrict Delete**. Never Cascade Delete.

**Trap 7 — Append-Only text silently fails without versioning.**
Setting Append Changes to Existing Text = Yes on an un-versioned list is silently ignored.

Fix: Enable versioning (List Settings → Versioning Settings → Yes) **before** setting any column to Append-Only.

---

## Indexed Column Design

Index columns used by:

- default view filters;
- large-list filters;
- common operational filters;
- relationship enforcement;
- recurring sort/filter patterns in validation, migration, or Power BI extracts.

Do not index:

- narrative fields;
- multi-line text;
- casual display-only fields;
- every lookup just because it is a lookup;
- columns that are never used in views or filters.

## Lookup Delete Behavior

Use this decision table:

| Relationship type | Delete behavior | Rationale |
|---|---|---|
| Parent/master to child/bridge | Restrict Delete | Prevents deleting parent rows while dependent rows exist. |
| Self-referential parent hierarchy | Restrict Delete | Prevents orphaning children. |
| Canonical/successor/predecessor link | Restrict Delete if structural; no enforcement if informational | Depends on whether the link defines identity or only context. |
| Optional glossary/evidence context link | No enforcement | Avoids blocking maintenance of soft contextual links. |
| Audit/evidence relationship | Usually Restrict Delete | Preserves source context before destructive changes. |
| Cascade Delete | Prohibited by default | Silent dependent deletion violates governance and audit goals. |

## UI Settings Checklist

For each list, check:

- list URL name;
- display name;
- list description;
- content type management;
- attachments;
- comments;
- folders;
- search visibility;
- offline sync;
- Quick Edit;
- automatic index management;
- default view columns;
- column order in content type;
- hidden columns;
- indexed columns.

## Red Flags

- A partition key or governance key is set as multi-choice.
- A required field appears optional in the content type.
- A Yes/No governance field lacks a default.
- A large list is loaded before indexes exist.
- Attachments are enabled on a master/reference table.
- Cascade Delete is selected.
- Lookup conversion is delayed until after dependent data load.
- A field is renamed only at display level but downstream docs assume the internal name changed.
