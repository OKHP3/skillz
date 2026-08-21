import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Code2,
  Copy,
  FileCheck2,
  Github,
  Hash,
  Layers3,
  LockKeyhole,
  Menu,
  Play,
  Plus,
  ShieldAlert,
  Terminal,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();

const colors = {
  bg: '#1d2325',
  shell: '#182022',
  panel: '#202728',
  panelRaised: '#2a3335',
  border: '#3b4747',
  ink: '#e8eee8',
  muted: '#899793',
  green: '#a6c6a0',
  lime: '#d1d58a',
  rust: '#d08254',
  rustDeep: '#52372c',
  blue: '#9bbfc0',
};

type RunState = 'idle' | 'running' | 'complete';
type DeskState = 'loading' | 'ready' | 'error';

type EvidenceItem = {
  id: string;
  label: string;
  kind: string;
  score: string;
  status: 'verified' | 'missing';
  summary: string;
  detail: string;
  icon: typeof FileCheck2;
};

const evidenceItems: EvidenceItem[] = [
  {
    id: 'contract',
    label: 'Contract completeness',
    kind: 'required',
    score: '8 / 8',
    status: 'verified',
    icon: FileCheck2,
    summary: 'Every required section is present and has a concrete, reviewable statement.',
    detail: 'Purpose, inputs, procedure, constraints, and expected output are all explicit. No implied behavior was inferred from the skill name.',
  },
  {
    id: 'provenance',
    label: 'Source provenance',
    kind: 'required',
    score: '3 / 3',
    status: 'verified',
    icon: ClipboardCheck,
    summary: 'Repository path and owner resolve to a canonical source.',
    detail: 'overkill-hill / skills / universal / okhp3-skill-cataloger · branch main · commit 4f9ab82d.',
  },
  {
    id: 'runtime',
    label: 'Runtime evidence',
    kind: 'blocking',
    score: '1 / 3',
    status: 'missing',
    icon: Activity,
    summary: 'Only local checks are attached; no live run artifact is available.',
    detail: 'A supervised run against a directory of SKILL.md files is required before this contract can move from draftable to reviewable.',
  },
  {
    id: 'ownership',
    label: 'Release ownership',
    kind: 'required',
    score: '2 / 2',
    status: 'verified',
    icon: ShieldAlert,
    summary: 'A named owner and review date are attached to the entry.',
    detail: 'Owner: overkill-hill · steward: M. Reyes · next review: 2024-06-28.',
  },
];

const relatedSkills = [
  { name: 'okhp3-skill-auditor', family: 'universal', state: 'reviewable', note: 'Checks contracts for drift.' },
  { name: 'okhp3-skill-indexer', family: 'universal', state: 'draftable', note: 'Builds the searchable inventory.' },
  { name: 'okhp3-release-check', family: 'delivery', state: 'blocked', note: 'Gates evidence and sign-off.' },
];

const routeItems = [
  { label: 'Decision', meta: 'current', icon: LockKeyhole, evidence: 'ownership' },
  { label: 'Contract', meta: '8 sections', icon: BookOpen, evidence: 'contract' },
  { label: 'Evidence', meta: '1 missing', icon: Activity, evidence: 'runtime' },
  { label: 'Provenance', meta: 'verified', icon: Layers3, evidence: 'provenance' },
];

function Pill({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'green' | 'rust' | 'lime' }) {
  const toneStyles = {
    muted: { color: colors.muted, borderColor: colors.border, background: '#202728' },
    green: { color: colors.green, borderColor: '#49604e', background: '#26332d' },
    rust: { color: '#e19a70', borderColor: '#74503e', background: colors.rustDeep },
    lime: { color: colors.lime, borderColor: '#687048', background: '#353a2c' },
  };
  return (
    <span className="inline-flex items-center border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={toneStyles[tone]}>
      {children}
    </span>
  );
}

