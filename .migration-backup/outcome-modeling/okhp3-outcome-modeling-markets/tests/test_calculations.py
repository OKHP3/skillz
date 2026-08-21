import json
import subprocess
import sys
import unittest
from pathlib import Path


class MarketCalculationTest(unittest.TestCase):
    def test_fixture_comparison(self):
        root = Path(__file__).parents[1]
        result = subprocess.run([sys.executable, str(root / "scripts/calculate-market-comparison.py"), str(root / "examples/market-example.json")], check=True, capture_output=True, text=True)
        output = json.loads(result.stdout)
        self.assertEqual(output["market_probability"], 0.55)
        self.assertEqual(output["edge"], 0.07)
        self.assertEqual(output["expected_value_per_contract"], 0.04)
        self.assertEqual(output["research_status"], "confirmed-resolution")


if __name__ == "__main__":
    unittest.main()
