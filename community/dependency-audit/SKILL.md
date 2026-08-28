---
name: dependency-audit
description: Assesses what a project depends on — known vulnerabilities, licence obligations, abandoned packages, and supply chain risk. Use this whenever the user asks what their dependencies look like, mentions a CVE or security advisory, needs a licence review, is evaluating whether to adopt a library, or has a dependency tree nobody has looked at in years. For performing the upgrades this identifies, use dependency-upgrade.
license: MIT
---

# Dependency audit

Most of the code shipping in a typical application was written by strangers. An audit answers
three questions about that code: is it *dangerous*, is it *legal*, and is it *maintained*.

Scanners answer the first well. The second and third need judgement, and they are where the
expensive surprises live — a licence discovered at acquisition, a critical library abandoned
three years ago.

## 1. See the whole tree, not the manifest

Your manifest lists what you asked for. The lockfile lists what you got, and it is usually five
to twenty times larger.

```bash
npm ls --all | wc -l          # or: pip list, go list -m all, cargo tree
```

Transitive dependencies are where most risk sits, because nobody chose them. Note the depth and
the total count — a project with 1,400 packages has a different risk profile from one with 40,
whatever the direct list looks like.

**Done when:** you are working from the resolved tree, not the manifest.

## 2. Run the scanners, then triage the output

```bash
npm audit --json          # pip-audit, govulncheck, cargo audit, osv-scanner
```

Scanner output is not a finding list; it is a starting list. Triage each:

- **Is the vulnerable code path reachable from your usage?** A deserialization CVE in a library
  you only use for formatting is not exploitable. `govulncheck` does this analysis properly;
  most tools do not.
- **Is it a dev dependency?** A vulnerability in a build tool is real but has a different threat
  model than one in the server.
- **Severity is not priority.** A critical in an unreachable path ranks below a medium in your
  request-handling path.

Report reachability explicitly. A list of 200 unreviewed advisories teaches people to ignore the
scanner, which is worse than not running it.

**Done when:** each advisory is triaged for reachability, not just listed.

## 3. Check licences before they become expensive

Licence problems surface at the worst moments — an acquisition, an enterprise sale, a
distribution change, and are costly to fix retroactively.

```bash
npx license-checker --summary        # pip-licenses, go-licenses, cargo-license
```

Look for:
- **Copyleft** (GPL, AGPL) in anything you distribute or run as a service. AGPL in a hosted
  service is the one that surprises people
- **No licence at all:** legally the most restrictive outcome, not the least
- **Licence changes** in newer versions. Several major projects have relicensed; an upgrade can
  silently change your obligations
- **Attribution requirements** you are not fulfilling

**Done when:** every licence in the tree is known and acceptable for how you ship.

## 4. Assess maintenance, which no scanner does

An unmaintained dependency is a vulnerability with a delay. For anything load-bearing:

- **Last release date**, and last commit — a stable library may legitimately be quiet, but check
- **Open issue and PR counts**, and whether maintainers respond
- **Bus factor:** one maintainer is a real risk
- **Is it archived or deprecated?** Sometimes announced only in the README
- **Does a successor exist?** Often the community has already moved

**Done when:** every critical dependency has a maintenance judgement attached.

## 5. Look for supply chain smells

- **Typosquatting:** a package name one character off a popular one
- **Recently published packages** with few downloads in the tree
- **Install scripts:** postinstall hooks that run arbitrary code at install time
- **Sudden maintainer changes** on a popular package
- **Unpinned or floating versions**, which mean your build is not reproducible and an upstream
  compromise reaches you automatically

**Done when:** nothing in the tree runs code at install time that you have not accounted for.

## 6. Reduce the surface

The best audit outcome is usually removal, not upgrade:

- **Unused dependencies:** check for imports, not just presence
- **Single-function packages** you could inline in twenty lines
- **Duplicated capability:** three date libraries, two HTTP clients
- **Heavy dependencies used for one trivial feature**

**Done when:** you have a removal list alongside the upgrade list.

## Report

Rank by exploitable risk, not scanner severity. For each: what it is, whether it is reachable,
what it would take to fix, and what happens if you do nothing. Separate licence findings from
security findings — they go to different people and have different deadlines.

State what you could not assess. Reachability analysis is not available in every ecosystem, and
saying so is better than implying a clean result.
