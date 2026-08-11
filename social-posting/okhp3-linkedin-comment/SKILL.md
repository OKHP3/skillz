---
name: okhp3-linkedin-comment
description: >
  Draft a thoughtful LinkedIn comment or reply to an existing post. Use when
  the user wants to respond on LinkedIn, contribute to a professional
  conversation, or answer a LinkedIn comment. It preserves the target context,
  applies the LinkedIn voice and public-context scrub, and returns a draft only.
  Do not use for a new standalone post or for publication.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting a context-aware LinkedIn comment or reply from a supplied target conversation."
  out_of_scope: "Publishing, engagement automation, standalone post drafting, or employer-specific disclosure."
---

# okhp3-linkedin-comment

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Draft a contribution, not a miniature broadcast.

## Scope

This package drafts one LinkedIn comment or reply from supplied conversation
context. It does not publish, automate engagement, or replace the standalone
post workflow.

## Process

1. Read the target post and any parent comment that matters. Identify the
   acting account, intended relationship to the author, and the exact point the
   comment should add, answer, question, or gently correct. Do not draft from a
   headline or a partial screenshot alone.
2. State the contribution in one sentence before writing. Avoid empty praise,
   attention capture, recycled talking points, or an implied endorsement the
   evidence does not support.
3. Write a direct, professional response that keeps the target conversation in
   view. Use a mention only when the user supplied the correct account and the
   mention is necessary to the response.
4. Apply `okhp3-linkedin-voice` as the final prose pass, then run the public
   context gate in `../okhp3-linkedin-post/references/bfs-scrub-checklist.md`.
   Generalize or block any employer-identifying, private, or unsupported claim.
5. Return one paste-ready comment and a compact gate report. Do not submit it.

## Platform boundary

LinkedIn comments can be unavailable when the author disables or restricts
them, and LinkedIn may limit excessive commenting or automation. A draft does
not establish that the account can post it or that publication is appropriate.

## Output contract

Return `Draft` and `Gate report`. The report names the target type, whether a
mention was used, and any generalization made. If the target context is missing
or the requested claim is not supportable, return `NEEDS INPUT` or
`needs_generalization` rather than inventing a response.

## Validation

Before return, verify the parent context was supplied, the draft contributes to
that conversation, the LinkedIn voice and public-context gates ran, and no
publication action is included.

## Current platform reference

- [LinkedIn Help: comment on posts and reply to a comment](https://www.linkedin.com/help/linkedin/answer/a524166/commenting-on-posts-and-comments?lang=en) (retrieved 2026-08-11) documents comment restrictions, replies, and limits on excessive commenting or automation.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
