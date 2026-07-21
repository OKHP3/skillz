# architecture-beta Syntax

Use this reference only when the target renderer supports `architecture-beta`. It is a layout-oriented Mermaid diagram, not a complete infrastructure-as-code model. Keep provider names, regions, and security claims tied to supplied evidence.

## Building blocks

- `group` - logical grouping such as a trust boundary, network segment, or provider boundary.
- `service` - an individual node. Use a stable short ID and a quoted human-readable label.
- `edge` - a directional relationship with an explicit source and destination side when layout requires it.
- `junction` - a layout anchor for a deliberately routed connection. Do not add junctions just to decorate the diagram.

## Renderer and layout checks

- Beta syntax and icon support are renderer-sensitive. Render in the named target before publishing.
- If siblings overlap or the layout becomes unreadable, simplify groups or split the view before reaching for renderer-specific spacing options.
- Treat undocumented layout options as experimental. Record the Mermaid version and renderer when one is used.

## OKHP3 patterns

1. Declare the system boundary and audience before selecting groups.
2. Group by responsibility or trust boundary, not by visual convenience.
3. Label edges with protocol or relationship semantics only when known.
4. Provide a stable fallback, usually a flowchart or C4 view, when beta rendering is unavailable.
