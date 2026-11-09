# Event and experiment ledger

Load when reconstructing an event or drafting its next controlled test.

| Field | Record |
|---|---|
| Success class | Observable result, measure, tolerance, audience, exclusions |
| Source boundary | Supplied sources, access limits, dates, missing evidence |
| Inputs | Ingredients or materials, amounts, selection criteria, unknowns |
| Sequence | Order, timing, delays, iterations, and missing timestamps |
| Tooling | Tools, versions, settings; unknown rather than guessed |
| Environment | Context, constraints, interruptions, collaborators |
| Intent | Goals, risk tolerance, accepted tradeoffs, non-optimized variables |
| Evidence status | observed / reported / hypothesis / unknown |
| Candidate condition | Why it may matter and its source |
| Rival explanation | Another explanation compatible with the event |
| Falsifier | An observation that would weaken the candidate condition |
| Protocol | Entry, preflight, stages, thresholds, allowed deviations, rejects |
| Experiment | Fixed variables, changed variable, control/comparison, repeats |
| Measurement | Instrument, rubric, observation window, confounds |
| Safety | Authorization, stopping conditions, recovery or rollback |
| Decision log | Inputs, choices, deviations, rejected paths with reasons |
| Result | Actual observations or NOT RUN; never an imagined outcome |

Copy the relevant fields; do not require a large form before useful partial
analysis. Keep missing evidence explicit. Observed values from one success do
not define safe ranges or prove a causal model.
