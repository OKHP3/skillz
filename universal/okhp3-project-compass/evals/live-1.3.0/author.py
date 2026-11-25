from pathlib import Path
from executor import HERE, execute, parse_json, write_json

if __name__ == "__main__":
    out = HERE / "independent-case.json"
    if out.exists():
        raise SystemExit("Independent case already exists")
    raw, receipt = execute((HERE / "author-prompt.txt").read_text())
    case = parse_json(raw)
    assert len(case["expectations"]) == 4 and case["request"] and case["files"]
    assert all(not Path(p).is_absolute() and ".." not in Path(p).parts for p in case["files"])
    write_json(out, case)
    write_json(HERE / "author-receipt.json", receipt)

