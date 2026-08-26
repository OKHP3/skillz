---
name: Repo docs use CRLF line endings
description: Some tracked files (docs/CHANGELOG.md, .gitignore) are CRLF-terminated; the Edit tool's exact-match fails silently against them.
---

Confirmed on `docs/CHANGELOG.md` and `.gitignore` (`file <path>` reports "with CRLF line
terminators"). The `Edit` tool's `old_string` match requires exact bytes, including line
endings, so a normal `\n`-based `old_string` fails with "did not appear verbatim" even
when the visible text is correct.

**Why:** hit repeatedly across sessions on these two files specifically.

**How to apply:** if `Edit` unexpectedly fails to match on a file, run `file <path>` to
check for CRLF. If confirmed, do the edit via `CodeExecution` (impure `fs.readFile`,
string `indexOf`/`slice` with explicit `\r\n` in the search/replacement text, then
`fs.writeFile(path, content, 'utf8')`) instead of retrying `Edit`.
