---
name: okhp3-outcome-modeling-sports
description: >
  OverKill Hill P³ sports outcome modeling. Use when modeling team, game, or
  player outcomes from repeated sports events, matchup history, schedules,
  injuries, or performance metrics. Also activate when designing a sports
  ranking, matchup forecast, season projection, or fantasy-oriented state
  model. Load `okhp3-outcome-modeling-core` first; this adapter supplies sports
  structure and does not provide live odds or trade execution.
license: MIT
compatibility: >
  Any Agent Skills-compatible client with access to user-supplied or approved
  sports data. Live data retrieval requires a separate approved data skill.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Team, game, player, matchup, and season state modeling
    - Opponent-adjusted metrics, schedule context, roster events, and uncertainty
    - Sports ranking and projection specifications
  out_of_scope:
    - Fabricating current scores, rosters, injuries, odds, or transactions
    - Treating one game as proof of a team or player skill level
    - Executing bets, trades, or sportsbook actions
---

# okhp3-outcome-modeling-sports

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Apply the outcome-modeling core to sports without confusing raw wins with underlying performance. Sports evidence is organized as time-indexed team or player states, opponent-adjusted interactions, and structural events such as injuries, coaching changes, and roster moves.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Matchup, team, player, and season projections | Guaranteed picks or certainty claims |
| Opponent adjustment, schedule context, and roster events | Unverified live sports facts |
| Ranking, calibration, uncertainty, and scenario analysis | Bet placement or bankroll execution |

---

## Required workflow

1. Load `okhp3-outcome-modeling-core` and define the outcome, horizon, scoring rule, and as-of date.
2. Identify the sports entities, event grain, matchup relationship, and season structure.
3. Build time-indexed team or player states from only available prior events.
4. Adjust for opponent, venue, rest, schedule strength, role, and sample size where relevant.
5. Treat injuries, trades, coaching changes, and role changes as structural events or regime changes.
6. Separate descriptive performance from predictive features and avoid double-counting correlated metrics.
7. Compare simple baselines such as record, point or scoring differential, Elo-style strength, and replacement value against richer models.
8. Validate chronologically and report calibration, uncertainty, and failure modes.

## Sports state model

Use a state vector appropriate to the sport. Preserve raw values and transformed values, with feature metadata. For a matchup, model the relevant difference or interaction between the two states rather than treating each team as an isolated row.

```text
team_state(team, date)
matchup_delta(A, B, date)
outcome(matchup, date)
```

Do not assume that the best team wins every individual game. Aggregation can reveal persistent strength while realized games retain randomness.

## Output contract

Provide:

- target, horizon, and as-of boundary;
- source and freshness status;
- team or player state definition;
- opponent and schedule adjustments;
- major structural events;
- baseline versus candidate model;
- probability or ranking with uncertainty;
- decision interpretation and unresolved data gaps.

For betting or fantasy decisions, hand off to `okhp3-outcome-modeling-markets` or `okhp3-nfl-fantasy-picks` as appropriate.

## References

- `../okhp3-outcome-modeling-core/SKILL.md` -- shared outcome-modeling contract.
- `../okhp3-nfl-fantasy-picks/SKILL.md` -- NFL fantasy-specific adapter.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
