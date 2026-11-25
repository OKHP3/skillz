"""Read-only pre-publication proof for both Compass trial rounds."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT=Path(__file__).resolve().parent
def load(p):
    return json.loads(p.read_text())
def digest(data):
    return hashlib.sha256(data).hexdigest()
def file_sha(p):
    return digest(p.read_bytes())
rounds=[ROOT/"live-1.3.0",ROOT/"live-1.3.0-r2"]
record=load(ROOT/"benchmark.json")
meta=record["metadata"]
assert meta["evaluation_status"]=="live" and meta["evaluated_skill_version"]=="1.3.0"
assert meta["review_decision"]=="defer-for-evidence" and meta["timestamp"] and meta["runner"] and len(meta["blockers"])==3
assert len(record["runs"])==14 and all(r["graded"] for r in record["runs"])
assert record["acceptance_criteria"]==load(rounds[0]/"original-inputs/benchmark.json")["acceptance_criteria"]
details=[]
for i,base in enumerate(rounds):
    rev=load(base/"revision.json")
    verify=subprocess.check_output([sys.executable,"-B",str(rounds[0]/"verify_revision.py"),str(base),rev["commit"]],text=True)
    git_result=json.loads(verify)
    assert git_result["verified"] and git_result["runtime_files"]==23
    assert rev["pin_sha256"]==file_sha(base/"candidate.json")
    for name,want in load(base/"freeze.json")["sha256"].items():
        assert file_sha(base/name)==want,name
    for name,want in load(base/"transport-freeze.json")["sha256"].items():
        assert file_sha(base/name)==want,name
    inputs=load(base/"original-inputs/freeze.json")["sha256"]
    for src in ("evals.json","benchmark.json"):
        assert file_sha(base/"original-inputs"/src)==inputs["../"+src]
    b=load(ROOT/("benchmark-1.3.0-r2.json" if i else "benchmark-1.3.0.json"))
    assert b["candidate_manifest_sha256"]==rev["pin_sha256"]
    cases=load(base/"fixtures.json")
    checks=0
    for f,row in zip(cases,b["runs"]):
        assert f["id"]==row["case"]
        for arm in ("baseline","candidate"):
            code=load(base/("matched-"+arm+"-key.json"))[f["id"]]
            p=base/"submissions"/code
            e,g=load(p/"evidence.json"),load(p/"grade.json")
            assert len(e["attempts"])==1 and e["attempts"][0]["status"]=="completed"
            assert g["status"]=="graded" and len(g["grades"])==4 and not g["receipt"]["activity"]
            assert sum(q["pass"] for q in g["grades"])==row["arms"][arm]["passed"]
            md={"as_of":"2026-11-24 or the scenario's stated dates","file_dates":f["mtimes"],
                "default_file_date":"2026-11-22","hosted_snapshot":f["remote"] is not None}
            prompt=(base/"task-prompt.txt").read_text().replace("{metadata}",json.dumps(md)).replace("{request}",f["request"])
            if arm=="candidate":
                skill=subprocess.check_output(["git","-C",str(ROOT),"show",rev["commit"]+":universal/okhp3-project-compass/SKILL.md"]).decode()
                prompt+="\n\nInstalled project skill\n"+skill
            assert digest(prompt.encode())==e["attempts"][0]["prompt_sha256"]
            checks+=4
    # The aggregation routine also checks each original grader packet and prompt digest.
    subprocess.run([sys.executable,"-B","-c","from summarize import summarize; summarize()"],cwd=base,check=True)
    c=load(base/"custody-result.json")
    assert c["candidate_manifest_sha256"]==rev["pin_sha256"] and c["seal_sha256"]==file_sha(base/"custody-seal.json")
    assert c["passed_of_four"]=={"baseline":4,"candidate":4}
    assert len(load(base/"probe-results.json")["checks"])==16 and all(load(base/"probe-results.json")["checks"].values())
    details.append({"commit":rev["commit"],"runtime_files":23,"verified_public_grade_cells":checks,
                    "verified_executor_prompts":12,"verified_grader_packets":12,"custody_aggregate_bound":True})
seal1,seal2=[load(base/"custody-seal.json")["sha256"] for base in rounds]
assert seal1["case"]!=seal2["case"] and seal1["rubric"]!=seal2["rubric"]
for code,files in load(rounds[1]/"control-reuse.json")["sha256"].items():
    for name,want in files.items():
        assert file_sha(rounds[0]/"submissions"/code/name)==file_sha(rounds[1]/"submissions"/code/name)==want
# The historical root benchmark was promoted to the final release record. Its original bytes are archived.
for name,want in load(rounds[0]/"evidence-inventory.json")["sha256"].items():
    p=rounds[0]/name if name!="../benchmark.json" else rounds[0]/"original-inputs/benchmark.json"
    assert file_sha(p)==want,name
mech=load(rounds[1]/"mechanical.json")
assert mech["commit"]==details[1]["commit"] and not mech["git_tests"]
assert mech["commit_selftest"]["exit"]==0 and "41/41 assertions passed" in mech["commit_selftest"]["log"]
assert mech["actual_workspace_suite"]["exit"]==0 and "Ran 57 tests" in mech["actual_workspace_suite"]["log"]
for base in rounds:
    assert not list(base.glob(".run-*")) and not list(base.glob(".git-runtime-*"))
files=[p for base in rounds for p in base.rglob("*") if p.is_file() and "__pycache__" not in p.parts]
files.extend(ROOT/n for n in ["benchmark.json","benchmark-1.3.0.json","benchmark-1.3.0-r2.json","README.md","verify_trials.py","evals.json"])
hashes={}
dash_counts={}
for p in sorted(files):
    rel=p.relative_to(ROOT).as_posix()
    body=p.read_text()
    if p.suffix==".json":
        json.loads(body)
    if p.suffix==".md":
        for link in re.findall(r"\]\(([^)]+)\)",body):
            if "://" not in link and not link.startswith("#"):
                assert (p.parent/link.split("#")[0]).exists(),(rel,link)
    forbidden=[str(ROOT.parents[2]), "/"+ "Users/", "/"+ "Volumes/", "/"+ "private/tmp/", "/"+ "var/folders/"]
    assert not any(term in body for term in forbidden),rel
    hashes[rel]=file_sha(p)
    n=body.count(chr(0x2014))
    if n:
        assert p.suffix==".json",rel
        dash_counts[rel]=n
print(json.dumps({"status":"PASS","scope":"Original raw-byte evidence before owner publication escaping",
    "rounds":details,"public_sha256":hashes,"json_literal_em_dash_counts":dash_counts,
    "evidence_scope":"No protected case, rubric, key, raw output or detailed private grades opened by this proof.",
    "historical_path_resolution":"First-round legacy benchmark.json digest resolves to live-1.3.0/original-inputs/benchmark.json."},indent=2))
