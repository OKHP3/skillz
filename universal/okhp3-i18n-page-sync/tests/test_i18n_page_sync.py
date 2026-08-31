import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).parents[1] / "scripts" / "i18n-page-sync.py"


def write(path: Path, content: str = "content") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def search_index(entries):
    return {"site": "https://example.test", "generated": "static", "count": len(entries), "entries": entries}


def config(root: Path, in_scope=None):
    payload = {
        "schema_version": "1.0",
        "search_index": "assets/data/search-index.json",
        "state_file": "i18n/sync-state.json",
        "target_locales": {
            "fr": {"locale": "fr-FR", "root": "fr", "skill": "okhp3-translation-en-us-fr-fr"},
        },
    }
    if in_scope is not None:
        payload["in_scope_routes"] = in_scope
    write(root / "i18n" / "sync.config.json", json.dumps(payload))


def run(root: Path, mode: str):
    return subprocess.run(
        [sys.executable, str(SCRIPT), "--root", str(root), "--mode", mode, "--format", "json"],
        capture_output=True,
        text=True,
        check=False,
    )


class I18nPageSyncTests(unittest.TestCase):
    def test_no_config_is_a_clean_noop(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            result = run(root, "check")
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertFalse(json.loads(result.stdout)["configured"])

    def test_missing_translation_is_drift(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html")
            write(root / "assets" / "data" / "search-index.json", json.dumps(search_index([{"url": "/about/"}])))
            config(root)
            result = run(root, "report")
            payload = json.loads(result.stdout)
            self.assertEqual(len(payload["missing"]), 1)
            self.assertEqual(payload["missing"][0]["route"], "/about/")
            self.assertEqual(run(root, "check").returncode, 1)

    def test_adopt_bootstraps_existing_translation_without_drift(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html", "english")
            write(root / "fr" / "about" / "index.html", "french")
            write(root / "assets" / "data" / "search-index.json", json.dumps(search_index([{"url": "/about/"}])))
            config(root)
            before = run(root, "report")
            self.assertEqual(len(json.loads(before.stdout)["needs_baseline"]), 1)
            adopt_result = subprocess.run(
                [sys.executable, str(SCRIPT), "--root", str(root), "--mode", "adopt"],
                capture_output=True, text=True, check=False,
            )
            self.assertEqual(adopt_result.returncode, 0, adopt_result.stdout + adopt_result.stderr)
            self.assertEqual(run(root, "check").returncode, 0)

    def test_source_edit_after_adopt_is_stale(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html", "english v1")
            write(root / "fr" / "about" / "index.html", "french")
            write(root / "assets" / "data" / "search-index.json", json.dumps(search_index([{"url": "/about/"}])))
            config(root)
            subprocess.run([sys.executable, str(SCRIPT), "--root", str(root), "--mode", "adopt"], check=False)
            self.assertEqual(run(root, "check").returncode, 0)
            write(root / "about" / "index.html", "english v2, changed")
            result = run(root, "check")
            self.assertEqual(result.returncode, 1)
            payload = run(root, "report")
            self.assertEqual(json.loads(payload.stdout)["stale"][0]["route"], "/about/")

    def test_out_of_scope_routes_are_never_flagged(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html")
            write(root / "legal" / "index.html")
            write(
                root / "assets" / "data" / "search-index.json",
                json.dumps(search_index([{"url": "/about/"}, {"url": "/legal/"}])),
            )
            config(root, in_scope=["/about/"])
            result = run(root, "report")
            payload = json.loads(result.stdout)
            routes = {item["route"] for item in payload["missing"]}
            self.assertIn("/about/", routes)
            self.assertNotIn("/legal/", routes)

    def test_fragment_and_already_localized_urls_are_excluded_from_discovery(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html")
            write(root / "fr" / "about" / "index.html")
            write(
                root / "assets" / "data" / "search-index.json",
                json.dumps(
                    search_index(
                        [
                            {"url": "/about/"},
                            {"url": "/about/#section"},
                            {"url": "/fr/about/"},
                        ]
                    )
                ),
            )
            config(root)
            result = run(root, "report")
            payload = json.loads(result.stdout)
            routes = {item["route"] for status in ("missing", "needs_baseline") for item in payload[status]}
            self.assertEqual(routes, {"/about/"})

    def test_orphaned_translation_is_reported_not_fatal(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            write(root / "about" / "index.html")
            write(root / "fr" / "about" / "index.html")
            write(root / "assets" / "data" / "search-index.json", json.dumps(search_index([{"url": "/about/"}])))
            config(root)
            subprocess.run([sys.executable, str(SCRIPT), "--root", str(root), "--mode", "adopt"], check=False)
            write(root / "assets" / "data" / "search-index.json", json.dumps(search_index([])))
            result = run(root, "report")
            payload = json.loads(result.stdout)
            self.assertEqual(len(payload["orphan"]), 1)
            self.assertEqual(run(root, "check").returncode, 0)

    def test_missing_search_index_is_an_error_not_a_silent_pass(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            config(root)
            result = run(root, "check")
            self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main()
