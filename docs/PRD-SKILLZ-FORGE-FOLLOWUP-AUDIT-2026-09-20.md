# Skillz Forge: Six-Week Follow-Up Audit and Directive Reconciliation

**Date:** 2026-09-20
**Author:** Claude, acting as independent second opinion (continuation of `PRD-SKILLZ-FORGE-INDEPENDENT-AUDIT-2026-08-06.md`)
**Scope:** Full re-audit per your instruction to "treat this like a new engagement." Covers everything that changed in the repo, the live app, and the public dossier between 2026-08-06 and 2026-09-20 (390 commits). This is a reconciliation against the prior audit, not a from-scratch rebuild of it — the vision reconstruction in the 08-06 document still holds and isn't repeated here except where it changed.
**Method:** Same as last time. Live JSON fetched directly (`project-summary.json`, `catalog.json`), raw dossier HTML pulled from GitHub and inspected byte-for-byte (including computing the actual SHA-256 hashes of its inline scripts against its own CSP header), git history walked directly on the mirror, and a 390-commit digest run through a subagent to avoid missing anything buried in the noise. The one gap: the Chrome bridge to your machine wasn't reachable this session, so I don't have a fresh rendered screenshot of the app at 326-skill scale. Everything else here is independently verified, not taken on the repo's word.

---

## 0. Reconciliation table — what actually changed

| # | Item | 08-06 finding | 09-20 finding | Status |
|---|---|---|---|---|
| 1 | `v0.1.0` release tag | Did not exist despite `docs/CHANGELOG.md` referencing it | Real annotated tag, tagger "OverKill Hill P³", points to commit `2ed02937` (2026-08-06T16:33:28Z), cut via commit `7f66e4d2` | **Resolved** |
| 2 | Provenance fabrication (identical timestamps) | Fixed and verified against the 113-skill catalog | Re-verified independently against the full current 326-skill `catalog.json`: 47 distinct `createdAt` values, 22 distinct `commitSha`/`lastModified` clusters, spread across the whole array (not just the ends). The clustering is real batch-commit history — the 08-26 monorepo migration and the 08-27/08-28 mass family additions each really did touch 90-100 files in one commit — not a regression to fabricated data. | **Still resolved, now verified at 3x scale** |
| 3 | Dossier mislabeling Compare Mode / Live GitHub Activity as "Planned" | Open | Both now correctly marked "✓ Shipped" | **Resolved** |
| 4 | Dossier skill/family counts | Stale at tag time (75/12), hand-corrected same day | Static fallback text still reads "148 public distribution skills across 16 active families... as of 2026-08-20" — a month stale, less than half the real count. But see the deep-dive in §2.3: this is not the same failure mode as before. | **Open, but re-diagnosed** — see below |
| 5 | `localStackComposer`, `guidedDiscoveryAid` | Unshipped P2 features | Both `true` in current `capabilities` | **Resolved / shipped** |
| 6 | Root package structure | Explicitly not a workspace (per AGENTS.md) | Now a real pnpm monorepo workspace, root `package.json`/`pnpm-workspace.yaml` present, via a documented 2026-08-26 consolidation (`MIGRATION.md`) | **New, mostly clean** — one open item, see §2.4 |
| 7 | `replit.md` scaffold (Express/Postgres/Drizzle) | N/A | New file, entirely unfilled template placeholders, genuinely dead — confirmed no live backend calls anywhere in the shipped Forge bundle | **New, cosmetic hygiene item, not a non-goal violation** |
| 8 | Top-level `forge/` directory | N/A (app lived here before the move) | Still present on your local mirror with build output (`dist/`, `node_modules/`, `public/`, `src/`), but `git ls-files forge/` returns zero tracked files and it isn't gitignored — it's orphaned local disk clutter from before the 08-21 move to `artifacts/forge/`, not a repo defect | **New, cosmetic, local-only** |
| 9 | Catalog scale | 113 skills / 15 families | 326 skills / 21 families, after briefly peaking near 350 and getting pruned back by a 09-19 "duplicate consolidation" pass | **Grew ~3x, with one deliberate correction** |
| 10 | Maturity distribution | Near-zero `usable` | 5 `usable` / 73 `skeleton` / 248 `draftable` — same 5 usable skills as six weeks ago, despite the catalog nearly tripling | **Flat — see §3.1** |
| 11 | Root `README.md` framing | Opened with the product's mission statement | Now opens with CI status badges and describes Forge as infrastructure that "verifies catalog data... stay trustworthy" — no end-user pitch in the first screen | **New, minor DX regression** |
| 12 | `replit-agent` branch status | Unverifiable from this mirror (only tracks `main`) | Still unverifiable from this mirror | **Still open, unchanged** |

