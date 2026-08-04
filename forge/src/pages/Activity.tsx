import { useEffect, useState } from 'react';
import { useCatalog } from '../contexts/CatalogContext';
import { repoUrl, prUrl, issueUrl } from '../utils/github';
import { Link } from 'react-router-dom';
import Nav from '../components/layout/Nav';

interface ActivityCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}
interface ActivityFeed {
  generatedAt: string;
  commits: ActivityCommit[];
  fetchError: string | null;
}

const ACTIVITY_URL = `${import.meta.env.BASE_URL}data/activity.json`;

export default function Activity() {
  const catalog = useCatalog();
  const [feed, setFeed] = useState<ActivityFeed | null>(null);

  useEffect(() => {
    document.title = 'Activity | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(ACTIVITY_URL)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(String(res.status))))
      .then((data: ActivityFeed) => { if (!cancelled) setFeed(data); })
      .catch(() => { if (!cancelled) setFeed({ generatedAt: '', commits: [], fetchError: 'unavailable' }); });
    return () => { cancelled = true; };
  }, []);

  const recentSkills = [...catalog.skills]
    .filter(s => s.maturity !== 'placeholder')
    .sort((a, b) => (b.lastModified ? Date.parse(b.lastModified) : 0) - (a.lastModified ? Date.parse(a.lastModified) : 0))
    .slice(0, 10);

  return (
    <div data-page="activity">
      <Nav />
      <main className="container page-main" id="main-content">
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
            <h2>Recently updated skills</h2>
            <p className="activity-note">
              Ranked by last-modified commit date from the generated catalog — not a live feed. Refreshes each time the catalog rebuilds.
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
            <h2>Recent commits</h2>
            <p className="activity-note">
              Fetched from the GitHub REST API at build time — read-only, no live polling. Regenerated on every catalog rebuild.
            </p>
            {feed === null && <p className="activity-note">Loading…</p>}
            {feed?.fetchError && (
              <p className="activity-note">Commit history is temporarily unavailable. <a href={`${repoUrl()}/commits/main`} target="_blank" rel="noopener noreferrer">View on GitHub instead &rarr;</a></p>
            )}
            {feed && !feed.fetchError && feed.commits.length > 0 && (
              <ul className="activity-list activity-list--commits">
                {feed.commits.map(c => (
                  <li key={c.sha}>
                    <div>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="activity-commit-message">{c.message.split('\n')[0]}</a>
                      <span className="activity-commit-meta">{c.author} · {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <code className="mono-tag">{c.shortSha}</code>
                  </li>
                ))}
              </ul>
            )}
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
