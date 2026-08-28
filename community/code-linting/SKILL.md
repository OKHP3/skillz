---
name: code-linting
description: Sets up, fixes, or tunes linting and formatting for a project in any language — Python, JavaScript/TypeScript, Go, Rust, Java/Kotlin, Ruby, shell, SQL, Markdown, YAML, Dockerfiles, Terraform. Use this whenever the user mentions linting, formatting, style checks, pre-commit hooks, a noisy or failing lint job, or asks to clean up or standardise a codebase, and also when a project has no linter at all and work is starting on it. For reviewing a specific change, use code-review; linting is what makes that review worth doing.
license: MIT
---

# Code linting

A linter's job is to make an entire category of review comment impossible. Every rule you
enable should retire a conversation nobody should have again.

The failure mode: a lint config so noisy that people run it with `--no-verify`, or so lax it
catches nothing. Both end with the linter ignored. Aim for a config where **every reported
problem is worth fixing**, because that is what keeps the signal trusted.

## 1. Find out what already exists

Never add a second linter alongside a working one. Check for config files, CI lint steps, and
editor settings before proposing anything.

```bash
ls -a | grep -Ei 'lint|format|pre-commit|editorconfig|prettier|ruff|eslint'
```

Also check whether it currently passes. A config that has been failing for months is a
different problem from a missing config — that one is a decision to make, not a tool to install.

**Done when:** you know which tools are configured, whether they run in CI, and whether they
currently pass.

## 2. Pick the stack's tooling

Read the matching reference for the recommended tool, its config, and the rules worth enabling
or disabling:

| Stack | Reference |
| --- | --- |
| Python | `references/python.md` |
| JavaScript / TypeScript | `references/javascript.md` |
| Go | `references/go.md` |
| Rust | `references/rust.md` |
| Java / Kotlin | `references/jvm.md` |
| Ruby | `references/ruby.md` |
| Shell | `references/shell.md` |
| SQL | `references/sql.md` |
| Markdown / YAML / JSON | `references/markup.md` |
| Docker / Terraform | `references/infra.md` |

For a stack not listed, apply the principles below and prefer the ecosystem's dominant tool
over the technically best one — adoption beats capability for a linter.

**Done when:** one formatter and one linter chosen per language in the repo.

## 3. Separate formatting from linting

These are different jobs and conflating them causes most lint pain.

- **Formatting** is not a matter of opinion once a tool is chosen. Zero configuration, run on
  save, auto-fix always, never discussed again.
- **Linting** catches likely bugs and real hazards. It requires judgment and should be tuned.

Never let both own the same concern — a formatter and a linter fighting over line breaks
produces an unfixable file. Where the ecosystem's linter includes formatting rules, disable
them and let the formatter win.

**Done when:** formatting is fully automatic, and the linter has no formatting rules enabled.

## 4. Choose rules by what they prevent

Enable, roughly in order of value:

1. **Certain bugs** — unreachable code, unused variables that indicate a typo, shadowed names,
   `==` on incompatible types, unhandled promise or error return
2. **Resource and correctness hazards** — unclosed handles, mutable default arguments, bare
   excepts, ignored return values that matter
3. **Real portability and security traps** — unquoted shell expansion, hardcoded secrets,
   unsafe deserialization
4. **Consistency that affects reading** — import ordering, naming conventions

Do not enable rules that encode taste — maximum function length, comment style, arbitrary
complexity ceilings. They generate churn and teach people to suppress warnings, which is the
habit you least want.

**Done when:** you can justify each enabled rule category by the failure it prevents.

## 5. Adopt without a thousand-file diff

Turning on a linter over an existing codebase produces an unreviewable change. Instead:

1. Apply the **formatter** in one isolated commit, touching nothing else. Record its hash in a
   `.git-blame-ignore-revs` file so blame stays useful.
2. Turn the **linter** on for changed files only, then raise coverage over time.
3. Fix auto-fixable rules in a second isolated commit.
4. Leave remaining violations as a baseline the count of which may only go down.

Never mix a reformat with a behaviour change in one commit — it makes the real change invisible
to review and to bisect.

**Done when:** formatting and logic changes are in separate commits, and CI enforces the new
state.

## 6. Wire it where it actually runs

Three places, each doing a different job:

- **Editor:** format on save, lint inline. Where it is cheapest to fix.
- **Pre-commit hook:** auto-fixable rules only, and it must be fast. A hook slower than a few
  seconds gets bypassed, permanently.
- **CI:** the authority. Check-only, never auto-fix on a branch. This is the one that decides.

Pin tool versions. An unpinned linter turns a routine upgrade into a red build on an unrelated
PR, which is how teams learn to distrust the lint job.

**Done when:** the same rules produce the same result in all three places.

## When the lint job is already failing

Do not "fix the lint errors" as one task. Sort them first:
- **Real bugs** → fix, separately, with a test
- **Noise from a bad rule** → disable the rule and say why, in the config
- **Legacy violations** → baseline them, do not bulk-suppress inline

Inline suppressions are the worst outcome: invisible, permanent, and they hide the real
instances of the rule. If a rule needs suppressing more than a few times, the rule is wrong for
this codebase — turn it off at the config level where the decision is reviewable.
