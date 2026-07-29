---
name: okhp3-outcome-modeling-markets
description: >
  Compare independent probabilities with prediction-market prices and evaluate
  expected value, calibration, liquidity, spread, and resolution risk. Use when
  analyzing event contracts, odds, edge, paper backtests, or risk-adjusted
  position sizing. Load `okhp3-outcome-modeling-core` first; this skill does not
  place or manage trades.
license: MIT
compatibility: >
  Requires an approved current data source for live markets and an explicit
  resolution rule. Historical or hypothetical analysis can use user-supplied
  snapshots without market access.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Independent event probability modeling and calibration
    - Market-implied probability, price, spread, liquidity, and resolution analysis
    - Expected value, uncertainty, scenario, and paper-trading evaluation
  out_of_scope:
    - Placing, cancelling, or managing trades or bets
    - Claims of guaranteed profit or certainty
    - Inventing live prices, market rules, or event-resolution facts
  status: enhanced-computational-payload
  tags: prediction markets, implied probability, expected value, edge, liquidity, resolution, paper backtest
  triggers: market probability, contract price, odds, edge, EV, spread, fees, slippage, resolution rule
  inputs: contract wording, resolution authority, observed price, model probability, timestamp, fees, slippage, and liquidity
  outputs: probability comparison, all-in cost, expected value, break-even probability, uncertainty, and research status
  runtimes: Portable prose by default; optional Python 3.9+ standard library helper for local JSON arithmetic
---

# okhp3-outcome-modeling-markets

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Compare an independently constructed probability with a market price while preserving uncertainty, resolution rules, liquidity, and cost. This adapter adds the market layer to the outcome-modeling core. It is research and decision support, not an execution workflow.

---

## Scope

| In scope | Out of scope |
|----------|-------------|
| Event probability and market-price comparison | Trade or bet execution |
| Resolution, liquidity, spread, and expected value | Invented current market data |
| Calibration, scenario analysis, and paper backtesting | Guaranteed edge or profit claims |

---

## Required intake

Record:

- exact contract question and mutually exclusive outcomes;
- resolution authority, rule, date, and ambiguity risk;
- market venue, price format, bid/ask spread, and liquidity;
- observation timestamp and data freshness;
- independent model target, horizon, and evidence;
- fees, slippage, capital, exposure, and loss constraints;
- whether the task is research, paper trading, or an explicitly authorized execution workflow.

If the resolution rule is unclear, stop at a comparison and label the result unresolved.

## Workflow

1. Load `okhp3-outcome-modeling-core` and define the event target and as-of time.
2. Build an independent probability from domain evidence, base rates, and time-aware features.
3. Preserve the market-implied probability separately from the model probability.
4. Normalize price formats and remove bookmaker margin when relevant.
5. Compare probability, price, spread, liquidity, fees, and resolution risk.
6. Quantify expected value and uncertainty rather than reporting raw directional confidence.
7. Backtest only with historical information available at each historical timestamp.
8. Report sensitivity to model error, market movement, liquidity, and resolution ambiguity.

## Validation gates

Before any paper conclusion, verify the contract wording, resolution authority, observed-at timestamp, price format, costs, and liquidity assumptions. If any resolution rule remains ambiguous, return an unresolved research result.

## Output contract

```text
contract | venue | resolution | observed_at
model_probability | market_probability | uncertainty
price or bid/ask | spread | liquidity | fees
expected_value | scenario range | key risks
decision: research, pass, paper test, or requires explicit execution approval
```

Do not treat a model-market difference as a trade recommendation automatically. A small edge can disappear through uncertainty, spread, fees, slippage, or ambiguous resolution.

## Computational payload

Read `references/computational-model.md` for binary price, edge, all-in cost,
expected value, and break-even formulas. Read `references/glossary.md` before
using market abbreviations. Reproduce the synthetic comparison with
`scripts/calculate-market-comparison.py examples/market-example.json`. The
helper is local, deterministic, read-only, and does not execute trades.

## Safety boundary

This skill must not request private keys, place orders, cancel orders, or imply guaranteed returns. If the user asks for execution, route to an explicitly authorized trading workflow and require confirmation of the exact contract, side, price, amount, and risk.

## References

- `references/computational-model.md` -- market equations and example.
- `references/glossary.md` -- market terms and abbreviations.
- `examples/market-example.json` -- synthetic contract fixture.
- `scripts/calculate-market-comparison.py` -- dependency-free comparison helper.
- `../okhp3-outcome-modeling-core/SKILL.md` -- shared outcome and validation contract.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
