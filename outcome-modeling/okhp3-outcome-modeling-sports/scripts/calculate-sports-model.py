#!/usr/bin/env python3
"""Small, dependency-free sports rating and matchup calculation."""
import argparse
import json
import math


def sigmoid(value):
    return 1 / (1 + math.exp(-value))


def main():
    parser = argparse.ArgumentParser(description="Calculate a transparent sports matchup and rating update from JSON.")
    parser.add_argument("input", help="JSON fixture path")
    args = parser.parse_args()
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    expected_margin = float(data["home_rating"]) - float(data["away_rating"]) + float(data.get("home_advantage", 0)) + float(data.get("structural_adjustment", 0))
    scale = float(data["scale"])
    if scale <= 0:
        raise ValueError("scale must be positive")
    updated_rating = float(data["decay"]) * float(data["prior_rating"]) + (1 - float(data["decay"])) * (float(data["opponent_rating"]) + float(data["observed_margin"]))
    print(json.dumps({
        "expected_margin": expected_margin,
        "home_probability": sigmoid(expected_margin / scale),
        "updated_rating": updated_rating
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
