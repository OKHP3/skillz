import { ThemeProvider } from './contexts/ThemeContext';
import { CatalogProvider, useCatalogState } from './contexts/CatalogContext';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { trackPageview } from './utils/analytics';
import Footer from './components/layout/Footer';

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

function Loading() {
  return (
    <div style={{
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
      <div style={{
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
  return <>{children}</>;
}

/** Route-aware GA4 pageview tracking. Module-level _lastTrackedPath prevents StrictMode
 *  double-fire (useRef resets on remount; module var does not). setTimeout(0) ensures
 *  document.title has been set by the destination page's useEffect before tracking fires. */
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

export default function App() {
  return (
    <ThemeProvider>
    <CatalogProvider>
    <HashRouter>
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
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </CatalogGate>
      <Footer />
    </HashRouter>
    </CatalogProvider>
    </ThemeProvider>
  );
}
