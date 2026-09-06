# Universe map skill validation, 2026-09-06

Version: 0.1.0. Evidence: local generator checks and independent source review.
No matched agent benchmark, unseen holdout, deployment, or GitHub publication.

## Delivered

Canonical package: `mermaid/okhp3-universe-map/`. Eleven core files copied and
SHA-256 verified in OverKill Hill, Glee-fully Tools, and AskJamie under
`.agents/skills/okhp3-universe-map/`. Site-owned `universe-map.config.json` and
`assets/docs/universe-map-skill.md` provide independent invocation instructions.
The promotion manifest records the package hashes and pre-sync state.

## Checks

- 11 Python regression tests passed, including both index formats, optional
  sections, planned nodes, missing parents, cycles, duplicates, hostile labels,
  unsafe URLs, dense splitting, deterministic output, removal, and read-only checks.
- Package structural validator passed with an advisory for no explicit Scope heading.
- Real indexes: OverKill Hill 31 page nodes and 129 excluded section records;
  Glee-fully Tools 60 page nodes; AskJamie 25 page nodes. Exact node coverage passed.
- All 17 generated diagrams rendered to SVG using the installed Chromium and
  local vendored Mermaid runtime. A real Glee-fully diagram was also displayed
  through the available Mermaid Chart tool.
- All three existing index freshness checks passed after staging fragments were
  named `.html-fragment`, preventing accidental indexing of generated previews.
- Generated output freshness and byte equality across all three copies passed.
- Independent reviewer reproduced two defects: orphan section parent fallback
  and malformed object handling. Both were corrected and regression-tested.

## Catalogs and limitations

Skillz distribution catalog and Forge catalog rebuilt: 342 skills, 20 families.
Existing catalog warnings remain for imported skills missing versions and three
unresolved companion references. OverKill Hill and Glee-fully local catalogs
refreshed. AskJamie catalog generation is blocked by its existing
`okhp3-repl-repo-janitor copy` folder, whose skill name duplicates
`okhp3-repl-repo-janitor`. That unrelated folder was preserved.

The package generates staged Mermaid, linked HTML fragments, data, and a draft
registry. Published universe pages and CI workflows have not been replaced.
The integration reference covers after-index invocation, avoiding search feedback,
page-source insertion, safe link rendering, and peer-refresh triggers. Those
site adapters remain the next integration step. Render checks establish syntax,
not final site layout, theme contrast, or keyboard navigation acceptance.

## Version 0.1.1 portability follow-up

Git checkout converted some text files to CRLF after version 0.1.0 publication.
The package now contains `.gitattributes` with `* text eol=lf`; all 12 core
files were normalized and raw SHA-256 equality verified across four locations.
The 11 regression tests passed again. Generator API and diagram behavior are
unchanged; package version and matching evaluation version are 0.1.1.
The canonical package is published through PR76; this portability correction
is a subsequent reviewed patch. Site integration proceeds in separate PRs.


### Universe map 0.1.2 regression fixes

Canonicalize origin-only homepage URLs and reject output directories anywhere inside the skill package. All 13 regression tests pass, including duplicate homepage detection and nested package output rejection in write/check modes. All 12 core files synchronized to the three site repositories.

This is a chronological validation record: the initial 0.1.0 results above are followed by the 0.1.1 and current 0.1.2 validation addenda.


### Universe map 0.1.3 overlay normalization

Normalize homepage URLs consistently across index, overlay keys, page parents, and concept parents. Reject duplicate canonical overlay keys and foreign-origin references. All 15 regression tests pass, including uppercase HTTPS origins and default-port normalization. Canonical origins are applied consistently to indexes and overlays; whitespace remains explicitly rejected. Site copies synchronize after review.


### Universe map 0.1.4 loose-end review

Fix slashless ancestor inference and require explicit parents for ambiguous slash aliases. Clarify trusted local index file selection, including absolute and parent-relative paths; reject malformed paths and remote URLs. All 18 regression tests pass. Closes remaining PR76 review findings.
