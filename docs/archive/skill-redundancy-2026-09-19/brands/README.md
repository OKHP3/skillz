# Archived brand workflows - 2026-09-19

These fourteen packages are historical snapshots, not active skills, current
instructions, or new benchmark evidence. Their operational workflows duplicate
seven shared packages. The brand-specific overlays remain available inside each
shared package under `references/brand-profiles/`. No original file was deleted
or rewritten.

The [preservation manifest](../brands-manifest.json) records **158 original
files and 666,772 raw bytes**, anchored to commit
`ff61152eeda6d7985805c9049840964ca781394b`. Each entry retains the original Git mode and blob identifier as well
as raw working-tree and Git-blob byte counts and SHA-256 hashes. All original
files use Git mode `100644`. The archive-local `.gitattributes` preserves
original line endings in future checkouts.

| Original package | Shared replacement | Files | Bytes |
|---|---|---:|---:|
| `askjamie/okhp3-askjamie-thread-context` | `context-extraction/okhp3-thread-context-extraction` | `16` | `77,535` |
| `askjamie/okhp3-askjamie-extract-chatgpt` | `context-extraction/okhp3-thread-extract-chatgpt` | `13` | `66,954` |
| `askjamie/okhp3-askjamie-extract-claude` | `context-extraction/okhp3-thread-extract-claude` | `13` | `66,279` |
| `askjamie/okhp3-askjamie-chatgpt-migrate` | `context-extraction/okhp3-chatgpt-project-migration` | `4` | `14,881` |
| `askjamie/okhp3-askjamie-repo-organizer` | `universal/okhp3-repository-organizer` | `12` | `53,646` |
| `askjamie/okhp3-askjamie-repo-creator` | `universal/okhp3-repository-creator` | `2` | `5,284` |
| `askjamie/okhp3-askjamie-style-registry` | `universal/okhp3-brand-style-registry` | `19` | `48,427` |
| `glee-fully/okhp3-glee-fully-thread-context` | `context-extraction/okhp3-thread-context-extraction` | `16` | `77,644` |
| `glee-fully/okhp3-glee-fully-extract-chatgpt` | `context-extraction/okhp3-thread-extract-chatgpt` | `13` | `66,979` |
| `glee-fully/okhp3-glee-fully-extract-claude` | `context-extraction/okhp3-thread-extract-claude` | `13` | `66,277` |
| `glee-fully/okhp3-glee-fully-chatgpt-migrate` | `context-extraction/okhp3-chatgpt-project-migration` | `4` | `14,892` |
| `glee-fully/okhp3-glee-fully-repo-organizer` | `universal/okhp3-repository-organizer` | `12` | `53,725` |
| `glee-fully/okhp3-glee-fully-repo-creator` | `universal/okhp3-repository-creator` | `2` | `5,495` |
| `glee-fully/okhp3-glee-fully-style-registry` | `universal/okhp3-brand-style-registry` | `19` | `48,754` |

Original text, relative links, historical benchmark claims, and package names
are preserved as they were. Cross-package links must be interpreted from the
recorded original path, not as current install instructions. The old package
directories now contain README-only locators.

For recovery, verify the raw bytes at every manifest `destination` against
`sha256` and `bytes`, then use the original path mapping in a separate recovery
location. Never overwrite a current shared package or its locator. Original Git
blobs provide an independent baseline even when checkout line endings differ.

The shared packages carry a minor version bump for conditional profile loading.
Their original benchmarks remain historical; the new profile evaluation designs
are explicitly not run. Consolidation is not evidence of improved model quality.
