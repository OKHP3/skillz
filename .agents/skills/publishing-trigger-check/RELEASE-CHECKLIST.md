# Companion-site publishing release checklist

Run from a clean checkout or network-enabled CI environment. Treat every
failure as a stop condition; warnings require an operator decision.

## Before merge

- [ ] The repository’s default branch and source commit are identified.
- [ ] Validation workflow runs on pull requests and the default branch.
- [ ] The build/rebuild step does not rely on ignored or local-only generated files.
- [ ] The deploy job consumes the validated commit or a preserved validated
      artifact, not an unrelated working tree.
- [ ] The artifact path is explicit and contains the expected `index.html`.
- [ ] The custom-domain file matches the intended domain.
- [ ] Base paths, redirects, and deep links are tested for that site.

## Release command

```bash
node .agents/skills/publishing-trigger-check/audit-sites.mjs --strict --json
```

The audit must pass for each site independently:

- **OverKill Hill** — static root artifact, `overkillhill.com`, and its own
  precision/protocol/promptcraft metadata.
- **Glee-fully Tools** — static root artifact, `glee-fully.tools`, and its own
  personalizable-tools metadata. A validation-only workflow is not proof of
  deployment.
- **AskJamie** — prepared Pages artifact, `askjamie.bot`, and its own
  helpdesk metadata.

## Current audit disposition

- OverKill Hill: public routes and metadata pass; workflow deploys the
  validated repository root.
- Glee-fully Tools: public routes and metadata pass. Its visible workflows do
  not contain the deployer, but successful GitHub-managed Pages runs prove the
  current handoff; treat GitHub Pages settings as an external dependency and
  stop if that managed run disappears.
- AskJamie: public routes and metadata pass; workflow preserves a validated
  `dist-pages` artifact before Pages deployment.

Do not unify templates, navigation, content, colors, typography, or domains
to resolve a publishing issue. Shared mechanics must remain brand-agnostic.