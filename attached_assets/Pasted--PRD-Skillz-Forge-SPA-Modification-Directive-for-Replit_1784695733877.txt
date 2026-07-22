# PRD: Skillz Forge SPA Modification Directive for Replit

## Directive status

This document is an execution directive for altering the existing Skillz Forge SPA. It is not permission to replace the application with a new landing page, a screenshot, a mockup, or a second manually maintained catalog.

The implementer must preserve the working application, inspect the deployed application before changing code, reconcile the implementation to the current `OKHP3/skillz` repository, and return evidence for every material change.

Product: Skillz Forge

Parent identity: OverKill Hill P³™

Repository: https://github.com/OKHP3/skillz

Live deployment: https://okhp3.github.io/skillz/

Canonical project surface: https://overkillhill.com/projects/skillz/

Primary source branch: `main`

## 1. Mission

Alter the existing Skillz Forge single-page application so that it remains a dependable, repository-backed discovery workbench for reusable Agent Skills while becoming more faithful to the current repository contents, current catalog metadata, current OverKill Hill brand system, and honest GitHub-native collaboration boundaries.

The application is the public discovery and handoff surface for `SKILL.md` contracts. GitHub remains authoritative for source files, history, issues, pull requests, discussions, and installable artifacts. The SPA is a generated, read-friendly view over that source.

The central visitor journey is:

```text
Need an outcome
  -> discover a skill
  -> understand its fit and boundaries
  -> inspect provenance and maturity
  -> copy the raw install URL
  -> compose or compare skills
  -> open the appropriate GitHub contribution path
```

The finished application must make this journey easier without claiming capabilities that are not implemented.

## 2. Non-negotiable execution order

Replit must execute these phases in order.

### Phase A: live deployment preflight

Before opening or editing the local project, inspect the deployed SPA at the live URL.

Record:

- Inspection timestamp in UTC.
- Live page title and visible product identity.
- First-viewport screenshot at desktop width.
- First-viewport screenshot at mobile width.
- Current URL and hash route behavior.
- Home, Explore, one skill detail, Stacks, Compare, FAQ, Contribute, and Activity route behavior.
- Search behavior using at least one natural-language query.
- Family and maturity filter behavior.
- Copy, share, save, compare, stack, and GitHub handoff behavior where available.
- Console errors and failed document, script, stylesheet, font, image, and data requests.
- Whether the live app's visible catalog count and sample names agree with the repository snapshot.
- The deployed commit or build provenance if the app exposes it.

Do not assume the local checkout is the deployed build. If a live route or control differs from local source, treat that difference as a release-state fact and explain whether the implementation will preserve, repair, or intentionally replace it.

The live deployment was not available for permitted browser inspection during preparation of this directive. Consequently, this document makes no unsupported claim about the current rendered appearance or runtime behavior. The Replit execution must complete the live preflight and include the evidence in its delivery report before code changes are considered complete.

### Phase B: repository and source-of-truth preflight

Read the repository instructions and product documents before editing:

- `AGENTS.md`
- `README.md`
- `skillz.manifest.json`
- `docs/PUBLIC_SURFACES.md`
- `docs/STACK-POSITION.md`
- `docs/PUBLISHING.md`
- `docs/SECURITY.md`
- `docs/SKILLZ-FORGE-REPLIT-BUILD-DIRECTIVE.md`
- `docs/PRD-SKILLZ-FORGE-FLAGSHIP-SPA-REPLIT.md`
- `.agents/memory/skillz-forge.md`
- `forge/package.json`
- `forge/vite.config.ts`
- `forge/index.html`
- `forge/src/main.tsx`
- `forge/src/App.tsx`
- `forge/src/index.css`
- `forge/src/pages/`
- `forge/src/components/`
- `forge/src/utils/`
- `forge/src/types/`
- `forge/src/data/`
- `forge/scripts/build-catalog.js`
- `.github/workflows/deploy-pages.yml`

Resolve the current `main` commit at execution time. Do not rely on the snapshot values in this directive for catalog counts, commit identifiers, timestamps, or family membership.

### Phase C: gap register

Create a short implementation gap register before coding. For each item, record:

1. Live behavior.
2. Repository or local source behavior.
3. Desired behavior.
4. Risk of changing it.
5. Verification method.

