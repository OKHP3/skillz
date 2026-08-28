# Shell linting

Shell is where linting matters most per line of code. The language silently does the wrong
thing in a dozen common situations, and **ShellCheck catches nearly all of them**. There is no
argument to have here — install it.

## Tools

- **ShellCheck** — linting. Non-negotiable for any script that outlives the session.
- **shfmt** — formatting.

```bash
shellcheck -x -S style script.sh     # -x follows sourced files
shfmt -i 2 -ci -w script.sh          # 2-space indent, indent switch cases
```

`.shellcheckrc`:

```
external-sources=true
disable=SC2312    # only if you deliberately ignore pipeline exit codes
```

## The bugs it catches that you will otherwise ship

- **SC2086 — unquoted variable.** Word splitting and glob expansion. This one rule prevents more
  shell bugs than everything else combined. `rm -rf $DIR` with an empty or space-containing
  `DIR` is how directories disappear.
- **SC2164 — unchecked `cd`.** If `cd` fails, the rest of the script runs in the wrong
  directory. Use `cd foo || exit`.
- **SC2181 — checking `$?` indirectly** instead of testing the command.
- **SC2155 — `local x=$(cmd)`** masks the command's exit status, since `local` returns success.
- **SC2115 — `rm -rf "$X/"`** where `X` may be empty.

## Script preamble

Every script:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `-e` exit on error, `-u` error on unset variable, `-o pipefail` catch failures mid-pipeline
- Know the limits: `-e` does not trigger inside `if` conditions, `&&` chains, or functions
  called in a condition. It is a safety net, not a guarantee.

Declare the shell honestly. If you use bash features, the shebang must say `bash`, not `sh` —
ShellCheck checks against the declared shell and will pass code that breaks under dash.

## Suppressions

Inline, scoped to the next line, with a reason:

```bash
# shellcheck disable=SC2016  # single quotes intentional, awk needs the literal $1
awk '{print $1}' file
```

A bare `# shellcheck disable=all` in a file means the file is unchecked. Never do it.

## Traps

- **`SC1091` "not following sourced file"** is informational, not a bug. Use `-x` or set
  `external-sources=true` rather than disabling it.
- **CI runs a different ShellCheck version** than developers, producing surprise failures. Pin
  it, or run it in a container.
- **`.bashrc`-style files** legitimately trip many rules. Exclude them rather than suppressing
  rules globally.
- ShellCheck cannot see runtime values. It will flag things that are safe in your specific case
  — those are the ones to suppress with a reason, not to disable globally.
