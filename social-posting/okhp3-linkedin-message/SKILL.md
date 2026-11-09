---
name: okhp3-linkedin-message
description: >
  Draft a LinkedIn direct message, connection-request note, or InMail to a
  named recipient. Use when the user wants to message, reconnect with, give a
  heads-up to, or reach out cold or warm on LinkedIn, including several
  related messages about one subject. It calibrates to relationship
  temperature, verifies recipient facts, gates attachments, and returns drafts
  only. Do not use for public posts or comment replies.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting private LinkedIn messages, connection notes, and InMail from supplied recipient and relationship context, including multi-recipient sequencing."
  out_of_scope: "Sending, scheduling, bulk or automated outreach, public posts or comments, and inferring recipient facts that were not supplied or verified."
---

# okhp3-linkedin-message

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

A private message is read by one person who knows the sender. Write for that
person, at that relationship temperature, about one thing.

## Scope

| In scope | Out of scope |
|---|---|
| One-to-one LinkedIn messages, connection notes, InMail | Public posts (`okhp3-linkedin-post`) and replies (`okhp3-linkedin-comment`) |
| Several related messages about one subject, with send order | Bulk, templated, or automated outreach |
| Prepared follow-up and reply drafts | Sending, scheduling, or verifying delivery |

## Process

1. **Resolve the message surface.** Identify the acting account, recipient,
   connection status, and surface: existing conversation, connection-request
   note, or InMail. Connection notes and InMail have hard character limits that
   vary by account type and change over time; read
   `references/surface-limits.md` and confirm the live counter before relying
   on any number.
2. **Classify relationship temperature** using `references/relationship-tiers.md`:
   `active`, `dormant`, `senior-target`, or `cold`. The tier sets length,
   candor, attachment policy, and the size of the ask. Do not infer warmth the
   user did not state; with no shared history, the tier is `cold`.
3. **Verify recipient facts before using them.** Any statement about the
   recipient's current role, employer, title, or recent change must come from
   a source the user supplied or the agent retrieved this run, preferably the
   recipient's own current profile. A press release or third-party page can be
   stale; flag it as `needs-confirmation` rather than writing it as current.
4. **Run the recipient-conflict check.** Compare the recipient's current
   employer and relationships with the subject of the message. If the
   recipient works for a party the message or an attachment treats as a
   competitor, counterparty, or target, remove the sensitive material or
   return `needs-decision`.
5. **Decide attachments by tier.** `active` may carry working files and the
   sender's strategy. `dormant` carries none in the first message; offer them.
   `senior-target` carries at most one artifact, in a format that previews
   without downloading when the host supports it. `cold` carries none. Never attach anything the
   recipient's conflict check rules out.
6. **Draft one contribution per message.** Open with something specific and
   true: the shared history for warm tiers, or for `cold`, the supplied reason
   this recipient is the right person (their published work, role, or a
   mutual connection the user names). Never imply familiarity that does not
   exist. State the one thing the message is for. End
   with a low-cost, concrete ask. Keep the subject's private context out of
   any message whose recipient does not need it.
7. **Sequence related messages.** When several recipients concern one subject,
   order them so nobody hears secondhand what they should hear first, and so
   each message's claims are true at the moment it lands. Read
   `references/sequencing.md`. Return the order with the drafts.
8. **Apply the voice pass.** Run `okhp3-linkedin-voice` on each draft when it
   is available, keeping the private-message register: conversational, no
   hashtags, no broadcast framing. If it is unavailable, say so in the gate
   report.
9. **Scrub before return.** Run `references/message-scrub.md`: loaded or
   clinical language, urgency that could travel to another recipient,
   disparagement, confidential detail, unsupported claims, and contact details
   the user did not ask to include.

## Output contract

Return, per recipient: `Draft`, then a `Gate report` naming surface, tier,
verified recipient facts with their source, conflict-check result, attachments,
the ask, sequence position, and every flag. Add a `Prepared reply` only when
the user asks or a likely reply needs a different stance than the opener. If a
required input is missing, return `NEEDS INPUT` with the missing field. Never
send; delivery is a separate host action after explicit user approval for that
specific message.

## Validation

Before return, verify: the tier is stated and justified from supplied context;
no recipient fact is written as current without a source; the conflict check
ran; attachment choices match the tier; a connection note or InMail fits the
confirmed limit; related messages carry a send order; the voice pass and
scrub ran or their absence is reported; and no send action is included.

## Public-neutrality gate

Keep this package portable for public distribution. Do not embed a person name,
account handle or URL, private identifier, employer or organization identity,
product or project name, campaign name, or user-specific subject in instructions,
examples, references, or evaluation fixtures. Resolve account, recipient,
relationship, subject, links, current facts, and attachments from
execution-time context. Use placeholders or supplied evidence.

## About

This package is distributed as a portable, identity-agnostic Agent Skill.
It resolves account, recipient, relationship, subject, and source context at execution time.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
