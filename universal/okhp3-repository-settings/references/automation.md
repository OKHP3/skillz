# Read-only automation adapter

Python 3.12+ standard library performs deterministic work, with no AI provider calls.
Live reads require an installed authenticated `gh` CLI and access to GitHub.com.
No helper changes GitHub settings, provisions credentials, or sends messages.
Local JSON output can contain configuration information: choose its destination
and audience deliberately. Never publish raw API responses or logs containing secrets.

## Run locally

From the package directory, inspect `python -B scripts/repo_settings.py --help`.
Copy [solo-profile.json](../assets/solo-profile.json) to an owner-approved path,
replace OWNER/REPOSITORY with the exact target and review every expected value.
The example is a preference, not proof or authority. Keep main only if verified.

```text
python -B scripts/repo_settings.py validate-profile --profile profile.json --repo OWNER/REPOSITORY
python -B scripts/repo_settings.py audit --repo OWNER/REPOSITORY --output before.json
python -B scripts/repo_settings.py compare --snapshot before.json --profile profile.json --output comparison.json
python -B scripts/repo_settings.py verify --before before.json --after after.json --profile profile.json --output verification.json
python -B -m unittest discover -s tests -v
```

Use fresh output filenames; --output refuses to overwrite existing files.
Capture after.json only after the authorized change and a fresh audit. Verification
reports observations and current profile compliance; it does not establish who
caused a change. Never feed the human settings-record.json to this CLI: it is a
separate narrative schema. The helper's snapshot/profile contracts use schema_version 2.

Exit 0 means the selected assertions pass (or validation succeeds), 1 means drift,
and 2 means incomplete/error. Audit returns 2 when a selected API scalar cannot be collected: keep the
snapshot and continue comparison. Unsupported manual controls are always listed,
but do not alone change the selected-scalar exit code. Unknown must never become off.
Read the actual JSON status and manual coverage, not just the exit code. Mixed drift
and unknown must remain visible. A profile covers only selected scalar keys, not
all GitHub best practices or effective inherited rules. Missing tools, network,
authentication, malformed JSON and wrong target identity cannot produce a clean bill.

## Install an Actions adapter only in a selected repository

1. Review that repository's instructions and existing workflows. Use one maintained
   copy, not parallel independently edited scripts. Record the selected skill version,
   inventory hashes, profile and repository target in a local installation record.
2. Copy the complete package to `.github/repo-settings/` in the chosen checkout.
   Keep the packaged workflow inactive there. Copy only
   [repo-settings.yml.template](../assets/repo-settings.yml.template) to
   `.github/workflows/repo-settings.yml`. Bind `.github/repo-settings/profile.json`
   to the intended repository using the example profile. Add reports to local ignore
   policy; do not commit live report artifacts or tokens.
3. Review the pinned action revisions at the publisher's repositories before use.
   Schedule and manual audit run trusted default-branch code; PR tests run without
   audit credentials. The audit job rejects manual runs from a non-default ref.
4. Initially use GITHUB_TOKEN. The administration-read endpoints may be unavailable.
   Do not grant broader permissions just to make the report green. If the owner
   separately authorizes a repository-scoped read credential, configure the
   optional REPO_SETTINGS_READ_TOKEN secret with only necessary metadata and
   Administration read access. Never expose it to PR tests or arbitrary branches.
5. Validate locally, then record deployment separately: local template, installed
   source, merged default-branch workflow, observed run and notification delivery.
   This package creation does not activate a remote schedule or create secrets.

The template uses manual dispatch, a weekly off-hour schedule and PR tests. It
publishes a status-only summary and a seven-day artifact, and fails the audit job
when profile drift/unknown needs attention. It does not send issue comments or
notifications itself. GitHub notification preferences control delivery and may
still notify on successful runs; verify the owner's settings separately. Expected
permission gaps can keep an audit red until resolved or explicitly excluded from
the profile with a documented manual check. Never hide them with continue-on-error.

Do not require the path-filtered template test job as a branch gate: use a separately
reviewed always-reporting gate if desired. Scheduled Actions depend on the default
branch, can be delayed, and public-repo schedules may disable after 60 days without
activity. This is periodic evidence, not continuous monitoring. Re-run after material
settings or workflow changes. Avoid caches, AI calls, privileged PR triggers and
self-hosted runners in this starter adapter. Hosted Ubuntu supplies Python/gh;
validate actual runner versions before claiming cross-platform compatibility.

## Maintenance and rollback

Update a vendored copy only after comparing its recorded hashes and local changes.
Re-run tests, validate the bound profile and review the workflow diff. Never overwrite
destination-only changes. To stop future checks, disable the installed workflow in
GitHub through an authorized action; deleting a local template does not disable it.
Report snapshots are evidence, not an executable rollback script. Recover settings
only after re-reading current state and reconciling intervening changes.
