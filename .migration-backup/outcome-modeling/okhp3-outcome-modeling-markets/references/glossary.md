# Prediction-market glossary

| Term or abbreviation | Plain-language meaning | Calculation role |
|---|---|---|
| Binary contract | A contract with two mutually exclusive settlement outcomes | Defines the probability and payoff calculation |
| Implied probability | Probability suggested by a market price | A comparison baseline, not ground truth |
| Edge | Difference between independent model probability and market probability | `model probability - market probability` |
| EV, Expected Value | Probability-weighted payoff minus cost | Measures theoretical value before uncertainty and risk |
| Resolution rule | The authoritative rule deciding the outcome | Determines whether the contract is well-defined |
| Liquidity | Ability to transact without materially moving price | Limits whether a paper edge is practically usable |
| Spread | Difference between bid and ask prices | A transaction cost and uncertainty source |
| Slippage | Difference between displayed and realized execution price | Reduces net expected value |
| Fee | Explicit transaction or platform charge | Included in all-in cost |
| Paper backtest | Historical simulation without placing trades | Tests a method without execution |
| Calibration | Reliability of probability forecasts over repeated cases | Tests whether estimated probabilities match outcomes |
| Exposure | Amount at risk from one event or correlated events | A constraint, not a prediction metric |

Confirm the venue's current definitions and resolution authority from an approved
source. Never invent a live market price or resolution rule.
