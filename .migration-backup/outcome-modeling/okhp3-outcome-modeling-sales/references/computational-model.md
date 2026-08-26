# Sales computational model

Compare opportunities and commercial choices using expected contribution rather
than close rate alone. A salesperson's observed close rate is partly a result of
opportunity assignment, customer fit, price, competition, and service burden.

## Opportunity contribution

For opportunity `i`:

```text
net_margin_i = revenue_i * (1 - discount_rate_i) * gross_margin_rate_i
expected_contribution_i = win_probability_i * (net_margin_i - service_cost_i)
                         - acquisition_cost_i
```

If the cost timing differs, change the formula and document whether the cost is
incurred on every opportunity or only on a win. A probability estimate should be
calibrated by stage, segment, rep, and time period where sample size permits.

## Incremental lift

When comparing an action or salesperson with an opportunity baseline:

```text
incremental_lift = action_probability - baseline_probability
incremental_value = incremental_lift * net_margin - incremental_action_cost
```

Do not call an association causal unless the assignment process supports an
experiment, holdout, natural experiment, or explicitly labeled observational
design.

## Allocation under constraints

Select opportunities to maximize total expected contribution subject to budget,
capacity hours, service limits, territory rules, and risk constraints. The
included small-fixture helper uses exhaustive search so every choice is auditable;
larger production problems need a tested optimizer.

## Worked example

An opportunity with `60%` win probability, `$100` revenue, `70%` gross margin,
`10%` discount, `$8` service cost, and `$5` acquisition cost has expected
contribution `0.60 * (100 * 0.90 * 0.70 - 8) - 5 = $28.00`.

Run:

```bash
python3 scripts/calculate-sales-allocation.py examples/sales-example.json
```
