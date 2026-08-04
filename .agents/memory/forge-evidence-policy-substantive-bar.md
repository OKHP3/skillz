---
name: Forge evidence-policy substantive-artifact bar
description: Why a bare test file is not enough to sustain a "validated" or "published" maturity claim in Skillz Forge's catalog build.
---

`applyEvidencePolicy()` in `forge/scripts/build-catalog.js` downgrades an unsupported "validated" claim using `hasSubstantiveEvidenceArtifact()` (requires an eval or benchmark artifact), not the looser `hasAnyEvidenceArtifact()` (which also counts a bare test/script file and still gates the lower "usable" bar).

**Why:** a test file is structural scaffolding — it proves a check exists, not that a graded case was ever run against the current package. The maturity table's definition of "validated" ("peer-reviewed against the stated contract," "protected or external check") implies real evaluation evidence, not just a placeholder test.

**How to apply:** when adding new evidence-artifact types or adjusting maturity gates, decide explicitly which existing bar (`hasAnyEvidenceArtifact` vs `hasSubstantiveEvidenceArtifact`) the new artifact type should count toward — don't assume "any artifact present" is sufficient for `validated`/`published`. The policy intentionally never touches maturity at or below "usable" (a tested invariant); don't add downgrades below that line without confirming it's actually wanted, since a prior attempt to do so broke an existing invariant test.
