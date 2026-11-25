"""Run one trial stage against runtime bytes extracted only from the nominated commit."""
import argparse
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys
import tempfile
import run
from executor import HERE,sha,write_json

COMMIT="19e28db9ae91491ff1e98881cbe7c570e2cb74d1"
PREFIX="universal/okhp3-project-compass/"
CHECKOUT=run.PACKAGE

def git(*args):
    return subprocess.check_output(["git","-C",str(CHECKOUT),*args])

def export(target):
    names=git("ls-tree","--full-tree","-rz","--name-only",COMMIT).decode().split("\0")
    for name in names:
        if not name.startswith(PREFIX):
            continue
        rel=Path(name[len(PREFIX):])
        if rel.as_posix()=="SKILL.md" or (rel.parts[0] in ("assets","references","scripts")
                                          and rel.suffix in (".py",".json",".md")):
            path=target/rel
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(git("show",COMMIT+":"+name))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("stage",choices=["pin","candidate","grade","sealed","probe","scanner","discovery","summary"])
    stage=p.parse_args().stage
    with tempfile.TemporaryDirectory(prefix=".git-runtime-",dir=HERE) as temp:
        target=Path(temp)
        export(target)
        run.PACKAGE=target
        if stage=="pin":
            sys.argv=["run.py","pin"]
            run.main()
            write_json(HERE/"revision.json",{"round":2,"commit":COMMIT,"package":PREFIX.rstrip("/"),
                "runtime_files_verified":len(run.manifest()),"pin_sha256":sha((HERE/"candidate.json").read_bytes()),
                "acquisition":"Git objects for every stage; mutable worktree and test files excluded."})
            return
        assert run.manifest()==json.loads((HERE/"candidate.json").read_text())["sha256"]
        stages={"candidate":("transport.py",["candidate"]),"grade":("transport.py",["candidate","--grade"]),
                "sealed":("custody.py",["evaluate"]),"probe":("probe.py",[]),
                "scanner":("roadmap_probe.py",["roadmap-candidate.json"]),"discovery":("roadmap_discovery.py",[]),
                "summary":("summarize.py",[])}
        if stage in ("grade","summary"):
            import grade
            design=json.loads((HERE/"original-inputs/evals.json").read_text())
            criteria={case["id"]:case["expectations"] for case in design["evals"]}
            criteria["independent-transfer"]=grade.expectations("independent-transfer")
            grade.expectations=criteria.__getitem__
        script,args=stages[stage]
        sys.argv=[script,*args]
        runpy.run_path(str(HERE/script),run_name="__main__")

if __name__=="__main__":
    main()
