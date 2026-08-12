---
name: okhp3-linkedin-comment
description: >
  Draft a thoughtful LinkedIn comment or reply to an existing post. Use when
  the user wants to respond on LinkedIn, contribute to a professional
  conversation, answer a LinkedIn comment, or add a source-backed public
  progress, launch, or checkpoint update. It preserves the target context,
  applies the LinkedIn voice and public-context scrub, and returns a draft only.
  Do not use for a new standalone post or for publication.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.2.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Drafting a context-aware LinkedIn comment or reply from a supplied target conversation."
  out_of_scope: "Publishing, engagement automation, standalone post drafting, or employer-specific disclosure."
---

# okhp3-linkedin-comment

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

Draft a contribution, not a miniature broadcast.

## Scope

This package drafts one LinkedIn comment or reply from supplied conversation
context. It does not publish, automate engagement, or replace the standalone
post workflow.

## Process

1. Read the target post and any parent comment that matters. Record the
   canonical target URL or stable post identifier when available. Identify the
   acting account, intended relationship to the author, and the exact point the
   comment should add, answer, question, or gently correct. Do not draft from a
   headline or a partial screenshot alone.
2. State the contribution in one sentence before writing. Avoid empty praise,
   attention capture, recycled talking points, or an implied endorsement the
   evidence does not support. A comment adds one contribution; if the request
   needs a multi-link campaign, route it to `okhp3-linkedin-post`.
3. For repository or public progress claims, verify the public source, exact
   ref, bounded observation window, timezone, and retrieval time. Keep a pending
   contest, award, or launch outcome pending. Do not claim a full test suite or
   deployment unless that result was actually observed.
4. Write a direct, professional response that keeps the target conversation in
   view. Use a mention only when the user supplied the correct account and the
   mention is necessary to the response. Keep one primary link; preserve
   user-supplied secondary links only when their roles are explicit and useful.
5. Apply `okhp3-linkedin-voice` as the final prose pass, then run the local
   public-context gate in `references/public-context-gate.md`. Generalize or
   block any employer-identifying, private, stale, or unsupported claim.
6. Return one paste-ready comment and a compact evidence and gate report. Do
   not submit it. Publication and rendered-text verification remain separate
   host actions after explicit user approval.

## Platform boundary

LinkedIn comments can be unavailable when the author disables or restricts
them, and LinkedIn may limit excessive commenting or automation. A draft does
not establish that the account can post it or that publication is appropriate.

## Output contract

Return `Draft` and `Gate report`. The report names the target type, canonical
target identifier, contribution, evidence window when applicable, primary link,
whether a mention was used, and any generalization made. If the target context
is missing or the requested claim is not supportable, return `NEEDS INPUT` or
`needs_generalization` rather than inventing a response.

## Validation

Before return, verify the parent context was supplied, the draft contributes to
that conversation, time-bounded claims have source evidence, the LinkedIn voice
and public-context gates ran, and no publication action is included.

## Current platform reference

- [LinkedIn Help: comment on posts and reply to a comment](https://www.linkedin.com/help/linkedin/answer/a524166/commenting-on-posts-and-comments?lang=en) (retrieved 2026-08-11) documents comment restrictions, replies, and limits on excessive commenting or automation.

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
