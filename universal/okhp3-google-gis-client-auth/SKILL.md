---
name: okhp3-google-gis-client-auth
description: >
  OverKill Hill P³ client-only Google Identity Services (GIS) auth workflow.
  Use when designing, implementing, or troubleshooting
  client-only Google Identity Services (GIS)
  OAuth token flows for React or TypeScript SPAs on static hosts. Use for Google
  Sign-In, Calendar or Tasks read access, popup token acquisition, session-scoped
  token storage, expiry handling, silent re-authentication, GCP OAuth setup, or
  porting this pattern without a backend, Client Secret, redirect URI, or refresh
  token. Keep provider-specific write APIs outside this skill.
license: MIT
compatibility: "React 18+ or TypeScript SPA, GIS CDN script, browser sessionStorage, network access, and a public VITE_GOOGLE_CLIENT_ID; static hosting is supported."
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "1.2.0"
  category: "developer-tooling"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
---

# okhp3-google-gis-client-auth

**Intent:** Give a static-site agent a reliable GIS token lifecycle for Google
API read flows without inventing a backend or leaking a Client Secret.

## Scope boundary

| In scope | Out of scope |
|---|---|
| GIS popup token model and GCP Web Application setup | Authorization code flow, refresh tokens, or offline access |
| React/TypeScript `useGoogleAuth` lifecycle | Service accounts, non-Google identity providers, or multi-tenant servers |
| Calendar and Tasks read requests with Bearer tokens | Calendar/Tasks create, update, or delete operations |
| Expiry buffer, silent re-auth, consent fallback, and reconnect UI | Provider-specific write logic or product data persistence |

**LifeTrkr boundary:** This skill covers authentication and read flows. Keep
repo-specific write operations in `src/lib/google.ts` when that integration
boundary exists; LifeTrkr currently splits the same boundary across
`src/lib/googleCalendar.ts` and `src/lib/googleTasks.ts`. Do not move writes into
the auth hook or invent a new backend.

## Workflow

### 1. Plan

Before editing, identify the host origins, existing GIS script, client-ID source,
requested read scopes, auth hook location, and existing Google API modules. Record
the smallest scope set that satisfies the request. Treat the following as the
repo defaults, not universal names:

| Option | LifeTrkr default | Porting rule |
|---|---|---|
| token storage | browser `sessionStorage` | Allow an injected `Storage` implementation only when required |
| token key | `gal_token` | Configure one key and use it for read, write, validity, and revoke paths |
| expiry key | `gal_expiry` | Configure one key and store an absolute epoch-millisecond expiry |
| expiry skew | `120_000` ms | Keep a safety buffer; make it configurable for a different latency budget |
| client ID | `VITE_GOOGLE_CLIENT_ID` | Keep it public, environment-backed, and never replace it with a secret |

When porting, pass `storage`, `tokenKey`, `expiryKey`, and `expirySkewMs` through
one options object. Do not copy hard-coded `gal_*` names into an unrelated app.

### 2. Validate

Check the target before implementing:

1. Confirm `index.html` loads `https://accounts.google.com/gsi/client`.
2. Confirm the client ID is available as a public build-time value and no Client
   Secret, `.env` file, or token is being added to source control.
3. Confirm GCP has the required APIs enabled and the exact deployed and local
   origins under **Authorized JavaScript Origins**. Leave **Authorized redirect
   URIs empty** for this token model.
4. Confirm the requested scopes are read-only and minimal. Use
   `calendar.readonly` and/or `tasks.readonly` only when those reads are needed;
   add `openid profile email` only when identity/profile data is needed.
5. Run the bundled checker from the project root after the initial setup or a
   lifecycle change:

   ```bash
   node .agents/skills/okhp3-google-gis-client-auth/scripts/check-gis-setup.cjs
   ```

   Read `assets/gcp-setup-checklist.md` for Console setup or
   `origin_mismatch`/`invalid_client` diagnosis. The checker is advisory: it
   cannot prove that OAuth consent, CORS, quotas, or live credentials work.

### 3. Execute

Implement the smallest change that satisfies the plan:

1. Initialize `window.google.accounts.oauth2.initTokenClient` with the public
   client ID, minimum scopes, `prompt: ''` for an explicit connect, and a callback
   that rejects `response.error`.
