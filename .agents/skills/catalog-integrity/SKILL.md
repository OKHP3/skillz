---
name: catalog-integrity
description: Rebuild and validate Skillz Forge catalog truth, evidence contracts, and provenance without credentials.
---

# Catalog integrity

## Use when

Run after changing a skill contract, family metadata, evidence artifacts,
catalog derivation, or generated catalog assets.

## Callable command

```bash
node .agents/skills/catalog-integrity/run.mjs
```

The command runs the existing `artifacts/forge/scripts/build-catalog.js` and
`test-catalog.mjs` from their migrated workspace locations. It builds the
catalog, project summary, and synchronized manifest in a temporary validation
directory, so a local check does not rewrite tracked release metadata. It sets
the local development escape hatch for a shallow checkout only; CI and
publishing still invoke the release build directly and fail closed as before.

## Inputs and outputs

- Input: the current checkout's root distribution families and generated
  `artifacts/forge/public/data/` assets.
- Output: concise pass/fail lines and a non-zero exit on invalid counts,
  metadata, evidence vocabulary, payload split, or provenance.

Never paste credentials into the command. A local shallow-history warning is
not a release pass; a CI shallow-history failure blocks publishing.