import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PACKAGE = Path(__file__).parents[1]
VALIDATOR = PACKAGE / "scripts" / "validate_en_us_to_en_uk.py"
PLANNER = PACKAGE / "scripts" / "plan_en_us_to_en_uk.py"


PROJECT = {
    "schema_version": "2.0",
    "project_id": "fixture-en-us-en-uk",
    "language_pair": {"source_locale": "en-US", "target_locale": "en-GB", "direction": "one-way"},
    "source": {"locale": "en-US", "register_state": "plainspoken", "root": "content/en", "voice_profile": "config/voice.en-us.json", "register_mediation_record": None},
    "target": {"locale": "en-GB", "root": "content/fr", "dictionary": "config/dictionary.en-us-en-uk.json", "status": "draft", "needs_native_review": True},
    "rules": {"slug_policy": "stable", "preserve_urls": True, "default_status": "machine-drafted", "allowed_extensions": [".md"]},
}

VOICE_PROFILE = {
    "schema_version": "1.0",
    "profile_id": "fixture-en-us-voice",
    "source_locale": "en-US",
    "traits": {"register": "direct"},
    "samples": [{"path": "content/en/about.md"}],
}

DICTIONARY = {
    "schema_version": "1.0",
    "language_pair": {"source_locale": "en-US", "target_locale": "en-GB", "direction": "one-way"},
    "entries": [{"source": "Color", "target": "Colour", "handling": "adapt", "context": "navigation"}],
}


class EnUsToEnUkValidatorTests(unittest.TestCase):
    def write_project(self, directory: Path, value=PROJECT) -> Path:
        path = directory / "project.json"
        path.write_text(json.dumps(value), encoding="utf-8")
        return path

    def run_validator(self, project: Path, source: Path = None, target: Path = None):
        command = [sys.executable, str(VALIDATOR), "--project", str(project), "--format", "json"]
        if source and target:
            command.extend(["--source-file", str(source), "--target-file", str(target)])
        return subprocess.run(command, capture_output=True, text=True, check=False)

    def write_controls(self, directory: Path, dictionary=DICTIONARY, voice_profile=VOICE_PROFILE) -> None:
        config_root = directory / "config"
        config_root.mkdir()
        (config_root / "voice.en-us.json").write_text(json.dumps(voice_profile), encoding="utf-8")
        (config_root / "dictionary.en-us-en-uk.json").write_text(json.dumps(dictionary), encoding="utf-8")

    def test_valid_pair_and_protected_tokens_pass(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            self.write_controls(directory)
            source = directory / "source.md"
            target = directory / "target.md"
            source.write_text("# Hello\n\nUse `npm run check` at https://example.test/a. Choose your favorite color.\n\n```js\nconst x = '{name}'\n```\n", encoding="utf-8")
            target.write_text("# Hello\n\nUse `npm run check` at https://example.test/a. Choose your favourite colour.\n\n```js\nconst x = '{name}'\n```\n", encoding="utf-8")
            result = self.run_validator(project, source, target)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(result.stdout)
            self.assertTrue(payload["passed"])
            self.assertEqual(payload["language_pair"]["target_locale"], "en-GB")

    def test_rejects_any_other_language_pair_or_many_targets(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            invalid = json.loads(json.dumps(PROJECT))
            invalid["language_pair"]["target_locale"] = "fr-CA"
            invalid["target"]["locale"] = "fr-CA"
            invalid["targets"] = [{"locale": "es-ES"}]
            project = self.write_project(directory, invalid)
            result = self.run_validator(project)
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("en-GB" in item for item in errors))
            self.assertTrue(any("targets is not allowed" in item for item in errors))

    def test_rejects_specialist_register_without_completed_plainspoken_stage(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            invalid = json.loads(json.dumps(PROJECT))
            invalid["source"]["register_state"] = "engineering"
            invalid["source"]["register_mediation_record"] = {
                "output_locale": "en-US",
                "output_register": "plainspoken",
                "status": "pending",
                "record": "records/engineering-to-plain.json",
            }
            project = self.write_project(directory, invalid)
            result = self.run_validator(project)
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("register_state" in item for item in errors))
            self.assertTrue(any("status must be 'completed'" in item for item in errors))

    def test_protected_token_drift_fails(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            self.write_controls(directory)
            source = directory / "source.md"
            target = directory / "target.md"
            source.write_text("[Read](https://example.test/a) `{name}`", encoding="utf-8")
            target.write_text("[Lire](https://example.test/b) `{nom}`", encoding="utf-8")
            result = self.run_validator(project, source, target)
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("URL drift" in item for item in errors))
            self.assertTrue(any("placeholders" in item for item in errors))

    def test_planner_reports_only_en_gb_targets_without_writing(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            self.write_controls(directory)
            source_root = directory / "content" / "en"
            source_root.mkdir(parents=True)
            (source_root / "about.md").write_text("# About\n", encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(PLANNER), "--project", str(project), "--base-dir", str(directory), "--format", "json"],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(result.stdout)
            self.assertEqual(payload["plan"]["language_pair"]["target_locale"], "en-GB")
            self.assertEqual(payload["plan"]["artifacts"][0]["state"], "missing")
            self.assertFalse(payload["plan"]["writes_performed"])
            self.assertFalse(payload["plan"]["translation_performed"])

    def test_planner_blocks_missing_voice_profile_or_dictionary(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            source_root = directory / "content" / "en"
            source_root.mkdir(parents=True)
            (source_root / "about.md").write_text("# About\n", encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(PLANNER), "--project", str(project), "--base-dir", str(directory), "--format", "json"],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("source.voice_profile" in item for item in errors))

    def test_validator_rejects_empty_or_wrong_pair_dictionary(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            invalid_dictionary = json.loads(json.dumps(DICTIONARY))
            invalid_dictionary["language_pair"]["target_locale"] = "fr-CA"
            invalid_dictionary["entries"] = []
            self.write_controls(directory, invalid_dictionary)
            result = self.run_validator(project)
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("en-US to en-GB" in item for item in errors))
            self.assertTrue(any("entries must be a non-empty array" in item for item in errors))

    def test_validator_rejects_incomplete_voice_profile(self):
        with tempfile.TemporaryDirectory() as raw:
            directory = Path(raw)
            project = self.write_project(directory)
            incomplete_profile = {"schema_version": "1.0", "source_locale": "en-US", "traits": {}, "samples": []}
            self.write_controls(directory, voice_profile=incomplete_profile)
            result = self.run_validator(project)
            self.assertEqual(result.returncode, 1)
            errors = json.loads(result.stdout)["errors"]
            self.assertTrue(any("profile_id" in item for item in errors))
            self.assertTrue(any("traits must be a non-empty object" in item for item in errors))
            self.assertTrue(any("samples must be a non-empty array" in item for item in errors))


if __name__ == "__main__":
    unittest.main()
