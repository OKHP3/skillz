# Family placement

`language-mediation/` is the appropriate family for this package.

The family governs controlled transformations across human languages, locales,
specialist registers, and audience-appropriate plain language. It distinguishes
two non-interchangeable stages: register mediation and regional-language
translation. This exact-pair package performs only the second stage, consuming
plainspoken `en-US` and producing `en-GB`.

If an input is medical, legal, engineering, or another specialist register,
first invoke an appropriate register-to-plain-en-US package. Only after that
stage records its output can this package be invoked. Do not parallelize the
stages or hide both transformations in one skill.

The skill remains portable across projects. Project adapters may add routes,
document-format handling, approved vocabulary, and build gates, but they may
not weaken the exact-pair or serial-stage boundary.
