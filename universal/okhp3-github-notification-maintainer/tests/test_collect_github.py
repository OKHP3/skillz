"""Offline, stdlib-only contract tests. No live GitHub requests."""

import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/collect_github.py"
SPEC = importlib.util.spec_from_file_location("collect_github", SCRIPT)
c = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(c)
SHA = "a" * 40


def repo(name="demo", owner="OKHP3", **extras):
    return {"name": name, "full_name": f"{owner}/{name}",
            "owner": {"login": owner, "type": "User"}, "fork": False,
            "archived": False, "private": False, "default_branch": "main", **extras}


def branch(name="main", sha=SHA):
    return {"name": name, "commit": {"sha": sha}, "protected": False}


def pr(number=1, ref="topic", state="open", source=None, merged=None):
    return {"number": number, "state": state, "merged_at": merged,
            "base": {"repo": repo(), "ref": "main"},
            "head": {"repo": source or repo(), "ref": ref, "sha": SHA}}


def note(owner="OKHP3", number="1"):
    return {"id": number, "unread": True, "repository": repo(owner=owner),
            "reason": "subscribed", "updated_at": "2026-09-04T00:00:00Z",
            "subject": {"type": "PullRequest", "title": "private@example.test",
                        "url": "https://example.test/?token=never-export"}}


class FakeAPI:
    def __init__(self):
        self.calls = []
        self.repos = [repo()]
        self.branches = [branch()]
        self.open_prs = []
        self.closed_prs = []
        self.notes = []
        self.runs = []
        self.fail = {}
        self.owner_type = "User"
        self.viewer = "OKHP3"

    def get(self, path, params=None):
        params = params or {}
        self.calls.append((path, dict(params)))
        page = params.get("page", 1)
        if (path, page) in self.fail:
            raise self.fail[path, page]
        if path == "/users/OKHP3":
            return {"login": "OKHP3", "type": self.owner_type}
        if path == "/user":
            return {"login": self.viewer}
        if path in ("/user/repos", "/orgs/OKHP3/repos", "/users/OKHP3/repos"):
            rows = self.repos
        elif path == "/notifications":
            rows = self.notes
        elif path.endswith("/branches"):
            rows = self.branches
        elif path.endswith("/pulls"):
            rows = self.open_prs if params["state"] == "open" else self.closed_prs
        elif path.endswith("/actions/runs"):
            rows = self.runs
        else:
            raise AssertionError("unexpected endpoint: " + path)
        rows = copy.deepcopy(rows[(page - 1) * c.PAGE_SIZE: page * c.PAGE_SIZE])
        return {"workflow_runs": rows, "total_count": len(self.runs)} if path.endswith("/actions/runs") else rows


