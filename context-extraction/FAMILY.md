---
family: context-extraction
skill_count: 9
generated_by: okhp3-skill-cataloger v1.5.0
generated_at: 2026-07-21T22:35:47Z
---

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

<!-- FAMILY_SUMMARY_START -->
The context-extraction family is the mining, extraction, and refinement layer for source material. Its purpose is to identify the valuable information present in a source, pull that information out with evidence and provenance intact, and refine it into a useful downstream product.
<!-- FAMILY_SUMMARY_END -->

## Skills (9)

<!-- FAMILY_INVENTORY_START -->
*9 skills &nbsp;·&nbsp; inventory last updated: **July 21, 2026 at 22:35 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-chatgpt-project-migration](okhp3-chatgpt-project-migration/SKILL.md) | OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving, extracting, inventory... | 1.0.0 |
| [okhp3-thread-context-extraction](okhp3-thread-context-extraction/SKILL.md) | Extract pasted or uploaded AI chat threads into standalone, actionable Markdown. Use when the use... | 2.0.0 |
| [okhp3-thread-context-extraction-chatgpt](okhp3-thread-context-extraction-chatgpt/SKILL.md) | Extract manually supplied ChatGPT conversations into standalone, actionable Markdown. Use when th... | 2.0.0 |
| [okhp3-thread-context-extraction-claude](okhp3-thread-context-extraction-claude/SKILL.md) | Extract manually supplied Claude conversations into standalone, actionable Markdown. Use when the... | 2.0.0 |
| [okhp3-thread-context-extraction-copilot-m365](okhp3-thread-context-extraction-copilot-m365/SKILL.md) | Extract manually supplied Microsoft Copilot and Microsoft 365 Copilot chats into standalone, acti... | 2.0.0 |
| [okhp3-thread-context-extraction-gemini](okhp3-thread-context-extraction-gemini/SKILL.md) | Extract manually supplied Google Gemini conversations into standalone, actionable Markdown. Use w... | 2.0.0 |
| [okhp3-thread-context-extraction-grok](okhp3-thread-context-extraction-grok/SKILL.md) | Extract manually supplied xAI Grok conversations into standalone, actionable Markdown. Use when t... | 2.0.0 |
| [okhp3-thread-context-extraction-mistral-vibe](okhp3-thread-context-extraction-mistral-vibe/SKILL.md) | Extract manually supplied Mistral Vibe or former Le Chat conversations into standalone, actionabl... | 2.0.0 |
| [okhp3-thread-context-extraction-perplexity](okhp3-thread-context-extraction-perplexity/SKILL.md) | Extract manually supplied Perplexity conversations into standalone, actionable Markdown. Use when... | 2.0.0 |
<!-- FAMILY_INVENTORY_END -->
