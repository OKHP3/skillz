# context-extraction

**Status: placeholder. Design not started.**

The context-extraction family is the mining, extraction, and refinement layer for source material. Its purpose is to identify the valuable information present in a source, pull that information out with evidence and provenance intact, and refine it into a useful downstream product.

The family is intentionally source-agnostic. Candidate inputs include databases, files, images, conversation threads, and transcripts. The recurring shape is:

```text
source material
→ inspect and profile
→ extract valuable evidence
→ validate and preserve provenance
→ normalize and refine
→ deliver a fit-for-purpose product
```

## Scope boundary

In scope:

- Finding high-value facts, claims, entities, events, decisions, relationships, and signals in source material.
- Separating source evidence from interpretation, inference, and unresolved uncertainty.
- Producing structured extracts, normalized records, summaries, briefs, datasets, or other explicitly requested outputs.
- Making extraction coverage, confidence, provenance, and loss visible to downstream consumers.

Out of scope:

- Replacing source-specific access or rendering skills for databases, documents, PDFs, images, email, chat, or transcripts.
- Inventing facts, silently filling gaps, or presenting interpretation as if it were source evidence.
- Making the family a general-purpose research, writing, or decision-making category without an extraction or refinement step.

## Candidate skill directions

These names are provisional and should be confirmed through the Skill Foundry architecture phase before scaffolding individual skills:

- `okhp3-context-source-profiling`: inspect a source and choose an extraction strategy.
- `okhp3-context-evidence-extraction`: pull target information into a traceable intermediate representation.
- `okhp3-context-normalization`: reconcile extracted material into consistent fields, entities, and records.
- `okhp3-context-refinement`: transform validated extracts into a requested downstream artifact.
- `okhp3-context-provenance-and-quality`: assess coverage, confidence, uncertainty, and semantic loss.

Do not begin scaffolding sub-skills until a concrete recurring workflow, input contract, output contract, and quality gate have been selected. The family should compose with source-access skills upstream and domain or artifact skills downstream.

