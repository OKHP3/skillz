import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import type { FilterState, SearchResult, Maturity, EvidenceStatus, ReleaseReadiness } from '../types/catalog';
import { searchSkills, buildSearchIndex } from '../utils/search';
import { copyInstallUrl as copyInstallCommand, shareSkill, useFavorites } from '../utils/clipboard';
import Nav from '../components/layout/Nav';

const MATURITY_LEVELS: Maturity[] = ['placeholder', 'skeleton', 'draftable', 'usable', 'validated', 'published'];
const EVIDENCE_LEVELS: EvidenceStatus[] = ['live', 'historical', 'analytical', 'local-checks', 'designed', 'not-run', 'none'];
const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  live: 'Live',
  historical: 'Historical',
  analytical: 'Analytical',
  'local-checks': 'Local checks',
  designed: 'Designed',
  'not-run': 'Not run',
  none: 'No evidence record',
};

// Release-readiness is a NEW filter dimension (evidence-contract v2), kept
// deliberately separate from the 7-value Evidence filter above rather than
// replacing or duplicating it — see the "vocabulary reconciliation" note in
// forge/src/types/catalog.ts. It answers "how close is this to a supervised
// or peer-reviewed release" by combining maturity + evidence.status.
const RELEASE_READINESS_LEVELS: ReleaseReadiness[] = [
  'needs-contract-work', 'needs-live-evidence', 'ready-for-supervised-use', 'ready-for-peer-review', 'published',
];
const RELEASE_READINESS_LABELS: Record<ReleaseReadiness, string> = {
  'needs-contract-work': 'Needs contract work',
  'needs-live-evidence': 'Needs live evidence',
  'ready-for-supervised-use': 'Ready for supervised use',
  'ready-for-peer-review': 'Ready for peer review',
  published: 'Published',
};

