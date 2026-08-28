# Phase 2 — Interview

**Role:** Senior Business Analyst, supported by a Product Manager.
**Goal:** Validate the recon hypotheses and recover the **why** the code can't tell you —
intent, business rules, edge cases, and domain language — through a real conversation.

*Skipped in code-only mode.* In code-only mode, everything that would be confirmed here stays
`[unverified]` / `[assumption]`.

---

## Conversation rules (non-negotiable)

- **One question at a time.** Ask a single question, then wait for the answer.
- **Follow up on the answer.** Let each response shape the next question; dig where it's
  unclear, vague, or surprising.
- **Never present a questionnaire** or a batch of questions.
- **Seed every question with evidence.** Because recon ran first, ask to *validate*, not to
  fish: "The code applies a 2% fee when an account is overdue by 30+ days
  (`billing/fees.rb:44`). Is that the intended rule, and why 30 days?"
- **Confirm understanding before moving on** to a new area. Play back what you heard.
- **Capture, don't assume.** If something isn't confirmed, it stays flagged.

Use [`../references/question-bank.md`](../references/question-bank.md) for seed questions per
area and per initiative type — but adapt to what recon actually found.

---

## Reconcile contradictions (important)

For every `[outdated]` or `[contradicted]` item from recon/pre-check, raise it with the user
**one at a time**, and always offer a code-derived suggested correction:

> "The README says refunds are handled by the billing service, but the code routes them
> through `payments/refunds/*` (`payments/refunds/handler.py:20`). I'd suggest the correct
> statement is: *refunds are owned by the Payments service*. Confirm, or adjust?"

On the user's confirmation, the item becomes accepted knowledge (unmarked) with the code
evidence recorded. Do not silently pick a version.

---

## Areas to cover (adaptively)

Move through these as the conversation allows, always led by recon findings. Not a checklist
to march through — a map of what needs to be understood.

1. **Business context & purpose** — why the system exists, what problem it solves, for whom.
2. **Users & stakeholders** — who uses it, who owns the processes, who's impacted.
3. **Domain language** — confirm the meaning of terms found in code (entities, enums,
   error messages). Resolve synonyms and conflicts; capture agreed definitions.
4. **Business rules** — validate the rules recon inferred; surface the ones code can't show
   (policy, regulation, "we always do X because…"), and the exceptions.
5. **Workflows** — walk the key end-to-end flows: actors, triggers, states, decision points,
   exceptions/edge cases, hand-offs, SLAs.
6. **Requirements & constraints** — the outcomes the system must deliver, plus
   non-functional and compliance constraints (performance, availability, security,
   auditability, data handling, regulatory).

---

## Maintain working state as you go

After each meaningful exchange, update `docs/_discovery/discovery-state.md`:

- **Facts** — accepted (unmarked) knowledge, with source = the stakeholder (+ any code
  evidence).
- **Assumptions** — inferred but not confirmed; record why and the impact if wrong.
- **Unknowns / open questions** — prioritised by business, user, compliance, delivery impact.
- **Decisions** — with context and who validated them.
- **Glossary-in-progress** — terms, agreed meanings, related concepts.

Record who confirmed each fact (source/owner), and flag where different stakeholders
disagree.

---

## Exit criteria

- Recon hypotheses validated or corrected with the stakeholder.
- Contradictions/outdated items reconciled with confirmed, code-grounded wording.
- Business rules, workflows, domain terms, and requirements understood well enough to write
  onboarding docs.
- Remaining unknowns captured and prioritised (not silently assumed).
- Working state current. Ready for synthesis.
