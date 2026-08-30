import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "webpage_localization.py"
SOURCE = """<!doctype html><html lang=\"en-US\"><head><style>.x{color:red}</style><script>const id = 'x';</script></head><body><h1>Hello</h1><p>Let's build.</p></body></html>"""
TARGET = """<!doctype html><html lang=\"fr\"><head><style>.x{color:red}</style><script>const id = 'x';</script></head><body><h1>Bonjour</h1><p>Construisons ensemble.</p></body></html>"""


class WebpageLocalizationTests(unittest.TestCase):
    def run_command(self, *args):
        return subprocess.run(["py", "-3", str(SCRIPT), *args], text=True, capture_output=True, check=False)

    def test_plan_then_verify_matching_html(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            source, target, job = folder / "source.html", folder / "fr.html", folder / "job.json"
            source.write_text(SOURCE, encoding="utf-8")
            target.write_text(TARGET, encoding="utf-8")
            planned = self.run_command("plan", "--source", str(source), "--page-id", "home", "--target-locale", "fr", "--source-url", "https://example.test/", "--output", str(job))
            self.assertEqual(0, planned.returncode, planned.stderr)
            verified = self.run_command("verify", "--source", str(source), "--target", str(target), "--job", str(job), "--target-locale", "fr")
            self.assertEqual(0, verified.returncode, verified.stdout)
            self.assertEqual("passed", json.loads(verified.stdout)["result"])

    def test_verify_rejects_source_drift(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            source, target, job = folder / "source.html", folder / "fr.html", folder / "job.json"
            source.write_text(SOURCE, encoding="utf-8")
            target.write_text(TARGET, encoding="utf-8")
            self.run_command("plan", "--source", str(source), "--page-id", "home", "--target-locale", "fr", "--source-url", "https://example.test/", "--output", str(job))
            source.write_text(SOURCE.replace("Hello", "Hello again"), encoding="utf-8")
            verified = self.run_command("verify", "--source", str(source), "--target", str(target), "--job", str(job), "--target-locale", "fr")
            self.assertNotEqual(0, verified.returncode)
            self.assertIn("Source hash differs", verified.stdout)

    def test_verify_rejects_changed_script(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            source, target, job = folder / "source.html", folder / "fr.html", folder / "job.json"
            source.write_text(SOURCE, encoding="utf-8")
            target.write_text(TARGET.replace("const id = 'x';", "const id = 'y';"), encoding="utf-8")
            self.run_command("plan", "--source", str(source), "--page-id", "home", "--target-locale", "fr", "--source-url", "https://example.test/", "--output", str(job))
            verified = self.run_command("verify", "--source", str(source), "--target", str(target), "--job", str(job), "--target-locale", "fr")
            self.assertNotEqual(0, verified.returncode)
            self.assertIn("Frozen script/style", verified.stdout)


if __name__ == "__main__":
    unittest.main()