---

## 1. Vision: unchanged, still the right bar

Nothing in six weeks of commits contradicts the 08-06 reconstruction: a static, backend-free, browser-first SPA that discovers, inspects, compares, and helps install `SKILL.md` contracts, judged on the M2-M5 maturity ladder with maturity and evidence kept as separate axes on purpose. The "no accounts, no database, no backend" non-goal held under real pressure — a pnpm monorepo consolidation that added an actual Express/Postgres/Drizzle package (`artifacts/api-server`, `lib/db`) to the tree, and it's confirmed dead weight, not a quiet architecture change. That's a point in the project's favor, not against it: the scaffold showed up, nobody wired it into Forge, and it just sits there. Rename it a hygiene item, not a scope violation.

The one soft drift: the root `README.md` no longer states the product vision up front (see §0 row 11). Not a vision problem, a first-impression problem. Someone new landing on the repo today reads "catalog and review platform... verifies trustworthiness" before they read anything about what a visitor to the actual site experiences.

## 2. Current application assessment

### 2.1 Scale and shipped capability

Live `project-summary.json` (generated 2026-09-19T23:48:25Z, source commit `651da7a`): 326 skills, 21 families, maturity split 248 draftable / 73 skeleton / 5 usable, evidence split 110 none / 159 not-run / 37 local-checks / 7 historical / 6 analytical / 7 live. All six `capabilities` flags are `true` — `familyOrientationPages`, `skillCompare`, `curatedStacks`, `fullContractRenderer`, `localStackComposer`, `guidedDiscoveryAid`. The last two were open P2 items in August; they've shipped.

### 2.2 Provenance integrity, re-verified at scale

I didn't take the 08-06 fix on faith. I pulled the full 326-entry `catalog.json` and checked distribution, not just a sample: 47 distinct `createdAt` values (real per-skill creation history) against 22 distinct `commitSha`/`lastModified` clusters (real per-commit "last touched" history), with the clustering explained by two identifiable bulk commits — the 08-26 migration (102 skills share `commitSha 7647b437`) and the 08-27 family-addition wave (94 skills share `commitSha 866dec66`). That's exactly what real git-log-derived provenance looks like when a monorepo migration genuinely touches a hundred files at once. The fix hasn't regressed.

### 2.3 The dossier: re-diagnosed, not just re-confirmed stale

This is the part worth slowing down on, because the 08-06 audit and `docs/PUBLISHING.md` both describe this as a "hybrid live-sync" that's supposed to fetch `project-summary.json` client-side and self-correct. On the surface it looks like that mechanism just isn't running — the page still says "148 skills, 16 families, as of 2026-08-20." I didn't stop there, because a plain `WebFetch`/crawl of the page can't tell you whether client-side JavaScript actually ran; it only shows you the server-rendered fallback text baked into the HTML.

So I pulled the raw HTML from GitHub and checked the mechanism directly, three ways:

- **CORS**: `curl -I` on `https://okhp3.github.io/skillz/data/project-summary.json` returns `access-control-allow-origin: *`. A cross-origin fetch from `overkillhill.com` is not blocked.
- **CSP**: the dossier page ships a strict `script-src` allowlist with no `'unsafe-inline'` — inline scripts only run if their exact SHA-256 hash is in the header. I computed the hash of the actual sync script byte-for-byte and it *is* in the allowlist, and the page's `connect-src` explicitly includes `https://okhp3.github.io`. CSP is not blocking it either.
- **Target mapping**: the script fetches the right URL and writes to nine DOM element IDs — skill count, family count, banner text, two summary cards, the "as of" date, and (new since the PUBLISHING.md description was written) `draftable`/`skeleton`/`usable` maturity counts. It's actually wired for more fields than the design doc claims.

