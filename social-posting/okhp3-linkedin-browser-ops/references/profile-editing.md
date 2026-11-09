# Profile and page editing

Mechanics for making edits land. Wording comes from the user or a voice skill.

## Ground rules

- One approved change at a time. Verify the public view after each save: a field
  that looks filled in is not proof it saved.
- LinkedIn prompts you did not request (alerts, opt-ins, suggestions) are closed,
  not accepted.
- Lazy loading hides sections. Open the section's own page when page text shows
  only the top card.

## Writing into fields

| Field type | Technique |
|---|---|
| Plain textarea or input | Find it by id or label, never "first textarea", because hidden duplicates exist. Focus, select, then `document.execCommand('insertText', false, text)`. |
| ProseMirror contenteditable | Select all, delete, then insert one line at a time with a paragraph insert between lines. Pasting drops apostrophes and breaks. |
| Typeahead (titles, industry, skills) | Click the input and use real keyboard typing. Programmatic insertion does not trigger suggestions. If none appear, Backspace and retype the last character, then choose the exact `[role=option]` with mouse events. |
| Chip lists | Add, type, press Return for each chip; focus stays in the input. |
| Selects and dates | Use the native value setter, then dispatch a `change` event. |

## Surfaces

Experience entry and project forms live under the member's `/in/<slug>/` edit
routes. Company-page edits are under the page's admin edit route with the info
and details tabs; each tab has one Save. Open-to-work titles must exist in
LinkedIn's own list, with a small maximum, so the nearest available title may
have to be chosen.

## Limits

Photo and banner uploads need a native file picker; hand them to the user with
the file name and the page. Do not change account or notification settings, and
do not enter credentials.

## Close-out

Report a before and after table per field, then list items only the user can do.
