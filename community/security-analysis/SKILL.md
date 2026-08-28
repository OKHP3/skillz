---
name: security-analysis
description: Reviews code or a change for exploitable vulnerabilities — injection, auth and access-control gaps, secret exposure, unsafe deserialization, SSRF, path traversal, and reports them with the concrete attack path. Use this whenever the user asks about security, vulnerabilities, hardening, or a security review, and also proactively when a change touches authentication, authorization, user input handling, file paths, subprocess calls, deserialization, or credentials. For general correctness review, use code-review.
license: MIT
---

# Security analysis

A finding is only real if you can describe the attacker, what they control, and what they get.
"This could be unsafe" is not a finding — it is an unfinished one. The discipline here is
identical to debugging: trace from a source you can influence to a sink that does something
dangerous, and prove the path is unbroken.

**Scope:** this is for reviewing code you or the user are authorized to work on — your own
projects, your employer's, or an engagement you have permission for. It finds and fixes
defects. It does not produce working exploits against systems you do not control.

## 1. Map trust boundaries first

You cannot assess code without knowing where untrusted data enters. Identify:

- **Sources:** HTTP request bodies, query params, headers, cookies, uploaded files, webhook
  payloads, message queues, third-party API responses, filenames, environment in multi-tenant
  contexts, and anything read from the database that a user once wrote
- **Sinks:** SQL, shell, filesystem paths, HTTP requests made by the server, template
  rendering, deserializers, `eval`-alikes, redirects, log statements that feed a parser
- **The boundary:** where a request stops being anonymous and becomes a principal with rights

That last one, written down explicitly, is where most real findings live.

**Done when:** you have listed the sources and sinks in the code under review.

## 2. Trace source to sink

For each sink, walk backwards. The question is never "is this validated?" but **"is every path
to here validated, including the one added last week?"**

The path is broken, and there is no finding — only if a transformation makes the data safe for
*that specific sink*. Safe for one sink is not safe for another: HTML-escaping does nothing for
SQL, and SQL parameterization does nothing for a shell command.

**Done when:** each source→sink pair is either proven safe or recorded as a finding.

## 3. Check the categories that get missed

Injection is well known and usually handled. These are where real findings cluster:

**Access control:** the highest-yield category, and the one scanners cannot find.
- Does the handler check that the authenticated user may act on *this specific object*, or only
  that they are logged in? Object-level authorization is the most common serious gap in
  otherwise careful code.
- Can an identifier be swapped for someone else's? Test it mentally with a neighbouring ID.
- Are admin routes protected by anything other than not being linked in the UI?
- Does the check happen before the side effect, on every path including the error path?

**Secrets**
- Hardcoded keys, tokens, connection strings, including in tests, fixtures, and comments
- Secrets in log lines, error responses, stack traces, or URLs
- Anything committed once: it is in history, and rotating it is the only fix

**Server-side request forgery:** any user-influenced URL the server fetches. Check for
redirect following, internal address ranges, and cloud metadata endpoints.

**Path traversal:** user input reaching a filesystem path. Check after normalization, not
before, and check the decoded form.

**Deserialization and templates:** untrusted data into a deserializer or a template engine is
usually remote code execution, not a data problem.

**Dependencies:** known-vulnerable versions, and lockfile drift from the manifest.

**Cryptography:** homegrown crypto, ECB mode, static IVs, `Math.random()` for tokens,
non-constant-time comparison of secrets, missing certificate verification.

**Done when:** each category is checked or explicitly noted as not applicable.

## 4. Rank by exploitability, not by category name

A theoretical SQL injection behind an admin-only route matters less than an unauthenticated
object-reference gap. Rank by:

1. **Who can reach it** — anonymous internet > authenticated user > admin > local
2. **What they get** — code execution > data of other users > own data > information disclosure
3. **What it costs them** — a single request > a race window > a chained multi-step path

**Done when:** findings are ordered by reachability and impact, not by scanner severity labels.

## 5. Report with the attack path and the fix

```markdown
**`api/orders.py:52` — Any authenticated user can read any order (IDOR)**
`get_order(request.args["id"])` looks up by ID with no ownership check. A logged-in user
changing `?id=1041` to `?id=1042` receives another customer's order, including address and
partial card data. Reachable by any account, single request.
Fix: scope the query to the session user — `Order.get(id=..., user_id=session.user_id)`, and
return 404, not 403, so IDs cannot be enumerated.
```

State reachability explicitly. A finding without "who can trigger this" cannot be prioritized
and will sit in the backlog.

Report what you checked and found clean, too. It tells the reader what the review covered, so
absence of a finding is not mistaken for absence of review.

## Honesty rules

- **No finding without a path.** If you cannot name the source, the sink, and the unbroken
  route between them, report it as an area to verify — clearly labelled as unverified.
- **Do not pad with best practices.** A missing security header in a list of real findings
  dilutes them. Separate "hardening suggestions" from "vulnerabilities".
- **Say when you could not tell.** Framework magic, dynamic dispatch, and middleware you cannot
  see all produce genuine uncertainty. Name it rather than guessing in either direction.
