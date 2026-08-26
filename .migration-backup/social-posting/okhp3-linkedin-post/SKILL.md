---
name: okhp3-linkedin-post
description: Draft a source-backed LinkedIn post from a chosen angle or named topic. Use for standalone posts, public progress updates, launch or checkpoint recaps, deadline updates, or "write a post about X". It applies voice and the final public-context scrub, then returns a draft only.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "2.3.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "The named LinkedIn content ideation, drafting, or voice-filtering workflow."
  out_of_scope: "Publication without approval, employer-confidential context, impersonation, or unrelated social-platform management."
---

# okhp3-linkedin-post

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

Drafting, from a chosen angle to finished output.

## Scope

This package drafts a LinkedIn post only. It does not publish, schedule, manage
comments, or create content for another platform.

## Process

1. **Input.** A chosen angle (core insight + evidence + category, from `okhp3-linkedin-angles`' registry) or a directly-named topic. For repository activity, require the public ref, bounded observation window, timezone, retrieval time, and source locations before making a count or “since yesterday” claim.
2. **Draft.** Write the post. Lead with the angle's core insight. Do not use throat-clearing or a generic hook such as “Ever wondered...”. Keep a pending contest, award, or launch outcome pending; never write hope, preparation, or audience voting as a win.
3. **CTA and links.** Choose one primary destination. If the user supplied multiple public surfaces, include secondary links only when each has a distinct named role and the post remains scannable. Do not replace supplied URLs, invent destinations, or turn a comment-shaped request into a standalone campaign post.
4. **Voice pass.** Hand the draft to `okhp3-linkedin-voice` for the brand-rule pass (em dashes, paragraph consolidation, ROY density, link routing, uncertainty, and requested hashtag count).
5. **Public-context scrub - final gate, hard, non-negotiable.** Run `references/public-context-scrub-checklist.md` against the voice-polished draft. This runs LAST, after voice, because voice polish can itself introduce specifics. No draft leaves this skill without passing this gate, regardless of how confident earlier steps were.
6. **Output.** Return the finished draft, evidence note, primary CTA, secondary-link roles, and gate report. If anything was caught and removed at step 5, note only its category. State that publication remains a separate, explicitly authorized host action.

## Order matters

Draft -> CTA/link check -> Voice -> public-context scrub -> output. Not scrub-then-voice: voice polish happens on content, then the final safety check happens on the actual thing that is about to be published, not an earlier draft of it.

## Relationship to angles

If no angle was provided and the user just says "write a post about X" with no prior `okhp3-linkedin-angles` pass, that's fine — angles is for triage of EXISTING work, not a mandatory gate before every post. Direct topic requests skip straight to drafting.

## Output contract

Return one paste-ready LinkedIn draft followed by a compact evidence and gate report. The draft must contain no employer-identifying material, no unsupported factual claims presented as facts, no settled language for an undecided outcome, and no unresolved public-context findings. Preserve any user-specified hashtag count exactly. If the requested claim cannot survive the scrub, return a generalized version or stop with the specific category of blocker.

## Validation

Before return, verify the order was draft, CTA/link check, voice, then public-context
scrub; confirm the report names the evidence window and any category corrected;
and do not return a claim whose evidence remains unsupported, stale,
employer-specific, or dependent on an undecided outcome.

## References

- `references/public-context-scrub-checklist.md` - final employer-context and public-safety gate.
- `okhp3-linkedin-voice` - load this sibling skill as the separate final prose pass; its rules are not a hidden package dependency.

## Current platform references

- [LinkedIn Help: Post and share updates](https://www.linkedin.com/help/linkedin/answer/a527227) (retrieved 2026-08-11) documents post visibility, comment, and partnership-label choices that remain account-side decisions.
- [LinkedIn Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies) (retrieved 2026-08-11) supports the truthfulness, disclosure, and non-manipulation boundaries.

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
