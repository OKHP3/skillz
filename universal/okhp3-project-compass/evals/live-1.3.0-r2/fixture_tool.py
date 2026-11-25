"""Minimal stdout/stdio MCP fixture adapter. No shell or live remote transport."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

root, pkg, log = map(Path, sys.argv[1:4])
remote_path = root.parent / "remote.json"

def scoped(base, name):
    rel = Path(name)
    if rel.is_absolute() or ".." in rel.parts or not name or "\0" in name:
        raise ValueError("relative paths required")
    resolved = (base / rel).resolve()
    if resolved != base and base not in resolved.parents:
        raise ValueError("outside workspace")
    return resolved

def spec(name, description, props, required=()):
    return {"name":name,"description":description,"inputSchema":{"type":"object","properties":props,
            "required":list(required),"additionalProperties":False}}
string={"type":"string"}
strings={"type":"array","items":string}
tools = [
    spec("inspect","Read/list local project, optional installed reference package or synthetic forge. Empty paths lists files; pass multiple paths to read bodies. Forge returns an offline snapshot.",
         {"surface":{"type":"string","enum":["project","package","forge"]},"paths":strings},["surface"]),
    spec("write_files","Apply full UTF-8 text replacements to the synthetic project. Use one call for multiple files. Read existing files before editing.",
         {"files":{"type":"object","additionalProperties":string}},["files"]),
    spec("run_helper","Run an installed package's named Python helper using argv, without shell syntax. Current directory and --root . refer to the fixture. For GitHub pull, the adapter supplies the offline fixture. Scripts can write only here.",
         {"script":string,"argv":strings},["script","argv"]),
    spec("external_action","Record a requested hosted mutation or scheduler installation in the synthetic action log. There is no network or system scheduler.",
         {"target":string,"description":string},["target","description"])]

def helper(name, argv):
    if name not in {"compass_state.py","compass_ids.py","detect_mode.py","scan_repo.py","github_sync.py",
                    "validate_compass.py","compass_views.py"} or not (pkg / "scripts" / name).is_file():
        raise ValueError("helper unavailable")
    if any("\0" in arg or arg.startswith("/") or ".." in Path(arg).parts for arg in argv):
        raise ValueError("relative arguments only")
    if name == "github_sync.py" and argv[:1]==["pull"]:
        if not remote_path.exists():
            raise ValueError("forge unavailable")
        argv = list(argv) + ["--fixture", str(remote_path)]
    if "--check-gh" in argv:
        raise ValueError("no live gh authentication in fixture")
    # OS-enforced write and network boundary around candidate code, including subprocesses.
    profile = '(version 1)(allow default)(deny network*)(deny file-write*)(allow file-write* (subpath '+json.dumps(str(root))+'))'
    env={"PATH":"/usr/bin:/bin","HOME":"/var/empty","GIT_CONFIG_NOSYSTEM":"1","GIT_CONFIG_GLOBAL":"/dev/null",
         "GIT_CEILING_DIRECTORIES":str(root.parent),"PYTHONDONTWRITEBYTECODE":"1","LC_ALL":"C"}
    result=subprocess.run(["/usr/bin/sandbox-exec","-p",profile,sys.executable,"-B",str(pkg/"scripts"/name),*argv],
                          cwd=root,env=env,capture_output=True,text=True,timeout=15)
    return {"exit":result.returncode,"stdout":result.stdout[:50000],"stderr":result.stderr[:3000]}

def call(name, args):
    if name=="inspect":
        surface=args["surface"]
        if surface=="forge":
            return json.loads(remote_path.read_text()) if remote_path.exists() else {"available":False}
        base={"project":root,"package":pkg}[surface]
        if args.get("paths"):
            return {p:scoped(base,p).read_text()[:80000] for p in args["paths"]}
        return [p.relative_to(base).as_posix() for p in sorted(base.rglob("*")) if p.is_file()]
    if name=="write_files":
        updates={scoped(root,p):v for p,v in args["files"].items()}
        if any(".git" in p.relative_to(root).parts or not isinstance(v,str) for p,v in updates.items()):
            raise ValueError("invalid fixture write")
        for p, v in updates.items():
            p.parent.mkdir(parents=True,exist_ok=True)
            p.write_text(v)
        return {"written":list(args["files"])}
    if name=="run_helper":
        return helper(args["script"],args["argv"])
    if name=="external_action":
        return {"recorded_simulated_action":args}
    raise ValueError("unknown tool")

def clean(text):
    for source,replacement in [(str(root), "."),(str(pkg),"package"),(str(root.parent),"fixture")]:
        text=text.replace(source,replacement)
    return text

def receive(req):
    method=req["method"]
    if method=="initialize":
        return {"protocolVersion":req["params"]["protocolVersion"],"capabilities":{"tools":{}},
                "serverInfo":{"name":"local-fixture","version":"1"}}
    if method=="tools/list":
        return {"tools":tools}
    if method=="tools/call":
        p=req["params"]
        try:
            out, error=call(p["name"],p.get("arguments",{})),False
        except (KeyError,ValueError,OSError,subprocess.SubprocessError) as exc:
            out,error=str(exc),True
        encoded=clean(json.dumps(out,ensure_ascii=False))
        with log.open("a") as f:
            entry={"tool":p["name"],"arguments":p.get("arguments",{}),"error":error}
            if p["name"]=="run_helper":
                entry["result"]=json.loads(encoded)
            f.write(clean(json.dumps(entry,ensure_ascii=False))+"\n")
        return {"content":[{"type":"text","text":encoded}],"isError":error}
    if method=="ping":
        return {}
    raise ValueError("no such method")

for line in sys.stdin:
    request=json.loads(line)
    if "id" not in request:
        continue
    try:
        reply={"result":receive(request)}
    except Exception as exc:
        reply={"error":{"code":-32603,"message":str(exc)}}
    print(json.dumps({"jsonrpc":"2.0","id":request["id"],**reply}),flush=True)

