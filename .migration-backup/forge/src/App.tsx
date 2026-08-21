import { ThemeProvider } from './contexts/ThemeContext';
import { CatalogProvider, useCatalogState } from './contexts/CatalogContext';
import { ComposerProvider } from './contexts/ComposerContext';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { trackPageview } from './utils/analytics';
import { focusAndScrollToId, getRouteAnchorId } from './utils/routeAnchors';
import Footer from './components/layout/Footer';
import ComposerDrawer from './components/ui/ComposerDrawer';

// Module-level: persists across StrictMode remounts (unlike useRef which resets on remount)
let _lastTrackedPath: string | null = null;

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const SkillDetail = lazy(() => import('./pages/SkillDetail'));
const FamilyDetail = lazy(() => import('./pages/FamilyDetail'));
const Stacks = lazy(() => import('./pages/Stacks'));
const StackDetail = lazy(() => import('./pages/StackDetail'));
const Compare = lazy(() => import('./pages/Compare'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contribute = lazy(() => import('./pages/Contribute'));
const Activity = lazy(() => import('./pages/Activity'));
const Privacy = lazy(() => import('./pages/Privacy'));

function Loading() {
  return (
    <div role="status" aria-live="polite" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-muted-dark)',
      fontFamily: 'var(--font-sans)', fontSize: '14px',
    }}>
      Loading…
    </div>
  );
}

/** Gates route rendering on the catalog fetch finishing, so no page needs its
 *  own null-check. Errors render inline rather than a blank white screen. */
function CatalogGate({ children }: { children: ReactNode }) {
  const { loading, error } = useCatalogState();
  if (error) {
    return (
      <div role="alert" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-muted-dark)',
        fontFamily: 'var(--font-sans)', fontSize: '14px', gap: '8px', textAlign: 'center', padding: '0 24px',
      }}>
        <p>Could not load the skill catalog.</p>
        <p style={{ opacity: 0.7 }}>{error}</p>
      </div>
    );
  }
  if (loading) return <Loading />;
  return (
    <>
      <RouteAnchorFocus />
      {children}
    </>
  );
}

/** Route-aware GA4 pageview tracking. Module-level _lastTrackedPath prevents StrictMode
 *  double-fire (useRef resets on remount; module var does not). setTimeout(0) ensures
 *  document.title has been set by the destination page's useEffect before tracking fires. */
// A real `href="#main-content"` anchor would work under BrowserRouter, but
// this app uses HashRouter — the URL hash *is* the route, so setting it to a
// non-route fragment breaks navigation instead of just scrolling. Move focus
// programmatically instead.
function SkipToMainContent() {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    // The route's <main id="main-content"> mounts only after the catalog
    // fetch resolves (see CatalogGate), so a user who activates this
    // immediately on page load can beat that render. Poll briefly rather
    // than silently no-op'ing.
    const deadline = Date.now() + 1500;
    function tryFocus() {
      const main = document.getElementById('main-content');
      if (main) {
        main.focus();
        main.scrollIntoView({ block: 'start' });
        return;
      }
      if (Date.now() < deadline) requestAnimationFrame(tryFocus);
    }
    tryFocus();
  }
  return (
    <button type="button" className="skip-link skip-link--button" onClick={handleClick}>
      Skip to main content
    </button>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (_lastTrackedPath === path) return;
    _lastTrackedPath = path;
    const t = setTimeout(() => trackPageview(path, document.title), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return null;
}

/** Handles `#/route#target` destinations after the catalog-gated application
 * can mount. An observer waits for lazy route content instead of using a short
 * retry window that can expire on a cold load. */
function RouteAnchorFocus() {
  const location = useLocation();

  useEffect(() => {
    const targetId = getRouteAnchorId(location.hash);
    if (!targetId) return;

    let settled = false;
    const focusWhenMounted = () => {
      if (settled || !focusAndScrollToId(targetId)) return;
      settled = true;
      observer.disconnect();
    };

    const observer = new MutationObserver(focusWhenMounted);
    observer.observe(document.body, { childList: true, subtree: true });
    const frame = requestAnimationFrame(focusWhenMounted);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
    <CatalogProvider>
    <ComposerProvider>
    <HashRouter>
      <SkipToMainContent />
      <AnalyticsTracker />
      <CatalogGate>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/skills/:family/:skillName" element={<SkillDetail />} />
            <Route path="/families/:family" element={<FamilyDetail />} />
            <Route path="/stacks" element={<Stacks />} />
            <Route path="/stacks/:stackId" element={<StackDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
        <ComposerDrawer />
      </CatalogGate>
      <Footer />
    </HashRouter>
    </ComposerProvider>
    </CatalogProvider>
    </ThemeProvider>
  );
}
