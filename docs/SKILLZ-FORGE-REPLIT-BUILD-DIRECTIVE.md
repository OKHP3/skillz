# Skillz Forge: Replit Build-Out Directive

## Instruction to the builder

Build a polished, production-oriented React and Vite web application called **Skillz Forge** for the public `OKHP3/skillz` repository.

Skillz Forge is the human-facing discovery, evaluation, composition, installation, sharing, and contribution surface for reusable Agent Skills stored as `SKILL.md` files. It should make the repository feel like a living open-source workbench rather than a folder of Markdown files.

The application is intended to be hosted from the same GitHub repository as the skills. Treat GitHub as the source of truth for skill files and repository state. Treat the SPA as a generated, read-friendly index and collaboration bridge. Do not create a separate manually maintained catalog that can drift from the repository.

The product relationship is:

- Prompt Forge is the place where prompts and AI systems are designed, tested, governed, and hardened.
- Skillz Forge is the place where the resulting reusable capabilities are discovered, understood, composed, installed, shared, and improved.

The central promise is:

> Stop searching for prompts. Start finding reusable capabilities.

The application must be useful to a visitor who knows nothing about Agent Skills and still be valuable to an experienced developer who wants to inspect a `SKILL.md`, copy an installation command, compare related skills, or contribute through GitHub.

Do not build a generic SaaS dashboard, a fake analytics product, or a second GitHub clone. Build a focused, editorially designed open-source discovery workbench.

## Repository context

The repository is `OKHP3/skillz`. It contains Agent Skills in ten active families, plus placeholder directories and project-local support skills. The root `AGENTS.md` is the routing index. The root `README.md` is the human catalog. The `docs/` directory contains public-surface, publishing, security, roadmap, and architecture guidance.

The repository currently includes families such as:

- `abrahamic`
- `community`
- `lifetrkr`
- `linkedin`
- `mermaid`
- `notion`
- `process-capture`
- `refolddec`
- `agent-foundry`
- `universal`

The repository includes 58 distribution skills in the current local catalog. Some descriptions and metadata are more complete than others. The UI must represent maturity honestly. Do not imply that every skill is equally complete, tested, or production-ready.

The current maturity model is:

1. Placeholder
2. Skeleton
3. Draftable
4. Usable
5. Validated
6. Published

Where repository metadata is incomplete, show `Metadata pending` or `Unclassified` rather than inventing a maturity claim.

## Product objectives

The completed product should help a visitor:

1. Find a skill by natural-language task, phrase, topic, tool, runtime, pattern, output, or family.
2. Understand what a skill does before opening raw Markdown.
3. See when the skill should be used and when it should not be used.
4. Inspect inputs, outputs, companion skills, examples, validation, maturity, license, and source.
5. Copy a practical installation command for a compatible agent environment.
6. Compose related skills into a useful stack or workflow.
7. Share a skill, stack, search, or filtered catalog view through a stable URL.
8. Move naturally into native GitHub issues, pull requests, discussions, comments, and source files.
9. Learn what Agent Skills are through a well-structured FAQ and guided examples.
10. Contribute an improvement without needing to understand the entire repository first.

The primary visitor loop is:

```text
Find a task
  -> discover a skill
  -> understand the fit
  -> inspect proof and limits
  -> install or copy it
  -> combine it with related skills
  -> contribute feedback
  -> share the result
```

## Required application surfaces

### Home and discovery surface

The first screen should immediately present the product as a task-finding tool.

Use this exact primary headline:

> Find the skill for the work in front of you.

Supporting copy:

> Search the open catalog of reusable agent capabilities. Filter by what matters to your task, then open, stack, install, and ship.

The first viewport must include:

- Skillz Forge wordmark and small forge-inspired mark.
- Quiet navigation links: `Explore`, `Stacks`, `FAQ`, `Contribute`.
- One clear GitHub action: `View on GitHub`.
- A large natural-language search field.
- Search placeholder: `document a messy business process`.
- A `Browse all skills` action.
- A compact explanation of what a `SKILL.md` is.
- A visible path or query context so users understand where they are.
- A search results region that becomes useful immediately.

