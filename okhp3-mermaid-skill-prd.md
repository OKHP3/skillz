# OKHP3 Mermaid Ecosystem Agent Skill

## Competitive Teardown + Requirements PRD

**Classification:** OKHP3 Internal — Personal Brand IP  
**Status:** Draft v0.1  
**Author:** Jamie Hill / OverKill Hill P³  
**Date:** June 2026

-----

## 0. Attribution: The Direct Answer

Looking at existing community skills for inspiration is competitive intelligence, not plagiarism.

The legal boundary is clear. Ideas, approaches, workflow patterns, and design decisions are not copyrightable. Specific written text is. The “clean room” principle applies: you studied the problem space (via research), observed how others solved it, and then independently authored your own solution in your own words. Your solution may share structural patterns with existing skills because those patterns are correct solutions to shared problems — not because you copied.

**Practical rules for OKHP3:**

If you quote or directly copy any text verbatim, attribute it. If you independently write content that solves the same problem in the same general way, you owe nothing beyond professional courtesy. For Apache 2.0 licensed work, attribution is required only for derivative works that include their actual content.

**Recommended posture:** Add a single line to your README: `Informed by the community Mermaid skill ecosystem (2025–2026).` This is accurate, professional, and OKHP3-appropriate. It credits the field without implying dependence.

You did not steal their homework. You reviewed it for weaknesses, identified the gaps, and decided to solve the problem properly. That is exactly what competition looks like.

-----

## 1. Landscape Scan — Skills Reviewed

|Skill                    |Author                  |Fork Origin                                  |Stars  |Last Activity          |License|
|-------------------------|------------------------|---------------------------------------------|-------|-----------------------|-------|
|`mermaid-diagram-skill`  |mgranberry              |Forked from coleam00/excalidraw-diagram-skill|4      |~Feb 2026              |Unknown|
|`mermaid-skill`          |WH-2099                 |Original                                     |Unknown|Active (GitHub Actions)|Unknown|
|`mermaid-diagrams`       |softaworks/agent-toolkit|Original (in toolkit)                        |Unknown|~Jan 2026              |Unknown|
|`mermaid-skill`          |Agents365-ai            |Original                                     |Unknown|May 2026               |Unknown|
|`mermaid-diagram` (bonus)|wanshuiyin              |Original                                     |Unknown|~Mar 2026              |Unknown|
|`beautiful-mermaid`      |intellectronica         |Original                                     |Unknown|Unknown                |Unknown|

**Key finding before the teardown:** mgranberry is a fork of an Excalidraw skill. The Mermaid conversion carries Excalidraw DNA throughout — including architectural assumptions designed for a different tool entirely.

-----

## 2. Individual Skill Teardown

### 2.1 mgranberry/mermaid-diagram-skill

**Surface strength:** The most instructionally complete of the four. The “Diagrams should ARGUE, not DISPLAY” philosophy is genuinely good cognitive framing. The Isomorphism Test is memorable. The 22-item quality checklist is thorough.

**Structural problem 1 — Forked identity crisis.**
This skill was forked from an Excalidraw diagram skill and retooled. The Excalidraw DNA is visible in the shape of the instructions (freeform layout logic, the “you cannot pixel-position elements” warnings, the visual argument framing). These imports are partially valid in Mermaid context, but the skill was not designed for Mermaid from first principles. It was retrofitted.

**Structural problem 2 — Developer tunnel vision.**
Every example, every heuristic, every “evidence artifact” concept is software architecture-centric. “Real JSON payloads.” “Actual event names.” “Real API endpoints.” This skill is built for people documenting software systems. Enterprise process work — business workflows, governance flows, approval chains, cross-department handoffs — is invisible. BPMN doesn’t exist anywhere in the file. Swim lanes are not mentioned. The word “process” appears only in reference to “Processing” as a generic node label to avoid.

**Structural problem 3 — The exclusion list.**
The skill explicitly prohibits Gantt charts and User Journey diagrams as “too narrowly specialized.” This is a design opinion masquerading as a hard rule. For business process work, Gantt is a legitimate timeline representation. For service design, User Journey is a named Mermaid diagram type with real enterprise use cases. The exclusion list will confuse agents when users legitimately request these types.

