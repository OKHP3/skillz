#!/usr/bin/env python3
"""Audit dependencies against official sources. No writes without --write.

--update-runtimes proposes same-line runtime updates; never installs or merges.
"""
from __future__ import annotations
import argparse
import ast
import gzip
import hashlib
import json
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
import yaml
from packaging.requirements import Requirement
from packaging.version import InvalidVersion, Version

ROOT = Path(__file__).resolve().parents[2]
START = '<!-- technology-latest:start -->'
END = '<!-- technology-latest:end -->'
GROUPS = ('dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies')
IMPORTS = {'yaml': 'PyYAML', 'anthropic': 'anthropic', 'mcp': 'mcp', 'packaging': 'packaging',
           'pandas': 'pandas', 'pyarrow': 'pyarrow', 'mssql_python': 'mssql-python'}
HOSTS = {'registry.npmjs.org', 'pypi.org', 'nodejs.org', 'www.python.org', 'api.github.com'}


def stable(value):
    try:
        v = Version(str(value).removeprefix('v'))
        return v if not (v.is_prerelease or v.is_devrelease or v.local) else None
    except InvalidVersion:
        return None


def highest(values):
    candidates = [(stable(v), str(v).removeprefix('v')) for v in values if stable(v)]
    if not candidates:
        raise ValueError('No stable release in source metadata')
    return max(candidates)[1]


def get(url, as_json=True):
    if urlparse(url).scheme != 'https' or urlparse(url).hostname not in HOSTS:
        raise ValueError('Unapproved metadata endpoint')
    headers = {'User-Agent': 'OKHP3-skillz-technology-inventory/2.0', 'Accept-Encoding': 'gzip, identity'}
    if urlparse(url).hostname == 'api.github.com' and os.environ.get('GH_TOKEN'):
        headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    with urlopen(Request(url, headers=headers), timeout=30) as response:
        body = response.read()
        if response.headers.get('Content-Encoding') == 'gzip':
            body = gzip.decompress(body)
    text = body.decode('utf-8')
    return json.loads(text) if as_json else text


def files_in(root):
    return sorted(set(subprocess.check_output(
        ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        cwd=root).decode('utf-8').split('\0')) - {''})


