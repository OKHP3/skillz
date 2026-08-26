# Competitive Landscape Scan — 2026-08-06

**Status:** Research record. Not a submission — no list, registry, or
community has been contacted. Submission depends on the Mermaid trio
(`okhp3-mermaid-core`, `okhp3-mermaid-bpmn`, `okhp3-mermaid-publish`) first
reaching Validated maturity per `docs/BACKLOG.md`'s promotion order.

**Scope:** Agent-skill repositories, curated lists, and registries comparable
to `OKHP3/skillz`; assessment of whether this project's claimed
differentiators (BPMN-aware Mermaid generation, LinkedIn artifact-mining)
hold up against what exists publicly today.

**Method:** Web search only (`webSearch`/result snippets), 2026-08-06. Star
counts, descriptions, and creation dates are as reported by search results at
that time and were not independently re-verified by cloning each repo.

---

## 1. Comparable repos, curated lists, and registries

### Tier 1 — high-traffic curated lists (submission targets once promotion-ready)

| Repo | Focus | Scale (as reported) | Accepts submissions? |
|---|---|---|---|
| `anthropics/skills` | Anthropic's own first-party Agent Skills repo; the reference implementation of the `SKILL.md` format itself | ~166k stars, ~19.8k forks | Unclear/contested. Multiple open GitHub Discussions/issues (`#1089`, `#1328`, `#452`, `#1195`) ask Anthropic to clarify community-submission and PR-review policy; no `CONTRIBUTING.md` was found. Treat as "not confirmed to accept outside submissions" until that's resolved — a PR here is speculative, not a scheduled milestone. |
| `ComposioHQ/awesome-claude-skills` | Curated list of Claude Skills, resources, and tools | ~71.9k stars, ~8.1k forks | Standard awesome-list PR pattern; highest-reach realistic target for a curated-list entry once the trio ships. |
| `VoltAgent/awesome-agent-skills` | Curated collection of 1000+ agent skills, compatible with Claude Code, Codex, Gemini CLI, Cursor and more | ~29.7k stars, ~3.2k forks | Explicitly multi-runtime in scope (Claude Code, Codex, Gemini CLI, Cursor), which matches this project's own multi-runtime framing (`Claude, OpenClaw, Codex, and compatible AI agents` per `README.md`). Strong-fit target. |
| `Prat011/awesome-llm-skills` | Curated LLM/Agent Skills list; works with Claude Code, Codex, Gemini CLI, and custom agents; ships a `skill-creator` and `template-skill` scaffold | ~1.4k stars, ~254 forks | Smaller reach but has an explicit skill-authoring template, suggesting an active, structured submission pattern. |
| `BehiSecc/awesome-claude-skills` | Second, independently curated "awesome Claude Skills" list | ~9.9k stars, ~1.4k forks | A second major list with the same name/scope as ComposioHQ's — worth checking both before assuming one is canonical. |

### Tier 2 — vendor/company skill catalogs (context, not submission targets)

| Repo | Focus | Notes |
|---|---|---|
| `microsoft/skills` | Skills, MCP servers, custom agents, and `AGENTS.md` files for grounding coding agents across SDKs | Vendor-run, narrower scope (Microsoft SDK grounding). Not a natural fit for a general-purpose skill submission. |
| `AlirezaRezvani/claude-skills` | 345 skills/agents/commands across coding agents (Claude Code, Codex, Gemini CLI, Cursor, +8 more), spanning engineering, marketing, product, compliance, C-level advisory, research | Broad personal mega-collection rather than a governed list; useful as a scale/scope comparator, not a submission target. |
| `arvindand/agent-skills`, `oleg-koval/agent-skills` | Small (3–16 star) personal skill catalogs for Claude Code / Copilot / Codex / Cursor | Same genre as this project at much smaller scale — useful only as a naming/scope comparator. |

### Tier 3 — direct conceptual competitors (same problem, smaller scale)

| Repo | Focus | Comparison to this project |
|---|---|---|
| `seb1n/awesome-ai-agent-skills` | "90+ universal, self-contained skills... not a link directory — every skill is a complete, ready-to-use instruction set" | Same "not a link farm" framing this project uses (evidence/maturity-first, not folder-exists promotion). Worth watching as the closest philosophical peer at ~132 stars — much smaller reach but same positioning claim. |

### Registries and platforms (not directly comparable, but relevant context)

- **Official Anthropic skills directory** (referenced from `claude.com/blog/skills`): "a directory featuring partner-built [skills]." This is Anthropic's own curated/partner directory, separate from the `anthropics/skills` GitHub repo. Partner status and submission process were not found in this pass — flag as unresolved, not a near-term target.
- **MCP server directories** (Glama, Smithery, `mcp-submit` npm tool, `vivian254338489/mcp-server-directory-submission-kit`) are a *parallel but distinct* ecosystem — they list Model Context Protocol servers, not `SKILL.md` delegation contracts. Not a fit unless this project ships an MCP server; noted only so the two ecosystems aren't conflated in future promotion planning.

### Communities

No dedicated "Agent Skills" subreddit, Discord, or forum with clear submission norms was surfaced in this pass beyond the GitHub Discussions tab on `anthropics/skills` itself (which is more Q&A than a submission channel) and scattered individual LinkedIn posts about personal skill-building workflows. This is a gap worth a second, more targeted pass (e.g. Discord search, r/ClaudeAI, r/LocalLLaMA) before the trio ships, since none of the awesome-lists above function as a community, only as a list.

---

## 2. Differentiator assessment

### Claim: "BPMN-aware Mermaid generation with validation and publishing discipline" (`okhp3-mermaid-bpmn` + `okhp3-mermaid-core` + `okhp3-mermaid-publish`)

**Verdict: partially differentiated, and the window is closing.**

