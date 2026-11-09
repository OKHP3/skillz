---
name: okhp3-network-referral-tracker
description: >
  Track people who offered a referral, reference, introduction, comment, or call
  during a job search, and convert each vague offer into a specific, dated ask.
  Use when someone replies "let me know if I can help", when a new target role
  appears and the user needs to know who can vouch for it, when a referral landed
  and needs a thank-you, or during a weekly job-search review. Also activate for
  stale-offer cleanup. Do not use to contact anyone without approval or to store
  compensation or confidential terms.
license: MIT
compatibility: >
  Any Agent Skills-compatible client. A spreadsheet or database tool is optional;
  a markdown table works as the ledger.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: 1.0.0
  category: career
  maturity: draftable
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Capturing network offers, drafting specific asks, matching offers to target roles, and follow-up scheduling."
  out_of_scope: "Contacting anyone, scraping connections, storing compensation or confidential separation terms, and general task tracking."
---

# okhp3-network-referral-tracker

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Goodwill expires. An offer to help decays into "we should catch up sometime"
within two to three weeks unless it is converted into one specific, dated ask.
This skill captures every offer and keeps it moving.

---

## Scope

| In scope | Out of scope |
|---|---|
| A ledger of offers with quote, date, ask, and next step | Sending any message without approval |
| Drafting a specific ask and a thank-you | Compensation, separation terms, or confidential details in the ledger |
| Matching ledger rows to a target role | Generic task or commitment tracking |

## Operating contract

1. **Capture** each offer when it appears, with the person's exact short quote,
   offer type, date, channel, relationship tier, and any restricted-contact rules
   the user supplied for that person.
2. **Convert within seven days.** Draft one specific ask: company, role, a
   one-line fit, and exactly what is needed (an introduction email, a call with the
   hiring manager, a reference call, or a recommendation with two or three
   suggested points). Never "keep me in mind."
3. **Match to roles.** When a target role appears, list which rows connect to that
   company or function and propose asks for the strongest one or two only.
4. **Thank on delivery.** When a referral, comment, or introduction lands, draft a
   short thank-you and mark it delivered. The second touch keeps the relationship
   warm.
5. **Review weekly.** List rows past their follow-up date with one proposed
   action each. Status values and default follow-up timing are in
   `references/ledger.md`.
6. **Respect rules.** If the user has restricted-contact rules for a person, do
   not draft a recruiting-style ask to that person; offer a gratitude-only note.
7. **Return** the changed rows, the drafted asks for approval, and the stale list.
   Do not send.

## Validation before return

Verify that every row has a quote and a follow-up date, that every drafted ask is
specific, that no restricted contact received a recruiting-style ask, that no
compensation or confidential term was stored, and that nothing was sent.

## Storage

Keep the ledger where the user already works: a spreadsheet, a database, or a
markdown file they own. Never store compensation or confidential terms. Redact
personal details before sharing the ledger outside the user's own tools.

## Resource routing

- Read `references/ledger.md` for the field list, statuses, and ask templates.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
