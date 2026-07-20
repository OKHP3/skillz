# Custom GPT Readiness Dossier Schema

Use this reference when producing a readiness handoff. It defines stable fields
without prescribing a platform-specific GPT configuration.

## Concept dossier

```yaml
candidate:
  working_name: ""
  primary_user: ""
  job_to_be_done: ""
  repeatability_rationale: ""
  primary_outcomes: []
  non_goals: []
  risk_boundary: []
  surface_recommendation: build-custom-gpt
  recommendation_rationale: ""
```

## Evidence inventory

```yaml
evidence:
  - id: ev-01
    title: ""
    role: source-intent | domain-knowledge | behavior | evidence | identity
    origin: user-supplied | public-source | approved-private-source | generated-draft
    location: ""
    quality: usable | partial | stale | unreviewed | unsuitable
    handling: public-safe | private-only | needs-redaction | rights-unclear | not-applicable
    supports: []
    notes: ""
```

## Readiness assessment

```yaml
readiness:
  user_and_job_clarity: ready | partial | missing
  repeatable_workflow: ready | partial | missing
  scoped_outputs_and_non_goals: ready | partial | missing
  reliable_domain_knowledge: ready | partial | missing
  source_rights_and_privacy: ready | partial | missing
  examples_and_failure_modes: ready | partial | missing
  evaluation_evidence: ready | partial | missing
  ownership_and_maintenance: ready | partial | missing
  blockers: []
  assumptions: []
  verdict: ready-to-build | ready-with-assumptions | needs-discovery | not-a-custom-gpt | do-not-proceed
```

## Gap brief

Each gap must include these fields:

| Field | Requirement |
|---|---|
| `priority` | `blocking`, `important`, or `later` |
| `question_or_task` | Specific collection request |
| `reason` | Decision affected by the answer |
| `sufficient_answer` | Evidence shape that closes the gap |
| `owner` | User, maintainer, or named research source |

## Builder handoff minimum

The handoff must supply the existing Custom GPT Builder’s Step 0 fields:

- GPT name
- primary users
- three primary outcomes
- five non-goals
- five measurable acceptance criteria
- allowed and disallowed data sources
- allowed tools, subject to current platform verification
- safety and compliance constraints
