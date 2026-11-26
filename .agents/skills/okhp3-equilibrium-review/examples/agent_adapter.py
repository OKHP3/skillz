"""Inert local adapter example for the equilibrium-review runner.

This fixture does not call a model or external service. It demonstrates the
structured result shape and conservatively returns a deferred decision.
"""

import argparse
import json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--role", required=True)
    parser.add_argument("--prompt-file", required=True)
    parser.parse_args()
    print(
        json.dumps(
            {
                "status": "not-run",
                "decision": "defer-for-evidence",
                "concordance": "unknown",
                "findings": [],
                "notes": "Synthetic adapter fixture; no reviewer was invoked.",
            }
        )
    )


if __name__ == "__main__":
    main()
