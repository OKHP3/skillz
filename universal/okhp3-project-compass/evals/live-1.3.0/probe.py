"""Offline black-box checks for manual command rendering and review findings."""
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
from executor import HERE, write_json
from run import PACKAGE, manifest, write_inputs

REPO="example-fixtures/widget-forge"
TITLE="Alder's labels & spacing"
FAKE_GH="""#!/usr/bin/python3
import json, os, sys
from pathlib import Path
args=sys.argv[1:]
with open(os.environ["PROBE_LOG"],"a") as f:
    f.write(json.dumps(args)+"\\n")
if args[:1]!=["api"] or "--method" not in args or args[args.index("--method")+1]!="GET":
    sys.exit(90)
d=json.loads(Path(os.environ["PROBE_REMOTE"]).read_text())
resource=args[-1].split("?")[0]
if resource=="repos/"+d["owner_repo"]:
    print(json.dumps({"full_name":d["owner_repo"]}))
elif resource in ["repos/"+d["owner_repo"]+"/"+b for b in ("issues","milestones")]:
    print(json.dumps([d[resource.rsplit("/",1)[-1]]]))
else:
    sys.exit(91)
"""

def data(result):
    try:
        return json.loads(result["stdout"])
    except ValueError:
        return {}

def nested(doc):
    if isinstance(doc,dict):
        yield doc
        for value in doc.values():
            yield from nested(value)
    elif isinstance(doc,list):
        for v in doc:
            yield from nested(v)

def all_commands(doc):
    found=[]
    for row in nested(doc):
        for arr in row.values():
            if isinstance(arr,list) and arr[:1]==["gh"] and all(isinstance(v,str) for v in arr):
                texts=[v for v in row.values() if isinstance(v,str) and v.startswith("gh ")]
                found.append((arr,texts))
    return found

