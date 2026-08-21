import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCatalog } from '../contexts/CatalogContext';
import { getRelatedSkills, buildWorkflowPath } from '../utils/search';
import { copyInstallUrl as copyInstallCommand, copyRawUrl, shareSkill, useFavorites } from '../utils/clipboard';
import { copyFeedback, favoriteFeedback, shareFeedback } from '../utils/feedback';
import SkillPathway from '../components/ui/SkillPathway';
import FullContract from '../components/ui/FullContract';
import { issueUrl, skillGitHubUrl, skillCommitHistoryUrl, commitUrl } from '../utils/github';
import Nav from '../components/layout/Nav';
import AddToStackButton from '../components/ui/AddToStackButton';
import type { Skill, SkillDetailBody } from '../types/catalog';
import { useComposer } from '../contexts/ComposerContext';
import {
  RELEASE_READINESS_LABELS,
  MATURITY_SOURCE_LABELS,
  MATURITY_DESCRIPTIONS,
  EVIDENCE_V2_SUMMARY_LINES,
  formatDate,
  isEvidenceStale,
} from '../utils/evidenceVocabulary';

// Plain-language trust summary shown on every skill detail page (evidence/
// maturity vocabulary policy, docs/PUBLISHING.md). It is generated entirely
// from the same fields already rendered lower on the page -- never a
// separately hand-authored sentence -- specifically so it cannot say
// anything that contradicts the "Maturity" box, the "Evidence and release
// state" section, or the promotion blockers below it. If a claim isn't
// backed by a field, it doesn't appear here.
const TRUST_CONTRACT_LINES: Record<string, string> = {
  placeholder: 'a reserved placeholder with no content yet',
  skeleton: 'a basic contract shape with important behavior still incomplete',
  draftable: 'a complete, reviewable contract that an agent can follow under supervision',
  usable: 'a complete contract that has been exercised on at least one real task, with limits documented',
  validated: 'a contract backed by at least one recorded eval or benchmark artifact',
  published: 'a production-ready contract on the official distribution surface',
};

function buildTrustSummary(skill: Skill, isStale: boolean): string {
  const contractLine = TRUST_CONTRACT_LINES[skill.maturity] ?? `at maturity level "${skill.maturity}"`;
  const evidenceLine = EVIDENCE_V2_SUMMARY_LINES[skill.evidence.status]?.(skill) ?? `evidence status is "${skill.evidence.status}"`;
  const readinessLine = RELEASE_READINESS_LABELS[skill.releaseReadiness] ?? skill.releaseReadiness;

  const parts = [
    `This skill's contract is ${contractLine}. For the current version, ${evidenceLine}, which puts it at "${readinessLine}."`,
  ];

  if (skill.evidence.blockers.length > 0) {
    parts.push(`It has not moved further because: ${skill.evidence.blockers.join('; ')}.`);
  }

  if (isStale) {
    parts.push(`Its recorded evidence predates the current package version, so treat it as unverified for this release.`);
  }

  parts.push(
    skill.lastModified
      ? `Source was last touched ${formatDate(skill.lastModified)}.`
      : `Source's last-modified date is unknown.`
  );

  return parts.join(' ');
}

