# Competitive Landscape

Research date: 2026-07-24. This documents what already exists in the broader Agent Skills marketplace and the wider "DB reverse engineering" tool space, what it does that `okhp3-database-cartographer` didn't originally, and exactly what got ported in as a result. Re-run this search periodically -- the marketplace moves.

## What was searched

The official Anthropic/community skills registries (`anthropics/skills`, `agentskills.io`, `skillsmp.com`, `agenticskills.io`), plus GitHub broadly for non-Skill tools that do the same underlying job, since "Agent Skill" is a young enough category that the more mature prior art for this specific problem lives outside it.

## What exists

**No other Agent Skill found does both halves of this job** -- live multi-engine database interrogation *and* severity-classified spec diffing *and* diagram handoff, in one skill. What exists instead is split across three different categories, none of which fully overlaps:

| Tool | Category | What it does | What it doesn't do |
|---|---|---|---|
| `motherduck-explore` (motherduckdb) | Agent Skill | Explores/queries a live MotherDuck/DuckDB database | Single-engine only; no spec-diffing; no diagram output |
| Supabase skills (various) | Agent Skill | Postgres-specific schema inspection via Supabase's own tooling | Postgres/Supabase-only; no cross-engine abstraction |
| `database-schema-designer` / `database-schema-design` | Agent Skill | Forward *design* of a new schema from requirements | Opposite direction of the problem -- doesn't reverse-engineer an existing live database at all |
| `database-schema-documentation` | Agent Skill | Template-driven documentation generator | Works from a schema you already have in hand, not from a live connection; no interrogation step |
| skillsmp.com `reverse-engineer` | Agent Skill | Codebase-wide reverse engineering (architecture, not schema-specific) | Not database-focused; no ER diagram output; no engine adapters |
| **mermerd** (github.com/KarnerTh/mermerd) | Standalone Go CLI, not a Skill | Live DB -> Mermaid ERD for Postgres/MySQL/MSSQL/SQLite3. Infers relationship cardinality automatically from FK nullability and uniqueness constraints, rather than requiring it hand-specified. | No spec-diffing against a design document; no severity classification; not usable as an in-conversation skill; Go binary, not Python |
| **SchemaCrawler** (Java, JDBC) | Standalone tool | Broadest engine coverage of anything found (SQLite/Postgres/MySQL/MSSQL/Oracle/DB2 and more via JDBC); has its own diagramming and multiple output formats | JVM-based, not a Python/Skill-native workflow; no spec-diffing; no P1/P2/P3-style findings register |

## The one concrete capability gap: automatic cardinality inference

Every Agent-Skill-category competitor found either doesn't diagram at all, or hands the cardinality question to the user. mermerd was the standout: it derives Mermaid's `||--o{` / `||--|o` / etc. operators directly from FK column metadata (nullable + unique) instead of making the caller specify them by hand.

That's a real, portable idea -- and it maps directly onto data SQLAlchemy's `inspect()` already returns for free. `get_columns()` gives `nullable` per column; `get_unique_constraints()` gives the unique-constraint membership. No additional query is needed beyond what the interrogation step already collects.

**Ported in as of v1.1.0**: `scripts/schema_to_mermaid.py` now exports `infer_cardinality(fk_nullable, fk_unique)`, and `to_mermaid_erdiagram()` falls back to it automatically whenever a relationship dict omits an explicit `"cardinality"` key. Explicit cardinality still wins when supplied -- inference is a convenience, not a requirement. See `references/mermaid-handoff.md` for the updated schema-inventory contract and `references/engine-adapters.md` for where the FK metadata comes from per engine.

A second, smaller defect surfaced during the regression test that validated this port: the original converter joined multiple column constraints with a space (`"FK UK"`), which Mermaid's `erDiagram` grammar rejects outright (confirmed via a live parse failure). Fixed in the same pass by comma-joining (`"FK, UK"`), which Mermaid does accept. Not a marketplace-sourced fix -- just a bug the testing discipline this comparison required happened to catch.

## Where this skill remains ahead of everything found

No competitor combines all three of: (1) real live interrogation across six engines through one shared code path, (2) severity-classified (P1/P2/P3) diffing against a locked design spec -- inherited from proven prior art on a real project, not invented for this comparison -- and (3) a decoupled, dependency-free Mermaid diagram handoff. mermerd and SchemaCrawler are the closest functional analogs and only cover interrogation-plus-diagramming; neither does spec verification. The Agent-Skill-category tools found each cover a narrower slice (single engine, forward design only, or generic codebase analysis).

## What wasn't ported, and why

SchemaCrawler's broader engine list (DB2, and others beyond what this skill already covers) wasn't ported -- the JDBC dependency chain it requires doesn't fit this skill's read-only, Python-driver-based design, and the engines it adds beyond this skill's existing six aren't in scope for the project that motivated this skill. Revisit if a future project needs one of those engines specifically.
