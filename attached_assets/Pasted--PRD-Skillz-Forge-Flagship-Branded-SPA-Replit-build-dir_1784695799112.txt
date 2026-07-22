# PRD: Skillz Forge Flagship-Branded SPA

## Replit build directive

Rebuild and harden the Skillz Forge single-page application in the OKHP3/skillz repository.

Skillz Forge is the flagship public workbench for reusable Agent Skills in the OverKill Hill P³™ ecosystem. It is not merely a peer application beside Mermaid Theme Builder, BPMN for Mermaid, or Abrahamic Reference Engine. It is the public capability layer that connects the entire OverKill Hill design, governance, packaging, and collaboration model.

The application must retain the current working functionality while becoming unmistakably OverKill Hill:

- Correct wordmark relationship.
- Correct typography.
- Correct color tokens.
- Correct terminology.
- Correct metadata.
- Correct analytics.
- Correct GitHub Pages routing.
- Correct catalog provenance.
- Correct GitHub-native collaboration boundaries.

The result should feel like entering a well-organized digital forge. The tools are visible, the source is inspectable, the limits are honest, and the visitor can move from discovery to use to contribution without confusion.

## Product identity

Product name:

Skillz Forge

Parent identity:

OverKill Hill P³™

Brand signature:

Precision · Protocol · Promptcraft

Primary headline:

Find the skill for the work in front of you.

Primary promise:

Search reusable agent capabilities, inspect their boundaries, compose a stack, install the source, and move into GitHub when the work needs review.

Live URL:

https://okhp3.github.io/skillz/

Repository:

https://github.com/OKHP3/skillz

## Current implementation baseline

The current forge application already provides a useful base:

- React.
- Vite.
- TypeScript.
- Fuse.js.
- HashRouter.
- Generated catalog.
- Home.
- Explore.
- Skill detail.
- Stacks.
- Stack detail.
- Compare mode.
- FAQ.
- Contribute.
- Activity.
- Local favorites.
- Copy actions.
- GitHub deep links.
- GitHub Pages deployment.

Catalog snapshot for this handoff, indexed July 21, 2026:

- 67 public distribution skills.
- 11 active families.
- 2 placeholder family directories, excluded from the skill count.
- 18 project-local support skills under `.agents/skills/`, excluded from the public distribution catalog.
- 9 skills in the newly active `context-extraction` family.

The catalog must remain generated from repository content. Do not hardcode these numbers in the UI. Regenerate `forge/src/data/catalog.json` from `forge/scripts/build-catalog.js` during the app build so repository additions and improvements become visible automatically.

Preserve the working app. Do not replace it with a screenshot or a non-functional redesign.

Before changing code, inspect:

- forge/package.json
- forge/vite.config.ts
- forge/index.html
- forge/src/main.tsx
- forge/src/App.tsx
- forge/src/index.css
- forge/src/pages/
- forge/src/components/
- forge/src/utils/
- forge/src/data/
- forge/scripts/build-catalog.js
- .github/workflows/deploy-pages.yml
- AGENTS.md
- docs/PUBLIC_SURFACES.md
- docs/SKILLZ-FORGE-REPLIT-BUILD-DIRECTIVE.md

Remove stale starter files only after confirming they are unused.

## Product position

Skillz Forge should be the practical product layer beneath the OverKill Hill Prompt Forge.

Prompt Forge designs and hardens methods.

FoundRy packages methods into governed repository artifacts.

Skillz Forge helps visitors discover, inspect, combine, install, share, and improve those artifacts.

GitHub stores and governs the source.

The application must communicate this relationship in a subtle but visible way through the parent-brand lockup, footer, About or FAQ content, and contribution links.

## Product goals

The application must help a visitor:

1. Find a relevant skill from natural language.
2. Search by phrase, topic, tool, runtime, pattern, output, or family.
3. Understand what a skill does before opening raw Markdown.
4. Understand boundaries and non-goals.
5. See maturity, validation, source path, and freshness.
6. Copy a practical installation reference.
7. Explore companion skills.
8. Compose a stack.
9. Compare related skills.
10. Share a skill, stack, search, or comparison.
11. Open native GitHub issues, pull requests, Discussions, and source history.
12. Understand how to contribute safely.
13. Use the application without an account.
14. Recognize the product as part of OverKill Hill P³™.

