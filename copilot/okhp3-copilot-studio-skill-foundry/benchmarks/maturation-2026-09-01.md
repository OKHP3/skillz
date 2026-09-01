# v1.1.0 maturation record — Copilot Studio Foundry

## Hypothesis

The v1.0.0 Foundry separated skills from instructions, knowledge, and tools but
did not make Studio's Build, direct-file upload, ZIP upload, and Preview test
paths operational. Recording them will prevent an accepted artifact from being
misrepresented as a proven agent capability.

## Evidence ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| A skill can be created from the Build tab with name, description, and Markdown instructions. | Microsoft Learn: Create a skill for an agent, retrieved 2026-09-01 | sourced |
| Studio accepts an uploaded Markdown file or ZIP with `SKILL.md`. | Microsoft Learn: Add an existing skill to an agent, retrieved 2026-09-01 | sourced |
| Preview is the documented post-creation verification surface. | Microsoft Learn: Create a skill for an agent, retrieved 2026-09-01 | sourced |

## Equilibrium review

- **Evidence:** approve; authoring and Preview requirements are documented for
  the targeted GitHub Copilot-harness Studio experience.
- **Outcome:** approve-with-limits; the Foundry still avoids whole-agent and
  connector implementation scope.
- **Safety/portability:** approve; artifact acceptance remains distinct from
  deployment, tool availability, and approval authority.
- **Disruptor hypothesis:** a Preview pass could still be a false activation
  positive if the description overlaps another skill. Test a positive prompt, a
  near-miss prompt, and a missing-tool prompt in the named Studio agent.
- **Negotiated decision:** release v1.1.0 as analytical maturation only.

Independent reviewer forks were requested but inherited interrupted task
context and supplied no final review record. This is a parent-authored,
source-backed review, not independent Studio evidence.
