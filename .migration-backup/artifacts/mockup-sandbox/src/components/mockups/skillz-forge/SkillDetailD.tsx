import { useState, type ReactNode } from 'react';
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
  Play,
  Plus,
  ShieldAlert,
  Terminal,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const colors = {
  bg: '#1d2325',
  panel: '#242c2e',
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

const evidenceItems = [
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

function EvidenceRow({
  item,
  selected,
  onSelect,
}: {
  item: (typeof evidenceItems)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  const isMissing = item.status === 'missing';
  return (
    <button
      type="button"
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
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: isMissing ? colors.rust : colors.green }} />
          {item.status}
          <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"><ChevronRight size={12} /></span>
        </span>
      </span>
    </button>
  );
}

export function SkillDetailD() {
  const [activeSection, setActiveSection] = useState('Review desk');
  const [selectedEvidence, setSelectedEvidence] = useState('runtime');
  const [copied, setCopied] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [runState, setRunState] = useState<'idle' | 'running' | 'complete'>('idle');
  const [showAll, setShowAll] = useState(false);

  const selected = evidenceItems.find((item) => item.id === selectedEvidence) ?? evidenceItems[2];

  function copyCommand() {
    setCopied(true);
    if (navigator?.clipboard) void navigator.clipboard.writeText('forge inspect okhp3-skill-cataloger --evidence live');
    window.setTimeout(() => setCopied(false), 1600);
  }

  function runCheck() {
    setRunState('running');
    window.setTimeout(() => setRunState('complete'), 1100);
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden" style={{ background: colors.bg, color: colors.ink, fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="flex min-h-[58px] flex-wrap items-center gap-y-2 border-b px-5 py-2 md:px-7" style={{ borderColor: colors.border, background: '#182022' }}>
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[13px] font-black" style={{ background: colors.rust, color: '#182022' }}>P³</div>
          <div className="leading-none">
            <div className="font-mono text-[11px] font-bold tracking-[0.12em]">SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: colors.muted }}>Review / governed library</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {['Review desk', 'Catalog', 'Evidence', 'Changelog'].map((item) => (
            <button key={item} type="button" onClick={() => setActiveSection(item)} className="relative px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: activeSection === item ? colors.ink : colors.muted }}>
              {item}
              {activeSection === item && <span className="absolute bottom-0 left-3 right-3 h-[2px]" style={{ background: colors.rust }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 border px-3 py-1.5 md:flex" style={{ borderColor: colors.border, color: colors.muted }}>
            <Hash size={12} /><span className="font-mono text-[10px]">146 skills / 16 families</span>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 rounded-[3px] border-[#4d5b5b] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#cbd7d1] hover:bg-[#2b3435]" onClick={() => setActiveSection('Catalog')}>
            <Terminal size={13} /> CLI
          </Button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#63766d', color: colors.lime }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-5 md:px-7">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}>
          <ArrowLeft size={12} /><button type="button" onClick={() => setActiveSection('Catalog')} className="hover:text-[#e8eee8]">Catalog</button><ChevronRight size={11} /><span>Universal</span><ChevronRight size={11} /><span style={{ color: '#c1d0c8' }}>Review desk</span>
        </div>

        <header className="border-y py-5" style={{ borderColor: colors.border }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="rounded-[2px] border border-[#506657] bg-[#29352e] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#b3cda9]">Universal / review queue</Badge>
                <span className="font-mono text-[10px]" style={{ color: colors.muted }}>SKILL-014 / canonical</span>
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 className="text-[32px] font-normal leading-none tracking-[-0.025em]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#eef2ea' }}>okhp3-skill-cataloger</h1>
                <span className="mb-0.5 border px-2 py-1 font-mono text-[10px]" style={{ borderColor: '#62745e', color: colors.lime }}>v0.8.3</span>
              </div>
              <p className="mt-3 max-w-[680px] text-[13px]" style={{ color: '#afbeb6' }}>A decision surface for deciding whether this portable contract is ready to leave the library.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-8">
              <Button type="button" variant="outline" size="sm" onClick={copyCommand} className="h-9 rounded-[3px] border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] hover:bg-[#303a3a]">
                {copied ? <Check size={14} style={{ color: colors.green }} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy review command'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://github.com/overkillhill/skills/tree/main/universal/okhp3-skill-cataloger', '_blank', 'noopener,noreferrer')} className="h-9 rounded-[3px] border-[#586965] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#ced9d2] hover:bg-[#303a3a]">
                <Github size={14} /> Source <ArrowUpRight size={11} />
              </Button>
              <Button type="button" size="sm" onClick={() => setStacked((value) => !value)} className="h-9 rounded-[3px] border px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#182022] hover:bg-[#d9de99]" style={{ background: stacked ? colors.lime : colors.green, borderColor: stacked ? '#d9de99' : '#b7d0ae' }}>
                {stacked ? <Check size={14} /> : <Plus size={14} />} {stacked ? 'In your stack' : 'Add to stack'}
              </Button>
            </div>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[205px_minmax(0,1fr)_290px]">
          <aside className="border" style={{ borderColor: colors.border, background: '#202728' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>Review route</div>
              <div className="mt-1 text-[12px]" style={{ color: colors.ink }}>4 checkpoints</div>
            </div>
            <div className="p-3">
              {[
                { label: 'Decision', meta: 'current', icon: LockKeyhole },
                { label: 'Contract', meta: '8 sections', icon: BookOpen },
                { label: 'Evidence', meta: '1 missing', icon: Activity },
                { label: 'Provenance', meta: 'verified', icon: Layers3 },
              ].map((item, index) => {
                const Icon = item.icon;
                const active = index === 0;
                return (
                  <button key={item.label} type="button" onClick={() => setSelectedEvidence(index === 2 ? 'runtime' : index === 1 ? 'contract' : index === 3 ? 'provenance' : 'ownership')} className="relative flex w-full items-center gap-3 border-l px-3 py-3 text-left hover:bg-[#2b3435]" style={{ borderColor: active ? colors.rust : colors.border, background: active ? '#2c3536' : 'transparent' }}>
                    <Icon size={14} style={{ color: active ? colors.rust : colors.muted }} />
                    <span className="min-w-0"><span className="block font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: active ? colors.ink : '#b0bcb5' }}>{item.label}</span><span className="mt-1 block font-mono text-[9px]" style={{ color: item.meta === '1 missing' ? colors.rust : colors.muted }}>{item.meta}</span></span>
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

          <section className="min-w-0 border" style={{ borderColor: colors.border, background: '#202728' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2"><ClipboardCheck size={14} style={{ color: colors.lime }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d7e0d8' }}>Evidence dossier</span><Pill tone="lime">4 checks</Pill></div>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: colors.muted }}>last reviewed · 14 jun 2024</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_275px]">
              <div className="border-r" style={{ borderColor: colors.border }}>
                {evidenceItems.map((item) => <EvidenceRow key={item.id} item={item} selected={item.id === selectedEvidence} onSelect={() => setSelectedEvidence(item.id)} />)}
                <button type="button" onClick={() => setShowAll((value) => !value)} className="flex w-full items-center gap-2 border-t px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] hover:text-[#e8eee8]" style={{ borderColor: colors.border, color: colors.muted }}>
                  {showAll ? <X size={12} /> : <ChevronDown size={12} />} {showAll ? 'Collapse audit trail' : 'Show audit trail'}
                </button>
                {showAll && <div className="border-t px-4 py-3" style={{ borderColor: colors.border, background: '#1c2324' }}><div className="space-y-3 font-mono text-[9px]" style={{ color: colors.muted }}><div className="flex gap-3"><span style={{ color: colors.green }}>09:42</span><span>contract hash matched source</span></div><div className="flex gap-3"><span style={{ color: colors.green }}>09:39</span><span>owner metadata revalidated</span></div><div className="flex gap-3"><span style={{ color: colors.rust }}>09:37</span><span>live evidence request opened</span></div></div></div>}
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Selected checkpoint</span><Pill tone={selected.status === 'missing' ? 'rust' : 'green'}>{selected.status}</Pill></div>
                <h2 className="text-[20px] leading-tight" style={{ color: '#eef1eb', fontFamily: "'Alfa Slab One', serif" }}>{selected.label}</h2>
                <p className="mt-3 text-[12px] leading-5" style={{ color: '#b8c4bd' }}>{selected.detail}</p>
                <div className="mt-5 border p-3" style={{ borderColor: selected.status === 'missing' ? '#724b3c' : '#4a5d4f', background: selected.status === 'missing' ? '#332724' : '#28332e' }}>
                  <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: selected.status === 'missing' ? '#dc946b' : colors.green }}><Terminal size={12} /> Next action</div>
                  <p className="text-[11px] leading-4" style={{ color: '#c9d4ca' }}>{selected.status === 'missing' ? 'Run the supervised fixture to attach live output and unlock the release gate.' : 'No action needed. Keep this evidence attached to the next release.'}</p>
                  {selected.status === 'missing' && <Button type="button" size="sm" onClick={runCheck} disabled={runState === 'running'} className="mt-3 h-8 w-full rounded-[2px] border border-[#d4986d] px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] hover:bg-[#e0a27d]" style={{ background: '#d08254' }}><Play size={12} /> {runState === 'running' ? 'Running fixture…' : runState === 'complete' ? 'Fixture complete' : 'Run supervised check'}</Button>}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t pt-4 font-mono text-[9px] uppercase tracking-[0.11em]" style={{ borderColor: colors.border, color: colors.muted }}><Clock3 size={12} /> Evidence window · 14 days</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: colors.border, background: '#1c2324' }}>
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.muted }}><Code2 size={12} /> source contract · sha256: 4f9a…b82d</span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: colors.green }}><Check size={12} /> schema valid</span>
            </div>
          </section>

          <aside className="min-w-0">
            <div className="border" style={{ borderColor: '#76503d', background: '#2d2927' }}>
              <div className="border-b px-4 py-3" style={{ borderColor: '#76503d' }}><div className="flex items-center gap-2"><LockKeyhole size={14} style={{ color: colors.rust }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#e0c4b1' }}>Release gate</span></div></div>
              <div className="p-4">
                <div className="flex items-end justify-between"><span className="text-[24px]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#f0e7df' }}>Blocked</span><span className="font-mono text-[10px]" style={{ color: '#de9670' }}>1 / 4 open</span></div>
                <div className="mt-4 h-1.5 w-full" style={{ background: '#503931' }}><div className="h-full w-[72%]" style={{ background: colors.rust }} /></div>
                <p className="mt-4 text-[11px] leading-5" style={{ color: '#c9b8ab' }}>The contract is structurally sound. One missing live artifact keeps it from a publishable state.</p>
                <Button type="button" disabled={runState !== 'complete'} onClick={() => setActiveSection('Evidence')} className="mt-4 h-9 w-full rounded-[2px] border border-[#d4986d] font-mono text-[9px] uppercase tracking-[0.1em] text-[#202322] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#dfa17d]" style={{ background: colors.rust }}><LockKeyhole size={12} /> {runState === 'complete' ? 'Request final review' : 'Unlock after live evidence'}</Button>
              </div>
            </div>
            <div className="mt-4 border" style={{ borderColor: colors.border, background: '#202728' }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d8e0d9' }}>Nearby contracts</span><Layers3 size={14} style={{ color: colors.muted }} /></div>
              {relatedSkills.map((skill) => <button key={skill.name} type="button" onClick={() => setActiveSection('Catalog')} className="group block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-[#303a3b]" style={{ borderColor: colors.border }}><div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px]" style={{ color: '#d9e2da' }}>{skill.name}</span><ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100" style={{ color: colors.lime }} /></div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: skill.state === 'blocked' ? colors.rust : colors.green }}>{skill.state}</div><p className="mt-2 text-[10px]" style={{ color: colors.muted }}>{skill.note}</p></button>)}
            </div>
            <div className="mt-4 border px-4 py-4" style={{ borderColor: colors.border, background: '#202728' }}>
              <div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.lime }} /><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: colors.muted }}>Provenance</span></div>
              <div className="space-y-2 font-mono text-[10px]"><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>owner</span><span style={{ color: '#c8d4ca' }}>overkill-hill</span></div><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>source</span><span style={{ color: '#c8d4ca' }}>main / universal</span></div><div className="flex justify-between gap-3"><span style={{ color: colors.muted }}>reviewed</span><span style={{ color: '#c8d4ca' }}>2024-06-14</span></div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}