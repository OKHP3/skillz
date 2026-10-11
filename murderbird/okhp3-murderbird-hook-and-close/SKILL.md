---
name: okhp3-murderbird-hook-and-close
description: Forge and stress-test the opening line and closing line of a short post (LinkedIn, X, Threads, Bluesky, Discord) so the hook earns attention honestly and the close lands hard on the point. Returns scored hook and close options with a pick. Use when a short draft exists and the owner asks to sharpen the hook, fix the ending, or "make it land". Not for full drafting, angle mining, or publishing.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: murderbird
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Opening and closing lines for owner-authored short posts, scored for honesty, specificity, tension, and landing."
  out_of_scope: "Full post drafting, angle mining, final voice filtering, clickbait, engagement bait, and publishing."
---

# MurderBird Hook and Close

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Short posts live or die in two lines.

The first line decides whether anyone reads. The last line decides whether
anyone remembers. This skill works only on those two load-bearing points and
leaves the middle to the author.

## Scope

Use on a short draft that already has a point: a LinkedIn post, an X post, a
Threads or Bluesky post, or a Discord announcement. Long-form articles use
`okhp3-murderbird-thesis-forge` for hooks and endings.

Not for: finding the angle (`okhp3-linkedin-angles`), drafting the post
(`okhp3-linkedin-post` or the platform post skill), final voice filtering
(`okhp3-linkedin-voice`), or publishing.

## Procedure

1. Read the whole draft. State its point in one sentence. If there isn't one,
   stop and say so; no hook can rescue a missing point.
2. Score the current opening and closing lines against the rubric.
3. Write three hook options from material already in the draft:
   - **Concrete:** a specific moment, object, number, or scene.
   - **Claim:** the point stated sharply enough to disagree with.
   - **Turn:** a counterintuitive observation the post actually supports.
4. Write three close options that land on the point:
   - **Callback:** returns to the hook's image or claim, resolved.
   - **Verdict:** a short declarative that states what the reader now knows.
   - **Standalone line:** one punchy sentence set apart as its own paragraph.
5. Score every option. Discard anything the post body doesn't support.
6. Pick one hook and one close, and say why in one line each.
7. Verify before returning: every option is grounded in the draft, no
   invented facts or numbers appear, and no close ends in a question.

## Rubric

Score each line 1 to 5.

| Dimension | Question |
|---|---|
| Honest | Does the post deliver what this line promises? |
| Specific | Could this line only belong to this post? |
| Tension | Does it create a reason to keep reading, or to remember? |
| Lands | Does it hit the point, not a nearby point? |
| Platform-fit | Does it survive the platform's truncation and formatting? |

A line that scores 1 on Honest is disqualified regardless of total.

## Output contract

1. **Point:** one sentence.
2. **Current lines:** scores for the existing hook and close.
3. **Hook options:** three, labeled, scored.
4. **Close options:** three, labeled, scored.
5. **Pick:** chosen hook and close, one-line reason each.

## Rules

- No clickbait, fake suspense, "you won't believe", or engagement bait
  ("Agree?", "Thoughts?", "Comment YES").
- Closes never end in a question and never soften the point afterward.
- No em dashes. Standalone lines are rhythm devices; use them on purpose.
- Never invent a statistic, quote, anecdote, or client story for a hook.
- Exclude employer and private context by default.
- Change only the two lines. Flag middle problems without fixing them.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