## Non-goals

Do not:

- Build a paid marketplace.
- Require login for discovery.
- Build a replacement for GitHub.
- Claim authenticated comments if no secure backend exists.
- Place tokens or secrets in browser code.
- Add fake analytics or raw query logging.
- Invent tool/runtime metadata.
- Claim every skill is validated or production-ready.
- Use an Anthropic-specific brand system.
- Use purple AI gradients or generic SaaS dashboard patterns.
- Replace source content with manually duplicated catalog records.

## Information architecture

Required routes:

- /
- /explore
- /skills/:family/:skillName
- /stacks
- /stacks/:stackId
- /compare
- /faq
- /contribute
- /activity

The application may continue using HashRouter for GitHub Pages compatibility. If it does, all generated URLs must preserve:

https://okhp3.github.io/skillz/#/...

Never generate a share URL at:

https://okhp3.github.io/skills/...

The current share helpers must be repaired and centralized so every link uses the correct base and hash route.

## App shell and navigation

The application shell must visibly connect Skillz Forge to OverKill Hill.

Recommended wordmark:

OverKill Hill P³™ / Skillz Forge

The exact logo asset should come from the canonical OverKill Hill asset set where possible. Do not replace the established sentinel or wordmark with a generic colored square.

Recommended navigation:

- Explore
- Stacks
- Compare
- FAQ
- Contribute
- Activity
- View on GitHub

Include a subtle parent-brand route to https://overkillhill.com/ and a contextual Prompt Forge route to https://overkillhill.com/prompt-forge/.

The header must remain quiet and useful. Do not turn it into a dense dashboard toolbar.

The home first viewport must include:

- Parent brand or approved wordmark.
- Skillz Forge product name.
- Headline.
- Search field.
- Browse action.
- A concise explanation of SKILL.md.
- A clear path to GitHub.
- No fake statistics or pricing.

## Brand system

Use the canonical OverKill Hill design system as the authority:

https://github.com/OKHP3/OverKill-Hill/blob/main/assets/css/theme.css

Do not maintain a separate Playfair and Inter design system.

Use the canonical palette:

- Espresso: #2a2320
- Teal: #1c3a34
- Olive: #676a2c
- Ochre: #a06e28
- Rust: #5b3a27
- Orange: #c46a2c
- Amber: #e6a03c
- Paper: #f6f2ee
- Muted gray from the primary theme

Use the canonical typography:

- Alfa Slab One for major headings.
- DM Sans for body, controls, labels, and navigation.
- JetBrains Mono for paths, raw URLs, source references, and code.

Use a Skillz-specific application treatment within the parent system:

- Dark industrial workbench shell.
- Copper and amber primary actions.
- Deep teal structural surfaces.
- Bone or paper inspection panels.
- Thin blueprint rules.
- Controlled radius, not excessive rounded containers.
- Strong source and maturity treatment.
- Deliberate, low-noise transitions.
- Sentinel, raven, or forge imagery only where it supports hierarchy.

The visual direction should inherit the principles visible in the sibling applications:

- Mermaid Theme Builder uses real workbench modes, browser-first behavior, presets, previews, export, and explicit OKHP³ identity.
- BPMN for Mermaid uses honest status, experimental boundaries, documentation, Git-native language, and live playground surfaces.
- Abrahamic Reference Engine uses browse/lookup/compare modes, source lineage, and explicit scope.
- OverKill Hill provides the parent palette, wordmark, typography, forge metaphor, and project grammar.

Do not copy domain-specific styling from the sibling projects. Unify them under OverKill Hill.

## Design language

The application should feel like:

- An open-source workbench.
- A project dossier.
- A catalog with an editorial voice.
- A tool that respects source and limitations.
- A place where visitors can take something useful or join the work.

Prefer:

- Open result lists.
- Filter rails.
- Ruled sections.
- Source panels.
- Workbench bands.
- Tables for comparison.
- Single-purpose detail surfaces.
- Clear empty states.
- Readable code and metadata.

Avoid:

