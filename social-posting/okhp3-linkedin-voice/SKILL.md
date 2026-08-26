---
name: okhp3-linkedin-voice
description: Apply the platform-specific voice contract to any LinkedIn-bound text. Use as the final pass on a post, comment, checkpoint update, or public progress draft, whether produced by another skill or written by hand. It checks prose density, uncertainty, supplied links, hashtags, and public-context handoff. This is a filter, not a generator.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "2.2.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "The named LinkedIn content ideation, drafting, or voice-filtering workflow."
  out_of_scope: "Publication without approval, employer-confidential context, impersonation, or unrelated social-platform management."
---

# okhp3-linkedin-voice

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

The platform voice contract. Runs last, on text that already exists.

## Scope

This package is a final LinkedIn prose filter. It does not generate a new post,
publish content, or silently apply LinkedIn formatting to another platform.

## Process

1. Read the draft and preserve its intended surface: standalone post, comment, reply, checkpoint, or public progress update.
2. Check against every rule in `references/voice-rules.md`.
3. Fix violations directly - do not just flag them, rewrite.
4. Preserve factual uncertainty. Do not turn preparation into completion, hope into a win, or a supplied activity count into a stronger claim. Do not add metrics, links, hashtags, or examples that were not supplied.
5. For articles specifically: verify the closing line is hard (no appended "what do you think?" or similar softening).
6. Return the corrected draft. If a rule required a judgment call (for example, whether a line is punchy enough to stand alone or should consolidate), note the call made.

## Relationship to other skills

`okhp3-linkedin-post` should call this skill as its final step, not skip it assuming the draft is already compliant. `okhp3-linkedin-angles` does not need this skill — angle candidates aren't prose yet.

## Platform note

This skill governs LinkedIn output specifically. Platform-conditional formatting rules apply only when the target surface is known. See `references/voice-rules.md` for the portable rules.

## Output contract

Return the revised text, then a short change log listing only the rule categories changed or judged. Do not invent new facts, examples, links, hashtags, or employer context while polishing. Preserve any user-specified hashtag count and URL text. If the input is not LinkedIn-bound prose, say so and route to the appropriate skill instead of silently rewriting it.

## Validation

Before return, check every applicable rule in `references/voice-rules.md`,
confirm that no factual or employer context was introduced, and ensure a
non-LinkedIn input is routed rather than silently reformatted.

## References

- `references/voice-rules.md` - canonical voice, density, fact-lock, and formatting rules.

## Current platform references

- [LinkedIn Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies) (retrieved 2026-08-11) supports the authenticity, professionalism, and anti-spam boundaries retained by this final filter.

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