**Structural problem 4 — The cleanup instruction destroys the artifact.**
The quality checklist ends with: “Once a user is happy with the output, remove any temporary output like pngs or mmd files.” This instruction tells the agent to delete the rendered output that the user wanted. The file is the deliverable. Deleting it is the failure mode, not the success state.

**Structural problem 5 — Hard Node.js dependency.**
The render pipeline requires Node.js and npm via `npx --yes @mermaid-js/mermaid-cli`. On first run this downloads mmdc ephemerally (~30s warning). In environments without Node (including some Claude agentic setups), the entire render pipeline breaks silently. There is no fallback.

**Structural problem 6 — No MCP awareness.**
The skill was authored before or without knowledge of the Mermaid Chart MCP integration. Diagrams are created, validated, and then… stored locally or deleted. No publish path. No sharing path. No integration with the Mermaid Chart cloud service that already exists as an available connector.

**Structural problem 7 — Low commit velocity, no versioning.**
Six total commits. No releases. No versioning in the frontmatter or manifest. No update path. A skill with six commits and no release tags is a personal experiment, not a production artifact.

**Genuine strengths worth acknowledging:**

- The Design Process steps are well-sequenced (assess → research → understand → map → sketch → generate → validate)
- The Decision Matrix pairing visual patterns to diagram types is useful
- Single-file theming (`mermaid-theme.md`) is architecturally correct
- Syntax-pitfalls as a dedicated reference file is the right progressive disclosure pattern
- The line-crossing reduction guidance is technically accurate and underrepresented elsewhere

-----

### 2.2 WH-2099/mermaid-skill

**Surface strength:** The auto-sync GitHub Action is the most forward-thinking maintenance mechanism of any skill in this set. Pulling updated syntax docs from the official mermaid-js repo weekly means the reference files stay current without manual intervention.

**Structural problem 1 — Pure reference manual, no workflow.**
This skill tells you how to write Mermaid syntax. It does not tell you how to design a good diagram. There is no methodology. No decision framework. No quality criteria. No validation loop. An agent using this skill will produce syntactically correct Mermaid that may be visually incoherent.

**Structural problem 2 — Upstream dependency is also a risk.**
The auto-sync mechanism that is a strength is also a liability. If the mermaid-js repo restructures its documentation (they have done this before), the sync will pull garbage or break entirely. There is no validation on the sync output. The skill has no mechanism to detect that its reference files have become incorrect.

**Structural problem 3 — No rendering or validation.**
No mmdc integration. No validation loop. No quality checklist. The agent writes syntax and outputs it. Whether it renders is the user’s problem. For a general-purpose skill this is acceptable. For anything requiring precision, it’s inadequate.

**Structural problem 4 — No design guidance.**
There is zero guidance on choosing diagram types, structuring content for audience, managing diagram complexity, or producing output that communicates effectively. It’s a syntax encyclopedia, not a diagramming skill.

**Structural problem 5 — No BPMN, no enterprise process content.**
Same gap as every other skill in this set. The references are: flowchart, sequenceDiagram, classDiagram, stateDiagram, gitGraph, gantt, pie, erDiagram, timeline, mindmap, C4Context. No swim lanes as a first-class concept. No BPMN gateway semantics. No process modeling vocabulary.

**Genuine strengths worth acknowledging:**

- Auto-sync from upstream is the best maintenance story of any skill reviewed
- Full type coverage including types others exclude
- Clean, simple structure (SKILL.md + references/)
- The right instinct that syntax documentation should be in reference files, not the skill body

-----

### 2.3 softaworks/agent-toolkit — `mermaid-diagrams`

**Surface strength:** The most minimal and cleanest SKILL.md body of the four. Doesn’t overcrowd itself with instructions. Good progressive disclosure instinct.

**Structural problem 1 — Not a standalone skill.**
This skill lives inside a larger `agent-toolkit` repository. Discovery, installation, and triggering are all more complex than a standalone skill. The triggering description (“Comprehensive guide for creating software diagrams using Mermaid syntax”) is vague and will underfire. The agent won’t load it when it should.

**Structural problem 2 — No workflow direction.**
The skill body is essentially: here are the diagram types, here are the reference files, here are some tools. There is no step-by-step process. No quality criteria. No validation. The agent is expected to figure out the rest from the reference files alone.

