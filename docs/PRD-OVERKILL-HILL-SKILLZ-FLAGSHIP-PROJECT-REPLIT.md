# PRD: OverKill Hill Skillz Forge Project-Page Refresh for Replit

## Directive status

This is the implementation directive for the Replit project at <https://replit.com/t/overkill-hill/repls/OverKill-Hill>. It governs the flagship public project page at <https://overkillhill.com/projects/skillz/> and the supporting navigation, project index, search, metadata, and validation updates needed to keep that page current.

The target repository is `OKHP3/OverKill-Hill`. The page is a static HTML project dossier within the existing site. It is not the Skillz Forge SPA, a standalone microsite, or a duplicate catalog.

The live discovery application remains <https://okhp3.github.io/skillz/>. Its authoritative source remains <https://github.com/OKHP3/skillz>. This page is the canonical OverKill Hill narrative and brand home for the project.

## Current-state evidence and synchronization gate

Inspect the live project page and the current `OKHP3/OverKill-Hill` `main` branch before changing it. The route, project-index entry, project submenu entry, sitemap record, shared theme, analytics pattern, and structured metadata already exist. Improve and synchronize this real surface rather than rebuilding it from a stale PRD assumption.

Also inspect the current Skillz repository and live SPA before writing public inventory copy. On July 24, 2026, the source catalog declared 68 public distribution skills across 11 active families, while the visible Replit preview for the SPA was still at 67. The project page must reflect the reconciled generated source at release time, not the stale preview and not a hard-coded historic count.

Before implementation:

1. Record the active commits for `OKHP3/OverKill-Hill` and `OKHP3/skillz`.
2. Review the actual `projects/skillz/index.html`, `projects/index.html`, `assets/css/theme.css`, `assets/js/app.js`, site search data, sitemap, and site validator behavior.
3. Inspect the live project page and live SPA at desktop and mobile widths. Note concrete defects, stale copy, weak hierarchy, broken links, and layout regressions rather than assuming they exist.
4. Reconcile the OverKill Hill Replit checkout safely with its upstream repository. Preserve unreviewed work and report a real merge decision if one is required.
5. Obtain the inventory facts from the current Skillz generated catalog and manifest immediately before publishing.

Do not use force-pushes, destructive resets, blind lock-file deletion, or a manual edit of a display count to conceal synchronization drift.

## Product role

The OverKill Hill Skillz page must make a visitor understand why the library exists, how it relates to the wider forge, what is available today, where its boundaries are, and where to go next. It should feel like an inspectable project dossier and designed front door, not a sales funnel and not an embedded app shell.

The surface model is:

| Surface | Primary job | Primary action |
|---|---|---|
| OverKill Hill `/projects/skillz/` | Explain the project, ecosystem fit, constraints, maturity, and direction. | Enter Skillz Forge or inspect the repository. |
| Skillz Forge SPA | Search, browse, compare, inspect, compose, and share current skills. | Find the right skill or stack. |
| GitHub `OKHP3/skillz` | Provide installable source and native collaboration. | Read source, install, open an issue, or contribute. |

The page must make these jobs clearer, not blur them.

## Repository-backed public facts

Use a source-derived value at build time for all inventory labels. The present reference snapshot is:

- 68 public distribution skills across 11 active families.
- Two placeholder family directories, `glee-fully/` and `askjamie/`, excluded from the public skill total.
- 18 project-local support skills in `.agents/skills/`, excluded from public installable inventory.
- A current public distribution surface spanning Abrahamic, Agent Foundry, Community, Context Extraction, LifeTrkr, LinkedIn, Mermaid, Notion, Process Capture, ReFolDec, and Universal.

Use “public distribution skills” when stating the count. Do not imply that placeholders or project-local tooling are part of the public catalog. Do not list every package on this page. The SPA exists for deep catalog exploration.

The page may use current, verifiable examples such as governed Mermaid work, process documentation, Agent Skill creation, or AI conversation capture, but each example must map to a real current family, stack, and source route.

## Required page outcome

Create a flagship page that is at least as polished, current, accessible, and compelling as the SPA while remaining a different experience: the parent site tells the story, the SPA executes discovery.

Within the first viewport, a new visitor must understand:

1. Skillz Forge packages reusable `SKILL.md` delegation contracts for compatible AI agents.
2. The project is open source and GitHub-native.
3. The live workbench is available now.
4. The parent page is not pretending to be the workbench.

## Required content and interaction architecture

### 1. Shared OverKill Hill shell

Preserve and enhance the established site shell:

- Skip link, header, mobile navigation, project submenu, special update strip where still current, footer, shared scripts, and theme behavior.
- Exact brand spelling: `OverKill Hill P³™` with Unicode superscript ³.
- Existing visual language: Alfa Slab One headings, DM Sans body copy, JetBrains Mono technical details, and the shared tokenized palette.
- The Projects index and submenu must keep a visible, correctly named `Skillz Forge` entry.

