# Skillz Forge: Independent Product Audit and M4+ Build Directive

**Author:** Claude (Cowork), acting as independent second opinion, per direct instruction from Jamie Hill
**Date:** 2026-08-06
**Status:** Authoritative for next-phase planning. This is the current top-level directive in `docs/`; other PRDs, audits, and evaluations from this project's planning history are archived at `docs/archive/planning-2026-08/`. Supersedes nothing on the P0 fixes already verified live below; extends and partially corrects `docs/archive/planning-2026-08/PRD-SKILLZ-FORGE-M4-CONVERGENCE-2026-08-05.md`.
**Method:** Reconstructed vision from 24 repo documents (README, AGENTS.md, docs/, ADRs, audits, evidence, handoffs). Verified current state by fetching the live app at `okhp3.github.io/skillz`, its live `catalog.json` and `project-summary.json`, the live `overkillhill.com/projects/skillz/` dossier and its GitHub source, and by reading the `forge/` React/TypeScript source directly. Every claim below is tagged **live-verified**, **source-verified**, or **doc-only** so you can tell what I actually checked from what I'm relaying.

---

## 0. Read this first: you've asked for this exact audit before

On 2026-08-05, a prior Claude session wrote `docs/PRD-SKILLZ-FORGE-M4-CONVERGENCE-2026-08-05.md` (now archived at `docs/archive/planning-2026-08/PRD-SKILLZ-FORGE-M4-CONVERGENCE-2026-08-05.md`) under the same instruction (independent second opinion, verify live, don't trust self-reports). That document explicitly told Replit: *"do not author new PRDs, audits, or scorecards of this project's own completion state. Jamie and Claude own the next directive."*

That's worth knowing before you read another word of this one, for two reasons.

First, the good news: for once, real work happened against a directive instead of another document about the directive. I independently re-verified two of that PRD's three P0 acceptance criteria live, and they pass. That has not happened anywhere else in this project's paper trail. Credit where it's due.

Second, the one item that PRD called the loudest alarm on, the public dossier lying about the product, is **still broken today**, exactly as described, for the same reason: it lives in a different repository and a different Replit project (`OverKill-Hill`, not `skillz`), and fixing the `skillz` repo's own docs was never going to touch it. That gap has now survived at least six dated documents across eight days without closing. This report treats that as the single highest-priority open item, because it's the one thing standing between "genuinely good app" and "app whose own marketing calls it a liar."

---

## 1. Reconstructed Product Vision

Nobody wrote a single founding vision document for this project. The vision has to be assembled from `README.md`, `AGENTS.md`, `docs/STACK-POSITION.md`, `docs/PUBLIC_SURFACES.md`, and `docs/PUBLISHING.md`. Assembled, it's coherent and it matches what you described in this conversation almost word for word, which is a good sign the intent has stayed stable even as the paperwork churned.

**Core purpose.** `OKHP3/skillz` is a public library of portable, agent-readable "delegation contracts" (`SKILL.md` files) that let an AI agent do a recurring task correctly without a human re-explaining it every time. Skillz Forge, the `forge/` React SPA, is the public-facing distribution layer on top of that library. `AGENTS.md` states the mission as confirmed fact: "Package recurring methods as portable, agent-readable delegation contracts that can run across compatible agent runtimes without repeating the same human explanation." The vision line, labeled explicitly as inferred rather than confirmed, is to "become the reusable execution layer of the OKHP3 Visual Language Stack."

**What "distribution center" means here, specifically.** `docs/PUBLISHING.md` states the publishing principle directly: "Do not promote a skill because a folder exists. Promote a skill when it can be used by an agent without Jamie in the loop explaining what the skill meant." Forge's job, per the M4 PRDs, is to be the surface where a stranger can discover a skill, trust it, read its full contract, and act on it, all without you personally vouching for it in a DM. That is a materially higher bar than "browsable catalog," and it's the same bar you set for me in this conversation when you said the app should be "part application, part distribution center, part functional hub, part structured delivery system."

**Intended audience.** Two audiences, not one, and the product currently serves them unevenly. (1) Other agent operators (developers using Claude, Codex, Cursor, Copilot, Replit Agent) who want to install a working `SKILL.md` into their own agent's context. (2) You, across your other brand surfaces (OverKill Hill, Glee-fully, AskJamie), as the place those brands point to when they want to credibly say "there's a real skill library behind this." `docs/PUBLIC_SURFACES.md` makes surface #2 explicit: OverKill Hill is the canonical public landing page, Glee-fully and AskJamie are "contextual side doors, not alternate canonical homes."

**Core problems it's supposed to solve.** Stopping the re-explanation tax (writing the same instructions to an agent every session), giving those instructions a stable, versioned, inspectable, comparable form, and making a family of related instructions composable into a pipeline instead of a pile.

**Key user journeys, as designed into the app itself:**
1. Arrive with a vague goal ("document a messy business process") and get routed to a specific skill or stack. The Home search bar and the Explore page's "Not sure where to start?" discovery-aid cards exist for exactly this (**live-verified**).
2. Arrive knowing roughly what you need, filter by family, maturity, or evidence status, and land on a skill detail page (**live-verified**, Explore filters work: 15 families, 6 maturity levels).
3. Decide whether to trust a skill: read its evidence state, its maturity, its scope and boundaries, and now (as of some point after 2026-08-05) its complete `SKILL.md` rendered in-app with a table of contents (**live-verified** on `okhp3-cross-tradition-compare`, full contract renders, 700+ lines, ToC works).
4. Compare two to four skills side by side (**live-verified**, route works, empty state is clean).
5. Follow a curated multi-skill stack for a complete workflow, e.g. the ten-skill Process Documentation Pipeline (**live-verified**, five stacks live).
6. Install: copy a raw GitHub URL and paste it into an agent's context window (**live-verified**, install block present on every detail page).
7. Contribute back: file an issue or PR through GitHub-native flows (**doc-verified** via `docs/PUBLISHING.md` and the Contribute route existing in `App.tsx`).

**Expected tone and polish.** The brand voice throughout the docs and the shipped FAQ is unusually candid for a product page: it tells visitors plainly that most skills are "draftable, not validated," that "none is not the same as unsafe," and that "release readiness" is a UI convenience field that never overrides the underlying data. That candor is a deliberate product decision (the maturity/evidence model exists specifically to prevent overclaiming), and it is, right now, the single most distinctive thing about this product relative to every other "prompt library" site on the internet.

**The evolving goal that matters most:** the project's own internal audits redefined the finish line partway through. Early docs (`docs/BACKLOG.md`, `docs/PUBLISHING.md`) frame maturity purely in terms of individual `SKILL.md` quality. By 2026-08-04, the capability-maturity audit reframes the finish line around the *application's* trustworthiness as a distribution mechanism, independent of any single skill's maturity, introducing the M2 to M5 band (catalog, decision workbench, trustworthy distribution center, released ecosystem). That's the correct reframe, and it's the one this report uses, because it's the one your own prior audits converged on independently.

---

## 2. Current Application Assessment

I exercised the live app at `okhp3.github.io/skillz` directly: Home, Explore, a skill detail page, Compare, Stacks, Activity, FAQ. Everything below in this section is **live-verified** unless flagged otherwise.

**It's a real, working, well-designed product.** This needs to be said plainly because the repo's own documentation trail is so relentlessly self-critical that it would be easy to conclude this is a mess. It isn't. Home loads clean (a brief "Loading..." splash, then a fully rendered, on-brand page with the mascot art, search bar, and a "What is a SKILL.md?" explainer). Explore has a genuinely thoughtful "not sure where to start" discovery aid with five outcome-oriented entry cards, real filters (family, maturity, evidence, release-readiness), sort, and a live result count (113 skills found). The skill detail page is the strongest single artifact in the product: install block, raw/GitHub links, share/save/compare/add-to-stack actions, a "what it does" summary with explicit scope and boundaries, a provenance panel, an evidence-and-release-state panel with promotion blockers spelled out, related skills, workflow pathway, and now a complete, ToC-navigable rendering of the full `SKILL.md` contract. The FAQ is excellent long-form product writing: it explains the maturity/evidence distinction more clearly than most of the internal PRDs do.

**Provenance is now real, not fabricated.** I fetched the live `catalog.json` directly. The first ten entries alone span four distinct `createdAt` timestamps and three distinct commit SHAs (`fbefff36`, `37f966d8`, `70b3101e`), not the single fabricated deploy timestamp every prior audit (2026-08-03 through 2026-08-05) flagged as the top blocker. Across the full catalog there are 14 distinct `createdAt` values. This is a genuinely closed defect, the first one in this project's entire documented history that I can independently confirm went from "flagged broken" to "verified fixed" without another audit re-flagging it.

**Full-contract-in-app is shipped**, ahead of the 08-05 PRD's own read of the situation. That PRD listed "Full SKILL.md contract readable in-app: Not shipped" as a confirmed P1 gap. As of today, it's shipped and working well: the `okhp3-cross-tradition-compare` detail page renders the entire 700-plus-line contract, including its data tables, in place, with a working table of contents and safe Markdown rendering (no raw HTML injection risk visible). `forge/src/components/ui/FullContract.tsx` exists in source and matches what's live. Either this shipped in the roughly 24 hours between the 08-05 PRD and today, or that PRD's confirmed-tier finding was simply wrong. Either way, it's done now, live, verified.

**`project-summary.json` is shipped and populated.** `generatedAt: 2026-08-05T22:31:24Z`, `sourceCommit: f027a9b`, `skillCount: 113`, `familyCount: 15`, and a `capabilities` object correctly marking `fullContractRenderer: true`, `localStackComposer: false`. This is exactly the machine-readable release-summary artifact the M4-LIVE-CONVERGENCE PRD asked for in section 6.1. Shipped, live, correct.

**The one thing that is still, confirmed, broken: the public dossier.** I fetched `overkillhill.com/projects/skillz/` directly, and separately fetched its GitHub source at `github.com/OKHP3/OverKill-Hill/blob/main/projects/skillz/index.html`. Both say the same wrong thing: "75 public distribution skills across 12 active families," sourced from a "July 29, 2026 skill maturity audit," with Compare and Live GitHub Activity both listed under "Planned features," and a header banner still referencing "v0.5." Every one of those claims is now false; Compare and Activity have been live for over a week, and the real count is 113 skills across 15 families. This is the same defect `PUBLIC_SURFACES.md`, `PUBLISHING.md`, and three separate 2026-08-04 PRDs all flagged, and it is unfixed today, 2026-08-06, because (as `PUBLISHING.md` itself now admits) the dossier is hand-authored static HTML in a *separate* repository (`OKHP3/OverKill-Hill`) and a *separate* Replit project, and nothing in the `skillz` repo's CI can touch it.

**The claimed release tag does not exist.** `docs/CHANGELOG.md`'s `v0.1.0` entry and the live Activity feed's commit log both reference "v0.1.0 tag" language. I checked the local git mirror directly: `git tag -l` returns nothing. The changelog itself has already been edited to add a defensive clarification: "the `v0.1.0` entry is a release record rather than evidence of an existing Git tag." That's the project correcting its own overclaim, which is good practice, but it means the B3 acceptance criterion from the 08-05 PRD ("`git tag -l` on `main` returns at least `v0.1.0`") still fails today.

**The unresolved `replit-agent` branch remains unresolved.** Flagged 2026-08-03 as 69 commits ahead of `origin/main`, restated as an open risk in three subsequent documents, and still unverifiable from here: the local mirror tracks `main` only, not the full remote branch set. I could not confirm whether it still exists, whether it's still ahead, or whether it contains real unshipped work. This is the one item in this report I genuinely cannot verify myself; it needs a direct `git ls-remote` or a look at the GitHub branches page.

**Architecture is sound and honestly scoped.** It's a static Vite/React/TypeScript SPA, no backend, no database, no auth, consuming a generated JSON catalog at runtime rather than bundling it into JS (confirmed fixed per `PRD-SKILLZ-FORGE-V2-EVIDENCE-AND-INTEGRITY`'s original complaint about a 931KB JS chunk; the catalog is now fetched from `public/data/catalog.json`, and `project-summary.json` sits alongside it). `forge/src/main.ts`, flagged as dead scaffold code, is confirmed absent from the current source tree. The `Non-goals` sections across three separate PRDs all correctly refuse to scope-creep this into a backend, an account system, or a second GitHub. That restraint is correct and should hold.

