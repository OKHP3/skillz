# Per-role application record

Use exact identifiers in private records. Use synthetic/redacted identities in
public examples. Do not copy demographic answers or full application previews
into public repositories or broadly shared trackers.

```text
Identity: candidate account | employer | requisition | application route
Posting crosswalk: platform, posting ID, employer URL, observed link, observed at
Current authority: preparation / material review / upload / submission / record writes
Sources: approved career evidence, version and provenance
Exclusions: permitted audience and content restrictions
Materials: file locator, hash/version, factual check, rendered inspection, review state
Portal: current access, exact route, parsed-work-history validation
Missing material answers and required agreement decisions:

Application state:
  not-started / draft / reviewed / uploaded / submission-attempted /
  submission-uncertain / submitted-confirmed
  (Work may pause at any state. A review or upload is not a submission.)
Employer disposition and last-observed date: unknown / explicit observed outcome
Owner pursuit decision and source:
Listing availability and last-observed date:
Receipt: identity, route, milestone, effective submitted date, observed date,
         source and private evidence locator
Remaining portal tasks:
Next action and owner:

Per requested surface:
  Destination and exact row/file identity
  Prior observed state and version
  Proposed supported delta
  Conditional-write or verified serialization guard
  Attempt result and readback evidence
  State: verified / unchanged / blocked / unverified
  For files: local save result, remote sync observation and hash when available

Block: exact action, target, reason and source; denied / pending / uncertain
Independent completed work and remaining work:
```

## Worked example

Two listings have the title AI Architect. Actual employer links resolve to
SYN-101 and SYN-202. An exact employer receipt confirms SYN-101 was submitted;
SYN-202 requires sign-in. Preserve SYN-101 and complete independent preparation
for SYN-202. The latter stays pending, even if the tracker says Clicked apply.

After authorized submission, the employer receipt supports Submitted for its
exact route. A tracker write succeeds but readback fails: record the application
submitted-confirmed and the tracker update unverified. Do not submit again to
make the tracker agree. Approval to count the activity for a benefits report
remains a separate owner decision.
