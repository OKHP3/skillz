# Worked example and validation checklist

Synthetic illustration only. No repository was contacted and no settings were
changed to produce this example. IDs below name supplied fixture observations.

## Input

The owner of `example-owner/local-builder` asks for a plan, not execution.
The supplied fixture describes one owner, a private local Python app, required
PRs with one approval, and a `verify` job filtered to `app/**`. ChatGPT is the
preferred review host. No authority to relax approval requirements is supplied.

## Expected reasoning

Keep the local application private and unhosted. Propose zero approvals to
avoid an impossible second-person dependency, retaining the PR gate; flag that
relaxation for appropriate authority rather than applying it. Do not add verify
as a mandatory all-PR check until coverage is repaired. Return a plan with an
explicit distinction between observed fixture state and live saved state.

## Example record entry

```json
{
  "area": "branches",
  "control": "required_approving_review_count",
  "before": 1,
  "desired": 0,
  "after": null,
  "claim_status": "proposed",
  "action_status": "blocked",
  "reason": "One owner cannot supply an independent second-person approval.",
  "authority": "Plan only; no mutation authorized.",
  "prerequisites": ["Authorization for approval relaxation", "Preserve PR gate and effective inherited rules"],
  "verification": {"method": null, "observed_at": null, "evidence_id": "FIXTURE-01"},
  "recovery": "No write performed; no rollback needed."
}
```

The complete record also lists `verify` as a blocked proposed requirement, the
path-filter gap, and unknown live settings. It does not claim a successful save,
authorize remote creation, or enroll any PR in auto-merge.

## Validation checklist

- [ ] Exact target and scope confirmed; sources and dates recorded.
- [ ] Owner preferences distinguished from platform and organization requirements.
- [ ] All proposed deltas have before/desired/authority/prerequisites/recovery.
- [ ] Required checks have verified identity, source and coverage.
- [ ] Personal/inherited/app automation is inspected or explicitly unknown.
- [ ] Actual Copilot controls inspected; no invented second toggle.
- [ ] Optional review completes before per-PR auto-merge enrollment.
- [ ] Saved-state reads support changed values; unknowns remain unknown.
- [ ] No unauthorized hosting, costs, credentials, merges or publication.
- [ ] Record and recap identify retained values, blocked work, and follow-up.
- [ ] Package structure, relative links and JSON parse correctly.
- [ ] Performance and holdout limits remain explicit.
