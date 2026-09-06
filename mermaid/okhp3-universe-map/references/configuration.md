# Configuration and output contract

Requires Python 3.9+, standard library only. There are no HTTP requests, package
installs, Git commands, or external writes hidden in the script.

`schema` is 1. `sites` is a nonempty array with unique HTTPS `origin` values,
display `title`, and an explicitly selected local `index` file path. Relative paths (including
`..`) resolve from the configuration file; absolute local paths are supported.
This is a trusted local build configuration, not a filesystem sandbox. Select
only approved public search indexes; never run an untrusted configuration.
Remote URL inputs are rejected and index data must pass schema validation.
Each index contains either `entries` (OverKill Hill and AskJamie) or `pages`
(Glee-fully Tools). Each record needs `url` and nonempty `title`.
`description` and `parent` are optional. Extra search fields are ignored.
Use `max_children` from 1 to 18; `include_sections` defaults to false.
The input's locale is the view's locale; do not mix translated indexes.

Page URLs are canonical identifiers. IDs in Mermaid are stable SHA-256 prefixes.
Ordering follows canonical URLs, so edits to titles do not reshuffle the map.
Page titles and descriptions stay index-owned. A synthetic site root is an
unlinked grouping if the home page is absent from the index.

`overlay.pages` maps absolute indexed URLs to optional `parent` and `status`.
Origin-only homepage URLs normalize to a trailing slash in both indexes and
overlay references. Duplicate normalized overlay keys are rejected.
Parents must be another included absolute URL or concept ID. Root pages cannot have
parents. Missing parents and cycles fail. For an existing status registry,
derive this map from the registry through a site adapter before generation.
Do not hand-copy changing status values into competing maintained files.

`overlay.concepts` holds explicit records with `id: concept:kebab-case`, `title`,
configured `origin`, optional `parent`, and status `Planned`, `Shelved`, or
`Retired`. No URL is allowed. Omit shelved and retired concepts unless the owner
wants them displayed. Removing a published page does not invent a concept.

Outputs in a dedicated directory:

- Bounded `.mmd` diagrams, grouped by parent and split into chunks.
- `universe-map.html-fragment`: escaped Mermaid source plus ordinary linked lists.
  This is a fragment, not a complete page or self-contained renderer.
- `universe-map.json`: normalized nodes, excluded section records, input hashes,
  diagram membership, and explicit `render_status: not-run`.
- `DIAGRAMS.md`: staging registry. Its entries remain draft until render/review.

No records are silently dropped for size. All included nodes are represented
in the diagrams. Parent nodes repeat for context across chunks. Input hashes
include raw bytes, so rebuilding an index with volatile timestamps can change
provenance even when the map content stays identical.

`--write` updates only differing generated files and never deletes extra files.
Use a fresh staging directory when pagination or routes shrink; let an approved
site adapter replace its owned generated block after successful validation.
`--check` does not write and fails if any expected file differs or extras exist.

Ancestor inference accepts indexed URLs with or without a trailing slash. If both forms exist at the same depth, supply an explicit parent instead of guessing which page owns the child.
