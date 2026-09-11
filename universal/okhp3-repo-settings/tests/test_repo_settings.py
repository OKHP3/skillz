"""Offline unit and subprocess CLI fixture tests. Run with python -B -m unittest
discover -s tests -v from the package directory. Never invokes live GitHub calls.
"""
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'repo_settings.py'
spec = importlib.util.spec_from_file_location('repo_settings', SCRIPT)
rs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rs)


def snapshot():
    values = {key: False for key in rs.KEYS}
    values.update({'repo.default_branch': 'main', 'actions.default_workflow_permissions': 'read',
                   'protection.required_approving_review_count': 0})
    return {'schema_version': 2, 'repository': 'owner/repo', 'observed_at': '2026-09-10T00:00:00Z',
            'settings': {k: {'status': 'known', 'value': v} for k, v in values.items()}}


def profile():
    return {'schema_version': 2, 'repository': 'owner/repo', 'expected': {'repo.allow_auto_merge': False}}


class ValidationTests(unittest.TestCase):
    def test_bounded_strings(self):
        for value in ('x' * 256, 'line\nbreak', 'name\u202esecret', '<script>', 'a?secret=value', 'a@b', ''):
            with self.subTest(value=value), self.assertRaises(rs.Invalid):
                rs.scalar('repo.default_branch', value)
        with self.assertRaises(rs.Invalid):
            rs.timestamp('2' * 10000)

    def test_hostile_repositories(self):
        for value in ('--help', 'a/b/c', 'a/b?x=1', 'a/b#x', 'a/..', 'https://invalid.example/a/b',
                      'a/b\n', 'a/%2f', 'a/b;echo', '-a/b', 'a/b.git', 'a/b\\c', 'a--b/c'):
            with self.subTest(value=value), self.assertRaises(rs.Invalid):
                rs.audit(value)

    def test_snapshot_malformed(self):
        mutations = [lambda s: s.update(schema_version=True), lambda s: s.update(schema_version=1),
                     lambda s: s.update(observed_at='yesterday'), lambda s: s.update(observed_at='2026-02-30T00:00:00Z'),
                     lambda s: s.update(extra='secret'), lambda s: s.update(settings=[]),
                     lambda s: s['settings'].update({'alien': {'status': 'known', 'value': False}}),
                     lambda s: s['settings']['repo.allow_auto_merge'].update(value=0),
                     lambda s: s['settings']['repo.allow_auto_merge'].update(status='unknown'),
                     lambda s: s['settings']['repo.allow_auto_merge'].update(extra='secret'),
                     lambda s: s.update(unsupported={'manual_controls': {'copilot': True}})]
        for mutation in mutations:
            s = snapshot()
            mutation(s)
            with self.subTest(s=s), self.assertRaises(rs.Invalid):
                rs.validate(s)

    def test_profiles(self):
        for expected in ({}, {'alien': False}, {'repo.allow_auto_merge': 1},
                         {'repo.default_branch': None}, {'actions.default_workflow_permissions': 'admin'},
                         {'protection.required_approving_review_count': True},
                         {'protection.required_approving_review_count': -1}):
            p = profile()
            p['expected'] = expected
            with self.subTest(expected=expected), self.assertRaises(rs.Invalid):
                rs.validate(p, True)

    def test_duplicate_nan_and_deep_json(self):
        for data in ('{"x":1,"x":2}', '{"x":NaN}', '[' * 2000):
            with self.assertRaises(rs.Invalid):
                rs.decode(data)

    def test_compare_states_and_wrong_target(self):
        s, p = snapshot(), profile()
        self.assertEqual(rs.compare(s, p)[1], 0)
        s['settings']['repo.allow_auto_merge']['value'] = True
        self.assertEqual(rs.compare(s, p)[1], 1)
        p['expected']['repo.delete_branch_on_merge'] = True
        del s['settings']['repo.delete_branch_on_merge']
        self.assertEqual(rs.compare(s, p)[1], 2)
        p['repository'] = 'other/repo'
        with self.assertRaises(rs.Invalid):
            rs.compare(s, p)

    def test_verify_chronology_identity_changes(self):
        before, after = snapshot(), snapshot()
        with self.assertRaises(rs.Invalid):
            rs.verify(before, after, profile())
        after['observed_at'] = '2026-09-10T01:00:00Z'
        before['settings']['repo.allow_auto_merge']['value'] = True
        result, code = rs.verify(before, after, profile())
        self.assertEqual(code, 0)
        self.assertEqual(result['causation'], 'not_established')
        self.assertEqual(result['changes']['repo.allow_auto_merge'], {'before': True, 'after': False})
        before['settings']['repo.default_branch'] = rs.unknown()
        result, code = rs.verify(before, after, profile())
        self.assertEqual((code, result['current_compliance']), (2, 'compliant'))
        before['repository'] = 'other/repo'
        with self.assertRaises(rs.Invalid):
            rs.verify(before, after, profile())


