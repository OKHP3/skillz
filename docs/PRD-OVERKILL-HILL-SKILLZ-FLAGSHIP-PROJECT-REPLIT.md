# PRD: OverKill Hill P³™ Skillz Flagship Project Page

## Replit build directive

Build the canonical Skillz project page inside the OKHP3/OverKill-Hill repository.

This is the public editorial and product page for the Skillz flagship project. It is not the Skillz Forge application itself. The application remains a separate React and Vite SPA hosted from the OKHP3/skillz repository at https://okhp3.github.io/skillz/.

The finished page must be a first-class member of the OverKill Hill project family. It must follow the same project-page grammar, metadata conventions, navigation, footer, visual tokens, typography, analytics, accessibility behavior, and validation gates as the existing project pages under https://overkillhill.com/projects/.

Skillz should be treated as a flagship project that expresses the full OverKill Hill thesis:

- Prompts become governed protocols.
- Protocols become reusable capabilities.
- Reusable capabilities become portable Agent Skills.
- Agent Skills become inspectable, versioned, composable repository artifacts.
- GitHub preserves the source, review, discussion, and collaboration record.

Do not build a generic SaaS landing page. Do not duplicate the catalog. Do not create a second application. Create the authoritative OverKill Hill project surface that explains the project and routes visitors into the real product.

## Project-page pattern to follow

The live project index describes the built-at-the-Hill category as hosted tools and documented builds designed, shipped, and maintained at OverKill Hill. It presents each project with:

- A breadcrumb trail.
- A compact project status row.
- A single project H1.
- A concise thesis statement.
- Primary live-tool, research, and source links.
- A visible embedded or linked live surface when appropriate.
- Problem framing.
- Project surfaces.
- Current release or progress.
- Honest scope and limitations.
- Features.
- Relationships to sibling projects and upstream technologies.
- Technical stack.
- User guidance or walkthrough content.
- Roadmap.
- Project information.
- Related links.
- Shared OverKill Hill header and footer.

Use the structure and tone of the existing pages, especially:

- https://overkillhill.com/projects/mermaid-theme-builder/
- https://overkillhill.com/projects/bpmn-for-mermaid/
- https://overkillhill.com/projects/

The Skillz page should be more central and more deeply integrated than a normal peer page. It should be the canonical explanation of the Agent Skills layer in the OverKill Hill ecosystem.

## Target routes

Create the canonical page at:

- /projects/skillz/index.html

Canonical public URL:

- https://overkillhill.com/projects/skillz/

Repair the project index so Skillz appears under the appropriate project category. It should not be hidden in an unrelated section or described as a minor utility.

Also add a project submenu entry if the current navigation pattern supports individual project links. Preserve the existing navigation order and use the exact product name Skillz Forge.

## Prompt Forge and FoundRy relationship

The page must make the relationship between Prompt Forge, FoundRy, Skillz Forge, and GitHub understandable without inventing a duplicate product surface.

Use this conceptual path:

Prompt Forge:
Designs and hardens prompts, protocols, audit contracts, and reusable AI workflows.

FoundRy:
Packages a reusable AI capability into a governed, inspectable repository artifact.

Skillz Forge:
Helps visitors discover, understand, install, compose, share, and improve those capabilities.

GitHub:
Stores the source, history, issues, pull requests, discussions, and review record.

Inspect the current OverKill Hill site for existing FoundRy routes and terminology before changing anything. If a FoundRy page already exists, link to it. If no FoundRy route exists, do not invent a large new FoundRy product page as part of this PRD.

The preferred canonical path remains:

- /projects/skillz/

If a safe alias is needed for a historical or conceptual reference, use a redirect-only path such as:

- /prompt-forge/skillz/
- /foundry/skillz/

Only create an alias when it does not conflict with an existing route. Each alias must redirect to /projects/skillz/ and must include a canonical URL and a visible fallback link. It must not contain duplicate SEO copy.

If the current site structure does not justify an alias, place a direct contextual link from Prompt Forge or the existing FoundRy reference to /projects/skillz/. The requirement is continuity, not proliferation of URLs.

## Goals

The page must:

