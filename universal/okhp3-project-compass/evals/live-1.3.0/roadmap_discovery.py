"""Supplemental post-freeze source-read check, kept outside matched scores."""
import json
from executor import HERE, write_json
from roadmap_probe import ROADMAP
from run import verify
from transport import adapt_and_run

if __name__=="__main__":
    verify()
    original=json.loads((HERE/"fixtures.json").read_text())[0]
    case=dict(original, files=dict(original["files"], **{"docs/ROADMAP.md":ROADMAP}))
    slug="pilot-roadmap"
    adapt_and_run([("candidate",case,slug)],workers=1)
    result=json.loads((HERE/"submissions"/slug/"evidence.json").read_text())
    read_calls=[i for i,c in enumerate(result["calls"],1) if c["tool"]=="inspect" and not c["error"] and
                c["arguments"].get("surface")=="project" and any(p.removeprefix("./")=="docs/ROADMAP.md"
                for p in c["arguments"].get("paths",[]))]
    try:
        state=json.loads(result["files_changed"].get(".compass/objectives.json","{}"))
        tasks=[t for t in state.get("tasks",[]) if isinstance(t,dict) and
               "violet" in json.dumps(t).lower() and "sample" in json.dumps(t).lower()]
    except (ValueError,TypeError):
        tasks=[]
    write_json(HERE/"roadmap-discovery.json",{"partition":"pilot regression, outside frozen matched grades",
        "source":"docs/ROADMAP.md:5","source_text":ROADMAP.splitlines()[4],"explicit_read_call_numbers":read_calls,
        "indexed_tasks_with_source_terms":tasks,"attempts":result["attempts"],"evidence":"submissions/pilot-roadmap/evidence.json"})

