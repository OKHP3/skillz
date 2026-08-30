# Source ledger

Retrieved 2026-08-30. These sources support package design decisions; they do
not validate a particular translation.

| Claim | Source | Authority rationale |
|---|---|---|
| Agent Skills packages can use a `SKILL.md` plus optional scripts, references, and assets, loaded progressively. | [Open Agent Skills documentation](https://github.com/Open-Dot-Agents/SKILL.md) | The format maintainer's public documentation. |
| A localized-document skill can preserve source revision metadata, keep code and identifiers unchanged, and check structural parity. | [Agent Almanac translate-content skill](https://github.com/pjt222/agent-almanac/blob/main/skills/translate-content/SKILL.md) | Public implementation precedent; adapted here only as a comparison, not adopted as authority. |
| HTML pages should declare their default language with `lang` on the `html` element and use BCP 47 language tags. | [W3C: Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations) | W3C internationalization guidance. |
| `hreflang` communicates localized page variants to Google when such variants exist. | [Google Search Central: localized versions](https://developers.google.com/search/docs/advanced/crawling/localized-versions) | Search platform's official documentation. |

## Research result

The search found public translation-oriented `SKILL.md` packages for skill
documentation, content trees, PDFs, and Azure Translator integration. None was
found that combines all requested conditions: authoritative `en-US` web source,
one-way target generation, author-voice preservation, source-hash drift
detection, HTML structure checks, and approval-gated new-page automation. This
package is therefore a focused complement, not a claim that no translation
skill exists anywhere.
