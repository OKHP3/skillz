"""Record whether scanner emits usable source pointers for unchecked Markdown."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from executor import HERE, sha, write_json
from run import PACKAGE

ROADMAP="# Roadmap\n\n## Queue\n\n- [ ] Catalog the violet samples\n- [x] Finish the index\n"
def objects(node):
    if isinstance(node,dict):
        yield node
        for value in node.values():
            yield from objects(value)
    elif isinstance(node,list):
        for value in node:
            yield from objects(value)

def probe():
    with tempfile.TemporaryDirectory(dir=HERE,prefix=".roadmap-") as work:
        root=Path(work).resolve()/"project"
        (root/"docs").mkdir(parents=True)
        source=root/"docs/ROADMAP.md"
        source.write_text(ROADMAP)
        script=PACKAGE/"scripts/scan_repo.py"
        env={"PATH":"/usr/bin:/bin","HOME":"/var/empty","GIT_CONFIG_NOSYSTEM":"1",
             "GIT_CONFIG_GLOBAL":"/dev/null","GIT_CEILING_DIRECTORIES":str(root.parent),
             "PYTHONDONTWRITEBYTECODE":"1","LC_ALL":"C"}
        sb='(version 1)(allow default)(deny network*)(deny file-write*)'
        p=subprocess.run(["/usr/bin/sandbox-exec","-p",sb,sys.executable,"-B",str(script),"--root","."],
                         cwd=root,env=env,text=True,capture_output=True,timeout=30)
        observation=json.loads(p.stdout) if p.returncode==0 else {"error":p.stderr.replace(str(root),".")}
        pointers=[x for x in objects(observation) if x.get("path")=="docs/ROADMAP.md" and x.get("line")==5]
        return {"script_sha256":sha(script.read_bytes()),"fixture":{"docs/ROADMAP.md":ROADMAP},
                "argv":["scan_repo.py","--root","."],"exit":p.returncode,"unchecked_row_listed":bool(pointers),
                "source_row":source.read_text().splitlines()[4],"matching_pointers":pointers,"output":observation}

if __name__=="__main__":
    name=sys.argv[1]
    if name not in ("roadmap-before-freeze.json","roadmap-candidate.json") or (HERE/name).exists():
        raise SystemExit("Choose a new named evidence file")
    result=probe()
    write_json(HERE/name,result)
    print("unchecked_row_listed",result["unchecked_row_listed"],"scanner",result["script_sha256"][:12])

