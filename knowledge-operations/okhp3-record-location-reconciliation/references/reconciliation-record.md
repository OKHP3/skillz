# Reconciliation record

Keep the working record in the owner-approved private destination. Use synthetic
values for examples and publication. Record source type and observation time
when the audience cannot receive a private locator.

| Record | Minimum fields |
| --- | --- |
| Coverage | Scope, root or collection identity, account or drive, observation times, snapshot or change record, pagination status, exclusions, access gaps |
| Item | Exact key, local path, provider item ID and parent, original spelling, type, size, digest algorithm and version when available |
| Plan | Old and new paths, identity to retain, audience, authorization, collision decision, version or value precondition, writer, dependent actions and recovery location |
| Reference | Source location and field, current and intended values, active or historical lifecycle, path or stable item link, resolved identity or gap, backup locator, write guard and readback |
| Receipt | Planned, verified, unverified, or blocked, action and verification times, item ID, observed parents, separate placement, preservation and access results, next check |

A relocation map pairs each exact old root-relative path with its verified new
path, identity and applicable period. Record aliases separately. Hold a
path-only reference when a reused path makes its identity ambiguous. An old
path inside a preserved receipt stays historical. A live field with the same
old path needs a verified correction. If a moved record contains relative
links, compare the resolved targets before and after movement.

For recovery, record the original bytes, expected post-edit value, original
parent and current item identity. Before restoring, recheck authority and
preconditions. Stop when a later owner edit, new occupant, or permission change
would be overwritten. Resume partial work from the per-action receipt.

## Worked example

A team keeps a recruiting packet at `Role Notes/Quarterly Leads`. Its folder
ID `F-18` and purpose show that it belongs under `Job Search/Quarterly Leads`.
The owner authorizes moving that folder and repairing its active tracker path.
A receipt from a prior quarter cites the old path.

1. Check both parent listings and account identities. Record F-18, an empty
   destination, the active field's old value, and the historical receipt.
2. Verify that the same-drive move preserves version history and authorized
   audience. Save the original active field and record the write guard.
3. Move F-18 once. Verify its new parent and the absence of the old path.
   Check the planned descendants, version history and effective audience.
   Record any check that the provider cannot expose.
4. Guard and update the active field. Read it back. Retain the dated receipt
   and add the old-to-new mapping.
5. If cloud contents are inaccessible, report checked inventory and scoped
   byte verification separately. Keep the unavailable check open.

## Closeout checklist

- Every listed branch has a coverage result.
- Both colliding or compared versions have explicit dispositions.
- Each changed item's identity, parent, preserved versions and effective
  audience have separate evidence or a named gap.
- Each affected active link has a readback or named gap.
- Historical paths have mappings and original evidence remains retrievable.
- The closeout states the hash scope, observation interval and any pending
  synchronization.
