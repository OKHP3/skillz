import json
import subprocess
import sys
import unittest
from pathlib import Path


class FantasyCalculationTest(unittest.TestCase):
    def test_fixture_lineup_is_feasible(self):
        root = Path(__file__).parents[1]
        result = subprocess.run([sys.executable, str(root / "scripts/calculate-fantasy-lineup.py"), str(root / "examples/fantasy-example.json")], check=True, capture_output=True, text=True)
        output = json.loads(result.stdout)
        self.assertEqual(output["salary"], 21.0)
        self.assertEqual(output["selected"], ["Quarterback A", "Running Back A", "Wide Receiver A"])
        self.assertEqual(output["risk_adjusted_objective"], 18.9)


if __name__ == "__main__":
    unittest.main()
