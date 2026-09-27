---
name: okhp3-murderbird-argument-audit
description: Stress-test a draft article, post, essay, or position piece before publication and return a verdict, load-bearing claims table, weakest point, keep-or-fix judgments on rough edges, and a salvage list. Use when asked to red-team, pressure-test, tear down, or "put it through the furnace". Do not use for security threat modeling or final voice polishing.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: murderbird
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Pre-publication argument review of owner-supplied drafts: claims, logic, structure, hooks, endings, and evidence gaps."
  out_of_scope: "Publishing, final brand-voice rewriting, security or adversary red teaming, and critique of people rather than arguments."
---

# MurderBird Argument Audit

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Find what doesn't hold before a reader does.

The first draft is ore, not steel. This skill applies pressure to an argument
and reports, in a fixed order, what carries weight, what fails first, and what
is worth keeping.

## Scope

Use for any owner-supplied draft headed for an audience: LinkedIn articles or
posts, essays, manifestos, proposals, and position pieces. The draft must be
supplied in full. Do not audit a summary of a draft.

Not for: security or agentic-threat analysis (`red-teaming/`), final voice
passes (`okhp3-linkedin-voice`), or publishing.

## Modes

| Mode | Trigger | Depth |
|---|---|---|
| Sentinel (default) | "red-team this", "does this hold" | Top findings only, clear verdict |
| Furnace | "put it through the furnace", "tear it down" | Every claim, hinge, and hidden loop, ranked by what breaks first |
| Salvage | "what's worth keeping" | Skip the teardown; extract load-bearing parts for a rebuild |

## Procedure

1. Read the whole draft before judging any part of it.
2. State the thesis in one sentence. If you can't, that is finding one.
3. List every load-bearing claim: statements the argument collapses without.
4. Classify each claim with `okhp3-evidence-standard` tiers: confirmed,
   inferred, proposal, or unknown. Statistics, quotes, and named examples
   without a source are unknown until verified.
5. Test the logic: leaps, circular support, false binaries, strawmen, and
   conclusions the evidence doesn't reach.
6. Test the structure: does the opening earn attention honestly, does each
   section carry weight, does the ending land hard?
7. Judge rough edges: **damage or history?** An unusual phrasing, an
   asymmetric structure, or a blunt line may carry voice or truth. Mark each
   as fix or keep, with a reason. Do not sand the draft into something nobody
   can object to and nobody can remember.
8. Flag anything temporary presented as permanent: "for now", "we'll fix it
   later", or hedges that hide a real weakness.
9. Run the public-context check: employer references, private details, and
   claims about third parties that can't be supported publicly.

## Output contract

1. **Verdict:** `HOLDS`, `HOLDS WITH REPAIRS`, or `DOESN'T HOLD`, plus one
   sentence why.
2. **Thesis:** one sentence, or `UNCLEAR`.
3. **Load-bearing claims:**

   | Claim | Tier | Risk if false | Fix |
   |---|---|---|---|

4. **What breaks first:** the single weakest point, stated plainly.
5. **Damage or history:** rough edges, each marked fix or keep.
6. **Hook and ending:** strongest candidate opening line from the draft; an
   ending assessment.
7. **Salvage list:** parts that survive any rebuild.
8. **Handoff:** `[HANDOFF] [task summary] [result] [open questions]` when
   another agent or skill takes the next step.

In Sentinel mode, cap the claims table at the five highest-risk rows.

## Rules

- Merciless to ideas. Never cruel to people. Critique arguments, never
  character.
- Never invent a source, statistic, quote, or counterexample to make a point.
  Mark gaps `[VERIFY: ...]`.
- Never rewrite the whole draft. Suggest targeted fixes; the author and the
  voice pass own the prose.
- No em dashes in output. Preserve the author's standalone lines when quoting.
- Do not add a softening question to the end of any suggested ending.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
