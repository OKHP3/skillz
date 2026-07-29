---
name: okhp3-nfl-fantasy-picks
description: >
  OverKill Hill P³ NFL fantasy picks. Use when selecting NFL fantasy players,
  DFS lineups, salary-cap rosters, waiver priorities, or trade targets under a
  scoring and budget system. Also activate when comparing projected points per
  cost, replacement value, positional scarcity, floor, ceiling, or roster
  correlation. Load `okhp3-outcome-modeling-core` and
  `okhp3-outcome-modeling-sports` first; this is fantasy decision support, not
  sportsbook betting advice.
license: MIT
compatibility: >
  Requires user-supplied or approved current NFL data for live recommendations.
  The scoring system, roster rules, salary, contest type, and decision date
  must be known before ranking players.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Season-long fantasy, DFS, salary-cap, waiver, and trade analysis
    - Projected points, cost efficiency, replacement value, and roster constraints
    - Floor, ceiling, uncertainty, matchup, usage, and correlation analysis
  out_of_scope:
    - Sportsbook odds, wagers, bankroll, or bet execution
    - Invented injury, depth-chart, projection, or salary data
    - Treating a high raw close rate or point total as sufficient value evidence
---

# okhp3-nfl-fantasy-picks

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Optimize NFL fantasy decisions under scoring, roster, salary, and risk constraints. A player is not valuable merely because they are among the best players. The relevant question is how much usable fantasy production they provide relative to cost, replacement value, uncertainty, positional scarcity, and roster construction.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Season-long and DFS fantasy decisions | Sportsbook betting or wagering recommendations |
| Salary, points, replacement value, and roster optimization | Current facts without a verified source and as-of date |
| Player projections with floor, ceiling, and uncertainty | Guaranteed outcomes or certainty language |

---

## Required intake

Before ranking players, identify:

- season-long or DFS mode;
- scoring rules and bonuses;
- roster slots, flex rules, and salary cap;
- contest size and payout structure when relevant;
- decision date and game slate;
- available projections, usage, injury, depth-chart, and salary sources;
- whether the goal is median points, ceiling, safety, playoff schedule, or trade value.

If the user does not provide these, state the assumptions and do not present a universal ranking as authoritative.

## Fantasy value model

Use a constrained value model rather than raw projected points alone:

```text
fantasy value = projected points - replacement baseline
cost efficiency = fantasy value / salary or roster cost
decision value = expected value adjusted for uncertainty, scarcity, and constraints
```

Evaluate each player through:

- expected opportunity and role;
- target, carry, route, snap, red-zone, and goal-line usage;
- opponent and game environment;
- injury and workload uncertainty;
- median, floor, ceiling, and range;
- positional scarcity and replacement value;
- salary and opportunity cost;
- team and player correlation;
- ownership or leverage only when the contest context supports it.

Do not treat projected points per dollar as sufficient by itself. A cheap player can be efficient but unusable if their role is unstable or the opportunity cost is high.

## Workflow

1. Load the core and sports adapters.
2. Lock scoring, roster, salary, slate, and data freshness.
3. Build player states from role, usage, health, matchup, and team context.
4. Estimate projected distribution, not only a point estimate.
5. Calculate replacement value and cost efficiency by position.
6. Apply roster, salary, correlation, and contest constraints.
7. Produce a ranked pool, recommended constructions, fades, and contingency pivots.
8. State assumptions, uncertainty, and what information would change the result.

## Validation gates

Before handoff, verify the scoring, roster, salary, slate, and freshness inputs; recalculate replacement baselines by position; confirm every lineup constraint; and label the result as decision support rather than a guarantee.

## Output contract

Return a table with, as available:

```text
player | position | salary | projected points | floor | ceiling |
replacement value | points per cost | role risk | decision note
```

For a lineup, show the constraint checks and explain why the chosen roster is better than plausible alternatives. For season-long decisions, distinguish draft value, waiver value, trade value, and rest-of-season value.

## References

- `../okhp3-outcome-modeling-core/SKILL.md` -- shared objective and validation contract.
- `../okhp3-outcome-modeling-sports/SKILL.md` -- sports state and matchup contract.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
