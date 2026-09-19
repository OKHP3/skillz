# Glee-fully

**Status: early specific tooling.** The Glee-fully-specific Foundry skill now lives at
`glee-fully/okhp3-glee-fully-foundry/`. The consumer Tool and Tool-ette skill
families remain a future conversion target.

Conversion target for the Glee-fully custom GPT catalog (~42 GPTs from the `Glee-fullyTools-FoundRy` inventory). Earlier analysis concluded the right packaging is neither 1 family nor a fixed 7 — cohesion (shared tool/MCP affinity, workflow proximity) should determine the cluster count, working estimate 4-6 sub-families.

## Before scaffolding sub-families

1. Run the clustering pass against the inventory (`inventory_of_toolbox_tools_and_tool-ettes.md` in `Glee-fullyTools-FoundRy`).
2. For each cluster: shared MCP/tool dependencies, would a user want all-or-some, coherent workflow vs. thematically-adjacent-but-independent.
3. Name each cluster, THEN create `glee-fully/<cluster-name>/` directories following the core+domain pattern used in `mermaid/` if a cluster is large enough to warrant it, or single-skill pattern (like `process-capture/`) if not.

The family-level Foundry and GPT creation skills are exceptions to that deferred clustering
rule: it governs how future Glee-fully skills are authored and reviewed, but it
does not count as a converted consumer Tool or Tool-ette.

## Do not

Do not scaffold 7 evenly-sized sub-directories as a default. The count is a discovery, not a target.

## Shared workflows and Glee-fully profiles

The seven former Glee-fully workflow copies were consolidated on 2026-09-19.
Use the shared skill with its bundled Glee-fully profile only for a confirmed
Glee-fully target. Each profile ships inside its shared package, so standalone
installation preserves the brand guidance without maintaining a second workflow.

| Task | Shared skill | Optional profile |
|---|---|---|
| General thread extraction | [okhp3-thread-context-extraction](../context-extraction/okhp3-thread-context-extraction/SKILL.md) | [Glee-fully profile](../context-extraction/okhp3-thread-context-extraction/references/brand-profiles/glee-fully.md) |
| ChatGPT extraction | [okhp3-thread-extract-chatgpt](../context-extraction/okhp3-thread-extract-chatgpt/SKILL.md) | [Glee-fully profile](../context-extraction/okhp3-thread-extract-chatgpt/references/brand-profiles/glee-fully.md) |
| Claude extraction | [okhp3-thread-extract-claude](../context-extraction/okhp3-thread-extract-claude/SKILL.md) | [Glee-fully profile](../context-extraction/okhp3-thread-extract-claude/references/brand-profiles/glee-fully.md) |
| ChatGPT project migration | [okhp3-chatgpt-project-migration](../context-extraction/okhp3-chatgpt-project-migration/SKILL.md) | [Glee-fully profile](../context-extraction/okhp3-chatgpt-project-migration/references/brand-profiles/glee-fully.md) |
| Repository organization | [okhp3-repository-organizer](../universal/okhp3-repository-organizer/SKILL.md) | [Glee-fully profile](../universal/okhp3-repository-organizer/references/brand-profiles/glee-fully.md) |
| Repository creation | [okhp3-repository-creator](../universal/okhp3-repository-creator/SKILL.md) | [Glee-fully profile](../universal/okhp3-repository-creator/references/brand-profiles/glee-fully.md) |
| Style registration and application | [okhp3-brand-style-registry](../universal/okhp3-brand-style-registry/SKILL.md) | [Glee-fully profile](../universal/okhp3-brand-style-registry/references/brand-profiles/glee-fully.md) |

The brand-specific GPT readiness and builder packages remain active because
they add distinct domain gates and evaluation cases. The brand styling package
also remains active with its approved profile and accessibility requirements.
The Glee-fully Foundry and repository standardizer remain active for hierarchy,
Persona Density, canon review, and tier-specific executable scaffolding.

See the [archived originals and recovery record](../docs/archive/skill-redundancy-2026-09-19/brands/README.md).
The README-only old locations are compatibility pointers, not additional skills.