def probe(*, require_pin=True):
    if require_pin:
        assert manifest()==json.loads((HERE/"candidate.json").read_text())["sha256"], "candidate drift"
    fixture=json.loads((HERE/"fixtures.json").read_text())[4]
    checks={}
    outputs={}
    with tempfile.TemporaryDirectory(dir=HERE,prefix=".probe-") as work:
        home=Path(work).resolve()
        root=home/"project"
        root.mkdir()
        write_inputs(root,fixture)
        cdir=root/".compass"
        config=json.loads((cdir/"config.json").read_text())
        config["schema"]="okhp3.compass.state/1"
        write_json(cdir/"config.json",config)
        state=json.loads((cdir/"objectives.json").read_text())
        state["tasks"][0]["title"]=TITLE
        state["tasks"][0]["renamed_from"]="Read dimensions"
        create_id=state["tasks"][0]["id"]
        write_json(cdir/"objectives.json",state)
        remote=dict(fixture["remote"],owner_repo=REPO,complete=True)
        bindir=home/"bin"
        bindir.mkdir()
        gh=bindir/"gh"
        gh.write_text(FAKE_GH)
        gh.chmod(0o755)
        snap=home/"remote.json"
        write_json(snap,remote)
        log=home/"requested-gh.jsonl"
        log.touch()
        env={"PATH":str(bindir)+":/usr/bin:/bin","HOME":"/var/empty","GIT_CONFIG_NOSYSTEM":"1",
             "GIT_CONFIG_GLOBAL":"/dev/null","GIT_CEILING_DIRECTORIES":str(home),
             "PYTHONDONTWRITEBYTECODE":"1","PROBE_LOG":str(log),"PROBE_REMOTE":str(snap),"LC_ALL":"C"}
        sb='(version 1)(allow default)(deny network*)(deny file-write*)(allow file-write* (literal "/dev/null"))(allow file-write* (subpath '+json.dumps(str(home))+'))'
        def run(key,script,args,omit_git=False):
            e=dict(env)
            if omit_git:
                e["PATH"]=str(bindir)
            cmd=["/usr/bin/sandbox-exec","-p",sb,sys.executable,"-B",str(PACKAGE/"scripts"/script),*args]
            p=subprocess.run(cmd,cwd=root,env=e,text=True,capture_output=True,timeout=40)
            def norm(s):
                return s.replace(str(root),".").replace(str(home),"fixture").replace(str(PACKAGE),"package")
            out={"argv":[script,*args],"exit":p.returncode,"stdout":norm(p.stdout),"stderr":norm(p.stderr)}
            outputs[key]=out
            return data(out)
        def snapshot():
            return {str(p.relative_to(root)):p.read_bytes() for p in root.rglob("*") if p.is_file()}
        sync="github_sync.py"
        run("pull",sync,["pull","--root",".","--repo",REPO,"--apply"])
        plan=run("plan",sync,["plan","--root",".","--repo",REPO])
        checks["plan_identifies_both"]=any(r.get("id")==create_id and r.get("op")=="create-issue" for r in nested(plan)) and any(
            r.get("number")==12 and r.get("op")=="close-issue" for r in nested(plan))
        checks["plain_plan_withholds_commands"]=not all_commands(plan) and not re.search(r"\bgh (?:issue (?:close|create)|api .*(?:POST|PATCH))",outputs["plan"]["stdout"])
        before=snapshot()
        before_log=log.read_bytes()
        for key, flags in [("no_flags",[]),("apply_only",["--apply"]),("authorized_only",["--authorized"])]:
            obj=run(key,sync,["push","--root",".","--repo",REPO,*flags])
            checks[key+"_withholds_commands"]=not all_commands(obj) and not re.search(r"\bgh (?:issue (?:close|create)|api .*(?:POST|PATCH))",outputs[key]["stdout"]) and (
                outputs[key]["exit"]!=0 or bool(obj.get("refused") or obj.get("degraded") or obj.get("reason")))
        flags=["--apply","--authorized"]
        # A candidate that requires binding an explicitly reviewed digest is invoked accordingly.
        help_doc=run("push_help",sync,["push","--help"])
        help_text=outputs["push_help"]["stdout"]
        for option,key in [("--plan-digest","plan_digest"),("--plan-sha256","plan_sha256"),("--plan-hash","plan_hash")]:
            if option in help_text and isinstance(plan.get(key),str):
                flags.extend([option,plan[key]])
                break
        approved=run("approved",sync,["push","--root",".","--repo",REPO,*flags])
        commands=all_commands(approved)
        def binds(args):
            return any(v in (REPO, "github.com/"+REPO) or "repos/"+REPO+"/" in v for v in args)
        checks["concrete_create"]=any(binds(a) and any(TITLE in v for v in a) and any(create_id in v for v in a) for a,_ in commands)
        checks["concrete_close"]=any(binds(a) and ("12" in a or any(v.endswith("/issues/12") for v in a)) and
                                     ("close" in a or any("closed" in v for v in a)) for a,_ in commands)
        checks["printable_matches_argv"]=bool(commands) and all(any(shlex.split(s)==a for s in lines) for a,lines in commands)
        checks["no_placeholders"]=bool(commands) and all(not re.search(r"<(?:title|body|number|sha)>|[A-Z]{3}-XXXXXXXX",
                                                           json.dumps(a),re.I) for a,_ in commands)
        checks["approval_left_project_unchanged"]=before==snapshot()
        checks["render_never_invoked_gh"]=not log.read_bytes()[len(before_log):]
        outputs["gh_transport_calls"]=[json.loads(line) for line in log.read_text().splitlines()]
        checks["transport_only_get"]=bool(outputs["gh_transport_calls"]) and all("--method" in a and
              a[a.index("--method")+1]=="GET" for a in outputs["gh_transport_calls"])

        # Use distinct synthetic canaries for each path through the scope firewall.
        remote["issues"][0]["title"]="Internal use only / copper mirror title"
        remote["issues"][0]["labels"]=[{"name":"Internal use only / violet mirror label"}]
        remote["milestones"][0]["title"]="Internal use only / silver milestone title"
        remote["issues"].append({"number":91,"title":"Public reference row","state":"open","labels":[],
                                 "body":"Public reference row","milestone":None})
        remote["issues"].append({"number":92,"title":"notes/Internal use only/dune-path.md","state":"open","labels":[],
                                 "body":"Synthetic relative pathname","milestone":None})
        write_json(snap,remote)
        run("redacted_pull",sync,["pull","--root",".","--repo",REPO,"--apply"])
        mirror=(cdir/"github-index.json").read_text()
        outputs["redacted_mirror"]=json.loads(mirror)
        checks["mirror_withholds_restricted_metadata"]=(any(r.get("number")==91 for r in nested(outputs["redacted_mirror"])) and
            all(s not in mirror.lower() for s in ["internal use only","copper mirror title","violet mirror label","silver milestone title","dune-path.md"]))
        (root/"Internal use only - amber notes.md").write_text("TODO: summarize synthetic sample.\n")
        scan=run("scan","scan_repo.py",["--root","."])
        checks["scan_withholds_restricted_path"]=bool(scan) and "amber notes" not in json.dumps(scan).lower() and "internal use only" not in json.dumps(scan).lower()
        run("detect_control","detect_mode.py",["--root","."])
        no_git=run("detect_without_git","detect_mode.py",["--root","."],omit_git=True)
        checks["prior_A_retained_with_reason"]=no_git.get("mode")=="A" and bool(re.search(
            r"\bgit\b[^.{}]{0,95}(?:unavailable|unverified|missing|could not|not (?:installed|available|found)|cannot|couldn.t|unconfirmed)|(?:unavailable|missing|cannot|could not)[^.{}]{0,75}\bgit\b",
            json.dumps(no_git),re.I))
        (root/".git/config").write_text((root/".git/config").read_text().replace("github.com","gitlab.com"))
        other=run("detect_observed_gitlab","detect_mode.py",["--root","."])
        checks["observed_non_github_demotes"]=other.get("mode")=="B" and other.get("sub_case")=="git-non-github"
    return {"kind":"supplemental offline implementation probes","checks":checks,"observations":outputs}

if __name__=="__main__":
    path=HERE/"probe-results.json"
    if path.exists():
        raise SystemExit("First probe has already been retained")
    write_json(path,probe())

