#!/usr/bin/env python3
"""Render local roadmap/backlog blocks or a minimal JSON sink projection on stdout."""
import argparse
from collections import Counter, defaultdict, deque
import html
import json
import math
from pathlib import Path
import sys

CLOSED = {"abandoned", "superseded"}


def projection(state):
    objectives = state["objectives"]
    tasks = state["tasks"]
    records = objectives + tasks
    items = {row["id"]: row for row in records}
    if len(items) != len(records):
        raise ValueError("duplicate item ID")
    objectives_by_id = {row["id"] for row in objectives}
    children = defaultdict(list)
    for task in tasks:
        parent = task.get("parent_id") or task.get("objective_id")
        if parent:
            if parent not in items:
                raise ValueError("unresolved parent of " + task["id"])
            children[parent].append(task["id"])
        elif not task.get("orphan"):
            raise ValueError("missing parent of " + task["id"])

    # Count each eligible leaf once. A branch contributes its weighted
    # completion to its parent and its literal leaf counts to the denominator.
    pending = {key: len(children[key]) for key in items}
    queue = deque(key for key, n in pending.items() if n == 0)
    rollups = {}
    while queue:
        key = queue.popleft()
        row = items[key]
        counts = Counter()
        total = weighted = 0.0
        for child in children[key]:
            score, leaves = rollups[child]
            if score is None:
                continue
            weight = items[child].get("weight", 1)
            if type(weight) not in (float, int) or not math.isfinite(weight) or weight <= 0:
                raise ValueError("invalid child weight for " + child)
            weighted += weight * score
            total += weight
            counts.update(leaves)
        if row["status"] in CLOSED:
            fraction, counts = None, Counter()
        elif total:
            fraction = weighted / total
        elif key in objectives_by_id or children[key]:
            fraction = None
        else:
            fraction = float(row["status"] == "done")
            counts[row["status"]] += 1
        rollups[key] = fraction, counts
        if key not in objectives_by_id:
            parent = row.get("parent_id") or row.get("objective_id")
            if parent:
                pending[parent] -= 1
                if pending[parent] == 0:
                    queue.append(parent)
    if len(items) != len(rollups):
        raise ValueError("cyclic task hierarchy")

    rows = []
    for key, row in sorted(items.items()):
        packed = {k: row[k] for k in ("id", "title", "status", "objective_id",
                                       "parent_id", "component", "orphan") if k in row}
        fraction, counts = rollups[key]
        if key in objectives_by_id:
            packed.update(done=counts["done"], eligible=sum(counts.values()),
                          blocked=counts["blocked"],
                          percent_complete=None if fraction is None else round(100 * fraction))
        rows.append(packed)
    return {"schema": "okhp3.compass.projection/1", "project_key": state["project_key"],
            "items": rows}


def cell(value):
    return html.escape(" ".join(str(value).split())).replace("|", "&#124;")


def render(doc, view):
    lines = []
    if view == "roadmap":
        lines.extend(["| ID | Objective | Status | Eligible leaves done | Blocked leaves | Progress |",
                      "|---|---|---|---:|---:|---:|"])
        for item in doc["items"]:
            if "eligible" in item:
                cells = [item["id"], item["title"], item["status"],
                         "{done}/{eligible}".format(**item), item["blocked"],
                         "unknown" if item["percent_complete"] is None else
                         str(item["percent_complete"]) + "%"]
                lines.append("| " + " | ".join(map(cell, cells)) + " |")
    else:
        lines.extend(["| Parent | Task | ID | Status |", "|---|---|---|---|"])
        for item in sorted(doc["items"], key=lambda i: (i.get("parent_id") or
                                                        i.get("objective_id") or "~", i["id"])):
            if "eligible" not in item and item["status"] not in CLOSED | {"done"}:
                cells = [item.get("parent_id") or item.get("objective_id") or "orphan",
                         item["title"], item["id"], item["status"]]
                lines.append("| " + " | ".join(map(cell, cells)) + " |")
    return "\n".join(lines)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--root", required=True, type=Path)
    p.add_argument("view", choices=("roadmap", "backlog", "json"))
    args = p.parse_args()
    path = args.root.resolve() / ".compass" / "objectives.json"
    try:
        if path.parent.is_symlink() or path.is_symlink() or not path.is_file():
            raise ValueError("expected a regular in-repository objectives.json")
        state = json.loads(path.read_text(encoding="utf-8"))
        if state.get("mode", {}).get("detected") != "B":
            raise ValueError("computed-child projection requires recorded Mode B")
        doc = projection(state)
        print(json.dumps(doc, sort_keys=True, indent=2) if args.view == "json" else
              render(doc, args.view))
    except (KeyError, ValueError, TypeError, AttributeError, OSError) as exc:
        p.exit(1, "cannot render tracker: %s\n" % exc)


if __name__ == "__main__":
    main()
