from __future__ import annotations

"""Safety regression fixtures shared with the canonical janitor package.

This shipped suite mirrors deletion-safety and hosted-evidence behavior. The
canonical suite additionally checks repository-local copy parity; release
metadata and package-specific evaluation records are outside this boundary.
"""

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
            self._add_remote(root, Path(directory))
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            self._git(root, "push", "-qu", "origin", "feature/cleanup")
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
            remote = self._add_remote(root, Path(directory))
            self._git(root, "remote", "add", "upstream", str(remote))
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            self._git(root, "push", "-qu", "origin", "feature/cleanup")
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
            self.assertEqual(check["reviewed_remote_head"], reviewed_head)
            self.assertEqual(check["current_remote_head"], reviewed_head)
            self.assertEqual(check["deletion_commands"], [
                ["git", "push", "upstream", "--delete", "feature/cleanup"],
                ["git", "branch", "-d", "feature/cleanup"],
            ])

    def test_pre_delete_remote_tip_change_holds_after_independent_remote_advance(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            remote = self._add_remote(root, Path(directory))
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            self._git(root, "push", "-qu", "origin", "feature/cleanup")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            writer = Path(directory) / "remote-writer"
            subprocess.run(
                [
                    "git", "clone", "-q", "--branch", "feature/cleanup",
                    str(remote), str(writer),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            self._git(writer, "config", "user.email", "writer@example.com")
            self._git(writer, "config", "user.name", "Remote Writer")
            (writer / "remote-change.txt").write_text("advanced\n", encoding="utf-8")
            self._git(writer, "add", "remote-change.txt")
            self._git(writer, "commit", "-qm", "advance remote branch")
            refreshed_remote_head = self._git(writer, "rev-parse", "HEAD").strip()
            self._git(writer, "push", "-q", "origin", "feature/cleanup")

            check = audit_repo.prepare_branch_deletion(
                root,
                "feature/cleanup",
                reviewed_head,
            )

            self.assertEqual(check["bucket"], "review")
            self.assertEqual(check["reviewed_head"], reviewed_head)
            self.assertEqual(check["current_head"], reviewed_head)
            self.assertEqual(check["reviewed_remote_head"], reviewed_head)
            self.assertEqual(check["current_remote_head"], refreshed_remote_head)
            self.assertEqual(check["reason"], "remote branch tip changed since review")
            self.assertEqual(check["deletion_commands"], [])

    def test_missing_remote_branch_fails_pre_delete_visibly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._add_remote(root, Path(directory))
            self._git(root, "switch", "-q", "-c", "feature/not-published")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            with self.assertRaises(audit_repo.AuditError) as error:
                audit_repo.prepare_branch_deletion(
                    root,
                    "feature/not-published",
                    reviewed_head,
                )

            self.assertIn("git ls-remote", str(error.exception))

    def test_cli_rejects_missing_deletion_approval_details(self) -> None:
        invalid_invocations = [
            (["--reviewed-head", "reviewed-sha"], "--check-delete requires --branch and --reviewed-head"),
            (["--branch", "feature/cleanup"], "--check-delete requires --branch and --reviewed-head"),
        ]
        for arguments, expected_error in invalid_invocations:
            with self.subTest(arguments=arguments), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self._init_repo(root)

                result = subprocess.run(
                    [
                        sys.executable,
                        str(SCRIPT),
                        "--root",
                        str(root),
                        "--check-delete",
                        *arguments,
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                )

                self.assertNotEqual(result.returncode, 0)
                error_report = json.loads(result.stdout)
                self.assertEqual(error_report["error"], expected_error)
                self.assertNotIn("deletion_commands", error_report)
                self.assertNotIn('"bucket": "delete"', result.stdout)

    def test_unsafe_cleanup_evidence_is_held_for_review(self) -> None:
        unsafe_fixtures = [
            ("unknown", {}, {"lookup_status": "unknown"}),
            ("failed", {}, {"lookup_status": "failed", "error": "unavailable"}),
            ("unavailable", {}, None),
            (
                "head-mismatch",
                {"expected_head": "reviewed-head"},
                {
                    "state": "closed", "merged": True,
                    "head_sha": "reviewed-head", "merge_commit_reachable": True,
                },
            ),
            (
                "missing-hosted-head",
                {},
                {
                    "state": "closed", "merged": True,
                    "merge_commit_reachable": True,
                },
            ),
            (
                "closed-unmerged",
                {},
                {
                    "state": "closed", "merged": False,
                    "head_sha": "branch-head", "merge_commit_reachable": False,
                },
            ),
            (
                "unreachable-merge",
                {},
                {
                    "state": "closed", "merged": True,
                    "head_sha": "branch-head", "merge_commit_reachable": False,
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

        merged = audit_repo.classify_branch_for_cleanup(
            {
                "branch": "feature/merged",
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
        self.assertEqual(merged["bucket"], "delete")

    def test_hosted_lookup_reports_fail_closed_and_invalid_reports_fail_visibly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            for branch in [
                "feature/unknown", "feature/failed", "feature/missing",
                "feature/invalid",
            ]:
                self._git(root, "branch", branch)

            lookup_file = root / "lookups.json"
            lookup_file.write_text(
                json.dumps({
                    "feature/unknown": {"lookup_status": "unknown"},
                    "feature/failed": {
                        "lookup_status": "failed",
                        "error": "connector failed with synthetic-token-do-not-log",
                    },
                    "feature/other": {"lookup_status": "not_found"},
                    "feature/invalid": {
                        "lookup_status": "synthetic-token-do-not-log",
                        "state": "closed",
                        "merged": True,
                        "head_sha": self._git(root, "rev-parse", "feature/invalid"),
                        "merge_commit_reachable": True,
                    },
                }),
                encoding="utf-8",
            )
            result = subprocess.run(
                [
                    sys.executable, str(SCRIPT), "--root", str(root),
                    "--base", "main", "--hosted-lookups", str(lookup_file),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            report = json.loads(result.stdout)
            by_name = {item["branch"]: item for item in report["branches"]}
            for name in [
                "feature/unknown", "feature/failed", "feature/missing",
                "feature/invalid",
            ]:
                self.assertEqual(by_name[name]["bucket"], "review")
                self.assertIn("hosted evidence is missing", by_name[name]["reason"])
            self.assertEqual(by_name["feature/failed"]["hosted_lookup"], {
                "status": "failed",
            })
            self.assertNotIn("synthetic-token-do-not-log", result.stdout)
            self.assertEqual(by_name["feature/missing"]["hosted_lookup"], {
                "status": "unavailable",
            })
            self.assertEqual(by_name["feature/invalid"]["hosted_lookup"], {
                "status": "unknown",
            })
            self.assertNotIn("delete", {by_name[name]["bucket"] for name in by_name})

            for contents, expected in [
                ('{"feature/candidate":', "could not read hosted lookup report"),
                (json.dumps(["feature/candidate"]), "must be a JSON object"),
            ]:
                with self.subTest(contents=contents):
                    lookup_file.write_text(contents, encoding="utf-8")
                    invalid = subprocess.run(
                        [
                            sys.executable, str(SCRIPT), "--root", str(root),
                            "--base", "main", "--hosted-lookups", str(lookup_file),
                        ],
                        check=False,
                        capture_output=True,
                        text=True,
                    )
                    self.assertNotEqual(invalid.returncode, 0)
                    error_report = json.loads(invalid.stdout)
                    self.assertIn(expected, error_report["error"])
                    self.assertNotIn("branches", error_report)
                    self.assertNotIn('"bucket": "delete"', invalid.stdout)

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
            branches, _ = audit_repo.audit_branches(root, "main", hosted_prs=loaded)
            after = self._git(root, "status", "--short")
            unknown = next(
                item for item in branches if item["branch"] == "feature/unknown"
            )
            self.assertEqual(unknown["bucket"], "review")
            self.assertEqual(
                unknown["head_sha"],
                self._git(root, "rev-parse", "feature/unknown").strip(),
            )
            self.assertEqual(before, after)

    def test_stashes_archive_refs_and_discovery_refs_are_preserved(self) -> None:
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
                        "branch": "active-work", "is_current": False,
                        "merged_into_base": True, "head_sha": "branch-head",
                    },
                    hosted_pr={
                        "state": "open", "merged": False, "head_sha": "branch-head",
                    },
                )["bucket"],
                "keep",
            )
            stash_sha = self._git(root, "rev-parse", "refs/stash").strip()
            archive_sha = self._git(root, "rev-parse", "refs/archive/recovery").strip()
            self.assertEqual(
                self._git(root, "show-ref", "--verify", "refs/stash").split()[0],
                stash_sha,
            )
            self.assertEqual(
                self._git(root, "show-ref", "--verify", "refs/archive/recovery").split()[0],
                archive_sha,
            )

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

    def _add_remote(self, root: Path, directory: Path) -> Path:
        remote = directory / "remote.git"
        subprocess.run(
            ["git", "init", "-q", "--bare", str(remote)],
            check=True,
            capture_output=True,
            text=True,
        )
        self._git(root, "remote", "add", "origin", str(remote))
        self._git(root, "push", "-q", "origin", "main")
        return remote


if __name__ == "__main__":
    unittest.main()