- Repeated bento cards.
- Fake KPI panels.
- Neon glows.
- Glass cards.
- Purple gradients.
- Excessive pills.
- Decorative icon walls.
- Anthropic-specific visual language.
- A second GitHub interface.

## Catalog generation and provenance

The SKILL.md files are the source of truth.

The application must generate its catalog deterministically from repository files during build or CI.

The generated catalog must include, when available:

- Name.
- Display name.
- Family.
- Path.
- Description.
- Version.
- License.
- Author.
- Homepage.
- Status.
- Maturity.
- Tags.
- Topics.
- Tools.
- Runtimes.
- Inputs.
- Outputs.
- Triggers.
- Boundaries.
- Avoid statements.
- Companions.
- Prerequisites.
- Examples.
- Last modified date.
- Source commit SHA.
- GitHub URL.
- Raw URL.

When metadata is missing, display Metadata pending or Unclassified. Never infer facts simply to fill a card.

The catalog root must include:

- generatedAt.
- sourceRepository.
- sourceRef.
- sourceCommit.
- skillCount.
- familyCount.

Expose a compact freshness indicator in Activity and skill detail surfaces.

The catalog generator must not include .agents/skills as public distribution entries unless the repository’s existing catalog rules explicitly include them. Follow AGENTS.md.

## Search and filters

Search must use deterministic local behavior and work without a paid AI API.

Index:

- Name.
- Display name.
- Description.
- Family.
- Category.
- Tags.
- Topics.
- Tools.
- Runtimes.
- Inputs.
- Outputs.
- Triggers.
- Boundaries.
- Companions.
- Examples.
- Relevant headings.

Search ranking:

1. Exact skill name.
2. Exact phrase in description or trigger language.
3. Structured tool, runtime, topic, pattern, or output match.
4. Heading or example match.
5. Family relevance.
6. Maturity only as a tie-breaker.

Support:

- Natural-language phrase search.
- Topic filters.
- Tool filters.
- Runtime filters.
- Pattern filters.
- Output filters.
- Family filter.
- Maturity filter.
- License filter.
- Has-examples filter.
- Sort by relevance.
- Sort alphabetically.
- Sort by family.
- Sort by maturity.
- Sort by last modified when data exists.

Persist search and filters in the URL.

Show:

- Result count.
- Current query.
- Active filters.
- Clear-all control.
- Why-this-matched explanation.

Empty state:

- Explain what was searched.
- Offer related families or topics when available.
- Provide a clear reset action.
- Never show a blank page.

## Skill detail page

The detail page must answer:

- What does this skill do?
- When should I use it?
- What does it produce?
- What should I not use it for?
- How do I install it?
- How mature is it?
- Where is the source?
- How can I contribute?

Required elements:

- Breadcrumb.
- Skill name.
- Family.
- Maturity state and explanation.
- License.
- Version, if available.
- Repository path.
- Last indexed commit.
- Last modified time, if available.
- Copy install action.
- Copy raw URL action.
- Open on GitHub action.
- Share action.
- Save action.
- What it does.
- Use this when.
- Do not use this when.
- Inputs.
- Outputs.
- Examples.
- Companions.
- Prerequisites.
- Compatibility.
- Limitations.
- Source summary or preview.
- GitHub contribution actions.
- Relevant FAQ links.

Mark any illustrative example clearly. Never represent a generated example as a tested execution result.

## Stacks and composition

Retain curated stacks as editorially authored workflows.

Each stack must show:

- Problem.
- Audience.
- Ordered steps.
- Required and optional skills.
- Inputs.
- Outputs.
- Purpose of each step.
- Installation order.
- Share action.
- Copy-all action.

Add local composition:

- Add a skill.
- Remove a skill.
- Reorder a skill where practical.
- Save locally.
- Copy a stack manifest.
- Copy all installation URLs.
- Share a hash-safe URL.

Do not require login for local stacks.

## Compare mode

Add a compare route for two to four skills.

Compare:

- Purpose.
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
- Source freshness.

Use an open comparison table or editorial comparison layout. Do not turn it into an analytics dashboard.

## FAQ and education

Retain and improve the FAQ.

Required subject groups:

- Agent Skills.
- Using Skillz.
- Trust and Safety.
- Contributing.

Required questions include:

