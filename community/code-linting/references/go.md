# Go linting

## Tools

Go's toolchain covers most of this already. Add as little as possible.

- **`gofmt`** / **`gofumpt`** — formatting. Not configurable, deliberately. Never discuss it.
- **`go vet`** — ships with Go, catches real bugs, run it always.
- **`golangci-lint`** — runs many linters in one pass with caching. The standard aggregator.

`.golangci.yml`:

```yaml
run:
  timeout: 3m

linters:
  enable:
    - errcheck        # unchecked errors — the single most valuable Go linter
    - govet
    - staticcheck     # deep correctness analysis
    - ineffassign     # assignments never used
    - unused
    - bodyclose       # unclosed HTTP response bodies
    - rowserrcheck    # unchecked sql.Rows.Err
    - nilerr          # returning nil when err is non-nil

linters-settings:
  errcheck:
    check-type-assertions: true

issues:
  exclude-rules:
    - path: _test\.go
      linters: [errcheck]
```

## Why errcheck matters most

Go's error handling is entirely convention — nothing forces you to check a returned error. An
ignored error is the most common serious defect in Go code, and `errcheck` is the only thing
standing between you and a silently failed write. Enable `check-type-assertions` too; an
unchecked `x.(T)` panics.

`bodyclose` and `rowserrcheck` catch resource leaks that only show up under load, which is the
worst time to find them.

## Rules to skip

`lll` (line length), `funlen`, `gocyclo`, `gocognit` — all taste, all generate `//nolint`
comments. `godox` (flagging TODO) turns a useful marker into noise.

`gochecknoglobals` and `gochecknoinits` are defensible in a library, hostile in an application.

## Formatting choice

`gofumpt` is `gofmt` plus a few more opinions. Either is fine; pick one and enforce it in CI.
Do not let both run.

## Traps

- **`//nolint` without a linter name** disables everything on the line. Require
  `//nolint:errcheck // reason` and enable `nolintlint` to enforce it.
- **Generated code** must be excluded, or `staticcheck` will report on protobuf output forever.
  Files with the standard `// Code generated ... DO NOT EDIT.` header are skipped
  automatically — make sure your generator emits it.
- **golangci-lint version drift** changes which issues appear. Pin it in CI and in the
  developer setup, or people see different results locally than in the pipeline.
- Build tags hide code from the linter. Anything behind `//go:build integration` is unchecked
  unless you lint with that tag too.
