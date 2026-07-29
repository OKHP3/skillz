#!/usr/bin/env python3
"""Calculate binary market comparison metrics from local JSON only."""
import argparse
import json


def main():
    parser = argparse.ArgumentParser(description="Compare a model probability with a binary market price.")
    parser.add_argument("input", help="JSON fixture path")
    args = parser.parse_args()
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    payoff = float(data["payoff"])
    if payoff <= 0:
        raise ValueError("payoff must be positive")
    price = float(data["market_price"])
    model_probability = float(data["model_probability"])
    all_in_cost = price + float(data.get("fee", 0)) + float(data.get("slippage", 0))
    rounded = lambda value: round(value, 6)
    print(json.dumps({
        "market_probability": price,
        "edge": rounded(model_probability - price),
        "all_in_cost": rounded(all_in_cost),
        "expected_value_per_contract": rounded(model_probability * payoff - all_in_cost),
        "break_even_probability": rounded(all_in_cost / payoff),
        "research_status": "confirmed-resolution" if data.get("resolution_confirmed") else "unresolved-resolution"
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
