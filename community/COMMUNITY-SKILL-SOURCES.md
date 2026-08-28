# Community skill sources

This manifest records public community skill packages imported into this
repository for study and composition. Imported packages are preserved as
upstream material unless a separate, reviewable adaptation is created. Their
presence is not an OKHP3 endorsement, a guarantee of current correctness, or
evidence that a skill is safe to run against a particular application.

Acquisition date: 2026-08-27
Acquisition method: public GitHub download, staged and inspected before copy
License review: each source repository below declares MIT licensing at its root

| Local package | Upstream source | Ref / commit | Upstream path | Role in the proposed workflow | Structural review |
|---|---|---|---|---|---|
| `acquire-codebase-knowledge` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | `main` / `bbde357dbd694416155e5fa8f904ca79a51b7e10` | `skills/acquire-codebase-knowledge` | Repository inventory, stack and architecture evidence capture | Pass with warning: no explicit Scope section |
| `technology-stack-blueprint-generator` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | `main` / `bbde357dbd694416155e5fa8f904ca79a51b7e10` | `skills/technology-stack-blueprint-generator` | Technology detection and implementation-pattern blueprint | Pass with warning: no obvious validation loop |
| `doc-and-modernize` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | `main` / `bbde357dbd694416155e5fa8f904ca79a51b7e10` | `skills/doc-and-modernize` | Local-first architecture documentation and modernization planning | Pass with policy error: `SKILL.md` exceeds 500 lines |
| `dotnet-best-practices` | [github/awesome-copilot](https://github.com/github/awesome-copilot) | `main` / `bbde357dbd694416155e5fa8f904ca79a51b7e10` | `skills/dotnet-best-practices` | Forward .NET expectations usable as a reference grammar | Pass with warning: no obvious validation loop |
| `codebase-discovery` | [DiUS/agent-toolkit](https://github.com/DiUS/agent-toolkit) | `main` / `2aaf288fa4ec3ee721ee09bcba8a66d7aa4b8ed0` | `skills/codebase-discovery` | Domain, workflow, glossary, and onboarding discovery | Pass with warning: no explicit Scope section |
| `codebase-architecture` | [mblode/agent-skills](https://github.com/mblode/agent-skills) | `main` / `e97a3b383f5944f90d41eb92b24b4fb3b917a7f9` | `skills/codebase-architecture` | Architecture design/deepening and guardrail patterns; TypeScript-specific | Pass |
| `software-architecture-analysis` | [magnus919/agent-skills](https://github.com/magnus919/agent-skills) | `main` / `531ff6753784823c878c92b988c6e55266ce09a9` | `software-architecture-analysis` | Clean-room reverse engineering, architecture health, and specification recovery | Pass with warning: no explicit Scope section |
| `c4-codebase-architecture` | [lmammino/c4-codebase-architecture-skill](https://github.com/lmammino/c4-codebase-architecture-skill) | `main` / `41b9e00f33d71a0a60ac5fb79ea83bc69e6dbe61` | `skills/c4-codebase-architecture` | C4-style architecture documentation and comparison | Pass with policy error: `SKILL.md` exceeds 500 lines |

## Review boundaries

- Packages were downloaded to an isolated staging directory, checked for
  symlinks and non-regular files, reviewed for obvious network, credential,
  upload, or destructive behavior, and then copied into `community/`.
- `acquire-codebase-knowledge/scripts/scan.py` intentionally runs local
  inspection commands and writes the requested scan output. Review its target
  directory and output path before execution.
- The two policy-error packages remain verbatim imports for comparison. They
  are not release-ready OKHP3 packages without a separate adaptation decision.
- Proposed names in the source conversation, including orchestration,
  evidence, normalization, and domain-specific skills, were not fabricated or
  downloaded without an identifiable public package.
- Current host-provided skills such as frontend builders, frontend testing,
  React guidance, shadcn, and Supabase/Postgres guidance were not copied from
  plugin caches into this public community family. Their redistribution terms,
  canonical source, and package ownership require a separate decision.

## Bulk capability capture

The source conversation names 83 requested capabilities across nine
operational sections. Those names are capability labels, not a single
published repository. The following public repositories supplied 86
additional packages that directly or adjacently cover that capability set.

| Source repository | Ref / commit | Packages captured | Import note |
|---|---|---:|---|
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | `main` / `c0314d9bcb473fac0cc219e062735e3a3cb67cd3` | 57 | Public MIT repository. Three local names are shortened to satisfy the 36-character directory rule: `copilot-instructions-blueprint`, `custom-instructions-from-codebase`, and `workflow-analysis-blueprint`. Their frontmatter names were normalized to the local aliases. |
| [arjunprabhulal/agent-skills](https://github.com/arjunprabhulal/agent-skills) | `main` / `42dd24080fce6d731d00e2a1134f398c3da4171b` | 19 | Public MIT repository. Nested source paths were flattened to unique local package names. |
| [luckys/agent-skills](https://github.com/luckys/agent-skills) | `main` / `c098bd422774912958421ae733938e8fff81dfde` | 5 | Public MIT repository. `data-migration-best-practices` also carries the referenced `migration-testing.md` source file so the imported package is self-contained. |
| [blackwell-systems/agent-lsp](https://github.com/blackwell-systems/agent-lsp) | `main` / `ca8b32d9d2a851b2cea0576eea36153e9a44962a` | 5 | Public MIT repository. LSP-oriented architecture, dead-code, documentation, refactoring, and test-correlation packages. |

The imported packages are cataloged in
[`COMMUNITY-SKILL-COVERAGE.md`](COMMUNITY-SKILL-COVERAGE.md), which maps each
of the 83 requested capability labels to the closest captured package or
records an explicit gap. Imported material remains upstream study material;
it is not an OKHP3 endorsement or a claim that a package is safe to run
against a live system.

The four `architect`, `attest`, `scribe`, and `trace` packages from
`simota/agent-skills` were not imported because their captured directories
contain unresolved internal symlinks. This keeps the community family free of
incomplete packages.

## Validation snapshot

- 107 community packages were checked for regular-file structure and symlinks.
- No community package directory exceeds the 36-character local path limit.
- The catalog check passed and `git diff --check` passed.
- 103 packages passed the strict structural validator.
- Four packages retain upstream structural errors: `agent-governance`,
  `c4-codebase-architecture`, `doc-and-modernize`, and `refactor` have
  `SKILL.md` bodies above the 500-line progressive-disclosure limit. They are
  retained as source captures and are not represented as release-ready
  OKHP3-authored packages.
- Many imported packages omit optional version metadata. Those are catalog
  warnings, not evidence of a current release or a quality endorsement.
