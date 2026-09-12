---
name: okhp3-openclaw-linkedin-drop
description: Turn a rough brain-dump into a reviewable LinkedIn draft file in a drop folder, using the OKHP3 brand-voice rules. Use when Jamie pastes a raw idea, a finished piece of work, or a rant and says "turn this into a LinkedIn post" or "draft this up".
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Create local LinkedIn draft files for owner review."
  out_of_scope: "Posting, LinkedIn API calls, and automatic publication."
  openclaw:
    requires: {}
---

# LinkedIn Drop

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Turning finished work into posts is the documented bottleneck in the OKHP3
LinkedIn pipeline. This skill exists to shrink the gap between "I did a
thing" and "there's a draft sitting in a folder ready to review," using only
the local model, no Frontier call needed for a first pass.

## Input

Whatever Jamie pastes: a raw idea, a paragraph of notes, a finished
deliverable he wants turned into a post, or a complaint/rant he wants
reframed as a lesson-learned post.

## What to do

1. Identify the angle: what's the one idea worth a post here. Don't try to
   cover everything he said; ROY applies (understanding produced divided by
   explanation invested) -- pick the sharpest single thread.
2. Draft in the established brand voice: punchy standalone lines as rhythm
   devices where they land naturally, no em dashes, paragraphs consolidated
   for LinkedIn's double-line-break renderer, hard close on the last line
   with no softening question tacked on afterward.
3. Write the draft plus two or three alternate angles as a short list at the
   bottom (titles only, one line each) in case the main draft misses.
4. Save it to `~/.openclaw/workspace/linkedin-drafts/<YYYY-MM-DD>-<slug>.md`
   (create the folder if it doesn't exist) with the draft as the file body
   and the alternate angles below a `---` separator.

## Output

Confirm the file path you wrote to, and paste the draft itself into the
chat response so Jamie can react without opening the file.

## What this skill never does

Never posts anything anywhere. This produces a file for Jamie to read,
edit, and post himself (or hand to whichever tool in the Council of AIs
does final polish). No LinkedIn API call, no browser automation to LinkedIn,
ever, from this skill.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