Do not add a framework, build system, second stylesheet architecture, or a project-specific footer. The existing site is a hand-authored static HTML, CSS, and JavaScript system and should remain coherent.

### 2. Hero

Use one H1: `Skillz Forge`.

The hero should communicate a concise thesis such as: “Reusable capabilities from the OverKill Hill P³™ forge.” Support it with plain-language explanation of portable, inspectable, versioned `SKILL.md` delegation contracts.

Required hero actions:

- **Enter Skillz Forge** to `https://okhp3.github.io/skillz/`.
- **View Source on GitHub** to `https://github.com/OKHP3/skillz`.
- **Return to Prompt Forge** to the current valid Prompt Forge route.

If a live FoundRy route exists in the current site, add a contextual link that is editorially useful. If it does not, do not manufacture a new FoundRy page or alias as part of this work.

### 3. Problem and contract explanation

Keep the project’s strongest thesis: the prompt is not the artifact, the durable method is.

Explain the progression in accessible language:

1. A disposable prompt gets lost in chat history.
2. A prompt protocol makes operating conditions explicit.
3. A `SKILL.md` packages a reusable delegation contract.
4. GitHub makes that contract inspectable, versioned, forkable, reviewable, and improvable.

Describe a Skill contract only from verified source conventions: triggers, role and context, inputs, method, boundaries, outputs, validation, failure handling, handoff, and companion skills. Avoid claiming that every package contains every field or that any single format guarantees a result.

### 4. What visitors can do today

Present only shipped and verified SPA capabilities. At the time of this directive, the intended examples are natural-language discovery, family and maturity browsing, detail views, curated stacks, compare mode, browser-local favorites, static generated activity context, FAQ, raw/source links, and GitHub contribution routing.

Future ideas such as live GitHub activity, authenticated discussion, custom cloud stack storage, and in-app pull-request collaboration must be visibly marked as planned or omitted. Do not present them as current product behavior.

### 5. Flagship relationship map

Create a compact, mobile-readable editorial progression:

`Prompt Forge → FoundRy → Skillz Forge → GitHub`

Explain the roles:

- Prompt Forge designs and hardens prompt methods and protocols.
- FoundRy packages a reusable capability into a governed artifact when its current site context supports that description.
- Skillz Forge makes reusable capabilities discoverable and understandable.
- GitHub carries source, history, issues, pull requests, discussions, and review.

Use a simple ruled progression or existing project-page motif with explanatory copy. It must remain legible and meaningful at 390px. Do not build a decorative flowchart that conceals the explanation.

### 6. Demonstration pathways

Use no more than four repository-grounded scenarios to show what the library unlocks. Recommended choices are:

- Governed Mermaid workflow.
- Process documentation pipeline.
- New Agent Skill creation pipeline.
- AI conversation capture and reconciliation.

For each, show the recurring problem, the relevant family or curated stack, the resulting artifact, and a link into the actual SPA route or GitHub source. Validate each referenced skill identifier against the current generated catalog before deployment.

### 7. Current inventory and trust posture

Include a concise, date-stamped inventory panel that takes its values from the current generated Skillz data. It must distinguish public distribution inventory from placeholders and local support tooling.

Explain the maturity ladder accurately: Placeholder, Skeleton, Draftable, Usable, Validated, Published. Make clear that maturity is repository evidence, not a warranty, security certification, or universal compatibility claim.

Link to the relevant public GitHub documentation for publishing, security, and authoring. Do not reproduce every catalog card or hand-maintain a family directory in this page.

### 8. Honest scope and contribution

Include an “is / is not” section:

Skillz Forge is a public discovery workbench, generated repository catalog, composition guide, and GitHub collaboration bridge.

It is not a replacement for GitHub, an authenticated social network, a hosted agent runtime, a paid marketplace, a guarantee of readiness, or a second Prompt Forge.

Route contribution actions to GitHub-native endpoints. Do not build fake issue forms, user login, submission databases, or GitHub write operations into the static page.

### 9. Roadmap and final CTAs

Use the existing project-page roadmap grammar. Separate shipped capabilities from hardening work and genuinely planned work. Do not pre-commit to features unsupported by the repository roadmap.

End with distinct actions to:

- Enter the live Forge.
- View the source repository.
- Explore Prompt Forge.
- Contact OverKill Hill through the existing contact route.

## Visual direction

The page should be more exacting than a conventional marketing page: industrial, editorial, protocol-first, open-source, and deliberately alive. It should give Skillz Forge flagship status without stealing the SPA’s task-discovery role.

Use the canonical assets and design tokens from `assets/css/theme.css`. Existing mechanical raven or sentinel imagery may frame the project where it adds meaning. Preserve strong contrast, clear information hierarchy, and restrained motion.

Avoid purple gradients, generic AI neon, excessive rounded-card grids, decorative status badges without meaning, pricing, testimonials, made-up adoption metrics, and claims of a hosted SaaS product. Do not add em dashes to new copy.

