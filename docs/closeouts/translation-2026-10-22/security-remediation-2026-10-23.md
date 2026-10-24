# PR 196 security remediation

This supersedes the blocked security outcome in `security-checkpoint.md`.
It records repairs and scanner limitations separately. Final GitHub run and
integration receipts are recorded after those actions succeed.

## Reproduction and parser coverage

The exact committed package at `eb2ede6726509edc95af1685ab6f59e9f0010613`
was staged with all 23 tracked files. The NVIDIA 2.13.0 wheel and dependency
metadata matched the failed CI pins. A no-LLM local scan reproduced its
`static_parse_limit`: a shell parser treated backticks in the valid Python
`INLINE_CODE_RE` expression as an unterminated shell word. Python parsed the
file successfully. No script reference was removed to conceal the gap.

The official [NVIDIA 2.13.1 maintenance release](https://github.com/NVIDIA/SkillSpector/releases/tag/v2.13.1)
published on October 23 includes host-language quote-ownership corrections.
Its official wheel SHA-256 is
`d6bca3b4cd694847634b18d307880797841aa67870e57ce08ff5eacd25bd6ca8`.
Scanning the unchanged candidate with that verified release completed all
23 files with no partial files, exclusions, exceptions, or limitations.
The existing workflow resolves official stable releases; its pin and policy
remain unchanged. No local scanner patch or rule suppression was used.

## Historical claim erratum

The remaining MP3 high finding matched the words “new name is” in a historical
package-naming assessment. It contained no instruction to alter agent identity,
memory, or authority. Independent review also identified an incorrect count.
The package identifier is 29 characters, including its hyphens.

- File: `language-mediation/okhp3-translation-en-us-fr-fr/benchmarks/equilibrium-review-2026-08-30-v1.json`.
- Original revision: `eb2ede6726509edc95af1685ab6f59e9f0010613`.
- Original file SHA-256: `f243ce8765b0aa5f17a4ce6b8044d93570b08f6f7dc938a9f5f311472507221c`.
- JSON pointer: `/initial_reviews/0/material_findings/0/claim`.
- Before: “The new name is 30 lowercase ASCII characters, matches its directory, carries the okhp3 prefix, and states the exact source-target pair.”
- After: “The package identifier okhp3-translation-en-us-fr-fr contains 29 ASCII characters, uses lowercase letters and hyphens, matches its directory, carries the okhp3 prefix, and states the exact source-target pair.”

The record includes a dated erratum and retains its historical classification,
old family decision, limitations, and other claims. The original bytes remain
available at the named Git revision. No benchmark, test, reference, or evidence
file was relocated or excluded from the package scan.

## Actual safety repairs and regression evidence

The independent safety reviewer found manifest/control symlinks and planner
artifact symlinks could escape their declared directories. New regression
subcases reproduced six failures before repair. The validator now checks
resolved control containment; the planner reuses that check for roots and checks
each source/target artifact before hashing. These checks prevent stable symlink
escapes in the local workspace; they do not claim race-free hostile-filesystem
isolation. Explicit user-supplied CLI source/target paths remain explicit inputs.

The package now declares its read, separate draft/record write, and local helper
execution scope. Every subprocess regression still exercises the actual CLI,
using a fixed interpreter and bundled script in an argument array. Each call
now states `shell=False`, has a ten-second timeout, and uses Python `-B`.
All twelve French tests pass, including invalid/null controls, review gates,
pair boundaries, token drift, and symlink escape cases.

The final local NVIDIA scan completed all 23 files with zero high or critical
findings. The AS3 medium result on a historical Foundry source locator is inert
provenance, not skill enumeration. AST4 medium results still expose every
subprocess test call; fixed argv, shell disabling, timeouts, and temporary
fixtures bound their behavior. These classifications remain visible in the raw
report. The unchanged policy allows complete scans with only lower-severity
findings; this is not a claim that no findings exist or that static scanning
certifies safety.

Raw before/after reports, logs, official vendor metadata, and regression logs
are retained outside the disposable checkout in the canonical clone's Git
directory under `closeouts/translation-2026-10-22/security-remediation/`.
GitHub must independently establish the final head's complete two-engine result.