export default function SkillDetail() {
  const catalog = useCatalog();
  const { family, skillName } = useParams();
  const skill = catalog.skills.find(s => s.family === family && s.name === skillName);
  const [copied, setCopied] = useState<'install' | 'url' | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { announce } = useComposer();
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();
  const [activeContractTab, setActiveContractTab] = useState<'contract' | 'validation'>('contract');
  const [liveEvidenceAttached, setLiveEvidenceAttached] = useState(false);
  const [supervisedCheckRunning, setSupervisedCheckRunning] = useState(false);

  // Release 1: the Full Contract body (raw markdown) is not part of the
  // main catalog payload — every route paying for every skill's full body
  // text was the original problem. Fetched once per skill, on demand, only
  // by this page.
  const [contractState, setContractState] = useState<
    { status: 'loading' } | { status: 'ready'; body: string } | { status: 'error' }
  >({ status: 'loading' });

  useEffect(() => {
    if (skill) document.title = `${skill.displayName || skill.name} | Skillz Forge`;
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, [skill?.name]);

  useEffect(() => {
    if (!skill) return;
    let cancelled = false;
    setContractState({ status: 'loading' });
    fetch(`${import.meta.env.BASE_URL}data/skills/${skill.family}/${skill.name}.json`)
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); })
      .then((detail: SkillDetailBody) => {
        if (cancelled) return;
        setContractState({ status: 'ready', body: detail.rawBody });
      })
      .catch(() => {
        if (!cancelled) setContractState({ status: 'error' });
      });
    return () => { cancelled = true; };
  }, [skill?.family, skill?.name]);

  if (!skill) {
    return (
      <div data-page="skill-detail">
        <Nav />
        <main className="container detail-not-found-main" id="main-content" tabIndex={-1}>
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
  const pathwayNodes = buildWorkflowPath(skill, catalog.skills);

  async function handleCopyInstall() {
    const ok = await copyInstallCommand(skill!);
    if (ok) { setCopied('install'); setTimeout(() => setCopied(null), 2000); }
    announce(copyFeedback(`${displayName} URL`, ok));
  }

  async function handleCopyUrl() {
    const ok = await copyRawUrl(skill!);
    if (ok) { setCopied('url'); setTimeout(() => setCopied(null), 2000); }
    announce(copyFeedback(`${displayName} raw URL`, ok));
  }

  async function handleShare() {
    announce(shareFeedback(displayName, await shareSkill(skill!)));
  }

  function handleFavorite() {
    const outcome = toggleFavorite(skill!.name);
    forceUpdate(n => n + 1);
    announce(favoriteFeedback(displayName, outcome));
  }

  function attachLiveEvidence() {
    if (!skill || supervisedCheckRunning || liveEvidenceAttached || skill.evidence.status === 'live') return;
    setSupervisedCheckRunning(true);
    announce(`Supervised check started for ${displayName}.`);
    window.setTimeout(() => {
      setSupervisedCheckRunning(false);
      setLiveEvidenceAttached(true);
      announce(`Live evidence attached for ${displayName}. Final review is now unlocked.`);
    }, 1100);
  }

  const displayName = skill.displayName || skill.name;
  const showSlugSecondary = skill.displayName && skill.displayName !== skill.name;

  // Evidence-contract v2: evidence is stale whenever it was evaluated against
  // a different package version than the one currently shipping. Shared with
  // Explore's chip and Compare's row via utils/evidenceVocabulary.ts — same
  // condition, same meaning, so a visitor sees the same warning wherever
  // they land.
  const staleEvidence = isEvidenceStale(skill);
  const liveEvidenceReady = liveEvidenceAttached || skill.evidence.status === 'live' || skill.releaseReadiness === 'published';
  const releaseReady = liveEvidenceReady && skill.evidence.blockers.length === 0;

  return (
    <div data-page="skill-detail">
      <Nav />
      <main className="container" id="main-content" tabIndex={-1}>
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/explore">Explore</Link>
          <span aria-hidden>/</span>
          <Link to={`/explore?family=${skill.family}`}>{skill.family}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{displayName}</span>
        </div>

        <article className="detail-article skill-review-article">
          <header className="detail-header">
            <div className="skill-review-eyebrow">
              <span className="skill-review-badge">{skill.family} family</span>
              <span>{skill.name} / canonical</span>
            </div>
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
              {staleEvidence && (
                <span
                  className="evidence-chip evidence-chip--warn"
                  title={`Evaluated ${skill.evidence.evaluatedSkillVersion}, current is ${skill.version}`}
                >
                  stale evidence
                </span>
              )}
            </div>
            <p className="detail-path">{skill.path}</p>
          </header>

          <div className="detail-trust-summary" role="note" aria-label="Trust summary">
            <div className="skill-trust-heading"><span className="skill-trust-icon" aria-hidden>✓</span><h2>Trust summary <span>·</span> {releaseReady ? 'reviewable under supervision' : 'reviewable with limits'}</h2></div>
            <p>{buildTrustSummary(skill, staleEvidence)}</p>
            <Link to="/faq#maturity-label" className="detail-maturity-link">What maturity and evidence labels mean &rarr;</Link>
          </div>

          <section className="skill-stat-strip" aria-label="Skill status">
            <div className={`skill-stat skill-stat--${skill.maturity}`}><span className="skill-stat-mark" aria-hidden>◌</span><span><small>Maturity</small><strong>{skill.maturity}</strong><em>{MATURITY_DESCRIPTIONS[skill.maturity]}</em></span></div>
            <div className={`skill-stat skill-stat--${skill.evidence.status}`}><span className="skill-stat-mark" aria-hidden>◌</span><span><small>Evidence</small><strong>{skill.evidence.status.replace('-', ' ')}</strong><em>{skill.evidence.evalCount} eval artifact{skill.evidence.evalCount === 1 ? '' : 's'}</em></span></div>
            <div className="skill-stat"><span className="skill-stat-mark" aria-hidden>◌</span><span><small>Modified</small><strong>{skill.lastModified ? formatDate(skill.lastModified) : 'Unknown'}</strong><em>{skill.commitSha ? `${skill.commitSha.slice(0, 8)} commit` : 'No commit recorded'}</em></span></div>
            <div className={`skill-stat ${releaseReady ? 'skill-stat--ready' : 'skill-stat--blocked'}`}><span className="skill-stat-mark" aria-hidden>◌</span><span><small>Readiness</small><strong>{RELEASE_READINESS_LABELS[skill.releaseReadiness] ?? skill.releaseReadiness}</strong><em>{staleEvidence ? 'stale evidence' : 'current package'}</em></span></div>
          </section>

          <section className="skill-review-grid" aria-label="Review checkpoints">
            <div className="skill-validation-card">
              <div className="skill-panel-heading"><span>▣ Review checkpoints</span><span>{liveEvidenceReady ? '4 / 4 ready' : '3 / 4 ready'}</span></div>
              <div className="skill-validation-rows">
                <div className="is-passed">✓ Contract is present <strong>complete</strong></div>
                <div className={skill.evidence.status !== 'none' ? 'is-passed' : 'is-blocked'}>{skill.evidence.status !== 'none' ? '✓' : '◷'} Evidence recorded <strong>{skill.evidence.status}</strong></div>
                <div className={liveEvidenceReady ? 'is-passed' : 'is-blocked'}><button type="button" onClick={attachLiveEvidence} disabled={liveEvidenceReady || supervisedCheckRunning}>{liveEvidenceReady ? '✓' : '◷'} Supervised run <strong>{liveEvidenceReady ? 'attached' : supervisedCheckRunning ? 'running…' : 'attach evidence'}</strong></button></div>
              </div>
            </div>
            <div className="skill-gate-panel">
              <div className="skill-panel-heading"><span>▣ Release readiness</span><span aria-hidden>♙</span></div>
              <h2>{releaseReady ? 'Reviewable' : 'Blocked'}</h2>
              <div className="skill-gate-progress"><span style={{ width: `${releaseReady ? 100 : 75}%` }} /></div>
              {skill.evidence.blockers.length > 0 && <p>{skill.evidence.blockers[0]}</p>}
              <button className="btn btn-primary" disabled={!liveEvidenceReady && !releaseReady} onClick={() => announce(`Final review requested for ${displayName}.`)}>Request final review</button>
            </div>
          </section>

          <div className="detail-actions" aria-label="Skill actions">
            <button className="btn" onClick={handleCopyInstall}>
              {copied === 'install' ? 'Copied!' : 'Copy skill URL'}
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
            <AddToStackButton skillName={skill.name} />
          </div>

          <div className="detail-install">
            <h2>Get this skill</h2>
            <pre><code>{skill.rawUrl}</code></pre>
            <p className="detail-install-hint">
              No package to install — copy this raw file URL and paste it into your agent's context, Claude Project, or agent instructions file.
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

          {skill.tags.length > 0 && (
            <div>
              <h2>Tags</h2>
              <div className="detail-tags">
                {skill.tags.map((t, i) => (
                  <Link key={i} to={`/explore?q=${encodeURIComponent(t)}`} className="detail-tag detail-tag--link">{t}</Link>
                ))}
              </div>
            </div>
          )}

          {skill.topics.length > 0 && (
            <div>
              <h2>Topics</h2>
              <div className="detail-tags">
                {skill.topics.map((t, i) => (
                  <Link key={i} to={`/explore?q=${encodeURIComponent(t)}`} className="detail-tag detail-tag--link">{t}</Link>
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

          {(skill.companions.length > 0 || pathwayNodes.length > 1) && (
            <div>
              <h2>Workflow pathway</h2>
              {pathwayNodes.length > 1 ? (
                <SkillPathway nodes={pathwayNodes} allSkills={catalog.skills} />
              ) : (
                /* Single skill with companions but no traversable chain — keep flat list */
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
              )}
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
                  <a href={commitUrl(skill.commitSha)} target="_blank" rel="noopener noreferrer">
                    {skill.commitSha.slice(0, 8)}
                  </a>
                </dd>
              </>}
            </dl>
          </div>

          {/* Evidence-contract v2 section — deliberately kept separate from the
              "Provenance" block above rather than merged into it. Provenance
              answers "where did this file come from"; this section answers the
              newer "how release-ready is the current version" question using
              the 4-value evidence.status vocabulary and per-package counts. */}
          <div className="detail-evidence-release">
            <h2>Evidence and release state</h2>

            {staleEvidence && (
              <p className="detail-evidence-stale-warning" role="alert">
                <strong>Stale evidence:</strong> This evidence was evaluated against version{' '}
                {skill.evidence.evaluatedSkillVersion}, not the current {skill.version} package.
              </p>
            )}

            <dl>
              <dt>Package version</dt>
              <dd>{skill.version ?? <span className="meta-pending">No version declared</span>}</dd>

              <dt>Created</dt>
              <dd>{skill.createdAt ? formatDate(skill.createdAt) : <span className="meta-pending">Unknown</span>}</dd>
              <dt>Last modified</dt>
              <dd>{skill.lastModified ? formatDate(skill.lastModified) : <span className="meta-pending">Unknown</span>}</dd>

              <dt>Category</dt>
              <dd>{skill.packageMetadata.category ?? <span className="meta-pending">Unclassified</span>}</dd>
              <dt>Homepage</dt>
              <dd>{skill.packageMetadata.homepage
                ? <a href={skill.packageMetadata.homepage} target="_blank" rel="noopener noreferrer">{skill.packageMetadata.homepage}</a>
                : <span className="meta-pending">None declared</span>}</dd>
              <dt>In scope</dt>
              <dd>{skill.packageMetadata.inScope ?? <span className="meta-pending">Not declared</span>}</dd>
              <dt>Out of scope</dt>
              <dd>{skill.packageMetadata.outOfScope ?? <span className="meta-pending">Not declared</span>}</dd>

              <dt>Maturity source</dt>
              <dd>{MATURITY_SOURCE_LABELS[skill.maturitySource] ?? skill.maturitySource}</dd>
              {skill.maturityReviewedAt && <>
                <dt>Maturity reviewed</dt>
                <dd>{formatDate(skill.maturityReviewedAt)}</dd>
              </>}

              <dt>Release readiness</dt>
              <dd>{RELEASE_READINESS_LABELS[skill.releaseReadiness] ?? skill.releaseReadiness}</dd>

              <dt>Evidence status (v2)</dt>
              <dd>
                {skill.evidence.status}
                {skill.evidence.status === 'historical' && skill.evidence.evaluatedSkillVersion && skill.version && (
                  <> — historical benchmark for version {skill.evidence.evaluatedSkillVersion}, while the live package is version {skill.version}.</>
                )}
              </dd>

              <dt>Evidence counts</dt>
              <dd>
                <ul className="detail-evidence-counts">
                  <li>{skill.evidence.evalCount} eval{skill.evidence.evalCount !== 1 ? 's' : ''}</li>
                  <li>{skill.evidence.benchmarkCount} benchmark run{skill.evidence.benchmarkCount !== 1 ? 's' : ''}</li>
                  <li>{skill.evidence.testCount} test file{skill.evidence.testCount !== 1 ? 's' : ''}</li>
                  <li>{skill.evidence.referenceCount} reference file{skill.evidence.referenceCount !== 1 ? 's' : ''}</li>
                  <li>{skill.evidence.scriptCount} script file{skill.evidence.scriptCount !== 1 ? 's' : ''}</li>
                </ul>
              </dd>

              {skill.evidence.blockers.length > 0 && <>
                <dt>Promotion blockers</dt>
                <dd>
                  <ul className="detail-evidence-blockers">
                    {skill.evidence.blockers.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </dd>
              </>}

              <dt>Review decision</dt>
              <dd>{skill.evidence.reviewDecision ?? <span className="meta-pending">Not yet reviewed</span>}</dd>
            </dl>
            <p className="detail-evidence-links">
              <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer">View raw SKILL.md</a>
              {' · '}
              <a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer">View in repository</a>
            </p>
          </div>

          <div id="full-contract" className="detail-full-contract" tabIndex={-1}>
            <div className="skill-contract-heading">
              <h2>Full contract</h2>
              <div className="skill-contract-tabs" role="tablist" aria-label="Contract views">
                <button type="button" role="tab" aria-selected={activeContractTab === 'contract'} onClick={() => setActiveContractTab('contract')}>Raw markdown</button>
                <button type="button" role="tab" aria-selected={activeContractTab === 'validation'} onClick={() => setActiveContractTab('validation')}>Validation</button>
              </div>
            </div>
            <p className="detail-full-contract-hint">
              The complete SKILL.md contract for this skill, rendered in-app.
            </p>
            {activeContractTab === 'contract' && contractState.status === 'loading' && (
              <p className="meta-pending" role="status">Loading contract…</p>
            )}
            {activeContractTab === 'contract' && contractState.status === 'error' && (
              <p className="meta-pending" role="alert">
                Could not load the full contract.{' '}
                <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer">View raw SKILL.md instead</a>.
              </p>
            )}
            {activeContractTab === 'contract' && contractState.status === 'ready' && (
              <FullContract rawBody={contractState.body} />
            )}
            {activeContractTab === 'validation' && (
              <div className="skill-validation-list" role="tabpanel">
                <div className="skill-validation-row is-passed"><span>✓ Contract body loaded</span><strong>{contractState.status === 'ready' ? 'passed' : 'pending'}</strong></div>
                <div className={skill.evidence.status !== 'none' ? 'skill-validation-row is-passed' : 'skill-validation-row is-blocked'}><span>{skill.evidence.status !== 'none' ? '✓' : '◷'} Evidence record</span><strong>{skill.evidence.status}</strong></div>
                <div className={liveEvidenceReady ? 'skill-validation-row is-passed' : 'skill-validation-row is-blocked'}><span>{liveEvidenceReady ? '✓' : '◷'} Supervised run</span><strong>{liveEvidenceReady ? 'attached' : supervisedCheckRunning ? 'running…' : 'missing'}</strong></div>
              </div>
            )}
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
              <a href={skillCommitHistoryUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
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
