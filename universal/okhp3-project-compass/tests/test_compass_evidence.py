"""Offline CLI regressions for scan evidence, GitHub identity and plan integrity."""
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
REPO = "example-fixtures/widgets"
OBJ = "OBJ-1234ABCD"
TASK = "TSK-1234ABCD"


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve()
        self.root = self.base / "project"
        self.root.mkdir()
        self.bin = self.base / "bin"
        self.bin.mkdir()
        git = shutil.which("git")
        if git:
            (self.bin / "git").symlink_to(git)
        self.env = dict(os.environ, PATH=str(self.bin), GIT_CONFIG_GLOBAL=os.devnull,
                        GIT_CONFIG_NOSYSTEM="1", LC_ALL="C", PYTHONDONTWRITEBYTECODE="1")
        self.log = self.base / "gh-log"
        gh = self.bin / "gh"
        gh.write_text(f"#!{sys.executable}\nfrom pathlib import Path\n"
                      f"Path({str(self.log)!r}).touch()\nraise SystemExit(99)\n")
        gh.chmod(0o700)

    def cli(self, script, *args, success=True):
        result = subprocess.run([sys.executable, "-B", str(SCRIPTS / (script + ".py")), *map(str, args)],
                                cwd=self.base, env=self.env, capture_output=True, text=True, timeout=20)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
        return result

    def git(self, *args):
        if not (self.bin / "git").exists():
            self.skipTest("git unavailable")
        subprocess.run(["git", "-C", str(self.root), *args], env=self.env, check=True,
                       capture_output=True)

    def write(self, name, data):
        out = self.root / name
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(data if isinstance(data, str) else json.dumps(data))
        return out

    def detect(self, root=None, *args):
        return json.loads(self.cli("detect_mode", "--root", root or self.root, *args).stdout)

    def test_root_tracking_filters_content_and_own_outputs(self):
        self.write("BACKLOG.md", "# Goals\nPurpose private prose\nTODO: manual review\n")
        self.write("adr/0001-spec.md", "ok")
        self.write("README.md", "# Goals TODO Confidential CANARY\n"
                   "https://docs.notion.site/CANARY?q=CANARY#CANARY\n"
                   "https://other.example/github.com/CANARY\n"
                   "<!-- compass:begin:test -->\nTODO CANARY\n<!-- compass:end:test -->\n")
        self.write("app/config.yaml", "api_key: CANARY\n")
        self.write(".compass/sealed.md", "# Goals TODO CANARY")
        self.write("hidden.txt", "CANARY\n")
        self.write("CANARY-project.md", "private path")
        self.write(".env", "api_key=CANARY")
        self.write("nested/.git", "gitdir: other")
        self.write("nested/ROADMAP.md", "TODO outside")
        outside = self.base / "outside.md"
        outside.write_text("# Goals TODO CANARY")
        (self.root / "CHARTER.md").symlink_to(outside)
        (self.root / "linked").symlink_to(self.base, target_is_directory=True)
        os.mkfifo(self.root / "fifo.md")
        out = self.write("last-scan.json", "TODO previous report")
        args = ["--root", self.root, "--deny-terms-file", "hidden.txt", "--out", out.name]
        self.cli("scan_repo", *args)
        first = json.loads(out.read_text())
        self.cli("scan_repo", *args)
        second = json.loads(out.read_text())
        first.pop("generated_at")
        second.pop("generated_at")
        self.assertEqual(first, second)
        for token in ("CANARY", ".env", "private prose", "nested/", "hidden.txt", "last-scan",
                      "linked/", "CHARTER.md", "fifo.md", ".compass/sealed"):
            self.assertNotIn(token, json.dumps(first))
        self.assertEqual(first["inventory"]["file_count"], 4)
        self.assertEqual(set(first["tracking_artifacts"]), {"adr", "backlog"})
        self.assertEqual(first["open_work_markers"], [{"kind": "TODO", "line": 3, "path": "BACKLOG.md"}])
        self.assertTrue(first["scope_firewall_hits"])
        self.assertTrue(all(set(hit) == {"path", "line", "detector"} for hit in first["scope_firewall_hits"]))
        self.assertEqual(first["external_sinks"], {})  # the sole genuine sink line hit the deny list
        self.write("links.md", "https://demo.notion.site/private?opaque=HiddenQuery#HiddenAnchor\n"
                   "https://github.com.example.test/hi https://example.test/path/github.com")
        doc = json.loads(self.cli("scan_repo", "--root", self.root).stdout)
        self.assertEqual(doc["external_sinks"], {"notion.site": [{"referenced_in": ["README.md", "links.md"]}]})
        self.assertNotIn("HiddenQuery", json.dumps(doc))

    def test_outputs_stay_beneath_project(self):
        (self.root / "elsewhere").symlink_to(self.base, target_is_directory=True)
        self.write("nested/.git", "gitdir: broken")
        for script in ("scan_repo", "detect_mode"):
            for path in ("../escaped.json", "elsewhere/escaped.json", "nested/escaped.json", ".git/config"):
                with self.subTest(script=script, path=path):
                    self.assertNotEqual(self.cli(script, "--root", self.root, "--out", path,
                                                 success=False).returncode, 0)
        self.assertFalse((self.base / "escaped.json").exists())
        self.assertFalse((self.root / "nested/escaped.json").exists())

    def test_real_origin_credentials_worktree_and_false_signals(self):
        self.git("init", "-q")
        raw = "https://operator:PrivateCanary%25@github.com/" + REPO + ".git"
        self.git("remote", "add", "origin", raw)
        doc = self.detect()
        self.assertEqual((doc["mode"], doc["owner_repo"]), ("A", REPO))
        self.assertFalse(doc["github_api"]["usable"])
        for evidence in (json.dumps(doc), self.cli("scan_repo", "--root", self.root).stdout):
            self.assertNotIn("PrivateCanary", evidence)
            self.assertNotIn("operator:", evidence)
        linked = self.base / "linked-tree"
        # Real Git worktree registration, with no commits or network.
        result = subprocess.run(["git", "-C", str(self.root), "worktree", "add", "--orphan", "-b",
                                 "linked", str(linked)], env=self.env, capture_output=True)
        if result.returncode == 0:
            self.assertEqual(self.detect(linked)["owner_repo"], REPO)
        fake = self.base / "copied-tree"
        fake.mkdir()
        (fake / ".git").write_text("gitdir: " + str(self.root / ".git"))
        self.assertEqual(self.detect(fake)["mode"], "B")
        sub = self.root / "child"
        sub.mkdir()
        self.assertFalse(json.loads(self.cli("scan_repo", "--root", sub).stdout)["git"]["is_repo"])
        self.write("README.md", "https://github.com/example-fixtures/other")
        for raw in ("https://example.test/https://github.com/" + REPO,
                    "git@github.com.evil.example:" + REPO,
                    "https://github.com/" + REPO + "?q=1", "https://github.com/owner/.."):
            self.git("remote", "set-url", "origin", raw)
            doc = self.detect(self.root, "--check-gh")
            self.assertEqual((doc["mode"], doc["owner_repo"]), ("B", None))
        self.git("remote", "set-url", "origin", "git@github.com:" + REPO)
        self.git("remote", "set-url", "--push", "origin", "git@github.com:elsewhere/other")
        self.assertEqual(self.detect()["mode"], "B")
        self.assertFalse(self.log.exists())

    def test_recorded_a_survives_unavailable_git_but_verified_demotion_wins(self):
        self.git("init", "-q")
        self.git("remote", "add", "origin", "https://github.com/" + REPO + ".git")
        self.cli("detect_mode", "--root", self.root, "--out", ".compass/mode.json")
        state = self.state()
        state["mode"] = {"detected": "A", "sub_case": "github-origin", "owner_repo": REPO}
        self.write(".compass/objectives.json", state)
        git = self.bin / "git"
        real = git.readlink()
        git.unlink()
        prior = self.detect(self.root, "--check-gh")
        self.assertEqual((prior["mode"], prior["owner_repo"], prior["origin_verified"]), ("A", REPO, False))
        self.assertIn("unverified", prior["github_api"]["note"].lower())
        self.assertFalse(prior["github_api"]["usable"])
        self.assertEqual(self.sync("pull")["actions"], [])
        (self.root / ".compass/mode.json").unlink()
        self.assertEqual(self.detect()["mode"], "A")  # objectives-only historical evidence
        state["mode"] = {"detected": None}
        self.write(".compass/objectives.json", state)
        self.assertEqual(self.detect()["mode"], "B")
        state["mode"] = {"detected": "A", "sub_case": "github-origin", "owner_repo": REPO}
        self.write(".compass/objectives.json", state)
        git.symlink_to(real)
        self.git("remote", "set-url", "origin", "https://gitlab.com/example-fixtures/widgets.git")
        current = self.detect(self.root, "--check-gh")
        self.assertEqual((current["mode"], current["sub_case"], current["owner_repo"]),
                         ("B", "git-non-github", None))
        self.assertFalse(self.log.exists())

    def test_unchecked_roadmap_rows_are_private_line_pointers(self):
        self.write("docs/ROADMAP.md", "# Roadmap\n- [ ] first private title\n"
                   "  * [ ] second private title\n1. [ ] TODO third private title\n"
                   "- [X] TODO already done\n```md\n- [ ] illustrative only\n```\n"
                   "| [ ] | fourth private title |\n"
                   "<!-- compass:begin:r -->\n- [ ] generated\n<!-- compass:end:r -->\n")
        doc = json.loads(self.cli("scan_repo", "--root", self.root).stdout)
        self.assertEqual(doc["open_work_marker_total"], 4)
        self.assertEqual(doc["open_work_markers"], [
            {"kind": "unchecked-checkbox", "path": "docs/ROADMAP.md", "line": n} for n in (2, 3, 4, 9)])
        self.assertNotIn("private title", json.dumps(doc))

    def state(self):
        self.cli("compass_state", "--root", self.root, "--apply", "init", "--project-key", "demo")
        doc = json.loads((self.root / ".compass/objectives.json").read_text())
        doc["objectives"] = [{"id": OBJ, "title": "Owner's plan & checklist", "status": "active"}]
        doc["tasks"] = [{"id": TASK, "title": "Handle file", "status": "done"}]
        self.write(".compass/objectives.json", doc)
        self.cli("compass_state", "--root", self.root, "--apply", "baseline")
        return doc

    def fixture(self):
        return {"owner_repo": REPO, "complete": True, "milestones": [], "issues": [
            {"number": 6, "title": "Remote task", "body": "BodyCanary <!-- compass-id: %s -->" % TASK,
             "state": "OPEN", "labels": []}]}

    def sync(self, verb, *args, repo=REPO):
        return json.loads(self.cli("github_sync", verb, "--root", self.root, "--repo", repo, *args).stdout)

    def pull(self, data):
        self.write("fixture.json", data)
        return self.sync("pull", "--fixture", "fixture.json", "--apply")

    def test_complete_fixture_is_repeatable_and_rendering_never_calls_gh(self):
        self.state()
        self.pull(self.fixture())
        path = self.root / ".compass/github-index.json"
        first = path.read_bytes()
        self.assertNotIn(b"BodyCanary", first)
        a = self.sync("plan")
        self.assertTrue(a["simulation"])
        self.assertEqual([x["op"] for x in a["actions"]], ["create-milestone", "close-issue"])
        self.pull(self.fixture())
        self.assertEqual(path.read_bytes(), first)
        self.assertEqual(a, self.sync("plan"))
        for flags in ([], ["--apply"], ["--authorized"]):
            self.assertEqual(self.cli("github_sync", "push", "--root", self.root, "--repo", REPO,
                                      *flags, success=False).returncode, 3)
        rendered = self.sync("push", "--apply", "--authorized")
        self.assertFalse(rendered["executed"])
        for row in rendered["commands"]:
            self.assertEqual(shlex.split(row["command"]), row["argv"])
        self.assertIn("title=Owner's plan & checklist", rendered["commands"][0]["argv"])
        self.assertFalse(self.log.exists())

    def test_authorized_render_checks_current_adopted_charter_with_v7_only(self):
        state = self.state()
        config = json.loads((self.root / ".compass/config.json").read_text())
        charter = "notes/adopted-charter.md"
        config["human_artifacts"]["charter"] = charter
        state["charter_ref"] = charter
        self.write(".compass/config.json", config)
        self.write(".compass/objectives.json", state)
        self.write(charter, "# Charter\nAn incomplete draft.\n")
        self.pull(self.fixture())
        validation = self.cli("validate_compass", "--root", self.root, "--json", success=False)
        report = json.loads(validation.stdout)
        self.assertEqual(report["gate"], "HOLD")
        self.assertEqual(next(c["status"] for c in report["checks"] if c["id"] == "V7"), "PASS")
        self.assertTrue(self.sync("push", "--apply", "--authorized")["commands"])
        self.write(charter, "# Charter\nInternal use only: CanaryPrivateCharter.\n")
        self.assertTrue(self.sync("plan")["actions"])
        attempted = self.cli("github_sync", "push", "--root", self.root, "--repo", REPO,
                             "--apply", "--authorized", success=False)
        blocked = json.loads(attempted.stdout)
        self.assertNotEqual(attempted.returncode, 0)
        self.assertTrue(blocked["blocked"])
        self.assertEqual(blocked["check"], "V7")
        self.assertEqual(blocked["commands"], [])
        self.assertFalse(blocked["executed"])
        self.assertNotIn("CanaryPrivateCharter", attempted.stdout + attempted.stderr)
        self.assertFalse(self.log.exists())

    def test_issue_creation_binds_direct_and_inherited_milestones_by_number(self):
        state = self.state()
        child = "TSK-ABCDEF12"
        state["tasks"][0].update(status="active", objective_id=OBJ)
        state["tasks"].append({"id": child, "title": "Child's next step", "status": "active", "parent_id": TASK})
        state["objectives"][0]["github"] = {"milestone_number": 17}
        self.write(".compass/objectives.json", state)
        snapshot = self.fixture()
        snapshot["issues"] = []
        milestone = {"number": 17, "title": "Renamed remote milestone", "state": "open",
                     "description": "<!-- compass-id: %s -->" % OBJ, "open_issues": 0, "closed_issues": 0}
        snapshot["milestones"] = [dict(milestone, number=2, title=state["objectives"][0]["title"],
                                       description=""), milestone]
        self.pull(snapshot)
        creates = [a for a in self.sync("plan")["actions"] if a["op"] == "create-issue"]
        self.assertEqual([(a["id"], a["objective_id"], a["milestone_number"]) for a in creates],
                         [(TASK, OBJ, 17), (child, OBJ, 17)])
        commands = self.sync("push", "--apply", "--authorized")["commands"]
        self.assertEqual([c["id"] for c in commands], [TASK, child])
        for command in commands:
            argv = command["argv"]
            self.assertEqual(shlex.split(command["command"]), argv)
            self.assertIn("repos/" + REPO + "/issues", argv)
            self.assertEqual(argv[argv.index("-F") + 1], "milestone=17")
            self.assertIn("body=<!-- compass-id: %s -->" % command["id"], argv)
        self.assertFalse(self.log.exists())

    def test_uncreated_parent_yields_manual_dependency_until_refreshed(self):
        state = self.state()
        state["tasks"][0].update(status="active", objective_id=OBJ)
        self.write(".compass/objectives.json", state)
        snapshot = self.fixture()
        snapshot["issues"] = []
        self.pull(snapshot)
        def handoff():
            return self.sync("push", "--apply", "--authorized")
        first = handoff()
        pending = next(a for a in first["actions"] if a["id"] == TASK)
        self.assertEqual((pending["op"], pending["objective_id"]), ("manual-dependency", OBJ))
        self.assertIn("pull --apply", pending["reason"])
        self.assertEqual([c["op"] for c in first["commands"]], ["create-milestone"])
        snapshot["milestones"] = [{"number": 41, "title": "Milestone", "description": "<!-- compass-id: %s -->" % OBJ,
                                   "state": "open", "open_issues": 0, "closed_issues": 0}]
        self.pull(snapshot)
        second = handoff()
        self.assertEqual([c["op"] for c in second["commands"]], ["create-issue"])
        self.assertIn("milestone=41", second["commands"][0]["argv"])
        self.assertFalse(self.log.exists())

    def test_bad_snapshots_cannot_revive_a_previous_plan(self):
        self.state()
        for variant in ("missing", "partial", "wrong_repo", "wrong_url", "duplicates", "two_markers",
                        "wrong_kind", "no_body", "unknown_state"):
            with self.subTest(variant=variant):
                self.pull(self.fixture())
                data = self.fixture()
                row = data["issues"][0]
                if variant == "missing":
                    del data["milestones"]
                elif variant == "partial":
                    data["complete"] = False
                elif variant == "wrong_repo":
                    data["owner_repo"] = "example-fixtures/other"
                elif variant == "wrong_url":
                    row["url"] = "https://github.com/example-fixtures/other/issues/6"
                elif variant == "duplicates":
                    data["issues"].append(dict(row, number=7))
                elif variant == "two_markers":
                    row["body"] *= 2
                elif variant == "wrong_kind":
                    row["body"] = "<!-- compass-id: %s -->" % OBJ
                elif variant == "no_body":
                    del row["body"]
                else:
                    row["state"] = None
                self.assertEqual(self.pull(data)["actions"], [])
                self.assertEqual(self.sync("plan")["actions"], [])
                self.assertFalse(self.sync("push", "--apply", "--authorized").get("commands"))

    def test_paginated_get_only_transport_and_metadata_redaction(self):
        self.state()
        self.git("init", "-q")
        self.git("remote", "add", "origin", "git@github.com:" + REPO)
        program = self.bin / "gh"
        program.write_text(f"#!{sys.executable}\n" + """
import json, os, sys
from pathlib import Path
args = sys.argv[1:]
with Path(os.environ["TRANSPORT_LOG"]).open("a") as f:
    f.write(json.dumps(args) + chr(10))
if args[:5] != ["api", "--hostname", "github.com", "--method", "GET"]:
    raise SystemExit(3)
if args[-1] == "repos/example-fixtures/widgets":
    print(json.dumps({"full_name": "example-fixtures/widgets"}))
elif args[5:7] != ["--paginate", "--slurp"]:
    raise SystemExit(4)
elif "/issues?" in args[-1]:
    print(json.dumps([[{"pull_request": {}}], [{"number": 8, "title": "Internal use only amber",
        "state": "open", "body": "body canary", "labels": [{"name": "PrivateTeamCanary"}]}]]))
elif "/milestones?" in args[-1]:
    print("[[]]")
else:
    raise SystemExit(5)
""")
        self.env["TRANSPORT_LOG"] = str(self.log)
        self.write(".compass/deny-terms.local.txt", "PrivateTeamCanary")
        result = self.sync("pull", "--apply")
        self.assertEqual(result["counts"], {"issues": 1, "milestones": 0})
        self.assertTrue(result["anomalies"])
        snapshot = (self.root / ".compass/github-index.json").read_text()
        for term in ("Internal use only", "amber", "PrivateTeamCanary", "body canary"):
            self.assertNotIn(term, snapshot)
        calls = self.log.read_bytes()
        self.assertEqual(len(calls.splitlines()), 3)
        self.assertEqual(self.sync("plan")["actions"], [])
        self.assertFalse(self.sync("push", "--apply", "--authorized").get("commands"))
        self.assertEqual(calls, self.log.read_bytes())

    def test_mismatched_and_partial_disk_state(self):
        state = self.state()
        self.pull(self.fixture())
        self.assertFalse(self.sync("plan", repo="other/target")["actions"])
        path = self.root / ".compass/github-index.json"
        index = json.loads(path.read_text())
        index["issues"].clear()
        self.write(".compass/github-index.json", index)
        self.assertEqual(self.sync("plan")["actions"], [])
        self.pull(self.fixture())
        state["tasks"].append(state["tasks"][0])
        self.write(".compass/objectives.json", state)
        self.assertEqual(self.sync("plan")["actions"], [])
        self.assertFalse(self.log.exists())


if __name__ == "__main__":
    unittest.main()
