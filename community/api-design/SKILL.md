---
name: api-design
description: Designs an interface other people will depend on — REST endpoints, RPC methods, library functions, CLI commands, event payloads. Use this whenever the user is adding a public endpoint, designing a library's surface, defining a message contract, or asking how something should be called. Also use before implementing anything other teams or external users will consume, because the cost of changing it later is the whole point. For implementing against an existing interface, use feature-implementation.
license: MIT
---

# API design

An API is a promise. Implementation is cheap to change; a published interface is not, because
every caller has to move with you. Design it as though you cannot change it, because roughly
speaking you cannot.

**Design from the caller's side.** Write the code that calls your API before you write the API.
If that code is awkward, the design is wrong, and you have found out in two minutes instead of
after three teams have integrated.

## 1. Model the domain, not the storage

The most common failure is exposing your database schema through HTTP. It couples every consumer
to your internal structure, so a routine table split becomes everyone's migration.

Name resources and operations in the language your users use, not your tables. If a caller
must understand your persistence model to use the API, the abstraction has already failed.

**Done when:** you could change the storage layer without touching the interface.

## 2. Make the wrong call impossible

Design so misuse does not compile, or fails immediately and clearly:

- **Required things are required.** Not optional-with-a-runtime-check.
- **Enums over free strings** for anything with a fixed set of values.
- **Distinct types over booleans.** `create(user, true, false)` is unreadable at the call site
  and easy to get backwards.
- **No parameter whose valid values the caller has to guess.**
- **Reject unknown fields** rather than silently ignoring them — a typo'd field name that is
  quietly dropped is a bug that surfaces days later.

**Done when:** a caller who ignores the docs still cannot fail silently.

## 3. Design the errors as carefully as the successes

Errors are half the interface and usually get a tenth of the thought.

- **A stable machine-readable code**, separate from the human message. Callers branch on the
  code; the message is free to change.
- **Say what to do**, not only what went wrong. "Order not found — it may belong to another
  account" beats "404".
- **Distinguish retryable from terminal.** A caller cannot back off correctly without this.
- **Never leak internals:** stack traces, SQL, internal hostnames.
- **Be consistent.** One error shape across the whole surface.

**Done when:** a caller can handle every failure without parsing a message string.

## 4. Plan for change on day one

You will need to change it. Decide now how:

- **Additive changes only** to existing versions — new optional fields, new endpoints. Adding a
  required field or removing a field is breaking, whatever the version number says.
- **Deprecate rather than delete.** Mark it, warn in the response, log usage so you know who is
  left, and give a real timeline.
- **Pagination from the start.** Any list that can grow needs it, and retrofitting pagination is
  a breaking change.
- **Do not version everything by default.** A `/v1/` you never leave is noise; a versioning
  strategy you have thought about is not.

**Done when:** you can name what a non-breaking change looks like here.

## 5. Be boring and consistent

Predictability beats elegance. Within one API, the same concept must have the same name, the
same shape, and the same behaviour everywhere. Two endpoints that both return a user should
return the same user.

Follow the ecosystem's conventions even where you would choose differently — HTTP verbs and
status codes for REST, the language's idioms for a library, POSIX conventions for a CLI.
Surprise is a cost paid by every user.

**Done when:** someone who has used one part can predict the rest.

## 6. Decide the operational contract

Part of the interface, and usually undocumented until it causes an incident:

- **Idempotency:** which operations are safe to retry, and how a caller signals a retry
- **Rate limits**, and how they are communicated
- **Ordering and consistency guarantees:** say plainly if there are none
- **Payload and timeout limits**

**Done when:** a caller could write correct retry logic from the documentation.

## Report

State the interface, the reasoning behind the two or three decisions that were genuinely
contested, and what you deliberately left out of this version. Then write the caller-side
example — it is the part people read, and if it is not obvious, go back to step 1.
