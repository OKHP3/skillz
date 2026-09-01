# v1.1.0 maturation record — GitHub Copilot Foundry

## Hypothesis

The v1.0.0 Foundry separated local and remote authority but did not expose
GitHub Copilot's `allowed-tools` as a separate high-risk approval choice. Making
no pre-approval the default prevents a host-specific confirmation bypass.

## Evidence ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Project and personal Agent Skill locations are distinct. | GitHub Docs: Adding agent skills for GitHub Copilot, retrieved 2026-09-01 | sourced |
| Copilot can load scripts/resources from the skill directory. | GitHub Docs: Adding agent skills for GitHub Copilot, retrieved 2026-09-01 | sourced |
| `allowed-tools` can pre-approve tool use and shell/bash has a documented injection risk. | GitHub Docs: Adding agent skills for GitHub Copilot, retrieved 2026-09-01 | sourced |

## Equilibrium review

- **Evidence:** approve; the new tool-approval rule reflects a GitHub-specific
  host feature rather than portable generic advice.
- **Outcome:** approve-with-limits; routine skill creation remains simple and
  more fragile automation receives a deliberate exception path.
- **Safety/portability:** approve; the change strengthens confirmation without
  assuming that every Copilot runtime applies the same tool policy.
- **Disruptor hypothesis:** omitting pre-approval might make an accepted
  trusted automation inconvenient. Test a reviewed, narrow helper in a
  disposable repository and compare explicit confirmation with the proposed
  exception record before adding any `allowed-tools` guidance.
- **Negotiated decision:** release v1.1.0 as analytical maturation only.

Independent reviewer forks were requested but inherited interrupted task
context and supplied no final review record. This is a parent-authored,
source-backed review, not independent cross-surface evidence.
