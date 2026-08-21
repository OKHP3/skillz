# Social-posting learning record: public-neutral drafting contracts

Date: 2026-08-11
Decision question: Which execution-time safeguards make platform-specific social
drafting skills portable, evidence-aware, and safe to publish publicly?

## Source ledger

| ID | Source | Authority and limit |
|---|---|---|
| SRC-01 | Supplied social-posting workflow evidence, reviewed 2026-08-11 | Direct evidence of routing, evidence, and handoff needs; it is not a platform specification. |
| SRC-02 | Public source artifacts and public post context supplied at execution time | Evidence for claims in a particular run; every future run must recheck the current source, time window, and destination state. |
| SRC-03 | The package baseline in this repository | Direct local evidence of the prior contracts and evaluation coverage. |

## Observed workflow gaps

- Activity claims need a bounded observation window, timezone, retrieval time, public
  reference, and source location. A conversational count is not evidence by itself.
- A public deadline or checkpoint may have an undecided outcome. Drafting must
  preserve that uncertainty and must not convert preparation, voting, or hope into
  a result.
- A reply beneath an existing post and a standalone update are different surfaces.
  Routing both through one generic path can produce the wrong form.
- Multiple public links may have different roles. The contract needs one primary
  call to action and explicit roles for optional secondary links.
- A caller may specify an exact hashtag count. The final prose pass must preserve
  that constraint rather than add tags by habit.
- Draft approval and host publication are separate actions. The portable package
  stays draft-only and hands approved text to a host that can verify rendering.

## Public-neutrality invariant

The package source, references, examples, evaluation fixtures, and learning records
must not contain a person name, account handle, account URL, private identifier,
employer or organization identity, product or project name, campaign name, topic
specific to one user, or subject-specific bias. Runtime context supplies the
acting account, destination, audience, subject, links, current facts, and
visibility boundary through placeholders or user-provided evidence. Platform
documentation links are allowed when they explain the named platform's mechanics.

## Change hypothesis

Adding these rules and synthetic, placeholder-based regression designs should
reduce unsupported claims, premature-result language, link drift, surface
confusion, and accidental publication while keeping each package platform-specific.
This is a design hypothesis. No live with-skill/without-skill benchmark was run.

## Affected packages

- LinkedIn angle mining, post drafting, voice filtering, and comment drafting were
  renewed for bounded evidence, pending outcomes, CTA roles, hashtag preservation,
  and host handoff.
- Discord, Facebook, X, Ko-fi, and YouTube packages were scrubbed to the same
  public-neutrality invariant; their evaluation fixtures use synthetic context.
- Generated family and Forge catalogs were refreshed from the package sources.

## Rejected alternatives

- No browser or platform API instructions were added to the portable packages.
  Publication and rendered verification remain host capabilities.
- No fixed person, account, organization, product, project, campaign, or subject
  was embedded in reusable instructions or evaluation fixtures.
- No live quality, uplift, or production-readiness claim is made. The evaluation
  records remain analytical and mark live benchmarks as not run.

## Evidence status and limits

The changes are analytically reviewed against the supplied workflow evidence and
the local package contents. Evaluation files are design-ready and use synthetic
placeholders; no isolated with-skill/without-skill runner or unseen release
holdout was available in this session.

