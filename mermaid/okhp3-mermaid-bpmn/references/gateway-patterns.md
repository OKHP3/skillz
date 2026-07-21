# Gateway Patterns

Use a gateway when the process has a real branching rule. A diamond alone does not communicate semantics; label the gateway and its outgoing conditions.

## Gateway types

| Type | Meaning | Mermaid convention |
|---|---|---|
| Exclusive (XOR) | Exactly one condition is selected | `{XOR: condition}` with mutually exclusive edge labels. |
| Parallel (AND) | All outgoing branches run | `{AND: split}` and a matching `{AND: join}` when paths reconverge. |
| Inclusive (OR) | One or more conditions may run | `{OR: rules}` with independent qualifying labels. |
| Event-based | The first eligible event wins | `{Event: first signal}` with event nodes immediately after it. |

## Branch labeling

Use short, mutually exclusive labels such as `approved`, `rejected`, or `amount > threshold`. For Executive diagrams, move rule detail into a note or decision table. For Analyst and Technical diagrams, include the minimum condition needed to audit coverage.

## Convergence

Use an explicit join for parallel and inclusive paths. A direct edge from the last branch to the next task is acceptable only when the process intentionally continues after one branch; otherwise it hides incomplete synchronization.

## Crossing reduction

Keep the gateway near the decision evidence, order branches from the primary or most likely path to the exception path, and route long branches around the outside of the diagram. Split a gateway-heavy process when labels or reconvergence cannot be read without tracing crossings.