---

## 3. Vision-to-Execution Gap Analysis

| Area | Status | Evidence |
|---|---|---|
| Discovery (search, filter, sort, shareable state) | **Fully implemented and aligned** | Live-verified on Explore |
| Skill inspection (summary, scope, evidence, provenance) | **Fully implemented and aligned** | Live-verified on detail page |
| Full contract reading in-app | **Fully implemented and aligned** | Live-verified, ahead of the 08-05 PRD's own status read |
| Per-skill provenance honesty | **Fully implemented and aligned** | Live-verified against `catalog.json`, the single clearest fixed defect in the project's history |
| Curated stacks / guided workflows | **Fully implemented and aligned** | Live-verified, five stacks, ordered steps, install-all |
| Compare | **Fully implemented and aligned** | Live-verified, clean empty state, up to four skills |
| Contribute routing | **Fully implemented and aligned** | Route exists, points to GitHub-native flows |
| Build-time Activity feed | **Fully implemented and aligned** | Live-verified, real commit history, correctly labeled as "read-only, no live polling" |
| Machine-readable release summary (`project-summary.json`) | **Fully implemented and aligned** | Live-verified, matches the spec that asked for it |
| First versioned release | **Present but misaligned** | Changelog and commit messages assert a "v0.1.0 tag" that does not exist in git |
| Public dossier accuracy | **Present but critically misaligned** | Live-verified stale on both the rendered page and its GitHub source |
| Custom local stack composer | **Missing** | `project-summary.json` itself reports `localStackComposer: false`; correctly not overclaimed |
| Guided "start with my intent" recommender | **Missing** | Same source, `guidedDiscoveryAid: false`; the Explore discovery-aid cards are a static, hand-authored partial substitute, not this |
| Evidence "not-run" vs "no evidence" distinction | **Partially implemented** | FAQ already explains the distinction in prose ("not-run" vs "none"); unclear whether the underlying `EvidenceStatusV2` enum was extended to match, not independently re-verified at the schema level this session |
| Deploy-trigger allowlist, root-cause fix | **Unclear, needs direct verification** | Prior PRDs wanted a path-independent trigger rather than a hand-maintained family list; not re-inspected this session |
| `replit-agent` branch reconciliation | **Unresolved, unverifiable from here** | Cannot confirm status from the local single-branch mirror |
| Overall product coherence | **Strong** | The app does not feel like disconnected pieces. Nav, visual language, and the maturity/evidence vocabulary are consistent across every route I visited |

