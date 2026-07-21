---
name: okhp3-mermaid-bpmn
description: OverKill Hill P³ BPMN-informed process modeling in Mermaid. Use when the user wants a business process, workflow, approval chain, decision or gateway logic, swim lanes, cross-department handoffs, onboarding, procurement, or a diagram of who does what and when. Load okhp3-mermaid-core first for audience, type, naming, and validation, then use this skill for BPMN vocabulary, task and event semantics, lanes, gateways, and subprocess patterns.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-mermaid-bpmn

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

BPMN 2.0-informed semantics, expressed in Mermaid syntax. Loaded after `okhp3-mermaid-core` has handled audience declaration and type selection.

## Swim Lanes

Encoded via `subgraph` per lane (department/role), with `direction` set per lane to control internal flow. See `references/swimlane-layouts.md` for horizontal vs. vertical lane patterns and crossing-reduction specific to multi-lane diagrams.

## Gateways

Four types, each with a distinct visual encoding (node shape/style, not just a label):

- **Exclusive (XOR)** — one path taken, mutually exclusive conditions
- **Parallel (AND)** — all paths taken simultaneously
- **Inclusive (OR)** — one or more paths taken based on conditions
- **Event-based** — path determined by which event occurs first

Full encoding patterns, including how to label branch conditions for Analyst-tier diagrams, in `references/gateway-patterns.md`.

## Events

Start, intermediate, end, timer, message, error, signal, terminate. Each gets distinct node styling (not just different labels) so the diagram is isomorphic to BPMN semantics even when read by someone who knows BPMN notation. Catalog in `references/bpmn-elements.md`.

## Tasks

User task, service task, script task, send/receive task. Distinct shapes per type — this is what makes a diagram "argue" rather than "display" (per the core design philosophy). Catalog in `references/bpmn-elements.md`.

## Subprocesses

Collapsed (single node, expandable) vs. expanded (inline detail) vs. call activity (reference to a separate diagram). When a subprocess becomes its own diagram, register the cross-reference in `DIAGRAMS.md` (per core's naming-conventions.md) and note it on both diagrams. Patterns in `references/subprocess-patterns.md`.

## Annotations & Associations

Text annotations and dashed association lines for adding context without implying flow. Catalog in `references/bpmn-elements.md`.

## Process instance vs. process definition

Be explicit about which is being diagrammed. A process *definition* shows all possible paths; a process *instance* shows one actual run through it. Mixing these in one diagram is a common source of Gate 2 (semantic) failures.

## Worked examples

`references/process-examples/README.md` contains synthetic examples and records their intended audience. Treat examples as patterns, not as evidence for a user's real process.

## Output contract

Every process diagram must state the process boundary, participating lanes or roles, start and end events, gateway semantics, and any unresolved business rule. Use Mermaid syntax for the deliverable, but do not claim that it is a standards-compliant BPMN interchange file. Run the core three gates before delivery.

## References

- `references/bpmn-elements.md` - task, event, subprocess, and annotation vocabulary.
- `references/gateway-patterns.md` - XOR, AND, OR, and event-based gateway encodings.
- `references/swimlane-layouts.md` - lane and crossing-reduction patterns.
- `references/subprocess-patterns.md` - collapsed, expanded, and call-activity patterns.
- `references/process-examples/README.md` - synthetic audience-tier examples.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