1. Make Skillz discoverable from the main project index.
2. Explain Agent Skills and SKILL.md to a new visitor.
3. Establish Skillz as a flagship OverKill Hill project.
4. Explain why the project exists and what gap it addresses.
5. Show the relationship to Prompt Forge and FoundRy.
6. Link to the live Skillz Forge application.
7. Link to the OKHP3/skillz source repository.
8. Explain GitHub-native contribution paths.
9. Show honest maturity and release information.
10. Use the existing OverKill Hill project-page grammar.
11. Use the primary brand system, wordmark, typography, imagery, and analytics.
12. Pass the primary site validator and link checks.
13. Eliminate the current /projects/skillz/ 404 condition.

## Non-goals

Do not:

- Rebuild the Skillz Forge SPA in this repository.
- Embed a fake catalog or manually list every skill.
- Add authentication or GitHub write actions to the static site.
- Add pricing, testimonials, fake metrics, or SaaS conversion language.
- Rebrand Prompt Forge.
- Claim every skill is production-ready.
- Claim comments or pull requests are handled inside the page.
- Use private, employer-specific, credential-bearing, or speculative examples.
- Add a new JavaScript framework or npm workspace unless the primary site already requires it.
- Introduce a visual system separate from OverKill Hill P³™.

## Required page sections

### 1. Shared shell

Use the existing site header, navigation, forge update strip, skip link, footer, theme switch, and shared scripts.

The header must expose:

- OverKill Hill P³™ home link.
- The Forge.
- Our Projects.
- Writings.
- About.
- Existing search and theme controls where present.

The footer must use the existing OverKill Hill wording and social links. Do not create a project-specific footer.

### 2. Breadcrumb and project status

Use the established breadcrumb style:

- overkillhill.com
- projects
- skillz

The status row should be truthful. Suggested status language:

- Flagship Project
- Open Source
- Agent Skills Catalog
- Skillz Forge Live
- GitHub-Native
- Active Build

Do not use a status label that implies a release or maturity level that cannot be verified.

### 3. Hero

Use one H1:

Skillz Forge

Recommended supporting statement:

Reusable capabilities from the OverKill Hill P³™ forge.

Recommended body copy:

Skillz turns recurring AI methods into portable, inspectable, versioned SKILL.md contracts that agents can load, compose, and improve.

Primary action:

Enter Skillz Forge

Destination:

https://okhp3.github.io/skillz/

Secondary actions:

- View the source repository
- Return to Prompt Forge
- Explore the relationship to FoundRy, if a valid route exists

The hero must communicate product purpose immediately. Do not lead with a generic “AI skills marketplace” claim. Skillz is a public capability library and workbench, not a marketplace.

### 4. The problem

Explain the gap between:

- Disposable prompts that live in chat history.
- Prompt protocols that define operating conditions.
- Reusable skills that package methods for agents.
- GitHub repositories that preserve the method as a durable artifact.

Use OverKill Hill language, but keep it understandable to visitors who do not know the internal vocabulary.

Recommended thesis:

The prompt is not the artifact. The durable method is.

### 5. What is a SKILL.md?

Explain that a SKILL.md is a plain-text delegation contract for an AI agent.

Describe the fields and behaviors a visitor can expect:

- Activation triggers.
- Role and context.
- Inputs.
- Method.
- Boundaries.
- Outputs.
- Validation.
- Failure handling.
- Handoff.
- Companion skills.

Link to the live application and repository rather than reproducing the entire catalog.

### 6. What visitors can do

Describe only the currently verified application behavior:

- Search by task or phrase.
- Browse skill families.
- Filter by maturity.
- Inspect individual skills.
- Copy a raw installation URL.
- Save favorites locally.
- Explore curated stacks.
- Read the FAQ.
- Open native GitHub contribution paths.

Future capabilities must be labeled as planned or in development:

- Structured tool and runtime filters.
- Skill comparison.
- Live GitHub activity.
- Authenticated comments.
- Pull-request collaboration inside the application.

### 7. The flagship relationship map

Create an editorial process section showing:

Prompt Forge → FoundRy → Skillz Forge → GitHub

Use a simple visual band, ruled process diagram, or existing project-page motif. The section must explain that the same method moves through design, packaging, discovery, and collaboration.

The visual must be readable on mobile and must not become a decorative flowchart with no explanatory value.

### 8. Demonstration pathways

Use real Skillz repository examples. Suggested pathways:

