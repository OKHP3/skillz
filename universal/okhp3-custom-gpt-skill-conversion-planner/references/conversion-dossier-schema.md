# Custom GPT to Agent Skill Conversion Dossier Schema

Use this reference to plan conversion from a platform-specific AI configuration
to a portable Agent Skill package.

## Conversion dossier

```yaml
source:
  name: ""
  platform: custom-gpt | gem | copilot-agent | other
  version: ""
  owner: ""
  visibility: private | link-only | public | unknown
  foundry_lineage: []
  source_locations: []
conversion:
  durable_job: ""
  intended_skill_user: ""
  target_visibility: public | private | undecided
  readiness_verdict: ready-for-skill-foundry
  rationale: ""
```

## Asset allocation matrix

```yaml
assets:
  - id: asset-01
    source_type: instruction | knowledge | tool | action | example | evaluation | template | metadata
    source_title: ""
    origin: original | public-source | approved-private-source | unknown
    handling: public-safe | private-only | needs-redaction | rights-unclear | blocked
    destination: skill-md | reference | data | script | asset-template | eval | platform-dependency | excluded
    conversion_action: preserve | parameterize | rewrite | replace | retain-external | do-not-migrate
    notes: ""
```

## Capability coverage map

```yaml
capabilities:
  - id: cap-01
    source_task: ""
    user_value: high | medium | low
    conversion_state: preserved | reimplemented | platform-dependent | intentionally-excluded | blocked
    target_component: ""
    evidence: []
    owner: ""
```

## Required conversion blockers

Flag the conversion as blocked when any of the following is unresolved:

- credentials, API keys, cookies, or other secrets;
- client, employer, or personal information not authorized for the target package;
- copyrighted or licensed material without redistribution rights;
- an unverified claim that a platform capability is portable;
- no stable job, task boundary, or acceptance evidence;
- high-value source capability with no coverage-map entry.

## Skill Foundry brief

The handoff to `okhp3-skill-foundry` must include:

- a one-sentence intent statement;
- explicit in-scope and out-of-scope boundaries;
- expected package components;
- three distinct evaluation prompts;
- four evidence-anchored expectations per prompt;
- proposed target visibility and known publication constraints.