def discover(root, files=None):
    files = files if files is not None else files_in(root)
    workspace = yaml.safe_load((root / 'pnpm-workspace.yaml').read_text())
    lock = yaml.safe_load((root / 'pnpm-lock.yaml').read_text())
    rows, inputs, manifests, excluded, internal = {}, set(), [], [], []

    def add(ecosystem, name, source=None, declared=None, resolved=None, role='direct'):
        key = f'{ecosystem}:{name}'
        row = rows.setdefault(key, {'ecosystem': ecosystem, 'name': name,
                                   'declarations': [], 'locked': [], 'roles': []})
        if source:
            entry = {'path': source, 'requirement': str(declared) if declared is not None else 'unversioned import'}
            if entry not in row['declarations']:
                row['declarations'].append(entry)
            inputs.add(source)
        if resolved and resolved not in row['locked']:
            row['locked'].append(resolved)
        if role not in row['roles']:
            row['roles'].append(role)

    for path in files:
        if path.startswith('docs/archive/'):
            if path.endswith(('package.json', 'package-lock.json')):
                excluded.append(path)
            continue
        full = root / path
        if not full.is_file() or full.is_symlink():
            continue
        if path.endswith('package.json'):
            manifests.append(path)
            inputs.add(path)
            data = json.loads(full.read_text(encoding='utf-8'))
            importer = str(Path(path).parent).replace('\\', '/')
            for group in GROUPS:
                for name, req in data.get(group, {}).items():
                    if req.startswith(('workspace:', 'link:', 'file:')):
                        internal.append({'path': path, 'name': name, 'requirement': req})
                        continue
                    if req.startswith('catalog:'):
                        catalog = req.removeprefix('catalog:')
                        req = (workspace.get('catalogs', {}).get(catalog, {}) if catalog else workspace.get('catalog', {}))[name]
                    entry = lock.get('importers', {}).get(importer, {}).get(group, {}).get(name, {})
                    resolved = str(entry.get('version', '')).split('(')[0] or None
                    add('npm', name, path, req, resolved, 'peer' if group == 'peerDependencies' else 'direct')
        elif re.search(r'requirements[-\w]*\.txt$', path):
            inputs.add(path)
            for line in full.read_text(encoding='utf-8').splitlines():
                line = line.split('#', 1)[0].strip()
                if line:
                    req = Requirement(line)  # unsupported directives fail instead of silently disappearing
                    add('pypi', req.name, path, str(req.specifier) or 'unbounded')
        elif path.endswith('.py'):
            tree = ast.parse(full.read_text(encoding='utf-8-sig'), filename=path)
            for node in ast.walk(tree):
                modules = [a.name.split('.')[0] for a in node.names] if isinstance(node, ast.Import) else (
                    [node.module.split('.')[0]] if isinstance(node, ast.ImportFrom) and node.module and not node.level else [])
                for module in modules:
                    if module in IMPORTS:
                        add('pypi', IMPORTS[module], path, role='script import')
        elif path.startswith('.github/workflows/') and path.endswith(('.yml', '.yaml')):
            inputs.add(path)
            for name, ref in re.findall(r'uses:\s*([\w.-]+/[\w.-]+)(?:/[^\s@]+)?@([^\s#]+)', full.read_text()):
                add('github', name, path, ref, role='CI action')
            for ref in re.findall(r'github.com/rhysd/actionlint/cmd/actionlint@(v[\d.]+)', full.read_text()):
                add('github', 'rhysd/actionlint', path, ref, role='CI tool; manual release PR')
    for name, req in workspace.get('catalog', {}).items():
        add('npm', name, 'pnpm-workspace.yaml', req, role='catalog')
    for selector, req in workspace.get('overrides', {}).items():
        if req == '-':
            continue
        if req.startswith('npm:'):
            name, version = req[4:].rsplit('@', 1)
        else:
            name, version = selector.rsplit('>', 1)[-1], req
        add('npm', name, 'pnpm-workspace.yaml', version, role='override')
    for entry in lock.get('packages', {}):
        name, version = entry.split('(')[0].rsplit('@', 1)
        add('npm', name, resolved=version, role='lock graph')
    package = json.loads((root / 'package.json').read_text())
    add('npm', 'pnpm', 'package.json', package.get('packageManager', 'CI major 10; exact version unpinned'), role='package manager')
    add('npm', 'npm', role='Node bundled tool')
    for path in ['pnpm-lock.yaml', 'pnpm-workspace.yaml', '.replit', '.github/node-version',
                 '.github/python-version', 'tsconfig.base.json']:
        if (root / path).exists():
            inputs.add(path)
    for row in rows.values():
        for field in ('locked', 'roles'):
            row[field].sort()
        row['declarations'].sort(key=lambda d: (d['path'], d['requirement']))
    return {'rows': dict(sorted(rows.items())), 'manifests': manifests, 'excluded_archives': excluded,
            'internal_workspace_links': internal, 'lock_entries': len(lock.get('packages', {})),
            'inputs': {p: hashlib.sha256((root / p).read_text(encoding='utf-8').encode('utf-8')).hexdigest()
                       for p in sorted(inputs)}}


def npm_release(name, fetch=get):
    url = 'https://registry.npmjs.org/' + quote(name, safe='')
    data = fetch(url)
    latest = data.get('dist-tags', {}).get('latest')
    if latest not in data['versions']:
        raise ValueError(f'npm latest tag for {name} is absent')
    if not stable(latest):
        candidates = [v for v in data['versions'] if stable(v)]
        if not candidates:
            return {'latest': None, 'source': url, 'basis': 'no stable release published',
                    'latest_prerelease': latest}
        latest = highest(candidates)
    meta = data['versions'][latest]
    result = {'latest': latest, 'source': url, 'basis': 'npm stable latest tag',
              'engines': meta.get('engines', {}), 'deprecated': meta.get('deprecated', '')}
    if name == 'pnpm':
        result['tracked_major_latest'] = highest(v for v in data['versions'] if v.startswith('10.'))
    return result


def pypi_release(name, fetch=get):
    url = f'https://pypi.org/pypi/{quote(name, safe="")}/json'
    data = fetch(url)
    latest = highest(v for v, assets in data['releases'].items()
                     if assets and any(not a.get('yanked', False) for a in assets))
    return {'latest': latest, 'source': url, 'basis': 'highest non-yanked stable PyPI release'}


def github_release(name, fetch=get):
    url = f'https://api.github.com/repos/{name}/releases/latest'
    data = fetch(url)
    if data.get('draft') or data.get('prerelease') or not stable(data['tag_name']):
        raise ValueError(f'No stable GitHub release for {name}')
    tags = fetch(f'https://api.github.com/repos/{name}/tags?per_page=100')
    return {'latest': data['tag_name'].removeprefix('v'), 'source': data['html_url'],
            'basis': 'publisher latest stable GitHub release',
            'tags': {t['name']: t['commit']['sha'] for t in tags}}


