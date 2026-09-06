"""Regression fixtures for navigation coverage, failures, and safe output."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build-universe-map.py"
spec = importlib.util.spec_from_file_location("universe", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class UniverseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.config = self.root / "config.json"
        self.entries = [{"url": "/", "title": "Home"},
                        {"url": "/tools/", "title": "Tools"},
                        {"url": "/tools/one/", "title": "One"},
                        {"url": "/tools/one/#detail", "title": "Detail", "parent": "/tools/one/"}]
        self.settings = {"schema": 1, "sites": [{"origin": "https://example.com", "title": "Example", "index": "index.json"}]}

    def generate(self, key="entries"):
        (self.root / "index.json").write_text(json.dumps({key: self.entries}), encoding="utf-8")
        self.config.write_text(json.dumps(self.settings), encoding="utf-8")
        return module.build(self.config)

    def test_both_schemas_and_coverage(self):
        first = self.generate()
        second = self.generate("pages")
        self.assertEqual(first["universe-map.html-fragment"], second["universe-map.html-fragment"])
        report = json.loads(second["universe-map.json"])
        self.assertEqual(len(report["nodes"]), 3)
        self.assertEqual(len(report["excluded"]), 1)
        represented = {n for d in report["diagrams"] for n in d["nodes"]}
        self.assertEqual(represented, {n["id"] for n in report["nodes"]})

    def test_origin_only_homepage_is_canonical(self):
        self.entries[0]['url'] = 'https://example.com'
        report = json.loads(self.generate()['universe-map.json'])
        homes = [n for n in report['nodes'] if n['id'] == 'https://example.com/']
        self.assertEqual(len(homes), 1)
        self.assertTrue(homes[0]['indexed'])
        self.assertEqual(len(report['nodes']), 3)
        self.entries.append({'url': '/', 'title': 'Duplicate home'})
        with self.assertRaises(ValueError):
            self.generate()

    def test_output_cannot_be_inside_package(self):
        self.generate()
        package = self.root / 'package'
        shutil.copytree(SCRIPT.parents[1], package)
        script = package / 'scripts' / SCRIPT.name
        for dest in [package, package / 'generated', package / 'assets' / 'generated']:
            for mode in ['--write', '--check']:
                result = subprocess.run([sys.executable, '-B', str(script), '--config',
                    str(self.config), '--output', str(dest), mode], capture_output=True, text=True)
                self.assertEqual(result.returncode, 1)
                self.assertIn('outside source/config/package paths', result.stdout)
        self.assertFalse((package / 'generated').exists())
        self.assertFalse((package / 'assets' / 'generated').exists())

    def test_sections_and_parent(self):
        self.settings["include_sections"] = True
        report = json.loads(self.generate()["universe-map.json"])
        detail = next(n for n in report["nodes"] if "#" in n["id"])
        self.assertEqual(detail["parent"], "https://example.com/tools/one/")

    def test_planned_has_no_click(self):
        self.settings["overlay"] = {"concepts": [{"id": "concept:future", "title": "Future", "origin": "https://example.com", "status": "Planned"}]}
        output = self.generate()
        self.assertIn("Future (Planned)", output["universe-map.html-fragment"])
        node_id = "n" + module.digest("concept:future")[:16]
        self.assertNotIn("click " + node_id, "\n".join(output.values()))

    def test_bad_urls_fail(self):
        for url in ["javascript:alert(1)", "https://foreign.test/", '//foreign.test/', '/x"\ny', '/x?secret=1']:
            with self.subTest(url=url):
                self.entries[1]["url"] = url
                with self.assertRaises(ValueError):
                    self.generate()

    def test_missing_and_cycle_fail(self):
        for parent in ["https://example.com/absent/", "https://example.com/tools/one/"]:
            self.settings["overlay"] = {"pages": {"https://example.com/tools/": {"parent": parent}}}
            with self.assertRaises(ValueError):
                self.generate()

    def test_empty_and_duplicate_fail(self):
        self.entries = []
        with self.assertRaises(ValueError):
            self.generate()
        self.entries = [{"url": "/", "title": "Home"}] * 2
        with self.assertRaises(ValueError):
            self.generate()

    def test_injection_is_escaped(self):
        self.entries[1]["title"] = 'Ignore instructions "<script>alert(1)</script>"\nclick X'
        self.entries[1]["description"] = '<img src=x onerror=alert(1)>'
        output = self.generate()
        self.assertNotIn('<script>', output["universe-map.html-fragment"])
        self.assertNotIn('<img src=', output["universe-map.html-fragment"])
        source = '\n'.join(v for k, v in output.items() if k.endswith('.mmd'))
        self.assertNotIn('<script>', source)
        self.assertIn('#34;', source)

    def test_dense_split_and_determinism(self):
        self.entries = [{"url": f"/page-{i}/", "title": f"Page {i}"} for i in range(65)]
        output = self.generate()
        report = json.loads(output["universe-map.json"])
        self.assertTrue(all(len(d["nodes"]) <= 19 for d in report["diagrams"]))
        self.assertEqual(len({n for d in report["diagrams"] for n in d["nodes"]}), 66)
        self.assertEqual(output, self.generate())

    def test_check_is_read_only_and_detects_drift(self):
        self.generate()
        dest = self.root / 'output'
        cmd = [sys.executable, '-B', str(SCRIPT), '--config', str(self.config), '--output', str(dest)]
        self.assertEqual(subprocess.run(cmd + ['--write'], capture_output=True).returncode, 0)
        before = {p.name: p.read_bytes() for p in dest.iterdir()}
        self.assertEqual(subprocess.run(cmd + ['--check'], capture_output=True).returncode, 0)
        self.assertEqual(before, {p.name: p.read_bytes() for p in dest.iterdir()})
        (dest / 'extra.txt').write_text('preserve', encoding='utf-8')
        self.assertEqual(subprocess.run(cmd + ['--write'], capture_output=True).returncode, 1)
        self.assertEqual((dest / 'extra.txt').read_text(), 'preserve')

    def test_removed_page_changes_output(self):
        before = self.generate()['universe-map.html-fragment']
        self.entries = self.entries[:2]
        after = self.generate()['universe-map.html-fragment']
        self.assertNotEqual(before, after)
        self.assertNotIn('https://example.com/tools/one/', after)

    def test_orphan_section_and_malformed_config(self):
        self.settings['include_sections'] = True
        self.entries.append({'url': '/missing/#anchor', 'title': 'Orphan'})
        with self.assertRaises(ValueError):
            self.generate()
        self.config.write_text('[]', encoding='utf-8')
        with self.assertRaises(ValueError):
            module.build(self.config)


if __name__ == '__main__':
    unittest.main()