In other words: the automation is correctly built. What's stale is the **static fallback text** — the numbers a non-JS visitor, a search crawler, or a social-share preview sees, and the numbers you see if you fetch the page without executing it. `PUBLISHING.md` itself documents this fallback text as a separate, explicitly manual step ("Refresh the static count and date fallbacks... even though the live page will replace them after a successful fetch") and nobody has done it since 08-20. That's a month of a real visitor with JS enabled probably seeing 326/21 correctly, while every crawler, link preview, and no-JS visitor sees 148/16 — a number that's now less than half the truth and getting worse every week the catalog grows.

Caveat: I could not get a rendered screenshot this session (browser bridge to your machine wasn't reachable), so "probably seeing 326/21 correctly" is inference from static analysis, not a direct observation of the DOM after fetch. One five-minute check closes this: open the dossier in a real browser, open devtools, and confirm the on-screen numbers update to 326/21 and that no `[skillz dossier]` warning appears in the console. If that check fails, escalate — it would mean either the endpoint, the schema, or the script silently broke despite passing every static check, which is a more concerning failure mode than a stale fallback.

Either way, the actual defect to fix is unchanged from what it's always been: someone needs to run the manual fallback-refresh checklist that's already written down in `PUBLISHING.md`. The mechanism doesn't need debugging. The checklist needs doing.

One cosmetic note in the same neighborhood: the dossier's "Hot off the FORGE" banner says "v0.5 is live," linking to a blog post about a "Council of AIs" review. That's blog-post versioning, unrelated to the actual `v0.1.0` git tag. Harmless, but a reader who knows the repo only has one real tag will do a double-take. Consider not overloading "v-number" language on a page that also cites the real release tag elsewhere.

### 2.4 Monorepo consolidation

The 08-26 `MIGRATION.md` is a genuinely well-written ledger: explicit baseline, explicit collision-resolution rule (root wins), explicit list of what got archived versus deleted, explicit rollback guidance. This is the kind of document that makes a destructive-looking operation auditable after the fact, and it holds up under spot-checking — `artifacts/forge` is confirmed as the one live app copy, the old top-level `forge/` has zero files in the git index (see §0 row 8), and `skillz.manifest.json` is regenerating cleanly from the new root layout.

One real gap, already flagged once and still open: three pre-existing gitignored directories (also confusingly named `forge/`, `community/`, `universal/`) were quarantined to `/tmp/skillz-consolidation-hold-20260826/` rather than committed or deleted, specifically because their contents couldn't be verified from git history. That's the right call for a scary migration, but `/tmp` doesn't survive reboots — if there was anything in those directories worth keeping, that window may already be closed. Not something I can verify from here; worth a direct check on your end if you haven't already looked.

### 2.5 New internal tooling

`artifacts/forge-review-desk` is a new, private Radix/shadcn-based review workspace, distinct from the public Forge app, with its own `sync-catalog-data.mjs` for pulling preview data. No README. It's clearly meant as an internal QA surface, not a public artifact, so I'm not treating its lack of documentation as a defect — just noting it exists, in case it's meant to eventually merit its own status write-up.

## 3. Vision-to-execution gap analysis, updated

### 3.1 The ratio that didn't move

This is the headline finding of this audit, more than the dossier. The catalog grew from 113 to 326 skills — nearly 3x — while the `usable`-maturity count stayed exactly at 5. Six weeks ago, "usable" was a rounding error against a small catalog; today it's a rounding error against a catalog three times the size. The 09-19 "duplicate consolidation" (350 → 326 skills, all 21 families retained) shows real editorial discipline — someone is pruning, not just accumulating — which is a good sign. But it was a width correction, not a depth one.

This isn't automatically a problem. A discovery catalog can legitimately prioritize breadth of draftable contracts before investing in promotion to `usable`. But it is a strategic choice that's currently happening by default rather than by decision, and 08-06's audit already named "usable maturity" as the bar for the next real release (`v0.2.0`, per the tag's own release notes). Six weeks of growth without a second `v0.2.0` candidate should prompt an explicit choice: keep growing breadth, or pause intake and push a batch of skills through to `usable`.

