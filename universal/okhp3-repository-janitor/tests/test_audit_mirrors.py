import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/audit_mirrors.py'
spec = importlib.util.spec_from_file_location('audit_mirrors', SCRIPT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve()
        self.root = self.base / 'mirrors'
        self.root.mkdir()
        self.origin = self.base / 'origin'
        self.origin.mkdir()
        self.git(self.origin, 'init', '-b', 'main')
        self.git(self.origin, 'config', 'user.email', 'test@example.invalid')
        self.git(self.origin, 'config', 'user.name', 'Test')
        (self.origin / 'file').write_text('initial')
        self.git(self.origin, 'add', '.')
        self.git(self.origin, 'commit', '-m', 'initial')
        self.repo = self.root / 'repo'
        self.git(self.root, 'clone', str(self.origin), str(self.repo))
        self.git(self.repo, 'config', 'user.email', 'test@example.invalid')
        self.git(self.repo, 'config', 'user.name', 'Test')

    def git(self, path, *args):
        return subprocess.run(['git', '-C', str(path), *args], check=True, capture_output=True, text=True).stdout.strip()

    def report(self, **kwargs):
        return audit.build_report(self.root, **kwargs)

    def test_dirty_untracked_full_archive_unreachable(self):
        (self.repo / 'new').write_text('keep')
        sha = self.git(self.repo, 'rev-parse', 'HEAD')
        self.git(self.repo, 'update-ref', 'refs/archive/keep', sha)
        report = self.report(include_unreachable=True)
        record = report['repositories'][0]
        self.assertTrue(report['complete'])
        self.assertIn('?? new', record['working_tree'])
        self.assertEqual(record['head'], sha)
        self.assertEqual(record['archive_ref_shas']['refs/archive/keep'], sha)
        self.assertEqual(record['unreachable_commits'], [])
        self.git(self.repo, 'commit', '--allow-empty', '-m', 'orphan')
        orphan = self.git(self.repo, 'rev-parse', 'HEAD')
        self.git(self.repo, 'reset', '--soft', sha)
        self.assertIn(orphan, self.report(include_unreachable=True)['repositories'][0]['unreachable_commits'])

    def test_missing_main_is_explicit(self):
        self.git(self.repo, 'update-ref', '-d', 'refs/remotes/origin/main')
        record = self.report()['repositories'][0]
        self.assertFalse(record['has_origin_main'])
        self.assertFalse(record['complete'])
        self.assertIsNone(record['head_vs_origin_main'])
        self.assertIsNone(record['local_branches'][0]['vs_origin_main'])

    def test_zero_invalid_and_skipped(self):
        empty = self.base / 'empty'
        empty.mkdir()
        self.assertFalse(audit.build_report(empty)['complete'])
        invalid = empty / 'invalid'
        (invalid / '.git').mkdir(parents=True)
        report = audit.build_report(empty)
        self.assertEqual(report['repository_count'], 1)
        self.assertTrue(report['repositories'][0]['errors'])
        (self.root / 'notes').mkdir()
        self.assertEqual(self.report()['skipped_directories'][0]['reason'], 'not_git_checkout')
        self.assertFalse(audit.build_report(self.base / 'absent')['complete'])

    def test_failed_command_has_no_zero_default(self):
        original = subprocess.run
        def fail(command, **kwargs):
            if 'rev-list' in command:
                return subprocess.CompletedProcess(command, 128, '', 'failure')
            return original(command, **kwargs)
        with patch.object(audit.subprocess, 'run', side_effect=fail):
            report = self.report()
        record = report['repositories'][0]
        self.assertFalse(report['complete'])
        self.assertIsNone(record['head_vs_origin_main'])
        self.assertEqual(record['errors'][0]['returncode'], 128)

    def test_timeout_environment_and_redaction(self):
        git = audit.Git(self.repo, .01)
        with patch.object(audit.subprocess, 'run', side_effect=subprocess.TimeoutExpired('git', .01, output=b'partial', stderr=b'timeout')) as run:
            self.assertIsNone(git.text('status'))
        self.assertEqual(git.errors[0]['kind'], 'timeout')
        self.assertEqual(run.call_args.kwargs['env']['GIT_OPTIONAL_LOCKS'], '0')
        self.assertEqual(run.call_args.kwargs['env']['GIT_TERMINAL_PROMPT'], '0')
        self.git(self.repo, 'remote', 'set-url', 'origin', 'https://person:supersecret@example.invalid/repo?token=anothersecret')
        original = subprocess.run
        def fail(command, **kwargs):
            if 'fetch' in command:
                return subprocess.CompletedProcess(command, 128, 'supersecret', 'https://person:supersecret@example.invalid/repo?token=anothersecret')
            return original(command, **kwargs)
        with patch.object(audit.subprocess, 'run', side_effect=fail):
            payload = json.dumps(self.report(fetch=True))
        self.assertNotIn('supersecret', payload)
        self.assertNotIn('anothersecret', payload)

    def test_fetch_preserves_configured_prunable_refs_tags(self):
        self.git(self.origin, 'branch', 'old')
        self.git(self.origin, 'tag', 'keep')
        self.git(self.repo, 'fetch', 'origin')
        self.git(self.origin, 'branch', '-D', 'old')
        self.git(self.origin, 'tag', '-d', 'keep')
        self.git(self.repo, 'config', 'fetch.prune', 'true')
        self.git(self.repo, 'config', 'remote.origin.prune', 'true')
        self.git(self.repo, 'config', 'fetch.pruneTags', 'true')
        self.git(self.repo, 'config', 'remote.origin.pruneTags', 'true')
        self.assertTrue(self.report(fetch=True)['complete'])
        self.git(self.repo, 'show-ref', '--verify', 'refs/remotes/origin/old')
        self.git(self.repo, 'show-ref', '--verify', 'refs/tags/keep')

    def test_linked_dirty_and_outside_root(self):
        linked = self.root / 'linked'
        self.git(self.repo, 'worktree', 'add', '-b', 'linked', str(linked))
        (linked / 'forgotten').write_text('keep')
        record = self.report()['repositories'][0]
        self.assertTrue(any('?? forgotten' in (w['working_tree'] or []) for w in record['worktrees']))
        outside = self.base / 'outside'
        self.git(self.repo, 'worktree', 'add', '-b', 'outside', str(outside))
        report = self.report()
        self.assertFalse(report['complete'])
        holds = [w for w in report['repositories'][0]['worktrees'] if w.get('coverage_hold')]
        self.assertEqual(holds[0]['working_tree'], None)
        (self.root / 'escape').symlink_to(self.origin, target_is_directory=True)
        report = self.report(fetch=True)
        self.assertTrue(any(d['reason'] == 'outside_root_symlink' for d in report['skipped_directories']))
        self.assertNotIn('escape', [r['name'] for r in report['repositories']])

    def test_fetch_ignores_custom_local_head_refspec(self):
        before = self.git(self.repo, 'rev-parse', 'main')
        self.git(self.repo, 'config', 'remote.origin.fetch', '+refs/heads/*:refs/heads/*')
        self.git(self.origin, 'commit', '--allow-empty', '-m', 'remote advance')
        report = self.report(fetch=True)
        self.assertTrue(report['complete'])
        self.assertEqual(self.git(self.repo, 'rev-parse', 'main'), before)
        self.assertEqual(report['repositories'][0]['head_vs_origin_main']['behind'], 1)

    def test_previous_new_changed_resolved_head_drift_and_gap(self):
        previous = self.base / 'previous.json'
        initial = self.report()
        previous.write_text(json.dumps(initial))
        self.git(self.origin, 'commit', '--allow-empty', '-m', 'advance')
        self.git(self.repo, 'pull', '--ff-only')
        self.assertEqual(audit.compare(self.report(), previous)['changed'], {})
        (self.repo / 'new').write_text('keep')
        dirty = self.report()
        self.assertTrue(audit.compare(dirty, previous)['new'])
        previous.write_text(json.dumps(dirty))
        (self.repo / 'second').write_text('keep')
        self.assertTrue(audit.compare(self.report(), previous)['changed'])
        (self.repo / 'new').unlink()
        (self.repo / 'second').unlink()
        self.assertTrue(audit.compare(self.report(), previous)['resolved'])
        previous.write_text('{}')
        self.assertEqual(audit.compare(initial, previous)['status'], 'baseline_gap')
        self.assertEqual(audit.compare(initial, self.base / 'missing')['status'], 'baseline_gap')

    def test_cli_atomic_output_and_exit(self):
        output = self.base / 'report.json'
        output.write_text('old')
        result = subprocess.run(['python3', str(SCRIPT), str(self.root), '--output', str(output)], capture_output=True)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(json.loads(output.read_text())['repository_count'], 1)
        empty = self.base / 'empty'
        empty.mkdir()
        result = subprocess.run(['python3', str(SCRIPT), str(empty), '--output', str(output)], capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertFalse(json.loads(output.read_text())['complete'])
        self.assertEqual(list(self.base.glob('.report.json.*')), [])

    def test_partial_comparison_reports_changes_without_resolutions(self):
        previous = self.base / 'partial.json'
        (self.repo / 'new').write_text('preserve')
        old = self.report()
        old['complete'] = False
        previous.write_text(json.dumps(old))
        (self.repo / 'new').unlink()
        result = audit.compare(self.report(), previous)
        self.assertEqual(result['status'], 'partial_compared')
        self.assertEqual(result['resolved'], {})
        self.assertIsNotNone(result['resolution_blocked'])
        (self.repo / 'changed').write_text('preserve')
        self.assertTrue(audit.compare(self.report(), previous)['changed'])

    def test_orphan_deployment_history_is_not_command_failure(self):
        self.git(self.repo, 'checkout', '--orphan', 'pages-build')
        self.git(self.repo, 'commit', '-m', 'independent deployment history')
        tip = self.git(self.repo, 'rev-parse', 'HEAD')
        self.git(self.repo, 'checkout', 'main')
        self.git(self.repo, 'update-ref', 'refs/remotes/origin/gh-pages', tip)
        report = self.report()
        self.assertTrue(report['complete'])
        branch = report['repositories'][0]['non_main_remote_branches'][0]
        self.assertTrue(branch['vs_origin_main']['unrelated_history'])
        self.assertFalse(branch['merged_into_origin_main'])
        self.assertIsNone(branch['vs_origin_main']['changed_files'])


if __name__ == '__main__':
    unittest.main()
