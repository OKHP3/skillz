# Conformance Checklist

Used by `okhp3-mermaid-governance` in Check and Audit modes. Run each item against the diagram and the declared GOVERNANCE.md. Grade each item: **Pass**, **Partial**, or **Fail**.

---

## Item 1 — init block: palette match

**What to check:** Does the diagram's `%%{init}%%` block match the declared palette?

**How to check:**
1. Extract the `%%{init}%%` block (or YAML frontmatter) from the diagram.
2. Compare the `primaryColor` hex value against the declared palette ID in `okhp3-mermaid-theme-builder/assets/palettes.json`.
3. Check that `"theme": "base"` is present.

**Pass:** All themeVariable hex values match the declared palette. `theme: base` is present.

**Partial:** `theme: base` is present and most hex values match, but 1–3 non-critical variables differ (e.g., `edgeLabelBackground` or `fontFamily` only).

**Fail:** `theme: base` is missing, `primaryColor` does not match the declared palette, or no init block is present.

**Remediation:** Route to `okhp3-mermaid-theme-builder` Format E (extract and re-theme with the declared palette).

---

## Item 2 — init block: renderer safety

**What to check:** Does the init block respect the renderer constraints declared in the profile?

**How to check:**
1. Identify the primary renderer from GOVERNANCE.md.
2. Check `okhp3-mermaid-theme-builder/references/renderer-profiles.md` for that renderer's constraints.
3. Flag any init block features that exceed the renderer's declared support level.

**Common failure modes:**
- Custom `fontFamily` declared for a renderer that blocks custom fonts (GitHub, Notion)
- `"look": "neo"` or `"look": "handDrawn"` declared for Notion or Confluence
- Full themeVariable set used with a renderer that only applies a subset (Notion, Confluence)

**Pass:** No init block features exceed the renderer's support level.

**Partial:** Minor overreach (e.g., custom font that will silently fall back) with no rendering failure risk.

**Fail:** Features declared that will cause rendering failure or silent style loss in the primary renderer.

**Remediation:** Adjust the init block per the renderer's constraints. `okhp3-mermaid-theme-builder` Format A or B with the correct renderer profile selected.

---

## Item 3 — classDef declarations

**What to check:** Do the `classDef` declarations in the diagram match the semantic class library in GOVERNANCE.md?

**How to check:**
1. List all `classDef` statements in the diagram.
2. Compare each class name against the declared semantic class library.
3. Flag any class names not in the library (undeclared classes) or declared classes with color values that do not match the palette (palette drift in class definitions).

**Pass:** All `classDef` names are in the library. Color values match the declared palette.

**Partial:** All class names are declared, but 1–2 non-critical color values have drifted from the palette (e.g., stroke color only).

**Fail:** One or more class names are not in the declared library, or primary color values (`fill`, `color`) in classDef blocks do not match the palette.

**Remediation:** Route to `okhp3-mermaid-theme-builder` for classDef color correction; route to `okhp3-mermaid-update` to rename undeclared class names to declared ones.

---

## Item 4 — class assignments: coverage

**What to check:** Does every node in the diagram have a class assignment from the declared library?

**How to check:**
1. List all node IDs in the diagram.
2. Check `class <nodeID> <className>` statements or inline `:::className` usage.
3. Identify any nodes with no class assignment (unstyled nodes).

**Pass:** Every node has exactly one class assignment from the declared library.

**Partial:** 1–2 nodes are unstyled, but they are minor annotations or connectors.

**Fail:** Three or more nodes are unstyled, or any primary process/decision/external node is unstyled.

**Remediation:** Route to `okhp3-mermaid-update` to add missing class assignments using the declared library.

---

## Item 5 — class assignments: semantic accuracy

**What to check:** Are class assignments semantically correct — does each node's assigned class match its actual role in the process?

**How to check:** Review each node's class assignment against its label and position in the flow.

**Common misassignments:**
- A decision gateway (diamond shape, branching edges) assigned `process` instead of `decision`
- A database or file store assigned `external` instead of `dataStore`
- An end event assigned `process` instead of `event`
- An annotation box assigned `process` instead of `annotation`

This check requires understanding the diagram content, not just the syntax.

**Pass:** All class assignments correctly reflect the node's semantic role.

**Partial:** 1–2 minor misassignments (e.g., an intermediate event labeled as a process step) with no impact on diagram readability.

**Fail:** Primary structural elements (decisions, events, external systems) are misassigned.

**Remediation:** Route to `okhp3-mermaid-update` to correct class assignments.

---

## Item 6 — audience fit

**What to check:** Does the diagram's density and vocabulary match a declared audience tier?

**How to check:**
1. Count the total nodes.
2. Check label verbosity (are labels full sentences or short identifiers?).
3. Check whether technical vocabulary (system names, protocol details, attribute types) is present.
4. Compare against `okhp3-mermaid-core/references/audience-profiles.md` density limits for the tier.

**Pass:** The diagram clearly fits within one of the declared audience tiers in GOVERNANCE.md and meets that tier's density profile.

**Partial:** Minor density overage (1–3 extra nodes) or minor vocabulary mismatch that does not impair the intended audience.

**Fail:** The diagram is materially denser or more technical than the declared audience tiers support, or it mixes audiences in a way that serves neither.

**Remediation:** Route to `okhp3-mermaid-update` to thin the diagram for the correct audience tier, or reconsider the declared audience scope in GOVERNANCE.md.

---

## Item 7 — provenance safety

**What to check:** If the profile is Private, does the diagram contain content that must not appear in public-facing artifacts?

**How to check:**
1. Read the provenance declaration in GOVERNANCE.md.
2. If Public: no check required — pass automatically.
3. If Private: scan for employer names, internal system names, organizational structure details, confidential process names, or other content that would be inappropriate in a public artifact.

**Pass:** Profile is Public, or profile is Private and no confidential content is present.

**Fail:** Profile is Private and the diagram is present in a public-facing artifact (committed to a public repo, shared via public Mermaid Chart link, embedded in a published post).

**Remediation:** Remove the diagram from public exposure, or redact confidential content before any public sharing. See `docs/SECURITY.md`.

---

## Item 8 — naming convention

**What to check:** Does the file follow the naming convention and is it registered in DIAGRAMS.md?

**How to check:**
1. Check the filename against the pattern: `[domain]-[process]-[view]-[audience]-v[version].mmd` per `okhp3-mermaid-core/references/naming-conventions.md`.
2. Verify the diagram has an entry in `DIAGRAMS.md`.

**Pass:** Filename follows the convention and DIAGRAMS.md entry exists.

**Partial:** Minor naming deviation (e.g., missing audience suffix) but DIAGRAMS.md entry exists.

**Fail:** File does not follow the naming convention, or no DIAGRAMS.md entry exists.

**Remediation:** Rename the file and add or update the DIAGRAMS.md entry.

---

## Grading Summary

After running all 8 items, aggregate the results:

| Grade | Condition |
|---|---|
| **Compliant** | All 8 items Pass |
| **Partially compliant** | 1–2 Fail/Partial items, none in items 1 or 6 |
| **Non-compliant** | 3+ Fail/Partial items, OR item 1 (palette) fails, OR item 7 (provenance) fails |

Items 1 (palette match) and 7 (provenance safety) are always critical — a single Fail on either makes the diagram Non-compliant regardless of other scores.

Report findings using the conformance report format in `okhp3-mermaid-governance/SKILL.md` Mode 2.
