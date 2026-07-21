# Publishing and Promotion Workflow

This checklist controls when `OKHP3/skillz` is ready for public promotion, registry crawling, marketplace submission, or release tagging.

## Publishing principle

Do not promote a skill because a folder exists. Promote a skill when it can be used by an agent without Jamie in the loop explaining what the skill meant.

A `SKILL.md` is a delegation contract. Publishing weak contracts creates support burden and brand debt.

## Required before public promotion

- [ ] Every active skill has a valid `SKILL.md`.
- [ ] Required frontmatter exists: `name`, `description`.
- [ ] Description includes both capability and trigger language.
- [ ] Skill name matches folder name.
- [ ] No employer references, internal system names, codenames, ticket identifiers, or proprietary examples.
- [ ] No credentials, tokens, private URLs, API keys, or copied private content.
- [ ] License declared at repo level.
- [ ] `README.md` explains the family and usage model.
- [ ] `AGENTS.md` routing table is current.
- [ ] `SKILLS.md` catalog is current.
- [ ] At least one worked example exists for every promoted skill.
- [ ] Validation checklist exists for every promoted skill.
- [ ] First release tag exists before registry-oriented promotion.

## GitHub hygiene

Recommended topic tags:

```text
agent-skills
claude-skills
skill-md
skills-sh
openclaw-skills
mermaid
linkedin
```

Recommended root files:

```text
README.md
AGENTS.md
SKILLS.md
PUBLIC_SURFACES.md
PUBLISHING.md
SECURITY.md
CHANGELOG.md
LICENSE
skillz.manifest.json
```

## Skill maturity gates

| Gate | Requirement |
|---|---|
| Skeleton | `SKILL.md` exists with valid frontmatter and basic sections. |
| Draftable | The workflow can be followed by an agent from instructions alone. |
| Usable | One real task has been completed successfully using the skill. |
| Validated | Worked examples, validation checklist, and known failure modes exist. |
| Published | Release-tagged, cataloged, and safe for public surface promotion. |

## Registry readiness

Before pursuing automatic or manual marketplace/listing channels:

- [ ] Topic tags are set.
- [ ] `SKILL.md` files are spec-compliant.
- [ ] Root `AGENTS.md` points to every active skill.
- [ ] `SKILLS.md` is current.
- [ ] `SECURITY.md` is present.
- [ ] README has install guidance.
- [ ] The repo has at least one release tag.

## Public surface readiness

Before adding or promoting `overkillhill.com/projects/skillz/`:

- [ ] GitHub repo has public-surface documentation.
- [ ] Notion strategy page is current.
- [ ] Skill families have clear public descriptions.
- [ ] At least Mermaid Core, BPMN, and Publish have reached usable maturity.
- [ ] Glee-fully and AskJamie references are framed as contextual touchpoints, not primary homes.

## Prestige path

The prestige path should be deliberate, not automatic.

Potential future moves:

1. Prepare a strong Mermaid/BPMN skill submission.
2. Run a security review.
3. Create a release.
4. Add public OverKill Hill documentation.
5. Submit to higher-trust skill registries or reviewed collections.

## Release note pattern

Use concise release notes:

```md
## v0.1.0 — Initial public scaffold

- Added root skill catalog.
- Added Mermaid skill family skeletons.
- Added LinkedIn skill family skeletons.
- Added process-capture meta-skill.
- Added public-surface strategy and publishing workflow.
```

## Final gate

If a skill cannot answer these three questions, it is not ready to promote:

1. When should an agent use this skill?
2. What does good output look like?
3. What must the agent avoid?
