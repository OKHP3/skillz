import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from compass_views import projection, render


class Views(unittest.TestCase):
    def test_nested_and_empty(self):
        def item(key, status, **fields):
            return dict(id=key, title=key, status=status, **fields)
        state = {"project_key": "demo", "objectives": [item("o", "active"), item("z", "proposed")],
                 "tasks": [item("a", "done", objective_id="o"),
                           item("b", "active", objective_id="o"),
                           item("c", "blocked", parent_id="b"),
                           item("d", "superseded", parent_id="b")]}
        data = projection(state)
        rows = {i["id"]: i for i in data["items"]}
        self.assertEqual((rows["o"]["percent_complete"], rows["o"]["done"],
                          rows["o"]["eligible"], rows["o"]["blocked"]), (50, 1, 2, 1))
        self.assertIsNone(rows["z"]["percent_complete"])
        self.assertIn("1/2", render(data, "roadmap"))
        self.assertIn("blocked", render(data, "backlog"))
        state["tasks"][1]["parent_id"] = "c"
        with self.assertRaisesRegex(ValueError, "cyclic"):
            projection(state)