**Structural problem 3 — Weakest reference architecture.**
Nine types covered. The reference files exist but there is no decision matrix, no guidance on when to use which type, and no synthesis of how the types relate. A diagram type selection decision is left entirely to the agent’s general knowledge.

**Structural problem 4 — Manual validation.**
“Validate — Test in Mermaid Live Editor.” This is user-side manual validation. There is no programmatic validation. The agent cannot close the render loop.

**Structural problem 5 — Tool options but no scripted execution.**
Docker and CLI options are mentioned but neither is scripted. The agent is told “here are tools you could use” without any automation to actually use them. This is reference material masquerading as a skill.

**Structural problem 6 — Static, no update mechanism.**
Part of a toolkit maintained by softaworks. No auto-sync. No versioning strategy. No cadence. The references will drift from the actual Mermaid spec silently.

**Genuine strengths worth acknowledging:**

- The cleanest progressive disclosure structure of the four (thin SKILL.md body, dense references)
- Includes C4 architecture references (understated but useful)
- The README is well-organized and clear about scope

-----

### 2.4 Agents365-ai/mermaid-skill

**Surface strength:** The most technically robust render pipeline of the four. Validation-first (.mmd parsed before export), multi-backend (mmdc + Kroki API fallback), multi-format output (PNG/SVG/PDF), multi-platform targeting (Claude Code, Cursor, Copilot, OpenClaw, Codex, Hermes). Active maintenance (May 2026 update).

**Structural problem 1 — Kroki is a privacy risk for enterprise use.**
The Kroki fallback sends diagram source to `kroki.io`, a public cloud API. For any diagram that contains proprietary process information, organizational structure, or confidential workflow details, this is a data leak. The skill does not warn about this. It presents Kroki as a transparent fallback. In enterprise/knowledge work contexts, Kroki is a liability, not a feature.

**Structural problem 2 — Marketplace-optimized, not quality-optimized.**
The README is dense with installation instructions for every platform, indexed on SkillsMP AND ClawHub, promoted as part of the “365-skills family.” The skill has clearly been engineered for discovery and distribution. The quality of diagrams produced is secondary to the breadth of platforms supported.

**Structural problem 3 — Includes diagram types that undermine coherence.**
Pie charts are included (“11+ types including pie chart”). Pie charts have virtually no structural argument capability and are a known bad-practice diagram type for complex information. Including them signals completeness optimization over quality optimization.

**Structural problem 4 — No design methodology.**
Same gap as the others. The skill validates and renders. It does not guide the agent on what makes a good diagram, how to choose a type, or how to serve different audiences. It is a technically excellent render pipeline wrapped around design agnosticism.

**Structural problem 5 — Dependency surface is highest of the four.**
mmdc OR Kroki OR both. Each has installation and availability requirements. The “zero-config” claim is marketing language. Kroki requires network access to an external public API. mmdc requires Node.js. The actual zero-config scenario is narrow.

**Structural problem 6 — Commercial framing.**
The skill is part of a commercial-feeling ecosystem (365-skills, SkillsMP, ClawHub). This is not inherently a problem, but it means the roadmap is commercial rather than craft-driven. The priority is adding supported platforms, not improving diagram design guidance.

**Genuine strengths worth acknowledging:**

- Best render robustness of any skill reviewed (dual-backend, multi-format)
- Validation-first workflow is the correct approach and better than mgranberry’s render-then-fix approach
- Active maintenance cadence
- The most honest about its multi-platform targeting
- Plugin-ready for Claude Code marketplace

-----

### 2.5 Bonus: wanshuiyin/Auto-claude-code-research-in-sleep

**Not a production skill (embedded in a research repo), but contains patterns worth studying.**

**What it does right:**

- Score-based acceptance criteria (won’t accept below 9/10) is a genuine quality gate
- STRICT verification checklist for arrow directions and block content is the right instinct
- Dual-output format (.mmd + .md) is a thoughtful authoring pattern — the .mmd is the source, the .md is the embedded presentation artifact
- Context7 MCP integration for up-to-date Mermaid docs is the right architecture

**Problems:**

