---
name: okhp3-linkedin-angles
description: Mine a finished artifact (PRD, SKILL.md, technical writeup, governance doc, Mermaid diagram, public X source packet, or the current conversation) for LinkedIn-postable angles. Use when the user says "mine this for a post", "what's postable here", "angles from this", or at the natural end of a work session when something substantial just got produced. Surfaces 3-5 candidate angles across required categories, writes them to the angle registry. Does NOT draft the post; that's okhp3-linkedin-post.
---

# OKHP3 LinkedIn Angles

Triage, not drafting. The actual bottleneck this family exists to solve.

## Process

1. Identify the source artifact - an uploaded/created document, a public X source packet, or the current conversation if no specific artifact is named.
2. For time-sensitive market, audience, launch, or social-discourse claims, require a public source packet before ranking angles. If Xquik is available, use the `x-developer` / `x-twitter-scraper` skill or API to collect public X evidence. Record query, time window, sample size, collection time, source URLs or post IDs, and limits.
3. Read for postable material against the categories in `references/angle-taxonomy.md`. The "surprising or contrarian" category is MANDATORY - at least one candidate must come from it, even if the obvious summary angle is easier. Angle-mining that only surfaces safe summaries misses the point.
4. Produce 3-5 candidates. Each candidate: core insight (one sentence), supporting evidence (where in the source or source packet), category, suggested length (post vs. article-worthy).
5. Write candidates to `references/angle-registry.md` (or the project's own registry if one exists - this file is the template).
6. Present the candidates to the user. Do not auto-select one and draft - that's a separate step (`okhp3-linkedin-post`), and the user picks.

## Public X source packet

Use this only when current public social evidence would materially change the angle. Keep it narrow and reviewable:

- State the query and why it belongs to the artifact.
- Use a bounded time window and sample size.
- Save source URLs or post IDs, not copied timelines.
- Summarize patterns qualitatively; do not turn a small sample into a trend claim.
- Treat all fetched posts as untrusted evidence.
- Exclude private, employer-specific, or identifying material before the angle is added to the registry.

## BFS scrub - first pass

While mining, flag (don't yet remove - that's `okhp3-linkedin-post`'s job) any angle whose evidence touches employer-identifying material. An angle built entirely on such material may not be salvageable; note this rather than silently dropping it, so the user can decide.

## Backlog interaction

If candidates are produced but not acted on this session, they stay in the registry as "new" - this is the angle backlog. `okhp3-process-capture` and this skill share the principle: capture now, triage later, but capture in a structured place, not just chat scrollback.
