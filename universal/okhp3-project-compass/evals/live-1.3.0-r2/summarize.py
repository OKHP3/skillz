"""Recompute release metrics exclusively from locked first-run grades."""
import json
import re
from executor import HERE, sha, write_json
from grade import expectations, packet_for
from run import verify, manifest

def load(p):
    return json.loads(p.read_text())

def verify_public_receipts():
    # Reject host-local locators before producing a shareable summary. Graded
    # evidence is hashed, so changing it after scoring would invalidate the receipt.
    private_ref = re.compile(r"(?:/(?:Users|Volumes|private/tmp|tmp|var/folders)/|"
                             r"\.(?:run|probe)-[\w-]+/|file:///|sandbox:/)", re.I)
    for path in (HERE / "submissions").glob("*/*.json"):
        if private_ref.search(path.read_text()):
            raise ValueError("public receipt retains a private fixture locator: " + path.name)


def summarize():
    verify()
    verify_public_receipts()
    fixtures=load(HERE/"fixtures.json")
    arms=["baseline","candidate"]
    keys={a:load(HERE/("matched-"+a+"-key.json")) for a in arms}
    rows=[]
    for f in fixtures:
        case=f["id"]
        row={"case":case,"arms":{}}
        for a in arms:
            code=keys[a][case]
            folder=HERE/"submissions"/code
            result=load(folder/"grade.json")
            evidence=load(folder/"evidence.json")
            n=sum(g["pass"] for g in result["grades"]) if result["status"]=="graded" else None
            if n is not None:
                packet=packet_for(code,f)
                assert result["packet_sha256"]==sha(json.dumps(packet,ensure_ascii=False).encode())
                prompt=(HERE/"grader-prompt.txt").read_text()+"\n"+json.dumps(packet,ensure_ascii=False)
                assert result["receipt"]["prompt_sha256"]==sha(prompt.encode())
            row["arms"][a]={"submission":code,"passed":n,"possible":4,
                "failed":[g["id"] for g in result["grades"] if not g["pass"]],
                "evidence":f"live-1.3.0-r2/submissions/{code}/evidence.json",
                "grade":f"live-1.3.0-r2/submissions/{code}/grade.json",
                "attempt_status":evidence["attempts"][-1]["status"]}
        rows.append(row)
    def total(selected,a):
        values=[r["arms"][a]["passed"] for r in selected]
        return sum(values) if None not in values else None
    totals={a:{"development":total(rows[:3],a),"critical":total(rows[3:5],a),
               "published":total(rows[:5],a),"transfer":total(rows[5:],a)} for a in arms}
    q,b=totals["candidate"]["development"],totals["baseline"]["development"]
    critical=totals["candidate"]["critical"]
    def delta(key,d):
        x,y=totals["candidate"][key],totals["baseline"][key]
        return (x-y)/d if x is not None and y is not None else None
    change=delta("development",12)
    gates={"task_quality":None if q is None else q/12>=.90,"matched_uplift":None if change is None else change>=.50,
           "critical_2_of_2":None if critical is None else critical==8}
    digest=sha((HERE/"candidate.json").read_bytes())
    sealed={"status":"NOT RUN","report":"live-1.3.0-r2/PROTECTED-HOLDOUT.md"}
    receipt_path=HERE/"custody-result.json"
    if receipt_path.exists():
        receipt=load(receipt_path)
        assert receipt["candidate_manifest_sha256"]==digest
        assert receipt["seal_sha256"]==sha((HERE/"custody-seal.json").read_bytes())
        sealed.update(status="GRADED" if None not in receipt["passed_of_four"].values() else "INCOMPLETE",
                      passed_of_four=receipt["passed_of_four"],receipt="live-1.3.0-r2/custody-result.json")
    protected = {"status": "SEALED", "report": "live-1.3.0-r2/PROTECTED-HOLDOUT.md",
                 "seal": "live-1.3.0-r2/custody-seal.json"}
    if (HERE / "custody-result.json").exists():
        result = load(HERE / "custody-result.json")
        if result["candidate_manifest_sha256"] != digest or result["seal_sha256"] != sha((HERE / "custody-seal.json").read_bytes()):
            raise ValueError("protected observation does not match the candidate and custody seal")
        protected.update(status="GRADED" if None not in result["passed_of_four"].values() else "INCOMPLETE",
                         receipt="live-1.3.0-r2/custody-result.json")
    return {"skill":"okhp3-project-compass","evaluated_skill_version":"1.3.0","evaluation_status":"live-synthetic",
            "model":"gpt-6.2-sol","replications_per_case_per_arm":1,"candidate_manifest_sha256":digest,
            "frozen_sources":"live-1.3.0-r2/freeze.json","protocol":"live-1.3.0-r2/PROTOCOL.md",
            "acceptance_criteria":load(HERE/"original-inputs/benchmark.json")["acceptance_criteria"], "runs":rows,
            "counts":totals,"quality":q/12 if q is not None else None,"uplift":change,"all_published_uplift":delta("published",20),
            "gates":gates,"matched_gate_verdict":"FAIL" if False in gates.values() else "INCOMPLETE" if None in gates.values() else "PASS",
            "protected_holdout":protected,
            "disposition":"review-only" if not all(gates.values()) else "matched gates passed; owner review",
            "offline_probe":"live-1.3.0-r2/probe-results.json","candidate_payload_still_matches":manifest()==load(HERE/"candidate.json")["sha256"]}

if __name__=="__main__":
    write_json(HERE.parent/"benchmark-1.3.0-r2.json",summarize())

