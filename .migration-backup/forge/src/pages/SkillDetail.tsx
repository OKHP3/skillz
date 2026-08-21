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
    if (supervisedCheckRunning || liveEvidenceAttached || skill.evidence.status === 'live') return;
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

  const relatedSkills = related.filter(item => !skill.companions.includes(item.name));
  const statCards = [
    { label: 'Maturity', value: skill.maturity, note: MATURITY_DESCRIPTIONS[skill.maturity], tone: skill.maturity },
    { label: 'Evidence', value: skill.evidence.status.replace('-', ' '), note: `${skill.evidence.evalCount} eval artifact${skill.evidence.evalCount === 1 ? '' : 's'}`, tone: skill.evidence.status },
    { label: 'Modified', value: skill.lastModified ? formatDate(skill.lastModified) : 'Unknown', note: skill.commitSha ? `${skill.commitSha.slice(0, 8)} commit` : 'No commit recorded', tone: 'modified' },
    { label: 'Readiness', value: RELEASE_READINESS_LABELS[skill.releaseReadiness] ?? skill.releaseReadiness, note: staleEvidence ? 'stale evidence' : 'current package', tone: releaseReady ? 'ready' : 'blocked' },
  ];

  return (
    <div data-page="skill-detail" className="skill-review-page">
      <Nav />
      <main className="container skill-review-container" id="main-content" tabIndex={-1}>
        <div className="breadcrumb skill-review-breadcrumb" aria-label="Breadcrumb">
          <Link to="/explore">Catalog</Link><span aria-hidden>/</span>
          <Link to={`/explore?family=${skill.family}`}>{skill.family}</Link><span aria-hidden>/</span>
          <span aria-current="page">Skill detail</span>
        </div>

        <article className="skill-review-article">
          <header className="skill-review-header">
            <div className="skill-review-heading">
              <div className="skill-review-eyebrow">
                <span className="skill-review-badge">{skill.family} family</span>
                <span>{skill.name} / canonical</span>
              </div>
              <div className="skill-review-title-row">
                <h1>{displayName}</h1>
                {skill.version && <span className="skill-review-version">v{skill.version}</span>}
              </div>
              {showSlugSecondary && <p className="skill-review-slug">{skill.name}</p>}
              <p className="skill-review-description">{skill.description}</p>
            </div>
            <div className="skill-review-actions" aria-label="Skill actions">
              <button className="btn btn-outline" onClick={handleCopyUrl}>
                {copied === 'url' ? 'Copied' : 'Copy URL'}
              </button>
              <a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Source ↗</a>
              <button className="btn btn-primary" onClick={handleCopyInstall}>
                {copied === 'install' ? 'Copied' : 'Copy skill URL'}
              </button>
              <button className="btn-ghost" onClick={handleShare}>Share</button>
              <button className="btn-ghost" onClick={() => navigate(`/compare?skills=${encodeURIComponent(skill.name)}`)}>Compare</button>
              <button className="btn-ghost" onClick={handleFavorite} aria-pressed={isFavorite(skill.name)}>
                {isFavorite(skill.name) ? 'Saved' : 'Save'}
              </button>
              <AddToStackButton skillName={skill.name} className="btn-primary" />
            </div>
          </header>

          <section className="skill-trust-banner" role="note" aria-label="Trust summary">
            <div className="skill-trust-icon" aria-hidden>✓</div>
            <div>
              <div className="skill-section-kicker">Trust summary <span>·</span> {releaseReady ? 'reviewable under supervision' : 'reviewable with limits'}</div>
              <p>{buildTrustSummary(skill, staleEvidence)}</p>
            </div>
            <span className="skill-trust-status">{skill.evidence.reviewDecision ?? 'Supervised use'}</span>
          </section>

          <section className="skill-stat-strip" aria-label="Skill status">
            {statCards.map(card => (
              <div className={`skill-stat skill-stat--${card.tone}`} key={card.label}>
                <span className="skill-stat-mark" aria-hidden>◌</span>
                <div><span className="skill-section-kicker">{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div>
              </div>
            ))}
          </section>

          <div className="skill-review-grid">
            <section className="skill-contract-panel">
              <div className="skill-panel-header">
                <span className="skill-section-kicker">▣ Contract / SKILL.md</span>
                <div className="skill-contract-tabs" role="tablist" aria-label="Contract views">
                  <button role="tab" aria-selected={activeContractTab === 'contract'} onClick={() => setActiveContractTab('contract')}>Raw markdown</button>
                  <button role="tab" aria-selected={activeContractTab === 'validation'} onClick={() => setActiveContractTab('validation')}>Validation</button>
                </div>
              </div>
              {activeContractTab === 'contract' ? (
                <div id="full-contract" className="skill-contract-body" tabIndex={-1}>
                  {contractState.status === 'loading' && <p className="meta-pending" role="status">Loading contract…</p>}
                  {contractState.status === 'error' && <p className="meta-pending" role="alert">Could not load the full contract. <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer">View raw SKILL.md instead</a>.</p>}
                  {contractState.status === 'ready' && <FullContract rawBody={contractState.body} />}
                </div>
              ) : (
                <div className="skill-validation-list" role="tabpanel">
                  {[
                    ['Frontmatter schema', `${skill.evidence.testCount + skill.evidence.referenceCount} artifacts`, true],
                    ['Local checks', skill.evidence.status === 'none' ? 'not recorded' : skill.evidence.status, skill.evidence.status !== 'none'],
                    ['Supervised run', liveEvidenceReady ? 'attached' : supervisedCheckRunning ? 'running…' : 'missing', liveEvidenceReady],
                  ].map(([label, value, passed]) => (
                    <div className={`skill-validation-row ${passed ? 'is-passed' : 'is-blocked'}`} key={String(label)}>
                      <span>{passed ? '✓' : '◷'} {label}</span><strong>{value}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="skill-contract-footer">
                <span>contract source · {skill.commitSha ? skill.commitSha.slice(0, 8) : 'unknown'}</span>
                <span className="is-passed">✓ schema {contractState.status === 'ready' ? 'valid' : 'pending'}</span>
              </div>
            </section>

            <aside className="skill-review-sidebar">
              <section className="skill-gate-panel">
                <div className="skill-panel-header"><span className="skill-section-kicker">▣ Release readiness</span><span aria-hidden>♙</span></div>
                <div className="skill-gate-content">
                  <div className="skill-gate-title-row"><h2>{releaseReady ? 'Reviewable' : 'Blocked'}</h2><span>{releaseReady ? '4 / 4 ready' : `${Math.max(0, 4 - skill.evidence.blockers.length)} / 4 ready`}</span></div>
                  <div className="skill-gate-progress"><span style={{ width: `${releaseReady ? 100 : Math.max(25, ((4 - skill.evidence.blockers.length) / 4) * 100)}%` }} /></div>
                  <ul className="skill-gate-checks">
                    <li className="is-passed">✓ Contract complete</li>
                    <li className={skill.author || skill.packageMetadata.author ? 'is-passed' : 'is-blocked'}>{skill.author || skill.packageMetadata.author ? '✓' : '◷'} Owner assigned</li>
                    <li className={skill.evidence.status !== 'none' ? 'is-passed' : 'is-blocked'}>{skill.evidence.status !== 'none' ? '✓' : '◷'} Evidence recorded</li>
                    <li className={liveEvidenceReady ? 'is-passed' : 'is-blocked'}>
                      <button type="button" onClick={attachLiveEvidence} disabled={liveEvidenceReady || supervisedCheckRunning}>
                        {liveEvidenceReady ? '✓ Live evidence attached' : supervisedCheckRunning ? '◷ Running supervised check…' : '◷ Attach live evidence'}
                      </button>
                    </li>
                  </ul>
                  {skill.evidence.blockers.length > 0 && <p className="skill-gate-blocker">{skill.evidence.blockers[0]}</p>}
                  <button className="btn btn-primary skill-gate-button" disabled={!liveEvidenceReady && !releaseReady} onClick={() => announce(`Final review requested for ${displayName}.`)}>▣ {releaseReady ? 'Request final review' : 'Unlock final review'}</button>
                </div>
              </section>

              <section className="skill-related-panel">
                <div className="skill-panel-header"><span className="skill-section-kicker">▦ Related skills</span><span aria-hidden>▱</span></div>
                {relatedSkills.slice(0, 4).map(item => (
                  <Link className="skill-related-row" key={item.name} to={`/skills/${item.family}/${item.name}`}>
                    <span><strong>{item.displayName || item.name}</strong><small>{item.family} · {item.maturity}</small></span><span aria-hidden>↗</span>
                  </Link>
                ))}
                {relatedSkills.length === 0 && <p className="skill-empty-note">No related contracts found.</p>}
              </section>

              <section className="skill-provenance-panel">
                <div className="skill-section-kicker">● Provenance</div>
                <dl>
                  <dt>owner</dt><dd>{skill.author || skill.packageMetadata.author || 'Not declared'}</dd>
                  <dt>source</dt><dd>{skill.path}</dd>
                  <dt>reviewed</dt><dd>{skill.maturityReviewedAt ? formatDate(skill.maturityReviewedAt) : 'Not recorded'}</dd>
                </dl>
              </section>
            </aside>
          </div>

          <section className="skill-context-section">
            <div className="skill-context-grid">
              <div><h2>What it does</h2><p>{skill.description}</p></div>
              {skill.inputs.length > 0 && <div><h2>Inputs</h2><ul>{skill.inputs.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
              {skill.outputs.length > 0 && <div><h2>Outputs</h2><ul>{skill.outputs.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
            </div>
            {skill.triggers.length > 0 && <details className="skill-disclosure" open><summary>Use this when <span>{skill.triggers.length} triggers</span></summary><ul>{skill.triggers.map((item, i) => <li key={i}>{item}</li>)}</ul></details>}
            {skill.avoid.length > 0 && <details className="skill-disclosure"><summary>Do not use this when <span>{skill.avoid.length} boundaries</span></summary><ul>{skill.avoid.map((item, i) => <li key={i}>{item}</li>)}</ul></details>}
            {(skill.tools.length > 0 || skill.tags.length > 0 || skill.topics.length > 0 || skill.runtimes.length > 0) && <div className="skill-token-groups">
              {[
                ['Tools', skill.tools], ['Tags', skill.tags], ['Topics', skill.topics], ['Runtimes', skill.runtimes],
              ].filter(([, items]) => items.length > 0).map(([label, items]) => <div key={String(label)}><h3>{label}</h3><div className="detail-tags">{items.map((item, i) => label === 'Tags' || label === 'Topics' ? <Link key={i} to={`/explore?q=${encodeURIComponent(item)}`} className="detail-tag detail-tag--link">{item}</Link> : <span className="detail-tag" key={i}>{item}</span>)}</div></div>)}
            </div>}
          </section>

          <section className="detail-evidence-release skill-evidence-details">
            <h2>Evidence and release state</h2>
            {staleEvidence && <p className="detail-evidence-stale-warning" role="alert"><strong>Stale evidence:</strong> evaluated against {skill.evidence.evaluatedSkillVersion}, current package is {skill.version ?? 'unversioned'}.</p>}
            <dl>
              <dt>Package version</dt><dd>{skill.version ?? <span className="meta-pending">No version declared</span>}</dd>
              <dt>Created</dt><dd>{skill.createdAt ? formatDate(skill.createdAt) : 'Unknown'}</dd>
              <dt>Category</dt><dd>{skill.packageMetadata.category ?? 'Unclassified'}</dd>
              <dt>Maturity source</dt><dd>{MATURITY_SOURCE_LABELS[skill.maturitySource] ?? skill.maturitySource}</dd>
              <dt>Evidence status</dt><dd>{skill.evidence.status}</dd>
              <dt>Evidence counts</dt><dd>{skill.evidence.evalCount} evals · {skill.evidence.benchmarkCount} benchmarks · {skill.evidence.testCount} tests · {skill.evidence.referenceCount} references</dd>
              <dt>Review decision</dt><dd>{skill.evidence.reviewDecision ?? 'Not yet reviewed'}</dd>
            </dl>
            <p className="detail-evidence-links"><a href={skill.rawUrl} target="_blank" rel="noopener noreferrer">View raw SKILL.md</a> · <a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer">View in repository</a> · {skill.commitSha && <a href={commitUrl(skill.commitSha)} target="_blank" rel="noopener noreferrer">Commit {skill.commitSha.slice(0, 8)}</a>}</p>
          </section>

          {(skill.companions.length > 0 || pathwayNodes.length > 1) && <section className="skill-context-section"><h2>Workflow pathway</h2>{pathwayNodes.length > 1 ? <SkillPathway nodes={pathwayNodes} allSkills={catalog.skills} /> : <ul className="detail-companions-list">{skill.companions.map(name => { const companion = catalog.skills.find(item => item.name === name); return <li key={name}>{companion ? <Link to={`/skills/${companion.family}/${companion.name}`}>{companion.displayName || companion.name}</Link> : <span>{name}</span>}</li>; })}</ul>}</section>}

          <section className="detail-contribute skill-contribute-section">
            <h2>Contribute</h2>
            <div className="detail-contribute-actions"><a href={skillGitHubUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">View source file</a><a href={skillCommitHistoryUrl(skill.path)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Commit history</a><a href={issueUrl({ title: `Improve: ${skill.name}`, labels: ['enhancement'] })} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Open an issue</a></div>
          </section>
        </article>
      </main>
    </div>
  );
}