Do not implement speculative features merely because an older PRD mentions them. Prioritize the gaps that affect source alignment, discoverability, truthfulness, routing, accessibility, or the core visitor journey.

### Phase D: implementation

Make the smallest coherent set of changes that satisfies this directive. Preserve working behavior and existing public routes. Do not delete source or generated output as part of a repair.

### Phase E: verification and handoff

Regenerate the catalog, run the build, perform browser QA against the local production build, and then re-check the deployed URL after deployment. The final report must distinguish local verification from live verification.

## 3. Verified repository baseline

The following facts were observed from the current GitHub repository during preparation. Revalidate them at execution time.

- Repository: `OKHP3/skillz`.
- Default branch: `main`.
- Current repository state is unreleased. The manifest version is `0.0.0-unreleased`.
- Repository license is MIT.
- Distribution catalog snapshot: 67 public skills across 11 active families.
- Placeholder families: `askjamie` and `glee-fully`.
- Project-local support skills under `.agents/skills/` are excluded from the public distribution count.
- The generated catalog snapshot observed in `forge/src/data/catalog.json` was generated at `2026-07-22T03:22:58.637Z` from source commit `58d54a7`.
- The observed GitHub branch head was `cc0a0255be71babd62f52e9436ec179e4d2c37d6`. Re-resolve this value before implementation.
- The current source includes the `agent-foundry` and `context-extraction` families.
- The current `context-extraction` source contains nine skills with human-readable H1 titles. The UI must display those titles where available instead of presenting only slug-derived names.

These counts are evidence for the handoff, not constants to copy into UI code. The UI must read `catalog.skillCount`, `catalog.familyCount`, and the generated family records.

## 4. Existing technical baseline to preserve

The current app is a React and Vite TypeScript SPA in `forge/`.

Current repository dependencies include:

- React 19.
- Vite 8.
- TypeScript 6.
- React Router with `HashRouter`.
- Fuse.js for deterministic local search.
- `lucide-react` where already used.

The current routes are:

- `/`
- `/explore`
- `/skills/:family/:skillName`
- `/stacks`
- `/stacks/:stackId`
- `/compare`
- `/faq`
- `/contribute`
- `/activity`

Keep the `HashRouter` unless a tested, GitHub Pages-safe routing replacement is explicitly justified. Every internal link and share URL must continue to work under:

```text
https://okhp3.github.io/skillz/#/...
```

The catalog generator is `forge/scripts/build-catalog.js`. It walks the repository, reads `SKILL.md` files, parses frontmatter and body sections, and writes `forge/src/data/catalog.json`. It excludes project-local support content and non-distribution directories. Preserve this source-of-truth boundary.

The Pages workflow is `.github/workflows/deploy-pages.yml`. Preserve its dependency installation, catalog generation, provenance checks, type-check, production build, artifact upload, and deployment behavior. Improve the workflow only when necessary to make the altered SPA reliably build and deploy.

## 5. Product goals

The altered SPA must help a visitor:

1. Start with a task or desired outcome.
2. Find a relevant skill using repository-backed metadata.
3. Understand what the skill does and does not do.
4. See its family, maturity, version, license, and source provenance.
5. See inputs, outputs, tools, runtimes, boundaries, triggers, examples, and companions when the source provides them.
6. Copy a raw installation URL without opening Markdown first.
7. Save, share, compare, and compose without creating an account.
8. Move into the correct native GitHub workflow for contribution.
9. Understand which facts are generated catalog data and which are live GitHub activity.
10. Use the app on desktop, tablet, mobile, keyboard, and reduced-motion settings.

## 6. Non-goals and safety boundaries

Do not:

- Build a paid marketplace.
- Require login for discovery, inspection, copying, or local favorites.
- Build a replacement for GitHub issues, pull requests, discussions, or reviews.
- Claim authenticated comments or in-app collaboration without a secure backend.
- Put tokens, OAuth secrets, cookies, GitHub App private keys, or Replit secrets in browser code.
- Send raw user-entered search text to analytics.
- Invent topics, tools, runtimes, outputs, validation results, maturity, or production claims.
- Treat every skill as equally complete or production-ready.
- Include `.agents/skills/` as public distribution entries unless the repository's catalog rules explicitly change.
- Introduce employer-specific, private, credential-bearing, or customer-specific content.
- Replace the current app with a static screenshot or an inert visual prototype.
- Create an alternate canonical public home for the project. The public routing model remains GitHub for source, Skillz Forge for discovery, and OverKill Hill for the project narrative.

