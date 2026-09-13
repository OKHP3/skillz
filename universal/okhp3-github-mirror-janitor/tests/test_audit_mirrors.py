"""Offline regression coverage for PR #86's unresolved remote-main finding."""

import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "audit-mirrors.ps1"


class RemoteMainTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mirror-janitor-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.repo = self.root / "fixture"
        self.repo.mkdir()
        self.git("init", "--initial-branch=master")
        self.git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                 "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-m", "Fixture")

    def git(self, *args, input=None):
        return subprocess.run(
            ["git", "-C", str(self.repo), *args], input=input,
            text=True, encoding="utf-8", capture_output=True, check=True, timeout=30,
        ).stdout.strip()

    def audit(self):
        pwsh = shutil.which("pwsh")
        self.assertIsNotNone(pwsh, "PowerShell 7 (pwsh) is required for these tests")
        result = subprocess.run(
            [pwsh, "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
             str(SCRIPT), "-Root", str(self.root)],
            text=True, encoding="utf-8-sig", capture_output=True, check=True, timeout=30,
        )
        report = json.loads(result.stdout)
        self.assertEqual(report["repositoryCount"], 1)
        repositories = report["repositories"]
        return repositories[0] if isinstance(repositories, list) else repositories

    def assert_unknown(self, report):
        self.assertIsNone(report["originMain"])
        self.assertIsNone(report["originMainOnly"])
        self.assertIsNone(report["headOnly"])
        for branch in report["branches"]:
            self.assertIsNone(branch["originMainOnly"])
            self.assertIsNone(branch["branchOnly"])
            self.assertFalse(branch["fullyMergedIntoOriginMain"])

    def test_missing_remote_main_is_unknown(self):
        self.assert_unknown(self.audit())

    def test_valid_remote_main_preserves_sha_and_counts(self):
        head = self.git("rev-parse", "HEAD")
        self.git("update-ref", "refs/remotes/origin/main", head)
        report = self.audit()
        self.assertEqual(report["originMain"], head)
        self.assertEqual(report["originMainOnly"], 0)
        self.assertEqual(report["headOnly"], 0)
        self.assertTrue(report["branches"][0]["fullyMergedIntoOriginMain"])

    def test_non_commit_remote_main_is_unknown(self):
        blob = self.git("hash-object", "-w", "--stdin", input="not a commit\n")
        self.git("update-ref", "refs/remotes/origin/main", blob)
        self.assert_unknown(self.audit())


if __name__ == "__main__":
    unittest.main()
