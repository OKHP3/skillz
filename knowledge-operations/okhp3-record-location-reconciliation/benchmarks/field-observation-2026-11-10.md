# Read-only field observation | November 10, 2026

Record Location Reconciliation v0.1.0 was used in Codex on macOS to verify
an earlier reconciliation in a private synced library. The operator selected
the skill and limited the check to a consolidated folder, its nested archive,
two retained DOCX versions, and their references in a knowledge base. The
installed package had been compared with the [version-matched Skillz source](https://github.com/OKHP3/skillz/tree/fab0facb99460cab8bfb262a22cdb1ae349e4d13/knowledge-operations/okhp3-record-location-reconciliation).

| Check | Observed result |
| --- | --- |
| Placement and identity | The consolidated folder and nested archive were present at the recorded locations. The superseded locations were absent on both surfaces. The scoped files matched the recorded cloud item IDs and digests. |
| Version preservation | Each DOCX matched its own prior SHA-256 and cloud item ID. The two files had identical main-document paragraph text and differed in package bytes, formatting, and metadata. |
| Current references | The scoped knowledge-base links resolved by cloud item ID. The checked file-path references resolved locally and in the synced drive. |
| Authority | The verification used read operations on the local files, cloud metadata, and knowledge-base page. |

Repeat local and cloud reads agreed. A shared point-in-time snapshot and a
complete cross-system change record were unavailable. The agreement therefore
describes separate observations at the times of the reads. Simultaneous parity
remains unverified.

This is a single field observation. Graded benchmarking, automatic skill
discovery, write behavior, and a protected holdout were outside its scope.
Private source records were used for the comparison. This public summary
omits their identifiers, names, paths, links, and digests.
