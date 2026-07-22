---
name: okhp3-linkedin-voice
description: Apply the OKHP3 brand voice to any LinkedIn-bound text. Use as the FINAL pass on any LinkedIn post or article draft, whether produced by okhp3-linkedin-post or written by hand. Checks for em dashes, paragraph consolidation, ROY-principle density, ending strength, and link-routing rules. This is a filter applied to existing text, not a generator — if there's no draft yet, use okhp3-linkedin-post first.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: linkedin
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-linkedin-voice

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

The brand contract. Runs last, on text that already exists.

## Process

1. Read the draft.
2. Check against every rule in `references/voice-rules.md`.
3. Fix violations directly — don't just flag them, rewrite.
4. For articles specifically: verify the closing line is hard (no appended "what do you think?" or similar softening).
5. Return the corrected draft. If a rule required a judgment call (e.g., "is this line punchy enough to stand alone, or should it consolidate"), note the call made.

## Relationship to other skills

`okhp3-linkedin-post` should call this skill as its final step, not skip it assuming the draft is already compliant. `okhp3-linkedin-angles` does not need this skill — angle candidates aren't prose yet.

## Scope note

This skill governs LinkedIn output specifically. The "standalone punchy lines, don't consolidate" rule applies to non-LinkedIn long-form (articles, the Magnus Saga, etc.) — for LinkedIn posts specifically, paragraphs ARE consolidated (LinkedIn's renderer collapses single line breaks). See `references/voice-rules.md` for the platform-conditional rules.

## Output contract

Return the revised text, then a short change log listing only the rule categories changed or judged. Do not invent new facts, examples, links, or employer context while polishing. If the input is not LinkedIn-bound prose, say so and route to the appropriate skill instead of silently rewriting it.

## References

- `references/voice-rules.md` - canonical voice, density, fact-lock, and formatting rules.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
