import type { FaqGroup } from '../types/catalog';

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'agent-skills',
    title: 'Agent Skills',
    items: [
      {
        id: 'what-is-skillmd',
        question: 'What is a SKILL.md?',
        answer: 'A SKILL.md is a plain-text file that tells an AI agent exactly when to activate a capability, what to do with it, and what not to do. It combines a YAML frontmatter block (name, description, version, license) with a structured body — trigger phrases, step-by-step process, boundaries, examples, and companion skills. It is a delegation contract: precise enough to be followed consistently, open enough to be composed with other skills.',
        links: [
          { label: 'Browse all skills', href: '/explore' },
          { label: 'View on GitHub', href: 'https://github.com/OKHP3/skillz' },
        ],
      },
      {
        id: 'skill-vs-prompt',
        question: 'How is a skill different from a prompt?',
        answer: 'A prompt is a one-time instruction. A skill is a reusable, versioned, governed capability. Skills have explicit trigger conditions (when to activate), scope boundaries (what they do and do not cover), structured process steps, and known companion relationships. They are installable, shareable, and comparable. A prompt lives in a conversation. A skill lives in a repository.',
      },
      {
        id: 'skill-vs-mcp',
        question: 'How is a skill different from an MCP server?',
        answer: 'An MCP server exposes tools — callable functions with defined inputs and outputs. A SKILL.md is a behavioral contract — it governs how an agent reasons, what it checks before acting, and what it produces. Skills can load and route to MCP tools; the two are complementary. MCP is the API layer. Skills are the intelligence layer on top of it.',
      },
      {
        id: 'which-agents',
        question: 'Which agents can use these skills?',
        answer: 'Any agent that can load a text file as context: Claude, Codex, GitHub Copilot, Cursor, Gemini, and similar systems. Skills are plain Markdown with structured YAML — no special runtime required. The agent reads the SKILL.md and follows its delegation contract. Compatibility varies by how well the agent follows structured instructions.',
      },
      {
        id: 'composable-means',
        question: 'What does composable mean?',
        answer: 'Composable means skills can be combined into a pipeline where the output of one skill becomes the input of the next. For example, the process documentation pipeline loads intake -> narrative -> visual model -> SOP skills in sequence. Each skill is useful alone; together they produce something more complete than any single skill could. Stacks in Skillz Forge show curated compositions.',
        links: [
          { label: 'Browse stacks', href: '/stacks' },
        ],
      },
    ],
  },
  {
    id: 'using-skillz',
    title: 'Using Skillz',
    items: [
      {
        id: 'install-one-skill',
        question: 'How do I install one skill?',
        answer: 'Copy the raw URL from the skill\'s detail page or catalog row. Paste it into your agent\'s context or instruction window. In Claude Projects, add it as a project file. In Cursor, add the raw content to your .cursorrules or agent context. In Replit Agent, reference it via the skills system. The install command on each skill page shows the exact format for the most common environments.',
      },
      {
        id: 'install-partial-family',
        question: 'Can I install only part of a family?',
        answer: 'Yes. Each skill is an independent file. The mermaid family\'s okhp3-mermaid-core is required for any Mermaid work, but the domain skills (bpmn, architecture, data) are optional — load only the ones relevant to your diagram types. For families without a required core skill, any skill can be loaded independently.',
      },
      {
        id: 'maturity-label',
        question: 'What does the maturity label mean?',
        answer: 'Maturity and evidence are two separate questions, and Skillz Forge never merges them. Maturity describes the state of the contract itself: Placeholder (directory exists, no content), Skeleton (basic contract shape, important behavior incomplete), Draftable (an agent can follow the workflow under supervision — this does not mean validated), Usable (a defined workflow has been exercised and its limits documented — this does not mean production-safe in every environment), Validated (a current, version-matched benchmark demonstrates the contract and a measurable gap), Published (stable public release with formal provenance). Evidence describes what proof exists for the current version: none, local checks, designed, analytical, not-run, historical, or live. A skill can be Draftable with live evidence, or Draftable with no evidence record at all — the evidence note on each skill page tells you which. Validated specifically requires fresh, version-matched evaluation evidence; a historical or not-run note means that evidence does not yet exist for the current version. Lower-maturity and lower-evidence skills are shown clearly — they are not hidden.',
        links: [
          { label: 'Filter by evidence', href: '/explore' },
        ],
      },
      {
        id: 'release-readiness',
        question: 'What is "release readiness" and how is it different from maturity or evidence?',
        answer: 'Release readiness is a derived, UI-only convenience field — it is not a new stored value, and it never overrides or merges the underlying maturity or evidence fields. It combines a skill\'s maturity level with its evidence-contract-v2 status (live, analytical, historical, or not-run — a separate, intentionally distinct vocabulary from the older 7-value evidence note) into one of five buckets: Needs contract work, Needs live evidence, Ready for supervised use, Ready for peer review, or Published. Use it as a quick filter on Explore; use the "Evidence and release state" section on a skill\'s detail page for the full picture, including evidence counts, promotion blockers, and whether the evaluated version still matches the current package version.',
        links: [
          { label: 'Filter by release readiness', href: '/explore' },
        ],
      },
      {
        id: 'why-prerequisite',
        question: 'Why does one skill require another skill first?',
        answer: 'Some skills are layered: a domain skill adds vocabulary on top of a foundation skill that handles core logic. The mermaid family is an example — okhp3-mermaid-core handles audience, type selection, and design system; the domain skills (bpmn, architecture, data) add type-specific patterns on top. Loading only the domain skill without core produces incomplete results.',
      },
      {
        id: 'offline-use',
        question: 'Can I use these skills offline?',
        answer: 'Yes. Skills are plain Markdown files. Once downloaded or copied, they work without any network connection. Skillz Forge itself runs from a static catalog generated at build time — no runtime calls to GitHub are required for discovery.',
      },
      {
        id: 'skill-finished',
        question: 'How do I know whether a skill is finished?',
        answer: 'Check both the maturity label and the evidence note on the skill\'s detail page. Validated and Published require a fresh, version-matched benchmark with a measurable quality gap. Usable means a workflow has been exercised with documented limits, but it is not a production-safety guarantee for every environment. Skeleton and Draftable mean the contract is functional but not yet benchmarked — an evidence note of "historical" means an older version was benchmarked, not the current one; "not-run" means the evaluation design exists but has not been executed; "none" means no indexed evidence record exists, which is not the same as unsafe. Placeholder means the directory is a reserved spot, nothing more.',
      },
    ],
  },
  {
    id: 'trust-safety',
    title: 'Trust and Safety',
    items: [
      {
        id: 'where-content-from',
        question: 'Where does skill content come from?',
        answer: 'All skills in this repository are authored by Jamie Hill (OverKill Hill P³) or community contributors through the standard GitHub pull request process. Each skill file is plain text, visible in full on GitHub. No skill content is generated automatically — every SKILL.md is written and reviewed by a human before merging.',
        links: [
          { label: 'View repository', href: 'https://github.com/OKHP3/skillz' },
        ],
      },
      {
        id: 'data-collection',
        question: 'What data does Skillz Forge collect?',
        answer: 'Skillz Forge uses Google Analytics 4 (GA4) for aggregate usage measurement — page views and interaction events such as copy, share, and filter actions. Search and filter results are summarized as bucketed counts (e.g. "6–15 results") and never sent as raw text. Favorites are stored in your browser\'s local storage and never leave your device. No skill content or personal information is sent to any analytics service. You can block GA4 with a standard browser extension.',
        links: [
          { label: 'Google Analytics privacy', href: 'https://policies.google.com/privacy' },
        ],
      },
      {
        id: 'credentials-employer',
        question: 'Can a skill contain credentials or employer material?',
        answer: 'No. The OKHP3 brand rules explicitly exclude credentials, personal access tokens, OAuth secrets, employer-confidential examples, private URLs, and personally identifiable information. If you find a skill that appears to contain any of these, please report it immediately.',
        links: [
          { label: 'Report a security concern', href: 'https://github.com/OKHP3/skillz/security' },
        ],
      },
      {
        id: 'how-validated',
        question: 'How are skills validated?',
        answer: 'Production-quality skills are validated through the okhp3-skill-foundry 8-phase methodology: architecture, draft, eval design, live execution, grading, benchmark, fix loop, and description optimization. The primary quality signal is the with/without gap — a skill that scores 1.0 with skill access and 0.3 without is doing real work. Reaching Validated requires that gap to come from a benchmark matched to the skill\'s current version; a benchmark run against an earlier version is recorded as "historical" evidence, not treated as current proof. A skill is never promoted to Validated solely because it has tests, scripts, or a benchmark design — those establish local or analytical evidence, not live production performance.',
        links: [
          { label: 'okhp3-skill-foundry', href: '/skills/universal/okhp3-skill-foundry' },
        ],
      },
      {
        id: 'mit-license',
        question: 'What does the MIT license mean?',
        answer: 'MIT is a permissive open-source license. You can use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the skill files. The only requirement is to include the original copyright notice. You are not required to share modifications. Commercial use is permitted.',
      },
      {
        id: 'security-problem',
        question: 'What should I do if a skill contains a security problem?',
        answer: 'Do not open a public GitHub issue for security concerns. Use GitHub\'s private security advisory feature or email the repository owner directly. See docs/SECURITY.md in the repository for the full disclosure process.',
        links: [
          { label: 'SECURITY.md on GitHub', href: 'https://github.com/OKHP3/skillz/blob/main/docs/SECURITY.md' },
        ],
      },
    ],
  },
  {
    id: 'contributing',
    title: 'Contributing',
    items: [
      {
        id: 'issue-or-pr',
        question: 'Should I open an issue or pull request?',
        answer: 'Start with an issue unless you are making a small, obvious improvement (typo, dead link, missing punctuation). Issues let the maintainer confirm direction before you invest time drafting. For new skills or significant body changes, always open an issue first to confirm the skill fits the repository\'s scope and naming conventions.',
        links: [
          { label: 'Open an issue', href: 'https://github.com/OKHP3/skillz/issues/new' },
        ],
      },
      {
        id: 'suggest-new-skill',
        question: 'How do I suggest a new skill?',
        answer: 'Open a GitHub issue with the label "new skill". Describe the recurring task the skill would handle, the agent behaviors you would want it to govern, and the family it belongs to. A concrete example of "I keep doing X and having to re-explain Y every time" is more useful than an abstract capability description.',
        links: [
          { label: 'Suggest a new skill', href: 'https://github.com/OKHP3/skillz/issues/new?labels=new-skill&title=New+skill%3A+' },
        ],
      },
      {
        id: 'improve-trigger',
        question: 'How do I improve a trigger description?',
        answer: 'The trigger description is the most important line in a SKILL.md — it is what the agent uses to decide whether to load the skill. A good trigger includes specific action verbs, named patterns, and user-facing phrases that someone would actually say. Open a PR directly with the improved description line and a note on why the current phrasing misses some activations.',
      },
      {
        id: 'skill-becomes-published',
        question: 'How does a skill become published?',
        answer: 'A skill moves through the maturity ladder: skeleton -> draftable -> usable -> validated -> published. The key gate is the okhp3-skill-foundry benchmarking phase — the skill must demonstrate a measurable with/without quality gap across live executor runs, matched to its current version. Published status also requires a release record, catalog sync, a security gate, and review of the description for trigger recall quality. A skill is not promoted on the strength of a version-mismatched or historical benchmark.',
        links: [
          { label: 'okhp3-skill-foundry', href: '/skills/universal/okhp3-skill-foundry' },
        ],
      },
      {
        id: 'add-worked-example',
        question: 'How can I add a worked example?',
        answer: 'Open a PR adding a "## Examples" section to the SKILL.md with a concrete input/output pair. Examples should use realistic task descriptions and show what the skill actually produces — not idealized outputs. If the skill has a validation gate, your example should pass it.',
      },
    ],
  },
];