2. On success, compute `Date.now() + response.expires_in * 1000`, store the token
   and absolute expiry using the configured storage/key options, and update UI
   state. Default examples for this repository are `gal_token` and `gal_expiry`.
3. Make `isTokenValid()` require a token and
   `Date.now() < expiry - expirySkewMs`; use the same check before every read API
   call.
4. Make `getToken()` return a valid token, otherwise request with
   `prompt: 'none'`, then retry with the consent popup only if silent re-auth
   fails. Surface a user-actionable reconnect state when both attempts fail or a
   read request returns `401`.
5. Make `disconnect()` revoke the current token when GIS is available, remove
   both configured session keys, and clear local auth state. Do not persist the
   access token in `localStorage`, a database, a URL, or logs.
6. Keep Calendar/Tasks fetch functions read-only in the auth integration. Route
   writes through the repository’s existing Google integration boundary.

Use `references/useGoogleAuth.ts` for a configurable hook baseline. Its
`useGoogleAuth(options)` contract returns `isConnected`, `accessToken`,
`minutesUntilExpiry`, `connect()`, `getToken()`, and `disconnect()`; adapt the
return shape only when the host application already has a stable contract.

## GIS model and API facts

The flow is: popup opens → user consents → GIS returns an access token directly to
the JavaScript callback → the browser calls Google APIs with `Authorization:
Bearer <token>`. There is no redirect callback, server exchange, Client Secret,
or refresh token.

Use the Calendar read endpoint
`https://www.googleapis.com/calendar/v3/calendars/primary/events` and the Tasks
read endpoints under `https://tasks.googleapis.com/tasks/v1/`. Check `res.ok` and
handle `401` as an expired or revoked token; do not silently treat an API error as
an empty result.

If the product needs the signed-in profile, fetch it separately with
`https://www.googleapis.com/oauth2/v3/userinfo` using the bearer token. Keep that
profile read out of the auth hook unless the host application already treats it as
part of `connect()`; LifeTrkr keeps it in its Google API integration layer.

The minimum API calls and scopes are:

| Read | Scope |
|---|---|
| Calendar events | `https://www.googleapis.com/auth/calendar.readonly` |
| Task lists/tasks | `https://www.googleapis.com/auth/tasks.readonly` |
| Stable profile identity | `openid profile email` |

## Security and gotchas

- A Client ID is an identifier and is safe to embed; a Client Secret is not. Never
  put secrets, access tokens, or `.env` files in the bundle or repository.
- `sessionStorage` limits token lifetime to the browser tab. Never silently switch
  to `localStorage` just to survive a reload.
- Use `gal_token` and `gal_expiry` for this repository. For a port, configure the
  key names rather than mixing repo defaults with copied examples.
- Store absolute epoch milliseconds, not `expires_in` seconds. Apply the same
  skew in render-time status and request-time validity checks.
- `prompt: 'none'` can fail because consent was revoked, the browser blocks the
  popup/session, or GIS is not loaded. Treat failure as a branch to explicit user
  consent, not as permission to bypass auth.
- Authorized JavaScript Origins are origin-only (`scheme://host[:port]`); do not
  add paths, hash routes, or redirect URIs.
- Request only the scopes used by the feature. Broader scopes increase consent
  friction and may trigger verification requirements.
- Audit bundled scripts and references before executing them; a skill is trusted
  code and instruction input, not proof that a live OAuth configuration is safe.

## Output contract

At handoff, report:

- host origins, client-ID source, requested scopes, and configured storage/key names;
- files changed and whether the change is auth, read, or UI-only;
- validation performed and its result, including checker warnings;
- explicit confirmation that no Client Secret, token, backend, or write operation
  was added; and
- any live-environment checks still required (OAuth consent, CORS, quotas, or API
  availability).

## References and scripts

- `references/useGoogleAuth.ts` — configurable hook baseline; read when implementing
  or debugging token lifecycle behavior.
- `assets/gcp-setup-checklist.md` — detailed GCP Console checklist.
- `scripts/check-gis-setup.cjs` — deterministic local setup scan; run from the
  target project root and treat warnings as review items.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