### 3.2 Family sprawl, checked against the actual list

The family count went 15 → 21. Pulling the current list directly rather than trusting a diff: `abrahamic`, `agent-foundry`, `askjamie`, `community`, `context-extraction`, `copilot`, `glee-fully`, `knowledge-operations`, `language-mediation`, `lifetrkr`, `mermaid`, `notion`, `openclaw`, `outcome-modeling`, `process-capture`, `red-teaming`, `refolddec`, `replit`, `social-posting`, `software-reclamation`, `universal`.

Several of the newer-looking names (`openclaw`, `red-teaming`, `social-posting`, `copilot`, `language-mediation`, `software-reclamation`, `replit`) read as genuinely different domains rather than natural subdivisions of the original 15. That's not automatically scope creep — a skills library is supposed to grow — but it's worth you personally confirming these all still map to a coherent "portable delegation contract" thesis rather than the catalog becoming a junk drawer for whatever got authored that week. I can't make that call from git history alone; it needs your judgment on whether each family earns its place.

### 3.3 Everything else from 08-06

The remaining August findings (release-tag honesty, live-verification discipline, evidence-model separation from maturity) held up and, if anything, strengthened — `docs/PUBLISHING.md`'s release-gate section now includes an explicit, self-critical reconciliation of `v0.1.0` against a gate written after the tag was cut, admitting which of seven criteria were actually met versus assumed. That's a level of self-audit rigor a lot of much bigger projects don't bother with.

## 4. Critical verdict

The infrastructure discipline held, and in a few places it improved on its own terms: the tag is real now, two more shipped features closed out the P2 backlog, and the monorepo consolidation is about as clean as a 16-family bulk migration gets. None of that was guaranteed six weeks ago.

But the exact structural gap that blocked an M4 "trustworthy distribution center" claim in August is still open in September, just wearing a different face. In August it was "the dossier is stale and nobody's caught it." In September it's "the automated fix for that exact problem is technically correct, and the one deliberately-left-manual step next to it hasn't been run in a month." `docs/PUBLISHING.md` predicted this almost word for word back on 08-06: "a hand-corrected page can drift again the same way with no warning." It did, on schedule, in the one place the team's own process explicitly said it would.

That pattern, more than any single defect, is the thing worth naming directly: this project's documentation is unusually honest about its own risks, and that honesty isn't yet translating into anyone acting on the risk before it lands. The gap here isn't a competence gap. It's a follow-through gap on findings the team already wrote down correctly.

Second-order verdict: the catalog's growth curve (3x skills, 5-of-326 usable) means "distribution center" is still an accurate description of the ambition, and "catalog browser with a discovery UI" is still the accurate description of what a visitor actually gets today. That's the same M3-with-M4-ambitions read as August. Not a regression, just not yet a promotion either.

## 5. Recommended product direction

No change from 08-06's direction: hold the M3 decision-workbench ground you have, and don't claim M4 distribution-center status publicly until the dossier and the catalog both back it up simultaneously. What's new this cycle is a sharper set of preconditions, because you're closer than you were:

1. **Close the loop on the dossier, for real this time.** Not another automation layer — the automation already works. Run the manual fallback-refresh checklist that's already written in `PUBLISHING.md`, once, now. Then decide whether that checklist needs an owner and a recurring trigger (a calendar reminder, a scheduled check, whatever fits how you actually work) instead of relying on someone noticing.
2. **Make an explicit width-vs-depth call on the catalog.** Either commit to a `usable`-maturity push (pick a batch, promote them, ship `v0.2.0`) or explicitly decide breadth is the current priority and say so in `docs/BACKLOG.md` so "5 usable out of 326" reads as a stated strategy instead of an accidental stat.
3. **Audit the 7 newer families for thesis fit.** Fifteen minutes of your own judgment, not more research from me — confirm `openclaw`/`red-teaming`/`social-posting`/`copilot`/`language-mediation`/`software-reclamation`/`replit` all still earn a place under the original delegation-contract thesis.
4. **Restore the product pitch to the root README's first screen.** CI badges are fine lower down; a new evaluator's first paragraph should still say what the thing does for a user.

