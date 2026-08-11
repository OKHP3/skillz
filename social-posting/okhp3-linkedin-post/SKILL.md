---
name: okhp3-linkedin-post
description: Draft a LinkedIn post from a chosen angle. Use when the user has picked a candidate from okhp3-linkedin-angles' registry, or names a topic directly ("write a post about X"). Produces a draft, applies okhp3-linkedin-voice, then runs the BFS-scrub gate as the final non-negotiable step before returning output.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "2.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "The named LinkedIn content ideation, drafting, or voice-filtering workflow."
  out_of_scope: "Publication without approval, employer-confidential context, impersonation, or unrelated social-platform management."
---

# okhp3-linkedin-post

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Drafting, from a chosen angle to finished output.

## Scope

This package drafts a LinkedIn post only. It does not publish, schedule, manage
comments, or create content for another platform.

## Process

1. **Input.** A chosen angle (core insight + evidence + category, from `okhp3-linkedin-angles`' registry) or a directly-named topic.
2. **Draft.** Write the post. Lead with the angle's core insight — no throat-clearing, no generic hook ("Ever wondered...").
3. **Voice pass.** Hand the draft to `okhp3-linkedin-voice` for the brand-rule pass (em dashes, paragraph consolidation, ROY density, link routing).
4. **BFS scrub — final gate, hard, non-negotiable.** Run `references/bfs-scrub-checklist.md` against the voice-polished draft. This runs LAST, after voice, because voice polish can itself introduce specifics (e.g., "make this more concrete" pulling in a detail that wasn't there before). No draft leaves this skill without passing this gate, regardless of how confident earlier steps were.
5. **Output.** Return the finished draft. If anything was caught and removed at step 4, note what category it was (without restating the removed content) so the user knows the gate fired.

## Order matters

Draft -> Voice -> BFS scrub -> output. Not scrub-then-voice — voice polish happens on content, then the final safety check happens on the actual thing that's about to be published, not an earlier draft of it.

## Relationship to angles

If no angle was provided and the user just says "write a post about X" with no prior `okhp3-linkedin-angles` pass, that's fine — angles is for triage of EXISTING work, not a mandatory gate before every post. Direct topic requests skip straight to drafting.

## Output contract

Return one paste-ready LinkedIn draft followed by a compact gate report. The draft must contain no employer-identifying material, no unsupported factual claims presented as facts, and no unresolved BFS findings. If the requested claim cannot survive the scrub, return a generalized version or stop with the specific category of blocker.

## Validation

Before return, verify the order was draft, voice, then BFS scrub; confirm the
gate report names any category corrected; and do not return a claim whose
evidence remains unsupported or employer-specific.

## References

- `references/bfs-scrub-checklist.md` - final employer-context and public-safety gate.
- `../okhp3-linkedin-voice/references/voice-rules.md` - voice rules applied by the voice pass.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
