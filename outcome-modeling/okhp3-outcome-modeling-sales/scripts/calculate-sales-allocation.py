#!/usr/bin/env python3
"""Calculate opportunity contribution and choose a small feasible allocation."""
import argparse
import itertools
import json


def contribution(item):
    margin = float(item["revenue"]) * (1 - float(item.get("discount_rate", 0))) * float(item["gross_margin_rate"])
    expected = float(item["win_probability"]) * (margin - float(item.get("service_cost", 0))) - float(item.get("acquisition_cost", 0))
    return margin, expected


def rounded(value):
    return round(value, 6)


def main():
    parser = argparse.ArgumentParser(description="Calculate expected sales contribution from local JSON.")
    parser.add_argument("input", help="JSON fixture path")
    args = parser.parse_args()
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    opportunities = data["opportunities"]
    if len(opportunities) > 24:
        raise ValueError("fixture is intentionally limited to 24 opportunities for exhaustive search")
    enriched = []
    for item in opportunities:
        margin, expected = contribution(item)
        enriched.append({**item, "net_margin": rounded(margin), "expected_contribution": rounded(expected), "incremental_lift": rounded(float(item["win_probability"]) - float(item.get("baseline_probability", 0)))})
    constraints = data.get("constraints", {})
    feasible = []
    for count in range(len(enriched) + 1):
        for selection in itertools.combinations(enriched, count):
            budget = sum(float(item.get("acquisition_cost", 0)) for item in selection)
            capacity = sum(float(item.get("capacity_hours", 0)) for item in selection)
            if budget <= float(constraints.get("max_budget", float("inf")) or float("inf")) and capacity <= float(constraints.get("max_capacity_hours", float("inf")) or float("inf")):
                feasible.append((sum(item["expected_contribution"] for item in selection), selection))
    total, selection = max(feasible, key=lambda item: item[0])
    print(json.dumps({
        "opportunities": enriched,
        "selected": [item["name"] for item in selection],
        "total_expected_contribution": rounded(total),
        "budget_used": rounded(sum(float(item.get("acquisition_cost", 0)) for item in selection)),
        "capacity_hours_used": rounded(sum(float(item.get("capacity_hours", 0)) for item in selection))
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
