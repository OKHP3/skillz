---
name: deployment-strategies
description: Gets a change into production safely — blue-green, canary, rolling, feature flags, and the rollback that makes each of them safe. Use this whenever the user is planning a release, asks how to deploy without downtime, mentions canary or blue-green, is adding a feature flag, or is nervous about a risky change going out. For deploying an AI agent specifically, use agent-deployment; for the pipeline that runs the deploy, use ci-pipelines.
license: MIT
---

# Deployment strategies

Every deployment strategy is a way of buying information before you are fully committed. They
differ in what they cost and how much they tell you.

The question that decides everything: **how quickly can you undo it, and what does undo not
cover?** A strategy without a tested rollback is not a strategy.

## 1. Separate deploy from release

The most useful idea here, and the one that unlocks the rest. Deploying is shipping the code;
releasing is turning the behaviour on. When they are the same event, every deploy is risky and
every rollback is a deploy.

Split them with a flag, and you can ship code continuously, turn a feature on for one account,
and turn it off in seconds without a build.

**Done when:** you can change behaviour without shipping code.

## 2. Choose the strategy the risk warrants

| Strategy | Buys you | Costs |
| --- | --- | --- |
| **Rolling** | Simple, no extra capacity | Both versions live at once; slow rollback |
| **Blue-green** | Instant switch and instant rollback | Double capacity during the switch |
| **Canary** | Real traffic on a small blast radius | Needs traffic splitting and per-version metrics |
| **Feature flag** | Per-user control, instant off | Flag debt, and both code paths must work |
| **Shadow** | Zero risk, real inputs | No user-visible result; needs response comparison |

Most changes need nothing more than rolling. Reserve the expensive strategies for changes that
are hard to undo or hard to test, and note that the two-version overlap in rolling and canary
is itself a constraint: both versions must tolerate each other's data.

**Done when:** the strategy matches the cost of being wrong.

## 3. Make rollback the first thing you test

Not the last. Rehearse it before the deploy that needs it.

- **Time it.** "We can roll back" means nothing if it takes 40 minutes
- **Know what it does not undo:** migrations already applied, messages already sent, caches
  already poisoned, data already written in the new shape. This list is the real risk
- **Keep the previous version warm** where the strategy allows an instant switch
- **Roll back first, diagnose second.** During an incident, understanding is not the priority.
  See `incident-response`

**Done when:** you have executed a rollback in a real environment and timed it.

## 4. Make the database change independent of the code change

The most common source of un-rollbackable deploys. If the new code requires a schema the old
code cannot use, you cannot roll back — the deploy and the migration are now one atomic,
irreversible event.

Use expand-then-contract so every intermediate state works with both versions. See
`data-migration`. This is what makes everything else in this skill possible.

**Done when:** the old version still runs against the new schema.

## 5. Define promotion and abort before you start

Write the numbers down in advance, because judgement degrades once a deploy is in flight and
"it's probably fine" becomes very persuasive.

- **Promote when:** error rate within X of baseline for Y minutes, latency within Z, no new
  alert classes
- **Abort when:** any of those breach, or anything irreversible fires unexpectedly
- **Compare against the old version running concurrently**, not against yesterday. Canary is
  valuable precisely because it gives you a live control group

**Done when:** both thresholds are written and someone is watching them.

## 6. Manage flag debt deliberately

Feature flags are excellent and they accumulate. A codebase with 200 stale flags has an
untestable number of possible states.

- **Every flag gets an owner and a removal date** at creation
- **Remove it once the feature is fully on:** the flag was scaffolding
- **Distinguish release flags** (temporary, removed) from **operational switches** (permanent,
  kill switches). Different lifecycles, and conflating them is how removal never happens

**Done when:** every flag is either permanent by design or has a removal date.

## Report

State the strategy and why, the rollback procedure and when you last tested it, the promotion
and abort criteria, and what the rollback would not undo. That last item is the one people
discover at the worst moment.