- What is a SKILL.md?
- How is a skill different from a prompt?
- How is a skill different from an MCP server?
- Which agents can use these skills?
- What does composable mean?
- How do I install a skill?
- What does maturity mean?
- Why are companion skills needed?
- Can I use skills offline?
- How are skills validated?
- What should I do about a security concern?
- Should I open an issue or pull request?
- How do I propose a new skill?
- How do I add a worked example?

FAQ search must work locally.

## GitHub collaboration

The public application must remain GitHub-native.

Phase 1 deep links:

- Source file.
- Raw file.
- Commit history.
- Open issue.
- Open pull requests.
- Discussions.
- Security advisory.
- Prefilled bug issue.
- Prefilled new-skill issue.
- Prefilled improvement issue.

Explain the correct path for each contribution type.

The application must not pretend to create comments without authentication and a secure backend.

Design an optional future integration boundary for a least-privilege GitHub App. Candidate actions:

- Comment on an issue.
- Comment on a pull request.
- React to a comment.
- Create a branch.
- Open a pull request.
- Request review.
- Add labels.
- Resolve review threads.

Never expose:

- Personal access tokens.
- OAuth client secrets.
- GitHub App private keys.
- Cookies.
- Replit secrets.
- Private repository data.

## Activity and freshness

The Activity route must distinguish between:

- Generated catalog facts.
- Build timestamp.
- Source commit.
- Public GitHub activity.
- Planned integrations.

Do not call an alphabetical slice of the catalog recent activity.

Preferred implementation:

- Generate a public activity snapshot during GitHub Actions, or
- Use a cacheable public GitHub read endpoint.

Show:

- Last indexed.
- Source commit.
- Catalog size.
- Recent commits when available.
- Open pull requests.
- Enhancement issues.
- New skill proposals.
- Discussions.
- Releases.
- Last refresh or fallback state.

If GitHub cannot be reached, show generated catalog data and a direct GitHub link.

## Metadata and SEO

Update forge/index.html and route-level document titles.

Base title:

Skillz Forge | OverKill Hill P³™

Base description:

Find, inspect, compose, install, and improve reusable Agent Skills from the OverKill Hill P³™ forge.

Canonical:

https://okhp3.github.io/skillz/

Include:

- Charset.
- Responsive viewport.
- Author.
- Creator.
- Publisher.
- Robots.
- Canonical.
- Theme color.
- Color scheme.
- Open Graph title.
- Open Graph description.
- Open Graph URL.
- Open Graph image and alt.
- Twitter card.
- Twitter title.
- Twitter description.
- Twitter image and alt.
- Favicon.
- Manifest where supported.
- JSON-LD only for truthful entities.

Route titles should be meaningful:

- Explore Agent Skills | Skillz Forge
- skill-name | Skillz Forge
- Governed Mermaid Workflow | Skillz Forge
- Compare Skills | Skillz Forge
- FAQ | Skillz Forge
- Contribute | Skillz Forge

Hash routes must not produce broken or misleading share URLs.

## Google Analytics

Use the same GA4 property as the primary OverKill Hill site:

Measurement ID: G-VJ1BKXS27H

Initialize the tag once, preferably in forge/index.html or a single analytics module.

Because this is a React SPA, implement route-aware pageview tracking for initial load and hash-route changes.

Track these logical page surfaces:

- Home.
- Explore.
- Skill detail.
- Stacks.
- Stack detail.
- Compare.
- FAQ.
- Contribute.
- Activity.

Recommended events:

- skill_search.
- skill_filter_apply.
- skill_open.
- skill_copy_install.
- skill_copy_raw_url.
- skill_share.
- skill_save.
- stack_open.
- stack_compose.
- stack_copy_all.
- compare_open.
- faq_expand.
- github_handoff.
- contribution_path_open.

Use safe parameters:

- Public skill name.
- Family.
- Maturity.
- Filter type.
- Destination type.
- Stack ID.
- Action type.

Do not send raw search text. Query text can contain private or sensitive information. Use only safe aggregates such as query length bucket, result count bucket, filter type, and whether a search was submitted.

Do not send:

- Issue bodies.
- Comment text.
- Raw SKILL.md contents.
- Credentials.
- Tokens.
- Private URLs.
- Personal information.

