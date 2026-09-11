"""Read-only v2 repository settings CLI (Python 3.12+ standard library).

Usage: audit --repo OWNER/NAME [--timeout 15]; compare --snapshot FILE
--profile FILE; verify --before FILE --after FILE --profile FILE;
validate-profile --profile FILE. All commands emit JSON, including errors/help.
All commands accept --output FILE to also save JSON to a new UTF-8 file.
Existing output files are refused, including input files; write failures exit 2.
Exit 0: complete audit / compliant expected settings / valid profile.
Exit 1: drift. Exit 2: unknown or invalid input (takes precedence over drift).
Compliance covers only profile expectations, never unsupported manual controls.
Audit makes at most three GET calls, each bounded by --timeout (1..60 seconds).
Input files are bounded to 1 MiB. No response bodies or diagnostic text are emitted.
Branch strings use a conservative ASCII allowlist; unsupported names are unknown.
Validation cannot identify arbitrary secrets disguised as valid repository/branch names.
"""

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
from urllib.parse import quote

sys.dont_write_bytecode = True
LIMIT = 1024 * 1024
KEYS = {
    'repo.allow_auto_merge': bool,
    'repo.delete_branch_on_merge': bool,
    'repo.default_branch': str,
    'actions.default_workflow_permissions': str,
    'actions.can_approve_pull_request_reviews': bool,
    'protection.required_approving_review_count': int,
    'protection.allow_force_pushes': bool,
    'protection.allow_deletions': bool,
    'protection.enforce_admins': bool,
}
MANUAL = ('copilot', 'effective_rules', 'workflow_coverage')


class Invalid(ValueError):
    pass


def require(condition):
    if not condition:
        raise Invalid('invalid_input')


