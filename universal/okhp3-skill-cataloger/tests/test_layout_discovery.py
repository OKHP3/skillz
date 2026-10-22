"""Regression checks for catalog layouts that previously hid valid SKILL.md files."""

import runpy
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "gen-skills-readme.py"
find_unindexed = runpy.run_path(str(SCRIPT))["find_unindexed_skill_files"]


class LayoutDiscoveryTests(unittest.TestCase):
    def test_flat_support_layout_rejects_nested_package(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            direct = root / "direct" / "SKILL.md"
            nested = root / "wrapper" / "nested" / "SKILL.md"
            direct.parent.mkdir(parents=True)
            nested.parent.mkdir(parents=True)
            direct.write_text("# direct", encoding="utf-8")
            nested.write_text("# nested", encoding="utf-8")
            skills = [{"path": "direct/SKILL.md"}]
            self.assertEqual(find_unindexed(root, skills, False), [nested])

    def test_distribution_layout_rejects_nested_package_but_skips_docs(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            direct = root / "family" / "direct" / "SKILL.md"
            nested = root / "family" / "wrapper" / "nested" / "SKILL.md"
            archived = root / "docs" / "archive" / "SKILL.md"
            for path in (direct, nested, archived):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# fixture", encoding="utf-8")
            skills = [{"path": "family/direct/SKILL.md"}]
            self.assertEqual(find_unindexed(root, skills, True), [nested])

    def test_complete_layout_has_no_unindexed_skill(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            direct = root / "direct" / "SKILL.md"
            direct.parent.mkdir()
            direct.write_text("# direct", encoding="utf-8")
            self.assertEqual(
                find_unindexed(root, [{"path": "direct/SKILL.md"}], False),
                [],
            )

    def test_json_mode_rejects_hidden_nested_skill(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            nested = root / "wrapper" / "nested" / "SKILL.md"
            nested.parent.mkdir(parents=True)
            nested.write_text("# nested", encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--skills-dir", str(root),
                 "--mode", "project", "--json"],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Unindexed SKILL.md", result.stderr)
            self.assertEqual(result.stdout, "")


if __name__ == "__main__":
    unittest.main()
