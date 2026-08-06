# LinkedIn Post Queue — 2026-08-06

**Status:** Draft queue. Nothing here has been published. Per the current
promotion plan (`docs/BACKLOG.md`, `docs/archive/planning-2026-08/PROMOTION-STRATEGY-2026-08-06.md`),
these posts are meant to build a work-in-progress presence now, without
pointing readers at the full catalog or repo until the Mermaid trio
(`okhp3-mermaid-core`, `okhp3-mermaid-bpmn`, `okhp3-mermaid-publish`) clears
Validated maturity. None of the drafts below include a "go look at the repo"
call to action for that reason.

**Pipeline used:** `okhp3-linkedin-angles` → `okhp3-linkedin-post` →
`okhp3-linkedin-voice`, per `linkedin/FAMILY.md`. Source artifacts mined:
`docs/PRD-SKILLZ-FORGE-INDEPENDENT-AUDIT-2026-08-06.md` (the current Forge
capability audit and build directive), `docs/STACK-POSITION.md`, and
`docs/COMPETITIVE-LANDSCAPE-SCAN-2026-08-06.md`.

---

## 1. Angle registry (mining pass)

Per `okhp3-linkedin-angles`' output contract: 5 candidates, including the
mandatory Surprising/Contrarian category (2 of the 5 below qualify).

| Date | Source artifact | Category | One-line summary | Suggested length | BFS flag | Status | Reason it's publishable |
|---|---|---|---|---|---|---|---|
| 2026-08-06 | `docs/PRD-SKILLZ-FORGE-INDEPENDENT-AUDIT-2026-08-06.md` §0, §5 + `docs/archive/planning-2026-08/` | Surprising / Contrarian | A documented gap survived six dated planning documents over eight days without being fixed; archiving the paper trail, not writing a seventh document, was the one thing actually within scope to fix. | post | no | drafting | Concrete, verifiable process failure (six dated documents citing the same gap, 13 docs archived) with a self-deprecating twist that stops short of claiming the underlying page was fixed; no employer or client context involved. |
| 2026-08-06 | `docs/STACK-POSITION.md` "Conceptual Evolution" | Behind-the-Scenes / Process | A mega-prompt is used once and forgotten; the skill-promotion ladder exists specifically to stop that from happening. | post | no | drafting | Describes a general, reusable architecture idea (prompt-to-contract promotion) that stands on its own without needing to name the product or point at the repo. |
| 2026-08-06 | `docs/PUBLISHING.md` "Release gate" section (`v0.1.0` reconciliation table) | Teardown / Critique | Tagged a release before writing down what a release required, then reconciled that tag against the gate honestly, including the two criteria it missed. | post | no | drafting | Rare public admission of an incomplete gate check against one's own work, which is exactly the kind of candor that reads as credible rather than promotional. |
| 2026-08-06 | `docs/COMPETITIVE-LANDSCAPE-SCAN-2026-08-06.md` (Agents365-ai/mermaid-skill finding) | Surprising / Contrarian | A competitive scan found a public project already shipping the exact BPMN-plus-validation-loop combination this project was about to call its differentiator. | post | no | new | Undercuts the project's own hype before anyone else could, which is a stronger trust signal than the differentiator claim itself; needs the trio's worked example to land well, hence deferred. |
| 2026-08-06 | `docs/COMPETITIVE-LANDSCAPE-SCAN-2026-08-06.md` (Mermaid `#7699`/`#2623`) | Prediction / Trend | Mermaid's own maintainers have left native BPMN support open for years; agent-skill packaging is filling a gap the core tool has declined to close. | post | no | new | Verifiable, sourced claim (two long-open upstream issues) that supports a trend argument without naming this project as the definitive answer yet. |

Candidates 4 and 5 are recorded for the backlog but not drafted this pass —
three drafts is enough for a starting queue, and candidate 4 in particular
needs a defensible framing (it concedes a competitor exists) that's better
handled once the trio's own worked example exists to contrast against.

---

## 2. Drafted posts

Each draft below went through `okhp3-linkedin-post`'s pipeline: draft, voice
pass (`okhp3-linkedin-voice`), then the BFS employer-reference scrub gate
(`okhp3-linkedin-post/references/bfs-scrub-checklist.md`) as the final,
non-negotiable step.

### Draft 1 — "The paper trail is not the fix" (Surprising / Contrarian)

