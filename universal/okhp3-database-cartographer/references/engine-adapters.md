# Engine Adapters

Verified survey of Python tooling per database flavor. Re-check maintenance status periodically -- library health changes; don't treat this table as permanently current.

## The 80% case: SQLAlchemy-reflectable engines

| Engine | Driver | Notes |
|---|---|---|
| Postgres | `psycopg` (v3) | Default choice, actively maintained |
| MySQL/MariaDB | `PyMySQL` | Pure Python, lightest install; `mysql-connector-python` (Oracle-official) is the alternative |
| MS SQL Server | `pyodbc` | Prefer over `pymssql` -- that project was announced discontinued, then revived by a new maintainer; treat as second-choice, not primary |
| SQLite | stdlib `sqlite3` | No extra driver needed |
| Oracle | `oracledb` (formerly `cx_Oracle`) | Oracle-official |

One code path covers all five:

```python
from sqlalchemy import create_engine, inspect

engine = create_engine(connection_string)  # dialect-specific string, driver above
inspector = inspect(engine)

for table_name in inspector.get_table_names():
    columns = inspector.get_columns(table_name)
    pk = inspector.get_pk_constraint(table_name)
    fks = inspector.get_foreign_keys(table_name)
    indexes = inspector.get_indexes(table_name)
    unique_constraints = inspector.get_unique_constraints(table_name)
```

This same `get_columns()`/`get_unique_constraints()` call pair is what feeds `infer_cardinality()` in `scripts/schema_to_mermaid.py` (v1.1.0) -- each column's `nullable` flag plus whether it appears in a unique constraint is enough to derive Mermaid relationship cardinality without an extra query. See `references/mermaid-handoff.md` and `references/competitive-landscape.md`.

Use `sqlacodegen` (actively maintained) instead of hand-walking the inspector when the deliverable should include generated ORM model code (`declarative`, `dataclasses`, `sqlmodels`, or plain `tables` output styles) rather than just an inventory.

### Beyond generic reflection

`inspect()` gives structure, not everything a DBA would want. For column comments, engine/charset info, and extended properties, query the engine's own metadata layer directly:

- **MySQL/Postgres/MSSQL:** `INFORMATION_SCHEMA.COLUMNS`, `.KEY_COLUMN_USAGE`, `.TABLE_CONSTRAINTS`
- **MSSQL specifically:** `sys.tables`, `sys.columns`, `sys.foreign_keys`, `sys.indexes`, and extended properties for descriptions -- SQLAlchemy reflection doesn't surface these

## The Access case (fragile -- say so)

No clean cross-platform pure-Python option exists.

- **Windows:** `pyodbc` + the Microsoft Access Database Engine ODBC driver, or COM/DAO automation (`win32com.client`) if Access itself is installed. COM/DAO is the more complete option when available -- it can read linked-table metadata that ODBC sometimes can't.
- **Linux/Mac:** `mdbtools` provides an ODBC driver and CLI tools (`mdb-schema`, `mdb-tables`), but has open reliability/driver-registration issues. Workable, not polished.
- Either way: DAO/COM can typically read linked-table *metadata* without being able to open the *records* behind an external linked table (e.g., an Access shell linked to SharePoint lists) -- don't assume schema-level access implies row-level access.

## Deferred: Firestore/NoSQL

Schemaless by design -- there is no schema to reflect, only documents to sample. No mature, actively-maintained Python library does this well; the one exploratory project found in research (`firestore-schema-visualizer`) is explicitly non-production. If this becomes a real need, it requires original code: `firebase-admin` + a document-sampling routine (walk N documents per collection, infer field name/type/optionality/frequency) -- not a dependency to adopt. Out of scope for v1.

## Non-Python alternatives worth knowing about, not using here

SchemaSpy and SchemaCrawler (both Java, both actively maintained) do a similar job -- live DB connection to rich HTML documentation and diagrams -- across most JDBC-supported engines. Mentioned for awareness; this skill stays Python-native by design so it composes cleanly with the rest of the OKHP3 skill catalog.
