---
name: log-analysis
description: Extracts an answer from logs, traces, or metrics — finding the relevant lines in volume, correlating across services, and telling signal from noise. Use this whenever the user points at a log file, asks what happened at a particular time, mentions grepping logs, wants to know how often something occurs, or is trying to reconstruct a sequence of events across services. For fixing what the logs reveal, use debugging; for the write-up afterwards, use root-cause-analysis.
license: MIT
---

# Log analysis

Logs are a haystack that grows faster than you can read it. The skill is not reading logs — it is
constructing a query narrow enough to answer one question, then widening only as far as needed.

The failure this prevents: scrolling. Scrolling through logs feels like work and finds only what
happens to be near the cursor.

## 1. Ask one answerable question

Before opening anything, write the question down. "What went wrong?" is not answerable. These
are:

- Did request `abc-123` reach the payment service?
- How many 500s between 14:00 and 14:30, and on which endpoint?
- What is the first error after the deploy at 13:47?
- Which tenant accounts for the spike?

**Done when:** you have a question with a checkable answer.

## 2. Anchor on time and identity

Two anchors make everything else tractable:

- **A time window:** bound it tightly, then widen. Start a few minutes before the first known
  symptom, because the cause usually precedes it.
- **An identifier:** request ID, trace ID, user, order, tenant. One identifier that threads
  through services turns a search into a story.

If there is no correlating ID, that is your most important finding. Nothing else you do here
will be reliable, and adding one should be the follow-up action.

**Done when:** you have a window and, ideally, an ID to follow.

## 3. Cut volume before reading

Filter, then aggregate, then read. Reading first is what wastes the afternoon.

```bash
# Shape of the problem before any individual line
grep ERROR app.log | awk '{print $5}' | sort | uniq -c | sort -rn | head

# Rate over time — is it constant, a spike, or a step change?
grep ERROR app.log | cut -c1-16 | uniq -c

# Follow one request across a file
grep 'req_id=abc-123' *.log | sort -k1,2
```

For structured logs, use the query language rather than grep — `jq` locally, or the platform's
own filtering. Structured logs exist so you can aggregate; grepping them wastes that.

**Done when:** you know the shape — how many, how often, since when, affecting whom.

## 4. Read the boundaries of the incident

The most informative lines are rarely the loudest.

- **The first occurrence.** Not the loudest error, the earliest one. Errors cascade, and the
  hundred downstream failures are noise around one upstream cause.
- **The last normal line** before it started, and what immediately follows it.
- **What stopped appearing.** A log line that vanishes is as meaningful as one that appears — a
  heartbeat that stopped, a job that never logged completion.
- **The gap.** Silence in a normally chatty service usually means blocked, not idle.

**Done when:** you can state the first symptom and what preceded it.

## 5. Correlate before concluding

- Line up the timeline against deploys, config changes, feature flag flips, scaling events, and
  scheduled jobs. Most incidents correlate with a change.
- Compare the affected population to an unaffected one — same time, different region or version.
  A natural control is worth more than any amount of reading.
- **Check the clocks.** Servers in different timezones, or logs in local time and UTC mixed, will
  produce a false ordering and a wrong conclusion. Verify before trusting sequence.

**Done when:** the sequence is confirmed by more than one source.

## 6. Report what the logs support, and no more

Logs show what was recorded, which is not the same as what happened. Be explicit about the gap:

- **Say what you searched:** the window, the query, the sources. A finding without its query
  cannot be checked or repeated.
- **Distinguish absence of evidence from evidence of absence.** "No error logged" may mean it
  did not happen, or that the path has no logging, or that logs were dropped under load. Say
  which you believe and why.
- **Note sampling and retention.** Sampled traces and rotated logs both hide things.
- **Quote line counts, not impressions.** "412 occurrences across 3 hosts" beats "lots".

## Improving what you found

Every log investigation exposes a gap. Note them as follow-ups: a missing correlation ID, an
error logged without context, a swallowed exception, a log at the wrong level. Fixing those is
what makes the next incident shorter, and it is the most valuable output of this work.
