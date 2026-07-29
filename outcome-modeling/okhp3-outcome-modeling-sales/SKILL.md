---
name: okhp3-outcome-modeling-sales
description: >
  OverKill Hill P³ business sales outcome modeling. Use when forecasting
  pipeline, comparing salespeople, allocating territories, evaluating account
  quality, or optimizing commercial decisions under capacity and margin
  constraints. Also activate when a 100% close rate, stage probability, quota
  forecast, discount, retention, or customer lifetime value may hide economic
  inefficiency. Load `okhp3-outcome-modeling-core` first.
license: MIT
compatibility: >
  Requires user-supplied or approved CRM, finance, or customer data. Do not
  infer private customer facts or connect to a CRM without user authorization.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Pipeline, account, salesperson, territory, and commercial-value modeling
    - Margin-aware forecasting and constrained sales or resource allocation
    - Selection bias, opportunity quality, retention, and incremental lift checks
  out_of_scope:
    - Inventing CRM, customer, quota, or pricing data
    - Ranking people without opportunity and territory context
    - Sending outreach, changing CRM records, or making employment decisions
---

# okhp3-outcome-modeling-sales

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Apply outcome modeling to sales and business decisions where raw wins can hide discounting, easy-opportunity selection, churn, service cost, or money left on the table. The primary object is economically efficient contribution, not a flattering headline metric such as close rate.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Pipeline and revenue forecasts | Fabricated CRM or customer information |
| Margin, retention, expansion, and capacity-aware decisions | Personnel decisions based on a single metric |
| Rep, account, territory, and opportunity comparisons | Unauthorized outreach or CRM writes |

---

## Reframe the sales outcome

Do not treat a 100% close rate as proof of superior performance. First examine opportunity assignment, customer fit, deal size, competition, discounts, cycle time, retention, expansion, service burden, and capacity consumed.

Use an economic objective such as:

```text
expected contribution margin
- discount cost
- acquisition and service cost
- time and capacity cost
+ retention and expansion value
+ incremental lift above opportunity baseline
```

The exact objective must be agreed before ranking salespeople or allocating resources.

## Workflow

1. Load `okhp3-outcome-modeling-core` and define the decision horizon, owner, and target.
2. Identify the opportunity, account, rep, territory, product, and time grains.
3. Build pipeline or account states using only information available at each forecast date.
4. Separate assigned opportunity quality from rep actions and outcomes.
5. Normalize revenue, margin, discount, cycle time, retention, and expansion measures.
6. Compare raw conversion with expected value, contribution, and incremental lift.
7. Check selection bias, territory effects, customer segment, competitive intensity, and reverse causation.
8. Use experiments or holdouts when the recommendation is an intervention such as discounting, routing, or outreach.
9. Allocate under capacity, budget, service, and risk constraints.

## Validation gates

Before ranking people or accounts, verify the as-of boundary, opportunity-assignment fields, margin definitions, and retention window. Reject a recommendation when the economic objective or causal comparison is undefined.

## Output contract

Return:

- target and forecast horizon;
- data quality and assignment boundary;
- pipeline or account state definition;
- raw outcome versus economic-value comparison;
- margin and discount analysis;
- selection-bias and confounding assessment;
- calibrated forecast or ranking;
- recommended allocation with constraints;
- retention, expansion, and downside risks;
- next measurement or experiment.

Never punish a salesperson for a low close rate until opportunity difficulty and assignment quality are modeled. Never reward a high close rate without testing whether price, fit, volume, margin, and retention justify it.

## References

- `../okhp3-outcome-modeling-core/SKILL.md` -- shared objective, state, and validation contract.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
