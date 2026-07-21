# BPMN Element Catalog to Mermaid Syntax

Mermaid does not create a standards-compliant BPMN interchange file. Use these encodings to preserve BPMN-informed meaning in a readable Mermaid diagram, then label any semantic approximation.

## Events

| Meaning | Recommended Mermaid encoding | Rule |
|---|---|---|
| Start | `((Start))` | One or more explicit entry points; label the trigger when known. |
| Intermediate | `([Wait])` | Use a rounded node and state what is awaited or received. |
| End | `((End))` | Label the business outcome, not only “end”. |
| Timer | `([Timer: due date])` | Keep timing assumptions separate from the control-flow edge. |
| Message | `([Message: event])` | Name the message or channel when supplied. |
| Error | `([Error: reason])` | Connect to the recovery path and preserve the normal path. |
| Signal | `([Signal: name])` | Use only for broadcast-style triggers, not ordinary handoffs. |
| Terminate | `((Terminate))` | Use only when all active paths stop. |

## Tasks

Use a rectangular node with a task-type prefix when the distinction changes interpretation: `User: Review`, `Service: Enrich`, `Script: Validate`, `Send: Notify`, `Receive: Acknowledge`, or `Manual: Inspect`. Do not imply automation merely because a node is a rectangle.

## Annotations and associations

Use a quoted note node and a dashed edge for context that must not be mistaken for sequence flow. Keep notes short and attach them to the single element they qualify.

## Validation rule

The label carries the semantic distinction when Mermaid shape support is insufficient. Check that every start event reaches an end event, every gateway path is accounted for, and exception events do not silently disappear from the process.
