#!/usr/bin/env python3
"""Self-test harness for OKHP3 Project Compass.

Bundled tooling, not part of the tracking workflow itself. Exercises every
script in scripts/ against synthetic fixtures built in a throwaway temp
directory, and asserts the documented behavior actually holds: identifier
determinism, mode detection across all six sub-cases, managed-block safety,
drift detection, the GitHub mirror's marker matching and write refusal, and
the validator's scoring. Exit 0 means every assertion passed. Exit 1 means at
least one did not; the failing assertion is printed with what was expected and
what was observed.

This is the mechanism referenced by the Foundry release gate as the
structural, fixture, and manual review gate to run when no live with/without
executor is available: it cannot prove task-quality uplift, only that the
bundled tooling behaves as SKILL.md and the references claim.

Usage
-----
  python3 selftest.py
  python3 selftest.py --keep      # leave the temp fixtures for inspection
  python3 selftest.py -v          # print each assertion as it runs

Requires Python 3.8+. Uses git when present to build realistic fixtures; the
mode-detection assertions that need a real .git/config are skipped, not
failed, when git is unavailable, and the skip is reported at the end.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


class Check:
    def __init__(self, verbose):
        self.verbose = verbose
        self.passed = 0
        self.failed = []
        self.skipped = []

    def ok(self, name, condition, detail=""):
        if condition:
            self.passed += 1
            if self.verbose:
                print("  PASS %s" % name)
        else:
            self.failed.append((name, detail))
            print("  FAIL %s%s" % (name, ("  " + detail) if detail else ""))

    def skip(self, name, reason):
        self.skipped.append((name, reason))
        print("  SKIP %s  (%s)" % (name, reason))

    def summary(self):
        total = self.passed + len(self.failed)
        print("\n%d/%d assertions passed, %d skipped"
              % (self.passed, total, len(self.skipped)))
        if self.failed:
            print("\nFailures:")
            for name, detail in self.failed:
                print("  - %s: %s" % (name, detail))
        return 0 if not self.failed else 1


def run_py(script, args, cwd=None):
    cmd = [sys.executable, os.path.join(HERE, script), *args]
    out = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=60)
    return out.returncode, out.stdout, out.stderr


def run_py_json(script, args, cwd=None):
    code, out, err = run_py(script, args, cwd=cwd)
    try:
        return code, json.loads(out), err
    except ValueError as exc:
        raise AssertionError("%s %s did not return valid JSON: %s\nstdout:\n%s\nstderr:\n%s"
                             % (script, args, exc, out, err))


def git(cwd, *args):
    out = subprocess.run(["git", "-C", cwd, *args], capture_output=True,
                         text=True, timeout=20)
    return out.returncode == 0, out.stdout.strip()


def has_git():
    return shutil.which("git") is not None


def build_synthetic_repo(root):
    os.makedirs(os.path.join(root, "src"), exist_ok=True)
    with open(os.path.join(root, "README.md"), "w") as fh:
        fh.write("# Widget Forge\n\nThe purpose of this project is to turn CAD "
                 "exports into printable widget packs.\n\n## Goals\n- Parse DXF "
                 "exports\n\n## Non-goals\n- Rendering 3D previews\n")
    with open(os.path.join(root, "src", "parse.py"), "w") as fh:
        fh.write("# TODO: handle R10 polyline variants\ndef parse(x):\n    return x\n")
    if has_git():
        git(root, "init", "-q", "-b", "main")
        git(root, "-c", "user.email=a@b", "-c", "user.name=t", "add", "-A")
        git(root, "-c", "user.email=a@b", "-c", "user.name=t", "commit", "-qm",
            "initial import")


def section_identifiers(c):
    print("\n== compass_ids.py: determinism and namespacing ==")
    import compass_ids as ids

    a = ids.mint("My Repo", "objective", "Ship  v1!")
    b = ids.mint("my-repo", "objective", "ship v1")
    c.ok("id-casing-punctuation-stable", a == b, "%r != %r" % (a, b))

    same_title_other_kind = ids.mint("my-repo", "task", "ship v1")
    c.ok("id-namespaced-by-kind", a != same_title_other_kind)

    taken = {a}
    collided = ids.mint("my-repo", "objective", "ship v1", taken)
    c.ok("id-collision-resolves-deterministically", collided not in taken)
    collided2 = ids.mint("my-repo", "objective", "ship v1", taken)
    c.ok("id-collision-is-itself-deterministic", collided == collided2)

    state = {"project_key": "my-repo", "objectives": [
        {"id": a, "title": "ship v1", "title_hash": ids.title_hash("my-repo", "objective", "ship v1")}]}
    result = ids.verify(state)
    c.ok("verify-clean-state-ok", result["ok"] is True, json.dumps(result))

    state["objectives"][0]["title"] = "ship v2"
    result2 = ids.verify(state)
    rename_warning = any("title changed" in f["message"] for f in result2["findings"])
    c.ok("verify-detects-unrecorded-rename", rename_warning)


def section_detect_mode(c, root):
    print("\n== detect_mode.py: all six sub-cases ==")
    if not has_git():
        for name in ("github-origin", "github-non-origin", "git-non-github",
                     "git-no-remote", "plain-folder"):
            c.skip("detect-%s" % name, "git binary not available")
        return

    plain = os.path.join(root, "plain")
    os.makedirs(plain, exist_ok=True)
    code, doc, _ = run_py_json("detect_mode.py", ["--root", plain])
    c.ok("detect-plain-folder", doc["mode"] == "B" and doc["sub_case"] == "plain-folder",
         json.dumps(doc.get("sub_case")))

    repo = os.path.join(root, "repo")
    build_synthetic_repo(repo)
    code, doc, _ = run_py_json("detect_mode.py", ["--root", repo])
    c.ok("detect-git-no-remote", doc["mode"] == "B" and doc["sub_case"] == "git-no-remote",
         json.dumps(doc.get("sub_case")))

    git(repo, "remote", "add", "origin", "https://gitlab.com/x/y.git")
    code, doc, _ = run_py_json("detect_mode.py", ["--root", repo])
    c.ok("detect-git-non-github", doc["mode"] == "B" and doc["sub_case"] == "git-non-github",
         json.dumps(doc.get("sub_case")))

    git(repo, "remote", "set-url", "origin", "git@github.com:OKHP3/widget-forge.git")
    code, doc, _ = run_py_json("detect_mode.py", ["--root", repo])
    c.ok("detect-github-origin", doc["mode"] == "A" and doc["sub_case"] == "github-origin",
         json.dumps(doc.get("sub_case")))
    c.ok("detect-owner-repo-parsed", doc.get("owner_repo") == "OKHP3/widget-forge",
         json.dumps(doc.get("owner_repo")))

    git(repo, "remote", "rename", "origin", "upstream")
    git(repo, "remote", "add", "origin", "https://gitlab.com/x/y.git")
    code, doc, _ = run_py_json("detect_mode.py", ["--root", repo])
    c.ok("detect-github-non-origin-stays-mode-b",
         doc["mode"] == "B" and doc["sub_case"] == "github-non-origin",
         json.dumps(doc.get("sub_case")))
    c.ok("detect-ambiguity-raises-open-question", len(doc.get("open_questions", [])) > 0)


def section_state_and_blocks(c, root):
    print("\n== compass_state.py: init, baseline, drift, managed blocks ==")
    target = os.path.join(root, "state-target")
    build_synthetic_repo(target)

    code, out, err = run_py("compass_state.py",
                            ["--root", target, "--apply", "init",
                             "--project-key", "widget-forge"])
    c.ok("init-writes-config", os.path.isfile(os.path.join(target, ".compass", "config.json")),
         err)
    c.ok("init-writes-objectives", os.path.isfile(os.path.join(target, ".compass", "objectives.json")))

    code, out, err = run_py("compass_state.py", ["--root", target, "--apply", "baseline"])
    c.ok("baseline-writes-manifest", os.path.isfile(os.path.join(target, ".compass", "baseline.json")))

    with open(os.path.join(target, "README.md"), "a") as fh:
        fh.write("\nmore\n")
    code, drift, err = run_py_json("compass_state.py", ["--root", target, "drift"])
    c.ok("drift-detects-changed-file", "README.md" in drift.get("changed", []),
         json.dumps(drift.get("changed")))

    charter = os.path.join(target, "docs", "CHARTER.md")
    os.makedirs(os.path.dirname(charter), exist_ok=True)
    with open(charter, "w") as fh:
        fh.write("# Charter\n\nHand written intro that must survive.\n")
    obj_file = os.path.join(root, "objs.md")
    with open(obj_file, "w") as fh:
        fh.write("- OBJ-AAAA1111 Parse DXF exports\n")
    run_py("compass_state.py", ["--root", target, "--apply", "block",
                                "--file", "docs/CHARTER.md", "--id", "goals",
                                "--content-file", obj_file])
    with open(charter) as fh:
        body = fh.read()
    c.ok("block-preserves-human-prose", "Hand written intro that must survive." in body)
    c.ok("block-inserts-managed-content", "OBJ-AAAA1111" in body)

    with open(obj_file, "w") as fh:
        fh.write("- OBJ-AAAA1111 Parse DXF exports (done)\n")
    run_py("compass_state.py", ["--root", target, "--apply", "block",
                                "--file", "docs/CHARTER.md", "--id", "goals",
                                "--content-file", obj_file])
    with open(charter) as fh:
        body2 = fh.read()
    c.ok("block-replace-preserves-prose", "Hand written intro that must survive." in body2)
    c.ok("block-replace-updates-content", "(done)" in body2 and body2.count("OBJ-AAAA1111") == 1)

    print("\n== compass_state.py: record-run trend columns (regression for CLM-02) ==")
    code, out, err = run_py("compass_state.py",
                            ["--root", target, "--apply", "record-run",
                             "--mode", "reassess", "--summary", "trend check",
                             "--report", "r.md",
                             "--counts", json.dumps({"objectives": 3, "done": 1,
                                                     "in_progress": 1, "blocked": 0,
                                                     "drift_open": 2, "score": 91})])
    with open(os.path.join(target, ".compass", "RUN-HISTORY.md")) as fh:
        hist = fh.read()
    c.ok("record-run-header-has-nine-columns",
         "| run | mode | objectives | done | in progress | blocked | drift open | score | summary | report |" in hist,
         hist.splitlines()[4] if len(hist.splitlines()) > 4 else hist)
    last_row = [ln for ln in hist.splitlines() if ln.startswith("| run-")][-1]
    c.ok("record-run-row-renders-supplied-counts",
         all(tok in last_row for tok in (" 3 ", " 1 ", " 0 ", " 2 ", " 91 ")),
         last_row)

    code, out, err = run_py("compass_state.py",
                            ["--root", target, "--apply", "record-run",
                             "--mode", "reassess", "--summary", "no counts this time",
                             "--report", "r2.md"])
    with open(os.path.join(target, ".compass", "RUN-HISTORY.md")) as fh:
        hist2 = fh.read()
    blank_row = [ln for ln in hist2.splitlines() if "no counts this time" in ln][0]
    cells = [c2.strip() for c2 in blank_row.strip("|").split("|")]
    c.ok("record-run-blank-counts-render-as-empty-not-zero",
         cells[2:8] == ["", "", "", "", "", ""], blank_row)


def section_github_sync(c, root):
    print("\n== github_sync.py: mirror, matching, write refusal ==")
    target = os.path.join(root, "gh-target")
    build_synthetic_repo(target)
    run_py("compass_state.py", ["--root", target, "--apply", "init",
                                "--project-key", "widget-forge"])

    import compass_ids as ids
    obj_id = ids.mint("widget-forge", "objective", "Parse DXF exports")
    tsk_id = ids.mint("widget-forge", "task", "Handle R10 polyline variants")
    state_path = os.path.join(target, ".compass", "objectives.json")
    with open(state_path) as fh:
        state = json.load(fh)
    state["objectives"] = [{"id": obj_id, "title": "Parse DXF exports",
                            "title_hash": ids.title_hash("widget-forge", "objective", "Parse DXF exports"),
                            "status": "in_progress"}]
    state["tasks"] = [{"id": tsk_id, "title": "Handle R10 polyline variants",
                       "title_hash": ids.title_hash("widget-forge", "task", "Handle R10 polyline variants"),
                       "status": "active", "objective_id": obj_id}]
    with open(state_path, "w") as fh:
        json.dump(state, fh)

    fixture = os.path.join(root, "fixture.json")
    with open(fixture, "w") as fh:
        json.dump({
            "issues": [
                {"number": 42, "title": "Handle R10 polyline variants",
                 "body": "do it\n\n<!-- compass-id: %s -->" % tsk_id,
                 "state": "OPEN", "labels": [{"name": "compass"}],
                 "milestone": {"number": 3}, "url": "u1"},
                {"number": 7, "title": "Unrelated old issue", "body": "no marker",
                 "state": "CLOSED", "labels": [], "milestone": None, "url": "u2"},
            ],
            "milestones": [
                {"number": 3, "title": "Parse DXF exports",
                 "description": "<!-- compass-id: %s -->" % obj_id,
                 "state": "open", "open_issues": 1, "closed_issues": 3,
                 "html_url": "u3"},
            ],
        }, fh)

    code, out, err = run_py("github_sync.py",
                            ["pull", "--root", target, "--repo", "OKHP3/widget-forge",
                             "--fixture", fixture, "--apply"])
    index_path = os.path.join(target, ".compass", "github-index.json")
    c.ok("pull-writes-mirror-index", os.path.isfile(index_path), err)
    with open(index_path) as fh:
        index = json.load(fh)
    c.ok("mirror-matches-issue-by-marker", tsk_id in index.get("issues", {}))
    c.ok("mirror-matches-milestone-by-marker", obj_id in index.get("milestones", {}))
    c.ok("mirror-surfaces-unmarked-issue",
         any(i["number"] == 7 for i in index.get("unmatched_remote", {}).get("issues", [])))
    c.ok("mirror-never-copies-issue-body",
         all("body" not in v for v in index.get("issues", {}).values()))

    code, plan, err = run_py_json("github_sync.py",
                                  ["plan", "--root", target, "--repo", "OKHP3/widget-forge"])
    c.ok("plan-flags-unmarked-issue-for-review",
         any(a.get("op") == "adopt-or-ignore" and a.get("number") == 7
             for a in plan.get("actions", [])), json.dumps(plan.get("actions")))

    code, out, err = run_py("github_sync.py",
                            ["push", "--root", target, "--repo", "OKHP3/widget-forge"])
    c.ok("push-refused-without-apply-and-authorized", code == 3, "exit=%s stderr=%s" % (code, err))

    code, out, err = run_py("github_sync.py",
                            ["push", "--root", target, "--repo", "OKHP3/widget-forge", "--apply"])
    c.ok("push-refused-with-only-apply-not-authorized", code == 3, "exit=%s stderr=%s" % (code, err))

    code, out, err = run_py_json("github_sync.py",
                                 ["pull", "--root", target, "--repo", "OKHP3/nonexistent"])
    c.ok("pull-degrades-without-gh-cli-instead-of-crashing",
         code == 0 and out.get("degraded") == "file-only", "exit=%s out=%s" % (code, out))


def section_validate(c, root):
    print("\n== validate_compass.py: scoring and negative tests ==")
    target = os.path.join(root, "validate-target")
    build_synthetic_repo(target)
    run_py("compass_state.py", ["--root", target, "--apply", "init",
                                "--project-key", "widget-forge"])
    run_py("compass_state.py", ["--root", target, "--apply", "baseline"])

    code, report, err = run_py_json("validate_compass.py", ["--root", target, "--json"])
    c.ok("bare-init-is-not-band-a",
         report["band"] in ("B", "C", "D"), json.dumps(report.get("band")))
    c.ok("bare-init-charter-check-fails-or-warns",
         any(x["id"] == "V5" and x["status"] != "PASS" for x in report["checks"]),
         json.dumps([x for x in report["checks"] if x["id"] == "V5"]))

    charter = os.path.join(target, "docs", "CHARTER.md")
    os.makedirs(os.path.dirname(charter), exist_ok=True)
    with open(charter, "w") as fh:
        fh.write("# Charter\n\n## Purpose\nx\n## Vision\nx\n## Mission\nx\n"
                 "## Goals\nx\n## Non-goals\nx\n## Success\nx\n\n"
                 "Ticket PROJ-4412 confidential, hosted at app.acme.corp.\n")
    with open(os.path.join(target, ".compass", "objectives.json")) as fh:
        state = json.load(fh)
    state["charter_ref"] = "docs/CHARTER.md"
    with open(os.path.join(target, ".compass", "objectives.json"), "w") as fh:
        json.dump(state, fh)
    code, report, err = run_py_json("validate_compass.py", ["--root", target, "--json"])
    v7 = [x for x in report["checks"] if x["id"] == "V7"][0]
    c.ok("firewall-catches-ticket-key-and-confidentiality-marker",
         v7["status"] == "FAIL", json.dumps(v7))

    with open(charter, "a") as fh:
        fh.write("\nAn em dash — sneaks in here.\n")
    code, report, err = run_py_json("validate_compass.py", ["--root", target, "--json"])
    v8 = [x for x in report["checks"] if x["id"] == "V8"][0]
    c.ok("style-check-catches-em-dash", v8["status"] == "FAIL", json.dumps(v8))

    weights_sum = sum({c2["id"]: c2["weight"] for c2 in report["checks"]}.values())
    c.ok("weights-sum-to-100", weights_sum == 100, "sum=%s" % weights_sum)

    print("\n== validate_compass.py: V3 transitive objective inheritance (regression for CLM-04) ==")
    import compass_ids as ids
    v3_target = os.path.join(root, "v3-target")
    build_synthetic_repo(v3_target)
    run_py("compass_state.py", ["--root", v3_target, "--apply", "init",
                                "--project-key", "v3check"])
    obj_id = ids.mint("v3check", "objective", "Ship v1")
    parent_task_id = ids.mint("v3check", "task", "Build the release pipeline")
    child_task_id = ids.mint("v3check", "task", "Write the release notes step")
    state_path = os.path.join(v3_target, ".compass", "objectives.json")
    with open(state_path) as fh:
        v3_state = json.load(fh)
    v3_state["objectives"] = [{"id": obj_id, "title": "Ship v1", "status": "active"}]
    v3_state["tasks"] = [
        {"id": parent_task_id, "title": "Build the release pipeline",
         "status": "active", "objective_id": obj_id},
        {"id": child_task_id, "title": "Write the release notes step",
         "status": "active", "parent_id": parent_task_id},
    ]
    with open(state_path, "w") as fh:
        json.dump(v3_state, fh)
    code, report, err = run_py_json("validate_compass.py", ["--root", v3_target, "--json"])
    v3 = [x for x in report["checks"] if x["id"] == "V3"][0]
    c.ok("v3-nested-subtask-inherits-objective-transitively",
         v3["status"] != "FAIL", json.dumps(v3))

    orphan_task_id = ids.mint("v3check", "task", "Actually orphaned task")
    v3_state["tasks"].append({"id": orphan_task_id, "title": "Actually orphaned task",
                              "status": "active"})
    with open(state_path, "w") as fh:
        json.dump(v3_state, fh)
    code, report, err = run_py_json("validate_compass.py", ["--root", v3_target, "--json"])
    v3b = [x for x in report["checks"] if x["id"] == "V3"][0]
    c.ok("v3-still-catches-a-real-orphan",
         v3b["status"] == "FAIL" and
         any("has no objective_id" in f["message"] for f in v3b["findings"]),
         json.dumps(v3b))


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--keep", action="store_true", help="keep temp fixtures")
    p.add_argument("-v", "--verbose", action="store_true")
    a = p.parse_args(argv)

    missing = [f for f in ("compass_ids.py", "detect_mode.py", "compass_state.py",
                           "github_sync.py", "validate_compass.py")
              if not os.path.isfile(os.path.join(HERE, f))]
    if missing:
        print("error: selftest.py must sit next to the other Compass scripts; "
              "missing: %s" % ", ".join(missing), file=sys.stderr)
        return 2

    root = tempfile.mkdtemp(prefix="compass-selftest-")
    c = Check(a.verbose)
    try:
        section_identifiers(c)
        section_detect_mode(c, root)
        section_state_and_blocks(c, root)
        section_github_sync(c, root)
        section_validate(c, root)
    finally:
        if a.keep:
            print("\nfixtures kept at %s" % root)
        else:
            shutil.rmtree(root, ignore_errors=True)

    return c.summary()


if __name__ == "__main__":
    sys.exit(main())
