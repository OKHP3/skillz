# <System name>

<!-- The project's front door AND the onboarding index. When a root README already exists,
MERGE these sections into it rather than replacing it — preserve the existing content, structure
and voice. Keep discovery metadata (the Last updated / Mode / Status header block and
[assumption]-style flags) OUT of this file; it's the project's own README, not a docs/ file. -->

<!-- 2–3 sentences: what the system is, who it's for, what it does. This is the first thing
a new team member or AI harness reads. Keep it tight. -->

## What this system is

<one short paragraph>

## Documentation

Onboarding docs live under [`docs/`](./docs/):

| Doc | What's inside |
|---|---|
| [docs/tech/current-architecture.md](./docs/tech/current-architecture.md) | How the system is built, as-is |
| [docs/tech/integrations.md](./docs/tech/integrations.md) | External systems and dependencies |
| [docs/domain/domain-model.md](./docs/domain/domain-model.md) | Core entities and relationships |
| [docs/domain/domain-glossary.md](./docs/domain/domain-glossary.md) | Business language |
| [docs/domain/business-rules.md](./docs/domain/business-rules.md) | The rules the system enforces |
| [docs/business/workflows.md](./docs/business/workflows.md) | Key end-to-end processes |
| [docs/business/business-requirements.md](./docs/business/business-requirements.md) | Functional + non-functional requirements |
| [docs/business/user-personas.md](./docs/business/user-personas.md) | Who uses it |

## Getting started

<!-- Only where the code reveals it: how to install / run / test. Omit if unknown — don't invent. -->

## Open questions & risks

<!-- The few highest-impact unresolved items. Link the register for the full list. -->

- <top assumption/risk> — see [docs/_discovery/assumptions-register.md](./docs/_discovery/assumptions-register.md)

<!-- docs/_discovery/ holds provenance and working state. It is not onboarding material and
should not be linked from CLAUDE.md / AGENTS.md. -->
