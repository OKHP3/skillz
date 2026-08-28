# Recon heuristics — where knowledge hides in code

A field guide for Phase 1. The point is to reach the high-signal ~10–15% of a codebase fast
and extract domain, rules, workflows and language from it — without reading everything.

---

## Where each output comes from

| Output | Primary code sources |
|---|---|
| Domain model | ORM entities/models, DB migrations, schema/DDL, DTOs, aggregate roots |
| Domain glossary | Entity/field names, enums, constants, validation & error messages, event names |
| Business rules | Validation logic, conditionals on domain fields, state transitions, permission checks, calculations, scheduled jobs, test assertions |
| Workflows | Controllers/routes, event producers/consumers, orchestration/service layer, sagas, job schedules, state machines |
| Architecture | Module/package layout, dependency manifests, entry points, config, deployment/IaC, external clients |
| Integrations | HTTP/gRPC clients, SDKs, queue/topic config, webhooks, DB connections, credentials/config keys |
| Requirements (reconstructed) | Feature modules, tests as behaviour spec, config/feature flags, NFRs implied by caching/retry/rate-limit/auth code |

---

## High-signal patterns to grep for

- **State & lifecycle:** `status`, `state`, `*_at` timestamps, enums like `PENDING|ACTIVE|CLOSED`,
  state-machine libraries, `transition`, `can_*`, guard clauses.
- **Business rules:** `if`/`case` on domain fields, `validate`, `assert`, `raise`/`throw` with
  business messages, `threshold`, `limit`, `min`/`max`, fee/tax/rate/discount calculations.
- **Authorization / policy:** `authorize`, `can?`, `permission`, `role`, `policy`, `guard`,
  `@PreAuthorize`, middleware.
- **Workflows / edges:** route definitions, `@app.route`/controllers, `subscribe`/`publish`,
  `@EventListener`, queue consumers, `cron`, scheduler registrations.
- **Integrations:** `http`, `client`, `sdk`, base URLs, `webhook`, `apiKey`, connection strings,
  env var names.
- **Domain language:** enum values, constant names, error/validation message strings, event
  and command names — these are literally the ubiquitous language.

> Using the **code-intelligence / LSP** navigation mode (see the recon playbook)? Resolve
> these via symbols where it helps — find-references to see where a rule or entity is used,
> call hierarchy to trace a workflow — and keep grep for literal strings such as enum values
> and messages. The two modes complement each other.

---

## Reading order (cheap → expensive)

1. Dependency manifest + directory tree → stack and boundaries.
2. Entry points → how the system is driven (web, jobs, CLI, events).
3. Data model (entities + migrations) → the domain skeleton.
4. Contracts (routes/events/clients) → use cases and integration edges.
5. Service/domain layer + validation → the business rules.
6. Tests → confirmation of expected behaviour and rules.
7. Config / feature flags → variability and NFRs.

Stop when you have enough to seed good questions — depth beyond that is the interview's job.

---

## What to skip

Generated code, vendored dependencies, lockfiles, build output, boilerplate scaffolding, and
UI styling — unless a specific question sends you there. Don't read the whole test suite;
sample the tests around the business-logic hotspots.

---

## Confidence calibration

- **High** — behaviour is explicit and centralised (a single validation, a clear state
  machine, a documented enum).
- **Medium** — behaviour is spread across several places or inferred from naming.
- **Low** — inferred from a comment, a commit message, or an ambiguous name.

Record confidence with every hypothesis; Low/Medium items are prime interview material.

---

## Reconstructing the "why" it can't show

Code shows *what* and *how*, rarely *why*. When you hit a rule with no evident rationale
(a magic threshold, a special-case branch, a hard-coded exception), don't guess — log it as
an `[assumption]` with the evidence and make it an interview question.
