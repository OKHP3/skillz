# Source voice and Spain Spanish guidance

## Source voice is evidence

Build the voice profile from owner-supplied or owner-owned en-US writing. Record
point of view, directness, warmth, humor, sentence rhythm, contractions,
fragments, preferred words, rejected tones, and representative source paths.
Separate observed, owner-declared, and inferred traits. An inferred trait never
overrides an owner-declared trait.

The Spanish target should read as the same author speaking naturally to a Spain
Spanish audience. Preserve purpose and energy, not English syntax. Do not turn a
plain source voice into institutional formality, casual slang, or generic
machine-translated prose.

## Spain Spanish register

The owner decides whether the site addresses readers as `usted` or `tú`. Until a
project rule exists, use `usted` as the declared conservative default and record
the assumption. Keep the choice consistent across navigation, body copy,
buttons, forms, errors, and help text. A mixed register within one artifact
reads as an error, not as friendliness.

Use Spain Spanish regional conventions, including the second-person plural
`vosotros`/`vosotras` where a plural "you" is natural in body copy, `vale` and
other peninsular colloquialisms only where the source voice calls for informal
color, and Spain's leísmo-neutral standard vocabulary. Do not assume they also
cover Latin American Spanish (`es-419`), Mexican Spanish (`es-MX`), or United
States Spanish (`es-US`), which prefer `ustedes` over `vosotros`, different
everyday vocabulary (for example computer and car terminology), and different
address-form norms. Those are separate language-pair packages with separate
dictionaries.

Use Spain Spanish typography only where the target format supports it:
inverted opening question and exclamation marks (`¿`, `¡`), correct accent
marks, and standard Spanish quotation conventions. Never introduce typographic
changes into code, URLs, placeholders, identifiers, or locked copy. A visually
clean artifact still needs format-appropriate rendering and accessibility
checks in the consuming site.

## Dictionary discipline

The dictionary precedence is:

1. owner-approved override;
2. project-approved pair entry;
3. bundled en-US to es-ES seed; then
4. `unresolved` with a review note.

Every entry should state its English source, Spain Spanish target, handling,
context, and review state. Use `preserve` for brands or identifiers,
`translate` for stable equivalent terms, and `adapt` where Spanish wording must
be selected for purpose rather than literal form.

Do not turn a seed term into an approved project term merely because it appears
in a completed draft. The seed is a consistency aid, not language certification.

## Review state

Keep these states distinct:

- `mechanically-checked`: structure and protected tokens passed;
- `machine-drafted`: the agent created Spanish text without qualified review;
- `ready-for-native-review`: internal gates passed and review is requested;
- `approved`: an actual authorized review record exists; and
- `blocked`: a source, pair, dictionary, voice, or safety decision is missing.

Back-translation, another model's agreement, or a clean dictionary match cannot
upgrade a draft to approved.
