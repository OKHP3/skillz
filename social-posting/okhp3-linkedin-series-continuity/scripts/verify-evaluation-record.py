#!/usr/bin/env python3
"""Verify the current synthetic evaluation record; optionally enforce promotion gate."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-passing', action='store_true', help='Exit nonzero if the independent fidelity review blocks promotion.')
    args = parser.parse_args()
    try:
        record = json.loads((ROOT / 'benchmarks/benchmark.json').read_text())
        metadata = record['metadata']
        version = metadata['evaluated_skill_version']
        assert f'version: "{version}"' in (ROOT / 'SKILL.md').read_text(), 'version mismatch'
        protocol = json.loads((ROOT / 'benchmarks' / record['protocol']['path']).read_text())
        for name, expected in protocol['sha256'].items():
            assert sha(ROOT / name) == expected, f'protocol hash mismatch: {name}'
            assert record['protocol']['package_hashes'][name] == expected, f'benchmark hash mismatch: {name}'
        counts = {arm: [0, 0] for arm in ('with_skill', 'without_skill')}
        for run in record['runs']:
            arm = run['configuration']
            response = (ROOT / 'benchmarks' / run['response']).read_text()
            assert hashlib.sha256(response.encode()).hexdigest() == run['response_sha256'], f"response mismatch: {run['case_id']} {arm}"
            trace = json.loads((ROOT / 'benchmarks' / run['events']).read_text())
            items = [event.get('item', {}).get('type') for event in trace['events'] if event.get('type') == 'item.completed']
            assert set(items) <= {'agent_message', 'reasoning', 'error'}, f"unexpected event: {run['case_id']} {arm}"
            assert run['tool_calls'] == 0, f"unexpected tool call: {run['case_id']} {arm}"
            for expectation in run['expectations']:
                counts[arm][1] += 1
                if expectation['passed']:
                    counts[arm][0] += 1
                    assert expectation['evidence'] in response, f"quote mismatch: {run['case_id']} {arm}"
        for arm, (passed, total) in counts.items():
            assert record['run_summary'][arm]['passed'] == passed and record['run_summary'][arm]['total'] == total, f'summary mismatch: {arm}'
        finding = record.get('post_run_review', {})
        if finding.get('noncompensatory_fidelity_failure'):
            response = (ROOT / 'benchmarks' / finding['response']).read_text()
            assert finding['unsupported_public_claim'] in response, 'review finding quote mismatch'
            assert metadata.get('review_decision') == 'defer-for-evidence', 'review decision contradicts critical finding'
        print('Evaluation record consistent:', counts)
        print('Independent review:', metadata.get('review_decision', 'not recorded'))
        if args.require_passing and finding.get('noncompensatory_fidelity_failure'):
            print('Promotion blocked: unresolved independent fidelity finding.', file=sys.stderr)
            return 2
        return 0
    except (AssertionError, KeyError, ValueError, OSError) as exc:
        print('Evaluation record invalid:', exc, file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
