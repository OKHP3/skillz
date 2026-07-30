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
  draftable: 'Contract is written and reviewable. It is not yet benchmarked.',
  usable: 'Evidence-backed and exercised in a defined workflow. This is not the same as live validation.',
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
        <main className="container detail-not-found-main">
          <div className="detail-article detail-article--centered">
            <h1>Skill not found</h1>
            <p>No skill named <code>{skillName}</code> in the <code>{family}</code> family.</p>
            <Link to="/explore" className="btn detail-not-found-link">Browse all skills</Link>
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
      <main className="container">
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/explore">Explore</Link>
          <span aria-hidden>/</span>
          <Link to={`/explore?family=${skill.family}`}>{skill.family}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{displayName}</span>
        </div>

        <article className="detail-article">
          <header className="detail-header">
            <h1>{displayName}</h1>
            {showSlugSecondary && (
              <p className="detail-slug">{skill.name}</p>
            )}
            <div className="detail-meta">
              <span className="detail-meta-family">{skill.family}</span>
              <span data-maturity={skill.maturity} title={MATURITY_DESCRIPTIONS[skill.maturity]}>
                {skill.maturity}
              </span>
              {skill.version && <span>v{skill.version}</span>}
              <span>{skill.license}</span>
            </div>
            <p className="detail-path">{skill.path}</p>
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
            >
              {isFavorite(skill.name) ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="detail-install">
            <h2>Install</h2>
            <pre><code>{skill.rawUrl}</code></pre>
            <p className="detail-install-hint">
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
              <ul className="detail-triggers-list">
                {skill.triggers.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {skill.avoid.length > 0 && (
            <div>
              <h2>Do not use this when</h2>
              <ul className="detail-avoid-list">
                {skill.avoid.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          {(skill.inputs.length > 0 || skill.outputs.length > 0) && (
            <div className="detail-io-grid">
              {skill.inputs.length > 0 && (
                <div className="detail-io-panel--inputs">
                  <h3>Inputs</h3>
                  <ul className="detail-io-list">
                    {skill.inputs.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {skill.outputs.length > 0 && (
                <div className="detail-io-panel--outputs">
                  <h3>Outputs</h3>
                  <ul className="detail-io-list">
                    {skill.outputs.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {skill.boundaries.length > 0 && (
            <div>
              <h2>Scope and boundaries</h2>
              <ul className="detail-boundaries-list">
                {skill.boundaries.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {skill.tools.length > 0 && (
            <div>
              <h2>Tools</h2>
              <div className="detail-tags">
                {skill.tools.map((t, i) => (
                  <span key={i} className="detail-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {skill.runtimes.length > 0 && (
            <div>
              <h2>Runtimes</h2>
              <div className="detail-tags">
                {skill.runtimes.map((r, i) => (
                  <span key={i} className="detail-tag">{r}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-maturity-box">
            <h2>Maturity: <span>{skill.maturity}</span></h2>
            <p>{MATURITY_DESCRIPTIONS[skill.maturity]}</p>
            <p className="detail-maturity-evidence">
              <strong>Evidence state:</strong> {skill.evidenceStatus.replace('-', ' ')}. {skill.evidenceNote}
            </p>
            <Link to="/faq#maturity-label" className="detail-maturity-link">What maturity labels mean &rarr;</Link>
          </div>

          {skill.examples.length > 0 && (
            <div>
              <h2>Examples</h2>
              <ul className="detail-examples-list">
                {skill.examples.map((ex, i) => (
                  <li key={i}><code>{ex}</code></li>
                ))}
              </ul>
            </div>
          )}

          {skill.companions.length > 0 && (
            <div>
              <h2>Companion skills</h2>
              <ul className="detail-companions-list">
                {skill.companions.map(cName => {
                  const companion = catalog.skills.find(s => s.name === cName);
                  return (
                    <li key={cName}>
                      {companion ? (
                        <Link
                          to={`/skills/${companion.family}/${companion.name}`}
                          className="detail-companion-link"
                        >
                          {companion.displayName || companion.name}
                        </Link>
                      ) : (
                        <span className="detail-companion-unresolved">{cName}</span>
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
              <ul className="detail-related-list">
                {related.filter(r => !skill.companions.includes(r.name)).map(r => (
                  <li key={r.name} className="detail-related-item">
                    <Link to={`/skills/${r.family}/${r.name}`}>
                      {r.displayName || r.name}
                    </Link>
                    <p className="detail-related-desc">
                      {r.description ? r.description.slice(0, 80) + (r.description.length > 80 ? '…' : '') : ''}
                    </p>
                    <div className="detail-related-meta">
                      <span className="detail-related-family">{r.family}</span>
                      <span data-maturity={r.maturity}>{r.maturity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="detail-provenance">
            <h2>Provenance</h2>
            <dl>
              {skill.author && <>
                <dt>Author</dt>
                <dd>{skill.author}</dd>
              </>}
              {skill.origin && <>
                <dt>Origin</dt>
                <dd>{skill.origin}</dd>
              </>}
              <dt>Source</dt>
              <dd>{skill.path}</dd>
              {skill.lastModified && <>
                <dt>Last modified</dt>
                <dd>{formatDate(skill.lastModified)}</dd>
              </>}
              <dt>Evidence</dt>
              <dd className="detail-evidence-dd">{skill.evidenceStatus.replace('-', ' ')}</dd>
              {skill.commitSha && <>
                <dt>Commit</dt>
                <dd>
                  <a href={`https://github.com/OKHP3/skillz/commit/${skill.commitSha}`} target="_blank" rel="noopener noreferrer">
                    {skill.commitSha.slice(0, 8)}
                  </a>
                </dd>
              </>}
            </dl>
          </div>

          <div className="detail-contribute">
            <h2>Contribute</h2>
            <div className="detail-contribute-actions">
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
            <p>
              Found a problem or missing example?{' '}
              <a href={issueUrl({ title: `Improve: ${skill.name}`, body: `**Skill:** \`${skill.name}\`\n\n**Issue:**`, labels: ['enhancement'] })} target="_blank" rel="noopener noreferrer" className="detail-contribute-issue-link">
                Open an issue on GitHub.
              </a>
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
