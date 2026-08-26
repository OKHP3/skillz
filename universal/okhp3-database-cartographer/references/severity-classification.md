# Severity Classification

The P1/P2/P3 discipline this skill uses is not invented here -- it's inherited from a proven prior-art audit method (a live Access-database-vs-locked-SharePoint-plan interrogation) that ran across many findings on a real project without drifting or needing a fourth tier. Keep exactly these three tiers. Don't add a P0 or a P4 without a concrete case that the three don't cover.

## The three tiers

**P1 -- blocks data load, active corruption, or a live bug.**
The finding describes something that will cause incorrect data, a failed load, or ongoing damage if left alone. Examples: a field typed as multi-value when the spec requires single-select; a required relationship that doesn't exist in the live schema; a flow or trigger writing the wrong value on every save.

**P2 -- verify before broad use.**
The finding is a real discrepancy but its impact isn't yet confirmed. It might be intentional, might be stale documentation, might be a genuine miss -- it needs a human or a follow-up check to resolve, not an assumption either way.

**P3 -- future enhancement, non-blocking.**
Cosmetic, deferred, or "would be nice" items. Does not block anything currently in progress. Safe to carry forward across multiple sessions without urgency, as long as it stays visible (see "Don't let findings go stale" below).

## Format each finding as a row, not a paragraph

| Date | Entity | Finding | Severity | Required Action | Status |
|---|---|---|---|---|---|

This is deliberately terse and scannable -- a findings report is a working document someone will re-read repeatedly, not a narrative someone reads once.

## Before running a new audit: check what's already logged

If the user has an existing findings register (a `soreg-delta.md`-style running log, a tracked-issues file, anything with a Status column), read its Open rows first. Rediscovering an already-logged finding and presenting it as new wastes the user's time and erodes trust in the audit. If a fresh interrogation surfaces something already tracked, say "confirmed still open, previously logged on [date]" rather than re-describing it as a new discovery.

## Don't let findings go stale

A P1 with no action for weeks is worse than not having found it -- it signals the register isn't being watched. If a finding has been open and unaddressed across multiple sessions, say so explicitly in the summary ("N days old, oldest open item in this table") rather than letting it silently roll forward as one row among many.
