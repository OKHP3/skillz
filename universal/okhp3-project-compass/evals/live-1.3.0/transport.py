"""Paired repeat with a single macOS null-device transport correction."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import random
import secrets
import tempfile
import executor
from executor import HERE, sha, write_json
from run import manifest, run_one, verify
from grade import grade

BEFORE="(deny file-write*)(allow file-write* (subpath "
AFTER='(deny file-write*)(allow file-write* (literal "/dev/null"))(allow file-write* (subpath '

def adapter_source():
    original=(HERE/"fixture_tool.py").read_text()
    assert original.count(BEFORE)==1
    return original.replace(BEFORE,AFTER)

def adapt_and_run(jobs,workers=6):
    with tempfile.TemporaryDirectory(dir=HERE,prefix=".transport-") as temp:
        source=Path(temp)/"fixture_tool.py"
        source.write_text(adapter_source())
        old=executor.HERE
        executor.HERE=source.parent
        try:
            with ThreadPoolExecutor(max_workers=workers) as pool:
                list(pool.map(run_one,jobs))
        finally:
            executor.HERE=old

def main():
    p=argparse.ArgumentParser()
    p.add_argument("arm",choices=["baseline","candidate"])
    p.add_argument("--grade",action="store_true")
    args=p.parse_args()
    verify()
    freeze=json.loads((HERE/"transport-freeze.json").read_text())
    assert freeze["adapter_sha256"]==sha(adapter_source().encode())
    for name,digest in freeze["sha256"].items():
        assert sha((HERE/name).read_bytes())==digest
    casefiles=json.loads((HERE/"fixtures.json").read_text())
    table=HERE/("matched-"+args.arm+"-key.json")
    if args.grade:
        key=json.loads(table.read_text())
        jobs=[(key[f["id"]],f) for f in casefiles]
        random.SystemRandom().shuffle(jobs)
        with ThreadPoolExecutor(max_workers=6) as pool:
            list(pool.map(grade,jobs))
        return
    if args.arm=="candidate":
        assert manifest()==json.loads((HERE/"candidate.json").read_text())["sha256"]
    if table.exists():
        raise SystemExit("Corrected arm already allocated")
    key={f["id"]:secrets.token_hex(5) for f in casefiles}
    write_json(table,key)
    adapt_and_run([(args.arm,f,key[f["id"]]) for f in casefiles])

if __name__=="__main__":
    main()

