import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { buildSearchIndex } from '../utils/search';
import Nav from '../components/layout/Nav';
import heroAvif160 from '../assets/murderbird-sentinel-160.avif';
import heroAvif320 from '../assets/murderbird-sentinel-320.avif';
import heroAvif480 from '../assets/murderbird-sentinel-480.avif';
import heroAvif640 from '../assets/murderbird-sentinel-640.avif';
import heroWebp160 from '../assets/murderbird-sentinel-160.webp';
import heroWebp320 from '../assets/murderbird-sentinel-320.webp';
import heroWebp480 from '../assets/murderbird-sentinel-480.webp';
import heroWebp640 from '../assets/murderbird-sentinel-640.webp';
import heroFallback from '../assets/murderbird-sentinel-640.png';

// Matches the .hero-bird width breakpoints in index.css (300px desktop,
// 160px <=768px, 120px <=480px) so the browser picks a derivative close to
// the rendered size instead of always downloading the largest one.
const HERO_BIRD_SIZES = '(max-width: 480px) 120px, (max-width: 768px) 160px, 300px';

export default function Home() {
  const catalog = useCatalog();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Skillz Forge | OverKill Hill P³™';
  }, []);

  useEffect(() => {
    buildSearchIndex(catalog.skills);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div data-page="home">
      <Nav />
      <main className="container" id="main-content" tabIndex={-1}>
        <section data-section="hero" className="hero-layout">
          <div className="hero-content">
            <h1 className="hero-heading">
              Find the skill for the work in front of you.
            </h1>
            <p className="hero-sub">
              Search the open catalog of reusable agent capabilities. Filter by what matters to your task, then open, stack, copy into your agent, and ship.
            </p>

            <form onSubmit={handleSearch} className="home-search hero-search" role="search">
              <label htmlFor="home-search" className="sr-only">Search skills</label>
              <input
                ref={inputRef}
                id="home-search"
                type="search"
                className="input-text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. document a messy business process…"
                autoComplete="off"
                aria-label="Search agent skills"
              />
              <button type="submit" className="btn">
                Search
              </button>
            </form>
          </div>

          <a
            href="https://overkillhill.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-bird-link"
            title="Visit OverKill Hill P³™"
            aria-label="Visit OverKill Hill P³™"
          >
            <div className="hero-bird">
              <picture>
                <source
                  type="image/avif"
                  sizes={HERO_BIRD_SIZES}
                  srcSet={`${heroAvif160} 160w, ${heroAvif320} 320w, ${heroAvif480} 480w, ${heroAvif640} 640w`}
                />
                <source
                  type="image/webp"
                  sizes={HERO_BIRD_SIZES}
                  srcSet={`${heroWebp160} 160w, ${heroWebp320} 320w, ${heroWebp480} 480w, ${heroWebp640} 640w`}
                />
                <img
                  src={heroFallback}
                  alt=""
                  className="hero-bird-img"
                  aria-hidden="true"
                  width={160}
                  height={160}
                />
              </picture>
            </div>
            <span className="hero-bird-label" aria-hidden="true">OverKill Hill P³™ ↗</span>
          </a>
        </section>

        <section data-section="what-is-skill" className="home-explainer-panel">
          <h2>What is a SKILL.md?</h2>
          <p>
            A delegation contract for AI agents. Plain text, versioned, composable, and portable — copy the raw file into any agent's context. Each skill tells an agent exactly when to activate, what to do, and what not to do — so it behaves consistently without re-explaining.
          </p>
          <Link to="/faq#what-is-skillmd">Learn more &rarr;</Link>
        </section>

        <section data-section="families">
          <h2>Families</h2>
          <div className="home-families">
            {catalog.families.map(f => (
              <Link to={`/families/${f.name}`} key={f.name} className="home-family-card">
                <strong>{f.displayName || f.name}</strong>
                <span>{f.skillCount} skill{f.skillCount !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        </section>

        <section data-section="trust" className="home-trust-panel">
          <h2>What "evidence" means here</h2>
          <p>
            Every skill in this catalog is scored on what it actually has, not what its description
            promises. Maturity and evidence are derived at build time from files that ship with the
            skill itself — <code>evals.json</code>, <code>benchmark.json</code>, test suites, reference
            files — never from a description or a claim in prose. Nothing here fabricates a benchmark
            or promotes a skill's status as a side effect of a redesign. If a skill has no evidence
            record, it says so plainly rather than defaulting to a reassuring label.
          </p>
        </section>
      </main>
    </div>
  );
}