> A public page describing this project carried the wrong skill count for more than a week. Real numbers: 113 skills, 15 categories. The page kept saying 75 and 12.
>
> That gap surfaced as the top recommendation in at least six dated planning documents over eight days. Six separate write-ups agreed on the fix. None of them touched the actual page, because writing a recommendation and editing a different repository's HTML are not the same action.
>
> What finally closed it: someone opened that other repository and edited the line, then added a script so the count pulls from the live data file instead of a person remembering to retype it next time.
>
> Six documents describing a problem is not the same as one edit fixing it.

**Voice pass change log:** No em dashes present in the draft to remove. Consolidated into LinkedIn's double-line-break paragraph format. Contractions kept minimal but natural where used. Ending is hard, no appended question.

**Fact check:** "At least six dated planning documents" and the eight-day span are paraphrased directly from `docs/PRD-SKILLZ-FORGE-INDEPENDENT-AUDIT-2026-08-06.md` line 18. The fix itself (hand-editing the dossier in the separate `OKHP3/OverKill-Hill` repo, then adding a live-sync script against `project-summary.json` so the two drifting numbers self-correct going forward) is confirmed in `docs/PUBLISHING.md`'s "Syncing the overkillhill.com dossier" section, both dated 2026-08-06. The draft does not claim the page is now permanently accurate or that the broader publish pipeline is fixed (that remains open as project task "Fix the OverKill Hill site's stuck publish pipeline so page edits actually go live" — this draft is scoped to the one count-drift fix that already shipped, not that pipeline).

**BFS scrub gate:** Passed, nothing caught. No employer name, internal codename, proprietary system name, or organizational detail appears; the subject is this public open-source project's own planning and publishing history.

---

### Draft 2 — "What a mega-prompt is missing" (Behind-the-Scenes / Process)

> A mega-prompt gets written once, used once, and forgotten by the next conversation.
>
> We built a pipeline for the opposite: a mega-prompt becomes a reusable prompt kit, becomes a repo-scoped instruction file, becomes a single portable execution contract, becomes part of a composable family other contracts can call into.
>
> Each stage is a promotion, not a rewrite. A contract earns the next stage by surviving a worked example, not by looking finished.
>
> Most of our library is still early on that ladder. That's the point of writing the ladder down: you can see exactly which rung a piece of work is standing on, instead of guessing whether "draft" secretly means "done."

**Voice pass change log:** No em dashes present. Paragraphs consolidated for LinkedIn's renderer. Tone kept decision-memo, no sycophantic opener. Ending is hard.

**BFS scrub gate:** Passed, nothing caught. Describes the project's own general architecture concept; no employer or client reference of any kind.

---

### Draft 3 — "We checked our own tag against a rule that didn't exist yet" (Teardown / Critique)

> We tagged a release before we had a written definition of what a release required. Then we wrote the definition and checked the tag against it, after the fact.
>
> Five of seven criteria held up: the build ran clean, the tests passed, the deploy trigger held, the doc counts matched, and no provenance was faked. Two didn't: the public page describing the release was still stale when the tag went out, and nobody had confirmed the live deployment matched what the tag claimed.
>
> We didn't rewrite the gate to make the tag look clean. We wrote down what passed, what didn't, and left the gap sitting in the changelog where anyone can find it.
>
> A release gate only means something if it survives being pointed at your own tag first.

**Voice pass change log:** No em dashes present. Paragraphs consolidated. Confident, undefended tone kept (no hedging into "arguably" or "some might say"). Ending is hard, no closing question.

**Fact check:** A `v0.1.0` tag exists (`git tag -l` returns `v0.1.0`), tagged 2026-08-06. `docs/PUBLISHING.md`'s "Release gate" section confirms the gate policy was written after that tag, retroactively, and its reconciliation table confirms the two open criteria named in the draft: public-truth convergence was open at tag time (the dossier was still stale when the tag was cut), and live verification against the deployed app was "not documented as performed." All five "held up" criteria match that same table.

**BFS scrub gate:** Passed, nothing caught. Describes this project's own release process; no proprietary system, employer, or internal tooling reference.

---

## 3. Backlog (not drafted this pass)

The remaining two mined candidates (competitor-parity admission, BPMN-gap
prediction) stay in the registry above as `new`. Draft them in a later pass,
ideally timed to when the Mermaid trio has its own worked example to point
to, since both candidates are stronger once there's a concrete result to
contrast against rather than a claim in progress.
