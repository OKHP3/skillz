import { HashRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const SkillDetail = lazy(() => import('./pages/SkillDetail'));
const Stacks = lazy(() => import('./pages/Stacks'));
const StackDetail = lazy(() => import('./pages/StackDetail'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contribute = lazy(() => import('./pages/Contribute'));
const Activity = lazy(() => import('./pages/Activity'));

function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-muted)',
      fontFamily: 'var(--font-sans)', fontSize: '14px',
    }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/skills/:family/:skillName" element={<SkillDetail />} />
          <Route path="/stacks" element={<Stacks />} />
          <Route path="/stacks/:stackId" element={<StackDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
