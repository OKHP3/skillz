# Glee-fully Skill Format Standard

Use this reference when drafting or reviewing a Glee-fully Tool or Tool-ette.

## Review table

| Section | Required behavior |
|---|---|
| Hierarchy | Name exactly one of Trunk, Branch, Twig, Function, or Function-ette |
| Persona Density | Select Full, Standard, Lean, or None with a user-experience rationale |
| Role & Scope | State the job, intended user, and explicit non-goals |
| Best for | Required for Twigs; describe triggering user state and gentle disqualifiers |
| Inputs & Outputs | State what the user supplies and what the skill returns |
| Core Behaviors | Give ordered behavior rules, decision points, and fallback behavior |
| Functions | Keep each function to one job; avoid overlap and scope creep |
| Siblings | Name related tools with one-line distinctions |
| Logic Specification | Required for Function and Function-ette; keep it exact and persona-free |
| Canon seal | Set `canon-sealed: true` only after current review and acceptance evidence |

## PromptChain translation

| Stage | Skills-era activity |
|---|---|
| PROMPT00 | Intake, source boundary, and canon terminology |
| PROMPT01 | Hierarchy, role, scope, and Persona Density |
| PROMPT02 | Inputs, outputs, behaviors, and sibling routing |
| PROMPT03 | Knowledge and reference routing |
| PROMPT04 | Evaluation, safety, and failure handling |
| PROMPT05 | Current review, release evidence, and canon sealing |

## Canon-seal gate

The seal is blocked when the hierarchy is ambiguous, the Best for boundary is
missing for a Twig, Functions overlap, sibling routing is incomplete, required
inputs or outputs are unknown, safety behavior is absent, or the reviewer is
relying only on a historical artifact without inspecting the current package.
