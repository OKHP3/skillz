#!/usr/bin/env python3
"""Discoverable regression checks for the read-only repository inventory helper."""

from __future__ import annotations

import importlib.util
import contextlib
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = PACKAGE_ROOT / "scripts" / "inventory_repo.py"


class InventorySafetyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(dir=os.environ.get("OKHP3_TEST_TMP_ROOT"))
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.repo = self.base / "repo"
        self.repo.mkdir()

    def run_inventory(self, *options: str) -> dict[str, object]:
        completed = subprocess.run(
            [sys.executable, str(SCRIPT), "--root", str(self.repo), *options],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        return json.loads(completed.stdout)

    def load_module(self):
        spec = importlib.util.spec_from_file_location("inventory_repo", SCRIPT)
        self.assertIsNotNone(spec)
        module = importlib.util.module_from_spec(spec)
        self.assertIsNotNone(spec.loader)
        spec.loader.exec_module(module)
        return module

    def test_file_symlink_outside_repository_is_not_read_or_hashed(self) -> None:
        outside = self.base / "private.md"
        outside.write_text("synthetic-private-marker", encoding="utf-8")
        link = self.repo / "linked.md"
        try:
            link.symlink_to(outside)
            result = self.run_inventory("--hash")
        except (OSError, NotImplementedError):
            # Windows hosts without symlink privilege still exercise the path gate.
            link.write_text("synthetic-private-marker", encoding="utf-8")
            module = self.load_module()
            output = io.StringIO()
            original_is_symlink = Path.is_symlink

            def synthetic_link(path: Path) -> bool:
                return path == link or original_is_symlink(path)

            with mock.patch.object(Path, "is_symlink", synthetic_link), \
                 mock.patch.object(sys, "argv", [str(SCRIPT), "--root", str(self.repo), "--hash"]), \
                 contextlib.redirect_stdout(output):
                self.assertEqual(module.main(), 0)
            result = json.loads(output.getvalue())
        self.assertNotIn("linked.md", [item["path"] for item in result["files"]])
        self.assertIn("linked.md", result["symlinks_skipped"])
        self.assertNotIn("synthetic-private-marker", json.dumps(result))

    def test_text_sample_uses_bounded_io(self) -> None:
        source = self.repo / "notes.md"
        source.write_text("# Heading\n" + "sample " * 1000, encoding="utf-8")
        module = self.load_module()

        with mock.patch.object(Path, "read_text", side_effect=AssertionError("unbounded read_text")):
            sample = module.read_text_sample(source, 20, [])
        self.assertIsNotNone(sample)
        self.assertLessEqual(sample["sample_chars"], 20)

    def test_reparse_directory_is_skipped_and_its_name_is_checked(self) -> None:
        junction = self.repo / "My Junction"
        junction.mkdir()
        (junction / "private.md").write_text("synthetic-private-marker", encoding="utf-8")
        module = self.load_module()
        original_lstat = Path.lstat
        output = io.StringIO()

        def synthetic_reparse(path: Path):
            if path == junction:
                return SimpleNamespace(st_file_attributes=0x400)
            return original_lstat(path)

        with mock.patch.object(Path, "lstat", synthetic_reparse), \
             mock.patch.object(sys, "argv", [str(SCRIPT), "--root", str(self.repo)]), \
             contextlib.redirect_stdout(output):
            self.assertEqual(module.main(), 0)
        result = json.loads(output.getvalue())
        self.assertIn("My Junction", result["symlinks_skipped"])
        self.assertEqual(result["summary"]["file_count"], 0)
        self.assertIn("My Junction", result["portability_violations"]["spaces"])
        self.assertNotIn("synthetic-private-marker", output.getvalue())

    def test_hash_failure_marks_scan_incomplete(self) -> None:
        (self.repo / "notes.md").write_text("# Notes", encoding="utf-8")
        module = self.load_module()
        output = io.StringIO()
        with mock.patch.object(module, "sha256", side_effect=OSError("synthetic-denied")), \
             mock.patch.object(sys, "argv", [str(SCRIPT), "--root", str(self.repo), "--hash"]), \
             contextlib.redirect_stdout(output):
            self.assertEqual(module.main(), 0)
        result = json.loads(output.getvalue())
        self.assertTrue(result["summary"]["scan_incomplete"])
        self.assertTrue(result["files"][0]["hash_error"])
        self.assertTrue(any("synthetic-denied" in error for error in result["scan_errors"]))

    def test_linked_repository_root_is_rejected_before_scan(self) -> None:
        module = self.load_module()
        stderr = io.StringIO()
        with mock.patch.object(module, "is_linklike", side_effect=lambda path: path == self.repo), \
             mock.patch.object(module, "walk_repository", side_effect=AssertionError("root traversed")), \
             mock.patch.object(sys, "argv", [str(SCRIPT), "--root", str(self.repo)]), \
             contextlib.redirect_stderr(stderr):
            self.assertEqual(module.main(), 2)
        self.assertIn("linked repository root", stderr.getvalue())

    def test_long_skipped_link_path_is_reported(self) -> None:
        module = self.load_module()
        long_name = "a" * 181
        output = io.StringIO()
        with mock.patch.object(module, "walk_repository", return_value=iter([("symlink", self.repo / long_name)])), \
             mock.patch.object(sys, "argv", [str(SCRIPT), "--root", str(self.repo)]), \
             contextlib.redirect_stdout(output):
            self.assertEqual(module.main(), 0)
        result = json.loads(output.getvalue())
        self.assertIn(long_name, result["symlinks_skipped"])
        self.assertIn(long_name, result["portability_violations"]["long_relative_path"])

    def test_prunes_dependency_directories_and_reports_file_limit(self) -> None:
        dependency = self.repo / "node_modules"
        dependency.mkdir()
        (dependency / "ignored.md").write_text("synthetic", encoding="utf-8")
        (self.repo / "a.md").write_text("a", encoding="utf-8")
        (self.repo / "b.md").write_text("b", encoding="utf-8")

        result = self.run_inventory("--max-files", "1")
        self.assertEqual(result["summary"]["file_count"], 1)
        self.assertTrue(result["summary"]["truncated"])
        self.assertEqual([item["path"] for item in result["files"]], ["a.md"])


if __name__ == "__main__":
    unittest.main()
