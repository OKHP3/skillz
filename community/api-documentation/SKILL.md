---
name: api-documentation
description: Documents an interface others will call — endpoints, SDK methods, CLI commands, and their parameters, errors, and limits. Use this whenever the user needs API docs, an OpenAPI spec, reference documentation, docstrings for a public library, or has an interface that people keep asking questions about. For designing the interface itself, use api-design; for prose guides and READMEs, use markdown-docs.
license: MIT
---

# API documentation

Reference documentation is not read; it is searched. Someone arrives mid-task with a specific
question — what does this return, what happens when it fails, is this required, and leaves as
soon as they have the answer.

Optimise for that. Completeness beats narrative, and the questions people actually have are
rarely the ones the happy-path example answers.

## 1. Generate the mechanical parts

Signatures, types, parameter lists, and status codes should come from the code — OpenAPI from
annotations, docstrings extracted, CLI help generated. Anything hand-maintained drifts, and
wrong reference documentation is worse than none because it is believed.

Hand-write only what cannot be derived: why, when, what happens on failure, and the constraints
the type system does not express.

**Done when:** no fact appears in both the code and the docs, maintained separately.

## 2. Document each parameter properly

A name and a type are not documentation. For each parameter:

- **What it means**, in domain terms
- **Required or optional**, and the default if optional — the default is the most frequently
  looked up fact and the most frequently missing
- **Valid values or range.** For an enum, all of them
- **Format**, where ambiguous — is a date a Unix timestamp, ISO 8601, or a date-only string?
- **What happens at the boundary:** maximum length, what happens above it

The unstated constraint is the classic support ticket: a field that silently truncates at 255
characters, documented nowhere.

**Done when:** a caller could construct a valid request without experimenting.

## 3. Document errors as thoroughly as successes

This is the half that gets skipped and the half people need most, because the success case is
usually guessable.

For each operation, list what can go wrong: the code, what causes it, and what the caller should
do. Distinguish retryable from terminal — a caller cannot write correct retry logic otherwise.

Document the error *body* shape, not just the status code. Callers parse it.

**Done when:** every error a caller can encounter is listed with a recommended response.

## 4. Show real, complete, runnable examples

- **Real values**, not `foo` and `string`. A plausible example teaches the format for free
- **Complete:** a request someone can copy, paste, and run, including auth
- **Show the response too**, in full, so the shape is unambiguous
- **Include an error example**, not only the happy path

One good example per operation beats a prose paragraph describing the same thing.

**Done when:** every example runs as written.

## 5. Cover the operational contract

Routinely undocumented, routinely the cause of production problems:

- **Authentication:** how, what scopes, how tokens expire
- **Rate limits:** the numbers, the headers, what a caller should do on 429
- **Pagination:** the mechanism, defaults, and maximums
- **Idempotency:** which operations are safe to retry, and how to signal a retry
- **Ordering and consistency:** say plainly if there are no guarantees
- **Size and timeout limits**
- **Deprecation:** what is going away, when, and what replaces it

**Done when:** someone could write a well-behaved client from the docs alone.

## 6. Organise for search, not for reading

- Group by what the user is trying to do, not by internal module structure
- Name sections as the questions people arrive with
- Make everything linkable, so support answers can point at an anchor
- Keep a single canonical page per operation — duplicated docs diverge

Version the documentation alongside the API, and keep the old version available. Someone is
still on it.

**Done when:** a search for the operation name lands on the right page.

## Keeping it true

Test the examples. Where the ecosystem allows it, run them in CI — an example that stops working
is a bug report from every reader.

Where documentation contradicts behaviour, the documentation is not always the thing to change.
Sometimes you have found a bug, and that is worth checking before editing the page.