The project page and the SPA should share a family resemblance through typography, palette, vocabulary, and source-oriented interaction cues. They should not share the same hero, browse cards, navigation model, or exact page composition.

## SEO, metadata, analytics, and search

Preserve and validate the existing metadata discipline rather than replacing it casually.

Required:

- Canonical URL `https://overkillhill.com/projects/skillz/`.
- Accurate title and description that identify a public Agent Skills workbench without claiming a runtime or marketplace.
- Open Graph and Twitter metadata using real assets and accurate alt text.
- BreadcrumbList structured data.
- SoftwareApplication structured data only while it precisely reflects the live SPA’s actual browser-based, open-source behavior.
- One GA4 initialization using the established `G-VJ1BKXS27H` pattern and no duplicate listeners.
- Privacy-preserving CTA events such as live-app open, GitHub open, Prompt Forge open, and contribution-route open. Do not capture raw search text, personally identifiable information, credentials, issue bodies, or private URLs.
- Sitemap and generated site search data refreshed when page content or route inventory changes.

Preserve existing canonical, robots, language, theme-color, color-scheme, favicon, manifest, and external-link security conventions. Verify every `target="_blank"` link uses the current `rel` requirements.

## Accessibility and responsive quality

The page must pass the existing static-site validator and be manually checked in the rendered site at 1440px, 1024px, 768px, and 390px.

Required qualities:

- One H1 and logical heading hierarchy.
- Semantic sections, landmarks, and descriptive links.
- Functional skip link and keyboard navigation.
- Visible focus styles and readable focus order.
- Meaningful image alt text, decorative-image handling, and no text embedded solely in imagery.
- Respect for reduced motion and both supported color modes.
- No horizontal scroll, clipped navigation, inaccessible hover-only submenu behavior, or CTA collision at small widths.
- Sufficient contrast for body copy, metadata, tags, buttons, and navigation in the actual rendered themes.

Use rendered browser evidence, not only source inspection, for final acceptance.

## Implementation boundaries

Preferred files and surfaces are:

- `projects/skillz/index.html`
- `projects/index.html` where the real index needs current copy or placement
- Existing shared navigation, footer, CSS, and JavaScript assets
- `assets/data/search-index.json` through the repository’s generator
- `sitemap.xml` when required by the site’s route policy
- Prompt Forge or FoundRy pages only when a small contextual link is necessary and the current route exists

Do not add React, Vite, npm workspaces, server APIs, database state, private environment variables, new paid services, or a manually maintained application catalog to `OKHP3/OverKill-Hill`.

Do not change the Skillz SPA code from this REPL. Coordinate through the stable public URLs and source-of-truth contract. If the SPA itself is stale, report that to the Skillz REPL workstream rather than duplicating its catalog here.

## Validation and public release gates

Run the current repository checks, including:

1. `python3 scripts/validate-site.py`
2. The search-index refresh or check required by the repository.
3. The relevant template conformance check when shared structure changes.
4. Any link or metadata audit available in the repository.

Then verify:

| Gate | Evidence required |
|---|---|
| Canonical route | `/projects/skillz/` loads successfully in the local preview and at `https://overkillhill.com/projects/skillz/`. |
| Navigation | Project index and project submenu expose the page correctly without duplicate entries. |
| Cross-surface routing | The live app link reaches the current SPA; the SPA’s project-page link returns here; the GitHub link reaches `OKHP3/skillz`. |
| Inventory truth | All public count/family/maturity copy is derived from the current Skillz source and excludes placeholders and `.agents/skills/`. |
| Metadata | Title, description, canonical, structured data, Open Graph, Twitter, and sitemap are correct. |
| Analytics | GA4 is initialized once and CTA events do not duplicate or leak personal data. |
| Responsive access | The four required widths, keyboard navigation, focus visibility, contrast, and reduced motion have been checked in a rendered browser. |
| Site quality | The static validator and any relevant search/template checks pass. |

Do not declare completion because the Replit preview is attractive. The public custom-domain route must be verified after deployment. If caching or deployment propagation delays verification, identify the expected commit, observed public result, and remaining condition.

## Replit delivery report

Return an evidence-backed handoff containing:

1. The inspected live and repository baseline, including source commits and inventory values.
2. Files changed and the reason each was changed.
3. The page and navigation changes that make Skillz discoverable without duplicating the SPA.
4. Source of every catalog-derived claim and the generation time or commit used.
5. Validation commands and results.
6. Desktop, tablet, mobile, keyboard, and theme QA results.
7. Public URLs verified after deployment, plus commit SHA.
8. Any intentionally omitted FoundRy alias, deferred enhancement, unrelated failure, or deployment propagation limitation.

The work is complete only when the parent dossier and the live SPA are current, mutually linked, visually coherent, and truthful about the same repository state.
