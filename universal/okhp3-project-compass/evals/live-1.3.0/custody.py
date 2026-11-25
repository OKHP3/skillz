"""Local protected-case custodian. Only the seal and aggregate result are public."""
import argparse
from contextlib import redirect_stdout
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import secrets
import tempfile

from executor import HERE, execute, parse_json, sha
import grade
import run
from transport import adapt_and_run

SEAL = HERE / "custody-seal.json"
RESULT = HERE / "custody-result.json"
AUTHOR = """You are the independent custodian of an unseen synthetic project-reassessment case.
Work entirely in this fresh session without tools, sources or prior cases. Create an original
realistic small project, one natural reassessment request and four discriminating binary checks
answerable solely from its files and request. Use synthetic, public-safe data, no real accounts,
no executables, no links, no external resources. Do not mention a skill or evaluation in the
request. Return only JSON with request (string), files (mapping plain relative paths to text),
expectations (four strings). Only the request and files will go to the matched executors."""
PRIVATE = Path(tempfile.gettempdir()) / "project-compass-1.3.0-private-custody"



def utc():
    return datetime.now(timezone.utc).isoformat()


def save_new(path, value):
    with path.open("x", encoding="utf-8") as stream:
        json.dump(value, stream, indent=2)
        stream.write("\n")


def read_json(path):
    return json.loads(path.read_bytes())


def seal():
    # The fresh author has no package, filesystem tools, previous cases or grading data.
    # Capture its output only in the local custodian process.
    PRIVATE.mkdir(mode=0o700, exist_ok=False)
    message, receipt = execute(AUTHOR)
    obj = parse_json(message)
    files, rubric = obj["files"], obj["expectations"]
    if (not isinstance(files, dict) or not files or not isinstance(obj["request"], str)
            or not isinstance(rubric, list) or len(rubric) != 4
            or not all(isinstance(x, str) and x.strip() for x in rubric)):
        raise ValueError("invalid custodian submission")
    for path, value in files.items():
        if (not path or Path(path).is_absolute() or ".." in Path(path).parts
                or "\\" in path or ".git" in Path(path).parts or not isinstance(value, str)):
            raise ValueError("invalid custodian fixture")
    case = dict(id="protected", request=obj["request"], files=files, mtimes={}, remote=None)
    for name, value in (("case", case), ("rubric", rubric), ("author-receipt", receipt)):
        save_new(PRIVATE / (name + ".json"), value)
    hashes = {k: sha((PRIVATE / (k + ".json")).read_bytes()) for k in ("case", "rubric", "author-receipt")}
    save_new(SEAL, {"sealed_at": utc(), "sha256": hashes, "commission_sha256": sha(AUTHOR.encode()),
                    "author_model": receipt["model_requested"], "author_tool_calls": receipt["activity"],
                    "rubric_items": 4, "owner_attestation": "Owner reports no prior case or key access.",
                    "custody": "Separate ephemeral author. Private custodian files outside the checkout. "
                               "Same OS account; no separate-account access audit."})


def evaluate():
    # Called only following the owner's explicit candidate pin.
    run.verify()
    pin = read_json(HERE / "candidate.json")
    if run.manifest() != pin["sha256"]:
        raise ValueError("candidate pin mismatch")
    seal_data = read_json(SEAL)
    for name, digest in seal_data["sha256"].items():
        if sha((PRIVATE / (name + ".json")).read_bytes()) != digest:
            raise ValueError("custody hash mismatch")
    case, rubric = read_json(PRIVATE / "case.json"), read_json(PRIVATE / "rubric.json")
    work = PRIVATE / "matched"
    work.mkdir(mode=0o700, exist_ok=False)
    # Retain all raw runs, grader packets, receipts, keys and temporary fixture paths privately.
    for name in ("candidate.json", "task-prompt.txt", "grader-prompt.txt"):
        (work / name).write_bytes((HERE / name).read_bytes())
    run.HERE, run.OUTPUT, grade.HERE = work, work / "submissions", work
    run.OUTPUT.mkdir()
    keys = {arm: secrets.token_hex(12) for arm in ("baseline", "candidate")}
    save_new(work / "key.json", keys)
    jobs = [(arm, case, code) for arm, code in keys.items()]
    adapt_and_run(jobs, workers=2)
    grade.expectations = lambda _: [{"id": "e%d" % i, "text": v} for i, v in enumerate(rubric, 1)]
    codes = list(keys.values())
    secrets.SystemRandom().shuffle(codes)
    for code in codes:
        grade.grade((code, case))
    scores, receipts = {}, {}
    for arm, code in keys.items():
        dest = run.OUTPUT / code
        grades = read_json(dest / "grade.json")
        scores[arm] = sum(r["pass"] for r in grades["grades"]) if grades["status"] == "graded" else None
        receipts[arm] = {n: sha((dest / (n + ".json")).read_bytes()) for n in ("evidence", "grade")}
    if run.manifest() != pin["sha256"]:
        raise ValueError("candidate changed during evaluation")
    save_new(RESULT, {"completed_at": utc(), "candidate_manifest_sha256": sha((HERE / "candidate.json").read_bytes()),
                      "seal_sha256": sha(SEAL.read_bytes()), "receipt_sha256": receipts,
                      "passed_of_four": scores, "method": "Matched fresh executors, fresh anonymous single-submission graders.",
                      "disposition": "Supplemental protected observation. The development uplift and critical floors govern release."})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("seal", "evaluate"))
    args = parser.parse_args()
    os.umask(0o077)
    try:
        if args.action == "seal":
            seal()
        else:
            with (PRIVATE / "evaluation.log").open("x") as log, redirect_stdout(log):
                evaluate()
    except Exception as exc:
        # Executor exceptions can contain raw replies. Keep details private.
        if PRIVATE.is_dir():
            with (PRIVATE / "errors.log").open("a") as f:
                f.write(utc() + " " + repr(exc) + "\n")
        raise SystemExit("Custody step incomplete (" + type(exc).__name__ + ")")
    print("Custody step completed.")
