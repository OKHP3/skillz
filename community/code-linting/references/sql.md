# SQL linting

## Tools

**sqlfluff** is the practical choice — it is dialect-aware, formats as well as lints, and
understands templating (dbt, Jinja) which is where most real SQL lives.

```ini
# .sqlfluff
[sqlfluff]
dialect = postgres
templater = jinja
max_line_length = 120
exclude_rules = L016,L034

[sqlfluff:indentation]
indented_joins = false
indent_unit = space
tab_space_size = 2

[sqlfluff:rules:capitalisation.keywords]
capitalisation_policy = upper
```

Run: `sqlfluff fix .` then `sqlfluff lint .`

Set the **dialect** correctly. Generic-dialect linting produces false positives on every
vendor-specific construct, and people then disable the tool.

## Rules worth enforcing

- **Explicit column lists** instead of `SELECT *` in anything persisted — a view or a stored
  query with `*` breaks silently when a column is added.
- **Explicit JOIN syntax**, never comma joins. Comma joins hide the join condition in the
  WHERE clause, and a missing one becomes a cross join.
- **Qualified column references** in any query with more than one table. Ambiguity resolved by
  the engine today can resolve differently after a schema change.
- **Consistent keyword casing** — trivial, but it makes diffs readable.

## Rules to skip

Line length on SQL is usually counterproductive; a long `SELECT` list is more readable on one
line than wrapped arbitrarily. Rules dictating CTE-vs-subquery style are taste.

## Migrations are a different problem

Linting will not catch what actually causes migration incidents. Check separately for:

- **Locking operations on large tables** — adding a non-null column with a default, or an index
  without `CONCURRENTLY` in Postgres, takes a lock that stops writes
- **Irreversible steps** — a dropped column cannot be recovered from a rollback
- **Backfills inside the migration transaction** — these hold locks for the duration

`squawk` lints Postgres migrations specifically for these and is worth adding wherever
migrations run against a live database:

```bash
squawk migrations/*.sql
```

## Traps

- **Templated SQL confuses parsers.** Configure the templater or sqlfluff will report syntax
  errors on valid dbt models.
- **Auto-fix can change semantics** in edge cases around whitespace-sensitive constructs.
  Review the fix diff; do not run `fix` blindly in CI.
- **Dialect mismatch between environments** — linting as Postgres while running on Redshift
  passes queries that fail in production.
- Generated migration files from an ORM should be excluded; you cannot edit them meaningfully
  and the tool will complain forever.
