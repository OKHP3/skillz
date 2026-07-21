# OKHP3 Mermaid Design System

Single source of truth for theming. Every diagram produced by this skill family uses these palettes via `classDef` — never raw Mermaid defaults.

## Source

Palette definitions originate in `OKHP3/mermaid-theme-builder` and are canonical in that skill's `assets/palettes.json`. Load the palette asset when exact tokens are needed; do not retype or invent a second palette registry here.

## Available palettes (from mermaid-theme-builder)

- **Ocean Depth**
- **Forest Sage**
- **Slate Ember**
- **Violet Mist**

Map palette tokens to semantic roles such as primary, secondary, decision, success, error, and AI only from the canonical palette asset. The role is more important than the color name, because it keeps diagrams coherent when a palette changes.

## Non-negotiable rule

Every `classDef` declaration sets `fill`, `stroke`, AND `color`. Omitting `color` is the single most common cause of dark-mode/light-mode rendering failures across the community skills reviewed during the gap analysis. No exceptions, no "it looks fine on my screen."

```
classDef primary fill:#5b21b6,stroke:#ddd6fe,stroke-width:2px,color:#fff
```//`color` here is mandatory, not optional.

## Subgraph styling

Set subgraph `fill:none` so subgraphs adapt to the viewer's background rather than fighting it.

## Validation

Before publishing, validate the selected palette in the target renderer's light and dark contexts when both are supported. Record the palette ID and renderer profile in the diagram registry. Use the theme-builder skill for exact token generation and renderer compatibility.