def runtime_releases(root, fetch=get):
    node_url = 'https://nodejs.org/dist/index.json'
    nodes = fetch(node_url)
    node_pin = (root / '.github/node-version').read_text().strip()
    python_pin = (root / '.github/python-version').read_text().strip()
    python_url = 'https://www.python.org/downloads/'
    pythons = re.findall(r'>Python (\d+\.\d+\.\d+)</a>', fetch(python_url, False))
    return {
        'Node.js': {'current': node_pin, 'latest': highest(n['version'] for n in nodes),
                    'latest_lts': highest(n['version'] for n in nodes if n['lts']),
                    'target': highest(n['version'] for n in nodes if n['lts'] and
                                      n['version'].removeprefix('v').split('.')[0] == node_pin.split('.')[0]),
                    'source': node_url},
        'Python': {'current': python_pin, 'latest': highest(pythons),
                   'target': highest(v for v in pythons if v.split('.')[:2] == python_pin.split('.')[:2]),
                   'source': python_url}}


def compare(row, latest):
    if latest is None:
        return 'no stable release published; review prerelease dependency'
    if not row['locked']:
        return 'declared only; installed version unknown'
    versions = [stable(v) for v in row['locked']]
    if not all(versions):
        return 'non-stable or non-semver lock entry; review'
    target = stable(latest)
    if any(v > target for v in versions):
        return 'ahead of latest tag; review (never downgrade)'
    if all(v == target for v in versions):
        return 'current'
    return 'major upgrade review' if any(v.major < target.major for v in versions) else 'update available'


def collect(root, discovery, cached=None):
    upstream, errors = {}, []
    resolvers = {'npm': npm_release, 'pypi': pypi_release, 'github': github_release}
    def resolve(item):
        key, row = item
        try:
            return key, cached['upstream'][key] if cached else resolvers[row['ecosystem']](row['name']), None
        except Exception as exc:
            return key, None, f'{key}: {type(exc).__name__}: {exc}'
    with ThreadPoolExecutor(max_workers=8) as pool:
        for key, result, error in pool.map(resolve, discovery['rows'].items()):
            if error:
                errors.append(error)
            else:
                upstream[key] = result
    if errors:
        raise RuntimeError('Incomplete upstream coverage; no files changed:\n' + '\n'.join(errors))
    runtimes = cached['runtimes'] if cached else runtime_releases(root)
    return upstream, runtimes


