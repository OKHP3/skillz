---
name: code-analysis
description: Builds an understanding of a whole codebase or subsystem — what it does, how it is structured, where the risk and complexity concentrate, and reports it as a map someone can act on. Use this whenever the user is new to a repo, inherits unfamiliar code, asks how something works end to end, wants an architecture overview or health assessment, or is deciding whether to refactor, extend, or replace. For reviewing a specific change, use code-review.
license: MIT
---

# Code analysis

The output is a **map**: what exists, how it fits together, and where the danger is. A map is
judged by whether someone can navigate with it, not by how much of the territory it mentions.

Analysis fails by exhaustiveness — describing every module at equal depth produces a document
with the same information density as the source, and no reason to read it. Depth must be
unequal, concentrated where the risk and the change is.

## 1. Read the outside before the inside

Before opening source files, read what the project says about itself and what it demonstrably
does: README, entry points, public API or route definitions, configuration, CI pipeline,
dependency manifest, and the shape of the test suite.

This gives you the intended architecture. The gap between it and the real one is a finding.

**Done when:** you can state what the system does, who calls it, and what it calls.

## 2. Find the spine

Every codebase has a small number of paths that carry most of the value. Trace one all the way
through — a request from entry to response, a job from trigger to side effect.

Follow it end to end before branching. The spine teaches you the project's real conventions,
its layering, and where its abstractions leak, far faster than reading modules in isolation.

**Done when:** you can narrate one complete path through the system, naming each hop.

## 3. Let the repository tell you where the risk is

History is evidence and costs almost nothing to gather. Where change concentrates, risk
concentrates.

```bash
git log --format=%H --since="1 year ago" | wc -l
git log --name-only --format= --since="1 year ago" | sort | uniq -c | sort -rn | head -20
```

Cross-reference the churn list against size and test coverage. The intersection — **large,
frequently changed, poorly tested** — is where incidents come from, and it is the most valuable
paragraph in your report.

Also worth a look: files changed by many different authors (shared, so conventions drift), and
files changed by exactly one author who has left.

**Done when:** you have a ranked list of hotspots grounded in history, not impression.

## 4. Assess structure honestly

- **Layering:** is there one, is it enforced, and where is it violated? A single import that
  crosses layers is a defect; a hundred means the layering is aspirational and should be
  described as such.
- **Coupling:** what would you have to touch to change one behaviour? Concepts defined in more
  than one place are where bugs get half-fixed.
- **Boundaries:** where does the system talk to the outside? Those are the places that fail,
  and the places that constrain change.
- **Dead code:** unreferenced modules, unreachable branches, flags permanently on. Note it;
  deleting it is the cheapest available improvement.
- **Tests:** what do they actually cover? Look at what they assert, not the coverage number. A
  suite that exercises everything and asserts nothing is worse than none, because it is trusted.

**Done when:** each dimension has a stated finding, including "fine, no action".

## 5. Report as a map with a recommendation

```markdown
# <System> — analysis

**What it does:** one paragraph, no jargon
**Shape:** the 4–6 components that matter and how they connect

## The spine
The main path, hop by hop, with file references.

## Hotspots
| Area | Churn | Size | Tests | Why it matters |

## Structural findings
Ranked. Each: what it is, what it costs today, what it will cost later.

## If you change one thing
The single highest-value change, and why it beats the alternatives.

## Not covered
What was out of scope, and what remains unknown.
```

Use `path/to/file.py:120` references throughout. A map without coordinates is an essay.

**The "not covered" section is mandatory.** An analysis that does not state its own limits gets
read as complete, and its silence gets read as approval.

## Rules

- **Depth follows risk.** The hot, untested, load-bearing module deserves ten times the words
  of a stable utility. Equal depth is a failure of analysis, not a sign of thoroughness.
- **Separate observation from judgment.** "Auth logic appears in three modules" is observation.
  "This should be consolidated" is judgment, and the reader is entitled to weigh them apart.
- **Report what you did not read.** Nobody reads a large codebase completely. Which parts you
  skipped changes how much the reader should trust the conclusions.
- **Do not recommend a rewrite casually.** It is almost always the wrong answer, and proposing
  it costs you credibility on the recommendations that would actually help.
