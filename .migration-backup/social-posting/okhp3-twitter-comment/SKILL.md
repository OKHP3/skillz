---
name: okhp3-twitter-comment
description: >
  Draft an X reply, called a Twitter comment in this family, to a supplied post
  and conversation. Use when the user wants to reply on X, answer a tweet, join
  an existing X thread, request feedback, or report public progress.
  It keeps the parent context and reply visibility in view, then returns a
  draft only. Do not use for a new standalone post or publication.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.2.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting an evidence-locked X reply from a supplied parent post and conversation context, including public progress updates."
  out_of_scope: "Publishing, quote posting, pile-on behavior, or standalone post drafting."
---

# okhp3-twitter-comment

Portable, identity-agnostic Agent Skill.

On X, a comment is a reply with a parent post and a visible conversation.

## Scope

This package drafts one X reply from supplied parent-post context. It covers
answers, measured disagreement, feedback requests, and public progress updates
that name a concrete change and its user-visible effect. It does not publish,
quote-post, optimize engagement, or convert the reply into a new post.

## Public-package data boundary

This package, its evaluation fixtures, and its learning records are public
artifacts. Keep them agnostic: never store the execution account name, handle,
parent URL, personal detail, employer, project, event, topic, or opinion in the
package. Use execution-time placeholders such as `[ACCOUNT]`, `[PARENT_URL]`,
`[PUBLIC_SOURCE]`, and `[PROJECT]`; the live request supplies their values and
they are not written back into the package. Library provenance metadata is
separate from posting identity and must never be used as the acting account.

## Process

1. Resolve the acting account, exact parent URL, intended audience, and reply
   purpose. A request saying “post it” does not change a supplied reply into a
   standalone post. If the parent is missing, deleted, stale, or inaccessible,
   return `NEEDS INPUT` rather than drafting against a cropped timeline card.
2. Read the parent, material replies, and supplied public sources. State the
   intended contribution before drafting: answer, correction, evidence,
   question, feedback request, measured disagreement, or progress report.
3. For a public progress update, name one concrete change, its user-visible
   effect, and a public destination when supplied. Keep repository docs,
   mockups, media, and planned work distinct from shipped runtime behavior.
4. Mark consequential claims as `confirmed`, `aspirational`, or `unknown`.
   Current event, program, or campaign deadlines, scoring, awards, and entry
   rules require the supplied current official source; do not carry forward an
   older post. Award or outcome language may be aspirational, never a
   fabricated result.
5. Draft one reply that makes sense when read with the parent. Use a mention,
   link, or hashtag only when the supplied handle or URL is correct and useful.
   Do not copy the parent claim, attack a person, or add quote-post spin.
6. Keep to the standard 280-character constraint unless longer-post
   entitlement is explicitly established and verified. Tighten the reply rather
   than silently converting it into a thread. Cite or qualify consequential
   factual claims and remove private or employer-identifying material.
7. Return the draft and handoff metadata. Do not publish it; a host adapter may
   act only after the user approves the exact text and exact parent target.

## Platform boundary

X labels replies in relation to the parent, protected-account replies have
limited visibility, and post authors can hide replies. This package drafts a
good-faith contribution; it does not optimize ranking, evade moderation, or
automate engagement.

## Output contract

Return `Parent context checked`, `Draft`, `Character count`, `Claim/source
note`, and `Safety note`. The claim note identifies confirmed, aspirational,
and unknown claims and names the supplied public source for consequential facts.
If the parent is unavailable, request it. If the request asks for harassment,
fabricated consensus, an unsupported allegation, or a guaranteed outcome,
decline that portion and offer a factual or clearly aspirational alternative.

## Validation

Before return, verify the exact parent context is present, the reply stays
within the standard constraint unless entitlement was established, every
consequential claim has a status and source, a progress report separates
runtime behavior from supporting artifacts, and no harassment, pile-on, or
publication action remains.

## Current platform references

- [X Help: replies and mentions](https://help.x.com/en/using-x/mentions-and-replies) (retrieved 2026-08-11) explains reply context, protected-post visibility, and author controls for hidden replies.
- [X Help: how to post](https://help.x.com/en/using-x/how-to-post) (retrieved 2026-08-11) documents the standard post constraint.

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