Do not lead with a large marketing statement, fake metrics, pricing, testimonials, or decorative feature cards. The product itself is the hero.

### Explore catalog

Create a dedicated exploration experience with:

- Search by phrase.
- Search by topic.
- Search by tool or runtime.
- Search by workflow pattern.
- Search by output type.
- Search by family.
- Search by maturity.
- Search by license.
- Search by availability of examples.
- Sorting by relevance, alphabetical order, recently changed, maturity, and family.
- Result count.
- Clear all filters.
- URL-persisted search and filters.
- Keyboard focus shortcut using `/` where it does not conflict with browser behavior.
- Escape to clear or close transient search UI.

Use a left filter rail on desktop and a filter drawer or bottom sheet on mobile. Use open list rows rather than a generic grid of cards. Each result row should feel like a catalog entry with enough information to make a decision.

Every result should show:

- Skill name.
- Family.
- Short description.
- Trigger examples.
- Maturity state.
- Primary output type.
- Compatible tool or runtime hints.
- A link to open the skill.
- A copy-install action.
- A share action.
- A favorite or save action stored locally in the browser.

When a search returns no results, explain how the search was interpreted and offer related topics, families, or patterns. Do not show a blank screen.

### Natural-language search behavior

The initial release must work without a paid AI API and without a backend. Use a generated local search index and deterministic ranking.

The index should search across:

- Skill name.
- Family name.
- Description.
- Frontmatter metadata.
- Full trigger language.
- Headings within the skill.
- Tools and runtimes.
- Inputs and outputs.
- Companion skills.
- Examples and anti-pattern language.
- Synonyms for common terms.

Ranking guidance:

1. Exact skill-name match.
2. Exact phrase match in the description or trigger language.
3. Match in structured topics, tools, outputs, or patterns.
4. Match in headings or example text.
5. Family relevance.
6. Maturity and validation as a tie-breaker only, never as a way to hide less mature skills.

For each result, expose a brief `Why this matched` explanation. Example:

> Matches “document a messy business process” because this skill captures process boundaries, assumptions, and structured intake outputs.

Use a client-side search library only if it materially improves ranking. Keep the index static and cacheable. Do not call an LLM for every search.

### Skill detail page

Every skill must have a stable route based on its family and name.

The detail page must answer these questions above the fold:

1. What does this skill do?
2. When should I use it?
3. What does it produce?
4. What should I not use it for?
5. How do I install it?

Recommended page structure:

- Breadcrumb: `Explore / Family / Skill`.
- Skill name.
- Plain-language description.
- Family and maturity.
- Repository path.
- Version, license, and last indexed commit.
- Primary actions: `Copy install`, `Copy raw URL`, `Open on GitHub`, `Share skill`.
- `Use this when` section with trigger examples.
- `Do not use this when` section with boundaries.
- Inputs and outputs.
- Worked example.
- Sample invocation or user request.
- Expected result description.
- Related and prerequisite skills.
- Composable workflow visualization or ordered skill chain.
- Compatibility table for Claude, Codex, Copilot, Cursor, Gemini, OpenClaw, and other supported runtimes when metadata permits.
- Validation and maturity explanation.
- Known limitations.
- Source preview with syntax highlighting and a link to the full raw file.
- GitHub activity panel with open issues, pull requests, and recent changes.
- Contribution prompt: `Found a problem or missing example? Open an issue.`
- FAQ links relevant to the skill.

Never present generated sample output as if it were a tested result. Label illustrative content clearly.

### Skill stacks

Create a first-class `Stacks` route for curated combinations of skills.

Initial stacks should include:

#### Governed Mermaid workflow

Core -> architecture, BPMN, or data domain -> theme builder -> update or repair -> publish.

#### Process documentation pipeline