- Score is self-assessed by the same agent that produced the diagram (unverifiable)
- “NEVER accept score < 9” with no rubric for scoring is aspirational without being actionable
- Deeply buried in an unrelated research repo (no discovery, no distribution)

-----

## 3. Cross-Cutting Failures Across All Skills

These weaknesses appear in every skill reviewed:

**3.1 BPMN is completely absent.**
Not one of the community Mermaid skills addresses BPMN semantics. Swim lanes, event types (start, intermediate, end, timer, message, error), gateway types (exclusive, inclusive, parallel, event-based), task types (user, service, script, send, receive), subprocesses, boundary events, associations, and annotations — none of this vocabulary exists in any skill payload reviewed. The entire enterprise process modeling discipline is unserved.

**3.2 No multi-diagram coherence model.**
Every skill assumes one diagram at a time. None address naming conventions across a diagram family, cross-references between diagrams, version alignment when process diagrams evolve together, or the architecture of a 10–15 diagram BPMN model. Producing a coherent set of process diagrams is a fundamentally different problem than producing one diagram, and no skill addresses it.

**3.3 No audience-adaptive output mode.**
Executive-facing vs. business analyst-facing vs. developer-facing diagrams of the same process differ significantly in density, vocabulary, and visual hierarchy. No skill has an audience selection step. The diagram produced for a VP is the same one produced for a developer. This is a workflow failure, not just a quality failure.

**3.4 No MCP integration layer.**
The Mermaid Chart MCP (`chatgpt.mermaid.ai`) exists. It can save diagrams, generate shareable links, and interface with the Mermaid Chart cloud service. Not one community skill is aware of this. The render pipeline terminates at a local PNG. There is no publish path, no share path, no embed-link generation.

**3.5 The validation loop is syntax-only, not semantic.**
Every render validation loop checks: “Does this parse? Does mmdc accept it?” None check: “Does this diagram correctly represent what the user described? Are the arrows directionally correct? Do the labels match the described entities? Is the process flow logically accurate?” Syntax validation without semantic validation produces diagrams that render but lie.

**3.6 No governance or naming convention system.**
No skill provides a file naming convention, a diagram registry pattern, or guidance on how to organize a growing library of diagrams. The output of every skill is an orphaned file.

**3.7 All are developer-centric in assumption and vocabulary.**
The skills were authored by developers for developers diagramming software systems. Enterprise process work — HR onboarding, procurement flows, approval chains, governance workflows — is systematically outside the design envelope of every skill reviewed.

-----

## 4. OKHP3 Mermaid Ecosystem — Requirements PRD

### 4.1 Design Position

The OKHP3 Mermaid ecosystem occupies a space none of the community skills touch: enterprise process intelligence delivered as precision diagramming infrastructure.

The positioning statement: **Process Clarity as a Professional Discipline.**

Not “make diagrams.” Not “visualize architecture.” Define, document, and communicate business processes with the rigor of a structured methodology and the aesthetics of intentional visual design.

### 4.2 Guiding Principles

**P1 — Precision over breadth.**
OKHP3 skills do fewer things better, not more things tolerably. The ecosystem covers BPMN-informed process modeling. It does not try to be a universal diagram generator.

**P2 — Sovereignty first.**
No diagram source leaves the local environment without explicit user authorization. No Kroki. No public API fallbacks without a consent prompt. Diagram content may be proprietary. Treat it accordingly.

**P3 — Audience-first output.**
Every diagram begins with an audience declaration. The output adapts accordingly. Executive output is not the same as analyst output. The skill enforces this distinction.

**P4 — Coherent families over orphaned files.**
Diagrams are not files. They are members of a family. Every output establishes its relationship to the broader diagram set it belongs to.

**P5 — MCP-aware by default.**
The Mermaid Chart MCP is the publish layer. The skill authoring pipeline produces source. The MCP integration publishes it. These are two distinct phases, and both are first-class.

**P6 — Semantic validation, not just syntax validation.**
The validation loop checks correctness of representation, not just parseability of syntax.

### 4.3 Skill Architecture — The Array

The OKHP3 Mermaid ecosystem is a skill array (later promotable to a plugin). Five skills, one coherent system.

-----

#### SKILL 1: `okhp3-mermaid-core`

