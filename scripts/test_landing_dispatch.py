"""Offline regression tests for the actual workflow shell, with curl stubbed."""
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / '.github/workflows/verify-skill-landing.yml'
DISPATCH_STEP_NAME = 'Dispatch repository_dispatch to glee-fully-chai-chasers'


def dispatch_step(workflow):
    matches = [step for step in workflow['jobs']['dispatch-verify']['steps']
               if step.get('name') == DISPATCH_STEP_NAME]
    if len(matches) != 1:
        raise ValueError('Expected exactly one named landing dispatch step')
    return matches[0]


class LandingDispatchTests(unittest.TestCase):
    def setUp(self):
        # BaseLoader preserves GitHub's `on` key, unlike YAML 1.1 bool loading.
        self.workflow = yaml.load(WORKFLOW.read_text(), Loader=yaml.BaseLoader)
        self.step = dispatch_step(self.workflow)

    def run_dispatch(self, sha='a' * 40, token='test-only', ref='refs/heads/main', curl_exit=0):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            curl = root / 'curl'
            curl.write_text('#!/bin/bash\n'
                            'has_json_header=false\n'
                            'while (( $# )); do\n'
                            '  if [[ "$1" == "--header" && "$2" == "Content-Type: application/json" ]]; then\n'
                            '    has_json_header=true\n'
                            '  fi\n'
                            '  if [[ "$1" == "--data" ]]; then\n'
                            '    printf "%s" "$2" > "$CAPTURE"\n'
                            '    shift\n'
                            '  fi\n'
                            '  shift\n'
                            'done\n'
                            'if [[ "$has_json_header" != true ]]; then exit 97; fi\n'
                            'exit "$CURL_EXIT"\n')
            curl.chmod(0o700)
            capture = root / 'payload.json'
            node = shutil.which('node')
            self.assertIsNotNone(node, 'Node is required to test the workflow')
            # No inherited GitHub/mail credentials and no real HTTP client.
            env = {
                'PATH': str(root) + os.pathsep + str(Path(node).parent) + ':/usr/bin:/bin',
                'PROMOTION_SHA': sha, 'VERIFY_LANDING_PAT': token,
                'GITHUB_REF': ref, 'GITHUB_SHA': 'b' * 40,
                'CAPTURE': str(capture), 'CURL_EXIT': str(curl_exit),
            }
            result = subprocess.run(['/bin/bash', '-c', self.step['run']],
                                    env=env, capture_output=True, text=True, timeout=10)
            payload = json.loads(capture.read_text()) if capture.exists() else None
            return result, payload

    def test_only_explicit_dispatch_not_ordinary_push_or_pr(self):
        self.assertEqual(set(self.workflow['on']), {'workflow_dispatch'})
        field = self.workflow['on']['workflow_dispatch']['inputs']['commit_sha']
        self.assertEqual(field['required'], 'true')
        self.assertEqual(field['type'], 'string')

    def test_requested_sha_not_workflow_head_is_dispatched(self):
        result, payload = self.run_dispatch()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(payload, {
            'event_type': 'skillz-push',
            'client_payload': {
                'commit_sha': 'a' * 40, 'ref': 'refs/heads/main',
                'triggered_by': 'OKHP3/skillz explicit promotion verification',
            },
        })

    def test_invalid_inputs_fail_before_network(self):
        for sha in ['', 'abc123', 'A' * 40, 'g' * 40, 'a' * 41,
                    'a' * 40 + '\n', ' ' + 'a' * 40, 'a' * 40 + ' ',
                    '\t' + 'a' * 40, '$(echo injected)', '\"; exit 0; #']:
            with self.subTest(sha=sha):
                result, payload = self.run_dispatch(sha=sha)
                self.assertNotEqual(result.returncode, 0)
                self.assertIsNone(payload)

    def test_missing_credential_is_not_success(self):
        result, payload = self.run_dispatch(token='')
        self.assertNotEqual(result.returncode, 0)
        self.assertIsNone(payload)

    def test_non_main_workflow_is_rejected(self):
        result, payload = self.run_dispatch(ref='refs/heads/feature')
        self.assertNotEqual(result.returncode, 0)
        self.assertIsNone(payload)

    def test_http_failure_propagates(self):
        result, _ = self.run_dispatch(curl_exit=22)
        self.assertEqual(result.returncode, 22)
        self.assertNotIn('Dispatched skillz-push', result.stdout)

    def test_dispatch_step_selection_survives_prepended_setup(self):
        workflow = copy.deepcopy(self.workflow)
        workflow['jobs']['dispatch-verify']['steps'].insert(
            0, {'name': 'Unrelated setup', 'run': 'exit 99'})
        self.step = dispatch_step(workflow)
        result, payload = self.run_dispatch()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(payload['client_payload']['commit_sha'], 'a' * 40)

    def test_missing_or_duplicate_named_step_is_rejected(self):
        workflow = copy.deepcopy(self.workflow)
        workflow['jobs']['dispatch-verify']['steps'] = []
        with self.assertRaises(ValueError):
            dispatch_step(workflow)
        workflow['jobs']['dispatch-verify']['steps'] = [self.step, self.step]
        with self.assertRaises(ValueError):
            dispatch_step(workflow)

    def test_json_content_type_is_required_by_http_stub(self):
        self.step = copy.deepcopy(self.step)
        self.step['run'] = self.step['run'].replace(
            'Content-Type: application/json', 'Content-Type: text/plain')
        result, _ = self.run_dispatch()
        self.assertEqual(result.returncode, 97)

    def test_ci_actions_are_pinned_and_track_runtime_files(self):
        ci = yaml.load((ROOT / '.github/workflows/test-landing-dispatch.yml').read_text(),
                       Loader=yaml.BaseLoader)
        steps = ci['jobs']['contract']['steps']
        actions = [step for step in steps if 'uses' in step]
        self.assertTrue(actions)
        for step in actions:
            self.assertRegex(step['uses'], r'^actions/[^@]+@[0-9a-f]{40}$')
        for action, option, path in [
                ('actions/setup-python', 'python-version-file', '.github/python-version'),
                ('actions/setup-node', 'node-version-file', '.github/node-version')]:
            step = next(step for step in actions if step['uses'].startswith(action + '@'))
            self.assertEqual(step['with'][option], path)
            self.assertNotIn(option.removesuffix('-file'), step['with'])
            for event in ['push', 'pull_request']:
                self.assertIn(path, ci['on'][event]['paths'])

    def test_inputs_use_environment_not_shell_interpolation(self):
        self.assertEqual(self.step['env']['PROMOTION_SHA'], '${{ inputs.commit_sha }}')
        self.assertNotIn('${{', self.step['run'])
        self.assertIn('--fail-with-body', self.step['run'])
        self.assertIn('--max-time 30', self.step['run'])
        self.assertEqual(self.workflow['permissions'], {'contents': 'read'})


if __name__ == '__main__':
    unittest.main()
