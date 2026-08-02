# GPT Project Onboarding and Continuous Learning

Use this prompt from the root of the current project repository to audit, prepare, and improve the project’s Custom GPT, Copilot declarative agent, Gemini Gem, or related reusable AI workflow.

This is a project-local orchestration prompt. It is not itself an Agent Skill. Load and use both of these project-local skills before completing the work:

- `.agents/skills/okhp3-custom-gpt-builder/SKILL.md`
- `.agents/skills/okhp3-source-backed-research/SKILL.md`

## Operating contract

Work from the repository that contains this prompt. Do not assume the repository name, platform, product state, or intended audience from the prompt filename. Discover them from the Git root and the project’s existing evidence.

1. Resolve the repository root dynamically.

   - Confirm the current location is inside a Git working tree.
   - Use the Git repository root as the project boundary.
   - If the current location is not inside a Git repository, stop and report that condition.
   - Read `AGENTS.md`, `CLAUDE.md`, `README.md`, and other local instruction files that exist at the root or in the relevant project paths. Treat them as project instructions, not as unquestioned evidence about the product.

2. Load both required skills completely before analysis.

   - Apply `okhp3-custom-gpt-builder` to the product lifecycle, architecture, instruction quality, knowledge, tools, testing, readiness, and maintenance review.
   - Apply `okhp3-source-backed-research` whenever a claim depends on current platform behavior, external facts, product documentation, standards, market information, or any other source outside the repository.
   - Prefer official platform documentation for current Custom GPT, Copilot, and Gemini capabilities. Record retrieval dates and uncertainty.

3. Classify the project from evidence.

   Assign one or more of these labels, with evidence:

   - `CUSTOM_GPT`
   - `COPILOT_DECLARATIVE_AGENT`
   - `GEMINI_GEM`
   - `MULTI_PLATFORM_AGENT`
   - `AGENT_FOUNDRY_OR_WORKBENCH`
   - `UNKNOWN_AGENT_PROJECT`

   Do not force a label when the evidence is insufficient. Identify the project name, working title, intended user, problem, lifecycle state, target platform, and current production or prototype status.

4. Inventory the project before changing it.

   Inspect the relevant existing content, including, when present:

   - instructions, system prompts, conversation starters, personas, and policy notes;
   - knowledge files, source material, research, citations, and provenance records;
   - action definitions, APIs, schemas, authentication notes, connectors, and tool contracts;
   - evaluation cases, test conversations, acceptance criteria, defects, and feedback;
   - design, brand, audience, accessibility, privacy, safety, and governance requirements;
   - build notes, version history, decisions, handoffs, and deployment or maintenance records.

   Follow existing project conventions and do not reorganize content merely to make the inventory easier.

5. Create an evidence ledger before making recommendations.

   For each material conclusion, record:

   - the conclusion or requirement;
   - evidence type: repository evidence, official external source, other external source, inference, proposal, or unknown;
   - exact file path, section, URL, or source identifier;
   - retrieval date for external sources;
   - confidence and unresolved uncertainty;
   - the decision or action that the evidence supports.

   Never present an inference or proposed design choice as an existing project fact.

6. Run the builder audit.

   Evaluate the project against the full `okhp3-custom-gpt-builder` contract. At minimum, cover:

   - purpose, audience, and success criteria;
   - identity, role, boundaries, and behavioral instructions;
   - conversation flow, clarification behavior, and failure handling;
   - knowledge architecture, source quality, and citation/provenance behavior;
   - tools, actions, APIs, schemas, authentication, and least-privilege boundaries;
   - platform fit and current capability constraints;
   - safety, privacy, permissions, and sensitive-data handling;
   - evaluation design, representative test cases, and acceptance gates;
   - operational readiness, maintenance ownership, and change control;
   - packaging, documentation, handoff, and next release steps.

   Mark each area `confirmed`, `partial`, `missing`, `blocked`, or `not applicable`, and explain why.

7. Use source-backed research selectively.

   Research only the questions that materially affect a decision or that cannot be answered from project evidence. For every researched question, state:

   - the question;
   - why it matters;
   - sources consulted;
   - the answer and effective date, when known;
   - uncertainty, conflicting evidence, or platform limitations;
   - the resulting project implication.

   Do not use research to overwrite project intent. Use it to validate assumptions, expose constraints, and identify decisions that need owner confirmation.

8. Prepare the project with reversible changes only.

   If the project has an established audit, research, readiness, evaluation, or handoff location, use it. Otherwise, propose or create a clearly named, project-consistent location such as `docs/agent-audit/` only when the artifact is needed.

   Prefer additive, timestamped artifacts such as:

   - an onboarding or project-context summary;
   - an evidence ledger;
   - a builder audit and readiness assessment;
   - a research packet for current platform questions;
   - an evaluation backlog or test matrix;
   - a prioritized improvement plan;
   - a learning ledger recording newly established facts, decisions, and open questions.

   Do not overwrite existing work, delete files, rewrite project history, publish externally, change credentials, call production systems, or commit changes unless the user explicitly requests that specific action.

9. Learn from the existing project content without pretending to train a model.

   Treat “learning” here as durable project understanding: extract confirmed facts, decisions, constraints, patterns, unresolved questions, and reusable examples into the project’s established documentation or a reversible learning ledger. Preserve provenance and distinguish observed behavior from desired behavior. Do not silently promote guesses into project canon.

10. Stop for owner decisions when required.

   Clearly separate actions you can take from decisions that require the owner, especially changes to product purpose, target audience, platform, permissions, external integrations, sensitive data, publication, or destructive cleanup. If a blocker prevents meaningful progress, report the exact missing input and the smallest decision needed.

## Required final report

Return a concise but complete report with:

1. repository root and project identity;
2. platform classification and lifecycle state;
3. evidence inventory and material evidence gaps;
4. builder audit results by area;
5. source-backed research performed, with sources and retrieval dates;
6. artifacts created or updated, with exact paths;
7. prioritized recommendations separated into `now`, `next`, and `later`;
8. learning ledger entries or durable project knowledge captured;
9. unresolved owner decisions and blockers;
10. explicit status for each: `AUDIT_COMPLETE`, `PREPARED`, `IMPROVEMENT_READY`, `BLOCKED`, or `NO_CHANGE_NEEDED`.

Do not claim that the agent is production-ready merely because the audit completed. State what was inspected, what was verified, what remains uncertain, and what should happen next.
