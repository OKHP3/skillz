# Thread context extraction evaluation archive

This public repository directory preserves the July 21, 2026 fixture evaluation
of the 2.0.0 candidate against a pre-2.0.0 snapshot. The archived `without_skill`
label refers to that baseline snapshot. The runs used three checked-in fixtures,
one run per case and configuration, and a targeted rerun of the rapid case.
Retention labels such as `public-safe` and `needs-review` describe decisions
made in those fixture runs. The archive sits outside the installable package
and package-only Shield scan scope.

## Reading the records

- The [baseline rapid transcript](iteration-1/eval-2-scan-rapid/without_skill/transcript.md)
  preserves the original workspace path. Its output now lives in the
  [archived output](iteration-1/eval-2-scan-rapid/without_skill/outputs/standalone-thread-extract-continuity.md).
  Fixture references under `.agents/skills/` are repository-relative.
- The [rapid rerun transcript](iteration-2/eval-2-scan-rapid/with_skill/transcript.md)
  records 913 words. Its [grading record](iteration-2/eval-2-scan-rapid/with_skill/grading.json)
  and the [benchmark record](benchmarks/2026-07-21-hardening/benchmark.json)
  record 898. Counting the full
  [archived Markdown](iteration-2/eval-2-scan-rapid/with_skill/outputs/rapid-thread-extract-validation.md)
  with Python's Unicode regex `\b\w+(?:[-']\w+)*\b` gives 913.
  The exact original counting rules were not recorded. Both recorded counts
  fall within the run's 600 to 1,200 word target.
- The benchmark records 17,146 and 14,213 characters for the two balanced
  outputs. The archived Markdown files contain 17,128 and 14,192 characters,
  respectively, when decoded from UTF-8 with line endings preserved. The
  reason for these differences is undocumented.

The original transcripts, grading, benchmark data, and output bytes are
preserved. The pass totals summarize the recorded fixture assertions for
2.0.0, with the rapid rerun substituted for the original rapid candidate run.
