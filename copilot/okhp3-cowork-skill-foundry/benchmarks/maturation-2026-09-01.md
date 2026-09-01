# v1.1.0 maturation record — Cowork Foundry

## Hypothesis

The v1.0.0 package treated a personal skill and an M365 plugin as adjacent
concepts but did not force the author to choose a delivery mode. Adding that
decision will prevent a task skill from receiving the wrong root, sharing path,
or discovery test.

## Evidence ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Personal skills can be stored in OneDrive and are discovered at a new-session boundary. | Microsoft Learn: Use Copilot Cowork, retrieved 2026-09-01 | sourced |
| Cowork accepts standalone Markdown and rooted skill archives separately from plugin packages. | Microsoft Learn: Customize Copilot Cowork, retrieved 2026-09-01 | sourced |
| M365 plugins have a manifest/icon/skills package contract. | Microsoft Learn: Build plugins for Copilot Cowork, retrieved 2026-09-01 | sourced |

## Equilibrium review

- **Evidence:** approve the delivery-mode distinction; it is directly supported
  by current Microsoft documentation.
- **Outcome:** approve-with-limits; the new decision table makes the Foundry
  more actionable without turning it into a plugin builder.
- **Safety/portability:** approve; the revised contract retains explicit
  connector, approval, and tenant boundaries.
- **Disruptor hypothesis:** a tenant or future product change could alter file
  limits, upload behavior, or discovery timing. Test one personal skill, one
  uploaded archive, and one plugin in the named tenant before a live claim.
- **Negotiated decision:** release v1.1.0 as analytical maturation only.

Independent reviewer forks were requested but inherited interrupted task
context and supplied no final review record. This is a parent-authored,
source-backed review, not independent live evidence.
