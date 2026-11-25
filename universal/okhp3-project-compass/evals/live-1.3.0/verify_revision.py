"""Compare an immutable Git commit's entire runtime surface with a round pin."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

def verify(evidence_dir, ref):
    package=evidence_dir.parents[1]
    prefix="universal/okhp3-project-compass/"
    def git(*args):
        return subprocess.check_output(["git","-C",str(package),*args])
    commit=git("rev-parse","--verify",ref+"^{commit}").decode().strip()
    names=git("ls-tree","--full-tree","-rz","--name-only",commit).decode().split("\0")
    runtime={}
    for name in names:
        if not name.startswith(prefix):
            continue
        path=Path(name[len(prefix):])
        if path.as_posix()=="SKILL.md" or (path.parts[0] in ("assets","scripts","references") and
                                           path.suffix in (".md",".py",".json")):
            runtime[path.as_posix()]=hashlib.sha256(git("show",commit+":"+name)).hexdigest()
    pin=json.loads((evidence_dir/"candidate.json").read_text())["sha256"]
    mismatches=sorted(k for k in runtime.keys()|pin.keys() if runtime.get(k)!=pin.get(k))
    return {"commit":commit,"verified":not mismatches,"runtime_files":len(runtime),"mismatches":mismatches}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("round_directory",type=Path)
    p.add_argument("git_ref")
    args=p.parse_args()
    verdict=verify(args.round_directory.resolve(),args.git_ref)
    print(json.dumps(verdict))
    raise SystemExit(int(not verdict["verified"]))

