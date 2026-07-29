import json
import subprocess
import sys
import unittest
from pathlib import Path


class SportsCalculationTest(unittest.TestCase):
    def test_fixture_matchup(self):
        root = Path(__file__).parents[1]
        result = subprocess.run([sys.executable, str(root / "scripts/calculate-sports-model.py"), str(root / "examples/sports-example.json")], check=True, capture_output=True, text=True)
        output = json.loads(result.stdout)
        self.assertEqual(output["expected_margin"], 4.5)
        self.assertAlmostEqual(output["home_probability"], 0.6553990358, places=8)
        self.assertEqual(output["updated_rating"], 6.25)


if __name__ == "__main__":
    unittest.main()
