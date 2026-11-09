---
name: okhp3-linkedin-message
description: >
  Draft a LinkedIn direct message or a counter reply to an inbound message from
  raw dictation, notes, or the received text. Use when the user wants to write
  a DM, answer a new connection's message, follow up after an accepted invite,
  or reply to a recruiter or peer. It tiers the recipient, matches length,
  keeps one small ask, scrubs risk, and returns a draft only. Do not use for
  comments, posts, connection notes, or sending.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting a LinkedIn direct message or counter reply from supplied sender intent and recipient context, with a risk scrub."
  out_of_scope: "Sending, comment or post drafting, connection notes, bulk messaging, or inventing facts about either party."
---

# okhp3-linkedin-message

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

A good message is short enough to answer on a phone and specific enough to be
worth answering.

## Scope

This package drafts one direct message or one counter reply. It does not send,
batch, or schedule messages. For first-touch invite text use
`okhp3-linkedin-connection-note`. For public conversation use
`okhp3-linkedin-comment`.

## Process

1. Gather inputs: the sender's raw intent in their own words, the inbound
   message when replying, whatever the sender supplied about the recipient, and
   any standing constraints the sender wants honored. A dictated thought is
   source material, not a finished draft. Do not invent history between the
   parties.
2. Tier the recipient using supplied evidence only: peer, senior or high-reach
   contact, recruiter or sales sender, or unknown. The tier sets tone and
   length. Senior contacts get shorter and more specific. Recruiter and sales
   senders get a verification-minded reply, not instant enthusiasm. Unknown
   senders get no personal data.
3. Match length to the inbound. A two-line message gets a two- or three-line
   reply. A long thoughtful message earns a proportionate answer. Cap first-
   touch messages at a few short sentences.
4. State the single purpose in one sentence before drafting. Include at most
   one small, easy-to-grant ask, such as a viewpoint, a resource pointer, or a
   short call later. Do not stack asks. Do not pitch in a first message.
5. Draft in the sender's voice by applying `okhp3-linkedin-voice`, which
   covers contractions, no em dashes, and preserved uncertainty. Keep the
   sender's real phrasing where it works. Do not sand it into corporate paste.
6. Run `references/message-gate.md`. Scrub employer-identifying, confidential,
   or agreement-restricted content and any statement about employment status
   the sender did not supply. Do not include the sender's phone, email, or
   private links unless the sender asked.
7. Return the draft, a one-line rationale, and the gate report. If the inbound
   message looks like a scam, phishing, or mass-mail pitch, say so and offer a
   verification reply instead of an engaged one.
8. Do not send. Show the final text for approval. Sending is a separate host
   action that needs explicit approval for that message.

## Output contract

Return `Draft`, `Why this shape` in one line, and `Gate report`. When the
sender intent is unclear in a way that changes the message, ask at most one
question. Otherwise assume, label the assumption, and draft.

## Validation

Before return, verify the length fits the tier, there is one ask or none, no
unsupplied fact appears, the voice gates ran, no sensitive contact data leaked,
and no sending action is included.

## Platform boundary

LinkedIn can restrict messaging volume, limit messages to connections, and
flag automated or repetitive messaging. A draft does not establish that the
message can be sent or that the recipient allows it.

## Public-neutrality gate

Keep this package portable for public distribution. Do not embed a person name,
account handle or URL, private identifier, employer or organization identity,
product or project name, campaign name, or user-specific subject in instructions,
examples, references, or evaluation fixtures. Resolve account, destination,
audience, subject, links, current facts, and visibility from execution-time
context. Use placeholders or supplied evidence; platform help links may remain.

## About

This package is distributed as a portable, identity-agnostic Agent Skill.
It resolves account, destination, audience, subject, and source context at execution time.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
