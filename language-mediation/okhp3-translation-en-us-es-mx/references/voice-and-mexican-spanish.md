# Source voice and Mexican Spanish guidance

## Source voice is evidence

Build the voice profile from owner-supplied or owner-owned en-US writing.
Record point of view, directness, warmth, humor, sentence rhythm,
contractions, fragments, preferred words, rejected tones, and representative
source paths. Separate observed, owner-declared, and inferred traits. An
inferred trait never overrides an owner-declared trait.

The es-MX target should read as the same author speaking naturally to a
Mexican Spanish-speaking audience. Preserve purpose and energy, not English
syntax. Do not turn a plain source voice into institutional formality,
casual slang, or generic machine-translated prose.

## Mexican Spanish register

The owner decides whether the site addresses readers as `tú` or `usted`.
Mexican consumer and marketing web copy defaults to informal `tú` more
readily than Spain does; until a project rule exists, use `tú` as the
declared default for consumer-facing content and record the assumption.
Formal, institutional, legal, or B2B content should default to `usted`
instead -- this is a project-level decision the dictionary cannot make for
you. Keep the choice consistent across navigation, body copy, buttons,
forms, errors, and help text.

For plural "you," always use `ustedes` and its verb forms. Never use
`vosotros`/`vosotras`; those forms do not appear in Mexican Spanish and
their presence is one of the fastest tells that a translation was drafted
for Spain rather than Mexico.

## Do not treat this as Spain Spanish or neutral Latin American Spanish

`es-MX` is its own pair with its own dictionary. Do not reuse
`okhp3-translation-en-us-es-mx` output as a stand-in for `es-ES` (Spain) or
`es-419` (neutral Latin American Spanish), and do not build this package's
dictionary from a Spain-Spanish source. Differences that matter beyond
vocabulary:

- **Numbers.** Mexico conventionally uses a decimal point and a comma for
  thousands (`1,234.56`), matching US formatting -- the opposite of Spain's
  comma-decimal convention. Do not reformat a number that is a protected
  token (a price, an ID, a measurement) without a project rule saying it is
  safe and the meaning stays unchanged.
- **Vocabulary.** See the dictionary's regional-vocabulary entries
  (computadora vs. ordenador, celular vs. móvil, and similar). A term
  correct in Spain can read as foreign or dated in Mexico, and vice versa.
- **Legal and institutional terms.** Mexican sites conventionally use
  Mexico-specific legal phrasing (for example `Aviso de privacidad` rather
  than Spain's `Política de privacidad`) that tracks Mexican, not European,
  regulatory language. Do not substitute the Spain-Spanish term as if it
  were interchangeable.

## Typography

Keep the Spanish inverted question and exclamation marks (`¿` `¡`) at the
start of questions and exclamations; this is not locale-specific, it is
standard Spanish orthography and applies the same way in Mexico as in Spain.
Never alter code, URLs, placeholders, identifiers, or locked text for
typographic reasons.

## Dictionary discipline

The dictionary precedence is:

1. owner-approved override;
2. project-approved pair entry;
3. bundled en-US to es-MX seed; then
4. `unresolved` with a review note.

Every entry should state its English source, Mexican Spanish target,
handling, context, and review state. Use `preserve` for brands or
identifiers, `translate` for stable equivalent terms, and `adapt` where
Mexican wording must be selected for purpose or regional convention rather
than literal form.

Do not turn a seed term into an approved project term merely because it
appears in a completed draft. The seed is a consistency aid, not native
certification.

## Review state

Keep these states distinct:

- `mechanically-checked`: structure and protected tokens passed;
- `machine-drafted`: the agent created Mexican Spanish text without
  qualified review;
- `ready-for-native-review`: internal gates passed and review is requested;
- `approved`: an actual authorized review record exists; and
- `blocked`: a source, pair, dictionary, voice, or safety decision is
  missing.

Back-translation, another model's agreement, or a clean dictionary match
cannot upgrade a draft to approved. A Spain-Spanish reviewer is not a
substitute for Mexican native review; regional fluency is part of what
"native" means for this pair.