class AuditTests(unittest.TestCase):
    def test_redirect_refused_and_string_injection_unknown(self):
        with patch.object(rs, 'get', return_value={'full_name': 'other/repo'}) as get:
            result, code = rs.audit('owner/repo')
        self.assertEqual(code, 2)
        self.assertEqual(get.call_count, 1)
        self.assertTrue(all(v == rs.unknown() for v in result['settings'].values()))
        responses = self.responses()
        responses[0]['default_branch'] = '<DO_NOT_PRINT>'
        with patch.object(rs, 'get', side_effect=responses) as get:
            result, code = rs.audit('owner/repo')
        self.assertEqual(code, 2)
        self.assertEqual(get.call_count, 2)
        self.assertNotIn('DO_NOT_PRINT', json.dumps(result))

    def responses(self):
        return [dict(full_name='owner/repo', allow_auto_merge=True, delete_branch_on_merge=True,
                     default_branch='release/main', secret='DO_NOT_PRINT'),
                dict(default_workflow_permissions='read', can_approve_pull_request_reviews=False),
                dict(required_pull_request_reviews={'required_approving_review_count': 0},
                     allow_force_pushes={'enabled': False}, allow_deletions={'enabled': False},
                     enforce_admins={'enabled': True})]

    def test_get_only_host_and_allowlist(self):
        responses = [json.dumps(x).encode() for x in self.responses()]
        with patch.object(rs, 'bounded_stdout', side_effect=responses) as run:
            result, code = rs.audit('Owner/Repo')
        self.assertEqual(code, 0)
        rs.validate(result)
        self.assertNotIn('DO_NOT_PRINT', json.dumps(result))
        self.assertEqual(len(run.call_args_list), 3)
        for call in run.call_args_list:
            cmd = call.args[0]
            self.assertEqual(cmd[:7], ['gh', 'api', '--hostname', 'github.com', '--method', 'GET', '-H'])
            self.assertEqual(call.kwargs['timeout'], 15)
            self.assertEqual(call.kwargs['env']['GH_PROMPT_DISABLED'], '1')
        self.assertTrue(run.call_args_list[-1].args[0][-1].endswith('/release%2Fmain/protection'))

    def test_errors_unknown_no_leak(self):
        for failure in (None, b'[]', b'not-json SECRET'):
            with patch.object(rs, 'bounded_stdout', return_value=failure):
                result, code = rs.audit('owner/repo')
            self.assertEqual(code, 2)
            self.assertNotIn('SECRET', json.dumps(result))
            self.assertTrue(all(v['status'] == 'unknown' for v in result['settings'].values()))
        for error in (subprocess.TimeoutExpired('SECRET', 1), FileNotFoundError('SECRET')):
            with patch.object(rs, 'bounded_stdout', side_effect=error):
                self.assertEqual(rs.audit('owner/repo')[1], 2)

    def test_missing_fields_schema_drift_and_target(self):
        for changed in ({}, {'full_name': 'other/repo'}, {'full_name': 'owner/repo', 'allow_auto_merge': 1}):
            with patch.object(rs, 'get', return_value=changed):
                result, code = rs.audit('owner/repo')
                self.assertEqual(code, 2)
                self.assertEqual(result['settings']['repo.allow_auto_merge'], rs.unknown())
        responses = self.responses()
        responses[2]['required_pull_request_reviews'] = None
        responses[1]['can_approve_pull_request_reviews'] = 'false'
        with patch.object(rs, 'get', side_effect=responses):
            result, code = rs.audit('owner/repo')
        self.assertEqual(code, 2)
        self.assertEqual(result['settings']['protection.required_approving_review_count'], rs.unknown())


