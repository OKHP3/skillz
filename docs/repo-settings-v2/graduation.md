# Graduation gate: v2 local candidate

Decision scope: route a public-safe, locally validated skill candidate to the
existing universal distribution family. This is not production workflow acceptance.
Artifact validation record: validation.json. Final review must also clear the
candidate's recorded hash before routing.

| Criterion | Score | Evidence |
|---|---:|---|
| Bounded | 2 | One repository, nine scalar checks, manual coverage matrix; no automatic repair or deployment |
| Demonstrable | 1 | Offline CLI fixtures and template parsing; hosted Actions and authenticated audit not exercised |
| Reusable | 2 | Runtime repository identity, synthetic profile, stdlib helper, dormant adapter, no owner URLs |
| Owned | 2 | Three concrete next actions below; repository owner decides operational adoption |
| Clean | 2 | Account URL removal, profile/path/token pattern tests and manual package review; no credentials bundled |
| Distinct | 2 | Complements creator scaffolding and review; handles settings evidence and repeatable drift assessment |

Total: 11/12. GO for local candidate routing, conditional on final adjudication
and mirror equality. No zero. Confidence: moderate for this bounded decision.
HOLD operational activation until an authorized repository-bound installation
and observed hosted run establish its behavior and permission coverage.

Next three actions:
1. Complete final hash-specific adjudication and verify all three package copies.
2. Select and authorize a repository installation, bind its profile, inspect access,
   and review the dormant workflow as a concrete change before activation.
3. Observe manual then scheduled runs, resolve unknowns without hiding them, and
   retain evidence before making operational or performance claims.

Owner authorization already covers v2 authoring and local Skillz routing. It does
not imply new credentials, paid integrations, commits, pushes or deployment.

## Closeout

Final adjudication and the attribution-policy addendum approved the candidate
with stated limits. All 14 package files match across three surfaces, and the
final catalog build passed. Local routing conditions are satisfied. Operational
activation remains held pending the separately scoped installation evidence.
