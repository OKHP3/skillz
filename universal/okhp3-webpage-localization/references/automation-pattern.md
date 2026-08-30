# Approval-gated automation pattern

## Job flow

```text
authoritative en-US change
  -> detect eligible page and source hash
  -> create one job per configured target locale
  -> agent produces draft from source plus approved glossary
  -> structural and review gates
  -> approval-gated proposed change
  -> normal site build and deployment
```

Keep the source-to-target mapping in the site repository, not in a shared
skill. The mapping must name the source root, output roots, route convention,
supported locale tags, protected terms, and the approval destination.

## Fail-closed conditions

Create no target artifact and report `blocked` when any of these are missing or
ambiguous: source `en-US` authority, source hash, page ID, target locale policy,
target route, glossary state, provider authorization, or the ability to run the
site's normal build and review gates.

## Safe implementation choices

- Trigger only from a reviewed source change, never from a localized output.
- Use the job's `source_sha256` as the idempotency key component.
- Write generated drafts to a review branch, pull request, or equivalent
  approval queue; do not write directly to the live publishing branch.
- Limit the workflow to configured source roots and target output roots.
- Keep provider credentials in the repository host's secret store; never in
  page source, job records, logs, or this package.
- Store the prompt policy, model/provider identity, generation timestamp, and
  review status in the record so a later reviewer can understand what happened.
- Run normal build, link, accessibility, and rendered-page checks after the
  translation-specific structural gate.

Automation can maintain provenance and queue drafts. It cannot establish that
an unreviewed machine translation is culturally appropriate, legally accurate,
or native-quality.
