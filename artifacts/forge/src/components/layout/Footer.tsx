import { Link } from 'react-router-dom';

// Global site footer, rendered once for the whole app (see App.tsx) rather
// than per-page like <Nav /> — every route should carry the same brand
// attribution and copyright line, and there is no per-page variation to
// account for. Mirrors the footer pattern already shipping on
// overkillhill.com and okhp3.github.io/mermaid-theme-builder.
export default function Footer() {
  // Computed at render time (not hardcoded) so the copyright year advances
  // on its own every January without a code change or redeploy.
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-built-with">
          Built with{' '}
          <a
            href="https://replit.com/refer/overkillhillp3/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-replit-link"
          >
            Replit
          </a>
        </span>
        <p className="site-footer-copyright">
          &copy; {year} OverKill&nbsp;Hill&nbsp;P&sup3;&trade;. All rights reserved.
        </p>
        <span className="site-footer-links">
          <Link to="/privacy" className="site-footer-privacy-link">Privacy</Link>
        </span>
      </div>
    </footer>
  );
}
