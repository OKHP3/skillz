# Source and voice contract

## Authority record

For every localized page, save these facts before drafting:

| Field | Required value |
|---|---|
| `page_id` | Stable site-owned identity, not a translated title |
| `source_locale` | `en-US` |
| `source_path` or `source_url` | Canonical versioned file preferred; public URL is an observed snapshot only |
| `source_sha256` | SHA-256 of the exact source bytes |
| `source_route` | Public source route |
| `source_commit` | Commit when available, otherwise `not-versioned` |
| `target_locale` | BCP 47 language tag selected by the site owner |
| `target_route` | Approved route derived from the site's route map |

Reject a job if the stated source is not `en-US`, its hash differs from the job
record, or its ownership is unclear. A localized page may have its own history,
but it never becomes a source for another locale.

## Voice capture

Capture observable choices from at least three approved English source pages
before defining a shared site voice. For each page, record the evidence rather
than adjectives alone:

- sentence length and whether fragments are deliberate;
- contractions, first/second-person address, and direct invitations;
- humor, metaphor, idiom, and technical vocabulary;
- degree of formality and preferred calls to action;
- capitalisation, punctuation, trademarks, and repeated branded phrases;
- words deliberately not used, such as corporate filler or British spellings.

Write only evidence that the owner approves into the site's voice profile. Do
not retrofit the English source to fit a profile. A target language does not
need to reproduce English punctuation or grammar; it needs to preserve the
same reader-facing intent and energy naturally.

## Protected-term procedure

Terms fall into one of four explicit states:

| State | Treatment |
|---|---|
| `preserve` | Keep exact spelling, including trademark marks when used in source |
| `approved-translation` | Use the recorded locale-specific form exactly |
| `first-use-explain` | Keep source term, then add a concise target-language explanation on first use |
| `needs-owner-decision` | Do not improvise; flag and leave the target draft blocked or visibly provisional |

Names, product names, navigation IDs, code, URLs, legal entity names, technical
identifiers, and measurement facts are not automatically translatable. A
translation memory can suggest consistency, but it cannot override this ledger.