class InventoryTests(unittest.TestCase):
    def test_complete_owned_inventory_and_main_not_default(self):
        api = FakeAPI()
        api.repos = [repo(fork=True, archived=True, default_branch="trunk")]
        api.branches = [branch(), branch("trunk")]
        result = c.collect("OKHP3", api=api)
        self.assertTrue(result["complete"])
        item = result["repositories"][0]
        self.assertEqual(item["main_sha"], SHA)
        self.assertEqual(item["default_branch"], "trunk")
        self.assertTrue(item["fork"] and item["archived"])
        self.assertEqual(item["branches"][1]["pr_mapping"]["status"], "no_pr_found")
        self.assertIn("not proof", item["coverage"]["recent_action_runs"]["limitation"])

    def test_paginates_repos_branches_open_closed_and_notifications(self):
        api = FakeAPI()
        api.repos = [repo("one"), repo("two"), repo("three")]
        api.branches = [branch(), branch("a"), branch("b")]
        api.notes = [note(number=str(n)) for n in range(3)]
        # Test pagination independently of repository-specific PR validation.
        api.open_prs = [pr(n) for n in range(3)]
        api.closed_prs = [pr(n, state="closed") for n in range(3)]
        with patch.object(c, "PAGE_SIZE", 2):
            for path, params in [("/user/repos", {}), ("/repos/OKHP3/demo/branches", {}),
                                 ("/repos/OKHP3/demo/pulls", {"state": "open"}),
                                 ("/repos/OKHP3/demo/pulls", {"state": "closed"}),
                                 ("/notifications", {})]:
                errors = []
                rows, coverage = c.paginate(api, path, params, errors, "test")
                self.assertEqual(len(rows), 3)
                self.assertEqual(coverage["pages"], 2)
                self.assertTrue(coverage["complete"])
                self.assertEqual(errors, [])

    def test_full_page_requires_empty_terminal_page(self):
        api = FakeAPI()
        with patch.object(c, "PAGE_SIZE", 1):
            _, coverage = c.paginate(api, "/user/repos", {}, [], "repos")
        self.assertEqual(coverage["pages"], 2)

    def test_partial_page_failure_retains_evidence(self):
        api = FakeAPI()
        api.fail["/user/repos", 2] = c.InventoryError("rest_timeout")
        with patch.object(c, "PAGE_SIZE", 1):
            result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertEqual(len(result["repositories"]), 1)
        self.assertIn({"operation": "repositories", "code": "rest_timeout", "page": 2}, result["errors"])

    def test_zero_repositories_is_failure(self):
        api = FakeAPI()
        api.repos = []
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertIn("zero_repositories", [e["code"] for e in result["errors"]])

    def test_foreign_repo_never_fetched_or_output(self):
        api = FakeAPI()
        api.repos += [repo(owner="Other")]
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertEqual(len(result["repositories"]), 1)
        self.assertFalse(any("/Other/" in p for p, _ in api.calls))
        self.assertNotIn("Other/demo", json.dumps(result))

    def test_notifications_owner_filter_and_privacy(self):
        api = FakeAPI()
        api.notes = [note(), note("Other", "2")]
        result = c.collect("OKHP3", api=api)
        self.assertTrue(result["complete"])
        self.assertEqual(len(result["unread_notifications"]), 1)
        self.assertEqual(result["coverage"]["unread_notifications"]["foreign_owner_excluded"], 1)
        self.assertNotIn("example.test", json.dumps(result))
        self.assertNotIn("url", result["unread_notifications"][0])

    def test_every_repo_endpoint_failure_visible(self):
        for endpoint in ("branches", "pulls", "actions/runs"):
            with self.subTest(endpoint=endpoint):
                api = FakeAPI()
                api.fail[f"/repos/OKHP3/demo/{endpoint}", 1] = c.InventoryError("rest_failure_exit_1_http_403")
                result = c.collect("OKHP3", api=api)
                self.assertFalse(result["complete"])
                self.assertTrue(result["repositories"][0]["errors"])

    def test_preflight_and_notification_failures_are_visible(self):
        for endpoint in ("/users/OKHP3", "/user", "/notifications"):
            with self.subTest(endpoint=endpoint):
                api = FakeAPI()
                api.fail[endpoint, 1] = c.InventoryError("rest_timeout")
                result = c.collect("OKHP3", api=api)
                self.assertFalse(result["complete"])
                self.assertIn("rest_timeout", [e["code"] for e in result["errors"]])

    def test_action_allowlist_drops_commit_email_and_actor(self):
        api = FakeAPI()
        api.runs = [{"id": 1, "workflow_id": 3, "head_sha": SHA, "head_branch": "main",
                     "status": "completed", "conclusion": "success", "repository": repo(),
                     "created_at": "2026-09-01T00:00:00Z", "updated_at": "2026-09-01T00:00:00Z",
                     "head_commit": {"author": {"email": "private@example.test"}},
                     "actor": {"secret": "never-output-this"},
                     "url": "https://example.test/?token=never-output-this"}]
        result = c.collect("OKHP3", api=api)
        self.assertTrue(result["complete"])
        self.assertNotIn("never-output-this", json.dumps(result))
        self.assertNotIn("private@example.test", json.dumps(result))
        self.assertEqual(result["repositories"][0]["recent_action_runs"][0]["head_sha"], SHA)

    def test_ambiguous_open_pr_keeps_all_matches(self):
        api = FakeAPI()
        api.branches += [branch("topic")]
        api.open_prs = [pr(1), pr(2)]
        result = c.collect("OKHP3", api=api)
        mapping = result["repositories"][0]["branches"][1]["pr_mapping"]
        self.assertEqual(mapping["status"], "ambiguous")
        self.assertEqual(len(mapping["open_prs"]), 2)
        self.assertFalse(any(p.get("state") == "closed" for _, p in api.calls))

    def test_fork_pr_same_branch_does_not_match_owned_branch(self):
        api = FakeAPI()
        api.branches += [branch("topic")]
        api.open_prs = [pr(source=repo(owner="Other"))]
        api.closed_prs = [pr(state="closed", merged="2026-09-01T00:00:00Z")]
        result = c.collect("OKHP3", api=api)
        mapping = result["repositories"][0]["branches"][1]["pr_mapping"]
        self.assertEqual(mapping["status"], "merged")
        self.assertEqual(mapping["open_prs"], [])

    def test_ambiguous_closed_history_and_deleted_head(self):
        for deleted in (False, True):
            api = FakeAPI()
            api.branches += [branch("topic")]
            api.closed_prs = [pr(state="closed")]
            if deleted:
                api.closed_prs[0]["head"]["repo"] = None
            else:
                api.closed_prs += [pr(2, state="closed")]
            result = c.collect("OKHP3", api=api)
            self.assertEqual(result["repositories"][0]["branches"][1]["pr_mapping"]["status"], "ambiguous")

    def test_closed_lookup_failure_does_not_mean_no_pr(self):
        api = FakeAPI()
        api.branches += [branch("topic")]
        original = api.get
        def get(path, params=None):
            if params and params.get("state") == "closed":
                raise c.InventoryError("rest_timeout")
            return original(path, params)
        api.get = get
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertEqual(result["repositories"][0]["branches"][1]["pr_mapping"]["status"], "unknown")

    def test_foreign_pr_base_fails_without_false_no_pr(self):
        api = FakeAPI()
        api.branches += [branch("topic")]
        api.open_prs = [pr()]
        api.open_prs[0]["base"]["repo"] = repo(owner="Other")
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertEqual(result["repositories"][0]["branches"][1]["pr_mapping"]["status"], "unknown")

    def test_sha_validation_and_missing_main(self):
        api = FakeAPI()
        api.branches = [branch("main", "abcdef0")]
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertIsNone(result["repositories"][0]["main_sha"])
        api.branches = [branch("master")]
        result = c.collect("OKHP3", api=api)
        self.assertTrue(result["complete"])
        self.assertEqual(result["repositories"][0]["main_status"], "absent")

    def test_action_cap_and_window_are_explicit(self):
        api = FakeAPI()
        api.runs = [{"id": n, "workflow_id": 3, "head_sha": SHA, "head_branch": "main",
                     "status": "completed", "conclusion": "success", "repository": repo(),
                     "created_at": "2026-09-01T00:00:00Z", "updated_at": "2026-09-01T00:00:00Z"}
                    for n in range(3)]
        with patch.object(c, "PAGE_SIZE", 2), patch.object(c, "ACTIONS_CAP", 2):
            result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        coverage = result["repositories"][0]["coverage"]["recent_action_runs"]
        self.assertTrue(coverage["cap_reached"])
        self.assertEqual(coverage["cap"], 2)
        self.assertIn("since", coverage)

    def test_org_endpoint_and_other_user_limit(self):
        api = FakeAPI()
        api.owner_type = "Organization"
        self.assertTrue(c.collect("OKHP3", api=api)["complete"])
        self.assertTrue(any(p == "/orgs/OKHP3/repos" for p, _ in api.calls))
        api = FakeAPI()
        api.viewer = "Other"
        self.assertFalse(c.collect("OKHP3", api=api)["complete"])