def repository(value):
    require(type(value) is str and len(value) <= 140)
    require(re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?/[A-Za-z0-9_.-]{1,100}', value) is not None)
    owner, name = value.split('/')
    require('--' not in owner and name not in ('.', '..') and not name.endswith('.git'))
    return value.lower()


def scalar(key, value):
    require(key in KEYS and type(value) is KEYS[key])
    if key == 'repo.default_branch':
        require(0 < len(value) <= 255 and re.fullmatch(r'[A-Za-z0-9_./-]+', value) is not None)
        require(not any(c in value for c in '~^:?*[\\') and '..' not in value and '@{' not in value)
        require(not value.startswith(('/', '-')) and not value.endswith(('/', '.')))
        require(all(p and not p.startswith('.') and not p.endswith('.lock') for p in value.split('/')))
    if key == 'actions.default_workflow_permissions':
        require(value in ('read', 'write'))
    if key == 'protection.required_approving_review_count':
        require(0 <= value <= 6)
    return value


def timestamp(value):
    require(type(value) is str and len(value) <= 27 and re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z', value) is not None)
    try:
        return dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        raise Invalid('invalid_input') from None


def pairs(items):
    result = {}
    for key, value in items:
        require(key not in result)
        result[key] = value
    return result


def decode(data):
    try:
        return json.loads(data, object_pairs_hook=pairs,
                          parse_constant=lambda _: require(False))
    except (ValueError, UnicodeError, RecursionError):
        raise Invalid('invalid_json') from None


def read(path):
    try:
        with open(path, 'rb') as stream:
            data = stream.read(LIMIT + 1)
        require(len(data) <= LIMIT)
        return decode(data)
    except OSError:
        raise Invalid('unreadable_input') from None


def validate(doc, profile=False):
    require(type(doc) is dict)
    fields = {'schema_version', 'repository', 'expected'} if profile else {
        'schema_version', 'repository', 'observed_at', 'settings'}
    require(set(doc) == fields or (not profile and set(doc) == fields | {'unsupported'}))
    require(type(doc['schema_version']) is int and doc['schema_version'] == 2)
    repository(doc['repository'])
    values = doc['expected'] if profile else doc['settings']
    require(type(values) is dict and set(values) <= set(KEYS))
    if profile:
        require(bool(values))
        for key, value in values.items():
            scalar(key, value)
    else:
        timestamp(doc['observed_at'])
        for key, entry in values.items():
            require(type(entry) is dict and set(entry) == {'status', 'value'})
            require(entry['status'] in ('known', 'unknown'))
            if entry['status'] == 'unknown':
                require(entry['value'] is None)
            else:
                scalar(key, entry['value'])
        if 'unsupported' in doc:
            require(doc['unsupported'] == manual())
    return doc


def unknown():
    return {'status': 'unknown', 'value': None}


def manual():
    return {'manual_controls': {key: unknown() for key in MANUAL}}


def bounded_stdout(command, timeout, env):
    """Read at most LIMIT+1 bytes; discard stderr, kill/reap on every exit.

    Nonblocking pipes require Python 3.12+ on Windows. If unavailable, fail
    closed. No reader threads or communicate/capture_output buffers are used.
    """
    deadline = time.monotonic() + timeout
    with subprocess.Popen(command, stdin=subprocess.DEVNULL,
                          stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                          env=env, bufsize=0) as child:
        try:
            os.set_blocking(child.stdout.fileno(), False)
            data = bytearray()
            while True:
                if time.monotonic() >= deadline:
                    return None
                try:
                    chunk = os.read(child.stdout.fileno(), min(65536, LIMIT + 1 - len(data)))
                except BlockingIOError:
                    time.sleep(min(0.01, max(0, deadline - time.monotonic())))
                    continue
                if not chunk:
                    remaining = deadline - time.monotonic()
                    if remaining <= 0 or child.wait(timeout=remaining) != 0:
                        return None
                    return data
                data.extend(chunk)
                if len(data) > LIMIT:
                    return None
        finally:
            if child.poll() is None:
                child.kill()
            child.wait()
            child.stdout.close()


def get(endpoint, timeout):
    env = os.environ.copy()
    env.update(GH_PROMPT_DISABLED='1', GH_PAGER='cat')
    try:
        result = bounded_stdout(
            ['gh', 'api', '--hostname', 'github.com', '--method', 'GET',
             '-H', 'Accept: application/vnd.github+json', endpoint],
            timeout=timeout, env=env)
        if result is None:
            return None
        value = decode(result)
        return value if type(value) is dict else None
    except (OSError, subprocess.TimeoutExpired, Invalid):
        return None


def extract(settings, key, data, *path):
    try:
        for part in path:
            require(type(data) is dict and part in data)
            data = data[part]
        settings[key] = {'status': 'known', 'value': scalar(key, data)}
    except Invalid:
        settings[key] = unknown()


def audit(repo, timeout=15):
    repo = repository(repo)
    require(type(timeout) is int and 1 <= timeout <= 60)
    settings = {key: unknown() for key in KEYS}
    base = '/repos/' + repo
    data = get(base, timeout)
    try:
        require(type(data) is dict and repository(data.get('full_name')) == repo)
    except Invalid:
        data = None
    if data is not None:
        for key in KEYS:
            if key.startswith('repo.'):
                extract(settings, key, data, key.split('.')[1])
        actions = get(base + '/actions/permissions/workflow', timeout)
        for key in KEYS:
            if key.startswith('actions.'):
                extract(settings, key, actions, key.split('.')[1])
        branch = settings['repo.default_branch']
        if branch['status'] == 'known':
            protection = get(base + '/branches/' + quote(branch['value'], safe='') + '/protection', timeout)
            extract(settings, 'protection.required_approving_review_count', protection,
                    'required_pull_request_reviews', 'required_approving_review_count')
            for field in ('allow_force_pushes', 'allow_deletions', 'enforce_admins'):
                extract(settings, 'protection.' + field, protection, field, 'enabled')
    result = {'schema_version': 2, 'repository': repo,
              'observed_at': dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z'),
              'settings': settings, 'unsupported': manual()}
    return result, 2 if any(v['status'] == 'unknown' for v in settings.values()) else 0


def compare(snapshot, profile):
    validate(snapshot)
    validate(profile, True)
    require(repository(snapshot['repository']) == repository(profile['repository']))
    results = {}
    for key, expected in profile['expected'].items():
        entry = snapshot['settings'].get(key, unknown())
        state = 'unknown' if entry['status'] == 'unknown' else (
            'compliant' if entry['value'] == expected else 'drift')
        results[key] = {'status': state, 'expected': expected, 'observed': entry['value']}
    states = {v['status'] for v in results.values()}
    status = 'unknown' if 'unknown' in states else 'drift' if 'drift' in states else 'compliant'
    return {'schema_version': 2, 'repository': repository(profile['repository']),
            'status': status, 'results': results, 'unsupported': manual()}, {
                'compliant': 0, 'drift': 1, 'unknown': 2}[status]


def verify(before, after, profile):
    validate(before)
    result, code = compare(after, profile)
    require(repository(before['repository']) == repository(after['repository']))
    require(timestamp(before['observed_at']) < timestamp(after['observed_at']))
    changes = {}
    uncertain = []
    for key in KEYS:
        old = before['settings'].get(key, unknown())
        new = after['settings'].get(key, unknown())
        if old['status'] == 'unknown' or new['status'] == 'unknown':
            uncertain.append(key)
        elif old['value'] != new['value']:
            changes[key] = {'before': old['value'], 'after': new['value']}
    result.update(current_compliance=result['status'], changes=changes,
                  unknown_changes=uncertain, before_observed_at=before['observed_at'],
                  after_observed_at=after['observed_at'], causation='not_established')
    if uncertain:
        result['status'], code = 'unknown', 2
    return result, code


class Parser(argparse.ArgumentParser):
    def error(self, message):
        raise Invalid('invalid_arguments')

    def print_help(self, file=None):
        print(json.dumps({'help': self.format_help()}))


def main(argv=None):
    parser = Parser(description=__doc__)
    subs = parser.add_subparsers(dest='command', required=True)
    p = subs.add_parser('audit')
    p.add_argument('--repo', required=True)
    p.add_argument('--timeout', type=int, default=15)
    p.add_argument('--output')
    for command in ('compare', 'verify', 'validate-profile'):
        p = subs.add_parser(command)
        p.add_argument('--profile', required=True)
        p.add_argument('--output')
        if command == 'validate-profile':
            p.add_argument('--repo')
        for flag in (('snapshot',) if command == 'compare' else ('before', 'after') if command == 'verify' else ()):
            p.add_argument('--' + flag, required=True)
    args = None
    try:
        args = parser.parse_args(argv)
        if args.command == 'audit':
            result, code = audit(args.repo, args.timeout)
        else:
            profile = validate(read(args.profile), True)
            if args.command == 'compare':
                result, code = compare(read(args.snapshot), profile)
            elif args.command == 'verify':
                result, code = verify(read(args.before), read(args.after), profile)
            else:
                if args.repo is not None:
                    require(repository(args.repo) == repository(profile['repository']))
                result, code = {'schema_version': 2, 'status': 'complete',
                                'repository': repository(profile['repository'])}, 0
    except (Invalid, TypeError, KeyError, RecursionError):
        result, code = {'schema_version': 2, 'status': 'unknown', 'error': 'invalid_or_unavailable_input'}, 2
    if args is not None and args.output:
        try:
            with open(args.output, 'x', encoding='utf-8', newline='\n') as stream:
                stream.write(json.dumps(result, sort_keys=True, allow_nan=False) + '\n')
        except (OSError, ValueError):
            result, code = {'schema_version': 2, 'status': 'unknown', 'error': 'output_unavailable'}, 2
    print(json.dumps(result, sort_keys=True, allow_nan=False))
    return code


if __name__ == '__main__':
    sys.exit(main())
