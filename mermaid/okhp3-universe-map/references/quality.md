# What good and bad look like

`assets/good-map.mmd` shows an explicit hierarchy, real links only for published
pages, and an unlinked planned concept with visible text and a dashed border.
`assets/bad-map.mmd` is deliberately syntax-valid but semantically wrong: it
claims completion without evidence, invents a live link, leaves a removed page
orphaned, and has white-on-white text. Never deploy the negative example.

Acceptance gates:

1. Syntax: parse and render every generated Mermaid file with the supported
   runtime. A tool displaying a widget without an observed result is not proof.
2. Coverage: all included indexed URLs appear; exclusions have explicit reasons.
   Section records are optional detail, not extra standalone page counts.
3. Semantics: edges mean navigation parentage, not causality or ownership.
   Completion and retirement are explicit editorial decisions.
4. Audience: each diagram has at most 19 nodes. Review long labels and dense
   real-site branches. Keep descriptions in the ordinary outline and tooltips.
5. Safety: quoted titles and instruction-like descriptions remain inert data;
   foreign origins, malformed inputs, duplicates, and parent cycles fail.
6. Integration: ordinary links work without Mermaid; existing theme, locale,
   referral, CSP, and release contracts still pass. Two full builds are stable.

Run `py -3 -B tests/test-universe-map.py` from this package on Windows, or
`python3 -B tests/test-universe-map.py` elsewhere. Fixture checks establish
generator behavior, not agent uplift. No unseen holdout or matched agent
benchmark has been run for version 0.1.4.
