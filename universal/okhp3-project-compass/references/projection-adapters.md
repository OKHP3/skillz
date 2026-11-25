# Pluggable sinks

`.compass/objectives.json` is the committed source of truth. The tracking mode controls which evidence to read. The sink controls where a human sees the same records. A folder can use either tracking mode with the default files sink.

| Adapter | Input | Identity and output |
|---|---|---|
| Files (default) | Local objectives and tasks | Render stable IDs, scoped titles, statuses and evidence links in managed Markdown blocks. Mode B can render roadmap and backlog blocks with `compass_views.py`. |
| GitHub (optional) | Mode A state and the pointer index | Match ID markers to issue and milestone numbers. Pull with read access, reconcile before showing a manual plan, and record confirmed results. |
| Future Notion database | Validated local state and an explicitly chosen database | Match a dedicated text property holding the full Compass ID. Store the returned page ID as a local pointer. Require a live operator for external writes. |

## Adapter contract

1. Read the same versioned state in either mode. Ignore unknown additive fields. A sink must preserve the project key and original item ID on every rerun.
2. Match using `(project_key, id)`. Report remote-only, local-only, ambiguous and conflicting records separately. Keep new goals proposed.
3. Return a reviewable list of operations. A duplicate marker, truncated inventory or unknown destination blocks creation. An enabled flag expresses preference and carries no write authority.
4. Report each completed operation with a sanitized remote reference. Record partial success before retrying and pull again to avoid duplicates.
5. On a schedule, write only the authorized local files. Omit raw external bodies, sensitive metadata and private terms from everything a sink receives. New adapters implement this contract independently of the discovery and reassessment instructions.

Example optional config entry: `{"id":"notion","type":"notion","enabled":false,"id_property":"Compass ID"}`. A Notion writer is an extension point. A link found in a README does not enable it.
