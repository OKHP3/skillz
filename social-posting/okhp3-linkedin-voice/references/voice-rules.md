# LinkedIn Voice Rules

The canonical platform-specific rule set. Run every LinkedIn-bound draft
against this table.

## Public artifact boundary

This reference is publicly distributed and must remain identity-agnostic. It
contains no account name, handle, project, campaign, topic, opinion, or private
link. The skill obtains those details at execution time from the current user
request or approved runtime context. Use placeholders in examples and fixtures.

## Hard rules

| Rule | Check |
|---|---|
| Avoid em dashes | Replace them with a period, comma, or clearer structure. |
| Use natural contractions | Prefer conversational forms when they fit the user's supplied voice. |
| End articles decisively | The closing line is the closing line. Do not append an engagement question unless requested. |
| Preserve supplied destinations | Do not invent, replace, or silently drop user-supplied URLs. Keep each requested primary or secondary role visible. |
| Preserve uncertainty | Keep pending, conditional, and hopeful language intact. Never turn preparation, voting, or a proposed outcome into a win. |
| Preserve requested hashtag count | If a count is supplied, return exactly that many unless a safety or evidence gate blocks one. |

## Platform-conditional formatting

| Context | Rule |
|---|---|
| LinkedIn posts | Use double line breaks between paragraphs so the rendered post remains readable. |
| Non-LinkedIn long-form | Preserve short standalone lines when they are intentional rhythm devices, within the active rhythm profile below. Do not apply LinkedIn paragraph formatting to another platform. |

## Rhythm profile

Stacked fragments and one-line paragraphs read as machine-generated filler, not
emphasis. The rhythm profile governs sentence and paragraph cadence. Name the
active profile in the change log.

| Profile | When it applies | Rule |
|---|---|---|
| `flowing` | Default for standalone LinkedIn posts and articles | Write connected paragraphs. Reserve a single-sentence paragraph for the one line that has to land. |
| `staccato` | Only when the user explicitly asks for short punchy lines | Keep the requested cadence, but still remove repeated or empty fragments. |
| `off` | Default for comments and replies, whose short beats are often the point; also when the user supplied final copy and asked for no cadence edits | Check the hard rules only. |

### `flowing` checks

Count these before and after the rewrite and report both numbers.

| Check | Threshold | Fix |
|---|---|---|
| Single-sentence paragraphs | At most 1, plus any line the user explicitly marked as deliberate | Fold the others into the paragraph they support. Flag, rather than merge, a second line the user marked. |
| Consecutive short sentences | No run of 2 or more sentences of 4 words or fewer | Join them with a clause, a conjunction, or a comma, or cut one. |
| Fragment triplets | No list of three clipped fragments used as a sentence ("Fast. Cheap. Done.") | Rewrite as one sentence that says what the three things add up to. |
| Wall of short paragraphs | No run of 3 or more paragraphs under 15 words each | Merge related ones into a fuller paragraph. |

This is a density rule, not a house style: stacked fragments repeat the
emphasis instead of adding meaning. A short sentence on its own is fine. The
defect is the run of them. Quoted or user-supplied verbatim text is exempt. Keep
the meaning, facts, links, and hashtags unchanged while consolidating; rhythm
edits never add a claim.

## Density principle

Every sentence must earn its place. Remove filler, repeated claims, and padding.
For public-progress updates, retain the evidence window, source qualifier, and
pending-outcome language that keep a claim honest.

## Tone

Use a clear, confident, evidence-aware tone. Dry wit is acceptable when the
user supplied it. Avoid generic praise, empty engagement bait, and invented
consensus.

## Fact handling

Specific factual claims must come from the supplied source packet or current
runtime context. Do not create fact locks in this reference. If a fact cannot
be verified or generalized, preserve the uncertainty or return
`needs_generalization`.