class SecurityAndOutputTests(unittest.TestCase):
    def test_owner_and_worker_parameter_injection_rejected(self):
        for owner in ("--hostname=evil", "https://github.com/OKHP3", "OKHP3?x=y", "../user", "{owner}", "OKHP3;echo"):
            with self.subTest(owner=owner), self.assertRaises(c.argparse.ArgumentTypeError):
                c.owner_value(owner)
        for workers in (0, 17):
            with self.assertRaises(ValueError):
                c.collect("OKHP3", workers=workers, api=FakeAPI())

    @patch.object(c.subprocess, "run")
    def test_get_only_array_no_shell_query_encoded(self, run):
        run.return_value = subprocess.CompletedProcess([], 0, "[]", "")
        weird = "topic&state=open?x=1/{owner}"
        with patch.dict(c.os.environ, {"GH_DEBUG": "api"}):
            c.GitHub().get("/repos/OKHP3/demo/pulls", {"state": "closed", "head": "OKHP3:" + weird})
        args, kwargs = run.call_args
        command = args[0]
        self.assertIsInstance(command, list)
        self.assertEqual(command[command.index("--method") + 1], "GET")
        self.assertEqual(command[command.index("--hostname") + 1], "github.com")
        self.assertFalse(kwargs["shell"])
        self.assertEqual(kwargs["timeout"], 30)
        self.assertNotIn("GH_DEBUG", kwargs["env"])
        self.assertNotIn("{owner}", command[-1])
        query = parse_qs(urlsplit(command[-1]).query)
        self.assertEqual(query, {"state": ["closed"], "head": ["OKHP3:" + weird]})

    @patch.object(c.subprocess, "run")
    def test_rest_errors_timeout_json_never_echo_secrets(self, run):
        for outcome, expected in [
            (subprocess.CompletedProcess([], 1, "", "ghp_SECRET private@example.test https://bad.test (HTTP 403)"), "rest_failure_exit_1_http_403"),
            (subprocess.TimeoutExpired(["gh"], 30, output="secret"), "rest_timeout"),
            (subprocess.CompletedProcess([], 0, "bad secret json", ""), "invalid_json"),
            (FileNotFoundError("secret"), "gh_unavailable")]:
            run.side_effect = outcome if isinstance(outcome, Exception) else None
            run.return_value = outcome
            with self.assertRaises(c.InventoryError) as raised:
                c.GitHub().get("/user")
            self.assertEqual(str(raised.exception), expected)

    def test_malformed_response_and_repeated_page_visible(self):
        api = FakeAPI()
        api.repos = [{"bad": "raw-secret"}]
        result = c.collect("OKHP3", api=api)
        self.assertFalse(result["complete"])
        self.assertNotIn("raw-secret", json.dumps(result))
        class Repeated:
            def get(self, *_):
                return [repo()]
        errors = []
        with patch.object(c, "PAGE_SIZE", 1):
            _, cov = c.paginate(Repeated(), "/user/repos", {}, errors, "repos")
        self.assertFalse(cov["complete"])
        self.assertEqual(errors[0]["code"], "repeated_page")

    def test_privacy_scrub_metadata(self):
        data = c.sanitize({"name": "ghp_ABC123 private@example.test https://github.com/?token=foo"})
        self.assertEqual(data["name"], "[REDACTED] [REDACTED] [REDACTED]")

    def test_atomic_output_outside_repo_and_failure_preserves_previous(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "inventory.json"
            c.atomic_json(output, {"before": True})
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)
            with patch.object(c.os, "replace", side_effect=OSError("mock")):
                with self.assertRaises(OSError):
                    c.atomic_json(output, {"after": True})
            self.assertEqual(json.loads(output.read_text()), {"before": True})
            self.assertEqual(list(Path(directory).iterdir()), [output])
            link = Path(directory) / "link.json"
            link.symlink_to(output)
            with self.assertRaises(OSError):
                c.atomic_json(link, {})

    def test_cli_exit_status_and_defaults(self):
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stdout(io.StringIO()):
            for complete, expected in [(True, 0), (False, 1)]:
                data = {"complete": complete, "repositories": [], "unread_notifications": [], "errors": []}
                with patch.object(c, "collect", return_value=data) as collect:
                    status = c.main(["--owner", "OKHP3", "--output", str(Path(directory) / "result.json")])
                    self.assertEqual(status, expected)
                    collect.assert_called_once_with("OKHP3", 4, 30, 30)

    def test_cli_missing_owner_and_output_failure(self):
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as raised:
                c.main(["--output", "unused.json"])
            self.assertEqual(raised.exception.code, 2)
            with patch.object(c, "collect", return_value={}), \
                    patch.object(c, "atomic_json", side_effect=OSError("secret error")):
                self.assertEqual(c.main(["--owner", "OKHP3", "--output", "unused.json"]), 2)


if __name__ == "__main__":
    unittest.main()
