# Prediction-market computational model

This adapter compares a model probability with a binary contract price. It is a
research calculation and does not place, cancel, or manage an order.

## Probability and price

For a binary contract that pays `payoff` if the event resolves true:

```text
market_probability = yes_price
all_in_cost = yes_price + fee + slippage
edge = model_probability - market_probability
expected_value_per_contract = model_probability * payoff - all_in_cost
break_even_probability = all_in_cost / payoff
```

For a “no” position, transform the price and payoff explicitly rather than
silently reusing the “yes” formula. Confirm whether the displayed price is a
midpoint, bid, ask, or last trade. Liquidity and spread can make a theoretical
edge unavailable at executable size.

## Resolution and uncertainty

Record the exact contract wording, resolution authority, cutoff, timestamp,
ambiguity risk, fees, and slippage. A probability difference is not evidence of
an actionable edge when the resolution rule is unresolved or model uncertainty
spans the difference.

## Worked example

With model probability `0.62`, price `0.55`, fee `0.02`, slippage `0.01`, and a
`1.00` payoff, the market probability is `0.55`, the edge is `0.07`, the all-in
cost is `0.58`, and expected value is `0.04` per contract. The break-even
probability is `0.58`. These are arithmetic outputs, not a profit guarantee.

Run:

```bash
python3 scripts/calculate-market-comparison.py examples/market-example.json
```
