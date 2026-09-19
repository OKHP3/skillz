---
name: specification-authoring
description: 'Create or update a structured solution specification with explicit requirements, interfaces, acceptance criteria, and preserved document identity.'
metadata:
  version: "1.0.0"
---

# Specification Authoring

## Select the mode from the request

- **Create:** obtain the purpose, scope, source requirements, and repository destination. Create a new specification only after checking that an equivalent one does not already exist. Ask for missing purpose or requirements rather than inventing them.
- **Update:** read the supplied existing specification and the requested change or code evidence first. Preserve its path, requirement IDs, `date_created`, ownership, and still-valid requirements. Apply a bounded revision, update `last_updated` and the version under the repository's convention, and summarize changed requirements and affected acceptance criteria. Do not rename an existing specification merely to match the create-mode convention.
- If the request does not establish a mode or target, ask for that missing input before writing.

Read repository instructions and nearby specifications before either mode. Distinguish confirmed requirements from proposals and unresolved questions. Do not turn template examples into invented project facts.

The specification file must define the requirements, constraints, and interfaces for the solution components in a manner that is clear, unambiguous, and structured for effective use by Generative AIs. Follow established documentation standards and ensure the content is machine-readable and self-contained.

## Best Practices for AI-Ready Specifications

- Use precise, explicit, and unambiguous language.
- Clearly distinguish between requirements, constraints, and recommendations.
- Use structured formatting (headings, lists, tables) for easy parsing.
- Avoid idioms, metaphors, or context-dependent references.
- Define all acronyms and domain-specific terms.
- Include examples and edge cases where applicable.
- Ensure the document is self-contained and does not rely on external context.

In create mode, use the repository's existing specification convention; otherwise save under the repository-relative `spec/` directory with this default naming convention: `spec-[a-z0-9-]+.md`, where the name should be descriptive of the specification's content and starting with the highlevel purpose, which is one of [schema, tool, data, infrastructure, process, architecture, or design].

The specification file must be formatted in well formed Markdown.

Specification files must follow the template below, ensuring that all sections are filled out appropriately. The front matter for the markdown should be structured correctly as per the example following:

````md
---
title: [Concise Title Describing the Specification's Focus]
version: [Optional: e.g., 1.0, Date]
date_created: [YYYY-MM-DD]
last_updated: [Optional: YYYY-MM-DD]
owner: [Optional: Team/Individual responsible for this spec]
tags: [Optional: List of relevant tags or categories, e.g., `infrastructure`, `process`, `design`, `app` etc]
---

# Introduction

[A short concise introduction to the specification and the goal it is intended to achieve.]

## 1. Purpose & Scope

[Provide a clear, concise description of the specification's purpose and the scope of its application. State the intended audience and any assumptions.]

## 2. Definitions

[List and define all acronyms, abbreviations, and domain-specific terms used in this specification.]

## 3. Requirements, Constraints & Guidelines

[Explicitly list all requirements, constraints, rules, and guidelines. Use bullet points or tables for clarity.]

- **REQ-001**: Requirement 1
- **SEC-001**: Security Requirement 1
- **[3 LETTERS]-001**: Other Requirement 1
- **CON-001**: Constraint 1
- **GUD-001**: Guideline 1
- **PAT-001**: Pattern to follow 1

## 4. Interfaces & Data Contracts

[Describe the interfaces, APIs, data contracts, or integration points. Use tables or code blocks for schemas and examples.]

## 5. Acceptance Criteria

[Define clear, testable acceptance criteria for each requirement using Given-When-Then format where appropriate.]

- **AC-001**: Given [context], When [action], Then [expected outcome]
- **AC-002**: The system shall [specific behavior] when [condition]
- **AC-003**: [Additional acceptance criteria as needed]

## 6. Test Automation Strategy

[Define the testing approach, frameworks, and automation requirements.]

- **Test Levels**: Unit, Integration, End-to-End
- **Frameworks**: MSTest, FluentAssertions, Moq (for .NET applications)
- **Test Data Management**: [approach for test data creation and cleanup]
- **CI/CD Integration**: [automated testing in GitHub Actions pipelines]
- **Coverage Requirements**: [minimum code coverage thresholds]
- **Performance Testing**: [approach for load and performance testing]

## 7. Rationale & Context

[Explain the reasoning behind the requirements, constraints, and guidelines. Provide context for design decisions.]

## 8. Dependencies & External Integrations

[Define the external systems, services, and architectural dependencies required for this specification. Focus on **what** is needed rather than **how** it's implemented. Avoid specific package or library versions unless they represent architectural constraints.]

### External Systems
- **EXT-001**: [External system name] - [Purpose and integration type]

### Third-Party Services
- **SVC-001**: [Service name] - [Required capabilities and SLA requirements]

### Infrastructure Dependencies
- **INF-001**: [Infrastructure component] - [Requirements and constraints]

### Data Dependencies
- **DAT-001**: [External data source] - [Format, frequency, and access requirements]

### Technology Platform Dependencies
- **PLT-001**: [Platform/runtime requirement] - [Version constraints and rationale]

### Compliance Dependencies
- **COM-001**: [Regulatory or compliance requirement] - [Impact on implementation]

**Note**: This section should focus on architectural and business dependencies, not specific package implementations. For example, specify "OAuth 2.0 authentication library" rather than "Microsoft.AspNetCore.Authentication.JwtBearer v6.0.1".

## 9. Examples & Edge Cases

    ```code
    // Code snippet or data example demonstrating the correct application of the guidelines, including edge cases
    ```

## 10. Validation Criteria

[List the criteria or tests that must be satisfied for compliance with this specification.]

## 11. Related Specifications / Further Reading

[Link to related spec 1]
[Link to relevant external documentation]

````

## Completion check

Validate that each requirement has a stable ID, applicable acceptance criteria, and source or unresolved-question status; links and referenced interfaces must exist or be marked proposed. In update mode, inspect the diff for unintended removals or identity changes. Report remaining gaps and the written path. Do not claim the implementation conforms merely because its specification is complete.

## Consolidation evidence

This contract combines the two former Community specification prompts, whose template and working guidance were equivalent. Their originals remain in the repository archive with provenance. Version 1.0.0 adds explicit create/update routing and preservation rules; it has structural review only, with no live behavioral benchmark.

Source lineage: the `create-specification` and `update-specification` packages
from [github/awesome-copilot](https://github.com/github/awesome-copilot) at
`c0314d9bcb473fac0cc219e062735e3a3cb67cd3`, captured under its MIT license.
See the [community source ledger](../COMMUNITY-SKILL-SOURCES.md).
Exact original package blobs are recorded
in the [preservation manifest](https://github.com/OKHP3/skillz/blob/main/docs/archive/skill-redundancy-2026-09-19/specifications-manifest.json).
