# Native-agent delegation contract

## Purpose

Delegate bounded implementation or automation work while retaining human and
maintainer control over diagnosis, authorization, verification, and completion.

## Worker selection

| Worker | Appropriate work | Required handoff | Not authorized to decide |
|---|---|---|---|
| Dependabot | Dependency and security updates | Ecosystem, update range, policy, validation | Merge, close, delete, or publish |
| GitHub Copilot | Bounded code/config repair | Root cause, files, tests, exclusions | Scope expansion or release approval |
| GitHub Actions | Deterministic checks, generation, deploy | Event, command, artifact, success contract | Changing authorization or secrets |
| Local Git/CLI | Unavailable native capability or inspected repair | Repository state and rollback plan | Destructive cleanup without approval |

## Handoff packet

Every delegation records repository, exact item, causal evidence, requested
change, in-scope and out-of-scope files, acceptance tests, validation commands,
security constraints, expected branch or PR, and expiry or timeout.

## Return states

- `delegated`: worker accepted the task; no result yet.
- `delegated-but-unverified`: output exists but has not passed review.
- `verified`: diff and validation satisfy the packet.
- `rejected`: worker output is unrelated, unsafe, or fails the contract.
- `blocked`: permission, secret, platform, or owner decision is missing.

Never convert `delegated` or `delegated-but-unverified` into `fixed` merely
because a PR was opened or a check started.
