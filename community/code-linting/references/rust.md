# Rust linting

## Tools

Both ship with the toolchain. There is no third-party decision to make.

- **`rustfmt`** — formatting. `cargo fmt`
- **`clippy`** — linting. `cargo clippy --all-targets --all-features -- -D warnings`

## Configuration

Prefer configuring in `Cargo.toml` (Rust 1.74+) over scattered crate-level attributes:

```toml
[lints.rust]
unsafe_code = "forbid"          # or "deny" if you have justified uses
unused_must_use = "deny"

[lints.clippy]
all = "deny"
pedantic = "warn"               # useful, noisy — warn, don't deny
unwrap_used = "warn"            # in library code
expect_used = "allow"           # expect with a message is fine
```

`rustfmt.toml`:

```toml
edition = "2021"
max_width = 100
```

Keep rustfmt configuration minimal — most options are unstable and require nightly, and
divergence from the default costs more than it gains.

## Which clippy groups to use

- **`correctness`** — on by default, deny these. They are bugs, not style.
- **`suspicious`** and **`complexity`** — default warn, worth keeping.
- **`pedantic`** — genuinely useful lints mixed with taste. Set to `warn`, not `deny`, and
  allow the ones you disagree with individually.
- **`nursery`** — unstable, false positives. Skip in CI.
- **`cargo`** — checks manifest hygiene. Cheap, worth enabling on published crates.

## High-value specifics

`clippy::unwrap_used` in library code forces you to surface errors rather than panicking in
someone else's process. Allow it in tests and binaries where a panic is an acceptable exit.

`unused_must_use` on `Result` is the Rust equivalent of Go's errcheck, and it is on by default —
do not turn it off.

## Traps

- **`-D warnings` in CI plus a toolchain upgrade** equals a red build on an unrelated PR, since
  new clippy versions add lints. Pin the toolchain in `rust-toolchain.toml`.
- **`#[allow(...)]` at module or crate level** silences far more than intended. Put allows on
  the smallest possible item and add a reason.
- **`--all-features` can fail to compile** if features are mutually exclusive. Lint the feature
  combinations you actually ship.
- Macro-generated code produces clippy warnings you cannot fix. `#[allow]` inside the macro
  definition, not at the call site.
