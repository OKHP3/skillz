# Language Mediation

Language Mediation governs controlled transformations across human languages,
regional varieties, specialist registers, and audience-appropriate plain
language. Its purpose is to change expression without silently changing source
authority, technical meaning, or uncertainty.

## Serial mediation rule

When a source is specialist-facing and the target must also change language or
locale, execute two distinct stages in order:

```text
specialist source locale -> plainspoken source locale -> plainspoken target locale
```

The first skill mediates the register. The second skill translates the regional
language. They may be launched by one user request or orchestration prompt, but
they must not run in parallel or collapse into one translating skill. The
second stage consumes the first stage's plainspoken artifact and mediation
record, not the original specialist source.

Each stage must identify its input, output, transformation type, terminology
authority, unresolved terms, review state, and limitations. A chain record must
link both stages and preserve the source and intermediate artifact hashes.

## Package boundaries

- Exact-pair packages use `okhp3-translation-<source-locale>-<target-locale>`.
- Register packages name the source domain and plain-language target locale.
- No package supports hidden reverse translation, generic copyediting, or
  automatic publication.
- Specialist-to-plain work must not present itself as legal, medical,
  engineering, or other professional advice.

## Current decision

`okhp3-translation-en-us-fr-fr` is the first family package. It accepts only
plainspoken `en-US` and produces `fr-FR`. The former generic
`okhp3-webpage-localization` package is intentionally not retained: a
multi-target webpage router would weaken exact-pair dictionaries, controlled
locale selection, and the required serial mediation boundary. Its durable
controls are represented in the exact-pair package rather than duplicated.
