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

In the Replit Agent workspace, the available delegated runner remains
response-only: it does not expose native skill activation, quota state, routine
creation, approval cards, or approval-selection events. Native precision and
recall must remain null when that is the only runner available.

**Why:** A fresh bounded fixture response can confirm safe wording without
establishing that the host activated a skill or enforced the corresponding UI
boundary.

**How to apply:** Keep response-only fixture evidence separate from host
telemetry, and mark host-integrated trigger or approval checks not run until a
client exposes those events.

A host-event export can supply the missing native evidence lane only when each
event is host-generated, typed, and marked with the native evidence tier. A
partial export must report coverage and leave precision/recall unmeasured rather
than treating missing activation events as false.

**Why:** An ingestion boundary makes a future host client useful without
silently upgrading response text or incomplete exports into platform evidence.

**How to apply:** Use the benchmark's event schema and importer for host
exports; preserve response and analytical results as separate evidence tiers.