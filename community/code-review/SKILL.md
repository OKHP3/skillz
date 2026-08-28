---
name: code-review
description: Reviews a change — a diff, a PR, a branch, or uncommitted work — for correctness, risk, and maintainability, and reports findings ranked by severity. Use this whenever the user asks you to review, check over, or give feedback on code they or someone else wrote, mentions a pull request, or says a change is "ready", even if they only ask "does this look ok?". For examining a whole codebase rather than a change, use code-analysis; for vulnerabilities specifically, use security-analysis.
license: MIT
---

# Code review

A review is a search for the ways this change fails in production, ranked by how badly. It is
not a style pass. Style is the lint job's work — if you spend the review on formatting, you
have used up the reader's attention on the cheapest possible findings.

The bar for reporting: **could you write the input that makes this go wrong?** If not, you have
a question, not a finding. Say it as a question.

## 1. Understand the intent before reading the diff

Read the PR description, linked issue, or ask. Reviewing a change without knowing its goal
produces suggestions that fight the author's purpose.

Then decide what *should* have changed. Files you expected to see and don't are the highest-
yield finding in any review — a new state field with no migration, a new branch with no test,
a new error path with no logging.

**Done when:** you can state the intent in a sentence, and you have a list of what you expect
the diff to touch.

## 2. Read the change in dependency order

Not top to bottom, and not alphabetically, the order the tool shows you is meaningless. Start
at the data model or interface, then the logic, then the callers, then the tests. Meaning flows
that direction and reviewing against the flow means re-reading everything twice.

**Done when:** you have read every changed hunk, including the ones that look boring.

## 3. Hunt in priority order

Work down this list. Stop going deeper once you have found something serious enough to block —
a review that reports one real bug promptly beats a complete review delivered late.

**Correctness**
- Off-by-one, inverted condition, wrong default, wrong variable in a copy-pasted block
- Error paths — what happens when the call fails, returns empty, times out, returns partial?
- Boundaries — empty, one, many, null, zero, negative, maximum, duplicate, out of order
- Concurrency — shared mutable state, non-atomic read-modify-write, assumed ordering

**Blast radius**
- Is it reversible? A schema change, a data migration, or a published API is not
- Does it change behaviour for existing callers or stored data?
- Is it behind a flag, and does the off path actually work?

**Interface**
- Can this be called wrongly and still compile? Make the wrong call unrepresentable
- Are new failure modes visible to the caller, or swallowed?
- Does the name say what it does, including its surprises?

**Maintainability:** real, but never blocks a correct change on its own
- Would a stranger understand *why*, not just what? Comment the why, delete the what
- Is a concept now defined in two places?

**Tests**
- Does a test exist for the behaviour that changed, and would it fail without the change?
- Does it test through the public surface, or is it welded to internals?

**Done when:** you have walked all six categories or found a blocking issue.

## 4. Verify before reporting

For each candidate finding, construct the concrete failure: the input, the state, the resulting
wrong behaviour. Then check the surrounding code — a guard three lines up, a validated caller,
a type that makes it impossible.

Roughly half of first-pass findings die here. Verifying costs a minute; a wrong finding costs
the author twenty and costs you their attention on the next review.

**Done when:** every finding has a concrete failure path you have checked against the code.

## 5. Report ranked, with the fix

Order by severity, most severe first. Never by file order — the reader stops partway down, so
the ordering decides what actually gets fixed.

For each finding: **where**, **what breaks**, **the input that breaks it**, **what to do**.

```markdown
**`parser.py:88` — Off-by-one drops the final record**
`range(len(rows) - 1)` skips the last row. A 3-row upload writes 2 rows, silently.
Use `range(len(rows))`.
```

Separate what blocks from what doesn't. Label suggestions as suggestions — an unlabelled
preference reads as a requirement and turns review into a negotiation.

If you found nothing serious, say that plainly. "No blocking issues; two suggestions below" is
a complete and useful review. Inventing findings to look thorough is the fastest way to make
people stop asking for reviews.

## What not to do

- **Don't rewrite the change.** Review the change in front of you. "I would have done this
  differently" is not a finding unless the difference is a defect.
- **Don't report what a linter reports.** Formatting, unused imports, import order — automate
  those, ignore them here.
- **Don't stack minor findings to look thorough.** Fifteen nits bury the one real bug.
- **Don't assume the author is wrong.** Unfamiliar code is usually unfamiliar, not incorrect.
  Ask before asserting.
