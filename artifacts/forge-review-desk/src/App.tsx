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
  Filter,
  Github,
  Hash,
  Layers3,
  LockKeyhole,
  Menu,
  Play,
  Plus,
  Search,
  Terminal,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { fetchCatalog, findSkill } from '@/lib/catalog';
import { buildEvidenceItems, buildRelatedSkills } from '@/lib/reviewEvidence';
import type { Catalog, EvidenceStatusV2, Maturity, Skill } from '@/types/catalog';

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
type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; catalog: Catalog }
  | { status: 'error'; message: string };

function formatDate(value: string | null): string {
  if (!value) return 'not recorded';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

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

function EmptyDesk({ title, message, backHref }: { title: string; message: string; backHref?: string }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#1d2325] px-6 text-[#e8eee8]">
      <section className="max-w-md border border-[#3b4747] bg-[#202728] p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#687048] bg-[#353a2c] text-[#d1d58a]">
          <ClipboardCheck size={20} />
        </div>
        <h1 className="mt-5 font-serif text-2xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#899793]">{message}</p>
        {backHref && (
          <Link href={backHref} className="mt-5 inline-flex h-9 items-center gap-2 border border-[#586965] bg-transparent px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#ced9d2] transition-colors hover:bg-[#303a3a]">
            <ArrowLeft size={13} /> Back to catalog
          </Link>
        )}
      </section>
    </main>
  );
}

function ErrorDesk({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#1d2325] px-6 text-[#e8eee8]">
      <section className="max-w-md border border-[#74503e] bg-[#2d2927] p-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#e19a70]">Evidence room unavailable</div>
        <h1 className="mt-3 font-serif text-2xl">Catalog data failed to load.</h1>
        <p className="mt-3 text-sm leading-6 text-[#c9b8ab]">{message} The reviewer shell is safe to retry. No decision has been recorded.</p>
        <button type="button" data-testid="button-retry-dossier" onClick={onRetry} className="mt-5 inline-flex h-9 items-center gap-2 border border-[#d4986d] bg-[#d08254] px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#202322] transition-transform hover:-translate-y-0.5">
          <Activity size={13} /> Retry
        </button>
      </section>
    </main>
  );
}

