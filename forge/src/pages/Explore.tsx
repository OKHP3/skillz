import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import catalogData from '../data/catalog.json';
import type { Catalog, FilterState, SearchResult, Maturity } from '../types/catalog';
import { searchSkills, buildSearchIndex } from '../utils/search';
import { copyInstallUrl as copyInstallCommand, shareSkill, useFavorites } from '../utils/clipboard';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;
const MATURITY_LEVELS: Maturity[] = ['placeholder', 'skeleton', 'draftable', 'usable', 'validated', 'published'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get('q') || '',
    family: searchParams.get('family') || '',
    maturity: (searchParams.get('maturity') as Maturity) || '',
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
    if (filters.sort !== 'relevance') params.sort = filters.sort;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

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
          <div className="filter-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, border: 'none' }}>Filters</h3>
            <button 
              className="nav-mobile-toggle"
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
              style={{ fontSize: '1rem' }}
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
                      {f.name} <span style={{ opacity: 0.5 }}>{f.skillCount}</span>
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
                      className="filter-btn"
                      onClick={() => updateFilter('maturity', m)}
                      aria-pressed={filters.maturity === m}
                      style={{ justifyContent: 'flex-start', gap: '8px' }}
                    >
                      <span data-maturity={m} aria-label={`Maturity: ${m}`} style={{ width: 8, height: 8, borderRadius: '50%', padding: 0 }} />
                      <span style={{ textTransform: 'capitalize' }}>{m}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {(filters.family || filters.maturity) && (
              <button
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => setFilters(prev => ({ ...prev, family: '', maturity: '' }))}
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
            >
              Filters {filters.family || filters.maturity ? '•' : ''}
            </button>
            <div style={{ flex: 1 }}>
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
              <strong style={{ color: 'var(--color-text-dark)' }}>{results.length}</strong> skill{results.length !== 1 ? 's' : ''} found
              {(filters.query || filters.family || filters.maturity) && (
                <span style={{ marginLeft: '8px', opacity: 0.8 }}>
                  for {filters.query && <span>"{filters.query}"</span>}
                  {filters.family && <span> family: <strong>{filters.family}</strong></span>}
                  {filters.maturity && <span> maturity: <strong>{filters.maturity}</strong></span>}
                </span>
              )}
            </div>
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value as FilterState['sort'])}
              aria-label="Sort results"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="alpha">Sort: Alphabetical</option>
              <option value="family">Sort: By family</option>
              <option value="maturity">Sort: By maturity</option>
            </select>
          </div>

          {results.length === 0 ? (
            <div className="detail-article" style={{ textAlign: 'center', margin: 'var(--space-12) auto' }} role="status">
              <h2 style={{ marginTop: 0 }}>No skills found</h2>
              <p>No skills matched "{filters.query || 'your filters'}".</p>
              <p>Try different search terms or browse by family.</p>
              <button className="btn" onClick={() => setFilters({ query: '', family: '', maturity: '', sort: 'relevance' })}>
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
                        {skill.name}
                      </Link>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                        <span className="skill-card-family">{skill.family}</span>
                        <span data-maturity={skill.maturity}>{skill.maturity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="skill-card-desc">{skill.description}</p>
                  
                  {skill.triggers.length > 0 && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted-light)', background: 'var(--color-bg)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius)', borderLeft: '2px solid var(--color-copper)' }}>
                      <strong>Triggers when:</strong> {skill.triggers[0]}
                    </div>
                  )}

                  {matchReason && filters.query && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-copper-dark)', marginTop: '-8px' }}>
                      {matchReason}
                    </p>
                  )}
                  
                  <div className="skill-card-actions">
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.875rem' }} onClick={() => handleCopy(skill)} data-action="copy">
                      {copied === skill.name ? 'Copied!' : 'Copy install'}
                    </button>
                    <button className="btn-ghost" style={{ fontSize: '0.875rem' }} onClick={() => handleShare(skill)} data-action="share">Share</button>
                    <button className="btn-ghost" style={{ fontSize: '0.875rem' }} onClick={() => handleCompare(skill)} data-action="compare">Compare</button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: '0.875rem', color: isFavorite(skill.name) ? 'var(--color-copper)' : undefined }}
                      onClick={() => handleFavorite(skill.name)}
                      data-action="favorite"
                      aria-pressed={isFavorite(skill.name)}
                    >
                      {isFavorite(skill.name) ? 'Saved' : 'Save'}
                    </button>
                    <Link to={`/skills/${skill.family}/${skill.name}`} className="btn-ghost" style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--color-text-light)', fontWeight: 500 }} data-action="open">
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
