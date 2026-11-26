# Replaying the trial

Run from the package root on macOS with Python 3.9+, sandbox-exec, an authenticated Codex CLI, the recorded model available, and an empty /var/empty. The recorded run used the CLI version in author-receipt.json and each execution receipt. A fresh run consumes model usage. Source, model service, CLI runtime, and server defaults can drift. Exact model output is stochastic.

Compare the installed runtime bytes against candidate.json first. Retain the published fixture and original external-holdout disposition for replay. Generating another independent case or changing any criterion produces a different experiment. The primary records refuse to overwrite existing trials.

The following commands create a disposable replay beneath evals, copy the frozen input files, and run both arms with the same one-case-per-execution design. The scratch package contains no unrelated repository code. Run baseline and candidate in sequence as in the recorded experiment. Each arm parallelizes its six cases.

```sh
trial=evals/live-1.3.0
scratch=$(mktemp -d evals/compass-replay.XXXXXX)
suite="$scratch/evals/live-1.3.0"
mkdir -p "$suite"
cp -R SKILL.md scripts assets references "$scratch/"
cp evals/evals.json evals/benchmark.json "$scratch/evals/"
cp "$trial"/*.py "$trial"/*-prompt.txt "$trial"/PROTOCOL.md "$trial"/TRANSPORT-ADDENDUM.md "$suite/"
cp "$trial"/independent-case.json "$trial"/fixtures.json "$trial"/freeze.json "$trial"/candidate.json "$trial"/transport-freeze.json "$suite/"
(
  cd "$suite" || exit 1
  python3 -B transport.py baseline &&
  python3 -B transport.py baseline --grade &&
  python3 -B transport.py candidate &&
  python3 -B transport.py candidate --grade &&
  python3 -B probe.py &&
  python3 -B roadmap_probe.py roadmap-candidate.json &&
  python3 -B roadmap_discovery.py &&
  python3 -B summarize.py
)
```

The original pre-registration used `python3 -B author.py`, `python3 -B make_fixtures.py`, and `python3 -B run.py freeze` before baseline allocation. The later `python3 -B run.py pin` bound the stabilized candidate before treatment. Replay retains the original fixture selection, protocol and runtime pin. If the originals change, verification fails before scored execution. Timed processes, synthetic Git metadata, the local scheduler simulation and offline forge limit what the results establish. No host schedule or remote write is part of this procedure.

Each arm key maps case names to opaque submission directories. evidence.json contains the answer, all changed file bodies, deletions, the project tool log and executor receipt. Unchanged files come from fixtures.json. grade.json holds the first valid blind grade, cited evidence, exact input digest and grader receipt. Calling grade.packet_for with a submission ID and its fixture reconstructs the packet. summarize.py verifies every graded packet and grader prompt hash before computing the metrics.


The six preliminary control runs use baseline-key.json. matched-baseline-key.json and matched-candidate-key.json identify the scored cohort after the null-device correction in TRANSPORT-ADDENDUM.md. The independent custodian executes the sealed pair once against the pin; protected inputs and scoring keys are outside the public reproduction. Its aggregate receipt can be verified against the published seal and pin.
