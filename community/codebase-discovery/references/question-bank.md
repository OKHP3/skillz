# Question bank — interview seeds

Seed questions for Phase 2. **These are not a script.** Ask one at a time, always grounded in
what recon actually found, and let each answer drive the follow-up. Prefer validating a
concrete finding over asking an open-ended question.

Bad (fishing): "What are the business rules?"
Good (grounded): "The code blocks cancellation once `dispatched_at` is set
(`orders/policy.rb:31`). Is that a hard rule, and are there exceptions — e.g. support
override?"

---

## Business context & purpose

- The system does X for Y — is that the primary purpose, or has it drifted from that?
- What problem does it solve that wasn't solved before it existed?
- What would break for the business if this system went down for a day?

## Users & stakeholders

- Recon shows roles A, B, C in the auth model — who are these people in real life?
- Who owns the process this system supports? Who signs off changes to the rules?
- Which users are internal vs external, and does that change what they're allowed to do?

## Domain language (glossary)

- The code uses the term `<term>` (e.g. an enum/entity) — what does it mean to the business?
- Are `<term A>` and `<term B>` the same thing or different? (surface synonyms/conflicts)
- Is there a term the business uses that you *don't* see reflected in the system?

## Business rules

- The code applies `<rule>` under `<condition>` (`path:line`) — correct, and why that value?
- What are the exceptions to that rule, and who is allowed to override it?
- Is that rule a policy decision, a regulatory requirement, or a technical constraint?
- Are there rules you'd expect that the system *doesn't* enforce today?

## Workflows

- Walk me through `<workflow>` end to end — who starts it, what triggers it?
- At `<decision point>`, what determines which path is taken?
- What happens on the unhappy path — errors, timeouts, rejections, retries?
- Are there SLAs, cut-offs, or timing rules on this flow?
- Where does a human have to intervene or approve?

## Requirements & constraints (incl. non-functional)

- What outcomes must this system guarantee (not just features)?
- Performance/scale: expected volumes, peak load, response-time expectations?
- Availability: is downtime acceptable, and for how long?
- Security & compliance: regulated data, audit requirements, access constraints, retention?
- Any constraint that isn't obvious from the code but shapes what's allowed?

---

## Adapt to the initiative type

Onboarding onto an existing system is the default, but tune emphasis if the user's goal is:

- **Enhancement** — baseline the current capability and its integration constraints; what
  must *not* regress.
- **Modernisation / replacement** — feature parity, why-now, legacy constraints, data
  migration, cut-over and coexistence.
- **Process improvement** — current metrics and bottlenecks; the measurable before/after
  target.
- **Bug/behaviour investigation** — the specific rule/workflow in question, and its intended
  vs actual behaviour.

---

## Reconciliation prompts (for contradictions)

When an existing doc disagrees with the code, use this shape — always with a code-derived
suggestion:

> "`<source>` says `<old claim>`, but the code does `<actual>` (`path:line`). I'd suggest the
> correct statement is `<suggestion>`. Confirm, or adjust?"
