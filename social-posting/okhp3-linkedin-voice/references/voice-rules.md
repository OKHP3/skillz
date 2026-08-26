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
| Non-LinkedIn long-form | Preserve short standalone lines when they are intentional rhythm devices. Do not apply LinkedIn paragraph formatting to another platform. |

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
