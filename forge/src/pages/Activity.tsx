import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import { repoUrl, prUrl, issueUrl } from '../utils/github';
import { Link } from 'react-router-dom';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;

export default function Activity() {
  const recentSkills = [...catalog.skills]
    .filter(s => s.maturity !== 'placeholder')
    .slice(0, 10);

  return (
    <div data-page="activity">
      <Nav />
      <main className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        <div className="page-header">
          <h1>Activity</h1>
          <p>Recent catalog updates, open pull requests, and active issues. All links open the native GitHub page.</p>
        </div>

        <div style={{ padding: 'var(--space-6)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border-dark)', marginBottom: 'var(--space-8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
          <div>
            <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last indexed</span>
            <strong style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-dark)' }}>{new Date(catalog.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog size</span>
            <strong style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-dark)' }}>{catalog.skillCount} skills across {catalog.families.length} families</strong>
          </div>
        </div>

        <div className="activity-panels">
          <section className="activity-panel">
            <h2>Recent skills in catalog</h2>
            <ul className="activity-list">
              {recentSkills.map(skill => (
                <li key={skill.name}>
                  <div>
                    <Link to={`/skills/${skill.family}/${skill.name}`} style={{ fontWeight: 500, display: 'block' }}>{skill.name}</Link>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-steel)', fontFamily: 'var(--font-mono)' }}>{skill.family}</span>
                  </div>
                  <span data-maturity={skill.maturity}>{skill.maturity}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="activity-panel">
            <h2>On GitHub</h2>
            <ul className="activity-list" style={{ gap: 'var(--space-6)' }}>
              <li>
                <a href={`${repoUrl()}/commits/main`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Recent commits</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
              <li>
                <a href={prUrl()} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Open pull requests</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/issues?labels=enhancement`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Enhancement issues</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/issues?labels=new-skill`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>New skill proposals</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/releases`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Releases</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
              <li>
                <a href={`${repoUrl()}/discussions`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Discussions</span>
                  <span style={{ color: 'var(--color-copper)' }}>&rarr;</span>
                </a>
              </li>
            </ul>
            <p style={{ marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-dark)' }}>
              Activity data is not polled live. Use the GitHub links above for real-time information.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
