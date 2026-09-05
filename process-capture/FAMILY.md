---
family: process-capture
display_name: Process Capture
skill_count: 16
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-05T02:49:22Z
---

# process-capture

The family includes the recurring-task capture meta-skill alongside the structured process-analysis and publication skills.

This is the operationalized version of "write it down the third time you do something." It doesn't do the recurring task itself — it turns a recognized pattern into either a `docs/BACKLOG.md` entry (not ready yet) or a SKILL.md skeleton (ready now), following the conventions established across the mermaid and linkedin families in this repo.

This skill is also the reason this repo's AGENTS.md index needs to stay current — part of producing a new skeleton is adding its trigger row to the index.

## Lineage

The process-capture pattern has earlier ancestry in PathScrib-R and Flowpilot Scribbler — informal process-capture agents that executed fold operations (recurring task → structured artifact) before the SKILL.md format existed. They are provenance, not active components.

`okhp3-recurring-task-capture` is the formalized, SKILL.md-native version of that lineage. The underlying operation — fold recurring work into a portable execution contract — is also what ReFolDec calls a fold. See `refolddec/README.md` and `docs/STACK-POSITION.md`.

<!-- FAMILY_SUMMARY_START -->
The family includes `okhp3-recurring-task-capture` as its meta-layer.
<!-- FAMILY_SUMMARY_END -->

## Skills (16)

<!-- FAMILY_INVENTORY_START -->
*16 skills &nbsp;·&nbsp; inventory last updated: **September 5, 2026 at 02:49 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-as-is-process-capture](okhp3-as-is-process-capture/SKILL.md) | Capture and normalise a current-state process description into a structured as-is process YAML wi... | 0.2.0 |
| [okhp3-decision-model-authoring](okhp3-decision-model-authoring/SKILL.md) | Author and validate decision models from PNS decision points using DMN-aligned rule tables. Use t... | 0.2.0 |
| [okhp3-elicitation-interviews](okhp3-elicitation-interviews/SKILL.md) | Plan and facilitate structured elicitation sessions using BABOK v3 interview and workshop techniq... | 0.2.0 |
| [okhp3-future-state-change-strategy](okhp3-future-state-change-strategy/SKILL.md) | Design a target-state process and a structured change strategy from a gap analysis. Use this skil... | 0.2.0 |
| [okhp3-process-gap-exception-analysis](okhp3-process-gap-exception-analysis/SKILL.md) | Identify deviations, gaps, and exception paths between an as-is process capture and its intended ... | 0.2.0 |
| [okhp3-process-intake-and-scope](okhp3-process-intake-and-scope/SKILL.md) | Conduct structured process intake and scope definition using BABOK v3 elicitation techniques. Use... | 0.2.0 |
| [okhp3-process-measures-controls](okhp3-process-measures-controls/SKILL.md) | Define process performance measures, KPIs, and compliance controls for a validated PNS. Use this ... | 0.2.0 |
| [okhp3-process-narrative-authoring](okhp3-process-narrative-authoring/SKILL.md) | Author and validate a Process Narrative Specification (PNS) from a PIR and stakeholder register. ... | 0.2.0 |
| [okhp3-process-validation-scoring](okhp3-process-validation-scoring/SKILL.md) | Orchestrate the full V1–V9 validation suite across all BP-SKILL process artifacts and produce a 0... | 0.2.0 |
| [okhp3-publication-handoff-packaging](okhp3-publication-handoff-packaging/SKILL.md) | Assemble all validated BP-SKILL process artifacts into a publication-ready bundle with a manifest... | 0.2.0 |
| [okhp3-raci-governance-matrix](okhp3-raci-governance-matrix/SKILL.md) | Generate and validate a RACI matrix and governance responsibility document from a validated PNS. ... | 0.2.0 |
| [okhp3-recurring-task-capture](okhp3-recurring-task-capture/SKILL.md) | Capture a recurring task as either a backlog entry or a new skill skeleton. Use when the user say... | 1.1.0 |
| [okhp3-sipoc-generation](okhp3-sipoc-generation/SKILL.md) | Generate a SIPOC table from a validated PNS. Use this skill when the user needs a high-level proc... | 0.2.0 |
| [okhp3-sop-work-instructions](okhp3-sop-work-instructions/SKILL.md) | Generate Standard Operating Procedures (SOPs) and work instructions from a validated PNS. Use thi... | 0.2.0 |
| [okhp3-stakeholder-and-role-mapping](okhp3-stakeholder-and-role-mapping/SKILL.md) | Derive and validate a structured stakeholder register from a completed Process Intake Record. Use... | 0.2.0 |
| [okhp3-visual-process-modeling](okhp3-visual-process-modeling/SKILL.md) | Generate, validate, normalise, and explain Mermaid-native bpmn-beta diagrams from a Process Narra... | 0.2.0 |
<!-- FAMILY_INVENTORY_END -->