## 7. Required functional alterations

### 7.1 Catalog alignment and provenance

Keep catalog generation deterministic and build-backed.

The generated catalog root must expose:

- `generatedAt`.
- `sourceRepository`.
- `sourceRef`.
- `sourceCommit`.
- `skillCount`.
- `familyCount`.
- `families`.
- `skills`.

Each skill record should preserve fields when present in repository source:

- `name` as the stable slug and route key.
- `displayName` as the human-readable title.
- `family`.
- `path` and `skillDir`.
- `description`.
- `version`.
- `license`.
- `category`.
- `origin`.
- `author`.
- `homepage`.
- `status` and derived `maturity`.
- `tags`.
- `topics`.
- `tools`.
- `runtimes`.
- `patterns` when source metadata supports it.
- `inputs`.
- `outputs`.
- `triggers`.
- `avoid` and `boundaries`.
- `companions` and `prerequisites` when safely available.
- `examples`.
- `validation` when explicitly declared.
- `lastModified`.
- `commitSha`.
- `githubUrl`.
- `rawUrl`.

When a field is absent, use a visible state such as `Metadata pending`, `Unclassified`, or an em dash only if the visual system already uses that symbol consistently. Do not fill gaps through guesswork.

The UI must use `displayName` for headings, result labels, stack labels, compare labels, and user-facing links. Show the stable slug as secondary mono metadata where useful. This is required so the newly titled `context-extraction` skills are readable to humans.

The catalog generator must fail or warn clearly when a curated stack references a missing skill. Do not silently drop missing steps from a stack.

### 7.2 Discovery and search

Preserve deterministic client-side search. Do not add a paid AI search dependency.

The search index must include, when available:

- Stable name.
- Display name.
- Description.
- Family and category.
- Tags and topics.
- Tools and runtimes.
- Inputs and outputs.
- Triggers.
- Boundaries and avoid statements.
- Companion and prerequisite names.
- Examples.
- Relevant headings or extracted body text.

Ranking priority:

1. Exact stable name.
2. Exact display name.
3. Exact phrase in description or trigger language.
4. Structured metadata match.
5. Boundary, companion, prerequisite, example, or heading match.
6. Family relevance.
7. Maturity only as a tie-breaker.

For every query result, provide a concise, truthful `Why this matched` reason. The reason can mention the visible query in the UI. Analytics must not receive the raw query.

Add or repair URL-persisted filters for:

- Query.
- Family.
- Maturity.
- Topic.
- Tool.
- Runtime.
- Pattern.
- Output.
- License.
- Has examples.
- Sort order.

Only expose filter options that exist in the generated catalog. If a metadata dimension has no populated values, show an honest pending or unavailable state rather than a dead control.

Preserve:

- Result count.
- Active-filter summary.
- Clear-all action.
- Search shortcut using `/` when focus is not already in an editable field.
- Escape behavior for transient search and filter UI.
- A useful no-results state with related families or topics where available.

### 7.3 Skill detail surface

Retain the stable route `/skills/:family/:skillName`.

The detail page must present the human-readable `displayName` as the H1 and the stable slug, family, and source path as supporting metadata.

Required content:

- Breadcrumb.
- Skill display name.
- Stable slug.
- Family.
- Maturity label and plain-language definition.
- Version when present.
- License.
- Source path.
- Last indexed commit.
- Last modified timestamp when present.
- What it does.
- Use this when.
- Do not use this when.
- Inputs.
- Outputs.
- Tools.
- Runtimes.
- Topics or tags.
- Examples, clearly labeled as source examples or illustrative examples.
- Companions and prerequisites.
- Compatibility, only when stated by source metadata.
- Limitations and validation state.
- Install/raw URL panel.
- Copy install URL.
- Copy raw URL.
- Open source on GitHub.
- Open commit history.
- Share.
- Save locally.
- Compare.
- Appropriate prefilled GitHub contribution links.

