---
name: okhp3-twitter-post
description: >
  Draft an X post using the portable name Twitter. Use when the user asks for a
  tweet, X post, concise Twitter update, quote text, or a thread opener. It
  writes one evidence-locked post for a named account and returns a draft only.
  Do not use for replies, posting automation, or assuming X Premium features.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting an X, formerly Twitter, post from supplied facts and account context."
  out_of_scope: "Publishing, replies, thread expansion without request, automation, or unsupported real-time claims."
---

# okhp3-twitter-post

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

`twitter` is this family's stable package name for X, formerly Twitter.

## Scope

This package drafts one X post, quote text, or requested thread opener. It does
not publish, reply, automate engagement, or assume a longer-post entitlement.

## Process

1. Confirm the acting account, intended audience, and whether this is one post,
   a quote-text draft, or the opening of a requested thread. A thread is never
   an automatic workaround for a weak or overlong idea.
2. Use the standard 280-character post constraint unless the user explicitly
   establishes an account entitlement and asks for a longer post. Platform
   limits and Premium allowances change, so verify the live composer before
   relying on a longer limit.
3. Lead with the single claim, observation, or question. Keep necessary source
   context near consequential facts. Do not manufacture urgency, consensus, or
   a trend from a thin sample.
4. Add a link, handle, hashtag, or media cue only when it is supplied and
   useful. A mention should address a real account, not create unwanted
   attention. Never use an unverified handle.
5. Run the public-context check: remove employer-identifying, private, or
   unsupported material. Return the draft and character count. Do not post it.

## Output contract

Return `Draft`, `Character count`, and `Fact and privacy note`. If the source
does not support the main claim, mark the draft `needs_evidence`. If requested
content exceeds the established format, tighten it before proposing a thread.

## Validation

Before return, verify the account and requested post form are known, the
character count is accurate for the standard constraint unless entitlement was
established, claims are evidence-locked, and the response does not post or
silently expand into a thread.

## Current platform references

- [X Help: how to post](https://help.x.com/en/using-x/how-to-post) (retrieved 2026-08-11) documents the ordinary 280-character post constraint and separately describes longer posts as an account-feature path.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
