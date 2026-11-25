# Notion CRUDq family closeout

Date: 2026-11-19
Scope: the Notion family expansion thread (research, wave-1 build, full-index catalog run, foundry/equilibrium tooling circuit).

## Completed

| Requirement | Evidence |
|---|---|
| Phase 1-2 research and architecture proposal | `docs/reviews/notion-crudq-family-2026-09/research-phase1-2.md`, `dependencies.mermaid` |
| Wave 1: ten skills built to Foundry conventions | Committed in `82860078` on `main`; strict validator passes for all 12 `notion/` packages |
| Full-index cataloger run | Root `README.md`, family `FAMILY.md` files, and Forge data list all Notion skills |
| Tooling circuit: one deterministic script per skill | 11 scripts under `notion/*/scripts/`, 83 self-test assertions passing |
| Equilibrium review record | `docs/reviews/notion-crudq-family-2026-09/equilibrium-review.json` (analytical, single-context) |
| Evaluation design for the three highest-traffic skills | `notion/okhp3-notion-{row-write,query,page-write}/evals/evals.json` |
| Routing index and changelog | `AGENTS.md` Notion table; `docs/CHANGELOG.md` 2026-11-19 entry |

## Decisions and assumptions

- The tooling circuit was run once at family level rather than as 33 separate skill invocations.
- The research memo was copied with one personal handle replaced by a generic example; local machine paths were removed from the review record.
- The earlier Forge refresh question is moot: the committed Forge data already includes every Notion skill.

## Verification

- Strict validator: 12 `notion/` packages pass.
- Script self-tests: 83 assertions across 11 scripts pass.
- Forge data regenerated with `node artifacts/forge/scripts/build-catalog.js`; the only manifest change is three skills moving from `local-checks` to `not-run` evidence status, which matches the new eval designs.
- `node .agents/skills/catalog-integrity/run.mjs`: 51 passed, 0 failed, run on a scratch copy of the working tree. In the mounted tree it fails only because the mount blocks file deletion (EPERM) during fixture cleanup.

## Open items

| Item | Owner | Next action |
|---|---|---|
| Stray test fixture `community/catalog-companion-smoke-LHd9cJ/` left by the integrity test's failed cleanup; it makes `gen-skills-readme.py --full --check` fail on a name mismatch | Jamie | Delete the directory before committing or running the cataloger; it is untracked and not gitignored |
| Live with-skill/without-skill benchmark and protected holdout | Jamie | Run the three eval designs once an executor is available; record results as new evidence |
| Eval designs for the remaining eight wave-1 skills | Next foundry pass | Author three cases each, starting with `destructive-ops` and `core` |
| Wave 2 skills and the 18 marginal candidates | Jamie | Decide scope from the research memo's wave plan and marginal register |
| Commit of this closeout's working-tree changes | Jamie | Review the diff and commit or open a PR |
