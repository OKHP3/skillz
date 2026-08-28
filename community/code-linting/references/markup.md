# Markdown / YAML / JSON linting

## Markdown

**markdownlint** for rules, **Prettier** for formatting. Most Markdown rules are cosmetic — the
ones worth keeping catch things that actually render wrong.

```jsonc
// .markdownlint.jsonc
{
  "default": true,
  "MD013": false,   // line length — prose wrapping is a losing battle
  "MD033": false,   // inline HTML — sometimes necessary
  "MD041": false,   // first line must be h1 — false on files with frontmatter
  "MD024": { "siblings_only": true }  // duplicate headings ok in different sections
}
```

Keep enabled: **MD009** (trailing spaces — they create unintended line breaks), **MD012**
(multiple blank lines), **MD040** (fenced blocks without a language, which lose syntax
highlighting), and **MD034** (bare URLs).

Add **lychee** or **markdown-link-check** for dead links. Run it on a schedule, not on every
commit — external links break without your repo changing, and a red build for someone else's
outage teaches people to ignore CI.

## YAML

**yamllint**. YAML's failure modes are silent and expensive.

```yaml
# .yamllint
extends: default
rules:
  line-length: { max: 120 }
  truthy: { allowed-values: ["true", "false"] }
  comments: { min-spaces-from-content: 1 }
  document-start: disable
```

**The `truthy` rule is the important one.** Unquoted `yes`, `no`, `on`, `off` parse as booleans
in YAML 1.1 — so a country code `NO` becomes `false`, and a port named `on` becomes `true`.
This has caused real outages. Quote them.

Also worth knowing: unquoted version numbers like `1.10` become the float `1.1`, and unquoted
strings with leading zeros lose them.

Validate structure, not just syntax, where a schema exists — `kubeconform` for Kubernetes,
`actionlint` for GitHub Actions. `actionlint` in particular catches expression errors and
shell problems inside `run:` blocks that yamllint cannot see.

## JSON

JSON has no style debate. Prettier formats it; use a schema for validation.

For config files people edit by hand, prefer **JSONC** or **JSON5** if the consumer supports
it — the inability to write a comment is a real cost, and people work around it by adding
`"_comment"` keys, which is worse.

`ajv` validates against JSON Schema in CI:

```bash
npx ajv validate -s schema.json -d "config/*.json"
```

## Traps

- **Prettier and markdownlint disagree** on list indentation and emphasis characters. Run
  Prettier last, and disable the corresponding markdownlint rules.
- **YAML anchors and aliases** confuse some linters and many consumers. Use sparingly.
- **Tabs are invalid in YAML.** A tab-indented file fails with a confusing message — configure
  editors per `.editorconfig`.
- Auto-formatting a JSON file that a tool also writes creates a diff war. Exclude generated
  files — lockfiles especially.
