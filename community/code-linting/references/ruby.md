# Ruby linting

## Tools

**RuboCop** does linting and formatting in one, and is effectively universal in Ruby. There is
no meaningful alternative decision to make.

Add **Standard** instead if you want RuboCop with zero configuration and no style debates — it
is a preset that disables all the configurable style cops. For a team that has previously
burned time arguing about RuboCop settings, this is the better choice.

```yaml
# .rubocop.yml
require:
  - rubocop-performance
  - rubocop-rspec        # if using RSpec

AllCops:
  TargetRubyVersion: 3.3
  NewCops: enable
  Exclude:
    - "db/schema.rb"
    - "db/migrate/*"
    - "vendor/**/*"
    - "node_modules/**/*"

Metrics:
  Enabled: false          # complexity ceilings generate churn, not better code

Style/Documentation:
  Enabled: false          # top-level class comments as a rule are noise

Layout/LineLength:
  Max: 120
```

## What to keep on

The **Lint** department is the valuable one — these are bugs, not style:

- `Lint/UselessAssignment`, `Lint/ShadowingOuterLocalVariable` — usually typos
- `Lint/DuplicateMethods` — silently redefines, no error
- `Lint/UnreachableCode`
- `Lint/SuppressedException` — a bare `rescue` swallowing everything, including `NoMemoryError`

**Security** cops catch `eval`, `Marshal.load`, and `open` with interpolation. Keep these on
even if you disable everything else.

For Rails, add **rubocop-rails** — `Rails/OutputSafety` and `Rails/SkipsModelValidations`
prevent real problems, and `Rails/UniqueValidationWithoutIndex` catches a race condition people
consistently miss.

## What to turn off

The whole **Metrics** department. `AbcSize`, `MethodLength`, `ClassLength`, `BlockLength` — these
produce `rubocop:disable` comments rather than refactoring, and the numbers are arbitrary.

Most **Style** cops are taste. If you are keeping RuboCop's style department at all, run
`rubocop --auto-gen-config` once to baseline the existing violations rather than fixing
thousands of them.

## Adoption on an existing codebase

```bash
rubocop --auto-gen-config      # writes .rubocop_todo.yml with current violations
```

This excludes existing violations so new code is checked while old code is grandfathered. Then
shrink the todo file over time. Do not bulk-autocorrect a large codebase — `-A` (unsafe
autocorrect) can change behaviour.

## Traps

- **`--auto-correct` vs `--auto-correct-all`.** The latter (`-A`) includes unsafe corrections
  that can alter semantics. Never run it unattended, and never in CI.
- **`.rubocop_todo.yml` grows silently** if regenerated instead of shrunk. Regenerating it hides
  new violations — check it into review.
- **Version drift adds cops.** `NewCops: enable` plus an unpinned RuboCop means new failures on
  unrelated PRs. Pin the gem version.
- Schema and migration files change constantly and mechanically — exclude them.
