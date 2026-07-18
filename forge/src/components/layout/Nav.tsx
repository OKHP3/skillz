import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path) ? "page" : undefined;

  return (
    <div className="nav-wrapper">
      <header className="nav-content">
        <Link to="/" className="nav-wordmark">Skillz Forge</Link>
        <button 
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <nav className="nav-links" data-open={mobileOpen}>
          <Link to="/explore" aria-current={isActive('/explore')}>Explore</Link>
          <Link to="/stacks" aria-current={isActive('/stacks')}>Stacks</Link>
          <Link to="/faq" aria-current={isActive('/faq')}>FAQ</Link>
          <Link to="/contribute" aria-current={isActive('/contribute')}>Contribute</Link>
          <Link to="/activity" aria-current={isActive('/activity')}>Activity</Link>
          <a href="https://github.com/OKHP3/skillz" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </header>
    </div>
  );
}