Process intake -> stakeholder mapping -> process narrative -> gap and exception analysis -> measures and controls -> SOP or work instructions -> validation -> publication and handoff.

#### LinkedIn content pipeline

Angles -> post drafting -> final voice filter.

#### New skill creation pipeline

Process capture -> skill creation -> validation -> cataloging -> publication.

#### AI conversation capture pipeline

Conversation capture -> extract and route -> deduplicate -> reconcile against GitHub and Notion.

Each stack needs:

- A clear problem statement.
- The intended audience.
- Ordered steps.
- Skills used at each step.
- Why the order matters.
- Inputs and outputs between stages.
- A `Copy all install commands` action.
- A shareable URL.
- Links to individual skills.
- A note about which steps are optional extensions.

Make stacks feel like recipes and operating patterns, not just arrays of links.

### FAQ and learning center

Create a searchable FAQ organized into these groups:

#### Agent Skills

- What is a `SKILL.md`?
- How is a skill different from a prompt?
- How is a skill different from an MCP server?
- Which agents can use these skills?
- What does composable mean?

#### Using Skillz

- How do I install one skill?
- Can I install only part of a family?
- What does the maturity label mean?
- Why does one skill require another skill first?
- Can I use these skills offline?
- How do I know whether a skill is finished?

#### Trust and safety

- Where does skill content come from?
- Does Skillz collect data?
- Can a skill contain credentials or employer material?
- How are skills validated?
- What does the MIT license mean?
- What should I do if a skill contains a security problem?

#### Contributing

- Should I open an issue or pull request?
- How do I suggest a new skill?
- How do I improve a trigger description?
- How does a skill become published?
- How can I add a worked example?

FAQ answers should link to the relevant repository documentation, especially `AGENTS.md`, `docs/SECURITY.md`, `docs/PUBLISHING.md`, and `docs/PUBLIC_SURFACES.md`.

### Contribute surface

Create a contribution page that turns common improvements into obvious actions:

- Report a bug.
- Suggest a new skill.
- Improve a description or trigger phrase.
- Add a worked example.
- Propose a companion skill relationship.
- Report a security or privacy concern.
- Review an open pull request.

For each action, explain whether the user should:

- Open a GitHub issue.
- Start a discussion.
- Create a branch and pull request.
- Edit a file locally.

Use prefilled GitHub issue links for the initial release. The user should see the intended title, body, skill name, repository path, and environment before leaving the SPA.

### Activity surface

Create a lightweight activity panel or route showing:

- Recent catalog update.
- Recent commits touching skill files.
- New or updated skills.
- Open pull requests.
- Issues labeled as enhancement, documentation, example, or validation.
- Recent releases when they exist.

Activity must link to native GitHub pages. Do not build a replacement issue tracker.

## GitHub integration boundaries

The application should be GitHub-native, not GitHub-shaped.

### Read-only behavior for the initial release

Implement these as deep links or public read-only data:

- View repository.
- View source file.
- View raw `SKILL.md`.
- View family directory.
- View commits for a skill.
- View open issues.
- View pull requests.
- View discussions.
- Open a prefilled issue.
- Open a new pull request page with contribution guidance.

If live GitHub API data is used, show a small freshness indicator and provide a graceful fallback to generated catalog data.

### Authenticated behavior for a later phase

Do not place a personal access token, OAuth client secret, or GitHub App private key in the browser.

If authenticated actions are implemented later, use a GitHub App with least-privilege permissions and a secure token exchange or serverless boundary. Candidate later actions include:

- Comment on an issue.
- Comment on a pull request.
- React to a discussion or issue comment.
- Subscribe to a skill or family.
- Create a branch.
- Open a pull request from a generated improvement.

The app must remain useful without login. Authentication should enhance contribution, not gate discovery.

## Content and catalog model

Create a generated catalog artifact from repository files. The catalog should be regenerated during build or through an explicit repository script.

Each skill record should support these fields when present:

- `name`
- `displayName`
- `family`
- `path`
- `description`
- `version`
- `license`
- `status`
- `maturity`
- `tags`
- `topics`
- `tools`
- `runtimes`
- `patterns`
- `inputs`
- `outputs`
- `triggers`
- `avoid`
- `companions`
- `prerequisites`
- `examples`
- `validation`
- `lastModified`
- `commitSha`
- `rawUrl`
- `githubUrl`

Where the current repository does not expose a field consistently, derive only what can be derived safely from the existing text. Mark inferred values internally and do not turn them into strong public claims.

The application should be designed so future metadata enrichment can happen without a major UI rewrite. Add a clear fallback for missing fields.

## Visual design direction

Use a distinctive OverKill Hill forge aesthetic translated into a modern open-source developer tool.

### Visual character

- Deep charcoal or near-black background.
- Warm bone-white content surfaces.
- Copper-orange and ember-red accents.
- Muted steel-blue secondary text.
- Thin industrial rules and precise separators.
- Restrained paper or metal texture only where it improves atmosphere.
- Generous whitespace.
- Low-to-medium density.
- Editorial serif headline paired with a precise geometric sans for controls and metadata.
- Quiet, purposeful motion.

The visual metaphor is a working forge: materials are inspected, shaped, tested, and released. Avoid literal fantasy, excessive ornament, and generic AI neon aesthetics.

### Typography

Use a strong editorial serif for major display headings and a highly legible sans-serif for body text, controls, labels, code, and metadata.

Define a deliberate type scale for:

- Display heading.
- Page heading.
- Section heading.
- Body copy.
- Result title.
- Metadata.
- Code and install commands.
- Buttons and filters.
- Mobile navigation.

Do not rely on browser-default control typography.

### Layout principles

- Prefer open lists, rails, bands, tables, and a single purposeful detail panel.
- Avoid nested cards and a default bento grid.
- Avoid excessive rounded containers.
- Keep the main search task visually dominant.
- Use desktop filter rails and mobile drawers.
- Preserve a clear reading line for long descriptions and source previews.
- Use visible focus states and strong contrast.

### Component motifs

Use a small, coherent family of reusable motifs:

- Forge mark and wordmark.
- Copper active navigation rule.
- Catalog result row with vertical information columns.
- Bone-white note panel.
- Thin ruled section divider.
- Maturity indicator with accessible text, not color alone.
- Copy action with an explicit success state.
- Stack chain with ordered stage connectors.
- GitHub action group.

Do not add decorative badges, fake stats, or visual noise unless they communicate actual product structure.

### Motion

Use motion sparingly:

- Search result transition when filters change.
- Copy confirmation.
- Filter drawer open and close.
- Stack stage reveal.
- Subtle active navigation transition.

Respect `prefers-reduced-motion`.

## Required interaction behavior

The app must feel functional even when running entirely from static data.

Implement:

- Search input state.
- URL-synchronized search query.
- URL-synchronized filters and sorting.
- Clear search.
- Filter selection and reset.
- Expandable filter groups.
- Result hover, focus, and selected states.
- Copy install command.
- Copy raw URL.
- Share skill or stack link using the Web Share API with clipboard fallback.
- Local favorites or saved skills using local storage.
- Compare up to three skills.
- Expand and collapse FAQ entries.
- Filter FAQ search.
- Mobile navigation drawer.
- Mobile filter drawer.
- Accessible focus management when drawers or dialogs open.
- Clear success and error messages for copy actions.

Do not ship inert controls. If an action is not available in the current phase, make it an explicit link or provide a clear explanation.

## Responsive requirements

### Desktop

- Full filter rail.
- Multi-column result rows.
- Detail note panel.
- Stack visualization with readable stage labels.
- Source preview and metadata side-by-side where practical.

### Tablet

- Collapsible filter rail.
- Two-column result information where readable.
- Preserve search prominence.

### Mobile

