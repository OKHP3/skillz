import hashlib
import json
from pathlib import Path
import re
import sys
import tempfile
import unittest

PACKAGE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PACKAGE / "scripts"))
from compass_state import read_baseline
from github_sync import plan_actions


def example(path, schema):
    blocks = re.findall(r"```json\n(.*?)\n```", path.read_text(encoding="utf-8"), re.S)
    matches = [block for block in blocks if '"schema": "' + schema + '"' in block]
    if len(matches) != 1:
        raise AssertionError("expected one " + schema + " example")
    return json.loads(matches[0])


class StandaloneHandoff(unittest.TestCase):
    prompt = PACKAGE / "assets/standalone-prompt.md"

    def test_baseline_example_is_a_readable_manifest(self):
        doc = example(self.prompt, "okhp3.compass.baseline/1")
        self.assertEqual(doc["files"]["note.txt"]["sha"], hashlib.sha256(b"hello\n").hexdigest()[:16])
        with tempfile.TemporaryDirectory() as work:
            path = Path(work) / "baseline.json"
            path.write_text(json.dumps(doc))
            self.assertEqual(doc, read_baseline(path))

    def test_prompt_and_guide_index_support_same_plan(self):
        schema = "okhp3.compass.github-index/2"
        index = example(self.prompt, schema)
        self.assertEqual(index, example(PACKAGE / "references/github-mode.md", schema))
        state = {"project_key": index["project_key"]}
        for remote, local in (("issues", "tasks"), ("milestones", "objectives")):
            state[local] = [dict(id=ident, title=item["title"], status="active")
                            for ident, item in index[remote].items()]
        self.assertIsInstance(plan_actions(state, index, index["owner_repo"]), list)
