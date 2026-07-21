# Output Format Selection

## Default: `.mmd` file

Use a standalone source file named per core's naming conventions when the diagram is a reusable or renderable artifact.

## Fenced block (embed)

Use a fenced `mermaid` block when the user says “embed”, “add to docs”, or “in the README”, or when the target file is already Markdown. Preserve the source file too when future edits or re-rendering matter.

## Both

Return both source and preview when the diagram is a maintained artifact and a documentation preview. State which file is the source of truth.

## Format vs. MCP publish

Output format and publish destination are separate decisions. A diagram can be a local `.mmd`, an embedded Markdown block, and a published link, provided the user authorizes each destination.
