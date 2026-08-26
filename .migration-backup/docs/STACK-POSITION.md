# skillz: Stack Position

`skillz` is the executable agent-skill substrate for the OKHP³ Visual Language Stack.

It packages reusable methods into durable, portable, agent-readable execution contracts. The format is `SKILL.md`. The result is a task that stops needing a human in the loop.

---

## Conceptual Evolution

The progression that produced this repo:

```
mega-prompt
→ reusable prompt kit
→ repo-scoped instruction file (AGENTS.md)
→ SKILL.md
→ portable agent execution contract
→ composable skill family
```

A mega-prompt is authored once, used once, and forgotten.
A SKILL.md is authored once and reused indefinitely.
A skill family is a set of related contracts that compose into a coherent system.

`skillz` is the stable home for that evolution.

---

## Stack Map

```
ReFolDec
  Recursive folding/unfolding theory and transformation grammar.
  Names the operations. Does not execute them.

skillz
  Packages ReFolDec transformations into agent-executable contracts.
  The execution layer.

Mermaid Theme Builder
  Visual governance layer.
  Defines palette tokens, semantic class bundles, and renderer profiles.
  okhp3-mermaid-core pulls its classDef recipes from here.

BPMN for Mermaid
  Process-structure and notation layer.
  Vocabulary catalog for BPMN 2.0 semantics expressed in Mermaid syntax.
  okhp3-mermaid-bpmn draws its element patterns from here.

PathScrib-R / Flowpilot Scribbler
  Process-capture agent lineage.
  The recurring work that okhp3-process-capture and the BPMN family formalize.
  Treated as ancestry, not as a live component.
```

---

## ReFolDec Relationship

ReFolDec names recursive transformations across representation types:

- **Fold** — compress a complex artifact into a more abstract form (idea → diagram, process → SKILL.md)
- **Unfold** — expand an abstract artifact into its primitives (diagram → process narrative, SKILL.md → steps)
- **Refold** — re-express an artifact in a different representation type (diagram → documentation, documentation → SKILL.md)

`skillz` packages these operations as executable contracts.

The `refolddec/` family is the skill home for ReFolDec-native operations.
The `mermaid/` family executes fold/refold operations in the visual domain.
The `process-capture/` family executes fold operations in the process domain.

---

## Visual Language Stack: Layer Responsibilities

| Layer | What it governs | Where it lives |
|---|---|---|
| ReFolDec | Transformation theory | `refolddec/` family + docs |
| skillz | Execution contracts | This repo |
| Mermaid Theme Builder | Visual palette + renderer profiles | External repo (OKHP3/mermaid-theme-builder) |
| BPMN for Mermaid | Process notation vocabulary | External repo (OKHP3/mermaid-diagram-bpmn) |
| okhp3-mermaid-core | Audience, type selection, design system, validation | `mermaid/okhp3-mermaid-core/` |
| okhp3-mermaid-bpmn | BPMN semantics in Mermaid | `mermaid/okhp3-mermaid-bpmn/` |
| okhp3-mermaid-publish | Render, export, MCP publish | `mermaid/okhp3-mermaid-publish/` |

---

## Private / Public Boundary

The OKHP³ Visual Language Stack includes a governance-profile pattern developed through enterprise Mermaid styling work. That work is private provenance.

What is public:

- The governance profile concept (see `mermaid/README.md` — Governance Model section)
- The skill contracts that implement it
- The palette system published via Mermaid Theme Builder

What is not public:

- Any employer-specific color values, system names, or branded artifacts
- Internal process examples tied to identifiable organizations

This boundary is enforced in every skill via the BFS exclusion rule. See `SECURITY.md`.

---

## Why This Architecture

A skill that handles audience adaptation, semantic validation, multi-diagram coherence, and publish routing is not a prompt. It is infrastructure.

`skillz` is the infrastructure layer that makes the Visual Language Stack portable, agent-executable, and durable across runtimes.