Do not represent a generated example as a tested execution result. Do not label a skill `validated`, `usable`, or `published` unless the catalog source explicitly supports that state.

### 7.4 Stacks and composition

Preserve the five curated stack records already present in `forge/src/data/stacks.ts`, but validate every skill reference against the current generated catalog.

Each curated stack must show:

- Problem.
- Audience.
- Ordered steps.
- Required and optional steps.
- Skill purpose per step.
- Step inputs and outputs where authored.
- Installation order.
- Copy-all install action.
- Share action.
- Links to individual skill detail routes.

If the live app already supports local composition, preserve it and repair it. If it does not, implement local-only composition as a bounded enhancement:

- Add a skill to a local draft stack.
- Remove a skill.
- Reorder skills where practical.
- Save the draft in local storage.
- Copy a plain-text or JSON stack manifest.
- Copy all raw install URLs.
- Share a hash-safe URL.

No local composition action may imply that the curated repository data was changed.

### 7.5 Compare mode

Preserve `/compare` and the current two-to-four-skill limit.

Compare, when data exists:

- Purpose.
- Display name and stable slug.
- Family.
- Maturity.
- Trigger language.
- Boundaries.
- Inputs.
- Outputs.
- Tools.
- Runtimes.
- Companions.
- License.
- Version.
- Source commit.
- Install URL.
- GitHub source.

Keep comparison as an open editorial table. Do not turn it into a KPI dashboard. Empty cells must be visibly unclassified.

### 7.6 Activity and freshness truthfulness

Correct the current Activity behavior so a catalog-order slice is never presented as recent activity.

The current source derives `recentSkills` by filtering placeholders and taking the first ten catalog records. That is not evidence of recency. Replace it with one of these honest designs:

1. A `Catalog snapshot` panel that shows generated timestamp, source ref, source commit, skill count, and family count, with no recent label; or
2. A generated activity snapshot created during CI from actual commit metadata; or
3. A cacheable public GitHub read surface with an explicit freshness timestamp and a generated-data fallback.

The initial release may remain static. If GitHub cannot be reached, the UI must still render the generated catalog facts and provide direct links to GitHub.

Separate visually and semantically:

- Generated catalog facts.
- Build timestamp.
- Source commit.
- Live or cached GitHub activity.
- Planned integrations.

Do not claim live polling if the app does not poll. Do not claim recent skill updates from array order.

### 7.7 GitHub handoff boundaries

Keep the application GitHub-native and read-only unless an explicitly secure backend exists.

Required public handoffs:

- Repository.
- Source file.
- Raw `SKILL.md`.
- Commit history.
- Open pull requests.
- Discussions.
- Releases.
- Security reporting path.
- Prefilled bug issue.
- Prefilled improvement issue.
- Prefilled new-skill issue.

Prefilled issue links may include the public skill name and source path. They must not include private text, credentials, secrets, personal data, or raw user search text.

Do not add browser-side GitHub authentication, personal access tokens, OAuth client secrets, or GitHub App private keys.

### 7.8 Brand and visual alignment

Use the canonical OverKill Hill design system already documented in the repository.

Typography:

- Alfa Slab One for major display headings.
- DM Sans for body, controls, labels, and navigation.
- JetBrains Mono for paths, slugs, raw URLs, source references, and code.

Palette tokens:

- Espresso: `#2a2320`.
- Teal: `#1c3a34`.
- Olive: `#676a2c`.
- Ochre: `#a06e28`.
- Rust: `#5b3a27`.
- Orange: `#c46a2c`.
- Amber: `#e6a03c`.
- Paper: `#f6f2ee`.

Maintain the existing forge character:

- Dark industrial workbench shell.
- Copper and amber actions.
- Deep teal structural accents.
- Paper inspection surface.
- Thin rules and controlled radius.
- Source and maturity treated as first-class information.
- Low-noise transitions.

Remove residual Playfair/Inter assumptions if they remain anywhere in the SPA. Do not introduce purple AI gradients, neon glows, glass cards, fake KPI tiles, decorative icon walls, or a generic SaaS dashboard.

Keep the parent lockup visible as `OverKill Hill P³™ / Skillz Forge` or an approved equivalent. Include contextual links to the parent site and Prompt Forge where they improve orientation. Do not create a duplicate project narrative inside the SPA.

