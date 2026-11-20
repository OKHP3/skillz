# Historical Benchmark Summary

Evaluated: 2026-07-21

The 2.0.0 candidate was evaluated against a pre-2.0.0 snapshot on three
fixtures: balanced rich-element extraction, rapid continuity, and comprehensive
adversarial export handling. Each case had four assertions and ran once per
configuration. Only the rapid case was rerun after the compactness fix.

| Configuration | Passed | Total | Pass rate |
|---|---:|---:|---:|
| Pre-2.0.0 baseline | 8 | 12 | 66.7% |
| 2.0.0 initial candidate | 11 | 12 | 91.7% |
| 2.0.0 with the rapid rerun substituted | 12 | 12 | 100% |

The initial candidate's only failed assertion concerned rapid-mode compactness.
The rapid output went from 15,277 to 7,917 bytes. The rerun passed that
assertion and retained the other three passes. The transcript and grading
record report different word counts, both within the 600 to 1,200 word target.

The selected 2.0.0 outputs scored 33.3 percentage points higher than the
baseline on these fixtures. The results apply to these historical runs.

The [public archive and evidence notes](../../../docs/archive/eval-workspaces/okhp3-thread-context-extraction-2026-07-21/README.md)
contain the detailed outputs, grading records, and measurement caveats. The
archive sits outside the installable package.
