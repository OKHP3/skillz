# Promotion Strategy — 2026-08-06

Status: draft, owner-review pending. Not authorization to publish, tag a release, or commit to a GitHub/LinkedIn cadence — this is the decision record from the 2026-08-06 planning conversation.

## Where things actually stand

Pulled from `skillz.manifest.json` and `docs/PUBLISHING.md` at time of writing:

- 113 distribution skills, 15 active families.
- Maturity counts: `draftable: 87`, `skeleton: 25`, `usable: 1`. Zero validated, zero published.
- `version: 0.0.0-unreleased` — no release tag exists.
- `docs/PUBLISHING.md` already gates this: *"Do not promote a skill because a folder exists."*
- The overkillhill.com dossier is confirmed stale as of 2026-08-05 (75 skills / 12 families shown vs. the repo's real 113 / 15).

## Executive summary

- Competitive/landscape review is worth doing — it calibrates whether the BPMN-aware-Mermaid and LinkedIn-angle-mining claims are actually differentiated, and it surfaces where to submit once something is promotion-ready.
- The catalog is not promotion-ready by its own written gate. 1 usable skill out of 113 is a credibility risk if a reviewer opens three random folders.
- `docs/BACKLOG.md` already sets the promotion order: Mermaid trio (`core` → `bpmn` → `publish`) first, `okhp3-linkedin-angles` second. Don't reorder it without a reason.
- The LinkedIn tooling for this exact job already exists: `okhp3-linkedin-angles` → `okhp3-linkedin-post` → `okhp3-linkedin-voice`, with a BFS-scrub gate as the final pass.
- Stars and follows come from one real thing working, not from a catalog count. Leading with "113 skills" invites someone to go looking for the 87 that are draft-grade.
- The dossier drift is self-inflicted and should be fixed before pointing anyone at overkillhill.com.

## Options considered

| Option | What it is | Tradeoff |
|---|---|---|
| Full-catalog push now | Promote the repo as-is, all 113 skills, drive traffic broadly | Fast, but violates the repo's own `PUBLISHING.md` gate and risks a "this is mostly stubs" reaction from the first serious reviewer |
| Gated prestige path | Finish maturing the Mermaid trio to Usable/Validated, cut v0.1.0, promote that slice hard, let the rest trail as roadmap | Slower, but matches the plan already written in `BACKLOG.md` and survives scrutiny |
| Build-in-public now, ship later | Start LinkedIn presence and competitive scan immediately, tied to real milestones as they land, hold the "go look at the repo" CTA until the trio ships | Builds audience during the gap instead of after it; requires discipline not to overclaim in the meantime |

## Recommendation

Gated prestige path plus build-in-public, run concurrently.

Start showing up on LinkedIn now — post about work in progress, architecture decisions, the BPMN differentiation claim, the Forge maturity audit itself. Don't point people at the full catalog yet. Save the "here's the repo, go star it" CTA for when the Mermaid trio clears Validated and a real release tag exists.

Run the competitive/landscape review now — it's cheap and it tells you where to submit once the trio ships (relevant awesome-lists, the agent-skills registry if it functions as one, relevant communities) instead of guessing.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Reviewer opens a random skill folder and finds skeleton-grade content | Don't lead with the 113 number externally until validated count is meaningfully higher; lead with the Mermaid trio |
| Dossier and repo disagree on counts/status | Run the sync process already documented in `docs/PUBLISHING.md` before any outbound push |
| No release tag makes GitHub visitors bounce | Cut `v0.1.0` using the release note pattern already drafted in `docs/PUBLISHING.md` |
| LinkedIn reads as bot/spam | Irregular cadence tied to real milestones, not a schedule; manually comment on other people's posts; respond to every comment within 24h; run all copy through `okhp3-linkedin-voice`'s scrub gate |
| Overclaiming differentiation without checking the field | Do the competitive scan before the first "look what we built" post, not after |

## Next actions

- [ ] Finish Mermaid trio (`core`, `bpmn`, `publish`) to Usable/Validated per `docs/BACKLOG.md` order
- [ ] Cut `v0.1.0` release tag
- [ ] Sync overkillhill.com dossier to current repo counts (`docs/PUBLISHING.md` has the fields to copy)
- [ ] Run a competitive scan of agent-skill repos and registries; log findings and submission targets
- [ ] Run `okhp3-linkedin-angles` against the Forge capability audit or `docs/STACK-POSITION.md` now; build a small post queue
- [ ] Verify GitHub topic tags in `docs/PUBLISHING.md` are actually set on the repo, not just documented as recommended

## Open questions

- Does "review complementary projects" extend to the private Notion strategy surface referenced in `skillz.manifest.json` (`strategySurface`)? Not reviewed as part of this pass.
