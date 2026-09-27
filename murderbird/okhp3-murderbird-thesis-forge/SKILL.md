---
name: okhp3-murderbird-thesis-forge
description: Turn a research packet, rough idea, or brain-dump into a defensible one-sentence thesis, load-bearing outline, hook options, counterargument plan, and a hard ending, ready for drafting and a separate voice pass. Use when asked to find the angle, sharpen an argument, build an article skeleton, or "forge" a thesis. Do not use to write final prose or to publish.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: murderbird
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Thesis, structure, hooks, counterarguments, endings, and evidence needs for owner-authored long-form writing."
  out_of_scope: "Final prose, brand-voice rewriting, publishing, and fabricated evidence."
---

# MurderBird Thesis Forge

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

An argument is only as strong as its weakest load-bearing claim.

This skill builds the frame before anyone writes the walls: one thesis, the
claims it rests on, the objection it has to survive, and the line it ends on.

## Scope

Use for long-form, opinion-bearing writing: LinkedIn articles, essays,
manifesto principles, talks, and position pieces. Input may be a research
packet (`okhp3-openclaw-research-packet` or `okhp3-source-backed-research`),
notes, a transcript, or a rough draft.

Not for: short-post angle mining (`okhp3-linkedin-angles`), final prose
(`okhp3-linkedin-voice`), or publishing.

## Procedure

1. Extract every candidate idea from the input. Pick the sharpest single
   thread. ROY applies: understanding produced divided by explanation
   invested.
2. Write the thesis as one declarative sentence a reader could disagree with.
   If nobody could disagree, it isn't a thesis yet.
3. Identify three to five load-bearing claims the thesis needs. For each,
   note the evidence available and its `okhp3-evidence-standard` tier.
4. Name the strongest counterargument. Decide whether the piece concedes,
   rebuts, or reframes it. Never strawman it.
5. Outline sections so each carries exactly one claim. Cut anything that
   carries none.
6. Draft three hook options grounded in the input: a concrete scene, a sharp
   claim, and a counterintuitive observation. No invented anecdotes.
7. Draft the ending line. It must land hard on the thesis. No softening
   reader question appended afterward.
8. List evidence gaps as `[VERIFY: ...]` items for the research owner.

## Output contract

1. **Thesis:** one sentence.
2. **Why it matters:** one or two sentences on stakes for the reader.
3. **Load-bearing claims:**

   | # | Claim | Evidence | Tier |
   |---|---|---|---|

4. **Counterargument:** the objection and the chosen response.
5. **Outline:** numbered sections, one claim each.
6. **Hooks:** three options, labeled by type.
7. **Ending:** one closing line.
8. **Evidence gaps:** `[VERIFY: ...]` list.
9. **Handoff:** `[HANDOFF] [task summary] [result] [open questions]` for the
   drafting or voice-pass owner.

## Rules

- Anti-premature-simple. Simplify after the complexity is understood, not
  before.
- Never invent statistics, quotes, studies, anecdotes, or client stories.
- Exclude employer and private context by default.
- No em dashes. Standalone lines are rhythm devices; keep them where they
  land.
- Mermaid.ai links never appear in a post body; route diagrams through the
  owner's canonical site.
- Stop at the skeleton. The author and the voice pass own the prose.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
