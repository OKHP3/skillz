import { bugReportUrl, newSkillUrl, improveSkillUrl, prUrl, discussionsUrl, repoUrl } from '../utils/github';
import Nav from '../components/layout/Nav';

const ACTIONS = [
  {
    id: 'bug',
    label: 'Report a bug',
    description: 'Something in a skill produces wrong or harmful output.',
    how: 'Open a GitHub issue with the label "bug". Include the skill name, the input you gave, and what you expected vs. what happened.',
    href: (name = '', path = '') => bugReportUrl(name || 'skill-name'),
    linkLabel: 'Open a bug report',
  },
  {
    id: 'new-skill',
    label: 'Suggest a new skill',
    description: 'You have a recurring agent task that would benefit from a formal skill.',
    how: 'Open a GitHub issue with the label "new-skill". Describe the task, the agent behaviors you want it to govern, and the family it belongs to.',
    href: () => newSkillUrl(),
    linkLabel: 'Suggest a new skill',
  },
  {
    id: 'improve-trigger',
    label: 'Improve a description or trigger phrase',
    description: 'A skill does not activate when it should, or activates when it should not.',
    how: 'Open a pull request with the specific description line changed and a note on why the current phrasing misses activations. The trigger description is the most impactful single line in a SKILL.md.',
    href: () => prUrl(),
    linkLabel: 'Open a pull request',
  },
  {
    id: 'add-example',
    label: 'Add a worked example',
    description: 'A skill is functional but lacks a concrete example for new users.',
    how: 'Open a PR adding an "## Examples" section with a realistic input/output pair. Examples must use realistic task descriptions and show actual outputs, not idealized ones.',
    href: () => prUrl(),
    linkLabel: 'Open a pull request',
  },
  {
    id: 'companion',
    label: 'Propose a companion skill relationship',
    description: 'You have found that two skills work well together in a way not documented.',
    how: 'Open a GitHub issue describing the combination, the task context, and why the pairing matters. Include a brief description of what each skill contributes.',
    href: () => `https://github.com/OKHP3/skillz/issues/new?labels=companion&title=Companion+relationship%3A+`,
    linkLabel: 'Open an issue',
  },
  {
    id: 'security',
    label: 'Report a security or privacy concern',
    description: 'A skill contains credentials, employer-confidential content, or other sensitive material.',
    how: 'Do not open a public issue. Use GitHub\'s private security advisory feature or contact the repository owner directly.',
    href: () => 'https://github.com/OKHP3/skillz/security/advisories/new',
    linkLabel: 'Open a security advisory',
    sensitive: true,
  },
  {
    id: 'review-pr',
    label: 'Review an open pull request',
    description: 'Help maintain quality by reviewing proposed changes.',
    how: 'Browse open pull requests on GitHub and leave a review. Focus on trigger description accuracy, boundary clarity, and example realism.',
    href: () => prUrl(),
    linkLabel: 'Browse open pull requests',
  },
];

export default function Contribute() {
  return (
    <div data-page="contribute">
      <Nav />
      <main className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        <div className="page-header">
          <h1>Contribute</h1>
          <p>The catalog improves through pull requests, issues, and discussion. Every improvement — from a corrected trigger phrase to a new benchmarked skill — makes the catalog more useful for everyone.</p>
        </div>

        <ul className="contribute-list">
          {ACTIONS.map(action => (
            <li key={action.id} className="contribute-card" data-sensitive={action.sensitive}>
              <h2>{action.label}</h2>
              <p>{action.description}</p>
              <div style={{ background: 'var(--color-bg)', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-dark)', marginBottom: 'var(--space-6)', borderLeft: action.sensitive ? '2px solid var(--color-ember)' : '2px solid var(--color-steel)' }}>
                {action.how}
              </div>
              <a
                href={action.href()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
              >
                {action.linkLabel} &rarr;
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-16)' }}>
          <div style={{ padding: 'var(--space-8)', border: '1px solid var(--color-border-dark)' }}>
            <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-4)' }}>Discuss before you build</h2>
            <p style={{ color: 'var(--color-text-muted-dark)', marginBottom: 'var(--space-6)' }}>Not sure whether your idea fits? Start a discussion. Maintainers can confirm scope and naming before you invest time drafting.</p>
            <a href={discussionsUrl()} target="_blank" rel="noopener noreferrer" className="btn">
              GitHub Discussions &rarr;
            </a>
          </div>

          <div style={{ padding: 'var(--space-8)', border: '1px solid var(--color-border-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-4)' }}>The Repository</h2>
            <p style={{ color: 'var(--color-text-muted-dark)', marginBottom: 'var(--space-6)' }}>Explore the raw source code, star the project, or fork it to build your own private skills catalog.</p>
            <a href={repoUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
              View on GitHub &rarr;
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