## 6. Long-form PRD: delta only

The 08-06 PRD (`docs/PRD-SKILLZ-FORGE-INDEPENDENT-AUDIT-2026-08-06.md`) remains the base document; nothing here replaces its M4 acceptance criteria. Two amendments:

- **Amend the M4 dossier-convergence criterion.** The original criterion was "the dossier matches the live catalog." Split it in two: (a) the automated sync mechanism is technically correct — confirmed this cycle via CORS/CSP/DOM-target inspection, so this half can be marked met; (b) the static fallback text is current within some stated freshness bound (e.g., "no more than N days stale") — still open, and now the one that actually gates M4, since the automation half is done.
- **Add a maturity-velocity criterion.** M4 shouldn't be claimable purely on catalog size or feature-flag count. Add an explicit bar such as "usable-maturity count grows roughly in proportion to catalog size" or a stated absolute target, so the width/depth tension in §3.1 has a checkable acceptance line instead of being a narrative observation every audit re-discovers.

## 7. Replit build directive: delta only

Nothing new required inside the Forge app itself this cycle — the app-side work (Compare, Activity, Composer, Discovery Aid) that the 08-06 directive called for is done. The only "build" item left is outside Forge's own codebase:

- In `OKHP3/OverKill-Hill`, run the manual fallback-text refresh described in `docs/PUBLISHING.md`'s checklist against the current `project-summary.json` (326 skills / 21 families / 248-73-5 maturity split / 2026-09-19 as-of date), across every static value the page carries: the banner, both summary cards, the inventory heading, and the "as-of" date.
- Optionally, if you want this to stop being a recurring miss: convert that manual checklist into a small scheduled check (a scheduled task that fetches `project-summary.json` and diffs it against the dossier's fallback numbers, flagging when they drift past some threshold) rather than another silent client-side auto-fix. The client-side fetch already solves this for JS-capable visitors; what's missing is a nudge for the humans who own the non-JS fallback.

## 8. Prioritized roadmap

| Priority | Item | Effort | Owner action |
|---|---|---|---|
| P0 | Refresh the dossier's static fallback numbers (326/21/248-73-5/2026-09-19) | Minutes | You or whoever has `OverKill-Hill` edit access |
| P0 | One manual browser check of the live-sync actually firing (devtools, confirm numbers update, confirm no `[skillz dossier]` console warning) | Minutes | You, or re-run this audit's browser step once the Chrome bridge is reachable |
| P1 | Decide and document the width-vs-depth catalog strategy in `docs/BACKLOG.md` | 30 min of judgment | You |
| P1 | Review the 7 newer families for thesis fit | 15-30 min | You |
| P2 | Restore product-vision framing to root `README.md`'s opening | 15 min | Whoever edits the repo |
| P2 | Decide the fate of `/tmp/skillz-consolidation-hold-20260826/` before it's lost to a reboot, if not already resolved | Minutes to check | You, directly on the machine that ran the migration |
| P3 | Clear the orphaned top-level `forge/` build output on the local mirror | Minutes | Local disk cleanup, no repo impact |
| P3 | Consider a scheduled drift-check for the dossier instead of relying on someone noticing | 30-60 min if built | You, if you want this to stop recurring |

## Appendix: what I could not verify this session

- **Live rendered screenshot of the app at 326-skill scale.** The Chrome bridge to your machine returned "browser extension not connected" and I didn't chase it further per the usual "don't loop on a dead tool" rule. Everything data-level (catalog counts, provenance, capability flags) was verified directly against the live JSON instead, which is actually a stronger check for the questions this audit cares about than a screenshot would have been.
- **The dossier's live-sync actually firing in a real browser**, as opposed to being technically correct on static inspection (CORS, CSP hash, DOM targets). High confidence based on three independent static checks, but not a direct observation. Flagged as the one open verification gap in §2.3.
- **The `replit-agent` branch.** Still only reachable via a direct GitHub check on your end; this mirror only tracks `main`.
- **Contents of the three gitignored directories quarantined to `/tmp/skillz-consolidation-hold-20260826/`.** Unrecoverable from git; only checkable on the machine that ran the 08-26 migration, and only if `/tmp` hasn't already been cleared.