function SkeletonDesk() {
  return (
    <main className="min-h-[100dvh] bg-[#1d2325] px-5 py-6 text-[#899793] md:px-8">
      <div className="mx-auto max-w-[1320px] animate-pulse">
        <div className="h-8 w-52 bg-[#2a3335]" />
        <div className="mt-10 h-28 border-y border-[#3b4747] bg-[#202728]" />
        <div className="mt-5 grid gap-4 lg:grid-cols-[205px_minmax(0,1fr)_290px]">
          <div className="h-[540px] border border-[#3b4747] bg-[#202728]" />
          <div className="h-[540px] border border-[#3b4747] bg-[#202728]" />
          <div className="h-[540px] border border-[#3b4747] bg-[#202728]" />
        </div>
      </div>
    </main>
  );
}

function EmptyDesk() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#1d2325] px-6 text-[#e8eee8]">
      <section className="max-w-md border border-[#3b4747] bg-[#202728] p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#687048] bg-[#353a2c] text-[#d1d58a]">
          <ClipboardCheck size={20} />
        </div>
        <h1 className="mt-5 font-serif text-2xl">No review evidence</h1>
        <p className="mt-3 text-sm leading-6 text-[#899793]">The local dossier is empty. A contract must be attached before a reviewer can inspect it.</p>
      </section>
    </main>
  );
}

function ErrorDesk({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#1d2325] px-6 text-[#e8eee8]">
      <section className="max-w-md border border-[#74503e] bg-[#2d2927] p-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#e19a70]">Evidence room unavailable</div>
        <h1 className="mt-3 font-serif text-2xl">Local dossier failed to load.</h1>
        <p className="mt-3 text-sm leading-6 text-[#c9b8ab]">The reviewer shell is safe to retry. No decision has been recorded.</p>
        <button type="button" data-testid="button-retry-dossier" onClick={onRetry} className="mt-5 inline-flex h-9 items-center gap-2 border border-[#d4986d] bg-[#d08254] px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#202322] transition-transform hover:-translate-y-0.5">
          <Activity size={13} /> Retry local dossier
        </button>
      </section>
    </main>
  );
}

function EvidenceRow({ item, selected, onSelect }: { item: EvidenceItem; selected: boolean; onSelect: () => void }) {
  const Icon = item.icon;
  const isMissing = item.status === 'missing';
  return (
    <button
      type="button"
      data-testid={`button-evidence-${item.id}`}
      aria-pressed={selected}
      onClick={onSelect}
      className="group flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#303a3b]"
      style={{
        borderColor: colors.border,
        background: selected ? '#303a3b' : 'transparent',
        boxShadow: selected ? `inset 3px 0 0 ${isMissing ? colors.rust : colors.green}` : 'none',
      }}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border" style={{ color: isMissing ? colors.rust : colors.green, borderColor: isMissing ? '#6d493b' : '#49604e', background: '#21292a' }}>
        <Icon size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px]" style={{ color: colors.ink }}>{item.label}</span>
          <span className="font-mono text-[10px]" style={{ color: isMissing ? '#df9871' : colors.green }}>{item.score}</span>
        </span>
        <span className="mt-1 block text-[10px] leading-4" style={{ color: colors.muted }}>{item.summary}</span>
        <span className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: isMissing ? '#d58660' : '#92ae98' }}>
          <span className={`h-1.5 w-1.5 rounded-full ${isMissing ? '' : 'forge-running-dot'}`} style={{ background: isMissing ? colors.rust : colors.green }} />
          {item.status}
          <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"><ChevronRight size={12} /></span>
        </span>
      </span>
    </button>
  );
}

