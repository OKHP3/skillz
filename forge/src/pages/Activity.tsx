import { useEffect } from 'react';
import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import { repoUrl, prUrl, issueUrl } from '../utils/github';
import { Link } from 'react-router-dom';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;

export default function Activity() {
  useEffect(() => {
    document.title = 'Activity | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  const recentSkills = [...catalog.skills]
    .filter(s => s.maturity !== 'placeholder')
    .slice(0, 10);

  return (
    <div data-page="activity">
      <Nav />
      <main className="container page-main">
        <div className="page-header">
          <h1>Activity</h1>
          <p>Recent catalog updates, open pull requests, and active issues. All links open the native GitHub page.</p>
        </div>

        <div className="activity-stats">
          <div>
            <span className="activity-stat-label">Last indexed</span>
            <strong className="activity-stat-value">{new Date(catalog.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
          <div>
            <span className="activity-stat-label">Catalog size</span>
            <strong className="activity-stat-value">{catalog.skillCount} skills across {catalog.families.length} families</strong>
          </div>
        </div>

        <div className="activity-panels">
          <section className="activity-panel">
            <h2>Catalog snapshot</h2>
            <p className="activity-note">
              This is a static sample from the generated catalog — not a live activity feed. For real commit history, open GitHub.
            </p>
            <ul className="activity-list">
              {recentSkills.map(skill => (
                <li key={skill.name}>
                  <div>
                    <Link to={`/skills/${skill.family}/${skill.name}`} className="activity-skill-link">{skill.displayName || skill.name}</Link>
                    <span className="activity-skill-family">{skill.family}</span>
                  </div>
                  <span data-maturity={skill.maturity}>{skill.maturity}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="activity-panel">
            <h2>On GitHub</h2>
            <ul className="activity-list activity-list--links">
              <li>
                <a href={`${repoUrl()}/commits/main`} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">Recent commits</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
              <li>
                <a href={prUrl()} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">Open pull requests</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/issues?labels=enhancement`} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">Enhancement issues</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/issues?labels=new-skill`} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">New skill proposals</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/releases`} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">Releases</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/discussions`} target="_blank" rel="noopener noreferrer" className="activity-github-link">
                  <span className="activity-link-label">Discussions</span>
                  <span className="activity-link-arrow">&rarr;</span>
                </a>
              </li>
            </ul>
            <p className="activity-footer-note">
              Activity data is not polled live. Use the GitHub links above for real-time information.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
