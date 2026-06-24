# Security Policy

`OKHP3/skillz` contains Agent Skills: reusable instruction packages that may guide agents through file work, publishing, rendering, writing, or workflow capture.

Treat skills as executable influence, not passive documentation.

## Security posture

A `SKILL.md` can affect what an agent chooses to load, trust, execute, summarize, publish, or ignore. The repository therefore treats skill content as part of the agent supply chain.

## Hard exclusions

Do not commit:

- API keys, tokens, passwords, secrets, cookies, or private credentials
- private URLs or non-public workspace links unless intentionally documented as placeholders
- employer-specific confidential information
- internal system names, codenames, ticket identifiers, org-structure specifics, or proprietary process details
- customer, vendor, employee, or household personal data
- hidden network calls or scripts that exfiltrate content
- destructive scripts without explicit dry-run behavior and warning text

## Employer-data rule

Every skill in this repo excludes employer references by default.

The LinkedIn post pipeline includes an explicit scrub gate because public content is especially likely to accidentally preserve identifying context.

If an insight cannot survive generalization, do not publish it hollow. Mark it unsalvageable or retain it only in private notes.

## Scripts and tools

Any script added to a skill must be:

- readable before execution
- documented in the relevant `SKILL.md` or `references/` file
- safe by default
- non-destructive unless explicitly scoped
- free of hidden network behavior
- free of credential collection

Prefer local-only validation where possible.

If a public API fallback is introduced, the skill must disclose what content leaves the local environment.

## Review checklist for new skills

Before merging or promoting a new skill:

- [ ] `SKILL.md` contains no private or employer-specific examples.
- [ ] Trigger language is precise enough to avoid accidental overuse.
- [ ] Known failure modes are documented.
- [ ] Any scripts are reviewed for filesystem, network, and destructive behavior.
- [ ] Examples use synthetic or public-safe content.
- [ ] The skill does not instruct an agent to hide actions from the user.
- [ ] The skill does not instruct an agent to bypass tool permissions, system instructions, or user consent.

## Reporting issues

Open a GitHub issue for:

- unsafe skill behavior
- accidental disclosure risk
- malicious or confusing instructions
- overbroad trigger language
- stale marketplace or compatibility claims
- examples that appear to contain private information

For sensitive issues, avoid including secrets or private data in the issue body. Describe the file path and concern in general terms.

## Compatibility caution

Different agent runtimes may interpret skills differently. A skill that is safe in one runtime may be too broad or too permissive in another.

Before promoting a skill as compatible with a runtime, test the trigger behavior, loaded context, tool access, and output safety in that runtime.
