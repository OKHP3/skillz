---
name: okhp3-facebook-comment
description: >
  Draft a Facebook comment or reply to a supplied post and conversation. Use
  when the user wants to comment on Facebook, reply in a group discussion, or
  respond beneath a Page or profile post. It respects the original context and
  visibility boundary, then returns a draft only. Do not use for a new post or
  publication.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting a contextual Facebook comment or reply from supplied conversation material."
  out_of_scope: "Publishing, moderation action, friend or group management, or standalone post drafting."
---

# okhp3-facebook-comment

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

A Facebook comment inherits the audience of its conversation.

## Scope

This package drafts one Facebook comment or reply from a supplied target
conversation. It does not publish, moderate, manage a group, or create a new
standalone post.

## Process

1. Read the full target post, parent comment when replying, and named
   destination. Identify whether it is a profile, Page, group, or event
   conversation. Do not compose against a cropped excerpt alone.
2. Identify the contribution: answer, acknowledgement, clarification, useful
   addition, or respectful disagreement. Do not use a comment to redirect a
   conversation into an unrelated promotion.
3. Draft a response that names only facts supported by the supplied material or
   attached public sources. Tag an account only when the user supplied the
   correct target and the tag is contextually needed.
4. Recheck visibility. Comments on public posts, Pages, and public groups can
   be public. Remove private, employer, household, or customer context that is
   not appropriate for that audience.
5. Return one paste-ready draft and a short context note. Do not submit it.

## Output contract

Return `Target surface`, `Draft`, and `Safety note`. If a post or parent
comment is missing, request it. If the request depends on private facts,
provide a generalized alternative or stop with the privacy boundary.

## Validation

Before return, verify the target surface and parent context are known, the
draft adds a relevant contribution, public visibility was considered, and no
private or employer-specific material remains.

## Current platform references

- [Facebook Help: news feed privacy](https://www.facebook.com/help/420576494648116) (retrieved 2026-08-11) explains that comments on public posts, Pages, and public groups are public.
- [Facebook Help: share and manage posts on your profile](https://www.facebook.com/help/1640261589632787) (retrieved 2026-08-11) documents profile visibility and tagging context.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
