# C4 Patterns

## Layer definitions

- Context: the system, users, and external systems. Use for boundary and purpose.
- Container: deployable applications, services, stores, and queues inside the system boundary.
- Component: major responsibilities inside one container. Do not mix unrelated containers.
- Code: classes or modules. Prefer `okhp3-mermaid-data` class diagrams when code detail is the actual request.

## Mermaid syntax per layer

Use the C4 syntax only when the target renderer supports the required C4 extension. Otherwise use a flowchart with explicit boundary subgraphs and state that it is C4-informed rather than strict C4 syntax.

## Cross-layer naming consistency

Keep stable IDs and display names for the same actors, systems, containers, and stores across views. Before delivery, compare the Context and Container diagrams and record renamed, split, merged, or removed elements in the registry note.
