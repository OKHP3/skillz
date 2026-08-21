---
name: okhp3-pinterest-comment
description: >
  Draft a Pinterest comment or reply from supplied Pin and conversation
  context. Use when the user wants a concise, grounded response under a named
  Pin. It returns a draft only and does not comment, react, highlight, delete,
  filter, report, message, or moderate content.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: public skills library
  in_scope: "Drafting account-neutral Pinterest comments and replies from supplied Pin and public-safe conversation context."
  out_of_scope: "Posting, reactions, comment highlighting, deletion, filtering, reporting, messaging, moderation, or account settings."
---

# okhp3-pinterest-comment

Portable, platform-specific drafting contract. Runtime context is supplied by the caller.

A Pinterest comment is a response to a supplied Pin and thread, not a Pin
creation or comment-management action.

## Scope

Draft one comment or reply for a supplied Pin using its conversation context
and source packet. Do not post, react, highlight, delete, filter, report,
message, or moderate any content.

## Public artifact boundary

Use `<PIN_REFERENCE>`, `<PARENT_COMMENT>`, `<DESTINATION>`,
`<SOURCE_PACKET>`, and `<PUBLIC_LINK>` as placeholders. Do not retain a real
account, person, board, organization, project, campaign, topic, bias, or
private history. Gather necessary inputs at runtime only.

## Process

1. Confirm the Pin, parent comment if replying, acting identity, intended
   audience, and supplied facts. Return `NEEDS INPUT` when the target context is
   missing.
2. Write one concise contribution: answer, acknowledgement, clarification,
   correction, or question. Keep factual corrections tied to supplied evidence.
3. Do not add a mention, link, call to action, or emoji pattern unless supplied
   and appropriate to the named conversation. Do not simulate participation or
   create repetitive engagement.
4. Do not offer to change comment controls or use comment-management functions.
   The acting account may have different rights to comment, reply, edit,
   highlight, filter, or report content; those controls are outside this skill.
5. Remove private, sensitive, copyrighted, or unsupported content. Return a
   draft and post handoff only.

## Platform boundary

Pinterest supports comments and replies on Pins, while comment management and
visibility controls are separate account actions. This package prepares text
without assuming a comment can be posted or highlighted.

## Output contract

Return `Reply target`, `Draft`, `Purpose`, `Claim note`, `Mention or link
note`, `Context gap`, and `Comment handoff`.

## Validation

Before return, verify the Pin and reply target are known, claims trace to
supplied context, no management action is implied, and the response does not
manufacture engagement.

## Current platform references

- [Pinterest Help: Comment on a Pin](https://help.pinterest.com/en/article/comment-on-a-pin) (retrieved 2026-08-11) documents comments, replies, and related comment-management controls.

## Public-neutrality gate

Keep this package portable for public distribution. Do not embed a person name,
account handle or URL, private identifier, employer or organization identity,
product or project name, campaign name, board-specific subject, or user-specific
topic in instructions, examples, references, or evaluations. Resolve runtime
context from the current request. See `../PUBLIC-NEUTRALITY.md`.

## About

Portable, account-neutral platform-drafting contract.
MIT License -- free to use, fork, and adapt.
