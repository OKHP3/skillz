import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "validate-i18n-page-release.py"
SPEC = importlib.util.spec_from_file_location("i18n_page_release", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def page(lang, url, alternates, robots="index, follow"):
    links = "".join(f'<link rel="alternate" hreflang="{tag}" href="{href}">' for tag, href in alternates.items())
    return f'<html lang="{lang}"><head><meta name="robots" content="{robots}"><link rel="canonical" href="{url}">{links}</head><body>Example</body></html>'


class I18nPageReleaseTests(unittest.TestCase):
    def write_fixture(self, root, french_state="indexable", french_lang="fr-FR", french_alternates=None):
        source_url = "https://example.com/about/"
        french_url = "https://example.com/fr/about/"
        source_alternates = {"en-US": source_url, "x-default": "https://example.com/"}
        if french_state == "indexable":
            source_alternates["fr-FR"] = french_url
        (root / "about").mkdir()
        (root / "fr" / "about").mkdir(parents=True)
        (root / "about" / "index.html").write_text(page("en-US", source_url, source_alternates), encoding="utf-8")
        if french_alternates is None:
            french_alternates = source_alternates if french_state == "indexable" else {}
        robots = "noindex, follow" if french_state == "draft-noindex" else "index, follow"
        (root / "fr" / "about" / "index.html").write_text(page(french_lang, french_url, french_alternates, robots), encoding="utf-8")
        registry = {
            "schema_version": "1.0",
            "site_origin": "https://example.com",
            "default_locale": {"tag": "en-US", "x_default_url": "/"},
            "locales": {"fr-FR": {"root": "fr", "direction": "ltr", "label": "Français", "translation_skill": "okhp3-translation-en-us-fr-fr"}},
            "routes": [{"source": {"path": "about/index.html", "url": "/about/"}, "targets": {"fr-FR": {"path": "fr/about/index.html", "url": "/fr/about/", "state": french_state}}}],
        }
        (root / "i18n").mkdir()
        (root / "i18n" / "locale-registry.json").write_text(json.dumps(registry), encoding="utf-8")

    def test_indexable_cluster_passes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_fixture(root)
            self.assertEqual(MODULE.main(["--root", str(root), "--registry", "i18n/locale-registry.json", "--check"]), 0)

    def test_draft_noindex_is_excluded_from_alternate_cluster(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_fixture(root, french_state="draft-noindex")
            self.assertEqual(MODULE.main(["--root", str(root), "--registry", "i18n/locale-registry.json", "--check"]), 0)

    def test_wrong_language_and_draft_alternates_fail(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_fixture(root, french_state="draft-noindex", french_lang="fr", french_alternates={"en-US": "https://example.com/about/"})
            self.assertEqual(MODULE.main(["--root", str(root), "--registry", "i18n/locale-registry.json", "--check"]), 1)

    def test_body_metadata_and_duplicate_canonical_fail(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_fixture(root)
            page_path = root / "fr" / "about" / "index.html"
            page_path.write_text(
                '<html lang="fr-FR"><head><link rel="canonical" href="https://example.com/fr/about/"><link rel="canonical" href="https://example.com/fr/about/">'
                '<link rel="alternate" hreflang="en-US" href="https://example.com/about/"><link rel="alternate" hreflang="fr-FR" href="https://example.com/fr/about/"><link rel="alternate" hreflang="x-default" href="https://example.com/"></head>'
                '<body><link rel="alternate" hreflang="fr-FR" href="https://example.com/fr/about/"></body></html>',
                encoding="utf-8",
            )
            self.assertEqual(MODULE.main(["--root", str(root), "--registry", "i18n/locale-registry.json", "--check"]), 1)

    def test_policy_can_use_primary_html_language_without_x_default(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_fixture(root, french_lang="fr")
            registry_path = root / "i18n" / "locale-registry.json"
            registry = json.loads(registry_path.read_text(encoding="utf-8"))
            registry["release_policy"] = {"require_x_default": False, "html_lang": "primary-language"}
            registry["default_locale"].pop("x_default_url")
            for file_path in (root / "about" / "index.html", root / "fr" / "about" / "index.html"):
                text = file_path.read_text(encoding="utf-8").replace('<link rel="alternate" hreflang="x-default" href="https://example.com/">', "")
                if file_path.parts[-3:-1] == ("fr", "about"):
                    text = text.replace('<html lang="fr-FR"', '<html lang="fr"')
                else:
                    text = text.replace('<html lang="en-US"', '<html lang="en"')
                file_path.write_text(text, encoding="utf-8")
            registry_path.write_text(json.dumps(registry), encoding="utf-8")
            self.assertEqual(MODULE.main(["--root", str(root), "--registry", "i18n/locale-registry.json", "--check"]), 0)


if __name__ == "__main__":
    unittest.main()
