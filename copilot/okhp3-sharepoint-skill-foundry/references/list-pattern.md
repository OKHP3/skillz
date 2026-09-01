# List skill pattern

Choose this pattern when the task acts on SharePoint list items, statuses,
fields, views, or a list-backed business process.

## Required context

- Site and list name/URL or an explicit host selection.
- Relevant view/filter and selected items; never infer all list items.
- Field schema: display name, internal name where known, type, required status,
  controlled values, and status definitions.
- Item ID/evidence rule and the current user's expected permission boundary.

## Required output fields

Return item ID, current value, proposed value or classification, evidence,
confidence/ambiguity, and review requirement. A write proposal must name every
item ID and field with before/after values.

## Do not collapse these concepts

| Keep distinct | Why |
| --- | --- |
| Display field name and internal field name | A field label is not reliable enough for a write contract. |
| Suggested status and applied state transition | A classification may require an owner decision or host-supported update. |
| View/filter and authority boundary | Seeing items in a view does not authorize broad changes. |
| Missing value and a guessed value | Unknown data must remain `unknown` or `NEEDS INPUT`. |
