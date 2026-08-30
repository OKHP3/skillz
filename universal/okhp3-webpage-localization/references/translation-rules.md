# Translation and review rules

## Translation boundary

Translate only from the authority-recorded `en-US` source. Keep the DOM shape
unless a layout change is separately approved. Do not remove sections because
they are hard to translate, add new claims, turn an informal source into a
formal one, or turn a translation into a source for another language.

## Preserve exactly

- `script`, `style`, `pre`, and `code` contents;
- IDs, classes, `data-*` values, API keys, JSON keys, command names, and code;
- approved trademarks and protected terms;
- URLs unless the site route map supplies the equivalent localized route;
- numbers, currencies, dates, units, citations, and legal text unless an
  approved localization policy says otherwise.

Translate visible prose, relevant image `alt` text, `title`, meaningful ARIA
labels, metadata intended for readers, navigation, buttons, and form labels.
Mark `html lang` with the target BCP 47 tag. Add reciprocal alternate-language
links only when every linked route exists and the site's deployment system
supports them.

## Four-pass review

Record pass/fail evidence, not a single confidence score.

1. **Meaning:** Compare each heading, call to action, claim, qualifier, and
   link intent with the English source. Check that nothing material was added,
   dropped, or made stronger.
2. **Voice effect:** Compare reader experience rather than English grammar.
   The target should be as direct, warm, playful, technical, or candid as the
   approved source requires, without importing English syntax or a formal
   British register.
3. **Terminology:** Check every protected-term decision and repeated concept
   against the site glossary. Flag uncertainty rather than silently varying.
4. **Rendered behavior:** Check the page in its real rendering environment for
   overflow, missing text, broken links, keyboard/assistive-language metadata,
   and route behavior. Structural parity is necessary but not sufficient.

Without a native reviewer, run independent agent passes where the runtime
allows it, report disagreements, and label the result `agent-reviewed`. Do not
claim that two AI passes are equivalent to native-speaker confirmation.

## Refresh policy

When the English source hash changes, label every associated target
`stale-source` until a new job is created and the changed material is reviewed.
Do not automatically translate the whole target again if the changed source
section can be identified, but do verify the whole target page after the focused
update. A target-only editorial correction must preserve the source hash and
state its reason in the translation record.
