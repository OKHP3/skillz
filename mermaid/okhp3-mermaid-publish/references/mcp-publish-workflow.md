# Mermaid Chart MCP Publish Workflow

Use the Mermaid Chart connector only when it is available and the user has authorized sharing the diagram content.

## Availability check

1. Confirm the connector/tool is present in the current runtime.
2. Confirm the diagram has passed core Gates 1 to 3.
3. Confirm the user wants a shareable or team-visible artifact.
4. If any check fails, render locally or return source only and say why.

## Publish sequence

Validated `.mmd` content -> connector save call -> capture returned share link and artifact ID -> re-open or fetch the published artifact when supported -> record status. If the save fails, preserve the local render and report the connector error without retrying blindly.

## Registry capture

On success, write the returned link or ID into the diagram's registry row and change status from `validated` to `published`. Record the publish time and target account or workspace only when it is safe to do so.

## Consent for shared/team diagrams

If the destination is team-visible or persistent, warn the user before sending proprietary, personal, or confidential diagram content. Do not treat connector availability as consent.