function ReviewDesk() {
  const [activeSection, setActiveSection] = useState('Review desk');
  const [selectedEvidence, setSelectedEvidence] = useState('runtime');
  const [copied, setCopied] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [runState, setRunState] = useState<RunState>('idle');
  const [showAudit, setShowAudit] = useState(false);
  const [finalReview, setFinalReview] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [deskState, setDeskState] = useState<DeskState>('loading');

  useEffect(() => {
    const timer = window.setTimeout(() => setDeskState('ready'), 260);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (runState !== 'running') return;
    const timer = window.setTimeout(() => setRunState('complete'), 1300);
    return () => window.clearTimeout(timer);
  }, [runState]);

  const liveEvidence = runState === 'complete';
  const evidence = useMemo(
    () => evidenceItems.map((item) => item.id === 'runtime' && liveEvidence ? { ...item, score: '3 / 3', status: 'verified' as const } : item),
    [liveEvidence],
  );
  const selected = evidence.find((item) => item.id === selectedEvidence) ?? evidence[2];
  const openItems = liveEvidence ? 0 : 1;

  function copyCommand() {
    const command = 'forge inspect okhp3-skill-cataloger --evidence live';
    setCopied(true);
    if (navigator.clipboard) void navigator.clipboard.writeText(command).catch(() => undefined);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function selectNearby(name: string) {
    setSelectedNearby(name);
    setActiveSection('Catalog');
    setMobileNavOpen(false);
  }

  if (deskState === 'loading') return <SkeletonDesk />;
  if (deskState === 'error') return <ErrorDesk onRetry={() => setDeskState('ready')} />;
  if (!evidence.length) return <EmptyDesk />;

  return (
    <main className="forge-noise min-h-[100dvh] w-full overflow-x-hidden bg-[#1d2325] text-[#e8eee8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="relative z-10 flex min-h-[58px] flex-wrap items-center gap-y-2 border-b px-5 py-2 md:px-7" style={{ borderColor: colors.border, background: colors.shell }}>
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[12px] font-black" style={{ background: colors.rust, color: colors.shell }}>P3</div>
          <div className="leading-none">
            <div className="font-mono text-[11px] font-bold tracking-[0.12em]">SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: colors.muted }}>Review / governed library</div>
          </div>
        </div>
        <button type="button" data-testid="button-toggle-navigation" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((value) => !value)} className="ml-auto flex h-8 w-8 items-center justify-center border border-[#3b4747] text-[#cbd7d1] md:hidden">
          {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
        <div className={`${mobileNavOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col border-b bg-[#182022] px-5 py-2 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:px-0`}>
          {['Review desk', 'Catalog', 'Evidence', 'Changelog'].map((item) => (
            <button key={item} type="button" data-testid={`button-nav-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => { setActiveSection(item); setMobileNavOpen(false); }} className="relative px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] md:py-2" style={{ color: activeSection === item ? colors.ink : colors.muted }}>
              {item}
              {activeSection === item && <span className="absolute bottom-0 left-3 right-3 h-[2px]" style={{ background: colors.rust }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: colors.border, color: colors.muted }}>
            <Hash size={12} /><span className="font-mono text-[10px]">146 skills / 16 families</span>
          </div>
          <button type="button" data-testid="button-open-cli" onClick={() => setActiveSection('Catalog')} className="inline-flex h-8 items-center gap-2 border border-[#4d5b5b] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#cbd7d1] transition-colors hover:bg-[#2b3435]">
            <Terminal size={13} /> CLI
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#63766d', color: colors.lime }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-5 md:px-7">
        <div className="forge-reveal mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
          <ArrowLeft size={12} />
          <button type="button" data-testid="button-breadcrumb-catalog" onClick={() => setActiveSection('Catalog')} className="transition-colors hover:text-[#e8eee8]">Catalog</button>
          <ChevronRight size={11} /><span>Universal</span><ChevronRight size={11} /><span style={{ color: '#c1d0c8' }}>Review desk</span>
        </div>

        <header className="forge-reveal forge-reveal-delay-1 border-y py-5" style={{ borderColor: colors.border }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Pill tone="green">Universal / review queue</Pill>
                <span className="font-mono text-[10px]" style={{ color: colors.muted }}>SKILL-014 / canonical</span>
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 data-testid="text-skill-name" className="text-[30px] font-normal leading-none tracking-[-0.025em] sm:text-[34px]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#eef2ea' }}>okhp3-skill-cataloger</h1>
                <span className="mb-0.5 border px-2 py-1 font-mono text-[10px]" style={{ borderColor: '#62745e', color: colors.lime }}>v0.8.3</span>
              </div>
              <p className="mt-3 max-w-[680px] text-[13px]" style={{ color: '#afbeb6' }}>A decision surface for deciding whether this portable contract is ready to leave the library.</p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 pt-1 sm:w-auto sm:pt-8">
              <button type="button" data-testid="button-copy-review-command" onClick={copyCommand} className="inline-flex h-9 items-center gap-2 border border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] transition-colors hover:bg-[#303a3a]">
                {copied ? <Check size={14} style={{ color: colors.green }} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy review command'}
              </button>
              <button type="button" data-testid="button-open-source" onClick={() => window.open('https://github.com/overkillhill/skills/tree/main/universal/okhp3-skill-cataloger', '_blank', 'noopener,noreferrer')} className="inline-flex h-9 items-center gap-2 border border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] transition-colors hover:bg-[#303a3a]">
                <Github size={14} /> Source <ArrowUpRight size={11} />
              </button>
              <button type="button" data-testid="button-toggle-stack" onClick={() => setStacked((value) => !value)} className="inline-flex h-9 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#182022] transition-transform hover:-translate-y-0.5" style={{ background: stacked ? colors.lime : colors.green, borderColor: stacked ? '#d9de99' : '#b7d0ae' }}>
                {stacked ? <Check size={14} /> : <Plus size={14} />} {stacked ? 'In your stack' : 'Add to stack'}
              </button>
            </div>
          </div>
          {activeSection !== 'Review desk' && (
            <div className="mt-5 flex items-center gap-2 border-l-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ borderColor: colors.lime, background: '#29342e', color: '#b4c5b8' }} data-testid="status-active-section">
              <span style={{ color: colors.lime }}>Workspace focus</span> · {activeSection}
              {selectedNearby && <><span style={{ color: colors.muted }}>·</span> {selectedNearby}</>}
            </div>
          )}
        </header>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[205px_minmax(0,1fr)_290px]">
          <aside className="forge-reveal forge-reveal-delay-2 border" style={{ borderColor: colors.border, background: colors.panel }}>
            <div className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>Review route</div>
              <div className="mt-1 text-[12px]" style={{ color: colors.ink }}>4 checkpoints</div>
            </div>
            <div className="p-3">
              {routeItems.map((item, index) => {
                const Icon = item.icon;
                const active = index === 0;
                return (
                  <button key={item.label} type="button" data-testid={`button-route-${item.label.toLowerCase()}`} aria-current={active ? 'step' : undefined} onClick={() => setSelectedEvidence(item.evidence)} className="relative flex w-full items-center gap-3 border-l px-3 py-3 text-left transition-colors hover:bg-[#2b3435]" style={{ borderColor: active ? colors.rust : colors.border, background: active ? '#2c3536' : 'transparent' }}>
                    <Icon size={14} style={{ color: active ? colors.rust : colors.muted }} />
                    <span className="min-w-0"><span className="block font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: active ? colors.ink : '#b0bcb5' }}>{item.label}</span><span className="mt-1 block font-mono text-[9px]" style={{ color: item.meta === '1 missing' && !liveEvidence ? colors.rust : colors.muted }}>{item.meta === '1 missing' && liveEvidence ? 'verified' : item.meta}</span></span>
                    {active && <ChevronRight className="ml-auto" size={12} style={{ color: colors.rust }} />}
                  </button>
                );
              })}
            </div>
            <div className="m-3 border p-3" style={{ borderColor: '#4b5b50', background: '#29342e' }}>
              <div className="mb-2 flex items-center gap-2"><CheckCircle2 size={13} style={{ color: colors.green }} /><span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.green }}>Owner attached</span></div>
              <p className="text-[10px] leading-4" style={{ color: '#b4c5b8' }}>M. Reyes has the next review on 28 Jun.</p>
            </div>
          </aside>

          <section className="forge-reveal forge-reveal-delay-2 min-w-0 border" style={{ borderColor: colors.border, background: colors.panel }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2"><ClipboardCheck size={14} style={{ color: colors.lime }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d7e0d8' }}>Evidence dossier</span><Pill tone="lime">4 checks</Pill></div>
              <span data-testid="text-last-reviewed" className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>last reviewed · 14 jun 2024</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_275px]">
              <div className="border-r" style={{ borderColor: colors.border }}>
                {evidence.map((item) => <EvidenceRow key={item.id} item={item} selected={item.id === selectedEvidence} onSelect={() => setSelectedEvidence(item.id)} />)}
                <button type="button" data-testid="button-toggle-audit-trail" aria-expanded={showAudit} onClick={() => setShowAudit((value) => !value)} className="flex w-full items-center gap-2 border-t px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors hover:text-[#e8eee8]" style={{ borderColor: colors.border, color: colors.muted }}>
                  {showAudit ? <X size={12} /> : <ChevronDown size={12} />} {showAudit ? 'Collapse audit trail' : 'Show audit trail'}
                </button>
                {showAudit && (
                  <div className="border-t px-4 py-3" style={{ borderColor: colors.border, background: '#1c2324' }} data-testid="panel-audit-trail">
                    <div className="space-y-3 font-mono text-[9px]" style={{ color: colors.muted }}>
                      <div className="flex gap-3"><span style={{ color: colors.green }}>09:42</span><span>contract hash matched source</span></div>
                      <div className="flex gap-3"><span style={{ color: colors.green }}>09:39</span><span>owner metadata revalidated</span></div>
                      <div className="flex gap-3"><span style={{ color: colors.rust }}>09:37</span><span>live evidence request opened</span></div>
                      {liveEvidence && <div className="flex gap-3"><span style={{ color: colors.green }}>09:44</span><span>supervised fixture attached</span></div>}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Selected checkpoint</span><Pill tone={selected.status === 'missing' ? 'rust' : 'green'}>{selected.status}</Pill></div>
                <h2 data-testid="text-selected-checkpoint" className="text-[20px] leading-tight" style={{ color: '#eef1eb', fontFamily: "'Alfa Slab One', serif" }}>{selected.label}</h2>
                <p className="mt-3 text-[12px] leading-5" style={{ color: '#b8c4bd' }}>{selected.detail}</p>
                <div className="mt-5 border p-3" style={{ borderColor: selected.status === 'missing' ? '#724b3c' : '#4a5d4f', background: selected.status === 'missing' ? '#332724' : '#28332e' }}>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: selected.status === 'missing' ? '#dc946b' : colors.green }}><Terminal size={12} /> Next action</div>
                  <p className="text-[11px] leading-4" style={{ color: '#c9d4ca' }}>{selected.status === 'missing' ? 'Run the supervised fixture to attach live output and unlock the release gate.' : 'No action needed. Keep this evidence attached to the next release.'}</p>
                  {selected.status === 'missing' && <button type="button" data-testid="button-run-supervised-check" onClick={() => setRunState('running')} disabled={runState === 'running'} className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-[2px] border border-[#d4986d] px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] transition-colors hover:bg-[#e0a27d] disabled:cursor-wait disabled:opacity-70" style={{ background: colors.rust }}><Play size={12} /> {runState === 'running' ? 'Running fixture...' : runState === 'complete' ? 'Fixture complete' : 'Run supervised check'}</button>}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t pt-4 font-mono text-[9px] uppercase tracking-[0.11em]" style={{ borderColor: colors.border, color: colors.muted }}><Clock3 size={12} /> Evidence window · 14 days</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: colors.border, background: '#1c2324' }}>
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}><Code2 size={12} /> source contract · sha256: 4f9a...b82d</span>
              <span data-testid="status-schema-valid" className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.green }}><Check size={12} /> schema valid</span>
            </div>
          </section>

          <aside className="forge-reveal forge-reveal-delay-3 min-w-0">
            <div className="border" style={{ borderColor: finalReview ? '#4b604f' : '#76503d', background: finalReview ? '#28332e' : '#2d2927' }}>
              <div className="border-b px-4 py-3" style={{ borderColor: finalReview ? '#4b604f' : '#76503d' }}><div className="flex items-center gap-2"><LockKeyhole size={14} style={{ color: finalReview ? colors.green : colors.rust }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: finalReview ? '#c6d8c7' : '#e0c4b1' }}>Release gate</span></div></div>
              <div className="p-4">
                <div className="flex items-end justify-between"><span data-testid="status-release-gate" className="text-[24px]" style={{ fontFamily: "'Alfa Slab One', serif", color: finalReview ? '#d9ead8' : '#f0e7df' }}>{finalReview ? 'In review' : openItems ? 'Blocked' : 'Open'}</span><span className="font-mono text-[10px]" style={{ color: finalReview ? colors.green : '#de9670' }}>{finalReview ? 'review requested' : `${openItems} / 4 open`}</span></div>
                <div className="mt-4 h-1.5 w-full" style={{ background: finalReview ? '#3b5144' : '#503931' }}><div className="h-full transition-all duration-500" style={{ width: finalReview ? '100%' : liveEvidence ? '100%' : '72%', background: finalReview ? colors.green : colors.rust }} /></div>
                <p className="mt-4 text-[11px] leading-5" style={{ color: finalReview ? '#b8cdbb' : '#c9b8ab' }}>{finalReview ? 'Live evidence is attached. The release decision is now waiting for a reviewer sign-off.' : liveEvidence ? 'All evidence is present. The contract can now be sent for final review.' : 'The contract is structurally sound. One missing live artifact keeps it from a publishable state.'}</p>
                <button type="button" data-testid="button-request-final-review" disabled={!liveEvidence || finalReview} onClick={() => { setFinalReview(true); setActiveSection('Review desk'); }} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[2px] border border-[#d4986d] font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] transition-colors hover:bg-[#dfa17d] disabled:cursor-not-allowed disabled:opacity-50" style={{ background: finalReview ? colors.green : colors.rust }}><LockKeyhole size={12} /> {finalReview ? 'Final review requested' : liveEvidence ? 'Request final review' : 'Unlock after live evidence'}</button>
              </div>
            </div>
            <div className="mt-4 border" style={{ borderColor: colors.border, background: colors.panel }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d8e0d9' }}>Nearby contracts</span><Layers3 size={14} style={{ color: colors.muted }} /></div>
              {relatedSkills.map((skill) => <button key={skill.name} type="button" data-testid={`button-nearby-${skill.name}`} aria-pressed={selectedNearby === skill.name} onClick={() => selectNearby(skill.name)} className="group block w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#303a3b]" style={{ borderColor: colors.border, background: selectedNearby === skill.name ? '#303a3b' : 'transparent' }}><div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px]" style={{ color: '#d9e2da' }}>{skill.name}</span><ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.lime }} /></div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: skill.state === 'blocked' ? colors.rust : colors.green }}>{skill.state}</div><p className="mt-2 text-[10px]" style={{ color: colors.muted }}>{skill.note}</p></button>)}
            </div>
            <div className="mt-4 border px-4 py-4" style={{ borderColor: colors.border, background: colors.panel }}>
              <div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.lime }} /><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Provenance</span></div>
              <div className="space-y-2 font-mono text-[10px]"><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>owner</span><span style={{ color: '#c8d4ca' }}>overkill-hill</span></div><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>source</span><span style={{ color: '#c8d4ca' }}>main / universal</span></div><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>reviewed</span><span data-testid="text-review-date" style={{ color: '#c8d4ca' }}>2024-06-14</span></div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={ReviewDesk} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;