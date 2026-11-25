"""State CLI regressions on synthetic temporary directories. Run with unittest discover."""
from contextlib import redirect_stderr, redirect_stdout
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import compass_state as compass


class CompassStateTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.sandbox = Path(temp.name).resolve()
        self.root = self.sandbox / "project"
        self.root.mkdir()
        self.store = self.root / ".compass"
        self.history = self.store / "RUN-HISTORY.md"
        self.state = self.store / "objectives.json"
        self.baseline = self.store / "baseline.json"
        self.source = self.sandbox / "input"
        self.source.write_text("generated\n", encoding="utf-8")
        self.record = ["record-run", "--mode", "reassess"]

    def cli(self, *args, ok=True):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            code = compass.main(["--root", str(self.root), *map(str, args)])
        if ok:
            self.assertEqual(code, 0, err.getvalue())
        else:
            self.assertNotEqual(code, 0, out.getvalue())
            self.assertIn("REFUSED", err.getvalue())
        return out.getvalue()

    def block(self, name="doc.md", *options, ok=True):
        return self.cli("block", "--file", name, "--id", "test",
                        "--content-file", self.source, *options, ok=ok)

    def report(self, run_id="run-20250101T120000Z"):
        report = self.store / "reports" / ("delta-%s.md" % run_id)
        report.write_text("# Delta\n\nRun %s - reassess - since yesterday\n" % run_id)
        return report.relative_to(self.root).as_posix()

    def v9(self):
        from validate_compass import validate
        return next(c["status"] for c in validate(self.root)["checks"] if c["id"] == "V9")

    def snapshot(self):
        return {p.relative_to(self.root): (p.read_bytes() if p.is_file() else None)
                for p in self.root.rglob("*") if not p.is_symlink()}

    def test_init_cli_preview_and_repeat(self):
        self.cli("init")
        self.assertEqual(list(self.root.iterdir()), [])
        self.cli("init", "--apply", "--root", self.root)
        snapshot = self.snapshot()
        self.cli("--apply", "init")
        self.cli(*self.record)
        self.cli("baseline")
        self.block()
        self.assertEqual(self.snapshot(), snapshot)
        claims = json.loads(self.state.read_bytes())["intent"]["claims"]
        self.assertEqual({c["field"] for c in claims}, {"purpose", "mission", "vision"})
        self.assertTrue(all(c["confidence"] == "unknown" and c["text"] is None
                            and c["evidence"] == [] for c in claims))

    def test_ignore_rule_is_additive_and_idempotent(self):
        self.store.mkdir()
        path = self.store / ".gitignore"
        original = b"# mine\r\n*.txt\r\n!deny-terms.local.txt"
        path.write_bytes(original)
        self.cli("init", "--apply")
        expected = original + b"\r\n/deny-terms.local.txt\r\n"
        self.assertEqual(path.read_bytes(), expected)
        self.cli("init", "--apply")
        self.assertEqual(path.read_bytes(), expected)

    def test_unsafe_paths_and_non_regular_files(self):
        outside = self.sandbox / "outside"
        outside.mkdir()
        sentinel = outside / "value"
        sentinel.write_text("preserve")
        (self.root / "linked").symlink_to(outside, target_is_directory=True)
        (self.root / "dangling").symlink_to(outside / "absent")
        (self.root / "link").symlink_to(sentinel)
        os.link(sentinel, self.root / "alias")
        nested = self.root / "nested"
        nested.mkdir()
        (nested / ".git").write_text("gitdir: /elsewhere")
        names = ["../outside/value", str(sentinel), "linked/value", "link", "alias",
                 "dangling", ".git/config", "nested/value", "C:\\escape", ".compass/config.json",
                 ".compass/RUN-HISTORY.md", ".compass/runs/x.md"]
        if hasattr(os, "mkfifo"):
            os.mkfifo(self.root / "pipe")
            names.append("pipe")
        for name in names:
            with self.subTest(name=name):
                self.block(name, "--apply", ok=False)
        self.assertEqual(sentinel.read_text(), "preserve")
        self.assertFalse((outside / "absent").exists())
        self.assertFalse((nested / "value").exists())
        self.assertFalse(self.store.exists())

    def test_state_path_refusal_precedes_all_writes(self):
        for child in ("", "objectives.json", "reports", ".gitignore", "RUN-HISTORY.md"):
            with self.subTest(child=child):
                if child:
                    self.store.mkdir(exist_ok=True)
                link = self.store / child
                link.symlink_to(self.sandbox / "missing")
                self.cli("--apply", "init", ok=False)
                link.unlink()
                if self.store.exists():
                    self.assertEqual(list(self.store.iterdir()), [])
        self.cli("--apply", "init")
        self.baseline.symlink_to(self.source)
        self.cli("baseline", "--apply", ok=False)
        self.cli("drift", ok=False)
        self.assertEqual(self.source.read_bytes(), b"generated\n")
        self.history.unlink()
        self.history.symlink_to(self.source)
        self.cli(*self.record, "--apply", ok=False)
        self.assertEqual(list((self.store / "runs").iterdir()), [])

    def test_block_checksums_byte_preservation_and_noop(self):
        doc = self.root / "doc.md"
        doc.write_bytes(b"before \t\r\n\r\n")
        doc.chmod(0o640)
        self.block("doc.md", "--apply")
        original = doc.read_bytes() + b"after\nwithout final newline "
        doc.write_bytes(original)
        before = doc.stat()
        self.block("doc.md", "--apply")
        self.assertEqual((doc.stat().st_ino, doc.stat().st_mtime_ns),
                         (before.st_ino, before.st_mtime_ns))
        self.source.write_text("v2\nnext")
        self.block("doc.md", "--apply")
        new = doc.read_bytes()
        self.assertTrue(new.startswith(b"before \t\r\n\r\n<!-- compass:begin:test -->\r\n"))
        self.assertIn(b"v2\r\nnext\r\n", new)
        self.assertTrue(new.endswith(b"<!-- compass:end:test -->\r\nafter\nwithout final newline "))
        self.assertEqual(doc.stat().st_mode & 0o777, 0o640)
        edited = new.replace(b"v2", b"my correction")
        doc.write_bytes(edited)
        self.block("doc.md", "--apply", ok=False)
        self.assertEqual(doc.read_bytes(), edited)

    def test_unsigned_blocks_require_exact_match_to_adopt(self):
        doc = self.root / "doc.md"
        legacy = b"<!-- compass:begin:test -->\nlegacy\n<!-- compass:end:test -->"
        doc.write_bytes(legacy)
        self.block("doc.md", "--apply", ok=False)
        self.assertEqual(doc.read_bytes(), legacy)
        self.source.write_text("legacy")
        self.block("doc.md", "--apply")
        self.assertIn(b"compass:sha256:", doc.read_bytes())
        self.source.write_text("approved update")
        self.block("doc.md", "--apply")
        self.assertIn(b"approved update", doc.read_bytes())

    def test_malformed_or_ambiguous_markers_and_proposed_content(self):
        doc = self.root / "doc.md"
        begin, end = compass.BEGIN % "x", compass.END % "x"
        for lines in ([begin], [end], [end, begin], [begin, begin, end, end],
                      [begin, compass.END % "z"], [begin, end, begin, end],
                      [begin, compass.BEGIN % "z", compass.END % "z", end],
                      [begin + " extra", end], [begin, "<!-- compass:sha256:bad -->", end]):
            with self.subTest(lines=lines):
                text = "\n".join(lines)
                doc.write_text(text)
                self.block("doc.md", "--apply", ok=False)
                self.assertEqual(doc.read_text(), text)
        doc.write_text("mine")
        self.source.write_text(compass.END % "test")
        self.block("doc.md", "--apply", ok=False)
        self.cli("block", "--file", "doc.md", "--id", "bad -->", "--content-file",
                 self.source, "--apply", ok=False)
        self.assertEqual(doc.read_text(), "mine")

    def test_missing_corrupt_or_partial_json(self):
        self.assertTrue(json.loads(self.cli("drift"))["first_run"])
        self.cli(*self.record, "--apply", ok=False)
        self.cli("init", "--apply")
        for bad in (b"{", b"null", b"{}", b"[]", b'{"schema":"okhp3.compass.baseline/1"}'):
            self.baseline.write_bytes(bad)
            self.cli("drift", ok=False)
            self.cli("baseline", "--apply", ok=False)
            self.assertEqual(self.baseline.read_bytes(), bad)
        original = self.state.read_bytes()
        for bad in (b'{"runs":0,"runs":1}', b"{}", b"[]", b"{", b"\xff"):
            self.state.write_bytes(bad)
            snapshot = self.snapshot()
            self.cli(*self.record, "--apply", ok=False)
            self.cli("init", "--apply", ok=False)
            self.assertEqual(self.snapshot(), snapshot)
        self.state.write_bytes(original)
        self.state.unlink()
        self.cli("init", "--apply", ok=False)
        self.assertFalse(self.state.exists())

    def test_private_paths_are_filtered_before_hashing_and_from_legacy_drift(self):
        self.cli("init", "--apply")
        config_path = self.store / "config.json"
        config = json.loads(config_path.read_bytes())
        config["scope_firewall"]["deny_terms_file"] = "./rules/name-list.txt"
        config_path.write_text(json.dumps(config))
        deny_file = self.root / "rules/name-list.txt"
        deny_file.parent.mkdir()
        deny_file.write_text("# ignored comment\nProject Peony\n", encoding="utf-8")
        (self.store / "deny-terms.local.txt").write_text("Zephyr\n", encoding="utf-8")
        private = (".env", ".ENV.production", "keys/example.pem", "internal use only.txt",
                   "Internal/use_only/inside.md", "internal-use-only/linked/.git/config",
                   "drafts/PROJECT_PEONY.md", "peers/zePhYr/readme.md")
        for name in private:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("synthetic content")
        (self.root / "Environment.md").write_text("visible")
        prohibited = {self.root / name for name in private}

        open_path = Path.open

        def guarded_open(path, *args, **kwargs):
            self.assertNotIn(path, prohibited, "tried to open a restricted file")
            return open_path(path, *args, **kwargs)

        with patch.object(Path, "open", guarded_open):
            self.cli("baseline", "--apply")
            initial = json.loads(self.baseline.read_bytes())
            self.assertEqual(set(initial["files"]), {"Environment.md"})
            self.assertEqual(initial["nested_repos"], [])
            # A legacy baseline can contain restricted paths even after deletion.
            legacy_paths = (*private, "Rules/Name-List.txt", "archived/PROJECT PEONY/file.md")
            initial["files"].update({n: {"sha": "0" * 16, "bytes": 0} for n in legacy_paths})
            initial["file_count"] = len(initial["files"])
            initial["old_git_notes"] = "Private fixture note"
            self.baseline.write_text(json.dumps(initial))
            drift = self.cli("drift")
            self.assertEqual(json.loads(drift)["counts"]["removed"], 0)
            for name in legacy_paths:
                self.assertNotIn(name, drift)
            self.cli("baseline", "--apply")
            clean = json.loads(self.baseline.read_bytes())
            self.assertEqual(set(clean["files"]), {"Environment.md"})
            self.assertNotIn("old_git_notes", clean)

    def test_git_metadata_is_limited_to_object_ids_and_iso_dates(self):
        sha, date = "f" * 40, "2026-01-01T12:34:56+00:00"
        noise = "Internal use only: synthetic subject"
        with patch.object(compass, "git", side_effect=[sha, date + "\n" + noise]):
            self.cli("baseline", "--apply")
        baseline = json.loads(self.baseline.read_bytes())
        self.assertEqual(baseline["git_head"], sha)
        self.assertIsNone(baseline["git_last_commit"])
        # Only the expected metadata record may survive extra lines on stdout.
        log = "\n".join((sha + "\x1f" + date, sha + "\x1f" + noise,
                         noise + "\x1f" + date, noise, sha + "\x1f" + date + "\x1f" + noise))
        with patch.object(compass, "git", return_value=log) as git:
            output = self.cli("drift")
        git.assert_called_once_with(self.root, "log", sha + "..HEAD", "--format=%H%x1f%aI")
        self.assertEqual(json.loads(output)["commits_since_baseline"], [{"sha": sha[:12], "date": date}])
        self.assertNotIn(noise, output)
        with patch.object(compass, "git", side_effect=[noise, date]):
            self.cli("baseline", "--apply")
        baseline = json.loads(self.baseline.read_bytes())
        self.assertIsNone(baseline["git_head"])
        self.assertEqual(baseline["git_last_commit"], date)
        baseline["generated_at"] = noise
        self.baseline.write_text(json.dumps(baseline))
        self.cli("drift", ok=False)

    def test_new_keys_are_normalized_and_force_preserves_populated_state(self):
        self.cli("init", "--apply", "--project-key", "  Café   LAB / 42  ")
        paths = (self.store / "config.json", self.state)
        for path in paths:
            self.assertEqual(json.loads(path.read_bytes())["project_key"], "cafe-lab-42")
        self.cli(*self.record, "--report", self.report(), "--apply")
        state = json.loads(self.state.read_bytes())
        state["objectives"].append({"title": "Keep this decision"})
        self.state.write_text(json.dumps(state))
        before = self.snapshot()
        for flags in ((), ("--apply",)):
            self.cli("init", "--force", "--project-key", "new-owner", *flags, ok=False)
            self.assertEqual(self.snapshot(), before)
        self.cli("init", "--apply", "--project-key", "different")
        self.assertEqual(self.snapshot(), before)
        for folder, expected in (("Démo & Alpha", "demo-alpha"), ("!!!", "unnamed-project")):
            root = self.sandbox / folder
            root.mkdir()
            self.cli("init", "--root", root, "--apply")
            for filename in ("config.json", "objectives.json"):
                self.assertEqual(json.loads((root / ".compass" / filename).read_bytes())["project_key"],
                                 expected)

    def test_manifest_boundaries_large_file_and_legacy_baseline(self):
        self.cli("init", "--apply")
        for name in ("child/.git", "deeper/.compass", "node_modules", ".git"):
            (self.root / name).mkdir(parents=True)
            (self.root / name / "internal").write_bytes(b"internal")
        (self.root / ".env").write_text("synthetic setting")
        (self.store / "deny-terms.local.txt").write_text("privateword")
        (self.root / "privateword.txt").touch()
        (self.root / "child/project").write_bytes(b"private")
        worktree = self.root / "worktree"
        worktree.mkdir()
        (worktree / ".git").write_text("gitdir: fake")
        (worktree / "item").write_bytes(b"internal")
        (self.root / "alias").symlink_to(self.source)
        if hasattr(os, "mkfifo"):
            os.mkfifo(self.root / "pipe")
        large = self.root / "large"
        large.write_bytes(b"x" * 2_000_001)
        self.cli("baseline", "--apply")
        initial = self.baseline.read_bytes()
        old = json.loads(initial)
        self.assertEqual(set(old["files"]), {"large"})
        self.assertEqual(set(old["nested_repos"]), {"child", "worktree"})
        self.cli(*self.record, "--report", self.report(), "--apply")
        self.cli("baseline", "--apply")
        self.assertEqual(self.baseline.read_bytes(), initial)
        with large.open("r+b") as fh:
            fh.seek(1_000_000)
            fh.write(b"y")
        self.assertEqual(json.loads(self.cli("drift"))["changed"], ["large"])
        old["files"]["large"]["sha"] = "size:2000001"
        self.baseline.write_text(json.dumps(old))
        drift = json.loads(self.cli("drift"))
        self.assertEqual(drift["unverified"], ["large"])
        self.assertEqual(drift["changed"], [])
        large.write_bytes(b"shorter")
        self.assertEqual(json.loads(self.cli("drift"))["changed"], ["large"])

    def test_truncated_manifest_does_not_invent_addition_or_removal(self):
        with patch.object(compass, "MANIFEST_MAX_FILES", 1):
            (self.root / "b").touch()
            (self.root / "c").touch()
            self.cli("baseline", "--apply")
            (self.root / "a").touch()
            result = json.loads(self.cli("drift"))
        self.assertTrue(result["baseline_truncated"] and result["current_truncated"])
        self.assertEqual(result["added"], [])
        self.assertEqual(result["removed"], [])
        self.assertEqual(result["unverified"], ["b"])

    def test_same_second_runs_and_append_only_legacy_history(self):
        self.cli("init", "--apply")
        with patch.object(compass, "stamp", return_value="20250101T120000Z"):
            first_ref = self.report()
            second_ref = self.report("run-20250101T120000Z-2")
            self.cli(*self.record, "--apply")
            first = json.loads(self.state.read_bytes())["last_run_id"]
            first_path = self.store / "runs" / (first + ".json")
            first_record = first_path.read_bytes()
            old_history = ("# Runs\r\n\r\n| run | mode | summary | report |\r\n"
                           "|---|---|---|---|\r\n| %s | reassess | old | %s |\r\n" % (first, first_ref))
            self.history.write_bytes(old_history.encode())
            legacy = {"purpose": "original", "confidence": "declared", "evidence": []}
            state = json.loads(self.state.read_bytes())
            state["intent"] = legacy
            self.state.write_text(json.dumps(state))
            self.cli(*self.record, "--summary", "new|summary\nmore",
                     "--counts", '{"done":0}', "--apply")
        state = json.loads(self.state.read_bytes())
        self.assertEqual(state["runs"], 2)
        self.assertEqual(state["intent"], legacy)
        self.assertNotEqual(state["last_run_id"], first)
        self.assertEqual(first_path.read_bytes(), first_record)
        after = self.history.read_bytes()
        self.assertTrue(after.startswith(old_history.encode()))
        self.assertEqual(after.count(b"| run | mode |"), 2)
        self.assertEqual(after.splitlines()[-1].count(b"|"), 11)
        self.assertIn(("new/summary more | %s |" % second_ref).encode(), after)
        self.assertEqual(self.v9(), "PASS")
        (self.root / first_ref).unlink()
        self.assertEqual(self.v9(), "FAIL")
        self.cli("init", "--apply")

    def test_report_identity_is_verified_before_receipt_and_by_v9(self):
        self.cli("init", "--apply")
        ref = self.report()
        path = self.root / ref
        self.cli(*self.record, "--report", ref, "--apply")
        saved = self.snapshot()
        self.cli(*self.record, "--report", ref, "--apply", ok=False)
        self.assertEqual(self.snapshot(), saved)
        self.assertEqual(self.v9(), "PASS")
        path.write_text("Run run-other - reassess\n")
        self.assertEqual(self.v9(), "FAIL")
        self.cli(*self.record, "--report", ref, "--apply", ok=False)
        path.unlink()
        self.cli(*self.record, "--report", ref, "--apply", ok=False)
        self.assertEqual(self.v9(), "FAIL")
        path.symlink_to(self.source)
        self.assertEqual(self.v9(), "FAIL")
        for unsafe in (ref, "../input", str(self.source)):
            self.cli(*self.record, "--report", unsafe, "--apply", ok=False)
        self.assertEqual(len(list((self.store / "runs").iterdir())), 1)

    def test_damaged_history_blocks_subsequent_run(self):
        self.cli("init", "--apply")
        self.cli(*self.record, "--report", self.report(), "--apply")
        doc = json.loads(self.state.read_bytes())
        for field, value in (("last_run_id", "run-wrong"), ("runs", 0), ("runs", True)):
            self.state.write_text(json.dumps(dict(doc, **{field: value})))
            saved = self.snapshot()
            self.cli(*self.record, "--apply", ok=False)
            self.assertEqual(self.snapshot(), saved)
        self.state.write_text(json.dumps(doc))
        self.history.write_bytes(self.history.read_bytes().split(b"| run-")[0])
        saved = self.snapshot()
        self.cli(*self.record, "--apply", ok=False)
        self.assertEqual(self.snapshot(), saved)

    def test_writer_contention_invalid_counts_and_failed_state_publish(self):
        self.cli("init", "--apply")
        self.record.extend(["--report", self.report()])
        saved = self.snapshot()
        for counts in ('[]', 'bad', '{"done":false}'):
            self.cli(*self.record, "--counts", counts, "--apply", ok=False)
            self.assertEqual(self.snapshot(), saved)
        with compass.writer_lock(self.root):
            self.cli(*self.record, "--apply", ok=False)
        self.assertEqual(self.snapshot(), saved)
        replace = os.replace

        def fail_state(staged, target):
            if target == self.state:
                raise OSError("simulated state publish failure")
            replace(staged, target)

        with patch.object(compass.os, "replace", side_effect=fail_state):
            self.cli(*self.record, "--apply", ok=False)
        self.assertEqual(self.snapshot(), saved)
        self.cli(*self.record, "--apply")
        self.assertEqual(json.loads(self.state.read_bytes())["runs"], 1)


if __name__ == "__main__":
    unittest.main()
