"""Tests for scripts/build_carousel.py. Run: python3 -m unittest discover -s tests"""
import copy
import importlib.util
import json
import pathlib
import re
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec_loader = importlib.util.spec_from_file_location("build_carousel", ROOT / "scripts" / "build_carousel.py")
bc = importlib.util.module_from_spec(spec_loader)
spec_loader.loader.exec_module(bc)
EXAMPLE = json.loads((ROOT / "assets" / "example-spec.json").read_text(encoding="utf-8"))

try:
    import playwright.sync_api  # noqa: F401
    import PIL  # noqa: F401
    HAS_RENDER = True
except ImportError:
    HAS_RENDER = False


class ValidateTests(unittest.TestCase):
    def test_example_is_clean(self):
        errors, warnings, _ = bc.validate(copy.deepcopy(EXAMPLE))
        self.assertEqual(errors, [])
        self.assertEqual(warnings, [])

    def test_claim_without_source_is_an_error(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"][1].pop("source")
        errors, _, _ = bc.validate(spec)
        self.assertTrue(any("no source footer" in e for e in errors))

    def test_unsourced_number_warns(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"][2]["blocks"].append({"type": "stat", "value": "42%", "label": "of teams"})
        _, warnings, _ = bc.validate(spec)
        self.assertTrue(any("no source footer" in w for w in warnings))

    def test_low_contrast_is_an_error(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["theme"] = {"muted": "#3a4250"}
        errors, _, _ = bc.validate(spec)
        self.assertTrue(any("theme.muted contrast" in e for e in errors))

    def test_font_stack_rejects_css_and_urls(self):
        for bad in ["x; background:url(https://example.com/a.png)", "url(https://example.com/f.woff)", "@import"]:
            spec = copy.deepcopy(EXAMPLE)
            spec["theme"] = {"font": bad}
            errors, _, _ = bc.validate(spec)
            self.assertTrue(any("theme.font" in e for e in errors), bad)

    def test_slug_and_title_required(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["slug"] = "../escape"
        spec["document_title"] = ""
        errors, _, _ = bc.validate(spec)
        self.assertTrue(any(e.startswith("slug") for e in errors))
        self.assertTrue(any(e.startswith("document_title") for e in errors))

    def test_malformed_pages_and_blocks_report_errors(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"][1] = "not an object"
        spec["pages"][2]["blocks"] = ["text", None]
        errors, _, _ = bc.validate(spec)
        self.assertTrue(any("pages[2] must be an object" in e for e in errors))
        self.assertTrue(any("pages[3].blocks must be a list of objects" in e for e in errors))

    def test_page_bounds(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"] = spec["pages"][:1]
        errors, _, _ = bc.validate(spec)
        self.assertTrue(any("pages must be" in e for e in errors))


class HtmlTests(unittest.TestCase):
    def test_text_is_escaped(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"][2]["blocks"].append({"type": "text", "text": "<img src='https://example.com/x.png'><script>alert(1)</script>"})
        _, _, theme = bc.validate(spec)
        doc = bc.page_html(spec, theme, 2)
        self.assertNotIn("<img", doc)
        self.assertNotIn("<script", doc)
        self.assertIn("&lt;img", doc)

    def test_minimum_type_size(self):
        sizes = [int(n) for n in re.findall(r"font:\s*\d+\s+(\d+)px", bc.css(bc.DEFAULT_THEME))]
        self.assertTrue(sizes)
        self.assertGreaterEqual(min(sizes), bc.MIN_BODY_PX)

    def test_text_outline_covers_every_page(self):
        outline = bc.text_outline(EXAMPLE)
        self.assertEqual(outline.count("## Page "), len(EXAMPLE["pages"]))
        self.assertIn("Source:", outline)


@unittest.skipUnless(HAS_RENDER, "Playwright and Pillow are not installed")
class RenderTests(unittest.TestCase):
    def test_render_outputs_and_overflow(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = pathlib.Path(tmp) / "ok"
            self.assertEqual(bc.render(copy.deepcopy(EXAMPLE), bc.validate(EXAMPLE)[2], out, False), [])
            self.assertTrue((out / f"{EXAMPLE['slug']}.pdf").exists())
            self.assertTrue((out / "contact-sheet.jpg").exists())
            spec = copy.deepcopy(EXAMPLE)
            spec["pages"][2]["blocks"].append({"type": "text", "text": "Filler sentence. " * 200})
            spec["pages"][1]["source"] = "Source: " + "x" * 300
            problems = bc.render(spec, bc.validate(spec)[2], pathlib.Path(tmp) / "bad", False)
            self.assertTrue(any("vertically" in p for p in problems))
            self.assertTrue(any("footer" in p for p in problems))

    def test_long_token_in_compare_grid_wraps(self):
        spec = copy.deepcopy(EXAMPLE)
        spec["pages"][1]["blocks"][0]["rows"].append(["Link", "x" * 160, "https://example.org/" + "y" * 160])
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(bc.render(spec, bc.validate(spec)[2], pathlib.Path(tmp), False), [])

    def test_fit_check_sees_clipping_inside_nested_boxes(self):
        from playwright.sync_api import sync_playwright
        _, _, theme = bc.validate(EXAMPLE)
        doc = bc.page_html(EXAMPLE, theme, 1).replace(
            "</style>", ".cmp{grid-template-columns:1fr 1fr}.cmp>div{overflow-wrap:normal;min-width:auto}</style>"
        ).replace("&lt;OLD_TOOL&gt;", "z" * 200)
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_context(viewport={"width": bc.WIDTH, "height": bc.HEIGHT}, java_script_enabled=False).new_page()
            page.set_content(doc)
            self.assertTrue(page.evaluate(bc.FIT_CHECK)["h"])
            browser.close()


if __name__ == "__main__":
    unittest.main()
