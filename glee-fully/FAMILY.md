---
family: glee-fully
display_name: Glee-fully
skill_count: 12
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-08-30T20:05:55Z
---

# glee-fully

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

<!-- FAMILY_SUMMARY_START -->
Conversion target for the Glee-fully custom GPT catalog (~42 GPTs from the `Glee-fullyTools-FoundRy` inventory). Earlier analysis concluded the right packaging is neither 1 family nor a fixed 7 — cohesion (shared tool/MCP affinity, workflow proximity) should determine the cluster count, working estimate 4-6 sub-families.
<!-- FAMILY_SUMMARY_END -->

## Skills (12)

<!-- FAMILY_INVENTORY_START -->
*12 skills &nbsp;·&nbsp; inventory last updated: **August 30, 2026 at 20:05 UTC***

| Skill | Description | Version |
|---|---|---|
| [glee-fully-repo-standardizer](glee-fully-repo-standardizer/SKILL.md) | Scaffold and standardize any Glee-fully child repository (Toolbox, Tool, or Tool-ette tier). When... | 1.1.0 |
| [okhp3-glee-fully-brand](okhp3-glee-fully-brand/SKILL.md) | OverKill Hill P³ Glee-fully SPA styling. Use when a user wants a Glee-fully application, document... | 1.1.0 |
| [okhp3-glee-fully-chatgpt-migrate](okhp3-glee-fully-chatgpt-migrate/SKILL.md) | OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving, extracting, inventory... | 1.0.0 |
| [okhp3-glee-fully-extract-chatgpt](okhp3-glee-fully-extract-chatgpt/SKILL.md) | Extract manually supplied ChatGPT conversations into standalone, actionable Markdown. Use when th... | 2.0.0 |
| [okhp3-glee-fully-extract-claude](okhp3-glee-fully-extract-claude/SKILL.md) | Extract manually supplied Claude conversations into standalone, actionable Markdown. Use when the... | 2.0.0 |
| [okhp3-glee-fully-foundry](okhp3-glee-fully-foundry/SKILL.md) | Design, author, audit, and canon-seal portable Glee-fully Agent Skills across the Trunk, Branch, ... | 1.0.0 |
| [okhp3-glee-fully-gpt-builder](okhp3-glee-fully-gpt-builder/SKILL.md) | >- | 1.0.0 |
| [okhp3-glee-fully-gpt-readiness](okhp3-glee-fully-gpt-readiness/SKILL.md) | >- | 1.0.0 |
| [okhp3-glee-fully-repo-creator](okhp3-glee-fully-repo-creator/SKILL.md) | Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt ... | 1.1.0 |
| [okhp3-glee-fully-repo-organizer](okhp3-glee-fully-repo-organizer/SKILL.md) | OverKill Hill P³ repository organizer for content-first Git repositories. Use when a local Git re... | 1.1.1 |
| [okhp3-glee-fully-style-registry](okhp3-glee-fully-style-registry/SKILL.md) | OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract... | 1.1.0 |
| [okhp3-glee-fully-thread-context](okhp3-glee-fully-thread-context/SKILL.md) | Extract pasted or uploaded AI chat threads into standalone, actionable Markdown. Use when the use... | 2.0.0 |
<!-- FAMILY_INVENTORY_END -->
