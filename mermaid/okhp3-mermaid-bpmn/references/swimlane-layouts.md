# Swim Lane Layouts

Use one Mermaid `subgraph` per role, department, or external system. A lane is a responsibility boundary, not a decorative container.

## Encoding

- Give each lane a stable short ID and a quoted role label.
- Choose one primary flow direction for the whole diagram. Use a lane-local `direction` only when it improves readability and has been checked in the target renderer.
- Order lanes by the first meaningful handoff or by the operating sequence. Do not rely on source order alone for layout guarantees.

## Multi-lane direction

- Use stacked horizontal lanes for a left-to-right process with several roles.
- Use side-by-side vertical lanes for a top-to-bottom lifecycle or when the role columns are the primary comparison.
- Put the receiving task near the handoff edge and label the edge when the handoff is not obvious.

## Crossing reduction

Keep each handoff local, avoid sending an edge across more than one unrelated lane, and use a note or a separate handoff diagram when a shared service connects many lanes. Split by phase or bounded process, not arbitrarily by lane pair.
