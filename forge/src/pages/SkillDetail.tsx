import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import { getRelatedSkills } from '../utils/search';
import { copyInstallUrl as copyInstallCommand, copyRawUrl, shareSkill, useFavorites } from '../utils/clipboard';
import { issueUrl, skillGitHubUrl } from '../utils/github';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;

const MATURITY_DESCRIPTIONS: Record<string, string> = {
  placeholder: 'Directory reserved. No content yet.',
  skeleton: 'Structure and trigger phrases present. Body incomplete.',
  draftable: 'Usable in practice. Not yet benchmarked.',
  usable: 'Benchmarked and in active production use.',
  validated: 'Passed live eval benchmarks with a measurable quality gap.',
  published: 'Production-ready. Official distribution surface.',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export default function SkillDetail() {
  const { family, skillName } = useParams();
  const skill = catalog.skills.find(s => s.family === family && s.name === skillName);
  const [copied, setCopied] = useState<'install' | 'url' | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (skill) document.title = `${skill.displayName || skill.name} | Skillz Forge`;
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, [skill?.name]);

  if (!skill) {
    return (
      <div data-page="skill-detail">
        <Nav />
        <main className="container" style={{ padding: 'var(--space-12) 0' }}>
          <div className="detail-article" style={{ textAlign: 'center', margin: '0 auto' }}>
            <h1 style={{ marginTop: 0 }}>Skill not found</h1>
            <p>No skill named <code>{skillName}</code> in the <code>{family}</code> family.</p>
            <Link to="/explore" className="btn" style={{ marginTop: 'var(--space-6)' }}>Browse all skills</Link>
          </div>
        </main>
      </div>
    );
  }

  const related = getRelatedSkills(skill, catalog.skills);

  async function handleCopyInstall() {
    const ok = await copyInstallCommand(skill!);
    if (ok) { setCopied('install'); setTimeout(() => setCopied(null), 2000); }
  }

  async function handleCopyUrl() {
    const ok = await copyRawUrl(skill!);
    if (ok) { setCopied('url'); setTimeout(() => setCopied(null), 2000); }
  }

  async function handleShare() {
    await shareSkill(skill!);
  }

  function handleFavorite() {
    toggleFavorite(skill!.name);
    forceUpdate(n => n + 1);
  }

  const displayName = skill.displayName || skill.name;
  const showSlugSecondary = skill.displayName && skill.displayName !== skill.name;

  return (
    <div data-page="skill-detail">
      <Nav />
      <main className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/explore">Explore</Link>
          <span aria-hidden>/</span>
          <Link to={`/explore?family=${skill.family}`}>{skill.family}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" style={{ color: 'var(--color-text-dark)' }}>{displayName}</span>
        </div>

        <article className="detail-article" style={{ margin: '0 auto' }}>
          <header style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--space-2)' }}>{displayName}</h1>
            {showSlugSecondary && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted-light)', marginBottom: 'var(--space-4)' }}>
                {skill.name}
              </p>
            )}
            <div className="detail-meta">
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-steel)' }}>{skill.family}</span>
              <span data-maturity={skill.maturity} title={MATURITY_DESCRIPTIONS[skill.maturity]}>
                {skill.maturity}
              </span>
              {skill.version && <span>v{skill.version}</span>}
              <span>{skill.license}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted-light)', marginTop: 'var(--space-2)' }}>
              {skill.path}
            </p>
          </header>

          <div className="detail-actions" aria-label="Skill actions">
            <button className="btn" onClick={handleCopyInstall}>
              {copied === 'install' ? 'Copied!' : 'Copy install URL'}
            </button>
            <button className="btn btn-outline" onClick={handleCopyUrl}>
              {copied === 'url' ? 'Copied!' : 'Copy raw URL'}
            </button>
            <a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Open on GitHub
            </a>
            <button className="btn-ghost" onClick={handleShare}>Share</button>
            <button className="btn-ghost" onClick={() => navigate(`/compare?skills=${encodeURIComponent(skill!.name)}`)}>Compare</button>
            <button
              className="btn-ghost"
              onClick={handleFavorite}
              aria-pressed={isFavorite(skill.name)}
              style={{ color: isFavorite(skill.name) ? 'var(--color-copper)' : undefined }}
            >
              {isFavorite(skill.name) ? 'Saved' : 'Save'}
            </button>
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <h2>Install</h2>
            <pre style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', border: '1px solid var(--color-border-dark)', overflowX: 'auto', color: 'var(--color-text-dark)' }}>
              <code>{skill.rawUrl}</code>
            </pre>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-light)' }}>
              Paste this URL into your agent's context, Claude Project, or agent instructions file.
            </p>
          </div>

          <div>
            <h2>What it does</h2>
            <p>{skill.description}</p>
          </div>

          {skill.triggers.length > 0 && (
            <div>
              <h2>Use this when</h2>
              <ul style={{ listStyleType: 'square', paddingLeft: 'var(--space-6)' }}>
                {skill.triggers.map((t, i) => <li key={i} style={{ marginBottom: 'var(--space-2)' }}>{t}</li>)}
              </ul>
            </div>
          )}

          {skill.avoid.length > 0 && (
            <div>
              <h2>Do not use this when</h2>
              <ul style={{ listStyleType: 'square', paddingLeft: 'var(--space-6)', color: 'var(--color-ember)' }}>
                {skill.avoid.map((a, i) => <li key={i} style={{ marginBottom: 'var(--space-2)' }}>{a}</li>)}
              </ul>
            </div>
          )}

          {(skill.inputs.length > 0 || skill.outputs.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
              {skill.inputs.length > 0 && (
                <div style={{ borderLeft: '3px solid var(--color-steel)', paddingLeft: 'var(--space-4)' }}>
                  <h3 style={{ marginTop: 0, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-steel)' }}>Inputs</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {skill.inputs.map((item, i) => (
                      <li key={i} style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-muted-light)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {skill.outputs.length > 0 && (
                <div style={{ borderLeft: '3px solid var(--color-copper)', paddingLeft: 'var(--space-4)' }}>
                  <h3 style={{ marginTop: 0, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-copper)' }}>Outputs</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {skill.outputs.map((item, i) => (
                      <li key={i} style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-muted-light)' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {skill.boundaries.length > 0 && (
            <div>
              <h2>Scope and boundaries</h2>
              <ul style={{ listStyleType: 'square', paddingLeft: 'var(--space-6)' }}>
                {skill.boundaries.map((b, i) => <li key={i} style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>{b}</li>)}
              </ul>
            </div>
          )}

          {skill.tools.length > 0 && (
            <div>
              <h2>Tools</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {skill.tools.map((t, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'var(--color-bg)', color: 'var(--color-text-muted-light)', padding: '2px 8px', border: '1px solid var(--color-border-light)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {skill.runtimes.length > 0 && (
            <div>
              <h2>Runtimes</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {skill.runtimes.map((r, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'var(--color-bg)', color: 'var(--color-text-muted-light)', padding: '2px 8px', border: '1px solid var(--color-border-light)' }}>{r}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(0,0,0,0.03)', padding: 'var(--space-6)', borderLeft: '4px solid var(--color-steel)', marginTop: 'var(--space-8)' }}>
            <h2 style={{ marginTop: 0, border: 'none', padding: 0 }}>Maturity: <span style={{ textTransform: 'capitalize' }}>{skill.maturity}</span></h2>
            <p style={{ marginBottom: 'var(--space-2)' }}>{MATURITY_DESCRIPTIONS[skill.maturity]}</p>
            <Link to="/faq#maturity-label" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>What maturity labels mean &rarr;</Link>
          </div>

          {skill.examples.length > 0 && (
            <div>
              <h2>Examples</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {skill.examples.map((ex, i) => (
                  <li key={i} style={{ background: 'var(--color-bg)', color: 'var(--color-text-dark)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', borderLeft: '2px solid var(--color-copper)' }}>
                    <code>{ex}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skill.companions.length > 0 && (
            <div>
              <h2>Companion skills</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                {skill.companions.map(cName => {
                  const companion = catalog.skills.find(s => s.name === cName);
                  return (
                    <li key={cName}>
                      {companion ? (
                        <Link
                          to={`/skills/${companion.family}/${companion.name}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', background: 'var(--color-bg)', color: 'var(--color-text-dark)', padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border-light)', display: 'block' }}
                        >
                          {companion.displayName || companion.name}
                        </Link>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-light)', padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-border-light)', display: 'block' }}>
                          {cName}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {related.filter(r => !skill.companions.includes(r.name)).length > 0 && (
            <div>
              <h2>Related skills</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                {related.filter(r => !skill.companions.includes(r.name)).map(r => (
                  <li key={r.name} style={{ border: '1px solid var(--color-border-light)', padding: 'var(--space-4)' }}>
                    <Link to={`/skills/${r.family}/${r.name}`} style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      {r.displayName || r.name}
                    </Link>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted-light)', margin: '0 0 var(--space-2)' }}>
                      {r.description ? r.description.slice(0, 80) + (r.description.length > 80 ? '…' : '') : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--color-steel)' }}>{r.family}</span>
                      <span data-maturity={r.maturity}>{r.maturity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)' }}>
            <h2 style={{ marginTop: 0, border: 'none', padding: 0, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted-light)' }}>Provenance</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-1) var(--space-6)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {skill.author && <>
                <dt style={{ color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>Author</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{skill.author}</dd>
              </>}
              {skill.origin && <>
                <dt style={{ color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>Origin</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{skill.origin}</dd>
              </>}
              <dt style={{ color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>Source</dt>
              <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{skill.path}</dd>
              {skill.lastModified && <>
                <dt style={{ color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>Last modified</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{formatDate(skill.lastModified)}</dd>
              </>}
              {skill.commitSha && <>
                <dt style={{ color: 'var(--color-text-muted-light)', whiteSpace: 'nowrap' }}>Commit</dt>
                <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                  <a href={`https://github.com/OKHP3/skillz/commit/${skill.commitSha}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-steel)' }}>
                    {skill.commitSha.slice(0, 8)}
                  </a>
                </dd>
              </>}
            </dl>
          </div>

          <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border-light)' }}>
            <h2>Contribute</h2>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              <a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                View source file
              </a>
              <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                View raw SKILL.md
              </a>
              <a href={`https://github.com/OKHP3/skillz/commits/main/${skill.path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Commit history
              </a>
              <a href={issueUrl({ title: `Improve: ${skill.name}`, labels: ['enhancement'] })} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Open an issue
              </a>
            </div>
            <p style={{ color: 'var(--color-text-muted-light)' }}>
              Found a problem or missing example?{' '}
              <a href={issueUrl({ title: `Improve: ${skill.name}`, body: `**Skill:** \`${skill.name}\`\n\n**Issue:**`, labels: ['enhancement'] })} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                Open an issue on GitHub.
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
