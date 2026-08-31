# Source voice and Germany German guidance

## Source voice is evidence

Build the voice profile from owner-supplied or owner-owned en-US writing. Record
point of view, directness, warmth, humor, sentence rhythm, contractions,
fragments, preferred words, rejected tones, and representative source paths.
Separate observed, owner-declared, and inferred traits. An inferred trait never
overrides an owner-declared trait.

The German target should read as the same author speaking naturally to a Germany
German audience. Preserve purpose and energy, not English syntax. Do not turn a
plain source voice into institutional formality, casual slang, or generic
machine-translated prose.

## Germany German register

The owner decides whether the site addresses readers as `Sie` or `du`. Until a
project rule exists, use `Sie` as the declared conservative default and record
the assumption. Keep the choice consistent across navigation, body copy,
buttons, forms, errors, and help text. A mixed register within one artifact
reads as an error, not as friendliness.

Use Germany German regional conventions: standard High German vocabulary,
spelling per the current Rechtschreibreform, and capitalization of all nouns.
Do not assume they also cover Austrian German (`de-AT`) or Swiss German
(`de-CH`), which use distinct vocabulary (for example Austrian culinary and
administrative terms), different formality conventions in places, and, for
Swiss German text, no `ß` at all. Those are separate language-pair packages
with separate dictionaries.

Use Germany German typography only where the target format supports it:
`„German-style low-high quotation marks"`, compound-noun formation instead of
inserted hyphens where natural, and a decimal comma rather than a decimal
point in prose. Never introduce typographic changes into code, URLs,
placeholders, identifiers, or locked copy. A visually clean artifact still
needs format-appropriate rendering and accessibility checks in the consuming
site.

## Dictionary discipline

The dictionary precedence is:

1. owner-approved override;
2. project-approved pair entry;
3. bundled en-US to de-DE seed; then
4. `unresolved` with a review note.

Every entry should state its English source, Germany German target, handling,
context, and review state. Use `preserve` for brands or identifiers,
`translate` for stable equivalent terms, and `adapt` where German wording must
be selected for purpose rather than literal form. Favor a clear, well-known
compound term over an invented one, and never abbreviate a compound noun just
to match the English source's word count.

Do not turn a seed term into an approved project term merely because it appears
in a completed draft. The seed is a consistency aid, not language certification.

## Review state

Keep these states distinct:

- `mechanically-checked`: structure and protected tokens passed;
- `machine-drafted`: the agent created German text without qualified review;
- `ready-for-native-review`: internal gates passed and review is requested;
- `approved`: an actual authorized review record exists; and
- `blocked`: a source, pair, dictionary, voice, or safety decision is missing.

Back-translation, another model's agreement, or a clean dictionary match cannot
upgrade a draft to approved.
