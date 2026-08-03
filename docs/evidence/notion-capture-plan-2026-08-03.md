# okhp3-notion-capture-router — report-only capture plan (2026-08-03)

**Mode**: report-only. A Notion MCP connection is available in this
environment, but the user did not name a destination page or database for
this capture, and the skill's own contract is to resolve a destination
before writing rather than guess one. No Notion write was made in this pass.

## What would be captured

**Source**: this session's skill-usage audit and the 10 real skill runs that
followed it (2026-08-03).

**Proposed extract** (ready to write once a destination is chosen):

- **Title**: "Skillz Forge — skill-usage audit & first runs (2026-08-03)"
- **Summary**: Audited all 16 `.agents/skills/` skills for real prior usage
  evidence in this repo; found 6 confirmed, 10 with none; ran all 10 against
  real, agent-selected targets and produced verifiable artifacts for each
  (ADR, two design/code audits, a brand-style profile, a skill-promotion
  mirror, an evidence ledger, a session handoff, a repository-janitor report,
  and this capture plan).
- **Linked artifacts** (repo-relative paths, would become Notion links or
  embedded content depending on destination type):
  - `docs/adr/0001-family-requires-family-md.md`
  - `docs/audits/vercel-react-best-practices-2026-08-03.md`
  - `docs/audits/web-design-guidelines-2026-08-03.md`
  - `docs/audits/repository-janitor-2026-08-03.md`
  - `brand-styles/profiles/skillz-forge.yaml`
  - `skills/okhp3-artifact-validation/promotion-manifest.json`
  - `docs/evidence/skill-usage-audit-2026-08-03.md`
  - `docs/evidence/artifact-validation-adr-0001-2026-08-03.md`
  - `docs/handoffs/2026-08-03-skill-usage-audit-and-first-runs.md`
- **Suggested tags/metadata**: `skillz-forge`, `agent-skills`, `audit`,
  `2026-08-03`.

## Destination options (need one to proceed to a real write)

1. **A specific Notion page** — capture as a single page with the summary
   above and links/embeds to each artifact.
2. **A specific Notion database** — capture as one row per artifact (or one
   row for the whole session), matched to that database's existing schema
   (would need to inspect its data source first per the skill's own
   pre-write inspection step).
3. **Decline** — keep this record local to the repo only; no Notion write.

## Next step

Tell me a Notion page URL/title or database name to write to, and I will
inspect its current content/schema (per the skill's required pre-write
inspection) and create the capture for real. Until then this plan stays as a
local, report-only record.
