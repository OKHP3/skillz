---
name: okhp3-twitter-comment
description: >
  Draft an X reply, called a Twitter comment in this family, to a supplied post
  and conversation. Use when the user wants to reply on X, answer a tweet, or
  join an existing X thread. It keeps the parent context and reply visibility
  in view, then returns a draft only. Do not use for a new standalone post or
  publication.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting an X reply from a supplied parent post and conversation context."
  out_of_scope: "Publishing, quote posting, pile-on behavior, or standalone post drafting."
---

# okhp3-twitter-comment

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

On X, a comment is a reply with a parent post and a visible conversation.

## Scope

This package drafts one X reply from supplied parent-post context. It does not
publish, quote-post, optimize engagement, or convert the reply into a new post.

## Process

1. Read the parent post, material replies, and supplied account context. State
   the intended contribution before drafting: answer, correction, evidence,
   question, or measured disagreement.
2. Draft one reply that makes sense when read with the parent. Do not copy the
   parent claim, attack a person, or add a quote-post spin when the request is
   a reply.
3. Use a mention only when the supplied handle is correct and relevant. Treat a
   reply as potentially selective in distribution and subject to author
   moderation; do not promise reach or visibility.
4. Keep to the standard 280-character constraint unless the user establishes a
   longer-post entitlement. Cite or qualify consequential factual claims and
   remove private or employer-identifying material.
5. Return one paste-ready reply, its character count, and a context note. Do
   not publish it.

## Platform boundary

X labels replies in relation to the parent, protected-account replies have
limited visibility, and post authors can hide replies. This package drafts a
good-faith contribution; it does not optimize ranking, evade moderation, or
automate engagement.

## Output contract

Return `Parent context checked`, `Draft`, `Character count`, and `Safety note`.
If the parent is unavailable, request it. If the request asks for harassment,
fabricated consensus, or an unsupported allegation, decline that portion and
offer a factual alternative.

## Validation

Before return, verify the parent context is present, the reply stays within the
standard constraint unless entitlement was established, claims are supported,
and no harassment, pile-on, or publication action remains.

## Current platform references

- [X Help: replies and mentions](https://help.x.com/en/using-x/mentions-and-replies) (retrieved 2026-08-11) explains reply context, protected-post visibility, and author controls for hidden replies.
- [X Help: how to post](https://help.x.com/en/using-x/how-to-post) (retrieved 2026-08-11) documents the standard post constraint.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
