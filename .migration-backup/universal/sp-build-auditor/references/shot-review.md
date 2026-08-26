# SharePoint Build Screenshot Review Protocol

Use this protocol to review a folder of SharePoint build screenshots.

## Inputs

- Screenshot folder, usually under `analysis/artifacts/build-screenshots/<list-folder>/`
- Matching build card in `schema/v2-build-cards.md`
- Matching field section in `schema/schema-fields.md`
- Matching beachhead header in `analysis/artifacts/beachhead-headers/`
- Relevant ADRs from `context/decisions/`

## Review Steps

1. List all image files and preserve filenames in the review output.
2. Inspect list-level screenshots first:
   - settings page;
   - advanced settings;
   - versioning settings;
   - indexed columns;
   - content type page;
   - default view settings.
3. Inspect every column screenshot:
   - compare type, required, default, and options against the build card;
   - check user arrows and circles as explicit questions;
   - note invisible fields that can only be verified from content type or settings pages.
4. Compare actual columns in the settings screenshot to the beachhead CSV header.
5. Classify every mismatch by severity.
6. End with a "Before continuing build" checklist.

## Output Format

Use this table:

| Screenshot | Evidence in image | Expected | Actual | Severity | Action |
|---|---|---|---|---|---|

Then add:

- `Must fix before data load`
- `Should fix before broad use`
- `Acceptable if logged`
- `Need another screenshot`

## Common Screenshot Traps

- SharePoint shows display names, not internal names.
- A renamed Title column still has internal name `Title`.
- Content type required/hidden status can differ from the column edit page.
- Choice fields can accidentally become multi-choice when "Checkboxes" is selected.
- Yes/No required behavior may be less visible than text/choice required behavior.
- Index page may show the index being edited rather than all indexes currently present.
- Advanced Settings often leave attachments, comments, sync, and Quick Edit enabled by default.

## Review Bias

Bias toward stopping before data load for any setting that affects:

- internal name;
- URL name;
- column type;
- single vs multi value;
- required status of governance keys;
- lookup delete behavior;
- indexing needed before threshold-sensitive loads.
