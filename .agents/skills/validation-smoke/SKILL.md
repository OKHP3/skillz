---
name: validation-smoke
description: Exercise validator failure boundaries with dependency-free malformed, missing-output, route, and publishing fixtures.
---

# Validation smoke suite

## Use when

Run after editing validation scripts or their path-resolution logic. It
proves that the checks fail loudly on representative bad inputs rather than
only passing the current repository.

## Callable command

```bash
node .agents/skills/validation-smoke/run.mjs
```

The suite uses temporary files and pure assertions; it does not mutate the
repository, publish anything, or require credentials. It covers both a
complete passing report and an incomplete failing report, including required
fields, allowed status/severity values, and non-empty source paths.
