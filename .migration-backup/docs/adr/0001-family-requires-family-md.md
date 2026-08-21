# ADR-0001: A top-level directory is only a catalog "family" if it contains FAMILY.md

**Status**: Accepted
**Date**: 2026-08-03
**Deciders**: Skillz Forge maintainers (via Replit Agent session)

## Context

`forge/scripts/build-catalog.js` builds `forge/src/data/catalog.json`, which
drives the Explore page's family filter sidebar. The builder originally
derived a "family" from any top-level directory name (skipping a small
`SKIP_DIRS` denylist), rather than from an explicit per-family marker file.

This surfaced two real problems once the repository grew past its original
family set:

1. A stray top-level `skills/` directory (a publication-mirror surface used by
   `okhp3-skill-promotion`, not a content family) was indexed as if it were a
   family, and its one skill (`okhp3-skill-promotion`) duplicated the properly
   housed copy under `universal/okhp3-skill-promotion`.
2. Every real content family (`abrahamic`, `agent-foundry`, `askjamie`,
   `community`, `context-extraction`, `glee-fully`, `knowledge-operations`,
   `lifetrkr`, `linkedin`, `mermaid`, `notion`, `outcome-modeling`,
   `process-capture`, `refolddec`, `universal`) already had a `FAMILY.md` file,
   confirmed by direct inspection of the top-level directories -- so a
   `FAMILY.md` check was available and would have excluded `skills/` for free.

## Decision Drivers

- Must not require updating a hardcoded allow/deny list every time a new
  family folder is added by a concurrent contributor or task agent.
- Must not silently index a non-family support directory (build tooling,
  publication mirrors, docs) as if it were browsable catalog content.
- Should use a signal that a real content family is already expected to have.

## Considered Options

### Option 1: Keep the `SKIP_DIRS` denylist, add `skills` to it

- **Pros**: One-line fix.
- **Cons**: Reactive -- the same failure mode recurs for the next stray
  top-level directory that happens to contain a `SKILL.md` somewhere inside it.

### Option 2: Only recurse into a top-level directory as a family if it contains `FAMILY.md`

- **Pros**: Positive, self-verifying signal instead of a growing denylist. Any
  future stray directory (build tooling, docs, scratch folders) is excluded by
  default unless a maintainer deliberately adds `FAMILY.md` to declare it a
  family.
- **Cons**: A genuinely new family folder that forgets to add `FAMILY.md` will
  silently disappear from the catalog rather than erroring loudly (tracked
  separately as project task #38, "Warn when a FAMILY.md is missing entirely").

## Decision

We will use **Option 2**: `findSkillFiles()` in `forge/scripts/build-catalog.js`
only treats a top-level directory as a family, and recurses into it, when it
is not in `SKIP_DIRS` **and** contains a `FAMILY.md` file.

## Consequences

### Positive

- `skills/` (and any future non-family top-level directory) is excluded
  automatically, with no denylist maintenance.
- The Explore page's family filter now shows exactly the 15 real content
  families, each display-named via `readFamilyDisplayName()` reading each
  family's own `FAMILY.md` frontmatter (see "Related Decisions" below).

### Negative

- A brand-new family folder that is missing `FAMILY.md` will not appear in the
  catalog at all, with no build warning today. This is a known gap, tracked as
  project task #38.

## Related Decisions

- Project task #34-#37 (display-name/capitalization drift for newly merged
  families) is a downstream consequence of the same "families can appear
  without matching maintenance" pattern this ADR addresses for `FAMILY.md`.
  That work has since landed: a concurrent merge replaced the original
  hardcoded `FAMILY_DISPLAY_NAMES` map with `readFamilyDisplayName()`, which
  reads `display_name` from each family's own `FAMILY.md` frontmatter (with a
  build-time warning when it's missing) -- a strictly self-maintaining
  version of the fix this ADR anticipated.

## References

- `forge/scripts/build-catalog.js` (`findSkillFiles`, `readFamilyDisplayName`)
- Family folders confirmed via `FAMILY.md` presence check across the
  repository root, 2026-08-03.
