"""Offline tests for the public CLI, persisted state and the eleven Compass checks."""
from contextlib import redirect_stdout
import datetime as dt
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
import compass_ids as ids
import compass_state
from validate_compass import validate


def cli(name, *args):
    return subprocess.run([sys.executable, "-B", str(SCRIPTS / name), *map(str, args)],
                          capture_output=True, text=True, timeout=8)


def write(path, data):
    path.write_text(json.dumps(data), encoding="utf-8")


def item(kind, title, **values):
    return dict(id=ids.mint("demo", kind, title), title_hash=ids.title_hash("demo", kind, title),
                title=title, status="proposed", **values)


class Validation(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "project"
        self.root.mkdir()
        self.files = self.root / ".compass"
        self.files.mkdir()
        (self.files / "runs").mkdir()
        (self.files / "reports").mkdir()
        write(self.files / "runs/run-1.json", dict(schema="okhp3.compass.run/1", run_id="run-1",
                                                   report=".compass/reports/r.md"))
        (self.files / "reports/r.md").write_text("Run run-1\n")
        (self.files / "RUN-HISTORY.md").write_text(
            "| run | mode | summary | report |\n| run-1 | assess-only | review | .compass/reports/r.md |\n")
        (self.files / "OPEN-QUESTIONS.md").write_text("# Questions\n")
        (self.root / "charter.md").write_text("".join(
            "## %s\nObserved.\n" % key for key in
            ("Purpose", "Vision", "Mission", "Goals", "Non-goals", "Success criteria")))
        self.evidence = dict(type="doc_change", ref="README.md:3", observed_at="2026-01-01")
        self.obj = item("objective", "Ship example", confidence="declared", source="README.md:3",
                        updated_at=dt.date.today().isoformat())
        self.task = item("task", "Check example", objective_id=self.obj["id"])
        self.state = dict(schema="okhp3.compass.objectives/1", project_key="demo",
                          objectives=[self.obj], tasks=[self.task], charter_ref="charter.md",
                          runs=1, last_run_id="run-1", intent={"claims": [
                              dict(field="purpose", text="Ship examples", confidence="declared",
                                   evidence=[self.evidence]),
                              dict(field="vision", text=None, confidence="unknown", evidence=[])]},
                          mode={"detected": "B", "evidence": [{"signal": "plain-folder"}]})
        self.config = dict(schema="okhp3.compass.state/1", project_key="demo")
        write(self.files / "baseline.json", dict(schema="okhp3.compass.baseline/1",
              generated_at="2026-01-01", files={}, file_count=0, truncated=False))

    def save(self):
        write(self.files / "objectives.json", self.state)
        write(self.files / "config.json", self.config)

    def report(self):
        self.save()
        return validate(self.root)

    def check(self, number, expected):
        result = next(check for check in self.report()["checks"] if check["id"] == number)
        self.assertEqual(result["status"], expected, result)

    def test_all_eleven_and_cli_gate(self):
        report = self.report()
        self.assertEqual((len(report["checks"]), report["score"], report["gate"]), (11, 100, "PASS"))
        for expected in (0, 1):
            if expected:
                self.obj["status"] = "done"
                self.save()
            result = cli("validate_compass.py", "--json", "--root", self.root)
            self.assertEqual(result.returncode, expected)
            self.assertEqual(json.loads(result.stdout)["gate"], ("PASS", "HOLD")[expected])

    def test_claims_cannot_borrow_another_claims_evidence(self):
        self.state["intent"]["claims"][1].update(text="Lead", confidence="declared")
        self.check("V6", "FAIL")
        self.state["intent"].update(confidence="declared", evidence=[self.evidence])
        self.check("V6", "FAIL")

    def test_inferred_claims_need_independent_observations(self):
        claim = self.state["intent"]["claims"][0]
        claim.update(confidence="inferred-strong", evidence=[self.evidence] * 3, alternative="Experiment")
        self.check("V6", "FAIL")
        claim["evidence"] = [dict(self.evidence, type=t, ref=ref) for t, ref in (
            ("commit", "ac34de12"), ("doc_change", "README.md:3"), ("release", "v1"))]
        self.check("V6", "PASS")
        del claim["alternative"]
        self.check("V6", "FAIL")

    def test_legacy_intent_is_readable_and_warns(self):
        self.state["intent"] = dict(purpose="Ship examples", mission=None, confidence="declared",
                                    evidence=[self.evidence])
        self.check("V6", "WARN")
        self.assertEqual(self.report()["gate"], "PASS")

    def test_bad_evidence_is_never_support(self):
        self.task["status"] = "done"
        for entry in (None, {}, dict(self.evidence, type=[]), dict(self.evidence, ref="  "),
                      dict(self.evidence, observed_at="yesterday"), dict(self.evidence, type="file_added")):
            with self.subTest(entry=entry):
                self.task["evidence"] = [entry]
                self.check("V4", "FAIL")
        self.task["evidence"] = [self.evidence]
        self.check("V4", "PASS")
        self.state["risks"] = [dict(item("risk", "Example risk"), status="active")]
        self.check("V4", "FAIL")

    def test_done_requires_closed_issue_or_merged_pr_observation(self):
        self.task["status"] = "done"
        for kind, disposition, note, expected in (
                ("issue", "open", "Work outstanding", "FAIL"),
                ("issue", None, "Issue is open; work outstanding", "FAIL"),
                ("issue", None, "Not yet closed", "FAIL"),
                ("pr", "closed", "Closed without merging", "FAIL"),
                ("pr", None, "Review requested", "FAIL"),
                ("issue", "closed", "", "PASS"),
                ("issue", None, "Closed after acceptance", "PASS"),
                ("pr", None, "Merged after review", "PASS")):
            with self.subTest(kind=kind, state=disposition, note=note):
                self.task["evidence"] = [dict(self.evidence, type=kind, ref="#42",
                                              state=disposition, note=note)]
                self.check("V4", expected)

    def test_explicit_negative_evidence_cannot_substantiate_done(self):
        self.task["status"] = "done"
        for kind, fields in (
                ("test_signal", {"note": "Acceptance tests failed; no completion signal."}),
                ("test_signal", {"outcome": "failure"}),
                ("test_signal", {"ref": "FAILED"}),
                ("manual", {"result": "not complete"}),
                ("test_signal", {"passed": False}),
                ("test_signal", {"exit_code": 1, "note": "Test run finished."}),
                ("release", {"ref": "release:v1 - rollout failed"}),
                ("manual", {"note": "Owner confirms the work is not complete."}),
                ("doc_change", {"note": "Checklist records no completion."}),
                ("issue", {"state": "closed", "note": "Closed without completing the work."}),
                ("pr", {"merged": True, "note": "The acceptance test did not pass."})):
            with self.subTest(kind=kind, fields=fields):
                self.task["evidence"] = [dict(self.evidence, type=kind, **fields)]
                self.check("V4", "FAIL")

    def test_passing_rerun_supersedes_failed_observation_in_time_order(self):
        self.task["status"] = "done"
        fail = dict(self.evidence, type="test_signal", ref="ci/100", note="4 tests failed")
        passed = dict(fail, ref="ci/101", note="Rerun passed, 0 failed.")
        for history, expected in (
                ([passed], "PASS"), ([fail, passed], "PASS"), ([passed, fail], "FAIL"),
                ([dict(passed, observed_at="2026-01-02"), fail], "PASS"),
                ([dict(fail, observed_at="2026-01-03"), passed], "FAIL"),
                ([dict(fail, note="First attempt failed; rerun passed.")], "PASS"),
                ([dict(fail, note="Tests did not pass initially; passed on rerun.")], "PASS"),
                ([dict(fail, note="Rerun passed, but final acceptance failed.")], "FAIL"),
                ([dict(passed, note="22 tests passed with no failures.")], "PASS")):
            with self.subTest(history=history):
                self.task["evidence"] = history
                self.check("V4", expected)

    def test_superseded_requires_known_other_successors_in_refs(self):
        self.task.update(status="superseded", evidence=[self.evidence])
        self.check("V4", "FAIL")
        other = item("task", "Replacement check", objective_id=self.obj["id"])
        self.state["tasks"].append(other)
        self.state["open_questions"] = [dict(item("question", "Which successor?"), status="open")]
        for refs in (None, [], other["id"], [None], [{}], [self.task["id"]],
                     [other["id"], self.task["id"]], ["TSK-FFFFFFFF"],
                     [other["id"], "DOC.md:4"], [self.state["open_questions"][0]["id"]]):
            with self.subTest(refs=refs):
                self.task["refs"] = refs
                self.check("V4", "FAIL")
        for refs in ([other["id"]], [other["id"], self.obj["id"]]):
            self.task["refs"] = refs
            self.check("V4", "PASS")
        self.task["evidence"] = []
        self.check("V4", "FAIL")

    def test_cli_holds_both_reported_regressions(self):
        for status, evidence in (
                ("done", dict(self.evidence, type="test_signal", note="The tests failed.")),
                ("superseded", self.evidence)):
            self.obj.update(status=status, evidence=[evidence])
            self.save()
            result = cli("validate_compass.py", "--root", self.root, "--json")
            report = json.loads(result.stdout)
            self.assertEqual((result.returncode, report["gate"], report["failed"]), (1, "HOLD", ["V4"]))

    def test_two_same_day_reports_must_exist_and_match_their_receipts(self):
        runs = self.files / "runs"
        (runs / "run-1.json").unlink()
        history = self.files / "RUN-HISTORY.md"
        rows = ["| run | mode | summary | report |"]
        for suffix in ("", "-2"):
            key = "run-20261124T063000Z" + suffix
            ref = ".compass/reports/delta-" + key + ".md"
            report_file = self.root / ref
            report_file.write_text("Run " + key + "\n")
            write(runs / (key + ".json"), dict(schema="okhp3.compass.run/1", run_id=key, report=ref))
            rows.append("| %s | reassess | review | %s |" % (key, ref))
        history.write_text("\n".join(rows) + "\n")
        self.state.update(runs=2, last_run_id=key)
        self.check("V9", "PASS")
        report_file.unlink()
        self.check("V9", "FAIL")
        report_file.write_text("Run run-20261124T063000Z\n")
        self.check("V9", "FAIL")

    def test_drift_and_question_references_and_ids(self):
        question = dict(item("question", "Confirm purpose"), status="open")
        self.state["open_questions"] = [question]
        drift = dict(id=ids.mint("demo", "drift", "Intent changed"), kind="changed_goal",
                     summary="Intent changed", refs=[question["id"], "README.md:1"])
        self.state["drift"] = [drift]
        self.check("V2", "PASS")
        self.check("V3", "PASS")
        drift["refs"].append("DRF-00008888")
        self.check("V3", "FAIL")
        self.state["drift"].append(drift.copy())
        self.check("V2", "FAIL")
        drift["id"] = question["id"]
        self.assertFalse(ids.verify(self.state)["ok"])

    def test_salted_and_renamed_ids_stay_valid(self):
        obj = self.obj.copy()
        obj["id"] = ids.mint("demo", "objective", obj["title"], [obj["id"]])
        self.state["objectives"].append(obj)
        self.check("V2", "PASS")
        obj.update(title="Ship revised example", renamed_from=[obj["title"]])
        self.check("V2", "WARN")
        obj["title_hash"] = ids.title_hash("demo", "objective", obj["title"])
        self.check("V2", "PASS")

    def test_typed_parents_and_orphan_reasons(self):
        self.task["objective_id"] = self.task["id"]
        self.check("V3", "FAIL")
        self.task.pop("objective_id")
        self.task.update(orphan=True, parent_id=self.obj["id"])
        self.check("V3", "FAIL")
        self.task.pop("parent_id")
        self.check("V3", "FAIL")
        self.task.update(orphan_reason="Awaiting decision")
        self.check("V3", "PASS")
        self.task["objective_id"] = self.obj["id"]
        self.check("V3", "FAIL")

    def test_deep_parent_chain_and_cycle(self):
        chain = [self.task]
        for i in range(1200):
            chain.append(item("task", "step %d" % i, parent_id=chain[-1]["id"]))
        self.state["tasks"] = chain[::-1]
        self.check("V3", "PASS")
        self.task["parent_id"] = chain[-1]["id"]
        self.check("V3", "FAIL")

    def test_malformed_shapes_return_report(self):
        self.save()
        for value in (None, [], 42, {"objectives": [False], "tasks": "invalid", "mode": []},
                      dict(self.state, tasks=[dict(self.task, id=[], status={}, objective_id=[],
                                                   parent_id={}, evidence=[None])],
                           mode={"history": [5], "detected": ["A"]})):
            with self.subTest(shape=type(value).__name__):
                write(self.files / "objectives.json", value)
                result = cli("validate_compass.py", "--root", self.root, "--json")
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertEqual(len(json.loads(result.stdout)["checks"]), 11)
                self.assertEqual(result.stderr, "")

    def test_invalid_state_files_and_standalone_id_cli(self):
        self.save()
        for data in ("[", "null", '{"project_key":"demo","drift":[null]}', "[" * 2000 + "]" * 2000):
            (self.files / "objectives.json").write_text(data)
            result = cli("compass_ids.py", "verify", "--state", self.files / "objectives.json")
            self.assertEqual(result.returncode, 1)
            self.assertFalse(json.loads(result.stdout)["ok"])

    def test_firewall_scans_late_nested_reports_without_leaking_terms(self):
        terms = "unlisted-private-word"
        self.config["scope_firewall"] = {"deny_terms_file": ".compass/private-words.txt"}
        (self.files / "private-words.txt").write_text("# local\n" + terms + "\n")
        reports = self.files / "reports"
        for i in range(51):
            (reports / str(i)).write_text("ok")
        (reports / "zzz").mkdir()
        write(reports / "zzz" / (terms + ".json"), {"data": terms})
        result = self.report()
        self.assertIn("V7", result["failed"])
        self.assertNotIn(terms, json.dumps(result))
        self.assertNotIn(str(self.root), json.dumps(result))
        (reports / "zzz" / (terms + ".json")).unlink()
        self.check("V7", "PASS")

    def test_style_on_decoded_json_and_signed_blocks(self):
        self.obj["source"] = "before\u2014after"
        self.check("V8", "FAIL")
        self.obj["source"] = "README.md"
        with (self.root / "charter.md").open("a") as fh:
            fh.write("<!-- compass:end:x -->\n<!-- compass:begin:x -->\n")
        self.check("V8", "FAIL")

    def test_owner_selected_report_is_in_firewall_scope(self):
        rel = "outside-compass-report.md"
        (self.root / rel).write_text("Run run-1\nInternal use only\n")
        write(self.files / "runs/run-1.json", dict(schema="okhp3.compass.run/1", run_id="run-1",
                                                   report=rel))
        history = self.files / "RUN-HISTORY.md"
        history.write_text(history.read_text().replace(".compass/reports/r.md", rel))
        self.check("V9", "PASS")
        self.check("V7", "FAIL")

    def test_unsafe_artifact_and_deny_paths(self):
        outside = self.root.parent / "outside"
        outside.write_text("private-sentinel")
        (self.files / "outside-link").symlink_to(outside)
        self.state["charter_ref"] = "../outside"
        self.config["scope_firewall"] = {"deny_terms_file": str(outside)}
        result = self.report()
        self.assertTrue({"V5", "V7"}.issubset(result["failed"]))
        self.assertNotIn("private-sentinel", json.dumps(result))
        self.assertNotIn(str(outside), json.dumps(result))

    @unittest.skipUnless(hasattr(os, "mkfifo"), "requires named pipes")
    def test_fifo_returns_promptly_for_both_clis(self):
        self.save()
        path = self.files / "objectives.json"
        path.unlink()
        os.mkfifo(path)
        for name, args in (("validate_compass.py", ["--root", self.root, "--json"]),
                           ("compass_ids.py", ["verify", "--state", path])):
            result = cli(name, *args)
            self.assertEqual(result.returncode, 1)
            self.assertIsInstance(json.loads(result.stdout), dict)

    def test_mirror_bodies_and_unknown_markers(self):
        self.state["mode"]["detected"] = "A"
        self.config["github"] = {"owner_repo": "sample/demo"}
        index = {"schema": "okhp3.compass.github-index/1", "owner_repo": "sample/demo",
                 "milestones": {}, "issues": {}, "unmatched_remote": {}}
        path = self.files / "github-index.json"
        write(path, index)
        self.check("V11", "WARN")
        index["unmatched_remote"] = {"issues": [{"body": "x"}]}
        write(path, index)
        self.check("V11", "FAIL")
        index.update(unmatched_remote={}, issues={"TSK-00000000": {}})
        write(path, index)
        self.check("V11", "FAIL")

    def test_init_preserves_ignore_and_accepts_both_option_orders(self):
        root = self.root.parent / "New Example Folder"
        directory = root / ".compass"
        directory.mkdir(parents=True)
        ignore = directory / ".gitignore"
        original = b"*.scratch\r\n!deny-terms.local.txt"
        ignore.write_bytes(original)
        self.assertEqual(cli("compass_state.py", "init", "--root", root).returncode, 0)
        self.assertEqual(ignore.read_bytes(), original)
        self.assertEqual(cli("compass_state.py", "--root", root, "init", "--apply").returncode, 0)
        saved = ignore.read_bytes()
        self.assertTrue(saved.startswith(original + b"\r\n"))
        config = json.loads((directory / "config.json").read_text())
        self.assertEqual(config["project_key"], "new-example-folder")
        self.assertEqual(config["sinks"], [dict(id="files", type="files", enabled=True)])
        self.assertFalse((directory / "deny-terms.local.txt").exists())
        self.assertEqual(cli("compass_state.py", "--apply", "init", "--root", root).returncode, 0)
        self.assertEqual(ignore.read_bytes(), saved)
        existing = directory / "objectives.json"
        original_state = json.loads(existing.read_bytes())
        original_state["objectives"] = [dict(self.obj, title="Owner decision")]
        write(existing, original_state)
        before = {f.name: f.read_bytes() for f in directory.iterdir() if f.is_file()}
        for options in ([], ["--apply"]):
            refused = cli("compass_state.py", "init", "--root", root, "--force", *options)
            self.assertEqual(refused.returncode, 3)
            self.assertEqual(before, {f.name: f.read_bytes() for f in directory.iterdir() if f.is_file()})
        if shutil.which("git"):
            subprocess.run(["git", "-C", str(root), "init", "-q"], check=True)
            result = subprocess.run(["git", "-C", str(root), "check-ignore", "--no-index", "-q",
                                     ".compass/deny-terms.local.txt"], timeout=5)
            self.assertEqual(result.returncode, 0)

    def test_manifest_and_drift_exclude_sensitive_paths_before_hashing(self):
        self.config["scope_firewall"] = {"deny_terms_file": "local-list.txt"}
        self.save()
        (self.root / "local-list.txt").write_text("private-sentinel")
        secret_paths = [".env", ".env.local", "Internal use only.txt", "internal_use_only-record",
                        "child/private-sentinel/old.txt", "local-list.txt"]
        for rel in secret_paths[:-1]:
            path = self.root / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("fixture")
        (self.root / "visible.md").write_text("ok")
        result = cli("compass_state.py", "--root", self.root, "baseline", "--apply")
        self.assertEqual(result.returncode, 0, result.stderr)
        baseline = self.files / "baseline.json"
        manifest = json.loads(baseline.read_bytes())
        self.assertIn("visible.md", manifest["files"])
        self.assertTrue(set(secret_paths).isdisjoint(manifest["files"]))
        # Old manifests can contain inaccessible or since-deleted private paths.
        manifest["files"].update({rel: {"bytes": 0, "sha": "0" * 16} for rel in secret_paths})
        manifest["file_count"] = len(manifest["files"])
        manifest["git_head"] = "0" * 40
        write(baseline, manifest)
        self.check("V7", "FAIL")
        git_date = "2026-01-01T00:00:00Z"
        def git_log(root, *args):
            self.assertEqual(args, ("log", "0" * 40 + "..HEAD", "--format=%H%x1f%aI"))
            return "1" * 40 + "\x1f" + git_date

        output = io.StringIO()
        with redirect_stdout(output), patch.object(compass_state, "git", side_effect=git_log):
            self.assertEqual(compass_state.main(["--root", str(self.root), "drift"]), 0)
        drift = json.loads(output.getvalue())
        for rel in secret_paths:
            self.assertNotIn(rel, output.getvalue())
        self.assertEqual(drift["commits_since_baseline"], [{"sha": "1" * 12, "date": git_date}])
