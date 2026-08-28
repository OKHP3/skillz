# Software Reclamation

**Family crest:** The Reclamation Crest, Remastered

Software Reclamation is the OKHP3 remastering line for undocumented software systems. It preserves source lineage, then turns generic methods into composable, evidence-led contracts for recovery, security, documentation, modernization, replacement, validation, and support handoff.

## Remaster doctrine

These are not renamed clones. Each package is a remastered edition built from identified source material and rebuilt around OKHP3 discovery, authorization, provenance, uncertainty, evaluation, and handoff rules. Source lineage is retained for accountability; the package contract and quality gate belong to this family.

## Family boundary

| In scope | Out of scope |
|---|---|
| Authorized recovery and renewal of existing software systems from artifacts and runtime evidence | Generic conversation capture, unsupported legal conclusions, unapproved penetration testing, production mutation, and invented business intent |

## Lifecycle

```text
authority and scope
  -> evidence-preserving intake
  -> platform and code archaeology
  -> runtime, identity, security, and transaction reconstruction
  -> evidence-led as-is documentation
  -> target architecture and replacement specification
  -> migration, implementation, validation, and handoff
```

## Package map

| Package | Remastered role |
|---|---|
| [`okhp3-reclamation-scope`](okhp3-reclamation-scope/SKILL.md) | Assessment Authority and Scope |
| [`okhp3-reclamation-intake`](okhp3-reclamation-intake/SKILL.md) | Evidence-Preserving Artifact Intake |
| [`okhp3-reclamation-platform`](okhp3-reclamation-platform/SKILL.md) | Legacy Web Application Platform Fingerprint |
| [`okhp3-reclamation-code-archaeology`](okhp3-reclamation-code-archaeology/SKILL.md) | Legacy Web Application Code Archaeology |
| [`okhp3-reclamation-runtime-reconcile`](okhp3-reclamation-runtime-reconcile/SKILL.md) | Runtime and Deployment Reconciliation |
| [`okhp3-reclamation-rbac-tracing`](okhp3-reclamation-rbac-tracing/SKILL.md) | Identity, Access, and RBAC Tracing |
| [`okhp3-reclamation-transaction-flow`](okhp3-reclamation-transaction-flow/SKILL.md) | Partner Transaction Workflow Modeling |
| [`okhp3-reclamation-security-review`](okhp3-reclamation-security-review/SKILL.md) | Authorized Legacy Application Security Review |
| [`okhp3-reclamation-char-tests`](okhp3-reclamation-char-tests/SKILL.md) | Characterization Test Generation |
| [`okhp3-reclamation-technical-docs`](okhp3-reclamation-technical-docs/SKILL.md) | Evidence-Led Technical Documentation |
| [`okhp3-reclamation-target-design`](okhp3-reclamation-target-design/SKILL.md) | Modernization Target Architecture |
| [`okhp3-reclamation-replacement-spec`](okhp3-reclamation-replacement-spec/SKILL.md) | Replacement Specification Generation |
| [`okhp3-reclamation-migration-cutover`](okhp3-reclamation-migration-cutover/SKILL.md) | Migration and Cutover Planning |
| [`okhp3-reclamation-replacement-build`](okhp3-reclamation-replacement-build/SKILL.md) | Replacement Implementation |
| [`okhp3-reclamation-validation-handoff`](okhp3-reclamation-validation-handoff/SKILL.md) | Replacement Validation and Handoff |

## Composition

The family composes with Context Extraction for extracting evidence from supplied documents, logs, or transcripts; Knowledge Operations for provenance, validation, uncertainty, and promotion; Process Capture for generic workflow modeling; and domain or host adapters for browsers, databases, and .NET tooling.

## Maturity and evidence

- Family status: candidate, design-ready remastered editions.
- Package versions: `0.1.0`.
- Evaluation designs: present in every package under `evals/evals.json`.
- Live with-skill versus without-skill benchmarks: not run.
- Production readiness, legal authority, and live-system safety: not established by this family.

Every use begins with `okhp3-reclamation-scope`. A fluent reconstruction is not evidence of correctness.
