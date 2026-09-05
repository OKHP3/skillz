#!/usr/bin/env python3
"""Audit Git checkouts without cleanup; only optional fetch metadata is written."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import unquote

SCHEMA_VERSION = 2


def redact(value):
    """Remove URL credentials (including echoed decoded secrets) recursively."""
    if isinstance(value, dict):
        return {k: redact(v) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if not isinstance(value, str):
        return value
    value = re.sub(r'(\b[a-zA-Z][\w+.-]*://)[^\s/@]+@', r'\1[REDACTED]@', value)
    return re.sub(r'([?&](?:access_token|token|password|secret|key|api_key)=)[^\s&#]+',
                  r'\1[REDACTED]', value, flags=re.I)


class Git:
    def __init__(self, repo, timeout=60):
        self.repo, self.timeout, self.errors, self.secrets = repo, timeout, [], set()

    def clean(self, text):
        text = text.decode(errors='replace') if isinstance(text, bytes) else (text or '')
        for secret in sorted(self.secrets, key=len, reverse=True):
            text = text.replace(secret, '[REDACTED]')
        return redact(text)

    def run(self, *args, accepted=(0,)):
        env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
        env.update(GIT_TERMINAL_PROMPT='0', GIT_OPTIONAL_LOCKS='0')
        command = ['git', '-c', 'gc.auto=0', '-C', str(self.repo), *args]
        try:
            result = subprocess.run(command, text=True, capture_output=True,
                                    timeout=self.timeout, env=env)
        except (OSError, subprocess.TimeoutExpired) as exc:
            self.errors.append({'command': list(args), 'returncode': None,
                                'kind': 'timeout' if isinstance(exc, subprocess.TimeoutExpired) else 'execution',
                                'stdout': self.clean(getattr(exc, 'stdout', '')),
                                'stderr': self.clean(getattr(exc, 'stderr', '') or str(exc))})
            return None
        if result.returncode not in accepted:
            self.errors.append({'command': list(args), 'returncode': result.returncode,
                                'kind': 'git', 'stdout': self.clean(result.stdout),
                                'stderr': self.clean(result.stderr)})
            return None
        return result

    def text(self, *args):
        result = self.run(*args)
        return result.stdout.rstrip('\n') if result is not None else None

    def lines(self, *args):
        text = self.text(*args)
        return text.splitlines() if text is not None else None

    def divergence(self, ref, baseline):
        text = self.text('rev-list', '--left-right', '--count', f'{ref}...{baseline}')
        if text is None:
            return None
        try:
            ahead, behind = map(int, text.split())
        except ValueError:
            self.errors.append({'kind': 'parse', 'command': ['rev-list'], 'stdout': self.clean(text), 'stderr': 'invalid counts', 'returncode': 0})
            return None
        return {'ahead': ahead, 'behind': behind}


def inside(path, root):
    return path.resolve().is_relative_to(root.resolve())


def audit_repo(repo: Path, fetch=False, include_unreachable=False, root=None, timeout=60):
    root = root or repo
    git = Git(repo, timeout)
    record = {'path': str(repo), 'name': repo.name, 'errors': git.errors, 'coverage_holds': []}
    if git.text('rev-parse', '--git-dir') is None:
        record['complete'] = False
        return record
    origin = git.text('remote', 'get-url', 'origin')
    if origin:
        for match in re.finditer(r'://([^\s/@]+)@', origin):
            git.secrets.update(unquote(part) for part in match[1].split(':') if part)
        for match in re.finditer(r'[?&](?:access_token|token|password|secret|key|api_key)=([^&#\s]+)', origin, re.I):
            git.secrets.add(unquote(match[1]))
    record['origin'] = redact(origin)
    if fetch:
        result = git.run('fetch', '--no-prune', '--no-prune-tags', '--no-tags',
                         '--no-auto-maintenance', '--refmap=', 'origin',
                         '+refs/heads/*:refs/remotes/origin/*')
        record['fetch'] = 'ok' if result is not None else 'failed'
        record['fetch_output'] = None if result is None else {'stdout': git.clean(result.stdout), 'stderr': git.clean(result.stderr)}
    record['head'] = git.text('rev-parse', '--verify', 'HEAD')
    branch = git.run('symbolic-ref', '--short', '-q', 'HEAD', accepted=(0, 1))
    record['current_branch'] = None if branch is None else (branch.stdout.strip() if branch.returncode == 0 else 'DETACHED')
    record['working_tree'] = git.lines('status', '--porcelain=v1', '--untracked-files=all')
    record['stashes'] = git.lines('stash', 'list', '--format=%H %gd %gs')
    record['local_only_commits'] = git.lines('log', '--branches', '--tags', 'HEAD', '--not', '--remotes', '--format=%H')
    refs = git.lines('for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/remotes/origin', 'refs/archive')
    refs = dict(line.split(' ', 1) for line in refs) if refs is not None else None
    record['archive_refs'] = [ref.removeprefix('refs/') for ref in refs if ref.startswith('refs/archive/')] if refs is not None else None
    record['archive_ref_shas'] = {ref: sha for ref, sha in refs.items() if ref.startswith('refs/archive/')} if refs is not None else None
    baseline = 'refs/remotes/origin/main'
    has_main = baseline in refs if refs is not None else None
    record['has_origin_main'] = has_main
    if not has_main:
        record['coverage_holds'].append({'reason': 'missing_origin_main'})
    record['origin_main'] = refs.get(baseline) if refs is not None else None
    record['main'] = refs.get('refs/heads/main') if refs is not None else None
    record['main_vs_origin_main'] = git.divergence('refs/heads/main', baseline) if has_main and record['main'] else None
    record['head_vs_origin_main'] = git.divergence('HEAD', baseline) if has_main else None
    if record['head_vs_origin_main'] is not None:
        record['head_vs_origin_main'].update(direct_changed_files=git.lines('diff', '--name-status', baseline),
                                            changed_from_shared_base=git.lines('diff', '--name-status', f'{baseline}...HEAD'))
    for prefix, key in [('refs/heads/', 'local_branches'), ('refs/remotes/origin/', 'non_main_remote_branches')]:
        record[key] = [] if refs is not None else None
        for ref, sha in (refs or {}).items():
            if not ref.startswith(prefix):
                continue
            name = ref.removeprefix(prefix)
            if key == 'non_main_remote_branches' and name in ('main', 'HEAD'):
                continue
            item = {'name': name, 'tip': sha, 'vs_origin_main': git.divergence(ref, baseline) if has_main else None}
            if item['vs_origin_main'] is not None:
                base = git.run('merge-base', baseline, ref, accepted=(0, 1))
                if base is not None and base.returncode == 1:
                    # Orphan deployment branches are a distinct history, not
                    # corruption or a failed shared-base file comparison.
                    item['vs_origin_main']['unrelated_history'] = True
                    item['vs_origin_main']['changed_files'] = None
                    item['vs_origin_main']['direct_changed_files'] = git.lines('diff', '--name-status', baseline, ref)
                else:
                    item['vs_origin_main']['changed_files'] = git.lines('diff', '--name-status', f'{baseline}...{ref}') if base is not None else None
            if key == 'non_main_remote_branches':
                result = git.run('merge-base', '--is-ancestor', ref, baseline, accepted=(0, 1)) if has_main else None
                item['merged_into_origin_main'] = result.returncode == 0 if result is not None else None
            record[key].append(item)
    porcelain = git.text('worktree', 'list', '--porcelain', '-z')
    record['worktree_porcelain'] = porcelain
    record['worktrees'] = [] if porcelain is not None else None
    for block in (porcelain or '').split('\0\0'):
        fields = block.strip('\0').split('\0')
        if not fields[0].startswith('worktree '):
            continue
        path = Path(fields[0][9:])
        item = {'path': str(path), 'fields': fields[1:], 'working_tree': None}
        if not inside(path, root):
            item['coverage_hold'] = 'outside_root'
            record['coverage_holds'].append({'path': str(path), 'reason': 'outside_root_worktree'})
        else:
            linked = Git(path, timeout)
            item['working_tree'] = linked.lines('status', '--porcelain=v1', '--untracked-files=all')
            git.errors.extend(dict(error, worktree=str(path)) for error in linked.errors)
        record['worktrees'].append(item)
    if include_unreachable:
        result = git.run('fsck', '--full', '--no-reflogs', '--unreachable')
        record['unreachable_commits'] = [line.split()[-1] for line in result.stdout.splitlines() if line.startswith('unreachable commit ')] if result is not None else None
        record['fsck_output'] = {'stdout': git.clean(result.stdout), 'stderr': git.clean(result.stderr)} if result is not None else None
    record['complete'] = not git.errors and not record['coverage_holds']
    # Also scrub known secrets echoed in paths, ref names, or diagnostic messages.
    def scrub(value):
        if isinstance(value, dict):
            return {key: scrub(item) for key, item in value.items()}
        if isinstance(value, list):
            return [scrub(item) for item in value]
        return git.clean(value) if isinstance(value, str) else value
    return scrub(record)


def exceptions(report):
    result = {}
    for repo in report['repositories']:
        item = {key: repo.get(key) for key in ('errors', 'coverage_holds', 'working_tree', 'stashes', 'local_only_commits', 'archive_ref_shas', 'unreachable_commits') if repo.get(key)}
        if not repo.get('has_origin_main'):
            item['missing_origin_main'] = True
        if not repo.get('main'):
            item['missing_local_main'] = True
        for key in ('head_vs_origin_main', 'main_vs_origin_main'):
            value = repo.get(key)
            if value and any(value.values()):
                item[key] = value
        branches = [b for b in repo.get('local_branches') or [] if b['name'] != 'main']
        if branches:
            item['local_branches'] = branches
        if repo.get('non_main_remote_branches'):
            item['non_main_remote_branches'] = repo['non_main_remote_branches']
        dirty = [w for w in repo.get('worktrees') or [] if w.get('working_tree') or w.get('coverage_hold')]
        if dirty:
            item['worktrees'] = [{k: v for k, v in w.items() if k != 'fields'} for w in dirty]
        if item:
            result[repo['path']] = item
    if report.get('errors') or report.get('skipped_directories'):
        result['coverage'] = {k: report[k] for k in ('errors', 'skipped_directories')}
    return result


def compare(report, previous):
    try:
        old = json.loads(previous.read_text(encoding='utf-8'))
        if not isinstance(old, dict) or old.get('schema_version') != SCHEMA_VERSION or old.get('mirror_root') != report['mirror_root'] or old.get('options') != report['options'] or not isinstance(old.get('exceptions'), dict):
            raise ValueError('incompatible or missing baseline schema/root/options')
    except (OSError, ValueError) as exc:
        return {'status': 'baseline_gap', 'reason': redact(str(exc))}
    before, after = old['exceptions'], report['exceptions']
    complete = report.get('complete') and old.get('complete')
    return {'status': 'compared' if complete else 'partial_compared',
            'resolution_blocked': None if complete else 'current or previous coverage incomplete',
            'new': {k: v for k, v in after.items() if k not in before},
            'changed': {k: {'before': before[k], 'after': v} for k, v in after.items() if k in before and before[k] != v},
            'resolved': {k: v for k, v in before.items() if k not in after} if complete else {}}


def build_report(root, fetch=False, include_unreachable=False, timeout=60):
    root = root.resolve()
    report = {'schema_version': SCHEMA_VERSION, 'generated_at': datetime.now(timezone.utc).isoformat(),
              'mirror_root': str(root), 'options': {'fetch': fetch, 'include_unreachable': include_unreachable},
              'repositories': [], 'errors': [], 'skipped_directories': []}
    try:
        candidates = [root] if (root / '.git').exists() else sorted(root.iterdir())
        for path in candidates:
            if path.is_symlink() and not inside(path, root):
                report['skipped_directories'].append({'path': str(path), 'reason': 'outside_root_symlink'})
            elif path.is_dir():
                if (path / '.git').exists():
                    report['repositories'].append(audit_repo(path, fetch, include_unreachable, root, timeout))
                else:
                    report['skipped_directories'].append({'path': str(path), 'reason': 'not_git_checkout'})
    except OSError as exc:
        report['errors'].append({'kind': 'discovery', 'message': redact(str(exc))})
    report['repository_count'] = len(report['repositories'])
    if not report['repository_count']:
        report['errors'].append({'kind': 'coverage', 'message': 'zero repositories discovered'})
    report['complete'] = not report['errors'] and not report['skipped_directories'] and all(r['complete'] for r in report['repositories'])
    report['exceptions'] = exceptions(report)
    return redact(report)


def write_atomic(path, payload):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent, prefix=f'.{path.name}.', delete=False) as stream:
            temporary = stream.name
            stream.write(payload + '\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mirror_root', type=Path)
    parser.add_argument('--fetch', action='store_true')
    parser.add_argument('--include-unreachable', action='store_true')
    parser.add_argument('--timeout', type=float, default=60)
    parser.add_argument('--previous', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    if args.timeout <= 0:
        parser.error('--timeout must be positive')
    report = build_report(args.mirror_root, args.fetch, args.include_unreachable, args.timeout)
    if args.previous:
        report['comparison'] = compare(report, args.previous)
    payload = json.dumps(report, indent=2, sort_keys=True)
    try:
        if args.output:
            write_atomic(args.output, payload)
        else:
            print(payload)
    except OSError as exc:
        print(redact(str(exc)), file=sys.stderr)
        return 1
    return 0 if report['complete'] else 1


if __name__ == '__main__':
    sys.exit(main())
