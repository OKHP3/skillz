import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/') ? 'page' as const : undefined;

  return (
    <div className="nav-wrapper">
      <header className="nav-content">
        <Link to="/" className="nav-wordmark" aria-label="Skillz Forge — OverKill Hill P³™ home">
          <span className="nav-parent">OverKill Hill P³™</span>
          <span className="nav-sep" aria-hidden="true">/</span>
          <span className="nav-product">Skillz Forge</span>
        </Link>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="primary-nav"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        <nav id="primary-nav" className="nav-links" data-open={mobileOpen} aria-label="Primary navigation">
          <Link to="/explore" aria-current={isActive('/explore')}>Explore</Link>
          <Link to="/stacks" aria-current={isActive('/stacks')}>Stacks</Link>
          <Link to="/compare" aria-current={isActive('/compare')}>Compare</Link>
          <Link to="/faq" aria-current={isActive('/faq')}>FAQ</Link>
          <Link to="/contribute" aria-current={isActive('/contribute')}>Contribute</Link>
          <Link to="/activity" aria-current={isActive('/activity')}>Activity</Link>
          <a href="https://github.com/OKHP3/skillz" target="_blank" rel="noopener noreferrer" className="nav-link-external">
            GitHub
          </a>
          <span className="nav-divider" aria-hidden="true" />
          <a href="https://overkillhill.com/" target="_blank" rel="noopener noreferrer" className="nav-link-brand">
            OverKill Hill
          </a>
        </nav>
      </header>
    </div>
  );
}
