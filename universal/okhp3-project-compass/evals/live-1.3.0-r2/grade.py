import argparse
import json
import random
import subprocess
from concurrent.futures import ThreadPoolExecutor
from executor import HERE, execute, parse_json, sha, write_json
from run import verify

def expectations(case_id):
    if case_id=="independent-transfer":
        return [{"id":f"e{i+1}","text":s} for i,s in enumerate(json.loads(
            (HERE/"independent-case.json").read_text())["expectations"])]
    return next(c["expectations"] for c in json.loads((HERE.parent/"evals.json").read_text())["evals"] if c["id"]==case_id)

def packet_for(code, case):
    record=json.loads((HERE/"submissions"/code/"evidence.json").read_text())
    relevant=[]
    for c in record["calls"]:
        args=c["arguments"]
        if c["tool"]=="external_action":
            relevant.append({"simulated_external_request":args})
        if c["tool"]=="inspect" and args.get("surface")=="forge":
            relevant.append({"read_hosted_fixture":True})
        if c["tool"]=="run_helper" and args.get("script")=="github_sync.py":
            relevant.append({"offline_sync_argv":args["argv"],"result":c.get("result")})
    return {"submission":code,"request":case["request"],"starting_files":case["files"],
            "fixture_dates":case["mtimes"],"hosted_snapshot":case["remote"],"expectations":expectations(case["id"]),
            "reply":record["answer"],"persisted_edits":record["files_changed"],"removed":record["files_removed"],
            "hosted_and_scheduling_activity":relevant}

def grade(job):
    code,case=job
    dest=HERE/"submissions"/code
    if (dest/"grade.json").exists():
        return
    record=json.loads((dest/"evidence.json").read_text())
    if not record["calls"]:
        write_json(dest/"grade.json",{"status":"unavailable","grades":[]})
        return
    payload=packet_for(code,case)
    prompt=(HERE/"grader-prompt.txt").read_text()+"\n"+json.dumps(payload,ensure_ascii=False)
    attempts=[]
    for _ in range(2):
        try:
            raw,receipt=execute(prompt,timeout=150)
            result=parse_json(raw)
            rows=result["grades"]
            assert [r["id"] for r in rows]==["e1","e2","e3","e4"]
            assert all(type(r["pass"]) is bool and r["evidence"].strip() for r in rows)
            write_json(dest/"grade.json",{"status":"graded","grades":rows,"receipt":receipt,"earlier_attempts":attempts,
                                         "packet_sha256":sha(json.dumps(payload,ensure_ascii=False).encode())})
            print(code,sum(r["pass"] for r in rows),flush=True)
            return
        except (ValueError,AssertionError,KeyError,RuntimeError,subprocess.TimeoutExpired):
            attempts.append("unusable grader return")
    write_json(dest/"grade.json",{"status":"unavailable","grades":[],"attempts":attempts})

def main():
    verify()
    p=argparse.ArgumentParser()
    p.add_argument("arm",choices=["both","baseline","candidate"],nargs="?",default="both")
    arm=p.parse_args().arm
    fixtures=json.loads((HERE/"fixtures.json").read_text())
    jobs=[]
    for k in (["baseline","candidate"] if arm=="both" else [arm]):
        key=json.loads((HERE/(k+"-key.json")).read_text())
        jobs.extend((key[f["id"]],f) for f in fixtures)
    random.SystemRandom().shuffle(jobs)
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(grade,jobs))

if __name__=="__main__":
    main()

