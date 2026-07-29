# NFL fantasy computational model

Fantasy selection is an allocation problem, not a ranking of the most famous
players. Use projections that match the scoring system, then compare each player
with the replacement option that the roster rules make available.

## Player value

For player `i`:

```text
replacement_value_i = projected_points_i - replacement_points_position(i)
risk_adjusted_value_i = replacement_value_i - risk_penalty_i
cost_efficiency_i = risk_adjusted_value_i / salary_i
```

The risk penalty must be defined, not invented after seeing the answer. It can
represent workload uncertainty, injury uncertainty, or a contest-specific
preference. Do not compare points per dollar across different roster rules
without checking replacement baselines and position scarcity.

## Roster optimization

Choose a set `R` that maximizes:

```text
sum(i in R) risk_adjusted_value_i
```

subject to salary, roster size, positional, exposure, and correlation rules.
For a large slate, use an integer optimizer or a carefully tested search. For a
small transparent example, the included helper enumerates feasible rosters.

## Worked example

If a player projects for `18` points, the positional replacement baseline is
`10`, and the risk penalty is `0.2`, their adjusted value is `7.8`. At salary
`7`, their adjusted value per salary unit is `1.1143`. A player with more raw
points can still be the worse selection if the salary and replacement cost are
substantially higher.

Run:

```bash
python3 scripts/calculate-fantasy-lineup.py examples/fantasy-example.json
```
