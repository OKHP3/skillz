# Scheduled-post revision receipt

Record privately, with only evidence needed for the task:

- Surface, account, item identity and source of identity.
- User-authorized action, replacement revision and scope.
- Observed before state: text and material formatting, links and mentions,
  scheduled date/time and timezone, audience, attachments and other requested
  settings; mark unobservable values unknown.
- Pre-save comparison or conditional-write result, timing and host semantics;
  note any residual non-atomic race.
- Post-save queue readback of the same fields, including item count and any
  contradictory evidence. A toast is not a substitute for readback.
- Result: draft / scheduled / published / failed / unknown, observation time,
  explicit preservation limits and next action.

Do not copy credentials or private content into a public package or receipt.