**Role:** Foundation layer. Type selection, theming, validation framework, naming conventions, and diagram registry.

**Responsibilities:**

- Audience declaration protocol (Executive / Analyst / Technical — each with defined density and vocabulary rules)
- Diagram type decision matrix (BPMN-informed, not developer-informed)
- OKHP3 visual design system (color palette, classDef library, semantic style registry — dark/light mode compliant)
- File naming convention enforcement (`[domain]-[process]-[view]-[audience]-v[version].mmd`)
- Diagram registry pattern (a `DIAGRAMS.md` index maintained alongside diagram files)
- Validation framework definition (syntax gate + semantic gate + audience-fit gate)
- MCP availability check (determine if Mermaid Chart MCP is connected before rendering)

**References:**

- `references/type-selection-matrix.md` — Full decision matrix: process intent → diagram type → reference
- `references/design-system.md` — OKHP3 color palette, classDef recipes, dark/light guidelines
- `references/naming-conventions.md` — File naming, diagram ID patterns, registry schema
- `references/audience-profiles.md` — Executive / Analyst / Technical definitions and output rules

-----

#### SKILL 2: `okhp3-mermaid-bpmn`

**Role:** BPMN-informed process modeling. The primary enterprise content skill.

**Responsibilities:**

- BPMN 2.0 semantic vocabulary in Mermaid syntax (swim lanes via subgraph, gateway types via node shapes, event types via styling)
- Gateway decision logic (XOR/exclusive, AND/parallel, OR/inclusive, event-based)
- Task type encoding (user task, service task, script task, send/receive)
- Event type encoding (start, intermediate, end, timer, message, error, signal, terminate)
- Subprocess handling (collapsed vs. expanded, call activities)
- Annotation and association patterns
- Cross-diagram reference linking (when a subprocess becomes its own diagram)
- Swim lane layout guidance (multi-department, cross-functional, horizontal vs. vertical)
- Process instance vs. process definition distinction

**References:**

- `references/bpmn-elements.md` — Full BPMN 2.0 element catalog with Mermaid syntax equivalents
- `references/gateway-patterns.md` — Decision point encoding, branching logic, convergence
- `references/swimlane-layouts.md` — Multi-lane subgraph patterns, direction guidance, crossing reduction
- `references/subprocess-patterns.md` — Nested process handling, call activity linking
- `references/process-examples/` — Validated .mmd examples (approval-flow, onboarding, procurement)

-----

#### SKILL 3: `okhp3-mermaid-architecture`

**Role:** System and solution architecture diagrams. C4, flowchart, and context diagrams for technical audiences.

**Responsibilities:**

- C4 model layering (Context → Container → Component → Code)
- Solution architecture patterns (integration flows, service topology, data flows)
- Architecture-beta diagram type guidance (the newer Mermaid architecture syntax)
- Infrastructure and deployment diagrams
- Cross-diagram zoom coherence (the same system at multiple levels of abstraction)

**References:**

- `references/c4-patterns.md`
- `references/architecture-beta.md`
- `references/solution-patterns.md`

-----

#### SKILL 4: `okhp3-mermaid-data`

**Role:** Data model and relationship diagrams.

**Responsibilities:**

- ERD (entity-relationship) modeling
- Class diagram authoring
- Schema documentation patterns
- Cardinality encoding conventions

**References:**

- `references/erd-syntax.md`
- `references/class-diagram-syntax.md`
- `references/schema-documentation-patterns.md`

-----

#### SKILL 5: `okhp3-mermaid-publish`

**Role:** Output management, MCP integration, and sharing pipeline.

**Responsibilities:**

- MCP availability check and routing (Mermaid Chart MCP vs. local render)
- Local render pipeline (mmdc with graceful Node.js detection — fail informatively, not silently)
- Render output management (never delete user artifacts — the output IS the deliverable)
- Mermaid Chart MCP publish workflow (save diagram, generate shareable link, capture link in diagram registry)
- Embed format generation (fenced block for .md, standalone .mmd, linked .html)
- Diagram version increment protocol

**References:**

- `references/render-pipeline.sh` — Local render script with Node.js detection and graceful failure
- `references/mcp-publish-workflow.md` — Step-by-step MCP integration protocol
- `references/output-formats.md` — Format selection guide (.mmd / fenced block / linked)