- Governed Mermaid Workflow.
- Process Documentation Pipeline.
- New Skill Creation Pipeline.
- AI Conversation Capture and Repository Reconciliation.

For each pathway, show:

- The recurring problem.
- The relevant skill family.
- The resulting artifact.
- A link to the live Skillz Forge route or GitHub source.

Do not invent skill names, counts, maturity labels, or outputs.

### 9. Trust and maturity

Explain the maturity ladder:

Placeholder → Skeleton → Draftable → Usable → Validated → Published

Clarify that maturity reflects the current evidence and repository state. It is not a universal guarantee that every output will be correct.

Link to the relevant repository publishing, security, and authoring documentation.

### 10. GitHub-native collaboration

Explain the collaboration paths:

- Open an issue for a bug.
- Suggest a new skill.
- Report missing metadata or examples.
- Improve a trigger description.
- Open a pull request for a concrete change.
- Use Discussions for scope and design questions.
- Use security advisories for sensitive content.

Use native GitHub links. The page must not imitate GitHub’s issue interface.

### 11. Project surfaces

Present the project surfaces in the same spirit as the other flagship pages:

- Live application: https://okhp3.github.io/skillz/
- Source repository: https://github.com/OKHP3/skillz
- Catalog and generated data
- Skill authoring and validation documentation
- Curated stack model
- GitHub contribution surface

### 12. Honest scope

Include a clear Is and Is Not section.

Skillz Forge is:

- A public Agent Skills discovery workbench.
- A generated catalog of repository content.
- A way to inspect and install SKILL.md files.
- A way to compose curated or local skill stacks.
- A GitHub collaboration bridge.

Skillz Forge is not:

- A replacement for GitHub.
- An authenticated social network.
- A hosted agent runtime.
- A guarantee that every skill is production-ready.
- A marketplace requiring payment or account creation.
- A second Prompt Forge.

### 13. Technical stack

Describe the actual architecture accurately:

- React.
- Vite.
- TypeScript.
- Fuse.js or the current search implementation.
- Static generated catalog.
- GitHub Pages.
- Hash-based routing where applicable.
- GitHub as source of truth.

Do not claim server-side APIs, live GitHub polling, or authenticated collaboration unless those capabilities actually exist.

### 14. Roadmap

Use status markers consistent with sibling project pages.

Suggested roadmap:

Shipped:

- Public Skillz Forge application.
- Generated repository catalog.
- Phrase search.
- Family and maturity browsing.
- Skill detail pages.
- Curated stacks.
- FAQ.
- GitHub deep links.

Hardening:

- Brand alignment with OverKill Hill.
- Catalog provenance.
- Stable share URLs.
- Structured metadata.
- Analytics consistency.
- Activity freshness.

Planned:

- Compare mode.
- Custom local stack composition.
- Live GitHub activity.
- Issue and pull-request context panels.
- Secure authenticated collaboration.

### 15. Final CTA

Use existing OverKill Hill CTA patterns.

Required actions:

- Enter Skillz Forge.
- View OKHP3/skillz.
- Return to Prompt Forge.
- Contact OverKill Hill if a custom capability system is needed.

## Visual requirements

Use the canonical shared system from assets/css/theme.css.

Required identity:

- OverKill Hill P³™ spelling.
- Unicode superscript ³.
- Precision · Protocol · Promptcraft.
- Existing mechanical raven or sentinel assets where appropriate.
- Existing Alfa Slab One heading style.
- Existing DM Sans body style.
- Existing JetBrains Mono technical style.
- Existing espresso, teal, olive, ochre, rust, orange, amber, paper, border, and shadow tokens.

The Skillz page may have a distinct accent, but it must remain a controlled sub-brand within the OverKill Hill system.

The page should feel:

- Industrial.
- Editorial.
- Protocol-first.
- Inspectable.
- Open-source.
- Active and unfinished in a deliberate forge sense.
- More like a project dossier and working blueprint than a marketing funnel.

Avoid:

- Anthropic-specific styling.
- Purple gradients.
- Generic AI neon.
- Excessive rounded cards.
- Fake statistics.
- Large testimonial sections.
- Pricing.
- Decorative badges with no meaning.
- A duplicate app shell that competes with Skillz Forge.

## Metadata and SEO

Follow the metadata pattern of the existing project pages and primary homepage.