class TransportTests(unittest.TestCase):
    def run_child(self, source, timeout=2):
        real_popen = subprocess.Popen
        children = []
        def launch(*args, **kwargs):
            self.assertEqual(kwargs['stderr'], subprocess.DEVNULL)
            self.assertEqual(kwargs['stdout'], subprocess.PIPE)
            child = real_popen(*args, **kwargs)
            children.append(child)
            return child
        started = time.monotonic()
        with patch.object(rs.subprocess, 'Popen', side_effect=launch):
            result = rs.bounded_stdout([sys.executable, '-B', '-c', source], timeout, os.environ.copy())
        self.assertLess(time.monotonic() - started, timeout + 3)
        self.assertIsNotNone(children[0].poll())
        self.assertTrue(children[0].stdout.closed)
        return result

    def test_oversize_stdout_killed_before_sleep(self):
        self.assertIsNone(self.run_child("import sys,time; sys.stdout.buffer.write(b'x'*(2*1024*1024)); sys.stdout.flush(); time.sleep(20)"))

    def test_large_stderr_discarded(self):
        self.assertEqual(self.run_child("import sys; sys.stderr.buffer.write(b'x'*(2*1024*1024)); sys.stderr.flush(); print('{}')"), b'{}\r\n' if os.name == 'nt' else b'{}\n')

    def test_timeout_and_nonzero(self):
        self.assertIsNone(self.run_child('import time; time.sleep(20)', 0.2))
        self.assertIsNone(self.run_child("import sys,time; sys.stderr.buffer.write(b'x'*(2*1024*1024)); sys.stderr.flush(); time.sleep(20)", 0.3))
        self.assertIsNone(self.run_child("import sys; print('{}'); sys.exit(1)"))

    def test_exact_limit_and_read_bound(self):
        self.assertEqual(len(self.run_child("import sys; sys.stdout.buffer.write(b'x'*(1024*1024))")), rs.LIMIT)
        original = os.read
        total = 0
        def read(fd, size):
            nonlocal total
            self.assertLessEqual(size, min(65536, rs.LIMIT + 1 - total))
            chunk = original(fd, size)
            total += len(chunk)
            return chunk
        with patch.object(rs.os, 'read', side_effect=read):
            self.assertIsNone(self.run_child("import sys; sys.stdout.buffer.write(b'x'*(2*1024*1024))"))
        self.assertEqual(total, rs.LIMIT + 1)


