---
name: Delegated-run evidence boundaries
description: How to classify response-only subagent evaluations without overstating host behavior
---

Response-only delegated runs are live evidence for the response contract and
the runner configuration, but they are not evidence that the host activated a
skill or performed a quota reset, scheduled a routine, or accepted an
approval.

**Why:** The delegated runner can generate and compare assistant responses
without exposing native skill-discovery events or host-controlled UI and
permission state. Treating those outputs as host telemetry would turn a useful
behavior check into an unsupported platform claim.

**How to apply:** Record response comparisons as `live` when isolated matched
runs actually occurred, record native-trigger checks as `analytical` unless
host activation is observable, and list unavailable host events as explicit
limitations or not-run checks.