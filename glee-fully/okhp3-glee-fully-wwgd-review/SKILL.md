---
name: okhp3-glee-fully-wwgd-review
description: Run a WWGD (What Would Glee Do, Say, Think, Feel) reception check on a draft email, post, article, or message using the Glee-fully persona lens. Scores warmth, kindness, clarity, joy, and "does this sound like the author or like a jerk", then returns keep-or-soften notes. Use when asked for a WWGD check, a warmth pass, or "how will this land". Not a proxy for any real person's opinion.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: glee-fully
  origin: okhp3/skillz
  homepage: https://glee-fully.tools
  author-github: https://github.com/OKHP3
  in_scope: "Reception and warmth review of owner-authored drafts through the published Glee-fully persona lens."
  out_of_scope: "Rewriting whole drafts, fact-checking, publishing, and representing the views of any real person."
---

# Glee-fully WWGD Review

**OverKill Hill P³** · [glee-fully.tools](https://glee-fully.tools) · [github.com/OKHP3](https://github.com/OKHP3)

Joy is not fluff. Joy is adoption strategy.

WWGD asks one question of a finished draft: how will this land with a warm,
sharp, kind reader who can smell a jerk from across the room? It applies the
published Glee-fully persona (see [glee-fully.tools/persona](https://glee-fully.tools/persona/))
as a reception lens.

## Scope

Use as the last check before the owner sends or publishes something that
matters to people: relationship-heavy email, sensitive replies, public posts,
and articles that critique ideas or organizations.

This is a persona lens. It is not a model of, or substitute for, any real
person's judgment. Never present its output as what a real person thinks or
feels. For decisions that matter between real people, ask them.

Not for: argument red teaming (`okhp3-murderbird-argument-audit`), fact
verification (`okhp3-evidence-standard`), or final LinkedIn voice
(`okhp3-linkedin-voice`).

## Rubric

Score each dimension 1 to 5 and cite the exact line that drove the score.

| Dimension | Question |
|---|---|
| Warmth | Does a real human feel seen, or processed? |
| Kindness | Is anyone belittled, dismissed, or made the punchline? |
| Clarity | Would a busy reader get it on one pass? |
| Joy | Is there any life in it, or is it a beige rectangle? |
| Author-true | Does this sound like the author on a good day, or like a jerk on a bad one? |

## Procedure

1. Read the whole draft and note who receives it and what they're feeling.
2. Score the five dimensions with line citations.
3. Flag lines that would sting unintentionally. Distinguish them from lines
   that are sharp on purpose and earn it; keep those.
4. Suggest targeted softenings or warmups for flagged lines only. Never
   rewrite the whole draft, and never flatten a deliberate edge.
5. Verify before returning: every flag cites a line, and no suggestion adds a
   fact, promise, or feeling the author didn't express.

## Output contract

1. **WWGD verdict:** `SEND IT`, `SEND WITH TWEAKS`, or `SLEEP ON IT`.
2. **Scores:** five-row table with line citations.
3. **Keep:** sharp lines that earn their edge.
4. **Soften:** flagged lines with one targeted suggestion each.
5. **One-line gut check:** the reception in a sentence, in the Glee-fully
   voice when the runtime persona supplies it, plain otherwise.

## Rules

- Critique the draft, never the author.
- No em dashes in suggestions.
- Do not add closing questions, emojis, or exclamation points the author
  didn't use, unless the draft's register clearly invites them.
- Private context in the draft stays private; do not echo it beyond the
  citation needed.

## About

Built by [Jamie Hill](https://overkillhill.com) · [Glee-fully Personalizable Tools](https://glee-fully.tools) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
