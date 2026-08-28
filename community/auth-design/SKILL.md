---
name: auth-design
description: Designs how a system knows who someone is and what they may do — login, sessions, tokens, roles, and permission checks. Use this whenever the user is building login or signup, adding roles or permissions, choosing between sessions and JWTs, integrating OAuth or SSO, or asking how to protect an endpoint. For finding authorization bugs in code that exists, use security-analysis.
license: MIT
---

# Auth design

Two separate problems, constantly conflated, with different failure modes:

- **Authentication:** who is this? Mature, well-solved, and you should use a library
- **Authorization:** what may they do? Application-specific, and where nearly all real breaches
  originate

Teams spend most of their effort on the first because it is visible, and most of their
vulnerabilities live in the second. **Object-level authorization is the one to get right.**

## 1. Do not build authentication from scratch

Password handling, session fixation, timing attacks, reset flows, and MFA are all solved and all
easy to get subtly wrong.

Use the platform's framework, or an identity provider. If you are storing passwords yourself, use
argon2id or bcrypt with the current cost parameters, never a general-purpose hash, never with a
hand-rolled salt.

The flows people forget to secure, which are attacked precisely because they are afterthoughts:
password reset, email change, account recovery, and MFA enrolment. A reset flow is a login
bypass if the token is guessable, does not expire, or is reusable.

**Done when:** every path that can establish a session has been enumerated and secured.

## 2. Choose sessions or tokens deliberately

| | Server sessions | JWTs |
| --- | --- | --- |
| Revocation | Immediate | **Not possible before expiry** |
| State | Server-side store | Stateless |
| Best for | Browser apps, anything needing instant logout | Short-lived service-to-service |

**The revocation problem is the deciding factor and it is usually underweighted.** A JWT valid for
24 hours is valid for 24 hours after you fire someone, after you detect a compromise, after the
user clicks "log out everywhere". The usual workaround — a revocation list checked on every
request — reintroduces the state JWTs were chosen to avoid.

Default to server sessions for browser applications. Use short-lived tokens with refresh where
statelessness genuinely matters, and keep access token lifetime in minutes.

**Done when:** you can answer "how fast can we revoke this?" with a number you are happy with.

## 3. Get the cookie and token handling right

- **`HttpOnly`:** JavaScript must not read the session cookie
- **`Secure`:** HTTPS only
- **`SameSite=Lax`** or stricter — this is the primary CSRF defence now
- **A short, sliding expiry**, and an absolute maximum
- **Rotate the session ID on privilege change:** login, password change, role escalation. Not
  rotating is session fixation

Never store a token in `localStorage` if you can avoid it — any XSS reads it. A cookie the script
cannot read is meaningfully safer.

**Done when:** the session cannot be read by script or sent cross-site.

## 4. Design authorization around objects, not just roles

Roles answer "is this person an editor?" Almost every real breach turns on "may this person edit
*this* object?"

- **Check ownership or membership on every request**, using the identifier from the *session*,
  never one supplied by the client
- **Scope the query rather than checking after fetching** —
  `Order.where(id: params[:id], user: session.user)`. This makes the whole class of bug
  structurally impossible rather than dependent on remembering a check
- **Return 404, not 403**, for objects the user may not see, so identifiers cannot be enumerated
- **Check before the side effect**, on every path including error paths

Choose the model deliberately: **RBAC** (roles) is simple and fits most systems; **ABAC**
(attributes) fits when access depends on context; **ReBAC** (relationships) fits sharing and
hierarchies. Starting with RBAC and bolting on exceptions is how permission logic becomes
unmaintainable.

**Done when:** no endpoint trusts a client-supplied identifier for an authorization decision.

## 5. Enforce in one place

Authorization scattered across controllers will have gaps — a new endpoint added without the
check is the standard way this fails.

Centralise it: middleware, a policy layer, or a query scope applied by default. Make the secure
path the default and require an explicit opt-out, so a forgotten check fails closed rather than
open.

**Deny by default.** A new route with no rule must reject, not allow.

**Done when:** adding an endpoint without an authorization rule causes a failure, not a hole.

## 6. Make it observable and recoverable

- **Log every authentication and authorization decision:** who, what, allowed or denied,
  from where. Denied attempts are the signal that someone is probing
- **Rate-limit login, reset, and MFA** by account *and* by source, or you have an
  account-enumeration and brute-force endpoint
- **Do not leak account existence** in login or reset responses. Same message, same timing
- **Let users see and end their sessions**, and end them all on password change
- **Notify on security events:** new device, password change, MFA change

**Done when:** a user could detect and end an unauthorised session themselves.

## Report

State the authentication method, session or token choice with its revocation time, the
authorization model, where enforcement lives, and what a compromised session would grant. Then
list the endpoints exempt from authorization — that list should be short, deliberate, and
reviewed.
