---
name: Catalog refresh drift
description: Full catalog generation can expose unrelated generated-output drift beyond the intended skill change
---

## The rule

Treat a full catalog refresh as a candidate diff, not an automatic commit. Review
family timestamps, root metadata, and Forge payload changes separately from the
intended skill entry; preserve only the generated surfaces required by the task
and keep unrelated entries unchanged.

**Why:** The cataloger refreshes timestamps for every family, while the Forge
builder can also surface pre-existing missing detail files and source/catalog
drift. Committing that incidental output can turn a one-entry version update
into an unrelated catalog migration.

**How to apply:** Run the cataloger and Forge checks, inspect the complete diff,
then retain the target version fields and any explicitly required generated
metadata. Validate the retained catalog JSON and run the maturity audit before
completion.