Prevent duplicate pageviews from React StrictMode and duplicate event listeners. Document the event taxonomy in source.

## Technical architecture

Use React, Vite, and TypeScript.

Recommended boundaries:

- src/data for generated and curated data.
- src/pages for routes.
- src/components for reusable UI.
- src/utils for search, routing, GitHub, clipboard, sharing, analytics.
- src/types for catalog types.
- src/brand for OverKill Hill tokens and brand helpers.
- scripts for catalog and validation.

Keep App as composition glue.

Keep public discovery static and cacheable.

Keep future GitHub writes behind a secure API boundary.

## Routing and sharing

Preferred first implementation: keep HashRouter and repair all route helpers.

Every internal or copied URL must preserve:

https://okhp3.github.io/skillz/#/...

Required tests:

- Home route.
- Explore route.
- Skill detail route.
- Stack route.
- Compare route.
- FAQ route.
- Contribute route.
- Activity route.
- Reload after opening a copied URL.
- Open a shared URL in a fresh browser tab.

No helper may emit a route that drops /skillz/ or the hash.

## Deployment

Preserve .github/workflows/deploy-pages.yml.

The workflow must:

- Install dependencies in forge.
- Generate the catalog.
- Verify catalog counts and source provenance.
- Run typecheck and production build.
- Upload forge/dist.
- Deploy to GitHub Pages.
- Fail on broken routes or empty catalog.

Use /skillz/ as the Vite production base.

Do not add a backend requirement for public discovery.

## Accessibility and responsive behavior

Verify:

- 1440px desktop.
- 1024px tablet.
- 768px compact layout.
- 390px mobile.

Required:

- Keyboard-visible focus.
- Slash-to-search behavior.
- Escape handling.
- Accessible filter drawer.
- Accessible buttons and links.
- Meaningful empty states.
- Reduced motion.
- No horizontal overflow.
- Maturity not conveyed by color alone.
- Copy success feedback.
- Correct focus behavior for drawers or dialogs.
- Good line length and contrast.
- No console errors.

## Browser verification

Use browser-based verification, not build output alone.

Verify:

1. Home loads.
2. Search phrase returns the expected result.
3. Topic, tool, runtime, pattern, and output filters work when metadata exists.
4. Family and maturity filters work.
5. Empty state works.
6. Skill detail opens.
7. Copy install works.
8. Copy raw URL works.
9. Share URL works after reload.
10. Favorites persist locally.
11. Stack opens.
12. Stack composition works.
13. Compare opens.
14. FAQ search and expansion work.
15. GitHub links are correct.
16. Activity freshness is truthful.
17. Analytics loads once.
18. GA4 uses G-VJ1BKXS27H.
19. Raw search text is absent from analytics payloads.
20. Desktop and mobile layouts remain usable.

## Acceptance criteria

The application is complete only when:

- It is clearly a flagship OverKill Hill P³™ product.
- The parent wordmark and Skillz Forge identity are correctly related.
- The visual system uses the primary OverKill Hill tokens and typography.
- The app retains existing discovery functionality.
- Search supports phrase, topic, tool, runtime, pattern, and output discovery honestly.
- Catalog data is generated from repository content.
- Missing metadata is visible as missing.
- Detail pages expose use, boundaries, outputs, maturity, source, and contribution.
- Curated stacks and local composition work.
- Compare mode works.
- FAQ works.
- GitHub handoffs work.
- The app does not falsely claim live comments or authenticated collaboration.
- Shared links work on GitHub Pages.
- Metadata is correct.
- Google Analytics uses G-VJ1BKXS27H with route-aware SPA tracking.
- Raw user-entered search phrases are not sent to analytics.
- The build passes.
- The deployment passes.
- Browser QA passes on desktop and mobile.
- No Anthropic-specific or generic AI visual language remains.

## Replit delivery report

Provide:

- Product changes.
- Brand changes.
- Catalog changes.
- Routing changes.
- GitHub integration changes.
- Metadata changes.
- Analytics changes.
- Files changed.
- Build commands.
- Test commands.
- Browser QA results.
- Desktop and mobile results.
- Commit SHA.
- Live deployment URL.
- Known limitations.
- Intentional deviations from this PRD.
