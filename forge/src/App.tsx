import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { trackPageview } from './utils/analytics';

// Module-level: persists across StrictMode remounts (unlike useRef which resets on remount)
let _lastTrackedPath: string | null = null;

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const SkillDetail = lazy(() => import('./pages/SkillDetail'));
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
    <HashRouter>
      <AnalyticsTracker />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/skills/:family/:skillName" element={<SkillDetail />} />
          <Route path="/stacks" element={<Stacks />} />
          <Route path="/stacks/:stackId" element={<StackDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