- Search remains the primary entry point.
- Filters move into a drawer or bottom sheet.
- Result rows become readable vertical entries.
- Copy and open actions remain reachable without horizontal scrolling.
- Navigation becomes a simple menu.
- Detail page sections stack in a sensible order.
- Code blocks scroll horizontally without breaking the page.

Verify at a small mobile viewport and a desktop viewport. No horizontal overflow should appear in normal use.

## Accessibility requirements

Build to WCAG-minded standards:

- Semantic landmarks.
- One clear H1 per route.
- Proper heading order.
- Keyboard navigation for all controls.
- Visible focus styles.
- Label every input.
- Use live regions for copy and filter result updates.
- Do not communicate maturity or status by color alone.
- Sufficient contrast for charcoal, bone, copper, and muted text combinations.
- Respect reduced motion.
- Buttons for actions, links for navigation.
- Accessible disclosure buttons for FAQ and filters.
- Meaningful empty states.

## Architecture expectations

Use React and Vite unless the hosting environment imposes a clear constraint.

Structure the code as a strong front-end engineer would:

- App shell.
- Route components.
- Search and filter state helpers.
- Catalog data loader.
- Search index adapter.
- GitHub URL helpers.
- Clipboard and share helpers.
- Reusable buttons, links, disclosures, result rows, metadata blocks, maturity markers, and panels.
- Feature-specific modules for Explore, Skill Detail, Stacks, FAQ, Contribute, and Activity.
- Central design tokens.
- Separate static sample data from view components.

Keep the root app component as composition glue. Do not place the entire application in one monolithic component.

Create a clear boundary between:

- Generated catalog content.
- Local UI state.
- Future live GitHub data.
- Future authenticated write actions.

## Suggested routes

Use routes equivalent to:

- `/`
- `/explore`
- `/explore?q=...&family=...`
- `/skills/:family/:skillName`
- `/stacks`
- `/stacks/:stackName`
- `/compare`
- `/faq`
- `/contribute`
- `/activity`

Every meaningful state should be shareable through the URL where possible.

## Initial content examples

Use actual repository skill names where available. Initial examples should include:

- `okhp3-process-intake-and-scope`
- `okhp3-process-narrative-authoring`
- `okhp3-visual-process-modeling`
- `okhp3-mermaid-core`
- `okhp3-mermaid-bpmn`
- `okhp3-mermaid-architecture`
- `okhp3-mermaid-theme-builder`
- `okhp3-mermaid-repair`
- `okhp3-linkedin-angles`
- `okhp3-linkedin-post`
- `okhp3-linkedin-voice`
- `okhp3-process-capture`
- `okhp3-skill-cataloger`
- `okhp3-skill-foundry`
- `okhp3-vite-github-pages`
- `okhp3-notion-capture-router`

Use real descriptions from the repository where possible. Do not invent production claims or test results.

## Copy and tone

Voice:

- Clear.
- Curious.
- Practical.
- Slightly forge-like, but not theatrical.
- Confident without overselling maturity.
- Friendly to newcomers and precise enough for experts.

Use language such as:

- `Reusable delegation contracts.`
- `Evidence-backed. Composable. Installable.`
- `Open the source.`
- `See when to use it.`
- `Build a stack.`
- `Improve the contract.`
- `Find the next useful capability.`

Avoid:

- `Revolutionary`.
- `Game-changing`.
- `AI-powered` as empty decoration.
- Fake performance numbers.
- Claims that every skill is production-ready.
- Claims that the app replaces GitHub.

## Trust, privacy, and security

The public browser experience should not require an account.

The initial release must not collect user task text, search text, or skill favorites remotely. Search and favorites can remain local to the browser.

Do not include:

- Credentials.
- Personal access tokens.
- OAuth secrets.
- Employer-confidential examples.
- Private URLs.
- Cookies or hidden network calls.

If live GitHub APIs are used, make the request boundary and data freshness clear. If a GitHub API request fails, fall back to generated content and link users to GitHub.

