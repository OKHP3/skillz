# Schema changes, recovery rehearsal, and operator handoff

Use this alongside `operational-migrations.md` and `migration-testing.md`.
They retain the authoritative snapshot/delta, checkpoint, reconciliation, and
forward-repair rules for the consolidated package.

## Separate the stages

Keep schema expansion, data backfill, application deployment, read-authority
switch, and contraction independently deployable. A backfill belongs in a
bounded resumable job, not one long schema-migration transaction. Establish
how each stage remains compatible with the currently deployed application.

Expand first, keep old readers working, maintain the new representation,
backfill, reconcile, switch reads, and only later stop old writes and contract.
Prefer one authoritative write with durable change capture. Temporary dual
writes require explicit precedence, idempotence, divergence monitoring, and
reconciliation; they do not establish atomicity or prove reversibility.

## Check actual lock behavior

For each statement, verify lock level, expected hold time, rewrite behavior,
transaction restrictions, and cancellation/recovery behavior for the actual
database engine and version. Rehearse with representative data volume and
live-traffic load, including long-running transactions.

For PostgreSQL, explicitly investigate:

- Ordinary index creation versus supported concurrent index creation, including
  its transaction restrictions and how failed builds are recovered.
- Defaults and column-type changes that can cause table rewrites; behavior
  depends on the expression, type, engine version, and existing data.
- Foreign-key validation locks on both tables and whether adding a constraint
  as `NOT VALID`, then validating separately, fits the target operation.
- A statement waiting behind a long transaction and the queue it can create
  even when the statement itself would normally finish quickly.

Set bounded lock/statement waits and abort thresholds appropriate to the
approved plan. A short development run does not establish production duration.

## Rehearse recovery before execution

Use an authorized, access-controlled production-compatible restored copy with
representative volume and skew. Do not export private production data into
public fixtures or agent context. Record measured duration, lock impact, and
the recovery rehearsal result.

Identify a sufficiently recent recoverable backup and verify restoration.
Specify the recovery point and what post-backup writes would need replay or
repair. Merely having a backup or a down-migration is not proof of recovery.
Rehearse the rollback only when it can represent all new mutations; otherwise
rehearse forward repair and authoritative-routing recovery instead.

## Write the execution and retirement record

Before execution, record stages, verification gates, exact abort thresholds,
recovery steps and their limits, the operator and observer, observation window,
and an agreed low-impact time with support coverage. Preserve the old source
and migration evidence through the declared recovery window; a read-only
retained source is appropriate only when compatible with the authority plan.

After execution, report what ran, elapsed time, measured reconciliation results,
unrun checks, irreversible effects, and the current source of authority. List
temporary dual-write paths, old columns, capture infrastructure, and retained
sources with owners and explicit retirement gates so they do not become
unmanaged permanent state.

## Provenance

The schema-lock, backup-rehearsal, and operator-report methods were adapted
from the captured `community/data-migration` package associated with
`arjunprabhulal/agent-skills` at
`42dd24080fce6d731d00e2a1134f398c3da4171b`. The retained
`data-migration-best-practices` package was captured from
`luckys/agent-skills` at `c098bd422774912958421ae733938e8fff81dfde`;
its existing course-source acknowledgments remain in their reference files.

The [community source ledger](../../COMMUNITY-SKILL-SOURCES.md) records MIT at
both captured source repository roots. This is an attributed local adaptation,
not a verbatim upstream release or a claim of measured behavioral superiority.
The [archive](../../../docs/archive/skill-redundancy-2026-09-19/docs-data/README.md)
preserves unchanged source bytes and hashes.

The bundled [canonical-source MIT notice](../LICENSE) retains Copyright (c)
2026 Luis Ramírez Calle. The incorporated migration method's
[MIT notice](licenses/arjunprabhulal.txt) retains Copyright (c) 2026 Arjun
Prabhulal. Both are unchanged captures from those source commits; this local
adaptation does not replace their ownership notices.