class CLITests(unittest.TestCase):
    def test_audit_output_creation_and_preservation(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'audit.json'
            args = ['audit', '--repo', 'owner/repo', '--output', str(target)]
            with patch.object(rs, 'audit', return_value=(snapshot(), 0)), patch('sys.stdout', new_callable=io.StringIO) as stdout:
                self.assertEqual(rs.main(args), 0)
                self.assertEqual(json.loads(stdout.getvalue()), json.loads(target.read_text(encoding='utf-8')))
            original = target.read_bytes()
            with patch.object(rs, 'audit', return_value=(snapshot(), 0)), patch('sys.stdout', new_callable=io.StringIO) as stdout:
                self.assertEqual(rs.main(args), 2)
                self.assertEqual(json.loads(stdout.getvalue())['error'], 'output_unavailable')
                self.assertNotIn(directory, stdout.getvalue())
            self.assertEqual(target.read_bytes(), original)
            with patch.object(rs, 'audit', return_value=(snapshot(), 0)), patch('sys.stdout', new_callable=io.StringIO) as stdout:
                self.assertEqual(rs.main(['audit', '--repo', 'owner/repo', '--output', str(target / 'missing.json')]), 2)
                self.assertNotIn(directory, stdout.getvalue())

    def test_audit_subprocess_fixture_failures(self):
        # Load the real entry point in a child process, replacing only transport.
        driver = (
            "import runpy,sys,subprocess; from unittest.mock import patch; "
            "m=runpy.run_path(sys.argv[1]); "
            "failure=None; "
            "m['main'].__globals__['bounded_stdout']=lambda *a,**k: failure; "
            "sys.exit(m['main'](['audit','--repo','owner/repo']))"
        )
        child = subprocess.run([sys.executable, '-B', '-c', driver, str(SCRIPT)],
                               capture_output=True, text=True, timeout=10)
        self.assertEqual(child.returncode, 2)
        self.assertEqual(child.stderr, '')
        self.assertNotIn('SECRET', child.stdout)
        self.assertEqual(json.loads(child.stdout)['settings']['repo.default_branch'], rs.unknown())

    def invoke(self, *args):
        result = subprocess.run([sys.executable, '-B', str(SCRIPT), *args],
                                capture_output=True, text=True, timeout=10,
                                env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
        self.assertEqual(result.stderr, '')
        return json.loads(result.stdout), result.returncode

    def test_fixture_commands(self):
        with tempfile.TemporaryDirectory() as directory:
            paths = {name: str(Path(directory) / (name + '.json')) for name in ('profile', 'before', 'after')}
            before, after = snapshot(), snapshot()
            after['observed_at'] = '2026-09-10T01:00:00Z'
            for name, data in [('profile', profile()), ('before', before), ('after', after)]:
                Path(paths[name]).write_text(json.dumps(data), encoding='utf-8')
            self.assertEqual(self.invoke('validate-profile', '--profile', paths['profile'])[1], 0)
            self.assertEqual(self.invoke('validate-profile', '--profile', paths['profile'], '--repo', 'other/repo')[1], 2)
            self.assertEqual(self.invoke('validate-profile', '--profile', paths['profile'], '--repo', 'owner/repo')[1], 0)
            self.assertEqual(self.invoke('compare', '--snapshot', paths['after'], '--profile', paths['profile'])[1], 0)
            self.assertEqual(self.invoke('verify', '--before', paths['before'], '--after', paths['after'], '--profile', paths['profile'])[1], 0)
            for command, flags in (
                ('compare', ['--snapshot', paths['after']]),
                ('verify', ['--before', paths['before'], '--after', paths['after']]),
                ('validate-profile', []),
            ):
                target = Path(directory) / (command + '-output.json')
                output, code = self.invoke(command, *flags, '--profile', paths['profile'], '--output', str(target))
                self.assertEqual(code, 0)
                self.assertEqual(json.loads(target.read_text(encoding='utf-8')), output)
                self.assertEqual(self.invoke(command, *flags, '--profile', paths['profile'], '--output', str(target))[1], 2)
            self.assertEqual(self.invoke('compare', '--snapshot', paths['after'], '--profile', paths['profile'], '--output', paths['profile'])[1], 2)
            self.assertEqual(json.loads(Path(paths['profile']).read_text()), profile())
            after['settings']['repo.allow_auto_merge']['value'] = True
            Path(paths['after']).write_text(json.dumps(after), encoding='utf-8')
            self.assertEqual(self.invoke('compare', '--snapshot', paths['after'], '--profile', paths['profile'])[1], 1)
            Path(paths['after']).write_text('{"secret":', encoding='utf-8')
            output, code = self.invoke('compare', '--snapshot', paths['after'], '--profile', paths['profile'])
            self.assertEqual(code, 2)
            self.assertNotIn('secret', json.dumps(output))

    def test_argument_errors_no_network(self):
        for args in ((), ('audit', '--repo', 'https://invalid.example/a/b'), ('audit', '--repo', 'a/b', '--timeout', '0'),
                     ('audit', '--repo', 'a/b', '--timeout', 'nan'), ('validate-profile', '--profile', 'missing-secret-file')):
            output, code = self.invoke(*args)
            self.assertEqual(code, 2)
            self.assertNotIn('secret', json.dumps(output))


if __name__ == '__main__':
    unittest.main()