**Where the vision and the execution genuinely diverge, ranked by how much it costs you:**

1. **The product is honest inside itself and dishonest about itself externally.** Inside Forge, the entire design is built around never overclaiming: maturity and evidence are kept deliberately separate, "release readiness" is labeled a derived convenience field, and the FAQ goes out of its way to say "none is not the same as unsafe." That discipline is real and it's good. Then the one page most likely to be a stranger's first impression, the OverKill Hill dossier, undercuts every bit of that discipline by stating a wrong skill count and mislabeling two shipped features as unbuilt. A visitor who checks both pages sees a product that can't even get its own inventory right, which is a worse first impression than if the dossier simply didn't exist.

2. **"Distribution center" is architecturally capped below what the vision implies**, and this is a deliberate, documented, correct decision, not an oversight: `docs/PUBLIC_SURFACES.md` and every M4 PRD explicitly forbid a backend, accounts, or write-scoped GitHub access. That means Forge can never be a place where a visitor *acts* on a skill (runs it, forks it, tracks their own usage) without leaving for GitHub or their own agent. That's fine as a scoping decision, but it means "distribution center" here means "excellent read-only discovery and inspection surface with install handoff," not "platform." Worth saying out loud so nobody upstream (you, or a future collaborator) expects Forge to eventually grow write capabilities; the docs correctly say it shouldn't.