## SEO and sharing

Each route should have:

- Descriptive title.
- Description.
- Canonical URL strategy.
- Open Graph title and description.
- Shareable preview treatment.
- Human-readable path.

Create static, indexable content for important use cases such as:

- Find an Agent Skill for Mermaid diagrams.
- Document a business process with Agent Skills.
- Turn a recurring workflow into a reusable skill.
- Create a LinkedIn content pipeline.
- Install skills for Claude, Codex, Copilot, Cursor, Gemini, or OpenClaw.

Do not generate dozens of thin SEO pages. Every public route should provide real explanatory value.

## Verification requirements

Before considering the application complete:

1. Run the production build.
2. Verify the app loads from the intended deployment base path.
3. Verify direct navigation to deep routes works on GitHub Pages or the selected host.
4. Test search with at least five representative phrases.
5. Test each filter group.
6. Test empty search results.
7. Test copy install and copy URL actions.
8. Test share fallback when Web Share is unavailable.
9. Test FAQ expansion and search.
10. Test skill detail navigation.
11. Test stack navigation and copy-all install behavior.
12. Test GitHub links.
13. Test desktop, tablet, and mobile layouts.
14. Check keyboard navigation and focus states.
15. Check reduced motion.
16. Check for horizontal overflow.
17. Check that no buttons are inert.
18. Check that all visible skill claims match repository content.
19. Check that loading and error states are useful.
20. Check that generated catalog freshness is visible.

Capture a visual QA screenshot of the primary desktop Explore state and the primary mobile state. Compare them against the approved design direction. Fix visible issues involving spacing, typography, colors, responsive behavior, button states, overflow, and hierarchy before handoff.

## Acceptance criteria

The first complete build is acceptable only when all of the following are true:

- A new visitor can understand what Skillz Forge is in under ten seconds.
- A visitor can find a relevant skill from a natural-language task in under one minute.
- Search and filters work together and persist in the URL.
- A skill detail page provides use cases, boundaries, output, maturity, source, install path, and related skills.
- A visitor can copy an installation command without opening raw Markdown.
- A visitor can share a skill or stack with a stable URL.
- A visitor can move to GitHub to inspect source, open an issue, or review a pull request.
- The app does not require login to discover or install public skills.
- Maturity and validation claims are honest and traceable.
- The app is responsive and accessible.
- The visual identity feels like OverKill Hill rather than a generic AI dashboard.
- The catalog is generated from repository content and does not require hand-maintaining duplicate skill records.
- The app has a clear empty state, error state, and freshness state.
- The production build succeeds.

## Recommended delivery phases

### Phase 1: public catalog MVP

- App shell and visual system.
- Generated catalog.
- Search and filters.
- Skill detail routes.
- Copy install and share actions.
- FAQ.
- GitHub deep links.
- Responsive and accessible behavior.

### Phase 2: stacks and activity

- Curated stacks.
- Compare skills.
- Local favorites.
- Recent catalog activity.
- Recent commits and GitHub metadata.

### Phase 3: collaboration bridge

- Prefilled issue flows.
- Discussion and PR discovery.
- Better contribution templates.
- Optional GitHub App authentication.

### Phase 4: guided intelligence

- Explain why a skill matched.
- Recommend companion skills.
- Generate a stack from a stated task.
- Suggest missing metadata or examples.

Keep Phase 4 optional. The product must be useful and trustworthy without an AI recommendation layer.

## Final product standard

Build something that makes a visitor want to browse one more skill, then one more stack, then open the source.

The site should feel like walking into a well-organized forge: the tools are visible, the materials are labeled, the work is inspectable, the process is understandable, and the visitor can either take something useful or join the workbench.

Do not stop at a landing page. Deliver a usable discovery workbench with real local state, real repository-informed content, real GitHub handoffs, and a visual system that could become the canonical public face of `skillz` under the OverKill Hill project surface.