### 7.9 Metadata, SEO, and document titles

Preserve the base title:

```text
Skillz Forge | OverKill Hill P³™
```

Preserve the base description:

```text
Find, inspect, compose, install, and improve reusable Agent Skills from the OverKill Hill P³™ forge.
```

Preserve the canonical URL:

```text
https://okhp3.github.io/skillz/
```

Maintain or repair:

- Charset.
- Responsive viewport.
- Author, creator, and publisher.
- Robots.
- Canonical.
- Theme color and color scheme.
- Open Graph title, description, URL, image, and image alt text.
- Twitter card, title, description, image, and image alt text.
- Favicon and Apple touch icon.
- Manifest link where supported.
- Truthful JSON-LD only.

Route titles must be meaningful, including Explore, skill detail, Stacks, Compare, FAQ, Contribute, and Activity.

Hash routes must not generate canonical or share links that drop `/skillz/` or the `#/` fragment.

### 7.10 Analytics and privacy

Retain the shared GA4 Measurement ID already present in the repository: `G-VJ1BKXS27H`.

Initialize the tag once. Keep route-aware pageview tracking and prevent React StrictMode duplicates.

Wire event helpers only to actual user actions. The source taxonomy may include:

- `skill_search`.
- `skill_filter_apply`.
- `skill_open`.
- `skill_copy_install`.
- `skill_copy_raw_url`.
- `skill_share`.
- `skill_save`.
- `stack_open`.
- `stack_compose`.
- `stack_copy_all`.
- `compare_open`.
- `faq_expand`.
- `github_handoff`.
- `contribution_path_open`.

Safe parameters may include public skill name, family, maturity, filter type, destination type, stack ID, action type, query-length bucket, result-count bucket, and filter-count aggregate.

Never send:

- Raw search text.
- Issue bodies.
- Comment text.
- Raw `SKILL.md` contents.
- Credentials.
- Tokens.
- Private URLs.
- Personal information.

Document the event taxonomy next to the analytics implementation. Verify that duplicate listeners and duplicate pageviews do not occur.

## 8. Accessibility and responsive requirements

Verify at minimum:

- 1440px desktop.
- 1024px tablet.
- 768px compact layout.
- 390px mobile.

Required behavior:

- Semantic landmarks.
- One meaningful H1 per route.
- Correct heading order.
- Keyboard access to every control.
- Visible focus states.
- Proper labels for inputs.
- Live region for copy success and result-count updates.
- Maturity not conveyed by color alone.
- Sufficient contrast on dark and paper surfaces.
- Reduced-motion support.
- No normal-use horizontal overflow.
- Horizontal scrolling only inside code or comparison regions when necessary.
- Accessible mobile navigation.
- Accessible filter drawer with focus behavior.
- Escape handling.
- Copy success and failure feedback.
- Buttons for actions and links for navigation.

## 9. Required verification

### 9.1 Repository and build checks

From the repository root, run the applicable checks:

```bash
node forge/scripts/build-catalog.js
cd forge
pnpm run build
```

Also verify:

- Catalog is non-empty.
- Catalog counts are generated, not hardcoded.
- `sourceRepository` is `https://github.com/OKHP3/skillz`.
- `sourceRef` is not `HEAD`.
- `sourceCommit` is present or a clearly documented local fallback is used.
- No excluded `.agents/skills` entry appears in the public catalog.
- Every curated stack skill reference resolves.
- TypeScript passes.
- No broken imports or stale starter files remain.

### 9.2 Local browser QA

Run the production build through a local static preview and verify:

1. Home loads from the intended base path.
2. Home search navigates to Explore.
3. Search returns expected results for at least five representative tasks.
4. Display names and stable slugs are presented correctly.
5. Family, maturity, and every populated metadata filter work.
6. Search and filters persist after reload.
7. Empty state explains the query or filters and offers reset.
8. Skill detail opens from a result, family, stack, and direct hash URL.
9. Detail sections correctly show source-backed metadata and pending states.
10. Copy install and raw URL actions work.
11. Share fallback copies a hash-safe URL when Web Share is unavailable.
12. Favorites persist locally and do not leave the browser.
13. Curated stacks open and copy all valid installation URLs.
14. Local composition, if implemented, can add, remove, reorder, save, and share.
15. Compare supports two to four skills and preserves the share URL.
16. FAQ search, expansion, and deep links work.
17. Contribution links target the correct GitHub paths.
18. Activity does not falsely label catalog order as recency.
19. Route titles and document metadata change correctly.
20. Analytics initialization occurs once and raw search text is absent from event payloads.
21. No console errors appear during the critical path.
22. Desktop, tablet, and mobile layouts remain usable.

