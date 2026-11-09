# Source, version, and delivery record

Load when selecting multiple references, generating revisions, or saving files.
Keep the record private unless the user explicitly requests a sanitized public
record. Do not persist personal source locators in a public repository.

## Minimal record

- Brief: intended use, approved defaults, explicit requested change.
- Sources: ID, supplied/authorized scope, inspected yes/no, durable locator when
  available, recency supplied/unknown, role, coverage limitations.
- Versions: ID, parent version, actual reference-role mapping, prompt summary,
  available editor/run ID, changed features, inspection results.
- Files: relative name, byte size and digest when accessible, version, stable
  artifact ID or user-retrievable location, verification evidence.
- Counts: supplied, inspected, generated, file copies, unique bytes, delivered.
- Exceptions: unavailable source, uninspected output, unresolved likeness issue,
  incomplete transfer, provider sync unverified.

A manifest should map old locators to new ones if an authorized relocation occurs.
Keep version attribution and original source provenance after a filename changes.

## Bounded delivery of new artifacts

Resolve the exact destination, confirm its scope, inspect collision state, and
copy new artifacts without overwriting existing files. Read back the result.
For local files compare byte size and compatible cryptographic digests where
available. For a host upload verify the returned artifact is retrievable with
the intended audience; an upload-start message is not completion.

Keep distinct generated versions and duplicate originals unless separately
instructed. Distinguish 12 file copies from 9 unique byte sequences when relevant.
Do not infer semantic duplication from a matching basename.

This workflow does not authorize deleting or moving existing originals.
If relocation is requested, preserve a recovery map and use the applicable
approved records workflow. Record-location reconciliation excludes copy-delete
migrations; do not use it as a blanket authorization for such a migration.
A verified local destination does not establish cloud upload or sync completion.
