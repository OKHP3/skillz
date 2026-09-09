from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).parents[1] / "scripts" / "audit-repo.py"
SPEC = importlib.util.spec_from_file_location("audit_repo", SCRIPT)
assert SPEC and SPEC.loader
audit_repo = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit_repo)


class AuditRepoTests(unittest.TestCase):
    def test_pre_delete_tip_change_holds_and_emits_no_deletion_commands(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            (root / "moved.txt").write_text("changed\n", encoding="utf-8")
            self._git(root, "add", "moved.txt")
            self._git(root, "commit", "-qm", "moved branch tip")

            check = audit_repo.prepare_branch_deletion(
                root,
                "feature/cleanup",
                reviewed_head,
            )
            self.assertEqual(check["bucket"], "review")
            self.assertEqual(check["reviewed_head"], reviewed_head)
            self.assertEqual(
                check["current_head"],
                self._git(root, "rev-parse", "HEAD").strip(),
            )
            self.assertEqual(check["deletion_commands"], [])

    def test_pre_delete_matching_tip_keeps_remote_first_sequence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            check = audit_repo.prepare_branch_deletion(
                root,
                "feature/cleanup",
                reviewed_head,
                remote="upstream",
            )
            self.assertEqual(check["bucket"], "delete")
            self.assertEqual(check["reviewed_head"], reviewed_head)
            self.assertEqual(check["current_head"], reviewed_head)
            self.assertEqual(check["deletion_commands"], [
                ["git", "push", "upstream", "--delete", "feature/cleanup"],
                ["git", "branch", "-d", "feature/cleanup"],
            ])

    def test_unsafe_cleanup_evidence_is_held_for_review(self) -> None:
        unsafe_fixtures = [
            (
                "unknown-hosted-lookup",
                {},
                {"lookup_status": "unknown"},
            ),
            (
                "failed-hosted-lookup",
                {},
                {"lookup_status": "failed", "error": "host unavailable"},
            ),
            (
                "unavailable-hosted-lookup",
                {},
                None,
            ),
            (
                "exact-head-mismatch",
                {"expected_head": "reviewed-head"},
                {
                    "state": "closed",
                    "merged": True,
                    "head_sha": "reviewed-head",
                    "merge_commit_reachable": True,
                },
            ),
            (
                "closed-but-unmerged-pr",
                {},
                {
                    "state": "closed",
                    "merged": False,
                    "head_sha": "branch-head",
                    "merge_commit_reachable": False,
                },
            ),
            (
                "unreachable-merge-commit",
                {},
                {
                    "state": "closed",
                    "merged": True,
                    "head_sha": "branch-head",
                    "merge_commit_reachable": False,
                },
            ),
        ]
        for name, options, hosted_pr in unsafe_fixtures:
            with self.subTest(name=name):
                decision = audit_repo.classify_branch_for_cleanup(
                    {
                        "branch": f"feature/{name}",
                        "is_current": False,
                        "merged_into_base": True,
                        "head_sha": "branch-head",
                    },
                    hosted_pr=hosted_pr,
                    **options,
                )
                self.assertEqual(decision["bucket"], "review")
                self.assertNotEqual(decision["bucket"], "delete")
                if "lookup" in name:
                    self.assertIn("hosted evidence is missing", decision["reason"])

    def test_merged_hosted_pull_request_is_deletable(self) -> None:
        decision = audit_repo.classify_branch_for_cleanup(
            {
                "branch": "feature/merged-work",
                "is_current": False,
                "merged_into_base": False,
                "head_sha": "branch-head",
            },
            hosted_pr={
                "state": "closed",
                "merged": True,
                "head_sha": "branch-head",
                "merge_commit_reachable": True,
            },
        )
        self.assertEqual(decision, {
            "bucket": "delete",
            "reason": "merged pull request and reachable merge commit",
        })

    def test_audit_report_surfaces_missing_hosted_evidence_as_review(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            for branch in [
                "feature/unknown",
                "feature/failed",
                "feature/unavailable",
            ]:
                self._git(root, "branch", branch)

            branches, _ = audit_repo.audit_branches(
                root,
                "main",
                hosted_prs={
                    "feature/unknown": {"lookup_status": "unknown"},
                    "feature/failed": {
                        "lookup_status": "failed",
                        "error": "host unavailable",
                    },
                    "feature/unavailable": None,
                },
            )
            by_name = {str(item["branch"]): item for item in branches}

            self.assertEqual(by_name["feature/unknown"]["bucket"], "review")
            self.assertEqual(
                by_name["feature/unknown"]["hosted_lookup"],
                {"status": "unknown"},
            )
            self.assertIn(
                "hosted evidence is missing",
                str(by_name["feature/unknown"]["reason"]),
            )

            self.assertEqual(by_name["feature/failed"]["bucket"], "review")
            self.assertEqual(
                by_name["feature/failed"]["hosted_lookup"],
                {"status": "failed", "error": "host unavailable"},
            )
            self.assertIn(
                "hosted evidence is missing",
                str(by_name["feature/failed"]["reason"]),
            )

            self.assertEqual(by_name["feature/unavailable"]["bucket"], "review")
            self.assertEqual(
                by_name["feature/unavailable"]["hosted_lookup"],
                {"status": "unavailable"},
            )
            self.assertIn(
                "hosted evidence is missing",
                str(by_name["feature/unavailable"]["reason"]),
            )
            self.assertNotIn(
                "delete",
                {
                    str(by_name[name]["bucket"])
                    for name in [
                        "feature/unknown",
                        "feature/failed",
                        "feature/unavailable",
                    ]
                },
            )

    def test_hosted_lookup_file_is_read_only_report_input(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "branch", "feature/unknown")
            lookup_file = root / "lookups.json"
            lookup_file.write_text(
                json.dumps({"feature/unknown": {"lookup_status": "unknown"}}),
                encoding="utf-8",
            )

            loaded = audit_repo.load_hosted_prs(lookup_file)
            self.assertEqual(
                loaded,
                {"feature/unknown": {"lookup_status": "unknown"}},
            )
            before = self._git(root, "status", "--short")
            branches, _ = audit_repo.audit_branches(
                root,
                "main",
                hosted_prs=loaded,
            )
            after = self._git(root, "status", "--short")

            unknown = next(
                item for item in branches if item["branch"] == "feature/unknown"
            )
            self.assertEqual(unknown["bucket"], "review")
            self.assertEqual(before, after)

    def test_cli_report_keeps_failed_hosted_lookup_in_review(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "branch", "feature/failed")
            lookup_file = root / "lookups.json"
            lookup_file.write_text(
                json.dumps({
                    "feature/failed": {
                        "lookup_status": "failed",
                        "error": "host unavailable",
                    },
                }),
                encoding="utf-8",
            )

            result = subprocess.run(
                [
                    sys.executable,
                    str(SCRIPT),
                    "--root",
                    str(root),
                    "--base",
                    "main",
                    "--hosted-lookups",
                    str(lookup_file),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            report = json.loads(result.stdout)
            failed = next(
                item for item in report["branches"]
                if item["branch"] == "feature/failed"
            )

            self.assertEqual(failed["bucket"], "review")
            self.assertEqual(
                failed["hosted_lookup"],
                {"status": "failed", "error": "host unavailable"},
            )
            self.assertIn("hosted evidence is missing", failed["reason"])
            self.assertNotEqual(failed["bucket"], "delete")

    def test_active_branches_stashes_and_archive_refs_are_protected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "branch", "active-work")
            (root / "draft.txt").write_text("keep me\n", encoding="utf-8")
            self._git(root, "stash", "push", "--include-untracked", "-m", "recovery")
            self._git(root, "update-ref", "refs/archive/recovery", "HEAD")

            branches, _ = audit_repo.audit_branches(root, "main")
            names = {str(item["branch"]) for item in branches}
            self.assertIn("main", names)
            self.assertIn("active-work", names)
            self.assertNotIn("refs/stash", names)
            self.assertNotIn("refs/archive/recovery", names)
            self.assertEqual(
                audit_repo.classify_branch_for_cleanup(
                    {
                        "branch": "active-work",
                        "is_current": False,
                        "merged_into_base": True,
                        "head_sha": "branch-head",
                    },
                    hosted_pr={"state": "open", "merged": False, "head_sha": "branch-head"},
                )["bucket"],
                "keep",
            )
            self.assertEqual(
                self._git(root, "show-ref", "--verify", "refs/stash").split()[0],
                self._git(root, "rev-parse", "refs/stash").strip(),
            )
            self.assertEqual(
                self._git(root, "show-ref", "--verify", "refs/archive/recovery").split()[0],
                self._git(root, "rev-parse", "refs/archive/recovery").strip(),
            )

    def test_discovery_does_not_prune_refs(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            with patch.object(audit_repo, "run", wraps=audit_repo.run) as run:
                audit_repo.audit_branches(root, "main")
            commands = [" ".join(call.args[0]) for call in run.call_args_list]
            self.assertTrue(commands)
            self.assertTrue(all("prune" not in command for command in commands))

    def test_naming_exceptions_and_violations(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in [
                "SiteTokens.css", "useDebounce.ts", "ChatPane.tsx",
                "My Document.md", "README.md", "robots.txt", "my_file.json",
                "photo.PNG",
            ]:
                (root / name).write_text("x", encoding="utf-8")
            violations = {
                item["path"]: item["reason"]
                for item in audit_repo.audit_naming(root)
            }
            self.assertEqual(violations["SiteTokens.css"], "mixed/camel/Pascal case")
            self.assertEqual(violations["My Document.md"], "contains spaces")
            self.assertEqual(violations["my_file.json"], "uses underscores instead of hyphens")
            self.assertEqual(violations["photo.PNG"], "uppercase extension")
            self.assertNotIn("useDebounce.ts", violations)
            self.assertNotIn("ChatPane.tsx", violations)
            self.assertNotIn("README.md", violations)
            self.assertNotIn("robots.txt", violations)

    def test_nested_detritus_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            nested = root / "docs" / "attached_assets"
            nested.mkdir(parents=True)
            (nested / "note.txt").write_text("x", encoding="utf-8")
            folders = audit_repo.audit_detritus(root)
            self.assertEqual(folders[0]["folder"], "docs/attached_assets")

    def test_missing_base_fails_visibly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            with self.assertRaises(audit_repo.AuditError):
                audit_repo.ensure_base(root, "origin/main")

    @staticmethod
    def _git(root: Path, *args: str) -> str:
        result = subprocess.run(
            ["git", *args],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout

    def _init_repo(self, root: Path) -> None:
        self._git(root, "init", "-q", "-b", "main")
        self._git(root, "config", "user.email", "test@example.com")
        self._git(root, "config", "user.name", "Audit Test")
        (root / "README.md").write_text("fixture\n", encoding="utf-8")
        self._git(root, "add", "README.md")
        self._git(root, "commit", "-qm", "initial")


if __name__ == "__main__":
    unittest.main()