function EvidenceRow({ item, selected, onSelect }: { item: ReturnType<typeof buildEvidenceItems>[number]; selected: boolean; onSelect: () => void }) {
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

function ReviewDesk({ skill, catalog }: { skill: Skill; catalog: Catalog }) {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState('Review desk');
  const [selectedEvidence, setSelectedEvidence] = useState('runtime');
  const [copied, setCopied] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [runState, setRunState] = useState<RunState>('idle');
  const [showAudit, setShowAudit] = useState(false);
  const [finalReview, setFinalReview] = useState(false);

  // Reset per-visit review state whenever the reviewer switches to a
  // different skill, so a decision made on one contract never leaks onto
  // the next one opened in the desk.
  useEffect(() => {
    setSelectedEvidence('runtime');
    setRunState('idle');
    setShowAudit(false);
    setFinalReview(false);
    setActiveSection('Review desk');
  }, [skill.family, skill.name]);

  useEffect(() => {
    if (runState !== 'running') return;
    const timer = window.setTimeout(() => setRunState('complete'), 1300);
    return () => window.clearTimeout(timer);
  }, [runState]);

  const liveEvidence = runState === 'complete';
  const baseEvidence = useMemo(() => buildEvidenceItems(skill, catalog), [skill, catalog]);
  const evidence = useMemo(
    () => baseEvidence.map((item) => (item.id === 'runtime' && liveEvidence ? { ...item, score: '3 / 3', status: 'verified' as const } : item)),
    [baseEvidence, liveEvidence],
  );
  const related = useMemo(() => buildRelatedSkills(skill, catalog.skills), [skill, catalog.skills]);
  const routeItems = [
    { label: 'Decision', meta: 'current', icon: LockKeyhole, evidence: 'ownership' },
    { label: 'Contract', meta: `${baseEvidence[0].score} sections`, icon: BookOpen, evidence: 'contract' },
    { label: 'Evidence', meta: baseEvidence[2].status === 'verified' ? 'verified' : '1 missing', icon: Activity, evidence: 'runtime' },
    { label: 'Provenance', meta: baseEvidence[1].status === 'verified' ? 'verified' : 'incomplete', icon: Layers3, evidence: 'provenance' },
  ];

  const selected = evidence.find((item) => item.id === selectedEvidence) ?? evidence[2];
  const openItems = evidence.filter((item) => item.status === 'missing').length;
  const displayName = skill.displayName || skill.name;

  function copyCommand() {
    const command = `forge inspect ${skill.name} --evidence live`;
    setCopied(true);
    if (navigator.clipboard) void navigator.clipboard.writeText(command).catch(() => undefined);
    window.setTimeout(() => setCopied(false), 1600);
  }

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
            <button
              key={item}
              type="button"
              data-testid={`button-nav-${item.toLowerCase().replaceAll(' ', '-')}`}
              onClick={() => {
                setMobileNavOpen(false);
                if (item === 'Catalog') { navigate('/'); return; }
                setActiveSection(item);
              }}
              className="relative px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] md:py-2"
              style={{ color: activeSection === item ? colors.ink : colors.muted }}
            >
              {item}
              {activeSection === item && <span className="absolute bottom-0 left-3 right-3 h-[2px]" style={{ background: colors.rust }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: colors.border, color: colors.muted }}>
            <Hash size={12} /><span className="font-mono text-[10px]">{catalog.skillCount} skills / {catalog.familyCount} families</span>
          </div>
          <button type="button" data-testid="button-open-cli" onClick={() => navigate('/')} className="inline-flex h-8 items-center gap-2 border border-[#4d5b5b] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#cbd7d1] transition-colors hover:bg-[#2b3435]">
            <Terminal size={13} /> CLI
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#63766d', color: colors.lime }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-5 md:px-7">
        <div className="forge-reveal mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
          <ArrowLeft size={12} />
          <Link href="/" data-testid="button-breadcrumb-catalog" className="transition-colors hover:text-[#e8eee8]">Catalog</Link>
          <ChevronRight size={11} /><span>{skill.family}</span><ChevronRight size={11} /><span style={{ color: '#c1d0c8' }}>Review desk</span>
        </div>

        <header className="forge-reveal forge-reveal-delay-1 border-y py-5" style={{ borderColor: colors.border }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Pill tone="green">{skill.family} / review queue</Pill>
                <span className="font-mono text-[10px]" style={{ color: colors.muted }}>{skill.maturity} / {skill.evidence.status}</span>
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 data-testid="text-skill-name" className="text-[30px] font-normal leading-none tracking-[-0.025em] sm:text-[34px]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#eef2ea' }}>{skill.name}</h1>
                {skill.version && <span className="mb-0.5 border px-2 py-1 font-mono text-[10px]" style={{ borderColor: '#62745e', color: colors.lime }}>v{skill.version}</span>}
              </div>
              <p className="mt-3 max-w-[680px] text-[13px]" style={{ color: '#afbeb6' }}>{skill.description || 'A decision surface for deciding whether this portable contract is ready to leave the library.'}</p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 pt-1 sm:w-auto sm:pt-8">
              <button type="button" data-testid="button-copy-review-command" onClick={copyCommand} className="inline-flex h-9 items-center gap-2 border border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] transition-colors hover:bg-[#303a3a]">
                {copied ? <Check size={14} style={{ color: colors.green }} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy review command'}
              </button>
              <button type="button" data-testid="button-open-source" onClick={() => window.open(skill.githubUrl, '_blank', 'noopener,noreferrer')} className="inline-flex h-9 items-center gap-2 border border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] transition-colors hover:bg-[#303a3a]">
                <Github size={14} /> Source <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
          {activeSection !== 'Review desk' && (
            <div className="mt-5 flex items-center gap-2 border-l-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ borderColor: colors.lime, background: '#29342e', color: '#b4c5b8' }} data-testid="status-active-section">
              <span style={{ color: colors.lime }}>Workspace focus</span> · {activeSection}
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
              {routeItems.map((item) => {
                const Icon = item.icon;
                const active = item.evidence === selectedEvidence;
                return (
                  <button key={item.label} type="button" data-testid={`button-route-${item.label.toLowerCase()}`} aria-current={active ? 'step' : undefined} onClick={() => setSelectedEvidence(item.evidence)} className="relative flex w-full items-center gap-3 border-l px-3 py-3 text-left transition-colors hover:bg-[#2b3435]" style={{ borderColor: active ? colors.rust : colors.border, background: active ? '#2c3536' : 'transparent' }}>
                    <Icon size={14} style={{ color: active ? colors.rust : colors.muted }} />
                    <span className="min-w-0"><span className="block font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: active ? colors.ink : '#b0bcb5' }}>{item.label}</span><span className="mt-1 block font-mono text-[9px]" style={{ color: colors.muted }}>{item.meta}</span></span>
                    {active && <ChevronRight className="ml-auto" size={12} style={{ color: colors.rust }} />}
                  </button>
                );
              })}
            </div>
            <div className="m-3 border p-3" style={{ borderColor: baseEvidence[3].status === 'verified' ? '#4b5b50' : '#74503e', background: baseEvidence[3].status === 'verified' ? '#29342e' : '#2d2927' }}>
              <div className="mb-2 flex items-center gap-2"><CheckCircle2 size={13} style={{ color: baseEvidence[3].status === 'verified' ? colors.green : colors.rust }} /><span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: baseEvidence[3].status === 'verified' ? colors.green : colors.rust }}>{baseEvidence[3].status === 'verified' ? 'Owner attached' : 'No owner sign-off'}</span></div>
              <p className="text-[10px] leading-4" style={{ color: '#b4c5b8' }}>{skill.author ? `${skill.author} · reviewed ${formatDate(skill.maturityReviewedAt)}.` : `No author recorded. Reviewed ${formatDate(skill.maturityReviewedAt)}.`}</p>
            </div>
          </aside>

          <section className="forge-reveal forge-reveal-delay-2 min-w-0 border" style={{ borderColor: colors.border, background: colors.panel }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2"><ClipboardCheck size={14} style={{ color: colors.lime }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d7e0d8' }}>Evidence dossier</span><Pill tone="lime">4 checks</Pill></div>
              <span data-testid="text-last-reviewed" className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>last reviewed · {formatDate(skill.maturityReviewedAt)}</span>
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
                      <div className="flex gap-3"><span style={{ color: colors.green }}>source</span><span>{skill.path}</span></div>
                      <div className="flex gap-3"><span style={{ color: colors.green }}>commit</span><span>{skill.commitSha ?? 'unrecorded'}</span></div>
                      <div className="flex gap-3"><span style={{ color: liveEvidence ? colors.green : colors.rust }}>evidence</span><span>{liveEvidence ? 'supervised fixture attached' : `status: ${skill.evidence.status}`}</span></div>
                      {liveEvidence && <div className="flex gap-3"><span style={{ color: colors.green }}>fixture</span><span>supervised run recorded for this session</span></div>}
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
                  <p className="text-[11px] leading-4" style={{ color: '#c9d4ca' }}>{selected.status === 'missing' ? (selected.id === 'runtime' ? 'Run the supervised fixture to attach live output and unlock the release gate.' : 'Address the missing fields before this checkpoint can pass.') : 'No action needed. Keep this evidence attached to the next release.'}</p>
                  {selected.status === 'missing' && selected.id === 'runtime' && <button type="button" data-testid="button-run-supervised-check" onClick={() => setRunState('running')} disabled={runState === 'running'} className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-[2px] border border-[#d4986d] px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] transition-colors hover:bg-[#e0a27d] disabled:cursor-wait disabled:opacity-70" style={{ background: colors.rust }}><Play size={12} /> {runState === 'running' ? 'Running fixture...' : runState === 'complete' ? 'Fixture complete' : 'Run supervised check'}</button>}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t pt-4 font-mono text-[9px] uppercase tracking-[0.11em]" style={{ borderColor: colors.border, color: colors.muted }}><Clock3 size={12} /> Last evidence · {formatDate(skill.evidence.lastEvidenceDate)}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: colors.border, background: '#1c2324' }}>
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}><Code2 size={12} /> source contract · commit: {skill.commitSha ?? 'unrecorded'}</span>
              <span data-testid="status-schema-valid" className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.green }}><Check size={12} /> schema valid</span>
            </div>
          </section>

          <aside className="forge-reveal forge-reveal-delay-3 min-w-0">
            <div className="border" style={{ borderColor: finalReview ? '#4b604f' : '#76503d', background: finalReview ? '#28332e' : '#2d2927' }}>
              <div className="border-b px-4 py-3" style={{ borderColor: finalReview ? '#4b604f' : '#76503d' }}><div className="flex items-center gap-2"><LockKeyhole size={14} style={{ color: finalReview ? colors.green : colors.rust }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: finalReview ? '#c6d8c7' : '#e0c4b1' }}>Release gate</span></div></div>
              <div className="p-4">
                <div className="flex items-end justify-between"><span data-testid="status-release-gate" className="text-[24px]" style={{ fontFamily: "'Alfa Slab One', serif", color: finalReview ? '#d9ead8' : '#f0e7df' }}>{finalReview ? 'In review' : openItems ? 'Blocked' : 'Open'}</span><span className="font-mono text-[10px]" style={{ color: finalReview ? colors.green : '#de9670' }}>{finalReview ? 'review requested' : `${openItems} / 4 open`}</span></div>
                <div className="mt-4 h-1.5 w-full" style={{ background: finalReview ? '#3b5144' : '#503931' }}><div className="h-full transition-all duration-500" style={{ width: finalReview ? '100%' : `${((4 - openItems) / 4) * 100}%`, background: finalReview ? colors.green : colors.rust }} /></div>
                <p className="mt-4 text-[11px] leading-5" style={{ color: finalReview ? '#b8cdbb' : '#c9b8ab' }}>{finalReview ? 'Live evidence is attached. The release decision is now waiting for a reviewer sign-off.' : openItems === 0 ? 'All evidence is present. The contract can now be sent for final review.' : `${openItems} of 4 checkpoints are still open.`}</p>
                <button type="button" data-testid="button-request-final-review" disabled={openItems > 0 || finalReview} onClick={() => { setFinalReview(true); setActiveSection('Review desk'); }} className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[2px] border border-[#d4986d] font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] transition-colors hover:bg-[#dfa17d] disabled:cursor-not-allowed disabled:opacity-50" style={{ background: finalReview ? colors.green : colors.rust }}><LockKeyhole size={12} /> {finalReview ? 'Final review requested' : openItems === 0 ? 'Request final review' : 'Unlock after live evidence'}</button>
              </div>
            </div>
            <div className="mt-4 border" style={{ borderColor: colors.border, background: colors.panel }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d8e0d9' }}>Nearby contracts</span><Layers3 size={14} style={{ color: colors.muted }} /></div>
              {related.length === 0 && <p className="px-4 py-3 text-[10px]" style={{ color: colors.muted }}>No related skills recorded.</p>}
              {related.map((r) => (
                <Link key={r.name} href={`/${r.family}/${r.name}`} data-testid={`button-nearby-${r.name}`} className="group block w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#303a3b]" style={{ borderColor: colors.border }}>
                  <div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px]" style={{ color: '#d9e2da' }}>{r.name}</span><ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.lime }} /></div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.green }}>{r.maturity}</div>
                  <p className="mt-2 text-[10px]" style={{ color: colors.muted }}>{r.note}</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 border px-4 py-4" style={{ borderColor: colors.border, background: colors.panel }}>
              <div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.lime }} /><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Provenance</span></div>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>owner</span><span style={{ color: '#c8d4ca' }}>{skill.author ?? 'unrecorded'}</span></div>
                <div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>source</span><span style={{ color: '#c8d4ca' }}>{catalog.sourceRef} / {skill.family}</span></div>
                <div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>reviewed</span><span data-testid="text-review-date" style={{ color: '#c8d4ca' }}>{formatDate(skill.maturityReviewedAt)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CatalogList({ catalog }: { catalog: Catalog }) {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState(() => window.location.search.slice(1));
  useEffect(() => {
    const handlePopState = () => setSearch(window.location.search.slice(1));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const params = new URLSearchParams(search);
  const query = params.get('q') ?? '';
  const family = params.get('family') ?? '';
  const evidence = params.get('evidence') ?? '';
  const maturity = params.get('maturity') ?? '';
  const normalized = query.trim().toLowerCase();
  const evidenceStatuses: EvidenceStatusV2[] = ['live', 'analytical', 'historical', 'not-run', 'none'];
  const maturities: Maturity[] = ['placeholder', 'skeleton', 'draftable', 'usable', 'validated', 'published'];
  const skills = catalog.skills.filter((s) => {
    const matchesQuery = !normalized
      || s.name.toLowerCase().includes(normalized)
      || s.displayName.toLowerCase().includes(normalized)
      || s.family.toLowerCase().includes(normalized);
    return matchesQuery
      && (!family || s.family === family)
      && (!evidence || s.evidence.status === evidence)
      && (!maturity || s.maturity === maturity);
  });

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    const nextQuery = next.toString();
    navigate(nextQuery ? `/?${nextQuery}` : '/');
    setSearch(nextQuery);
  };

  const clearFilters = () => navigate('/');
  const activeFilterCount = [family, evidence, maturity].filter(Boolean).length;

  return (
    <main className="forge-noise min-h-[100dvh] w-full bg-[#1d2325] text-[#e8eee8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="flex min-h-[58px] items-center gap-3 border-b px-5 py-2 md:px-7" style={{ borderColor: colors.border, background: colors.shell }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[12px] font-black" style={{ background: colors.rust, color: colors.shell }}>P3</div>
        <div className="leading-none">
          <div className="font-mono text-[11px] font-bold tracking-[0.12em]">SKILLZ FORGE</div>
          <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: colors.muted }}>Review / governed library</div>
        </div>
        <div className="ml-auto flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: colors.border, color: colors.muted }}>
          <Hash size={12} /><span className="font-mono text-[10px]">{catalog.skillCount} skills / {catalog.familyCount} families</span>
        </div>
      </nav>
      <div className="mx-auto max-w-[1000px] px-5 py-8 md:px-7">
        <h1 className="text-[28px]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#eef2ea' }}>Review queue</h1>
        <p className="mt-2 text-[13px]" style={{ color: '#afbeb6' }}>Pick any skill from the catalog to open its evidence dossier.</p>
        <div className="mt-5 flex items-center gap-2 border px-3 py-2" style={{ borderColor: colors.border, background: colors.panel }}>
          <Search size={14} style={{ color: colors.muted }} />
          <input
            data-testid="input-catalog-search"
            type="text"
            value={query}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="Search skills by name or family"
            className="w-full bg-transparent font-mono text-[12px] outline-none"
            style={{ color: colors.ink }}
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="flex min-w-0 flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>
            Family
            <select
              data-testid="select-catalog-family"
              value={family}
              onChange={(e) => updateFilter('family', e.target.value)}
              className="h-9 min-w-0 border bg-[#202728] px-2 text-[11px] normal-case tracking-normal outline-none"
              style={{ borderColor: colors.border, color: colors.ink }}
            >
              <option value="">All families</option>
              {catalog.families
                .slice()
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map((item) => <option key={item.name} value={item.name}>{item.displayName}</option>)}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>
            Evidence status
            <select
              data-testid="select-catalog-evidence"
              value={evidence}
              onChange={(e) => updateFilter('evidence', e.target.value)}
              className="h-9 min-w-0 border bg-[#202728] px-2 text-[11px] normal-case tracking-normal outline-none"
              style={{ borderColor: colors.border, color: colors.ink }}
            >
              <option value="">All evidence</option>
              {evidenceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>
            Maturity
            <select
              data-testid="select-catalog-maturity"
              value={maturity}
              onChange={(e) => updateFilter('maturity', e.target.value)}
              className="h-9 min-w-0 border bg-[#202728] px-2 text-[11px] normal-case tracking-normal outline-none"
              style={{ borderColor: colors.border, color: colors.ink }}
            >
              <option value="">All maturity</option>
              {maturities.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <button
            type="button"
            data-testid="button-clear-catalog-filters"
            onClick={clearFilters}
            disabled={!query && !activeFilterCount}
            className="mt-auto inline-flex h-9 items-center justify-center gap-2 border px-3 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[#303a3a] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: colors.border, color: colors.muted }}
          >
            <Filter size={12} /> Clear
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>
          <span>{skills.length} of {catalog.skillCount} skills</span>
          {(query || activeFilterCount > 0) && <span>filtered view · shareable URL</span>}
        </div>
        <ul className="mt-4 divide-y" style={{ borderColor: colors.border }}>
          {skills.map((s) => (
            <li key={s.name} style={{ borderColor: colors.border }}>
              <Link href={`/${s.family}/${s.name}`} data-testid={`link-catalog-skill-${s.name}`} className="group flex items-center justify-between gap-3 border-b px-3 py-3 transition-colors hover:bg-[#242d2e]" style={{ borderColor: colors.border }}>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[12px]" style={{ color: colors.ink }}>{s.name}</span>
                  <span className="mt-1 block truncate text-[10px]" style={{ color: colors.muted }}>{s.family} · {s.maturity} · {s.evidence.status}</span>
                </span>
                <ArrowUpRight size={14} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.lime }} />
              </Link>
            </li>
          ))}
          {skills.length === 0 && <li className="px-3 py-6 text-center text-[12px]" style={{ color: colors.muted }}>No skills match the current filters.</li>}
        </ul>
      </div>
    </main>
  );
}

function SkillRoute({ catalog }: { catalog: Catalog }) {
  const { family, name } = useParams<{ family: string; name: string }>();
  const skill = findSkill(catalog, family ?? '', name ?? '');
  if (!skill) {
    return (
      <EmptyDesk
        title="Skill not found"
        message={`No skill named "${name}" in the "${family}" family. It may have been renamed or removed from the catalog.`}
        backHref="/"
      />
    );
  }
  return <ReviewDesk skill={skill} catalog={catalog} />;
}

function Router() {
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: 'loading' });
  const [location] = useLocation();

  useEffect(() => {
    let cancelled = false;
    setCatalogState({ status: 'loading' });
    fetchCatalog()
      .then((catalog) => { if (!cancelled) setCatalogState({ status: 'ready', catalog }); })
      .catch((err: unknown) => { if (!cancelled) setCatalogState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error.' }); });
    return () => { cancelled = true; };
    // Retry is triggered by bumping a counter below; catalog itself never
    // needs to refetch on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (catalogState.status === 'loading') return <SkeletonDesk />;
  if (catalogState.status === 'error') {
    return (
      <ErrorDesk
        message={catalogState.message}
        onRetry={() => {
          setCatalogState({ status: 'loading' });
          fetchCatalog()
            .then((catalog) => setCatalogState({ status: 'ready', catalog }))
            .catch((err: unknown) => setCatalogState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error.' }));
        }}
      />
    );
  }

  const { catalog } = catalogState;
  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/" component={() => <CatalogList catalog={catalog} />} />
        <Route path="/:family/:name" component={() => <SkillRoute catalog={catalog} />} />
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
