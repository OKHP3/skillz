# Carousel page plan and spec schema

Load this when planning pages or writing a spec.

## Public artifact boundary

This reference is identity-agnostic. Subjects, series labels, colors, and
sources come from the current run.

## Page roles

| Role | Job | Rule |
|---|---|---|
| `cover` | The hook | One problem line and one payoff line (`title` plus `title_accent`). It must make sense as a thumbnail with no other context. |
| (body) | One idea per page | A title that states the idea, then one or two blocks that prove or show it. If a page needs a third block, split it. |
| `close` | The landing | The takeaway or the same question the post ends on. Never a new idea. |

Six to twelve pages is the usual range; the builder warns above twelve and
refuses more than twenty.

## Density limits

| Element | Limit |
|---|---|
| Title | About 90 characters; the builder warns above that |
| Compare rows | 4 or fewer read best; the builder warns above 5 |
| Steps or bullets | 5 or fewer items |
| Body text | Every rendered size is 24px or larger at 1080px wide |
| Footer source | One line; the build fails if it does not fit |

## Sources

Any page with a number, date, statistic, product capability, or quoted fact
gets `"claims": true` and a `source` such as `Source: <PUBLISHER>, <DATE>`.
Use the same sources as the post's evidence note. A page that is opinion or
framing needs no source, but say so in the check report if the builder warns.

## Spec schema

```json
{
  "slug": "kebab-case-file-name",
  "document_title": "Short title typed at upload",
  "series": "Left footer label, optional",
  "kicker": "Default top-left label, optional",
  "theme": {"bg": "#rrggbb", "fg": "#rrggbb", "body": "#rrggbb", "muted": "#rrggbb",
            "accent": "#rrggbb", "panel": "#rrggbb", "border": "#rrggbb", "font": "font stack"},
  "pages": [
    {"role": "cover|close (optional)", "kicker": "optional override", "chip": "optional label",
     "title": "required", "title_accent": "optional second line in the accent color",
     "claims": false, "source": "required when claims is true",
     "blocks": [ ... ]}
  ]
}
```

Theme keys are optional; missing keys use the neutral dark default. Contrast is
checked for `fg`, `body`, and `muted` against both `bg` and `panel` (4.5:1)
and for `accent` (3:1).

## Block types

| Type | Fields | Use |
|---|---|---|
| `text` | `text` | One short paragraph |
| `panel` | `label`, `text` | A callout box |
| `bullets` | `items` (strings) | A short list |
| `steps` | `items` (objects with `title`, `text`) | A numbered sequence |
| `stat` | `value`, `label` | One big number; needs a source |
| `compare` | `left`, `right`, `rows` (`[label, left, right]`) | Then vs now, before vs after |

All values are plain text and are HTML-escaped.
