---
name: secrets-management
description: Handles credentials safely through their whole life — where they live, how code gets them, how they rotate, and what to do when one leaks. Use this whenever the user is adding an API key, database password, token, or certificate, mentions a secrets manager or vault, asks how to store credentials, or has committed a secret to git. For finding exposed secrets during a code review, use security-analysis.
license: MIT
---

# Secrets management

A secret's danger is proportional to how many places it exists and how long it lives. Most
practice focuses on the first storage decision and ignores rotation and revocation, which is
where the real exposure sits — a key nobody has rotated in four years has been on more laptops
than anyone can name.

**Assume every secret will eventually leak.** Design so that when it does, the blast radius is
small and the fix is one command.

## 1. Prefer not having a secret at all

The best credential is one that does not exist. In order of preference:

1. **Workload identity**, the platform vouches for the service. IAM roles, service accounts,
   OIDC federation. Nothing to store, nothing to rotate, nothing to leak
2. **Short-lived credentials** issued on demand, expiring in minutes or hours
3. **A long-lived secret in a manager**, injected at runtime
4. **A long-lived secret in an environment variable** — workable, and the floor
5. **A secret in a file in the repo**, never

Most cloud-to-cloud authentication can use option 1 today, and teams keep using static keys out
of habit. That is the single biggest available improvement.

**Done when:** every static credential has been checked for a workload-identity alternative.

## 2. Never let a secret near the repository

- **Not in code, config, or a committed `.env`.** Commit a `.env.example` with empty values
- **Not in a Dockerfile `ARG` or `ENV`.** Layers are permanent and readable with
  `docker history`, even if a later layer deletes it
- **Not in CI config**, only in the platform's secret store
- **Not in a log line, error message, URL, or trace.** Redact at the logging boundary, not at
  each call site, or one new code path leaks everything
- **Not in a ticket, chat message, or screenshot.** These are searched and archived

Run a scanner in CI and as a pre-commit hook — `gitleaks`, `trufflehog`, or the platform's own.
It is cheap and it catches the mistake before it becomes permanent.

**Done when:** a scanner runs on every commit and the history is clean.

## 3. Scope every credential narrowly

The permissions a secret carries determine what a leak costs.

- **One credential per service**, never shared. A shared key cannot be revoked without an outage
  for everyone, so it never gets revoked
- **Least privilege, and check it.** Most credentials carry far more than they use
- **Separate per environment.** Staging must never hold a production credential
- **Read-only where reads are all that is needed**
- **Constrain by source:** IP, network, or workload — where the provider supports it

**Done when:** a leaked credential would grant only what that one service actually needs.

## 4. Make rotation routine, not an event

Rotation that requires downtime never happens, so design for overlap:

1. Issue the new credential
2. Deploy config accepting **both** old and new
3. Switch to the new one
4. Confirm the old one is unused — via access logs, not assumption
5. Revoke the old one

Step 4 is the one people skip, and revoking a still-used credential is how a routine rotation
becomes an outage.

Rotate on a schedule, and **automate it**. A documented manual procedure decays into a documented
procedure nobody runs.

**Done when:** rotation has been performed once without downtime.

## 5. Know what to do when one leaks

Written in advance, because the instinct is wrong. Order matters:

1. **Revoke first.** Not "assess the impact first" — revoke. The credential is compromised the
   moment it is exposed, and every minute is exposure
2. **Then rotate** and deploy the replacement
3. **Then investigate** — access logs for the exposure window, looking for use you cannot account
   for
4. **Then clean up** the exposure

**Removing a secret from git history does not un-leak it.** It was cloned, cached, and possibly
indexed. Rewriting history is housekeeping, not remediation. The only real fix is revocation.

**Done when:** the old credential is dead and you know whether it was used.

## 6. Inject at runtime, hold in memory

- Fetch from the secret manager at startup or on demand — do not bake into images or artifacts
- Prefer a mounted file or a direct API call over an environment variable. Environment variables
  leak into crash dumps, child processes, and `/proc`
- Do not write secrets to disk unencrypted, including temp files
- Cache in memory with a TTL so rotation takes effect without a restart

**Done when:** the same artifact runs in every environment with no secret in it.

## Report

State where each secret lives, what it can do, how it is injected, when it was last rotated, and
who can read it. That last question is frequently the surprising one — a secret manager with
overly broad read access is a shared password with extra steps.