### 9.3 Live post-deployment QA

After deployment, repeat the live preflight on the actual production URL.

At minimum, verify:

- The deployed asset bundle is current.
- The deployed catalog source commit matches the intended source snapshot.
- The home route loads without a blank shell.
- Direct hash URLs reload successfully.
- Assets resolve under `/skillz/`.
- Search, filter, detail, stack, compare, FAQ, and contribution paths work.
- Shared URLs retain the correct base path and hash.
- No production console errors or failed critical assets occur.
- The visible brand identity matches the approved design direction.
- The live catalog does not show stale counts or stale skill names.

If the deployment is not updated by the end of the run, report that explicitly. Do not mark live QA passed based on a local build.

## 10. Suggested implementation file map

Use the existing structure where possible.

Likely files to inspect or alter:

- `forge/src/types/catalog.ts`
- `forge/src/utils/search.ts`
- `forge/src/utils/clipboard.ts`
- `forge/src/utils/github.ts`
- `forge/src/utils/analytics.ts`
- `forge/src/pages/Home.tsx`
- `forge/src/pages/Explore.tsx`
- `forge/src/pages/SkillDetail.tsx`
- `forge/src/pages/Stacks.tsx`
- `forge/src/pages/StackDetail.tsx`
- `forge/src/pages/Compare.tsx`
- `forge/src/pages/FAQ.tsx`
- `forge/src/pages/Contribute.tsx`
- `forge/src/pages/Activity.tsx`
- `forge/src/components/layout/Nav.tsx`
- `forge/src/index.css`
- `forge/index.html`
- `forge/scripts/build-catalog.js`
- `forge/src/data/stacks.ts`
- `.github/workflows/deploy-pages.yml`, only if required

Do not edit generated catalog sections in `README.md` or `.agents/skills/README.md` by hand. Do not hand-edit `forge/src/data/catalog.json` when the generator is the appropriate source of change.

## 11. Delivery report required from Replit

Return a structured report containing:

- Live preflight timestamp.
- Live URL inspected.
- Live routes tested.
- Live screenshots or screenshot references.
- Live console and network findings.
- Repository commit inspected.
- Catalog generation timestamp and source commit.
- Gap register summary.
- Product changes.
- Catalog and provenance changes.
- Search and filter changes.
- Detail-page changes.
- Stack and compare changes.
- Activity and freshness changes.
- GitHub handoff changes.
- Brand and visual changes.
- Metadata and SEO changes.
- Analytics and privacy changes.
- Accessibility and responsive changes.
- Files changed.
- Commands run.
- Local build result.
- Local browser QA result.
- Live post-deployment QA result.
- Deployed commit SHA or explicit reason it could not be resolved.
- Live deployment URL.
- Known limitations.
- Intentional deviations from this directive.

The report must distinguish verified facts, inferred facts, planned work, and unresolved limitations. A green local build is not sufficient evidence that the live SPA is aligned.

## 12. Completion standard

The alteration is complete only when:

- The existing SPA remains functional.
- The live deployment has been inspected before and after the change.
- The catalog is generated from repository content.
- Display names, stable slugs, family membership, and catalog counts are truthful.
- Search and populated filters use source-backed metadata.
- Detail pages expose meaningful source-backed information and honest pending states.
- Activity distinguishes catalog snapshots from live GitHub activity.
- Hash routing and share URLs work on GitHub Pages.
- GitHub handoffs are correct and read-only.
- Analytics uses the shared property without raw user query text.
- The application follows the OverKill Hill typography and palette.
- Desktop, tablet, mobile, keyboard, and reduced-motion checks pass.
- The production build passes.
- The live deployment check passes, or the delivery report names the external blocker and does not claim completion.

The product should feel like a well-organized public forge: the tools are labeled, the source is inspectable, the boundaries are clear, and the next useful action is always apparent.
