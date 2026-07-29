import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import { buildSearchIndex } from '../utils/search';
import Nav from '../components/layout/Nav';
import murderbirdSentinel from '../assets/murderbird-sentinel.png';

const catalog = catalogData as Catalog;

export default function Home() {
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
      <main className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <section data-section="hero" className="hero-layout">
          <div className="hero-content">
            <h1 className="hero-heading">
              Find the skill for the work in front of you.
            </h1>
            <p className="hero-sub">
              Search the open catalog of reusable agent capabilities. Filter by what matters to your task, then open, stack, install, and ship.
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
                placeholder="e.g. document a messy business process..."
                autoComplete="off"
                aria-label="Search agent skills"
                style={{ fontSize: '1.25rem', padding: 'var(--space-4) var(--space-6)' }}
              />
              <button type="submit" className="btn" style={{ fontSize: '1.25rem', padding: 'var(--space-4) var(--space-8)' }}>
                Search
              </button>
            </form>

            <div className="hero-cta-row">
              <Link to="/explore" className="btn btn-outline">
                Browse all {catalog.skillCount} skills
              </Link>
            </div>

            <p className="hero-trust">
              Read the contract, maturity, and evidence note before relying on a skill.
            </p>
          </div>

          <div className="hero-bird" aria-hidden="true">
            <img
              src={murderbirdSentinel}
              alt=""
              className="hero-bird-img"
            />
          </div>
        </section>

        <section data-section="what-is-skill" style={{ marginTop: 'var(--space-24)', maxWidth: '800px', marginInline: 'auto' }}>
          <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-4)' }}>What is a SKILL.md?</h2>
          <p style={{ color: 'var(--color-text-muted-light)', marginBottom: 'var(--space-4)' }}>
            A delegation contract for AI agents. Plain text, versioned, composable, installable. Each skill tells an agent exactly when to activate, what to do, and what not to do — so it behaves consistently without re-explaining.
          </p>
          <Link to="/faq#what-is-skillmd" style={{ fontWeight: 600 }}>Learn more &rarr;</Link>
        </section>

        <section data-section="families" style={{ marginTop: 'var(--space-24)' }}>
          <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-8)' }}>Families</h2>
          <div className="home-families">
            {catalog.families.map(f => (
              <Link to={`/explore?family=${f.name}`} key={f.name} className="home-family-card">
                <strong>{f.displayName || f.name}</strong>
                <span>{f.skillCount} skill{f.skillCount !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