-----

### 4.4 Validation Protocol (Cross-Skill)

The OKHP3 validation protocol has three gates. All three must pass before output is delivered.

**Gate 1 — Syntax.**
mmdc parses the .mmd without error. If mmdc is unavailable, Mermaid Live Editor validation is the fallback (user-side, explicitly flagged as manual).

**Gate 2 — Semantic.**
The agent reviews the rendered output against the original user request:

- Are all named entities present?
- Are all stated relationships represented by edges?
- Are arrow directions correct (A causes B, not B causes A)?
- Do gateway branches account for all stated conditions?
- Are swim lane assignments correct?

A diagram with correct syntax that misrepresents the process is a failure. Gate 2 exists because Gate 1 cannot catch it.

**Gate 3 — Audience Fit.**
Does the output match the declared audience profile?

- Executive: 5–7 nodes max, no attribute details, no edge labels longer than 3 words
- Analyst: 10–20 nodes, gateway labels, swim lanes, subprocess references
- Technical: full annotation, attribute details, companion .md for complex payloads

-----

### 4.5 What OKHP3 Explicitly Does NOT Do

These are intentional scope boundaries, not omissions:

- No Pie Charts (no structural argument capability)
- No XY Charts (quantitative charting, not process modeling)
- No public API diagram rendering without user consent (Kroki requires explicit opt-in)
- No git graphs (out of scope for enterprise process work)
- No agent-generated artifact deletion

-----

### 4.6 Success Criteria

A complete and successful OKHP3 Mermaid ecosystem output will:

1. Begin with audience declaration
1. Reference the appropriate skill (core → domain skill) through progressive disclosure
1. Apply the OKHP3 design system (not default Mermaid theming)
1. Pass all three validation gates
1. Write output to a named file following the naming convention
1. Register the diagram in `DIAGRAMS.md`
1. Offer a publish path (MCP if available, local file if not)
1. Never delete a rendered artifact

-----

## 5. Differentiation Summary

|Capability             |mgranberry       |WH-2099|softaworks|Agents365 |**OKHP3**                |
|-----------------------|-----------------|-------|----------|----------|-------------------------|
|Design methodology     |Yes (dev-centric)|No     |No        |No        |**Yes (process-centric)**|
|BPMN semantics         |No               |No     |No        |No        |**Yes**                  |
|Swim lanes             |No               |No     |No        |No        |**Yes**                  |
|Audience adaptation    |No               |No     |No        |No        |**Yes**                  |
|Multi-diagram coherence|No               |No     |No        |No        |**Yes**                  |
|MCP integration        |No               |No     |No        |No        |**Yes**                  |
|Semantic validation    |No               |No     |No        |No        |**Yes**                  |
|Naming conventions     |No               |No     |No        |No        |**Yes**                  |
|Diagram registry       |No               |No     |No        |No        |**Yes**                  |
|Privacy-safe rendering |Partial          |Yes    |Yes       |No (Kroki)|**Yes**                  |
|Docs auto-sync         |No               |Yes    |No        |No        |Planned (v1.1)           |
|Multi-format output    |No               |No     |No        |Yes       |**Yes**                  |
|Plugin-ready           |No               |No     |No        |Yes       |**Planned**              |

-----

## 6. Next Steps

**Phase 1 — Core + BPMN (immediate)**
Author `okhp3-mermaid-core` and `okhp3-mermaid-bpmn` as the minimum viable skill pair. These are the unique value. Everything else is infrastructure.

**Phase 2 — Architecture + Data**
Author `okhp3-mermaid-architecture` and `okhp3-mermaid-data`. These close the general-use gap against community skills.

**Phase 3 — Publish**
Author `okhp3-mermaid-publish` after confirming Mermaid Chart MCP capabilities and local render script stability.

**Phase 4 — Plugin**
Package the five-skill array as `okhp3-mermaid.plugin`. Add `plugin.json` manifest and a `CONNECTORS.md` documenting the Mermaid Chart MCP dependency.

**Phase 5 — Contribution**
Evaluate publishing `okhp3-mermaid-bpmn` as a standalone community contribution to agentskills.io. BPMN is an unserved gap in the ecosystem. OKHP3 can own that category.