def cell(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')


def render(snapshot):
    rows = snapshot['discovery']['rows']
    direct = [k for k, r in rows.items() if r['roles'] != ['lock graph']]
    transitive = [k for k in rows if k not in direct]
    lines = [START, f"Last successful verification: {snapshot['checked_at']} (UTC).", '',
             f"Coverage: **{len(direct)} direct, catalog, script, CI and tool entries**, "
             f"**{len(transitive)} additional transitive package names**, "
             f"**{snapshot['discovery']['lock_entries']} lockfile package/version entries**, "
             f"**{len(snapshot['discovery']['manifests'])} active package manifests**.", '',
             'All npm lockfile entries are inventoried, including optional platform packages. '
             'Resolution does not prove installation or runtime use. Python requirements '
             'and action SHAs are declarations, not installed version claims.', '',
             '### CI runtime pins', '', '| Technology | In place | Latest stable | Bounded update target | Source |',
             '| --- | --- | --- | --- | --- |']
    for name, r in snapshot['runtimes'].items():
        latest = r['latest'] + (f"; LTS {r['latest_lts']}" if 'latest_lts' in r else '')
        lines.append(f"| {name} | {r['current']} | {latest} | {r['target']} | [official releases]({r['source']}) |")
    for title, keys in [('Direct dependencies, scripts, CI and tools', direct), ('Transitive dependency appendix', transitive)]:
        lines += ['', f'### {title}', '', '| Technology | Declared | Locked / referenced | Latest stable | Assessment |',
                  '| --- | --- | --- | --- | --- |']
        for key in keys:
            r, u = rows[key], snapshot['upstream'][key]
            reqs = '; '.join(sorted({d['requirement'] for d in r['declarations']})) or 'transitive'
            locked = ', '.join(r['locked']) or 'not locked'
            status = compare(r, u['latest'])
            if r['ecosystem'] == 'github':
                refs = {d['requirement'] for d in r['declarations']}
                tags = [tag for tag, sha in u['tags'].items() if (sha in refs or tag in refs) and stable(tag)]
                locked = ', '.join(sorted(tags)) or 'SHA (release name unresolved)'
                reqs = ', '.join(sorted(refs))
                status = 'Dependabot SHA update; review release' if not tags or highest(tags) != u['latest'] else 'current release'
                if 'CI tool; manual release PR' in r['roles']:
                    status = 'manual tool-pin PR; not managed by Dependabot'
            if key == 'npm:pnpm':
                status = f"track 10.x ({u['tracked_major_latest']}); latest major requires migration"
            if u.get('deprecated'):
                status += '; upstream deprecated'
            label = f"{r['ecosystem']} / {r['name']}"
            lines.append('| ' + ' | '.join(map(cell, [label, reqs, locked,
                         f"[{u['latest'] or 'none published'}]({u['source']})", status])) + ' |')
    lines += ['', 'Declaration paths, source URLs, engine requirements, and input hashes are in '
              '[technology-inventory.json](technology-inventory.json).', END]
    return '\n'.join(lines)


def bounded_updates(root, snapshot):
    changes = {}
    for name, filename, width in [('Node.js', 'node-version', 1), ('Python', 'python-version', 2)]:
        path = root / '.github' / filename
        current = path.read_text().strip()
        target = snapshot['runtimes'][name]['target']
        if not stable(target) or target.split('.')[:width] != current.split('.')[:width]:
            raise ValueError('Runtime target crosses the approved release line')
        if Version(target) > Version(current):
            changes[path] = target + '\n'
    path = root / 'package.json'
    package = json.loads(path.read_text())
    pin = package.get('packageManager', '')
    target = snapshot['upstream']['npm:pnpm']['tracked_major_latest']
    if not pin.startswith('pnpm@10.') or not stable(target) or not target.startswith('10.'):
        raise ValueError('Expected an approved pnpm 10.x packageManager pin')
    if Version(target) > Version(pin.split('@', 1)[1]):
        package['packageManager'] = 'pnpm@' + target
        changes[path] = json.dumps(package, indent=2) + '\n'
    return changes


def save(root, snapshot, updates=None):
    docpath, jsonpath = root / 'docs/TECHNOLOGY-INVENTORY.md', root / 'docs/technology-inventory.json'
    document = docpath.read_text(encoding='utf-8')
    if document.count(START) != 1 or document.count(END) != 1 or document.index(START) > document.index(END):
        raise ValueError('Exactly one ordered inventory marker pair is required')
    if jsonpath.exists():
        previous = json.loads(jsonpath.read_text(encoding='utf-8'))
        if {k:v for k,v in previous.items() if k != 'checked_at'} == {k:v for k,v in snapshot.items() if k != 'checked_at'}:
            snapshot['checked_at'] = previous['checked_at']
    output = document[:document.index(START)] + render(snapshot) + document[document.index(END) + len(END):]
    writes = {docpath: output, jsonpath: json.dumps(snapshot, indent=2, sort_keys=True) + '\n', **(updates or {})}
    for path, content in writes.items():
        if not path.exists() or path.read_text(encoding='utf-8') != content:
            path.write_text(content, encoding='utf-8', newline='\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--update-runtimes', action='store_true')
    parser.add_argument('--offline', action='store_true', help='replay saved upstream observations, never call them fresh')
    parser.add_argument('--discover-only', action='store_true')
    args = parser.parse_args()
    if args.update_runtimes and (not args.write or args.offline):
        parser.error('--update-runtimes requires --write and live metadata')
    discovery = discover(ROOT)
    if args.discover_only:
        print(json.dumps({'names': len(discovery['rows']), 'lock_entries': discovery['lock_entries'],
                          'manifests': len(discovery['manifests']), 'excluded': discovery['excluded_archives']}, indent=2))
        return 0
    cached = json.loads((ROOT / 'docs/technology-inventory.json').read_text()) if args.offline else None
    upstream, runtimes = collect(ROOT, discovery, cached)
    snapshot = {'schema_version': 2, 'checked_at': cached['checked_at'] if cached else datetime.now(UTC).date().isoformat(),
                'discovery': discovery, 'upstream': upstream, 'runtimes': runtimes}
    updates = bounded_updates(ROOT, snapshot) if args.update_runtimes else {}
    if updates:
        snapshot['proposed_runtime_updates'] = {str(p.relative_to(ROOT)).replace('\\', '/'): c.strip()
                                               for p,c in updates.items() if p.name != 'package.json'}
        if ROOT / 'package.json' in updates:
            snapshot['proposed_runtime_updates']['package.json#packageManager'] = 'pnpm@' + upstream['npm:pnpm']['tracked_major_latest']
    if args.write:
        save(ROOT, snapshot, updates)
    print(f"{'Offline replay' if args.offline else 'Verified live'}: {len(discovery['rows'])} technologies; "
          f"{discovery['lock_entries']} lock entries; {len(updates)} runtime proposals.")
    if not args.write:
        print(render(snapshot))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