- Native BPMN 2.0 support in Mermaid itself remains an **open, unresolved feature request** (`mermaid-js/mermaid` issues `#7699` and `#2623`), so there is real, structural whitespace: Mermaid's own maintainers have not shipped this, which is exactly the gap `okhp3-mermaid-bpmn`'s "BPMN semantics in Mermaid syntax" vocabulary catalog targets.
- However, at least three other public projects are working the same seam right now:
  - `Agents365-ai/mermaid-skill` — "Mermaid diagrams from natural language with validation loop. 11+ types, multi-backend, PNG/SVG/PDF, multi-agent" (~148 stars). This is the closest direct competitor found: it already claims a validation loop and multi-format export, which overlaps with `okhp3-mermaid-core`'s validation step and `okhp3-mermaid-publish`'s render/export role.
  - `Kracozebr/agent-skill-mermaid-diagrams` (~14 stars) — a smaller, narrower "insert Mermaid diagrams" agent skill.
  - `lkmnch/Txt2BPMN` and `benjamen/mermaid-bpmn-plugin` — non-agent-skill tools (a standalone LLM-to-BPMN generator and a Mermaid plugin, respectively) that solve adjacent problems without the agent-skill packaging.
  - A `SKILL.md`-native business-process skill already exists in another project's plugin directory (`ITSalt/NaCl`'s `ba-workflow` skill: "Build activity diagrams for business processes... 3-swimlane decomposition"), showing the "BA workflow diagramming as a Claude skill" idea is not unique to this repo.
- **Net assessment:** the *combination* this project claims — BPMN vocabulary + audience/design-system-aware core + a dedicated validate/repair/publish lifecycle across three coordinated skills — has not been found assembled elsewhere at this fidelity. But "an agent skill that draws Mermaid diagrams with a validation step" is no longer a novel category; `Agents365-ai/mermaid-skill` already claims the validation-loop part. The differentiated claim should be narrowed from "we do Mermaid diagrams" to "we do the specific BPMN-vocabulary + lifecycle-discipline (core → bpmn → publish → update/repair) combination," and that claim should be demonstrated with a worked example before any external comparison is made, since none of the trio has reached Validated maturity yet.

### Claim: "Artifact-mining is more differentiated than generic voice polishing or post drafting" (`okhp3-linkedin-angles`)

**Verdict: the general category (mine content for LinkedIn post angles) is common; the specific "mine a finished artifact, not a topic" framing is a real but narrow point of difference.**

- Several public tools already do content-to-post generation: `Varnan-Tech/opendirectory`'s `linkedin-post-generator` skill ("Generate LinkedIn posts from any content: blog posts, articles, GitHub PRs..."), `Vatsalya2003/linkedin-post-gen` (trend-to-post with quality scoring), and a personal project (`ldenson1120/linkedin-post-engine`) that is functionally the closest match: "a two-step... system: mine your own Claude work for post ideas, then draft posts that sound like you." That two-step mine-then-draft structure is essentially the same shape as this project's `okhp3-linkedin-angles` → `okhp3-linkedin-post` → `okhp3-linkedin-voice` pipeline.
- Commercial tools (Postiv AI, and the broader "LinkedIn content coach" SaaS category) already sell "finds trending angles, drafts in your voice" as a product, so "angle mining" alone is not a defensible differentiator in the market at large.
- **Net assessment:** the claim in `docs/BACKLOG.md` — that angle-mining beats generic voice-polishing or drafting *within this project's own three LinkedIn skills* — likely still holds as an internal prioritization call (mine before you polish). But framed as an external, public differentiator against the wider field, it does not hold: the mine-then-draft pattern already exists in at least one comparable open-source repo and as a commercial product category. Any future promotion copy should not lean on "artifact-mining is unique" — it should lean on the specific BFS-scrub voice-safety gate (`okhp3-linkedin-voice`) and the strict artifact-not-topic mining source, since those are the parts not clearly matched by the tools found here.

---

## 3. Submission-readiness notes (for later use, not action now)

- **Primary target once the Mermaid trio clears Validated:** `VoltAgent/awesome-agent-skills` (best framing match: explicitly multi-runtime) and `ComposioHQ/awesome-claude-skills` (largest reach). Submit to both rather than picking one, since they appear to be independently maintained lists rather than a single canonical registry.
- **Secondary/backup:** `Prat011/awesome-llm-skills` (smaller reach, has a template-driven contribution pattern that may be lower-friction) and `BehiSecc/awesome-claude-skills` (second major list with overlapping scope to Composio's).
- **Do not treat as a near-term target:** `anthropics/skills` — its own community asks (as of this scan) whether external submissions are even reviewed. Revisit once/if Anthropic publishes a `CONTRIBUTING.md` or answers the open discussions.
- **Out of scope entirely for this project as currently built:** MCP server directories (Glama, Smithery, npm `mcp-submit`) — this project ships `SKILL.md` contracts, not MCP servers; don't conflate the two ecosystems in future promotion planning.
- **Open gap:** no agent-skill-specific community (subreddit, Discord) with clear submission norms was found in this pass. Worth a dedicated, deeper search closer to promotion time rather than assuming the awesome-lists double as communities.

## 4. What this changes about the promotion plan

Nothing in `docs/BACKLOG.md`'s promotion order should change based on this
scan — the finding reinforces it. Because at least one comparable Mermaid
agent-skill project (`Agents365-ai/mermaid-skill`) already publicly claims a
validation loop, the cost of *not* finishing the Mermaid trio to Validated
maturity before any public claim is higher than previously assumed: a
half-finished submission would be directly compared against a project that
already ships the feature. This is a reason to hold the line on
`docs/PUBLISHING.md`'s existing gate, not a reason to rush.