Recommended:

Title:
Skillz Forge | OverKill Hill P³™

Description:
Skillz Forge is the flagship OverKill Hill P³™ workbench for discovering, inspecting, composing, installing, and improving reusable Agent Skills.

Canonical:
https://overkillhill.com/projects/skillz/

Open Graph:

- og:title matching the page title.
- og:description matching the page description.
- og:type website.
- og:url canonical page.
- og:site_name OverKill Hill P³™.
- og:image using an actual OverKill Hill asset.
- og:image:alt describing the asset.

Twitter:

- summary_large_image.
- Title, description, image, image alt.
- Existing OverKill Hill account fields where used by the primary site.

Also include:

- Author, creator, publisher.
- Robots.
- Googlebot.
- Theme color.
- Color scheme.
- English hreflang.
- WebPage JSON-LD.
- SoftwareApplication JSON-LD only if the live application is described accurately.
- BreadcrumbList JSON-LD if the existing site uses it.

Update sitemap.xml if required by the repository. Do not add redirect-only aliases as duplicate canonical pages.

## Google Analytics

Use the same GA4 measurement ID and initialization pattern as the primary site:

G-VJ1BKXS27H

Load the Google tag once. Reuse the existing primary-site initialization conventions if they are available in shared scripts or templates.

Recommended page-level events:

- skillz_project_cta_click
- skillz_live_app_open
- skillz_github_open
- skillz_prompt_forge_open
- skillz_contribute_open

Use stable destination categories. Do not send raw user-entered content, issue bodies, personal information, credentials, or private URLs.

Confirm the page does not double-count clicks because of duplicated listeners.

## Accessibility and responsive behavior

Preserve the primary-site accessibility patterns.

The page must:

- Have one H1.
- Use semantic sections.
- Preserve skip navigation.
- Use descriptive links.
- Provide visible keyboard focus.
- Use alt text for meaningful images.
- Mark decorative images correctly.
- Maintain heading order.
- Support reduced motion.
- Maintain contrast in dark and light modes.
- Avoid horizontal overflow.

Verify:

- 1440px desktop.
- 1024px compact desktop.
- 768px tablet.
- 390px mobile.

## Implementation rules

Use the existing static-site architecture.

Preferred files:

- projects/skillz/index.html
- Existing shared assets/css/theme.css
- Existing shared assets/js/app.js
- Existing site templates and asset paths
- projects/index.html
- prompt-forge/index.html if a contextual link is needed
- sitemap.xml if required

Do not add a React app to OverKill-Hill for this page.

Do not use a hard-coded catalog. Link to the application and repository.

## Validation

Run:

- The primary site validator.
- The site audit or link checker.
- Any existing HTML or metadata checks.

Verify:

1. /projects/skillz/ returns 200.
2. The project index links to it.
3. The main navigation exposes it where appropriate.
4. Prompt Forge has a working contextual link.
5. Any FoundRy alias resolves safely or is omitted with a documented reason.
6. The live Skillz Forge link is correct.
7. The GitHub repository link is correct.
8. Canonical metadata is correct.
9. Open Graph metadata is correct.
10. GA4 loads once with G-VJ1BKXS27H.
11. Desktop and mobile layouts are usable.
12. No private or speculative claims appear.
13. The page looks like an OverKill Hill project page, not a peer catalog microsite.

## Acceptance criteria

The build is complete only when:

- Skillz appears as a flagship project on the Projects index.
- The canonical project page is live at /projects/skillz/.
- The page follows the same grammar as the existing project pages.
- The page explains the project’s purpose and technical thesis.
- Prompt Forge and FoundRy references route visitors toward Skillz without creating duplicate canonical pages.
- The live SPA and GitHub source are one click away.
- The page uses the canonical OverKill Hill brand system.
- The page uses the same GA4 measurement ID and metadata discipline.
- The page passes the primary site’s validation checks.
- The page does not overclaim shipped functionality.

## Replit delivery report

Report:

- Files changed.
- Routes created.
- Redirect aliases created or intentionally not created.
- Project index changes.
- Prompt Forge or FoundRy link changes.
- Metadata values.
- Analytics events.
- Validation commands and results.
- Desktop and mobile QA results.
- Commit SHA.
- Live URL.
- Remaining limitations.
