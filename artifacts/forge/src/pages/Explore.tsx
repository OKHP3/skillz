import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import type { FilterState, SearchResult, Maturity, EvidenceStatus, ReleaseReadiness } from '../types/catalog';
import { searchSkills, buildSearchIndex, setBodySearchIndex } from '../utils/search';
import type { SearchIndexEntry } from '../types/catalog';
import { copyInstallUrl as copyInstallCommand, shareSkill, useFavorites } from '../utils/clipboard';
import { activeCatalogFilterCount, copyFeedback, favoriteFeedback, shareFeedback } from '../utils/feedback';
import AddToStackButton from '../components/ui/AddToStackButton';
import DiscoveryAid from '../components/ui/DiscoveryAid';
import Nav from '../components/layout/Nav';
import { useComposer } from '../contexts/ComposerContext';

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
// artifacts/forge/src/types/catalog.ts. It answers "how close is this to a supervised
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

// Explore's catalog can hold 100+ rich cards, each with several focusable
// actions. Rendering them all at once means keyboard users tab through
// hundreds of controls to reach anything past the list (e.g. the nav or
// footer), and every card pays layout/paint cost even off-screen. Paginating
// keeps each page's DOM (and tab order) small; content-visibility on the
// card itself (see index.css) further trims paint cost within a page.
const PAGE_SIZE = 24;

