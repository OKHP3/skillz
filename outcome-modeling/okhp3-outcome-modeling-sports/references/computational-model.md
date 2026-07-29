# Sports computational model

Use this as a transparent starting point. Replace the fields with sport-specific
features only after defining their time availability and measurement rules.

## Strength update

For a team or player rating, shrink the new observation toward the prior:

```text
new_rating = decay * prior_rating
           + (1 - decay) * (opponent_rating + observed_margin)
```

`decay` between 0 and 1 controls how much historical strength persists. This is
not a complete rating system. It is a small example of partial pooling and makes
the sample-size assumption visible.

## Matchup probability

For a home-versus-away binary outcome:

```text
expected_margin = home_rating - away_rating
                + home_advantage
                + structural_adjustments
p_home = sigmoid(expected_margin / scale)
```

`scale` controls how quickly rating differences become probabilities. Estimate
it from historical data and calibrate the result. Do not use one-game margin as
proof of stable team quality.

## Feature groups

Group candidate variables by role: scoring efficiency, possession or opportunity,
opponent strength, venue, rest, travel, injuries, role, and regime changes.
Compare simple baselines such as win record, scoring differential, or an
Elo-style rating with the richer state model using chronological validation.

## Worked example

With home rating `5`, away rating `2`, home advantage `1.5`, and scale `7`, the
expected margin is `4.5` and the home probability is approximately `0.655`. With
prior rating `4`, opponent rating `3`, observed margin `10`, and decay `0.75`,
the updated rating is `6.25`.

Run:

```bash
python3 scripts/calculate-sports-model.py examples/sports-example.json
```
