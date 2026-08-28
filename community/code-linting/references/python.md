# Python linting

## Tools

**Ruff** for both linting and formatting. It replaces flake8, isort, pyupgrade, pydocstyle, and
Black, runs in a fraction of the time, and one config covers everything. Use it unless the
project already has a working setup.

**mypy** or **pyright** for type checking — a separate concern from linting and worth having.

`pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
  "E", "F",      # pycodestyle errors, pyflakes — the baseline
  "I",           # import sorting
  "B",           # bugbear: real bug patterns
  "UP",          # pyupgrade: modern syntax for the target version
  "SIM",         # simplifiable constructs
  "RUF",         # ruff's own checks
]
ignore = [
  "E501",        # line length — the formatter owns this
]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]        # asserts are the point in tests
"__init__.py" = ["F401"]     # re-exports are intentional
```

Run: `ruff format .` then `ruff check --fix .`

## Rules worth the noise

`B006` mutable default argument and `B008` function call in default are genuine bug classes
that bite everyone once. `B902`/`RUF` async pitfalls matter if you use asyncio. `S` (bandit)
rules are worth enabling on anything handling untrusted input, though expect to tune them.

## Rules to skip

`D` (docstring style) generates enormous noise for little benefit unless you publish API docs.
`ANN` (type annotation completeness) belongs to mypy's strictness settings, not the linter.
`C901` complexity ceilings encode taste and produce suppression comments.

## Type checking adoption

Do not turn on `strict` over an existing codebase. Start permissive, then tighten per-module:

```toml
[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
warn_redundant_casts = true

[[tool.mypy.overrides]]
module = "myapp.core.*"
disallow_untyped_defs = true    # strict where it matters, first
```

## Traps

- **Ruff's rule set changes between versions.** Pin the version, or a routine upgrade turns an
  unrelated PR red.
- **`# type: ignore` without a code** silences everything on that line forever. Require
  `# type: ignore[specific-error]`.
- Virtualenv and `.venv` directories must be excluded, or the linter checks your dependencies.
