"""Check commit-contained selftest, then a separately hashed workspace unit suite."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from executor import HERE,sha,write_json
from from_git import CHECKOUT,COMMIT,PREFIX,export,git

out=HERE/"mechanical.json"
if out.exists():
    raise SystemExit("Recorded tests already exist")
result={"commit":COMMIT,"git_tests":git("ls-tree","--full-tree","-rz","--name-only",COMMIT,"--",PREFIX+"tests/").decode().split("\0")[:-1]}
with tempfile.TemporaryDirectory(dir=HERE,prefix=".mechanical-") as work:
    root=Path(work).resolve()
    pkg=root/"package"
    pkg.mkdir()
    export(pkg)
    snapshot={p.relative_to(pkg).as_posix():sha(p.read_bytes()) for p in pkg.rglob("*") if p.is_file()}
    assert snapshot==json.loads((HERE/"candidate.json").read_text())["sha256"]
    tmp=root/"tmp"
    tmp.mkdir()
    env={"PATH":"/usr/bin:/bin","HOME":"/var/empty","GIT_CONFIG_NOSYSTEM":"1","GIT_CONFIG_GLOBAL":"/dev/null",
         "GIT_CEILING_DIRECTORIES":str(root),"PYTHONDONTWRITEBYTECODE":"1","TMPDIR":str(tmp),"LC_ALL":"C"}
    sb='(version 1)(allow default)(deny network*)(deny file-write*)(allow file-write* (literal "/dev/null"))(allow file-write* (subpath '+json.dumps(str(root))+'))'
    def check(name,args):
        proc=subprocess.run(["/usr/bin/sandbox-exec","-p",sb,sys.executable,"-B",*args],cwd=pkg,env=env,
                            text=True,capture_output=True,timeout=180)
        log=(proc.stdout+"\n"+proc.stderr).replace(str(pkg),"package").replace(str(tmp),"fixture-tmp").replace(str(root),"scratch")
        result[name]={"args":["python3","-B",*args],"exit":proc.returncode,"log":log.strip()}
    check("commit_selftest",["scripts/selftest.py"])
    tests=CHECKOUT/"tests"
    hashes={}
    for path in sorted(tests.glob("*.py")):
        data=path.read_bytes()
        dest=pkg/"tests"/path.name
        dest.parent.mkdir(exist_ok=True)
        dest.write_bytes(data)
        hashes["tests/"+path.name]=sha(data)
    result["actual_test_file_sha256"]=hashes
    if hashes:
        check("actual_workspace_suite",["-m","unittest","discover","-v","-s","tests"])
write_json(out,result)
print("commit tests",len(result["git_tests"]),"selftest",result["commit_selftest"]["exit"],
      "workspace suite",result.get("actual_workspace_suite",{}).get("exit"))
