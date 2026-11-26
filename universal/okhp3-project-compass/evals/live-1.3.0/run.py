import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import tempfile
from executor import HERE, execute, sha, write_json

PACKAGE=HERE.parents[1]
OUTPUT=HERE / "submissions"

def manifest():
    paths=[PACKAGE/"SKILL.md"]
    for d in ("assets","references","scripts"):
        paths.extend(p for p in (PACKAGE/d).rglob("*") if p.is_file() and p.suffix in {".py",".md",".json"})
    return {p.relative_to(PACKAGE).as_posix():sha(p.read_bytes()) for p in sorted(paths)}

def verify():
    for name, digest in json.loads((HERE/"freeze.json").read_text())["sha256"].items():
        assert sha((HERE/name).read_bytes())==digest, f"Frozen source changed: {name}"

def read_tree(base):
    return {p.relative_to(base).as_posix():p.read_text() for p in sorted(base.rglob("*")) if p.is_file()}

def write_inputs(base, fixture):
    for name, body in fixture["files"].items():
        p=base/name
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(body)
        date=fixture["mtimes"].get(name,"2026-11-22")
        when=datetime.strptime(date,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp()
        os.utime(p,(when,when))
    if (base/".git/config").exists():
        (base/".git/HEAD").write_text("ref: refs/heads/main\n")
        for d in ("objects","refs/heads"):
            (base/".git"/d).mkdir(parents=True,exist_ok=True)

def run_one(job):
    arm, f, code=job
    dest=OUTPUT/code
    dest.mkdir(parents=True,exist_ok=False)
    with tempfile.TemporaryDirectory(dir=HERE,prefix=".run-") as work:
        tmp=Path(work).resolve()
        base=tmp/"project"
        pkg=tmp/"package"
        base.mkdir()
        pkg.mkdir()
        write_inputs(base,f)
        initial=read_tree(base)
        if f["remote"] is not None:
            write_json(tmp/"remote.json", f["remote"])
        meta={"as_of":"2026-11-24 or the scenario's stated dates","file_dates":f["mtimes"],
              "default_file_date":"2026-11-22","hosted_snapshot":f["remote"] is not None}
        prompt=(HERE/"task-prompt.txt").read_text().replace("{metadata}",json.dumps(meta)).replace("{request}",f["request"])
        if arm=="candidate":
            pin=json.loads((HERE/"candidate.json").read_text())["sha256"]
            for name,digest in pin.items():
                data=(PACKAGE/name).read_bytes()
                assert sha(data)==digest, f"Candidate changed: {name}"
                path=pkg/name
                path.parent.mkdir(parents=True,exist_ok=True)
                path.write_bytes(data)
            prompt+="\n\nInstalled project skill\n"+(pkg/"SKILL.md").read_text()
        answer=""
        attempts=[]
        for i in range(2):
            log=tmp/f"calls-{i}"
            try:
                answer, receipt=execute(prompt,server=list(map(str,[base,pkg,log])),timeout=360)
                if not log.exists():
                    raise RuntimeError("no fixture contact")
                attempts.append(dict(status="completed",**receipt))
                break
            except (subprocess.TimeoutExpired,RuntimeError) as e:
                partial=log.exists()
                attempts.append(dict(status="incomplete",reason="timeout" if isinstance(e,subprocess.TimeoutExpired)
                                     else "transport or unexpected tool event",fixture_activity=partial))
                if partial or i==1:
                    break
        calls=[]
        for log in sorted(tmp.glob("calls-*")):
            calls.extend(json.loads(line) for line in log.read_text().splitlines())
        final=read_tree(base)
        delta={k:v for k,v in final.items() if initial.get(k)!=v}
        report={"answer":answer,"files_changed":delta,"files_removed":sorted(initial.keys()-final.keys()),
                "calls":calls,"attempts":attempts}
        public=json.dumps(report,indent=2,ensure_ascii=False).replace(str(base),".").replace(str(pkg),"package").replace(str(tmp),"fixture")
        (dest/"evidence.json").write_text(public+"\n")
        print(code,attempts[-1]["status"],len(calls),len(delta),flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("action",choices=["freeze","pin","baseline","candidate"])
    a=p.parse_args().action
    if a=="freeze":
        assert not (HERE/"freeze.json").exists()
        files=["../evals.json","../benchmark.json","independent-case.json","author-prompt.txt","author.py",
               "PROTOCOL.md","fixtures.json","make_fixtures.py","executor.py","fixture_tool.py","task-prompt.txt",
               "grader-prompt.txt","grade.py","run.py"]
        write_json(HERE/"freeze.json",{"utc":datetime.now(timezone.utc).isoformat(),"sha256":{p:sha((HERE/p).read_bytes()) for p in files}})
        return
    verify()
    if a=="pin":
        assert not (HERE/"candidate.json").exists() and 'version: "1.3.0"' in (PACKAGE/"SKILL.md").read_text()
        write_json(HERE/"candidate.json",{"version":"1.3.0","utc":datetime.now(timezone.utc).isoformat(),"sha256":manifest()})
        return
    fixtures=json.loads((HERE/"fixtures.json").read_text())
    if a=="candidate":
        assert manifest()==json.loads((HERE/"candidate.json").read_text())["sha256"]
    table=HERE/(a+"-key.json")
    if table.exists():
        raise SystemExit("Arm already allocated; preserve first runs")
    codes={f["id"]:secrets.token_hex(5) for f in fixtures}
    write_json(table,codes)
    jobs=[(a,f,codes[f["id"]]) for f in fixtures]
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(run_one,jobs))

if __name__=="__main__":
    main()

