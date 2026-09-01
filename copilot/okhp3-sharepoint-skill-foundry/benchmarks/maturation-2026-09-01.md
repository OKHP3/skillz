# v1.1.0 maturation record — SharePoint Foundry

## Hypothesis

The v1.0.0 Foundry protected the native preview boundary and separated Library
from List, but a valid file could still be mistaken for a discovered native
skill. Recording the authoring/revision route and loaded-skill indicator makes
that lifecycle gap testable without weakening the site boundary.

## Evidence ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Skills are preview-native assets stored in the Agent Assets library. | Microsoft Learn: Extend Copilot in SharePoint with skills, retrieved 2026-09-01 | sourced |
| Authors can create a skill in chat, review it, and confirm saving. | Microsoft Learn: Extend Copilot in SharePoint with skills, retrieved 2026-09-01 | sourced |
| A selected file test and chat indicator can confirm a skill loaded. | Microsoft Learn: Extend Copilot in SharePoint with skills, retrieved 2026-09-01 | sourced |

## Equilibrium review

- **Evidence:** approve the lifecycle record; it refines documented creation and
  run behavior without adding unsupported host capabilities.
- **Outcome:** approve-with-limits; Library/List separation remains intact and
  a portable pattern is still not a tenant deployment.
- **Safety/portability:** approve; native permission, no-custom-code, and
  confirmation gates are unchanged.
- **Disruptor hypothesis:** a loaded indicator may not prove the requested
  mutation succeeded. Test read-only, missing-schema, and supported-write cases
  in one disposable library and one disposable list before any write claim.
- **Negotiated decision:** release v1.1.0 as analytical maturation only.

Independent reviewer forks were requested but inherited interrupted task
context and supplied no final review record. This is a parent-authored,
source-backed review, not independent tenant evidence.
