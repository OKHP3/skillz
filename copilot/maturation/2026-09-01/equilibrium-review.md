# Equilibrium Review: SharePoint List Skills v1.1.0

Decision question: are the twelve v1.0.0 SharePoint List packages safe and
specific enough to mature to v1.1.0 as analytical host adapters?

## Acceptance criteria

1. Preserve the initial candidate outcome and package distinctness.
2. State only sourced SharePoint host facts as confirmed.
3. Treat granular List capability as host-dependent until tested.
4. Handle untrusted List content and unavailable fields safely.
5. Add fixture-backed analytical evaluation without claiming a live result.

## Independent roles

| Role | Result |
|---|---|
| Evidence reviewer | Approve with limits: core capability and permission boundaries are accurate, but granular List access is unknown. |
| Outcome reviewer | Improve: all twelve are distinct and design-ready, but require concrete fixtures to evaluate their special value. |
| Safety and portability reviewer | Defer until every package explicitly treats List content as untrusted and tests unavailable fields and insufficient permission. |
| Disruptor | Corrected the test-evidence claim: a public fixture is a regression, not a protected holdout; required capability and permission labels must reflect observed state. |
| Negotiator | Approve with limits for analytical v1.1.0; defer any release or task-quality claim pending external evidence. |

## Initial consensus

The smallest candidate v1.1.0 patch is a common host-capability preflight,
an untrusted-content boundary, and a synthetic adversarial **development
regression** for hostile item text plus unavailable or unreadable List data.
The public regression is not a protected holdout: `holdout_seen: true` and an
external, unseen release evaluation remain required. Schema-and-view
review must be especially careful not to imply that List index, internal-name,
or view inspection is a confirmed product capability.

Evidence status: analytical. No package has live tenant, task-quality, or
token-efficiency evidence.

## Disruptor result

The circuit cannot establish host capability from a documentation page or a
generic Microsoft Graph capability. Each package must use only facts exposed by
the current Copilot in SharePoint run or supplied by the user. A missing or
invisible fact is `NOT EXPOSED IN THIS RUN`; `NOT SUPPORTED` needs an explicit
host rejection; and `INSUFFICIENT PERMISSION` needs an observed denial.
Explicit confirmation is a package policy boundary, not a claim that Microsoft
enforces a universal write-control mechanism.

## Negotiated decision

`approve-with-limits` applies only to the v1.1.0 analytical maturation: the
twelve packages preserve their intended outcomes, add the above evidence
labels, treat List content as untrusted, and add package-specific synthetic
regressions. `defer-for-evidence` applies to production readiness, task-quality
uplift, token efficiency, permissions behavior, mutations, and any claim that
the host exposes a particular List surface. Those require a scoped tenant run,
recorded capability observations, a new unseen release evaluation, and an
authorized human review of any proposed write.
