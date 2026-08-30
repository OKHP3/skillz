# Source voice and France French guidance

## Source voice is evidence

Build the voice profile from owner-supplied or owner-owned en-US writing. Record
point of view, directness, warmth, humor, sentence rhythm, contractions,
fragments, preferred words, rejected tones, and representative source paths.
Separate observed, owner-declared, and inferred traits. An inferred trait never
overrides an owner-declared trait.

The French target should read as the same author speaking naturally to a France
French audience. Preserve purpose and energy, not English syntax. Do not turn a
plain source voice into institutional formality, casual slang, or generic
machine-translated prose.

## France French register

The owner decides whether the site addresses readers as `vous` or `tu`. Until a
project rule exists, use `vous` as the declared conservative default and record
the assumption. Keep the choice consistent across navigation, body copy,
buttons, forms, errors, and help text.

Use France French regional conventions. Do not assume they also cover Canadian
French, Belgian French, Swiss French, or any other French locale. Those are
separate language-pair packages with separate dictionaries.

Use French typography only where the target format supports it. Never introduce
French spaces or punctuation changes into code, URLs, placeholders, identifiers,
or locked copy. A visually clean artifact still needs format-appropriate rendering and accessibility
checks in the consuming site.

## Dictionary discipline

The dictionary precedence is:

1. owner-approved override;
2. project-approved pair entry;
3. bundled en-US to fr-FR seed; then
4. `unresolved` with a review note.

Every entry should state its English source, France French target, handling,
context, and review state. Use `preserve` for brands or identifiers,
`translate` for stable equivalent terms, and `adapt` where French wording must
be selected for purpose rather than literal form.

Do not turn a seed term into an approved project term merely because it appears
in a completed draft. The seed is a consistency aid, not language certification.

## Review state

Keep these states distinct:

- `mechanically-checked`: structure and protected tokens passed;
- `machine-drafted`: the agent created French text without qualified review;
- `ready-for-native-review`: internal gates passed and review is requested;
- `approved`: an actual authorized review record exists; and
- `blocked`: a source, pair, dictionary, voice, or safety decision is missing.

Back-translation, another model's agreement, or a clean dictionary match cannot
upgrade a draft to approved.
