# Source voice and British English guidance

## This is a regional adaptation, not a bilingual translation

en-US and en-GB are the same language. The work here is spelling, vocabulary,
date/measurement convention, and light register adjustment -- not lexical
translation. Treat every sentence as a candidate for zero change; adapt only
where a genuine regional difference exists. A target that reads nearly
identical to the source, aside from a handful of substituted words, is the
expected and correct outcome, not a sign the work is incomplete.

## Source voice is evidence

Build the voice profile from owner-supplied or owner-owned en-US writing.
Record point of view, directness, warmth, humor, sentence rhythm,
contractions, fragments, preferred words, rejected tones, and representative
source paths. Separate observed, owner-declared, and inferred traits. An
inferred trait never overrides an owner-declared trait.

The en-GB target should read as the same author speaking naturally to a
British audience. Preserve purpose and energy, not American idiom. Do not
turn a plain source voice into institutional formality just because the
target is British; British web writing is not inherently more formal than
American web writing.

## What actually changes

- **Spelling.** Standard British spelling by default (colour, centre,
  organise, licence as a noun) unless the project declares Oxford spelling
  (-ize endings) or another house style. Record which system the project
  uses; do not mix them within one artifact.
- **Vocabulary.** A short, known list of words that differ in everyday use
  (see the dictionary's `adapt` entries: postcode, mobile phone, holiday,
  lift, flat, and similar). Most UI and body copy needs none of these.
- **Dates and measurements.** Default to DD/MM/YYYY or "D Month YYYY" and to
  metric units, except where the source is factually US-specific (a US
  address, a US dollar price, a US phone number) -- those stay accurate to
  what they describe rather than being silently converted. A currency or
  unit conversion is a project decision, not something this package invents.
- **Register and idiom.** Preserve the source's directness and rhythm. Swap
  an idiom only when the American original would read as foreign or
  confusing to a British reader (rare in plain, direct writing); otherwise
  leave it.

## What does not change

Claims, numbers, pricing, legal text, brand names, product names, code,
identifiers, and URLs are protected exactly as in every other pair package.
Nothing about the regional-adaptation framing loosens those protections --
if anything, the near-identical surface form of en-US and en-GB text makes
it easier to miss an unintended change, so protected-token drift checks
still apply in full.

## Review state

Keep these states distinct:

- `mechanically-checked`: structure and protected tokens passed;
- `machine-drafted`: the agent produced en-GB text without qualified review;
- `ready-for-native-review`: internal gates passed and review is requested;
- `approved`: an actual authorized review record exists; and
- `blocked`: a source, pair, dictionary, voice, or safety decision is missing.

A clean spelling pass or a dictionary match cannot upgrade a draft to
approved. Native British review still means a British reader confirming the
result reads naturally, not just correctly spelled.
