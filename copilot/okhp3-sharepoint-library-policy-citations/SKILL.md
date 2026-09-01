---
name: okhp3-sharepoint-library-policy-citations
description: >
  Answer a policy question from accessible SharePoint library documents with
  traceable citations, conflicts, and uncertainty. Use when a user needs a
  source-grounded policy summary from a named library or selected documents.
  Do not use for legal advice, invented policy, or uncited conclusions.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Cited summaries from accessible SharePoint policy-library documents."
  out_of_scope: "Legal, compliance, or HR determinations and unsupported policy interpretation."
---

# okhp3-sharepoint-library-policy-citations

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Answer a specific question using only accessible documents in a named SharePoint
policy library or an explicit selected-file set. Return a concise answer whose
material statements identify the source file and the supporting section or
excerpt location when available.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected documents or an accessible named policy library |
| Portable core | Question decomposition, source ledger, conflict handling, and citation-first summary |
| Host adapter | Reads only content available to the current user through native capability |
| Mutation | Read-only. This skill does not change files, labels, permissions, or policies. |
| Evidence | Analytical package design only. No live citation-quality evaluation has run. |

## Procedure

1. Confirm the question, library or selected-file scope, document currency rule,
   audience, and whether the request is a summary or an owner-routed question.
2. Read only accessible in-scope documents. State the source set and any
   missing, inaccessible, undated, or conflicting documents.
3. Extract material claims with a source citation. Prefer the document's own
   title, version or date when available, and a section heading or short
   location cue. Do not cite a document that was not inspected.
4. Separate these results:

   | Result type | Required handling |
   |---|---|
   | Confirmed by source | Cite the file and location cue. |
   | Conflict | Show each source position and route to the policy owner. |
   | Not found | State the searched source scope and do not infer the rule. |
   | Interpretation | Label as an interpretation and do not present as binding policy. |

5. Return: a direct answer, cited support, conflicts or uncertainties, and the
   next owner action. Validate that every material conclusion has a source or
   is labeled uncertain.

## Safe outcomes

- `NEEDS INPUT`: question, document scope, policy owner, or currency rule is
  missing.
- `NOT SUPPORTED`: the host cannot inspect the necessary documents or expose
  enough source context for a citation.
- `INSUFFICIENT PERMISSION`: the user cannot access a required document.

## Boundaries

- Do not provide legal, regulatory, HR, financial, or disciplinary advice.
- Do not resolve conflicting policy documents or decide which is binding.
- Do not disclose restricted document content or bypass its permissions.
- Do not edit policies, labels, retention settings, or permissions.

## Validation

Use `evals/evals.json` to validate cited answers, source conflicts, and the
no-invented-policy boundary. Version 1.0.0 has only analytical evidence.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
