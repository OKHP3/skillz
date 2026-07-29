import json
import subprocess
import sys
import unittest
from pathlib import Path


class SalesCalculationTest(unittest.TestCase):
    def test_fixture_allocation(self):
        root = Path(__file__).parents[1]
        result = subprocess.run([sys.executable, str(root / "scripts/calculate-sales-allocation.py"), str(root / "examples/sales-example.json")], check=True, capture_output=True, text=True)
        output = json.loads(result.stdout)
        self.assertEqual(output["selected"], ["Account A", "Account C"])
        self.assertEqual(output["total_expected_contribution"], 61.8)
        self.assertEqual(output["capacity_hours_used"], 7.0)


if __name__ == "__main__":
    unittest.main()
