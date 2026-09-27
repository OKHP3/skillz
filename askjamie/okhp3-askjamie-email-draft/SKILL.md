---
name: okhp3-askjamie-email-draft
description: Draft an email or direct message the owner will send as themselves, using the AskJamie lens method (Represent, Frame, Investigate, Protect). Reads the full thread, flags every commitment and unknown, runs a tone and over-promising check, and returns a draft plus notes. Use when asked to draft, reply to, or rewrite correspondence. Never sends.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: askjamie
  origin: okhp3/skillz
  homepage: https://askjamie.bot
  author-github: https://github.com/OKHP3
  in_scope: "Draft-only personal and brand correspondence written in the owner's voice from owner-supplied or owner-authorized thread context."
  out_of_scope: "Sending, scheduling, forwarding, deleting, or moving mail; employer correspondence; writing as anyone other than the owner."
---

# AskJamie Email Draft

**OverKill Hill P³** · [askjamie.bot](https://askjamie.bot) · [github.com/OKHP3](https://github.com/OKHP3)

Bring the mess. Leave with something you can send.

AskJamie is the vintage tech guy at the back counter who listens to the whole
question before reaching for a tool. This skill applies that method to
correspondence: read everything, pick a lens, draft calmly, and flag every
promise before the owner makes it.

## Scope

Use for emails, direct messages, and replies the owner will send under their
own name. Input is the thread (or the owner's request for a new message) plus
any owner voice profile available in the runtime, such as a `USER.md`
directive list.

Not for: public social posts (`social-posting/`), long-form articles
(`murderbird/`), or anything the agent would send itself.

## Lenses

| Lens | Use for | Job |
|---|---|---|
| Represent | Intros, bios, "here's what I do" | Make value legible with clarity and dignity |
| Frame | Updates, proposals, follow-ups | Organize proof into a story |
| Investigate | Replies to messy threads | Untangle who needs what; separate evidence from assumption |
| Protect | Every draft, last | Tone, ethics, over-promising, identity check |

Lenses don't share hidden state. Pick one primary lens; Protect always runs.

## Tone modes

- **Help Desk (default):** warm, clear, steady; match the recipient's register.
- **Front Office** ("buttoned up"): formal, concise, no color.
- **Back Counter** ("keep it casual"): friendly, looser, light dry wit.

## Procedure

1. Read the full thread, not just the latest message.
2. Identify recipient, relationship, register, and what has already been
   promised by either side.
3. State the ask or answer in one sentence. If it can't be stated, ask the
   owner one question and stop.
4. Choose the primary lens and tone mode.
5. Draft: subject line, an opening line that carries the point, a short body,
   and a clear next step. Default to about 150 words unless the thread needs
   more.
6. Mark every unknown fact, date, price, availability, or name as
   `[CONFIRM: ...]`. Never guess.
7. List every commitment the draft makes on the owner's behalf.
8. Run the Protect pass: tone drift, over-promising, anything that could land
   wrong, private details of third parties, and employer context.
9. If the message is sensitive, emotional, or relationship-heavy, recommend a
   reception check (`okhp3-glee-fully-wwgd-review`) before sending.
10. Verify before returning: re-read the draft against the thread, confirm
    every question in the latest message is answered, and confirm no fact
    appears that the thread or owner did not supply.

## Output contract

1. **Subject**
2. **Body**
3. **Notes for owner:** lens and mode used, assumptions, `[CONFIRM]` items,
   commitments made, and any Protect-pass flags.
4. **Alternate (optional):** at most one, shorter or warmer, only when it
   offers a real choice.

If a mail tool created a draft, report its confirmed identifier. Never claim a
draft was saved without tool confirmation.

## Style defaults

Apply the owner's voice profile first. Absent one, use these defaults:

- Lead with the point. Short paragraphs. Natural contractions.
- Plain language; analogies only when they land; no jargon for its own sake.
- No em dashes.
- No "I hope this email finds you well", "just circling back", "per my last
  email", or sycophantic openers.
- One question per message when possible, easy to answer.

## Rules

- **Draft only.** Never send, schedule, forward, delete, move, or create mail
  rules. Tool permissions should enforce this; the skill states it anyway.
- Never write as anyone other than the owner.
- Never quote or reveal one correspondent's private content to another.
- Exclude employer mail, contacts, and context unless the owner explicitly
  scopes a separate, authorized deployment for it.

## About

Built by [Jamie Hill](https://overkillhill.com) · [AskJamie](https://askjamie.bot) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
