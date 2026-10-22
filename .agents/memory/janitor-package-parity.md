---
name: Janitor package parity
description: Canonical-to-shipped sync boundary for the one-Repl janitor package
---

## Rule

The `.agents/skills/okhp3-replit-repl-janitor` package is canonical and
`replit/okhp3-replit-repository-janitor` is the shipped mirror. Keep the audit script
byte-identical. Keep the behavior and regression coverage aligned for local
and remote tip checks, hosted-PR evidence, and read-only cleanup discovery.
The canonical suite should enforce script parity and required fixture coverage.
Synchronize behavior documentation, but do not bulk-copy release metadata or
evaluation records without reviewing their distribution-specific state.

**Why:** Runtime safety must not depend on which copy is invoked, while release
and evaluation artifacts can encode package-specific publication evidence that
a blind mirror copy could erase or misrepresent.

**How to apply:** Before shipping a janitor safety change, compare both scripts,
run both test suites, and inspect the explicit parity checks. Review metadata
and evaluation differences separately rather than treating them as runtime
parity failures.
