---
name: okhp3-facebook-post
description: >
  Draft a Facebook post for a named profile, Page, group, or event surface.
  Use when the user asks to write a Facebook update, Page post, or group post.
  It confirms destination and audience before drafting, preserves the supplied
  context, and returns a draft only. Do not use for comments, scheduling, or
  publication.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting a Facebook post for an explicitly named surface and audience."
  out_of_scope: "Publishing, scheduling, group joining, audience-setting changes, or comment drafting."
---

# okhp3-facebook-post

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Facebook context is part of the draft, not a detail to assume.

## Scope

This package drafts one Facebook post for an explicit profile, Page, group, or
event surface. It does not publish, schedule, set an audience, or draft a
comment.

## Process

1. Confirm the acting identity and destination: personal profile, Page, group,
   or event. Also confirm the intended audience and the desired action. If any
   of these are unknown, label the draft `NEEDS INPUT`.
2. Extract only public-safe, supplied facts. Distinguish a personal update,
   community contribution, and Page announcement. Do not turn one into another
   because it has a more promotional tone.
3. Draft a clear lead, one useful point or story, and a proportionate next
   action. Include a link, image reference, tag, or location only when the user
   provided it and it belongs to that destination.
4. Check the audience boundary again. Public Page and public-group material can
   be widely visible; do not expose private names, workplace context, or
   unsupported results merely because the text began as a personal update.
5. Return one paste-ready draft with a destination and audience label. Do not
   select an audience, schedule, or publish.

## Platform boundary

Facebook profiles use audience controls, while Page publishing and group
contexts have their own visibility and community rules. This skill drafts for
the stated surface; it does not infer account rights, visibility defaults, or
membership.

## Output contract

Return `Destination`, `Audience`, `Draft`, and `Safety note`. When the surface
or audience is absent, return the smallest set of questions needed to resolve
it rather than a generic public post.

## Validation

Before return, verify that destination and audience are explicit, every factual
claim came from supplied public-safe material, and the output is a draft rather
than a publication or setting change.

## Current platform references

- [Facebook Help: share and manage posts on your profile](https://www.facebook.com/help/1640261589632787) (retrieved 2026-08-11) covers profile post visibility and tagging.
- [Facebook Help: create and manage a Page's posts](https://www.facebook.com/help/215169031896481) (retrieved 2026-08-11) distinguishes Page publishing tools from profile posting.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