export default function Explore() {
  const catalog = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('q') || '',
    family: searchParams.get('family') || '',
    maturity: (searchParams.get('maturity') as Maturity) || '',
    evidence: (searchParams.get('evidence') as EvidenceStatus) || '',
    releaseReadiness: (searchParams.get('release') as ReleaseReadiness) || '',
    sort: (searchParams.get('sort') as FilterState['sort']) || 'relevance',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Explore Agent Skills | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  useEffect(() => {
    buildSearchIndex(catalog.skills);
  }, []);

  useEffect(() => {
    const r = searchSkills(catalog.skills, filters);
    setResults(r);
    const params: Record<string, string> = {};
    if (filters.query) params.q = filters.query;
    if (filters.family) params.family = filters.family;
    if (filters.maturity) params.maturity = filters.maturity;
    if (filters.evidence) params.evidence = filters.evidence;
    if (filters.releaseReadiness) params.release = filters.releaseReadiness;
    if (filters.sort !== 'relevance') params.sort = filters.sort;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams, catalog.skills]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, val: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  }, []);

  async function handleCopy(skill: (typeof catalog.skills)[0]) {
    const ok = await copyInstallCommand(skill);
    if (ok) {
      setCopied(skill.name);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  async function handleShare(skill: (typeof catalog.skills)[0]) {
    await shareSkill(skill);
  }

  function handleCompare(skill: (typeof catalog.skills)[0]) {
    navigate(`/compare?skills=${encodeURIComponent(skill.name)}`);
  }

  function handleFavorite(skillName: string) {
    toggleFavorite(skillName);
    forceUpdate(n => n + 1);
  }

  return (
    <div data-page="explore">
      <Nav />
      <main data-layout="explore">
        <aside className="explore-sidebar" data-open={filterOpen} aria-label="Filters">
          <div className="filter-group filter-group-header">
            <h3>Filters</h3>
            <button 
              className="nav-mobile-toggle filter-close-btn"
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
            >✕</button>
          </div>

          <div id="filter-panel">
            <section className="filter-group">
              <h3>Family</h3>
              <ul className="filter-list">
                <li>
                  <button
                    className="filter-btn"
                    onClick={() => updateFilter('family', '')}
                    aria-pressed={filters.family === ''}
                  >
                    All families
                  </button>
                </li>
                {catalog.families.map(f => (
                  <li key={f.name}>
                    <button
                      className="filter-btn"
                      onClick={() => updateFilter('family', f.name)}
                      aria-pressed={filters.family === f.name}
                    >
                      {f.displayName || f.name} <span className="filter-family-count">{f.skillCount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="filter-group">
              <h3>Maturity</h3>
              <ul className="filter-list">
                <li>
                  <button className="filter-btn" onClick={() => updateFilter('maturity', '')} aria-pressed={!filters.maturity}>
                    Any maturity
                  </button>
                </li>
                {MATURITY_LEVELS.map(m => (
                  <li key={m}>
                    <button
                      className="filter-btn filter-btn--maturity"
                      onClick={() => updateFilter('maturity', m)}
                      aria-pressed={filters.maturity === m}
                    >
                      <span data-maturity={m} aria-label={`Maturity: ${m}`} className="filter-maturity-dot" />
                      <span className="filter-maturity-label">{m}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="filter-group">
              <h3>Evidence</h3>
              <p className="filter-evidence-desc">
                Evidence describes what proof exists for the current version — separate from maturity.
              </p>
              <ul className="filter-list">
                <li>
                  <button className="filter-btn" onClick={() => updateFilter('evidence', '')} aria-pressed={!filters.evidence}>
                    Any evidence
                  </button>
                </li>
                {EVIDENCE_LEVELS.map(e => (
                  <li key={e}>
                    <button
                      className="filter-btn"
                      onClick={() => updateFilter('evidence', e)}
                      aria-pressed={filters.evidence === e}
                    >
                      {EVIDENCE_LABELS[e]}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="filter-group">
              <h3>Release readiness</h3>
              <p className="filter-evidence-desc">
                Combines maturity and evidence into a single release-oriented view.
              </p>
              <ul className="filter-list">
                <li>
                  <button className="filter-btn" onClick={() => updateFilter('releaseReadiness', '')} aria-pressed={!filters.releaseReadiness}>
                    Any release state
                  </button>
                </li>
                {RELEASE_READINESS_LEVELS.map(r => (
                  <li key={r}>
                    <button
                      className="filter-btn"
                      onClick={() => updateFilter('releaseReadiness', r)}
                      aria-pressed={filters.releaseReadiness === r}
                    >
                      {RELEASE_READINESS_LABELS[r]}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {(filters.family || filters.maturity || filters.evidence || filters.releaseReadiness) && (
              <button
                className="btn btn-outline filter-clear-btn"
                onClick={() => setFilters(prev => ({ ...prev, family: '', maturity: '', evidence: '', releaseReadiness: '' }))}
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div className="explore-main">
          <div className="explore-topbar">
            <button
              className="btn btn-outline nav-mobile-toggle"
              onClick={() => setFilterOpen(true)}
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
            >
              Filters {filters.family || filters.maturity || filters.evidence ? '•' : ''}
            </button>
            <div className="explore-search-wrapper">
              <label htmlFor="explore-search" className="sr-only">Search skills</label>
              <input
                id="explore-search"
                type="search"
                className="input-text"
                value={filters.query}
                onChange={e => updateFilter('query', e.target.value)}
                placeholder="Search by task, topic, tool, pattern, family…"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="explore-meta" aria-live="polite" aria-atomic="true">
            <div>
              <strong className="explore-results-count">{results.length}</strong> skill{results.length !== 1 ? 's' : ''} found
              {(filters.query || filters.family || filters.maturity || filters.evidence || filters.releaseReadiness) && (
                <span className="explore-filter-summary">
                  for {filters.query && <span>"{filters.query}"</span>}
                  {filters.family && <span> family: <strong>{filters.family}</strong></span>}
                  {filters.maturity && <span> maturity: <strong>{filters.maturity}</strong></span>}
                  {filters.evidence && <span> evidence: <strong>{EVIDENCE_LABELS[filters.evidence]}</strong></span>}
                  {filters.releaseReadiness && <span> release: <strong>{RELEASE_READINESS_LABELS[filters.releaseReadiness]}</strong></span>}
                </span>
              )}
            </div>
            <label htmlFor="explore-sort" className="sr-only">Sort results</label>
            <select
              id="explore-sort"
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value as FilterState['sort'])}
              aria-label="Sort results"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="alpha">Sort: Alphabetical</option>
              <option value="family">Sort: By family</option>
              <option value="maturity">Sort: By maturity</option>
              <option value="evidence">Sort: By evidence</option>
              <option value="updated">Sort: Last updated</option>
              <option value="evidence-freshness">Sort: Evidence freshness</option>
              <option value="version">Sort: Version</option>
            </select>
          </div>

          {results.length === 0 ? (
            <div className="detail-article explore-empty" role="status">
              <h2>No skills found</h2>
              <p>No skills matched "{filters.query || 'your filters'}".</p>
              <p>Try different search terms or browse by family.</p>
              <button className="btn" onClick={() => setFilters({ query: '', family: '', maturity: '', evidence: '', releaseReadiness: '', sort: 'relevance' })}>
                Clear all filters
              </button>
            </div>
          ) : (
            <ul className="skill-list" aria-label="Skill results">
              {results.map(({ skill, matchReason }) => (
                <li key={skill.name} className="skill-card">
                  <div className="skill-card-header">
                    <div>
                      <Link to={`/skills/${skill.family}/${skill.name}`} className="skill-card-title">
                        {skill.displayName || skill.name}
                      </Link>
                      {skill.displayName && skill.displayName !== skill.name && (
                        <div className="skill-card-techname">
                          {skill.name}
                        </div>
                      )}
                      <div className="skill-card-meta">
                        <span className="skill-card-family">{skill.family}</span>
                        <span data-maturity={skill.maturity}>{skill.maturity}</span>
                        <span className="skill-card-evidence">
                          Evidence: {EVIDENCE_LABELS[skill.evidenceStatus]}
                        </span>
                      </div>
                      <div className="skill-card-chips" aria-label="Evidence details">
                        {skill.evidence.evalCount > 0 && (
                          <span className="evidence-chip">{skill.evidence.evalCount} eval{skill.evidence.evalCount !== 1 ? 's' : ''}</span>
                        )}
                        {skill.evidence.status === 'historical' && <span className="evidence-chip evidence-chip--historical">historical</span>}
                        {!skill.version && <span className="evidence-chip evidence-chip--warn">no version</span>}
                        {skill.evidence.evaluatedSkillVersion && skill.version && skill.evidence.evaluatedSkillVersion !== skill.version && (
                          <span className="evidence-chip evidence-chip--warn" title={`Evaluated ${skill.evidence.evaluatedSkillVersion}, current is ${skill.version}`}>
                            stale evidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="skill-card-desc">{skill.description}</p>
                  
                  {skill.triggers.length > 0 && (
                    <div className="skill-card-trigger">
                      <strong>Triggers when:</strong> {skill.triggers[0]}
                    </div>
                  )}

                  {matchReason && filters.query && (
                    <p className="skill-card-match">
                      {matchReason}
                    </p>
                  )}
                  
                  <div className="skill-card-actions">
                    <button className="btn btn-outline" onClick={() => handleCopy(skill)} data-action="copy">
                      {copied === skill.name ? 'Copied!' : 'Copy install'}
                    </button>
                    <button className="btn-ghost" onClick={() => handleShare(skill)} data-action="share">Share</button>
                    <button className="btn-ghost" onClick={() => handleCompare(skill)} data-action="compare">Compare</button>
                    <button
                      className="btn-ghost"
                      onClick={() => handleFavorite(skill.name)}
                      data-action="favorite"
                      aria-pressed={isFavorite(skill.name)}
                    >
                      {isFavorite(skill.name) ? 'Saved' : 'Save'}
                    </button>
                    <Link to={`/skills/${skill.family}/${skill.name}`} className="btn-ghost skill-card-open" data-action="open">
                      Open &rarr;
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
