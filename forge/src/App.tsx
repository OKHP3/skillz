import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { trackPageview } from './utils/analytics';

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

/** Route-aware GA4 pageview tracking — deduped to prevent StrictMode double-fire */
function AnalyticsTracker() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (lastPath.current === path) return;
    lastPath.current = path;
    trackPageview(path, document.title);
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