// Shared by the filters-changed effect and goToPage so the URL's query
// params are always built the same way regardless of which one triggers the
// update — one is the source of truth for "what's in the URL right now".
function buildSearchParams(f: FilterState, pageNum: number): Record<string, string> {
  const params: Record<string, string> = {};
  if (f.query) params.q = f.query;
  if (f.family) params.family = f.family;
  if (f.maturity) params.maturity = f.maturity;
  if (f.evidence) params.evidence = f.evidence;
  if (f.releaseReadiness) params.release = f.releaseReadiness;
  if (f.sort !== 'relevance') params.sort = f.sort;
  if (pageNum > 1) params.page = String(pageNum);
  return params;
}

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
  const { announce } = useComposer();
  const [, forceUpdate] = useState(0);
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  // Tracks the filters object from the previous run of the effect below, so
  // it can tell "the user actually changed a filter" (reset to page 1) apart
  // from "this effect re-ran for some other reason" — e.g. the lazy
  // full-body search index finishing its fetch and bumping bodyIndexVersion,
  // or the catalog context re-rendering with a new (but equal) skills array.
  // Those unrelated re-runs must NOT clobber a page number restored from the
  // URL on mount or after Back navigation.
  const prevFiltersKeyRef = useRef<string | null>(null);
  const paginationRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const filtersToggleRef = useRef<HTMLButtonElement>(null);
  const filterOpenMounted = useRef(false);
  const navigate = useNavigate();

  // On mobile, the "Filters" toggle lives in the main column, after the
  // <aside> in DOM order — so once it has focus, Tab continues forward
  // through the rest of main and never loops back to the sidebar that just
  // became visible. Move focus into the sidebar on open (landing on the
  // "Skip filters" button, its first child) and back to the toggle on close,
  // matching the standard disclosure/drawer focus-management pattern.
  useEffect(() => {
    if (!filterOpenMounted.current) { filterOpenMounted.current = true; return; }
    if (filterOpen) {
      sidebarRef.current?.focus();
    } else {
      filtersToggleRef.current?.focus();
    }
  }, [filterOpen]);

  useEffect(() => {
    document.title = 'Explore Agent Skills | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  useEffect(() => {
    buildSearchIndex(catalog.skills);
  }, []);

  // Release 1: the compact catalog no longer carries every skill's full body
  // text, so full-content search is a separate lazy fetch — it only happens
  // when a visitor lands on Explore, not on every route that loads the
  // catalog (Home, family pages, Compare). Once it resolves, re-run the
  // current search so any body-only matches for the visitor's query appear
  // without requiring them to retype it.
  const [bodyIndexVersion, bumpBodyIndex] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/search-index.json`)
      .then(res => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); })
      .then((entries: SearchIndexEntry[]) => {
        if (cancelled) return;
        setBodySearchIndex(entries);
        bumpBodyIndex(n => n + 1);
      })
      .catch(() => {
        // Full-body search is a progressive enhancement — metadata search
        // (name/description/triggers/etc.) still works without it.
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const r = searchSkills(catalog.skills, filters);
    setResults(r);
    const filtersKey = JSON.stringify(filters);
    const filtersActuallyChanged = prevFiltersKeyRef.current !== null && prevFiltersKeyRef.current !== filtersKey;
    prevFiltersKeyRef.current = filtersKey;
    if (filtersActuallyChanged) {
      // A real filter/sort change: start back at page 1, same as before.
      setPage(1);
      setSearchParams(buildSearchParams(filters, 1), { replace: true });
    } else {
      // First run (mount, or arriving via Back navigation), or a re-run
      // triggered by something other than the user changing a filter: don't
      // reset the page — a user who paged to 3, opened a skill, then hit
      // Back should land back on page 3, not page 1. Just clamp it to the
      // now-known result count in case the URL's ?page= is stale/out of range.
      const pc = Math.max(1, Math.ceil(r.length / PAGE_SIZE));
      const clampedPage = Math.min(page, pc);
      if (clampedPage !== page) setPage(clampedPage);
      setSearchParams(buildSearchParams(filters, clampedPage), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, setSearchParams, catalog.skills, bodyIndexVersion]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, val: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    if (key === 'family') announce(val ? `Family filter set to ${val}.` : 'Family filter cleared.');
    if (key === 'maturity') announce(val ? `Maturity filter set to ${val}.` : 'Maturity filter cleared.');
    if (key === 'evidence') announce(val ? `Evidence filter set to ${EVIDENCE_LABELS[val as EvidenceStatus]}.` : 'Evidence filter cleared.');
    if (key === 'releaseReadiness') announce(val ? `Release readiness filter set to ${RELEASE_READINESS_LABELS[val as ReleaseReadiness]}.` : 'Release readiness filter cleared.');
    if (key === 'sort') announce(`Results sorted by ${String(val)}.`);
  }, [announce]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedResults = results.slice(pageStart, pageStart + PAGE_SIZE);
  const activeFilterCount = activeCatalogFilterCount(filters);

  function goToPage(n: number) {
    const clamped = Math.min(Math.max(1, n), pageCount);
    setPage(clamped);
    setSearchParams(buildSearchParams(filters, clamped), { replace: true });
    // Move scroll back to the top of the page so keyboard and screen-reader
    // users land somewhere sensible after paging, rather than staying
    // scrolled to wherever the "Next"/"Previous" button happened to be.
    // Deferred a frame so it runs after any browser default
    // focus-follows-scroll behavior on the button that was just activated.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.getElementById('explore-results-heading')?.focus();
    });
  }

  // Programmatic focus jump rather than a real `href="#explore-pagination"`
  // anchor — this app uses HashRouter, so the URL hash *is* the route.
  // Setting the hash to a non-route fragment breaks routing instead of just
  // scrolling, so the "skip past this page's cards" control has to be a
  // button that moves focus directly.
  function skipToPagination(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    paginationRef.current?.focus();
    paginationRef.current?.scrollIntoView({ block: 'start' });
  }

  // The filter sidebar (Family + Maturity + Evidence + Release readiness) can
  // hold 30+ individual filter buttons and is always in the DOM ahead of the
  // search box / results in source order (it renders first, as an <aside>
  // before the main results column). On desktop the sidebar is permanently
  // visible, so a keyboard user has no way around tabbing through every
  // filter button first. This mirrors `skipToPagination` above: a real,
  // always-first focusable control that jumps straight past the filters to
  // the search input, bounding the trip to a single Tab + Enter regardless
  // of how many families/filters the catalog grows to.
  function skipFiltersToSearch(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ block: 'start' });
  }

  // Lock body scroll while the mobile filter drawer is open so the page
  // behind the backdrop can't scroll. The lock only applies while the mobile
  // media query matches (≤768px) — if the user rotates or resizes to desktop
  // while the drawer is open, we close the drawer and clear the lock so there
  // is always a visible way to restore scrolling.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');

    function applyLock() {
      if (filterOpen && mq.matches) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        // Auto-close the drawer when the viewport leaves mobile so the
        // sidebar goes back to its always-visible desktop position and the
        // user is never left with a hidden-but-open drawer state.
        if (filterOpen && !mq.matches) {
          setFilterOpen(false);
        }
      }
    }

    applyLock();
    mq.addEventListener('change', applyLock);
    return () => {
      mq.removeEventListener('change', applyLock);
      document.body.style.overflow = '';
    };
  }, [filterOpen]);

  async function handleCopy(skill: (typeof catalog.skills)[0]) {
    const ok = await copyInstallCommand(skill);
    if (ok) {
      setCopied(skill.name);
      setTimeout(() => setCopied(null), 2000);
    }
    announce(copyFeedback(`${skill.displayName || skill.name} URL`, ok));
  }

  async function handleShare(skill: (typeof catalog.skills)[0]) {
    announce(shareFeedback(skill.displayName || skill.name, await shareSkill(skill)));
  }

  function handleCompare(skill: (typeof catalog.skills)[0]) {
    navigate(`/compare?skills=${encodeURIComponent(skill.name)}`);
  }

  function handleFavorite(skillName: string) {
    const outcome = toggleFavorite(skillName);
    forceUpdate(n => n + 1);
    announce(favoriteFeedback(skillName, outcome));
  }

  return (
    <div data-page="explore">
      <Nav />
      <main data-layout="explore" id="main-content" tabIndex={-1}>
        {/* Backdrop overlay — closes the filter drawer on mobile tap, matching ExploreB */}
        {filterOpen && (
          <div
            className="explore-sidebar-backdrop"
            aria-hidden="true"
            onClick={() => setFilterOpen(false)}
          />
        )}
        <aside className="explore-sidebar" data-open={filterOpen} aria-label="Filters" ref={sidebarRef} tabIndex={-1}>
          <button type="button" className="skip-link skip-link--button" onClick={skipFiltersToSearch}>
            Skip filters, go to search
          </button>
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
                onClick={() => {
                  setFilters(prev => ({ ...prev, family: '', maturity: '', evidence: '', releaseReadiness: '' }));
                  announce('All catalog filters cleared.');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div className="explore-main">
          <DiscoveryAid />

          <div className="explore-topbar">
            <button
              className="btn btn-outline nav-mobile-toggle"
              onClick={() => setFilterOpen(true)}
              aria-expanded={filterOpen}
              aria-controls="filter-panel"
              aria-label={activeFilterCount ? `Filters, ${activeFilterCount} active ${activeFilterCount === 1 ? 'filter' : 'filters'}` : 'Filters'}
              ref={filtersToggleRef}
            >
              Filters {activeFilterCount ? '•' : ''}
            </button>
            <div className="explore-search-wrapper">
              <label htmlFor="explore-search" className="sr-only">Search skills</label>
              <input
                id="explore-search"
                ref={searchInputRef}
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
            <div id="explore-results-heading" tabIndex={-1}>
              <strong className="explore-results-count">{results.length}</strong> skill{results.length !== 1 ? 's' : ''} found
              {results.length > PAGE_SIZE && (
                <span className="explore-page-summary">
                  {' '}— showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, results.length)} (page {currentPage} of {pageCount})
                </span>
              )}
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
              <button className="btn" onClick={() => {
                setFilters({ query: '', family: '', maturity: '', evidence: '', releaseReadiness: '', sort: 'relevance' });
                announce('All search and catalog filters cleared.');
              }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <>
            {pageCount > 1 && (
              <button type="button" className="skip-link skip-link--button" onClick={skipToPagination}>
                Skip {pagedResults.length} results on this page to pagination controls
              </button>
            )}
            <ul className="skill-list" aria-label="Skill results">
              {pagedResults.map(({ skill, matchReason }) => (
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
                      {copied === skill.name ? 'Copied!' : 'Copy URL'}
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
                    <AddToStackButton skillName={skill.name} />
                    <Link to={`/skills/${skill.family}/${skill.name}`} className="btn-ghost skill-card-open" data-action="open">
                      Open &rarr;
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            </>
          )}

          {pageCount > 1 && (
            <nav className="explore-pagination" aria-label="Results pages" id="explore-pagination" ref={paginationRef} tabIndex={-1}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                &larr; Previous
              </button>
              <span className="explore-pagination-status">Page {currentPage} of {pageCount}</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
              >
                Next &rarr;
              </button>
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}
