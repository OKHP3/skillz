---
name: okhp3-linkedin-connection-note
description: >
  Draft one personalized LinkedIn connection request note per recipient, within
  the sender's character limit and using only facts the sender supplied. Use
  when the user wants an invite note, a batch of notes for a planned outreach
  wave, or a rewrite of a generic connection request. It returns drafts and a
  gate report only. Do not use for direct messages, replies, or sending.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting a unique, character-bounded LinkedIn connection note per recipient from supplied sender and recipient facts."
  out_of_scope: "Sending invitations, direct messages, replies, target selection, or any claim the sender did not supply."
---

# okhp3-linkedin-connection-note

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

A connection note has one job: give a stranger a reason to say yes.

## Scope

This package drafts connection request notes. It does not send invitations,
choose who to invite, or write follow-up messages. Selection belongs to
`okhp3-linkedin-network-plan`. Messages and replies belong to
`okhp3-linkedin-message`.

## Process

1. Collect the sender fact sheet from the current run: role in plain words,
   the one or two public things the sender can honestly say about their work,
   the sender's account type, and any topics or phrases the sender wants
   avoided. If the fact sheet is missing, return `NEEDS INPUT`. Never infer
   sender credentials from a profile name or from the recipient's context.
2. Determine the note limit. Use the limit the sender states. LinkedIn Help
   (retrieved 2026-11-09) documents 200 characters and a small monthly count of
   personalized notes for free accounts, and an unlimited count at 300
   characters for Premium. When the plan is unknown, default to 200 characters
   and say that was assumed. Limits change, so confirm in the live dialog.
   Leave headroom of at least 10 characters for counting differences.
3. For each recipient, read the supplied public context: role, a recent public
   post, shared topic, or shared community. Pick one specific hook. A hook is
   something only this recipient has said or done. Do not use a title alone as
   a hook.
4. Draft with this shape, adapted to fit the limit: a short greeting by first
   name, one specific hook, one line on why the sender is relevant to that
   hook, and an implicit or explicit invitation to connect. No flattery
   stacking, no pitch, no ask for a favor, referral, job, or call.
5. Keep every note unique. Reusing an opener across a batch is a template
   signal. When two recipients share a hook, vary the framing and the order.
6. Run `references/note-gate.md`. Enforce the character count by counting,
   not estimating. Report the count for every note.
7. Return the batch table and the gate report. Do not send. Sending is a host
   action that needs explicit approval for the specific batch.

## Output contract

Return `Notes` as a table with recipient label, lane or segment, hook used,
note text, and character count against the limit, then `Gate report`. Missing
sender facts or a recipient with no usable public context returns `NEEDS
INPUT` for that row. Do not fill the gap with a generic note unless the sender
asks for a generic fallback, and label it generic when they do.

## Validation

Before return, verify every note is within the limit, no two notes share an
opener, every claim traces to the supplied fact sheet or recipient context,
the voice pass ran, no em dash appears, and no send action is included.

## Platform boundary

LinkedIn restricts excessive invitation activity, and all members, Basic and
Premium, are subject to invitation limits. A draft does not establish that the
account can send it. Recipients can also require an email address or restrict
who may invite them. Skip those recipients instead of guessing contact
details. Sending is the sender's own action in their own session.

## Current platform reference

- [LinkedIn Help: personalize invitations to connect](https://www.linkedin.com/help/linkedin/answer/a563153) (retrieved 2026-11-09) documents note limits by plan.
- [LinkedIn Help: invitation limit reached](https://www.linkedin.com/help/linkedin/answer/a550555) (retrieved 2026-11-09) documents that all members are subject to invitation limits.

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
