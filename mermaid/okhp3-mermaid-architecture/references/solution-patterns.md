# Solution Patterns

Use these patterns to choose the smallest diagram that answers the architecture question. Do not combine control flow, data flow, deployment topology, and protocol detail unless the user explicitly needs the combined view.

## Integration flows

- Use `sequenceDiagram` for time-ordered request/response or event interactions between named participants.
- Use a flowchart for routing, retries, branching, or a process that is more important than timing.
- For asynchronous systems, label the queue or topic, producer, consumer, and delivery assumption. Do not imply exactly-once delivery unless the source states it.

## Service topology

- Use `architecture-beta` when groups, boundaries, and spatial topology are central and the renderer supports it.
- Use a flowchart or C4 container view when the audience needs a stable, portable overview.
- Split when edges cross repeatedly, labels collide, or the audience cannot identify the primary path without tracing unrelated connections.

## Data flow diagrams

- Represent stores explicitly and label the data product or record only when the source supports it.
- Use directional edge labels to distinguish data movement from invocation or control flow.
- If the requested data semantics exceed Mermaid's notation, state the limitation and hand off to `okhp3-mermaid-data` or a schema artifact.
