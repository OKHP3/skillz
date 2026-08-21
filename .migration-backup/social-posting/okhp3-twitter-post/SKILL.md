---
name: okhp3-twitter-post
description: >
  Draft an X post using the portable name Twitter. Use when the user asks for a
  tweet, X post, concise Twitter update, quote text, standalone build log, or a
  thread opener. It writes one evidence-locked post for a named account and
  returns a draft only. Do not use for replies, posting automation, or assuming
  X Premium features.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.2.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting an evidence-locked standalone X post, quote text, or requested thread opener from supplied facts and account context."
  out_of_scope: "Publishing, replies, thread expansion without request, automation, or unsupported real-time claims."
---

# okhp3-twitter-post

Portable, identity-agnostic Agent Skill.

`twitter` is this family's stable package name for X, formerly Twitter.

## Scope

This package drafts one standalone X post, quote text, or requested thread
opener. It covers concise release notes and public progress updates that name a
concrete change and user-visible effect. It does not publish, reply, automate
engagement, or assume a longer-post entitlement.

## Public-package data boundary

This package, its evaluation fixtures, and its learning records are public
artifacts. Keep them agnostic: never store the execution account name, handle,
parent URL, personal detail, employer, project, event, topic, or opinion in the
package. Use execution-time placeholders such as `[ACCOUNT]`, `[PARENT_URL]`,
`[PUBLIC_SOURCE]`, and `[PROJECT]`; the live request supplies their values and
they are not written back into the package. Library provenance metadata is
separate from posting identity and must never be used as the acting account.

## Process

1. Confirm the acting account, intended audience, and whether this is one
   standalone post, quote text, or the opening of a requested thread. If a
   parent URL is supplied and the user is answering it, route to
   `okhp3-twitter-comment`; preserve quote-text form when it is explicitly
   requested. “Post it” alone does not authorize changing the form. A thread is
   never an automatic workaround for a weak or overlong idea.
2. Use the standard 280-character post constraint unless the user explicitly
   establishes an account entitlement and asks for a longer post. Platform
   limits and Premium allowances change, so verify the live composer before
   relying on a longer limit.
3. For a public progress post, lead with one concrete change, its user-visible
   effect, and a supplied public link when useful. Keep shipped runtime,
   repository documentation, mockups, media, and planned work distinguishable.
4. Mark consequential claims as `confirmed`, `aspirational`, or `unknown`.
   Current event, program, or campaign deadlines, scoring, awards, and entry
   rules require a supplied current official source. Do not manufacture
   urgency, consensus, trend claims, or an outcome from a thin sample; award
   confidence must remain aspirational until an official result exists.
5. Add a link, handle, hashtag, or media cue only when it is supplied and
   useful. A mention should address a real account, not create unwanted
   attention. Never use an unverified handle.
6. Run the public-context check: remove employer-identifying, private, or
   unsupported material. Return the draft, character count, and claim note. Do
   not post it.

## Output contract

Return `Draft`, `Character count`, `Fact and privacy note`, and `Claim status`.
If the source does not support the main claim, mark the draft
`needs_evidence`. If requested content exceeds the established format, tighten
it before proposing a thread. `Claim status` must distinguish confirmed,
aspirational, and unknown claims.

## Validation

Before return, verify the account and requested post form are known, a supplied
parent was routed to the reply skill, the character count is accurate for the
standard constraint unless entitlement was established, claims are
evidence-locked, public progress changes are not overstated as runtime proof,
and the response does not post or silently expand into a thread.

## Current platform references

- [X Help: how to post](https://help.x.com/en/using-x/how-to-post) (retrieved 2026-08-11) documents the ordinary 280-character post constraint and separately describes longer posts as an account-feature path.

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
