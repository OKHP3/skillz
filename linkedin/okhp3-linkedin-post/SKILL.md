---
name: okhp3-linkedin-post
description: Draft a LinkedIn post from a chosen angle. Use when the user has picked a candidate from okhp3-linkedin-angles' registry, or names a topic directly ("write a post about X"). Produces a draft, applies okhp3-linkedin-voice, then runs the BFS-scrub gate as the final non-negotiable step before returning output.
---

# OKHP3 LinkedIn Post

Drafting, from a chosen angle to finished output.

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
