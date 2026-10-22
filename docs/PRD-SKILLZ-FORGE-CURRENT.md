# Skillz Forge public-surface directive

**Status:** Current implementation handoff. This document supersedes the action
items in the August 2026 independent audit and September 2026 follow-up audit;
those remain historical evidence, not live inventory. Do not infer that this
directive has been executed in Replit or deployed.

## Outcome and authority

Keep the Skillz Forge application and its OverKill Hill project page accurate
as the Agent Skills library changes. A visitor should be able to understand
what Forge does, discover a skill, inspect its complete package and evidence
status, and reach a supported installation path without a maturity or safety
claim that the source cannot substantiate.

- The installable packages and family membership come from `OKHP3/skillz`
  canonical `main`, not from manually maintained website copy.
- `artifacts/forge/public/data/project-summary.json`, produced from the same
  revision as the deployed Forge catalog, is the public count and maturity
  source. `search-index.json` and per-skill detail JSON must cover that same
  distribution inventory. `.agents/skills/` is a separate project-local
  support surface and must not be added to the public count.
- The canonical project page is
  `https://overkillhill.com/skillz-forge/`; the older
  `/projects/skillz/` route is a redirect, not an editable dossier.
- The Forge application is `https://okhp3.github.io/skillz/`. GitHub Pages is
  production; a Replit preview is not a production deployment.

At source commit `3859c78e`, the cataloger found **333 distribution skills in
22 active families** and **54 project-local support skills**. The manifest's
top-line distribution count and the checked-in Forge artifacts were stale at
that revision. These are diagnostic snapshot values, not text to hard-code into
the page. Re-read the final merged revision and generated summary before
publication. Maturity and evidence are separate axes; do not translate a
structural check into a live behavioral benchmark or production-readiness claim.

One additional project-local package, `okhp3-skill-promotion`, was nested below
its expected parent and therefore omitted by the support cataloger. It has been
flattened without changing its file contents; the support catalog now contains
**55** packages. This does not change the public distribution count.

The seven packages present in source but absent from the prior checked-in
326-skill Forge catalog were `askjamie/okhp3-askjamie-email-draft`,
`glee-fully/okhp3-glee-fully-wwgd-review`,
`murderbird/okhp3-murderbird-argument-audit`,
`murderbird/okhp3-murderbird-hook-and-close`,
`murderbird/okhp3-murderbird-thesis-forge`,
`openclaw/okhp3-openclaw-persona-route`, and
`openclaw/okhp3-openclaw-research-packet`. Confirm all seven in both search
and their family pages after generation.

## Required work

1. Reconcile catalog generation on the final intended Skillz revision. Run the
   cataloger separately for root distribution families and `.agents/skills/`,
   then build the Forge catalog, search index, per-skill details, and summary.
   Compare all four inventories with the manifest and source tree. Identify
   newly added packages by path and verify they appear in search and family
   navigation. Do not publish a generated artifact from an older or different
   source revision.
2. In `OKHP3/OverKill-Hill`, edit the canonical authoring files under
   `site-src/pages/skillz-forge/` and regenerate `skillz-forge/index.html`
   through that repository's site builder. Do not edit the redirect page as
   though it were the canonical source.
3. Make the inventory presentation truthful before and after JavaScript loads.
   The page may display source-derived counts from a verified same-revision
   snapshot, or a count-neutral loading/unavailable state until the summary
   arrives. It must not retain an obsolete numeric fallback. On success,
   display the source count, family count, maturity split, and as-of/source
   revision consistently. On fetch failure, provide a clear link to Forge and
   do not present stale numbers as current. Keep the six capability descriptions
   tied to observed shipped behavior, not merely a `capabilities` flag.
4. Keep a brief introduction to Agent Skills and link to the
   [open specification](https://agentskills.io/specification) and relevant
   [GitHub Copilot guidance](https://docs.github.com/en/copilot/concepts/customizations/agent-skills)
   for package structure. Forge help should explain this catalog, its evidence,
   and how to use it; it is not a generic Agent Skills course or a marketplace.
5. Preserve the static, browser-first architecture. Do not add accounts, a
   backend, a paid deployment, a live GitHub write token, or claims that every
   indexed skill is safe, compatible with every host, or validated for use.

## Replit execution boundary

Before dispatching Replit Agent work, verify the exact `skillz` and/or
`OverKill-Hill` Repl identity, its existing task queue and unique checkout
changes, and that **Free Mode is selected and has capacity**. Read queued task
output before starting anything new. If Free Mode or authenticated checkout
access cannot be verified, keep this as a handoff and complete independent
repository work; do not use paid fallback, reset a Repl, or claim Replit
acceptance. Reconcile unique Replit commits through the normal GitHub workflow
before synchronizing its branch.

## Acceptance evidence

- The final `main` tree, manifest, family catalogs, Forge catalog, search index,
  per-skill details, and `project-summary.json` agree on the same distribution
  skill identities and family membership. Catalog source revision is recorded.
- Forge catalog, typecheck/build, and relevant browser tests pass on that
  revision; required GitHub checks, including security, pass at the PR head.
  A queued, skipped, incomplete, or failed required check is not acceptance.
- The canonical OverKill Hill authoring source and generated page match. Test
  with JavaScript enabled and disabled or with the summary fetch failing:
  neither state advertises stale counts. Verify the old route redirects.
- Fetch both public URLs after deployment and verify the served summary
  revision, rendered dossier state, navigation, and discover-to-install path.
  A local build, merged PR, Replit report, and live deployment are separate
  evidence claims.
- Record the exact PRs, commits, tests, live URLs, unresolved gaps, and
  Replit Free Mode/checkout status. Keep this directive open until all required
  surfaces are verified; do not archive the execution thread early.
