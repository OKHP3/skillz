# Library skill pattern

Choose this pattern when the task acts on files, document metadata, folders, or
the content of selected documents in one named document library.

## Required context

- Site and library name/URL or unambiguous host selection.
- Selected files/folders or a tight inclusion filter; never assume the whole
  library.
- Audience, lifecycle/publishing state, and controlled metadata/taxonomy.
- Read permission for analysis and the separately expected permission for any
  supported write.

## Required output fields

Use a table that identifies the file, observed evidence, recommendation, status,
and review requirement. A write proposal also names the exact file and every
field/value or file action before requesting approval.

## Do not collapse these concepts

| Keep distinct | Why |
| --- | --- |
| Content evidence and metadata recommendation | A useful recommendation is not proof that the metadata may be changed. |
| Duplicate candidate and deletion/archive decision | Similar files are not authority to remove material. |
| Selected scope and library-wide rule | A test selection does not authorize a bulk pass. |
| Draft and applied document change | A draft remains a draft until supported action, permission, and approval are all present. |
