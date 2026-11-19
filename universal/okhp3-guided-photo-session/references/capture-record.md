# Capture record and failure contract

Load for live session planning and delivery. Keep device and source details
private. This record may remain in the conversation if saving it is unnecessary.

## Preflight

- Scope: stills, count, requested app/device, destination and current authority.
- Capability: installed, preview visible, control callable, still save verified.
- Communication: ready/stop/relax user-visible, control agent, latency constraints.
- Settings: initial values, authorized adjustments, restore agreement.
- Plan: measured/unknown latency, batch size, pose budget, cancellation route.
- Ready cue: current acknowledgement after preflight, not an old message.

## Results

- Requested, attempted, confirmed saved, readable verified, delivered counts.
- Per file: source session, name, type/dimensions, size, stable locator, duplicate
  status, and digest if available. Report unknown rather than invent a value.
- Capture start/end, actual duration/cadence if measured; true burst or sequence.
- Stop/partial state, pending save state, reason, and remaining requested stills.
- Relax cue sent and settings left changed/restored/unknown.
- Local save, upload, user retrieval and cloud sync verification separately.

## Failure decisions

| Condition | Action |
|---|---|
| Controls not callable | Offer a user-operated still workflow; no claim of tool control |
| Preflight call blocks beyond intended pose budget | Keep user relaxed; switch route before requesting readiness |
| Internal worker can capture but cannot cue the user | Retain direct control or use user-operated capture |
| Stop arrives with a save dialog open | No new capture; safely finish/cancel that still save, report partial count |
| A save fails midway | Relax first; verify existing files; obtain readiness for another batch |
| Video is the only callable action | Do not record; offer user-operated stills |
| UI state changed | Reinspect current state and replan while the person relaxes |
| Destination is occupied | Preserve both; choose a new name or ask about a material conflict |
| Local sync folder contains files | Verify local bytes only; provider sync remains unknown |

No numeric latency promise is portable across hosts. State a plan supported by
the current route and offer a user-operated fallback when blocking tools prevent
a bounded automated session.
