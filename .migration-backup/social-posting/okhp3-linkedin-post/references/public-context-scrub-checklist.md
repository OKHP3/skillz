# Public-context scrub checklist

Final gate before any LinkedIn output. This file is generic by design. Do not
add a specific account, organization, product, project, campaign, person,
topic, or source example here.

Check the draft for:

- [ ] Employer or organization names, abbreviations, nicknames, or other
  identifying combinations.
- [ ] Internal initiative, workflow, system, product, platform, tool, document,
  role, or structure details that would not be meaningful outside the context.
- [ ] Private account information, personal data, private URLs, identifiers, or
  details supplied only for a restricted audience.
- [ ] Unsupported activity or performance claims. A count, test result,
  availability statement, or time-bounded claim needs a named public source and
  bounded observation window.
- [ ] Pending-outcome inflation. A submission, vote, application, or prediction
  is not a confirmed result until an authoritative source establishes it.
- [ ] Deadline drift. A deadline or checkpoint needs its source and retrieval
  time; do not imply stale information is current.
- [ ] CTA and link drift. The primary destination is clear, supplied URLs are
  preserved, and secondary links have distinct roles.

## If something is caught

Generalize the underlying insight when it remains meaningful without identifying
context. If the insight cannot survive generalization, return the specific
category of blocker rather than pretending the draft is ready.

## Status logging

When this gate catches a problem, log the category only, never the identifying
content. Feed the category back to angle triage so evidence that cannot become
public-safe is identified earlier.
