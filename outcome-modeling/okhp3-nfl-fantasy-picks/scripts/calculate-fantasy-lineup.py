#!/usr/bin/env python3
"""Enumerate a small fantasy roster problem with transparent constraints."""
import argparse
import itertools
import json


def main():
    parser = argparse.ArgumentParser(description="Select the best feasible synthetic fantasy roster from JSON.")
    parser.add_argument("input", help="JSON fixture path")
    args = parser.parse_args()
    with open(args.input, encoding="utf-8") as handle:
        data = json.load(handle)
    players = data["players"]
    rules = data["rules"]
    roster_size = int(rules["roster_size"])
    if len(players) > 24:
        raise ValueError("fixture is intentionally limited to 24 players for exhaustive search")
    feasible = []
    for lineup in itertools.combinations(players, roster_size):
        salary = sum(float(p["salary"]) for p in lineup)
        positions = {position: sum(1 for p in lineup if p["position"] == position) for position in rules.get("min_positions", {})}
        if salary > float(rules["salary_cap"]):
            continue
        if any(positions[position] < int(minimum) for position, minimum in rules.get("min_positions", {}).items()):
            continue
        objective = sum(float(p["projected_points"]) - float(p.get("replacement_points", 0)) - float(p.get("risk_penalty", 0)) for p in lineup)
        feasible.append((objective, lineup, salary))
    if not feasible:
        raise ValueError("no feasible lineup satisfies the supplied rules")
    objective, lineup, salary = max(feasible, key=lambda item: item[0])
    print(json.dumps({
        "selected": [p["name"] for p in lineup],
        "salary": salary,
        "projected_points": sum(float(p["projected_points"]) for p in lineup),
        "replacement_value": sum(float(p["projected_points"]) - float(p.get("replacement_points", 0)) for p in lineup),
        "risk_adjusted_objective": objective
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
