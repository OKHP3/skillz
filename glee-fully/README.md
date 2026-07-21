# Glee-fully

**Status: placeholder. No skills scaffolded below this level yet.**

Conversion target for the Glee-fully custom GPT catalog (~42 GPTs from the `Glee-fullyTools-FoundRy` inventory). Earlier analysis concluded the right packaging is neither 1 family nor a fixed 7 — cohesion (shared tool/MCP affinity, workflow proximity) should determine the cluster count, working estimate 4-6 sub-families.

## Before scaffolding sub-families

1. Run the clustering pass against the inventory (`inventory_of_toolbox_tools_and_tool-ettes.md` in `Glee-fullyTools-FoundRy`).
2. For each cluster: shared MCP/tool dependencies, would a user want all-or-some, coherent workflow vs. thematically-adjacent-but-independent.
3. Name each cluster, THEN create `glee-fully/<cluster-name>/` directories following the core+domain pattern used in `mermaid/` if a cluster is large enough to warrant it, or single-skill pattern (like `process-capture/`) if not.

## Do not

Do not scaffold 7 evenly-sized sub-directories as a default. The count is a discovery, not a target.
