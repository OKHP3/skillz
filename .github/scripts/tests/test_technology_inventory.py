"""Offline regression coverage for inventory and automated-write boundaries."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('inventory', Path(__file__).resolve().parents[1] / 'refresh_technology_inventory.py')
i = importlib.util.module_from_spec(spec)
spec.loader.exec_module(i)


class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        self.write('package.json', json.dumps({'name':'test','packageManager':'pnpm@10.26.1','dependencies':{'react':'catalog:','@workspace/lib':'workspace:*'}}))
        self.write('pnpm-workspace.yaml', 'catalog:\n  react: 19.1.0\noverrides:\n  esbuild: 0.27.3\n')
        self.write('pnpm-lock.yaml', '''lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      react:
        specifier: 'catalog:'
        version: 19.1.0
packages:
  react@19.1.0: {}
  '@scope/transitive@2.0.0': {}
''')
        self.write('.github/node-version','24.19.0\n')
        self.write('.github/python-version','3.14.7\n')
        self.write('docs/TECHNOLOGY-INVENTORY.md', '# Inventory\n'+i.START+'\nold\n'+i.END+'\nKeep this.\n')

    def write(self,path,value):
        full=self.root/path
        full.parent.mkdir(parents=True,exist_ok=True)
        full.write_text(value,encoding='utf-8')

    def discover(self):
        return i.discover(self.root,[str(p.relative_to(self.root)).replace('\\','/') for p in self.root.rglob('*') if p.is_file()])

    def snapshot(self):
        return {'schema_version':2,'checked_at':'2026-09-19','discovery':{'rows':{},'manifests':[],'lock_entries':0},'upstream':{'npm:pnpm':{'tracked_major_latest':'10.34.5'}},'runtimes':{
            'Node.js':{'current':'24.19.0','latest':'26.9.0','latest_lts':'24.21.0','target':'24.21.0','source':'https://nodejs.org/dist/index.json'},
            'Python':{'current':'3.14.7','latest':'3.14.7','target':'3.14.7','source':'https://www.python.org/downloads/'}}}

    def test_catalog_and_scoped_transitive_versions(self):
        d=self.discover()
        self.assertEqual(d['rows']['npm:react']['locked'],['19.1.0'])
        self.assertEqual(d['rows']['npm:react']['declarations'][0]['requirement'],'19.1.0')
        self.assertEqual(d['rows']['npm:@scope/transitive']['locked'],['2.0.0'])
        self.assertEqual(d['rows']['npm:esbuild']['roles'],['override'])
        self.assertNotIn('npm:@workspace/lib',d['rows'])

    def test_new_manifests_are_discovered_archives_excluded(self):
        self.write('new/package.json','{"dependencies":{"new-dep":"^1.0.0"}}')
        self.write('docs/archive/old/package.json','{"dependencies":{"old":"*"}}')
        d=self.discover()
        self.assertIn('npm:new-dep',d['rows'])
        self.assertNotIn('npm:old',d['rows'])
        self.assertEqual(d['excluded_archives'],['docs/archive/old/package.json'])

    def test_requirements_are_not_reported_as_installed(self):
        self.write('tool/requirements.txt','mcp>=2.0.0\n')
        row=self.discover()['rows']['pypi:mcp']
        self.assertEqual(row['locked'],[])
        self.assertIn('unknown',i.compare(row,'2.2.0'))

    def test_source_imports_find_unpinned_python_libraries(self):
        self.write('tool/run.py','import pandas\nfrom mssql_python import connect\n')
        rows=self.discover()['rows']
        self.assertIn('pypi:pandas',rows)
        self.assertIn('pypi:mssql-python',rows)

    def test_action_sha_and_go_tool_are_discovered(self):
        self.write('.github/workflows/test.yml','steps:\n - uses: actions/checkout@abcd\n - run: go install github.com/rhysd/actionlint/cmd/actionlint@v1.7.7\n')
        rows=self.discover()['rows']
        self.assertEqual(rows['github:actions/checkout']['declarations'][0]['requirement'],'abcd')
        self.assertIn('github:rhysd/actionlint',rows)

    def test_pypi_ignores_prereleases_and_yanked_releases(self):
        data={'releases':{'1.0.0':[{'yanked':False}],'2.0.0rc1':[{'yanked':False}],'1.5.0':[{'yanked':True}],'1.4.0':[]}}
        self.assertEqual(i.pypi_release('demo',lambda _:data)['latest'],'1.0.0')

    def test_npm_latest_tag_not_numerically_highest(self):
        data={'dist-tags':{'latest':'2.0.0'},'versions':{'2.0.0':{},'3.0.0':{}}}
        self.assertEqual(i.npm_release('demo',lambda _:data)['latest'],'2.0.0')

    def test_npm_no_stable_is_explicit(self):
        data={'dist-tags':{'latest':'1.0.0-beta.2'},'versions':{'1.0.0-beta.2':{}}}
        self.assertIsNone(i.npm_release('demo',lambda _:data)['latest'])
        self.assertIn('no stable',i.compare({'locked':['1.0.0-beta.2']},None))

    def test_semver_order_and_no_prereleases(self):
        self.assertEqual(i.highest(['3.9.0','3.10.0','4.0.0rc1']),'3.10.0')
        self.assertIn('never downgrade',i.compare({'locked':['4.0.0']},'3.0.0'))

    def test_runtime_candidates_stay_within_current_lines(self):
        nodes=[{'version':'v26.9.0','lts':False},{'version':'v24.21.0','lts':'Krypton'},{'version':'v22.23.2','lts':'Jod'}]
        def fetch(url,as_json=True):
            return nodes if as_json else '<a>Python 3.15.0rc1</a><a>Python 3.14.7</a><a>Python 3.13.15</a>'
        r=i.runtime_releases(self.root,fetch)
        self.assertEqual(r['Node.js']['target'],'24.21.0')
        self.assertEqual(r['Python']['latest'],'3.14.7')

    def test_runtime_writes_are_bounded_and_read_only_until_saved(self):
        original=(self.root/'.github/node-version').read_bytes()
        changes=i.bounded_updates(self.root,self.snapshot())
        self.assertEqual(len(changes),2)
        self.assertEqual((self.root/'.github/node-version').read_bytes(),original)
        bad=self.snapshot();bad['runtimes']['Node.js']['target']='26.9.0'
        with self.assertRaises(ValueError):i.bounded_updates(self.root,bad)
        bad=self.snapshot();bad['runtimes']['Python']['target']='3.15.0'
        with self.assertRaises(ValueError):i.bounded_updates(self.root,bad)

    def test_runtime_downgrade_is_never_written(self):
        s=self.snapshot();s['runtimes']['Node.js']['target']='24.18.0'
        self.assertNotIn(self.root/'.github/node-version',i.bounded_updates(self.root,s))

    def test_missing_markers_prevent_all_writes(self):
        self.write('docs/TECHNOLOGY-INVENTORY.md','no markers')
        with self.assertRaises(ValueError):i.save(self.root,self.snapshot(),{self.root/'.github/node-version':'bad'})
        self.assertEqual((self.root/'.github/node-version').read_text(),'24.19.0\n')
        self.assertFalse((self.root/'docs/technology-inventory.json').exists())

    def test_save_preserves_prose_and_avoids_date_only_changes(self):
        s=self.snapshot();i.save(self.root,s)
        before=(self.root/'docs/TECHNOLOGY-INVENTORY.md').read_bytes()
        later=copy.deepcopy(s);later['checked_at']='2026-10-01';i.save(self.root,later)
        self.assertEqual(before,(self.root/'docs/TECHNOLOGY-INVENTORY.md').read_bytes())
        self.assertTrue(before.endswith(b'Keep this.\n'))

    def test_network_failure_does_not_become_complete_report(self):
        with patch.object(i,'npm_release',side_effect=TimeoutError('offline')):
            with self.assertRaisesRegex(RuntimeError,'Incomplete upstream coverage'):
                i.collect(self.root,{'rows':{'npm:react':{'ecosystem':'npm','name':'react'}}})
        self.assertFalse((self.root/'docs/technology-inventory.json').exists())

    def test_offline_missing_package_does_not_silently_disappear(self):
        with self.assertRaisesRegex(RuntimeError,'Incomplete upstream coverage'):
            i.collect(self.root,{'rows':{'npm:new':{'ecosystem':'npm','name':'new'}}},{'upstream':{}})

    def test_unapproved_url_fails_before_network(self):
        with self.assertRaises(ValueError):i.get('http://registry.npmjs.org/react')
        with self.assertRaises(ValueError):i.get('https://example.com/private')


if __name__=='__main__':unittest.main()