3. **Skill-level maturity has not caught up to app-level maturity.** The app is now a legitimately good M3/M4-adjacent decision workbench. The content inside it is still mostly unproven: `project-summary.json` reports 87 draftable, 25 skeleton, and exactly 1 usable skill out of 113. The FAQ handles this honestly (it tells visitors exactly what "draftable" does and doesn't mean), but it means the product's core promise, "use this without Jamie in the loop," is not yet true for 112 of 113 skills. That's not a Forge defect; it's a content-maturity gap the app is correctly not hiding.

---

## 4. Critical Verdict

**Does the current application fulfill the original vision?** Mostly yes, for the app itself; no, for the product as experienced end to end, because the product includes the dossier that points to it. Taken in isolation, Forge is a genuinely strong M3-going-on-M4 decision workbench that does almost everything the vision asked for: discover, inspect, trust-signal, compare, curate, install. Taken as the full experience a stranger has (find OverKill Hill, read the dossier, click through to Forge), it currently fails on the very first trust test: the numbers don't match.

**Does it feel like a coherent product or a collection of pieces?** Coherent, inside Forge itself. The visual language, the maturity/evidence vocabulary, and the navigation model hold together across every route. It stops feeling coherent the moment you look at it from outside, because the "canonical landing page" (by the project's own stated information architecture) and the app it's supposed to introduce have drifted out of sync for over a week with no code path that can fix it.

**Is the current implementation scalable enough for the intended direction?** Yes, architecturally. Static generation, a clean type contract (`catalog.ts`), a real evidence model, and correct restraint on scope (no backend) all mean this can grow to more families and more skills without a rewrite. The risk isn't the architecture; it's process. Nine planning documents in eight days, three of them self-authored duplicate "reset" PRDs written the same day, is not a scalable planning cadence, and it's the reason the dossier gap has survived so long: attention kept going to re-auditing instead of to the one manual step (editing a different repo's HTML file) that would close it.

**Strongest parts of the current work, specifically:**
- The evidence/maturity data model and its FAQ explanation. This is a genuinely differentiated piece of product thinking; most "prompt library" sites don't distinguish "never tested" from "tested and failed" from "tested on an old version," and this one does, in the schema and in the copy.
- The full-contract-in-app reader, now that it's shipped. This closes the single biggest trust gap ("why do I have to leave the site to see what I'm installing") and it renders cleanly on a genuinely large document.
- Provenance honesty, now fixed and independently verifiable.
- Restraint. The non-goals sections (no backend, no accounts, no shadow GitHub) are correct, and the team has stuck to them under pressure to add features.

**Weakest or most underdeveloped parts, specifically:**
- The public dossier, as covered at length above. This is the single highest-leverage fix available: it requires no new code, only editing a static HTML file in a different repo and pushing it.
- Release discipline. There is no real git tag despite two separate documents implying one exists. "v0.1.0" needs to either become a real tag today or stop being mentioned as one.
- Cross-repo, cross-Replit-project truth propagation has no owner and no automated trigger. `PUBLISHING.md` says as much directly: "There is no automated trigger for this; it is a manual step for whoever has edit access to the overkillhill.com site." That's an honest admission, but an admission isn't a fix.
- Verification of what's actually sitting in the Replit workspace versus `main`, and whether `replit-agent`/`subrepl-*` branches hold real stranded work, remains genuinely unknown after more than a week of the same unanswered question appearing in document after document.

**What should be preserved:** the evidence/maturity model exactly as designed, the full-contract renderer, the curated stacks, the restraint on scope, and the FAQ's tone, which is the best-written page in the product and shouldn't be touched except to keep it in sync with reality.

**What should be reworked:** the process around how "done" gets declared. Every prior PRD in this repo asked for live-artifact verification instead of self-reported completion, and every prior PRD except this one and its immediate predecessor got ignored on that point. That has to actually hold this time, or you'll have a tenth PRD in two weeks re-discovering the same dossier gap.

**What should be removed or simplified:** the standing pile of superseded PRDs should be moved to `docs/archive/` (a pattern this repo already uses for the root scaffold) so a new reader, or a new agent session, doesn't have to read nine documents to find out which one is current. Right now `docs/` has six different files with "PRD" in the name and no single index telling you which one is live.

**What should be prioritized next:** closing the dossier gap, making the release tag real, and getting one direct, human-eyes-on confirmation of what's in the Replit workspace and the stray branches. All three are fast. None of them are new features.

---

## 5. Recommended Product Direction

Don't redesign Forge. Don't add the stack composer or the guided-intent recommender yet; both are explicitly scoped as P2 in your own prior directive and that scoping is still correct, because neither matters if the front door lies about the product.

The recommended direction has three tracks, in strict order, matching the discipline your own 08-05 PRD tried to establish and that this report is continuing rather than replacing:

**Track A, this week: make the public truth match the live truth.** This is not a Forge engineering task. It's an editorial task in a different repository. Someone with edit access to `OKHP3/OverKill-Hill` needs to open `projects/skillz/index.html`, replace the 75/12 count and the "v0.5" banner with the current 113/15 figures from `docs/PUBLIC_SURFACES.md`, and re-label Compare and Activity as shipped. Then decide, deliberately, whether that page should ever again carry a hand-typed count, or whether it should fetch `project-summary.json` at build or runtime instead. The JSON file already exists and already has everything needed.

**Track B, this week: make the release record honest.** Either cut a real `v0.1.0` tag on the commit the changelog already describes, or edit the changelog to stop implying one exists until it does. Both are five-minute tasks. Leaving the current contradiction (changelog says "record, not a tag," commit message says "v0.1.0 tag," live tag list says nothing) unresolved costs nothing to leave broken and costs five minutes to fix, so fix it.

**Track C, ongoing: convert the planning process itself.** Archive the superseded PRDs. Keep exactly one current directive document (this one, until it's superseded the same way). When Replit reports something as complete, the acceptance criteria in section 7 below are the only thing that counts as proof, not a written summary. This is the actual root cause of the eight-day loop this report opened with: not bad engineering, a paper trail that let "described as fixed" repeatedly stand in for "verified fixed."

Once A and B are closed and live-verified (not self-reported), move to the P1/P2 work the 08-05 PRD already scoped correctly: the evidence "not-run" split, Compare's v2-field upgrade, and only then the local stack composer and guided-intent recommender.

---

## 6. Long-Form PRD

### 6.1 Product vision (restated, canonical)

Skillz Forge is a static, read-only, browser-first distribution surface for a public library of portable Agent Skill (`SKILL.md`) delegation contracts. Its job is to let a visitor discover a relevant skill, inspect its complete contract and honest trust signals without leaving the site, and install it into their own agent, without you personally explaining anything to them first. It is not, and must not become, a backend service, an account system, a second GitHub, or a generic chatbot.

### 6.2 Product goals

1. Zero false claims on any public surface, including surfaces outside this repository.
2. Every trust signal (provenance, maturity, evidence) traceable to a real, checkable source, with explicit "unavailable" states preferred over plausible-looking fallback data.
3. A visitor can complete the full discover-to-install journey without leaving Forge except to fetch the raw file or view GitHub history.
4. The gap between "described as done" and "verified live" converges to zero and stays there.

### 6.3 Target users

- **Agent operators** (developers, prompt engineers, other agent-runtime users) evaluating and installing skills into Claude, Codex, Cursor, Copilot, Replit Agent, or similar.
- **You**, across OverKill Hill, Glee-fully, and AskJamie, as the person whose credibility is on the line every time one of those surfaces links here.
- **Future contributors**, evaluated through GitHub-native issue/PR flows, not through any in-app write path.

### 6.4 Core use cases

1. "I keep re-explaining the same task to my agent, is there already a contract for this."
2. "I found a skill, can I trust it, what's actually been proven about it."
3. "I need a complete workflow, not one skill; what's the ordered path."
4. "I'm choosing between two similar skills; what actually differs."
5. "I want this installed right now, in the format my specific agent tool expects."

### 6.5 Primary user journeys

Documented and live-verified in section 2 above (items 1 through 7). No changes recommended to the journeys themselves; the gaps are in truth-propagation, not in journey design.

### 6.6 Functional requirements

| ID | Requirement | Current status |
|---|---|---|
| F1 | Full-text and filtered discovery across all distribution skills | Shipped, live-verified |
| F2 | Skill detail view with summary, scope, boundaries, provenance, evidence, maturity | Shipped, live-verified |
| F3 | Full `SKILL.md` contract readable in-app with table of contents | Shipped, live-verified |
| F4 | Side-by-side comparison of 2 to 4 skills | Shipped, live-verified |
| F5 | Curated multi-skill stacks with ordered steps and bulk install | Shipped, live-verified |
| F6 | Build-time GitHub activity feed | Shipped, live-verified |
| F7 | GitHub-native contribution routing | Shipped, source-verified |
| F8 | Machine-readable release summary (`project-summary.json`) | Shipped, live-verified |
| F9 | Non-fabricated per-skill provenance | Shipped, live-verified |
| F10 | Local-only custom stack composer | Not shipped, correctly not overclaimed in `project-summary.json` |
| F11 | Guided intent-to-path recommender | Not shipped, correctly not overclaimed |
| F12 | First real, tagged release | Not shipped, incorrectly implied as shipped in two places |
| F13 | Public dossier parity with live app state | Not shipped, actively false on the live page |

### 6.7 Non-functional requirements

- Static hosting only. No backend, database, credential storage, or write-scoped GitHub token, per every prior PRD's non-goals section and this report's agreement with that scoping.
- No `dangerouslySetInnerHTML` for repository-sourced Markdown; the full-contract renderer must keep using a safe Markdown subset.
- Deployed catalog must fail the build loudly rather than silently substitute fallback data for any provenance field it cannot establish from real Git history.
- Console-error-free, keyboard-navigable, and usable at a 390px viewport (not independently re-verified this session beyond the visual pass on desktop and Explore; treat as needing a fresh check before any release claim).

### 6.8 Content requirements

- Every promoted skill needs a worked example and a validation checklist before promotion past Draftable, per `docs/PUBLISHING.md`'s own final gate: can it answer "when should an agent use this," "what does good output look like," and "what must the agent avoid."
- Evidence notes must distinguish "never attempted" from "attempted, not yet passing," not collapse both into one label, matching what the FAQ already promises visitors.

### 6.9 UX and UI requirements

No material changes recommended. The current visual language (serif display type, warm neutral palette, the forge mascot, orange accent) is distinctive and consistently applied. Preserve it.

### 6.10 Navigation and information architecture

Current nav (Explore, Stacks, Compare, FAQ, Contribute, Activity, external links to OverKill Hill and GitHub) is correct and should not be restructured. The IA problem in this product is not inside Forge; it's the missing sync between Forge and the dossier that's supposed to introduce it.

### 6.11 Technical architecture recommendations

Keep the current Vite/React/TypeScript, generated-JSON-catalog, GitHub-Pages-deployed architecture. Two concrete hardening items carried over from prior audits, neither independently re-verified this session:

- Confirm the Pages deploy workflow triggers on a path-independent policy rather than a hand-maintained per-family allowlist, so a 16th family doesn't silently fail to trigger a rebuild the way the 15th one originally did.
- Confirm the catalog build fails loudly (non-zero exit) rather than falling back silently whenever it cannot establish real per-skill Git provenance, so the provenance fix that's live today can't silently regress on a future shallow-checkout build.

### 6.12 Data and state management requirements

Catalog and project-summary data generated at build time from Git history and repository content; no client-side mutation beyond browser-local Save/Share/My-stack state, which correctly never leaves the device (confirmed in the FAQ's privacy answer).

### 6.13 Integration requirements

GitHub REST API at build time only, for the Activity feed (confirmed read-only, no live polling, per the FAQ and the visible Activity page copy). No other third-party integrations. Google Analytics 4 for aggregate, non-content usage metrics, disclosed in the FAQ.

### 6.14 Admin or distribution workflows

The only admin-shaped workflow this product has, and the only one currently broken, is dossier synchronization. It has no owner, no automated trigger, and no defined cadence beyond `PUBLISHING.md`'s aspirational "within 48 hours of any change" note. Section 7 below turns that into a real requirement.

### 6.15 Success criteria

Defined precisely in section 9 of the 2026-08-05 PRD (G0 through G5 gates) and still correct. This report adds one: **no public surface describing this product, inside or outside this repository, may state a skill/family count or feature-shipped status that diverges from `project-summary.json` for more than 48 hours after that file changes.**

### 6.16 Prioritized roadmap: MVP / V1 / future

- **MVP (already achieved):** M2, browseable catalog. Exceeded.
- **V1 (already achieved):** M3, decision workbench. Discovery, inspection, comparison, curated stacks, install handoff. Achieved and live-verified.
- **V1.5 (in progress, this report's Track A/B):** M4 gate closure. Provenance (done), full-contract inspection (done), public-surface truth convergence (not done), first real release tag (not done).
- **V2 (future, correctly deferred):** local stack composer, guided intent recommender, evidence-vocabulary refinement (not-run vs no-evidence split).
- **V3 (not yet scoped, do not start):** anything involving write access, accounts, or a backend. Every prior PRD correctly refuses this; this report agrees.

### 6.17 Acceptance criteria for major features already shipped, for regression protection

| Feature | Acceptance check |
|---|---|
| Provenance | Fetch live `catalog.json`, confirm more than one distinct `createdAt`/`commitSha` pair across a 10-skill sample |
| Full contract | Open any skill detail route, confirm the complete `SKILL.md` body renders in place with a working ToC, no navigation away required |
| project-summary.json | Fetch it live, confirm `generatedAt` is recent and `capabilities` flags match what's actually live |
| Dossier parity | Fetch `overkillhill.com/projects/skillz/`, confirm stated skill/family count matches the live `project-summary.json` skillCount/familyCount |
| Release tag | `git tag -l` on `main` returns at least one entry matching what the changelog claims |

---

## 7. Replit Build Directive

This section is written to be actionable directly, in order, with nothing deferred to interpretation.

**Do not start with a new feature. Do not write another audit or scorecard of this project's own completion state. Start with the two open items below, and report back only with live-fetched proof, not a written summary.**

### Step 1: Fix the dossier (owner: whoever has edit access to `OKHP3/OverKill-Hill`; may not be a Replit/Forge task at all)

1. Open `projects/skillz/index.html` in the `OKHP3/OverKill-Hill` repository (not `OKHP3/skillz`).
2. Replace "75 public distribution skills across 12 active families" with the current figures. Copy them from `docs/PUBLIC_SURFACES.md`'s "Recommended positioning" section in the `skillz` repo, or, better, fetch them live from `https://okhp3.github.io/skillz/data/project-summary.json` if that page's build process can make an external fetch.
3. Remove the "v0.5" banner reference unless a real `v0.5` exists; it doesn't yet.
4. Change "Compare Mode" and "Live GitHub Activity" from "Planned" to shipped/live status.
5. Decide and document, in that repo, whether this page will ever fetch `project-summary.json` directly (preferred, since it makes this defect structurally impossible to repeat) or whether it stays hand-maintained with a documented manual-sync trigger (acceptable, but only if the trigger is actually followed this time, which it has not been for eight days running).
6. Prove it: fetch the live page after the change and confirm the new numbers render, then paste that fetch result back, not a description of having made the change.

### Step 2: Fix the release tag (owner: whoever has push access to `OKHP3/skillz`)

1. Decide whether the commit already described in `docs/CHANGELOG.md` as "v0.1.0" is actually the state you want to tag.
2. If yes: `git tag v0.1.0 <that commit>` and push the tag. Confirm with `git tag -l` and a GitHub releases/tags page fetch.
3. If no, or if you're not ready to make a real release claim yet: edit the changelog so it no longer uses the word "tag" anywhere near "v0.1.0," to stop the current contradiction between the changelog's own self-correction and the commit-message language that still calls it a tag.

### Step 3: Resolve the branch question (owner: you, this one needs a human decision, not an agent)

1. Check GitHub directly (not a local mirror) for whether `replit-agent` and the `subrepl-*` branches still exist and how far ahead of `main` they are.
2. If they contain real work: decide whether to review and merge it, or explicitly abandon it. Either is fine; "still unknown eight days later" is the only bad option.
3. If they're stale scaffolding from earlier Replit sessions: delete them and note that decision in `docs/CHANGELOG.md` so a future audit doesn't re-flag it as an open question.

### Step 4: Only after Steps 1 through 3 are live-verified, resume the P1/P2 backlog exactly as scoped in `docs/archive/planning-2026-08/PRD-SKILLZ-FORGE-M4-CONVERGENCE-2026-08-05.md` sections 4 and 5 (evidence not-run split, Compare v2-field upgrade, local stack composer, guided-intent recommender). That scoping is still correct; this report does not change it.

### Standing rule for every future session on this project

Report completion only with a live artifact fetched fresh in that same session: a live URL, a live `git tag -l`, a live catalog sample. A description of work done in Replit, without a matching live fetch, is not evidence of completion. This exact rule has been written into three prior PRDs and followed inconsistently; the cost of not following it is the eight-day dossier gap this report opened with.

---

## 8. Prioritized Implementation Roadmap

1. **Fix the public dossier.** Highest leverage, lowest effort, zero new code required in the `skillz` repo itself. This is the one thing actively making the product look worse than it is.
2. **Resolve the release-tag contradiction.** Five minutes either way (tag it, or stop implying it's tagged).
3. **Get a direct answer on the `replit-agent`/`subrepl-*` branches.** Not code work; a five-minute look at GitHub's branch list.
4. **Re-verify the deploy-trigger allowlist and the provenance build-fail behavior** with fresh eyes, since neither was independently re-checked at the code level this session, only inferred from the live catalog's now-correct output.
5. **Split the evidence "not-run" vs "no evidence" states** at the schema level to match what the FAQ already promises.
6. **Upgrade Compare** to surface the v2 evidence fields, per the already-approved 08-05 scoping.
7. **Archive the superseded PRDs** into `docs/archive/`, leaving exactly one current directive document, so the next session (agent or human) doesn't have to read nine files to find the live one.
8. **Only then:** local stack composer and guided-intent recommender.

---

## Appendix: what I could not verify

For completeness, and in the same spirit this report is asking Replit to adopt: three things in this document are doc-only or partially verified, not live-verified, and you should know which.

- The deploy-trigger allowlist's root-cause fix (path-independent vs. hand-maintained family list) was not re-inspected in the workflow YAML this session; the live catalog's correct output is consistent with either version working today, but doesn't prove which one is deployed.
- The `EvidenceStatusV2` schema-level split between "not-run" and "no evidence record" was not directly inspected in `catalog.ts` or a sampled catalog entry this session; the FAQ's prose already describes the correct distinction, which is necessary but not sufficient proof the underlying data model enforces it.
- The Replit workspace state itself, and the `replit-agent`/`subrepl-*` branches, could not be reached from this session at all: the Replit repl URLs you gave me redirect to a Replit sign-up/login wall, and the local Git mirror used for this audit tracks `main` only. That verification needs to happen directly in your Replit account or on GitHub's branch list; no agent session can currently close that gap for you.
