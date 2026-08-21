---
name: okhp3-patreon-comment
description: >
  Draft a Patreon comment or reply from supplied post and access context. Use
  when the user needs a privacy-preserving response within a named Patreon post
  discussion. It returns text only and does not comment, change access, inspect
  membership or payment data, message members, moderate, or publish.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: public skills library
  in_scope: "Drafting account-neutral Patreon comments and replies from supplied post, access, and public-safe conversation context."
  out_of_scope: "Posting comments, access or membership changes, payment data, direct messages, moderation, scheduling, or publication."
---

# okhp3-patreon-comment

Portable, platform-specific drafting contract. Runtime context is supplied by the caller.

A Patreon reply must respect the supplied post’s access and privacy context.

## Scope

Draft one comment or reply for a supplied Patreon post. Use only supplied
parent context, intended access boundary, and public-safe source material. Do
not comment, inspect or change membership access, handle payments, message a
member, moderate content, or publish.

## Public artifact boundary

Use `<POST_REFERENCE>`, `<PARENT_COMMENT>`, `<ACCESS_BOUNDARY>`,
`<SOURCE_PACKET>`, and `<PUBLIC_LINK>` as placeholders. Package materials must
not retain an account, member identity, payment data, organization, project,
campaign, topic, bias, or private history. Resolve minimal context at runtime.

## Process

1. Confirm the parent post or comment, acting identity, intended access
   boundary, audience, and supplied facts. If the conversation or access
   context is missing, return `NEEDS INPUT`.
2. Write one bounded contribution: answer, acknowledgement, clarification,
   correction, or question. Do not promise a benefit, payment result,
   fulfillment action, or ongoing relationship without supplied support.
3. Keep access and privacy separate from tone. Do not expose member identity,
   email, payment, order, or private-message information in a reply. Do not
   claim that a recipient has a given membership status.
4. Preserve supplied public links and attribution exactly. Do not add a direct
   message invitation, access promise, or call to action unless explicitly
   supplied and appropriate to the stated boundary.
5. Return a draft and handoff only. A separate approved operator may comment or
   moderate after checking current post settings.

## Platform boundary

Patreon post discussions can use access and moderation settings selected by the
account holder. This package writes a response for supplied context but does not
infer who can view, reply to, or moderate the thread.

## Output contract

Return `Reply target`, `Intended access context`, `Draft`, `Purpose`, `Privacy
and claim note`, `Context gap`, and `Comment handoff`.

## Validation

Before return, verify the parent and access boundary are explicit, claims are
supplied, no member or payment information appears, and no comment or setting
change is implied.

## Current platform references

- [Patreon Help: Comment settings](https://support.patreon.com/hc/en-us/articles/19789361628045-Comment-settings) (retrieved 2026-08-11) documents that post comment access and moderation are configurable.
- [Patreon Help: Comment on a post](https://support.patreon.com/hc/en-gb/articles/360031098531-Comment-on-a-post) (retrieved 2026-08-11) documents comments and replies within a post discussion.

## Public-neutrality gate

Keep this package portable for public distribution. Do not embed a person name,
account handle or URL, private identifier, employer or organization identity,
product or project name, campaign name, payment detail, or user-specific
subject in instructions, examples, references, or evaluations. Resolve runtime
context from the current request. See `../PUBLIC-NEUTRALITY.md`.

## About

Portable, account-neutral platform-drafting contract.
MIT License -- free to use, fork, and adapt.
