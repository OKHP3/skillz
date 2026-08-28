# Phase 1 — Deep recon

**Role:** Senior Software Engineer + Solution Architect (reading the system **as-is**;
not designing changes).
**Goal:** Build an evidence-backed understanding of the codebase — structure, data model,
contracts, and where the business logic lives — and validate the Phase 0 claims against it.

"Deep" means **thorough coverage of the high-signal areas, reached selectively** — not
reading every file. See [`../references/recon-heuristics.md`](../references/recon-heuristics.md)
for what to look for and where.

---

## Token discipline (read this first)

On large repos, keep the main context lean:

- **Locate, don't read.** Use search (grep, or LSP symbol lookup — see Navigation mode) to
  find the ~10–15% of files that carry meaning before opening anything.
- **Delegate reading to sub-agents where available.** Dispatch isolated workers to read
  excerpts and return only distilled, cited findings — the raw file dumps stay out of the
  main context. On Claude Code, dispatch the **`codebase-recon-scout`** subagent (one per
  scoped area, in parallel where possible). On other hosts use any generic sub-agent; if none
  is available, read sequentially and excerpt-only.
- **Tiered, not exhaustive.** Do the cheap structural map first and get approval before
  spending budget on deep dives.
- **Cite as you go.** Every finding records `path:line` (or symbol) so it can be verified
  later without re-reading.

---

## Navigation mode — ask the user to choose

Before the deep dives, ask the user how recon should navigate the code, and record the choice
in `docs/_discovery/recon-manifest.md`:

- **grep + sub-agents** *(default, zero setup)* — pattern search plus isolated readers. Works
  on any repo and any host with no dependencies. Slightly less precise at tracing call graphs
  and resolving symbols on very large codebases.
- **Code-intelligence / LSP** — a language-server / code-intelligence MCP for symbol-level
  navigation: go-to-definition, find-references, call hierarchy, type information. More
  precise and cheaper for tracing relationships on large or unfamiliar codebases. **Only
  available when a language server is installed and running and an MCP bridge (e.g. lsp-mcp)
  is registered with the agent** — verify the `lsp_*` (or equivalent) tools are actually
  present before choosing this. Setup: [`../references/code-intelligence.md`](../references/code-intelligence.md).

Ask plainly, for example: *"How should I navigate the code — grep + sub-agents (no setup), or
a code-intelligence / LSP server if you have one configured? Grep is the default."*

Rules:

- If the user picks **LSP** but no server is available or configured, say so and **fall back
  to grep** rather than stalling.
- The two are **not exclusive** — you may lead with LSP for structure and relationships and
  still use grep for text patterns (enum values, message strings). Use whichever fits each
  lookup.
- Record the chosen mode (and any LSP server used) in the recon manifest so later runs and the
  provenance trail reflect how findings were obtained.

---

## Tier 0 — Structural map (cheap, get approval)

Produce a quick orientation, then pause for the user to approve deeper spend:

- Directory/module layout and apparent boundaries.
- Language(s), frameworks, build/dependency manifests.
- Entry points (main/app bootstrap, HTTP servers, CLI, workers, scheduled jobs).
- Rough size (file/line counts) so the cost of deep dives is visible.

Record the map in `discovery-state.md`. Ask the user to confirm scope of deep dives before
continuing (especially on large repos).

---

## Tier 1 — Targeted deep dives

Dive only where knowledge concentrates. For each, capture findings with citations.

### a. Data model — the domain falls out here
ORM entities/models, DB migrations, schema files, DTOs. Extract entities, key attributes,
relationships/cardinality, and any state/status fields (candidate lifecycles).

### b. Contracts & edges — workflows and boundaries
API routes/controllers, GraphQL schema, event/queue producers & consumers, external service
clients, scheduled jobs. These reveal use cases, actors, triggers and integration points.

### c. Business-logic hotspots — the rules live here
Service/domain layer, validation, conditionals on domain fields, state transitions,
permission/authorization checks, calculations, and **enums / constants / error & validation
messages** (these often carry the literal business language and rules). See recon-heuristics
for detection patterns.

### d. Tests as behavioural spec
Read the test suite as an encoding of expected business behaviour — test names and
assertions frequently state rules the code doesn't comment. Treat confirmed test behaviour
as strong (but still code-level) evidence.

---

## Validate the Phase 0 claims

For every `[unverified]` claim harvested in Phase 0, check it against what recon found and
set its status:

- **Accepted** — matches the code → remove the flag (accepted knowledge is unmarked). Record
  the supporting evidence in `traceability-index.md`.
- **`[outdated]`** — the code shows it is no longer true → record the claim, the code
  evidence, and a **suggested corrected statement derived from the code**.
- **`[contradicted]`** — sources disagree and it's unresolved → record both sides.
- **`[unverifiable]`** — can't be settled from code alone → carry into the interview.

Log outdated/contradicted items in `assumptions-register.md`; they become interview
questions and feed the doc-drift summary.

---

## Optional: git history (low-weight)

If git tooling is available, mine it **selectively**, not wholesale — most commit messages
carry no domain language:

- Commits referencing tickets/issues; merge/PR descriptions (usually richer than commits).
- History on a **specific** business-logic hotspot ("when did this threshold change, why").

Anything found is tagged `[assumption]` at low confidence and goes to the interview — never
straight into a business rule. If git tooling is unavailable, skip and note it.

---

## Produce recon hypotheses

Output a structured, cited set of hypotheses that seeds the interview — organised by the
target doc areas: architecture, domain model, business rules, workflows, glossary terms,
requirements. Each hypothesis carries evidence (`path:line`) and a confidence (High/Med/Low).

Update `recon-manifest.md` with the source files read (path + hash/timestamp) so future runs
can detect staleness.

---

## Exit criteria

- Tier 0 map approved; targeted dives complete for data model, contracts, hotspots, tests.
- Every Phase 0 claim re-statused (accepted / outdated / contradicted / unverifiable).
- Cited hypotheses produced for each doc area.
- Assumptions register and traceability index updated; recon manifest records sources.
- Ready for the interview (full mode) or synthesis (code-only mode).
