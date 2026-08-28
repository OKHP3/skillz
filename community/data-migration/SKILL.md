---
name: data-migration
description: Changes a schema or moves data in production without downtime or loss — column changes, backfills, table splits, and system-to-system moves. Use this whenever the user is writing a migration, altering a table, backfilling data, renaming a column, or moving data between systems. Treat it as required reading before any migration runs against a database with real data. For designing the schema, use data-modeling.
license: MIT
---

# Data migration

Migrations are the most irreversible thing most engineers do routinely. Code can be rolled back;
a dropped column cannot, and a botched backfill can corrupt data in ways no deploy fixes.

Two properties make a migration safe, and both must hold:

- **Backwards compatible:** the currently deployed code works before *and* after it runs
- **Reversible, or backed up:** you can get back, or you have a copy you have tested restoring

If a migration has neither, it needs a maintenance window and a rehearsal.

## 1. Never combine schema change with data change

Separate migrations, separate deploys:

1. Add the new structure
2. Backfill it
3. Switch the code to use it
4. Remove the old structure — later, as its own change

Combining these makes rollback impossible: reverting the code leaves the data half-moved, and
reverting the data loses whatever the new code wrote.

**Done when:** each step is independently deployable and revertible.

## 2. Use expand-then-contract for anything breaking

Renaming a column is not a rename in production. It is:

1. **Expand** — add `new_name`, nullable
2. **Dual-write** — deploy code writing both; reads still use the old
3. **Backfill** — populate `new_name` for existing rows, in batches
4. **Switch reads** — deploy code reading the new column
5. **Stop writing the old**
6. **Contract** — drop `old_name`, well after everything is stable

Slow and boring, and it is the only way to do it without a window. Each step is individually
safe to roll back.

**Done when:** no single step breaks the currently running code.

## 3. Know which operations take locks

The operation that takes an exclusive lock on a large table stops all writes for its duration.
This is the most common cause of migration incidents, and the details are engine-specific —
check yours.

Common traps in Postgres:
- **Adding an index without `CONCURRENTLY`** blocks writes for the build
- **Adding a column with a volatile default** rewrites the table on older versions
- **Changing a column type** usually rewrites
- **Adding a foreign key** takes a lock on both tables while validating — add `NOT VALID`, then
  validate separately
- **A migration waiting behind a long transaction** queues everything behind it, so a "fast"
  migration can still cause an outage

**Done when:** you know the lock each statement takes and how long it holds on production-sized
data.

## 4. Backfill in batches, outside the migration

Never backfill inside the schema migration. It holds a transaction open for the whole run, and a
failure halfway rolls back everything with no progress kept.

Instead, a separate resumable script:
- **Batch:** a few thousand rows at a time, with a pause between
- **Idempotent:** safe to re-run from any point. Track progress by key range, not by offset
- **Throttled:** watch replication lag and back off. Saturating the primary during a backfill is
  its own incident
- **Observable:** log progress so you know whether an eight-hour job is on track

**Done when:** the backfill can be stopped and resumed without losing work or double-applying.

## 5. Rehearse on real data volume

Test against a restored production-sized copy, not a dev database with a hundred rows. A
migration that takes 40ms on 100 rows can take 40 minutes on 40 million, and duration is the
whole question.

Measure the actual runtime, and confirm the rollback works — a down-migration that has never
been run is a hope, not a plan.

**Done when:** you know the real duration and have executed the rollback once.

## 6. Have the plan written before you run it

- **A tested backup**, taken immediately before. Tested means you have restored from it
- **The abort criteria:** what you are watching, and at what value you stop
- **The rollback**, and explicitly what it does *not* undo
- **Who is watching**, and for how long after
- **Timing:** low traffic, and not before a weekend or a holiday

**Done when:** someone else could execute the plan from the document.

## Moving between systems

For system-to-system moves, the same principles plus:

- **Reconcile, do not assume.** Row counts, checksums, and spot-checked records. "The job
  finished" is not verification
- **Dual-write during transition**, with the old system authoritative until reconciliation passes
- **Keep the source read-only and intact** until you are certain. The cheapest insurance available
- **Handle the delta:** records that change *during* the migration are where data is lost

## Report

State what ran, how long it took, what you verified afterwards, and what is now irreversible.
Explicitly list the temporary states left behind — dual-write code, unused old columns — with
owners, or they become permanent.
