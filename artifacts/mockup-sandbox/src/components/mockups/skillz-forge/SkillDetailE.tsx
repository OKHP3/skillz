import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Copy,
  ExternalLink,
  FileCheck2,
  Github,
  Hash,
  Layers3,
  LockKeyhole,
  PackagePlus,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const palette = {
  ink: '#ede7de',
  muted: '#9b8e80',
  line: '#453a34',
  bg: '#2a2320',
  deep: '#211c19',
  panel: '#241f1c',
  orange: '#c87336',
  amber: '#e2a158',
  softGreen: '#9ab59b',
};

const metadata = [
  { label: 'Maturity', value: 'draftable', note: 'can be composed', icon: CircleDashed, tone: palette.amber },
  { label: 'Evidence', value: 'local checks', note: '1 artifact missing', icon: ClipboardCheck, tone: '#d3af77' },
  { label: 'Modified', value: '14 Jun 2024', note: '09:42 UTC', icon: Clock3, tone: '#c7b7a5' },
  { label: 'Readiness', value: 'needs live evidence', note: 'supervised use', icon: LockKeyhole, tone: '#d58c67' },
];

const related = [
  { name: 'okhp3-skill-auditor', family: 'universal', status: 'reviewable', description: 'Checks contracts for drift, gaps, and unsafe assumptions.' },
  { name: 'okhp3-skill-indexer', family: 'universal', status: 'draftable', description: 'Builds the machine-readable inventory from SKILL.md files.' },
  { name: 'okhp3-release-check', family: 'delivery', status: 'needs live evidence', description: 'Gates a release on evidence and owner sign-off.' },
];

function CodeLine({ number, children, active = false }: { number: string; children: ReactNode; active?: boolean }) {
  return (
    <div className="flex min-h-[23px] items-start font-mono text-[11px] leading-[23px]" style={{ background: active ? '#302923' : 'transparent' }}>
      <span className="w-10 shrink-0 select-none pr-3 text-right" style={{ color: '#685b50' }}>{number}</span>
      <span style={{ color: active ? '#e1b070' : '#cabfb4' }}>{children}</span>
    </div>
  );
}

function Stat({ label, value, note, icon: Icon, tone }: (typeof metadata)[number]) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-r px-4 py-3 last:border-r-0" style={{ borderColor: palette.line }}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm" style={{ color: tone, background: '#332b27' }}><Icon size={14} /></span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{label}</div>
        <div className="truncate text-[12px] font-medium" style={{ color: tone }}>{value}</div>
        <div className="mt-0.5 truncate font-mono text-[9px]" style={{ color: '#74685d' }}>{note}</div>
      </div>
    </div>
  );
}

export function SkillDetailE() {
  const [activeNav, setActiveNav] = useState('Catalog');
  const [activeTab, setActiveTab] = useState<'contract' | 'validation'>('contract');
  const [copied, setCopied] = useState(false);
  const [inStack, setInStack] = useState(false);
  const [ownerAssigned, setOwnerAssigned] = useState(false);
  const [liveEvidence, setLiveEvidence] = useState(false);
  const [relatedSkill, setRelatedSkill] = useState<string | null>(null);

  function copyUrl() {
    setCopied(true);
    if (navigator?.clipboard) void navigator.clipboard.writeText('https://forge.okhp3.dev/skills/okhp3-skill-cataloger');
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden" style={{ background: palette.bg, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="flex min-h-[56px] flex-wrap items-center gap-y-2 border-b px-5 py-2 md:px-7" style={{ borderColor: palette.line, background: '#211c19' }}>
        <div className="flex items-center gap-3 pr-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[13px] font-black" style={{ background: palette.orange, color: '#211c19' }}>P³</div>
          <div className="leading-none">
            <div className="font-mono text-[11px] font-bold tracking-[0.12em]">SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: palette.muted }}>OverKill Hill / governed library</div>
          </div>
        </div>
        <div className="flex h-full items-center gap-1">
          {['Catalog', 'Families', 'Evidence', 'Changelog'].map((item) => (
            <button key={item} type="button" onClick={() => setActiveNav(item)} className="relative h-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: activeNav === item ? palette.ink : palette.muted }}>
              {item}{activeNav === item && <span className="absolute bottom-0 left-3 right-3 h-[2px]" style={{ background: palette.orange }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 border px-3 py-1.5 md:flex" style={{ borderColor: palette.line, color: palette.muted }}><Hash size={12} /><span className="font-mono text-[10px]">146 skills / 16 families</span></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setActiveNav('Catalog')} className="h-8 rounded-[3px] border-[#5b4d42] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#c9bdb1] hover:bg-[#302823]"><Terminal size={13} /> CLI</Button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#6a584b', color: palette.amber }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-4 md:px-7">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: palette.muted }}>
          <ArrowLeft size={12} /><button type="button" onClick={() => setActiveNav('Catalog')} className="hover:text-[#ede7de]">Catalog</button><ChevronRight size={11} /><button type="button" onClick={() => setActiveNav('Families')} className="hover:text-[#ede7de]">Universal</button><ChevronRight size={11} /><span style={{ color: '#c7b9aa' }}>Skill detail</span>
        </div>

        <header className="border-y py-5" style={{ borderColor: palette.line }}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="rounded-[2px] border border-[#6c492f] bg-[#3a281f] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#e2a064]">Universal family</Badge><span className="font-mono text-[10px]" style={{ color: palette.muted }}>SKILL-014 / canonical</span></div>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2"><h1 className="text-[31px] font-normal leading-none tracking-[-0.025em]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#f3ede5' }}>okhp3-skill-cataloger</h1><span className="mb-0.5 border px-2 py-1 font-mono text-[10px]" style={{ borderColor: '#5a4d43', color: palette.amber }}>v0.8.3</span></div>
              <p className="mt-3 max-w-[700px] text-[13px]" style={{ color: '#b3a698' }}>Maintain a trustworthy, searchable index of portable agent skill contracts.</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyUrl} className="h-9 rounded-[3px] border-[#665448] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#d5c8bc] hover:bg-[#332a25]">{copied ? <Check size={14} style={{ color: palette.softGreen }} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy URL'}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://github.com/overkillhill/skills/tree/main/universal/okhp3-skill-cataloger', '_blank', 'noopener,noreferrer')} className="h-9 rounded-[3px] border-[#665448] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#d5c8bc] hover:bg-[#332a25]"><Github size={14} /> Source <ExternalLink size={11} /></Button>
              <Button type="button" size="sm" onClick={() => setInStack((value) => !value)} className="h-9 rounded-[3px] border border-[#d27835] px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#211c19] hover:bg-[#e6a03c]" style={{ background: inStack ? palette.amber : palette.orange }}><PackagePlus size={14} />{inStack ? 'In your stack' : 'Add to stack'}</Button>
            </div>
          </div>
        </header>

        <section className="mt-4 border" style={{ borderColor: '#735133', background: '#352920' }}>
          <div className="flex items-start gap-4 px-5 py-3.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm" style={{ background: '#5b3a26', color: palette.amber }}><ShieldCheck size={17} /></div>
            <div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: palette.amber }}><span>Trust summary</span><span style={{ color: '#7e5940' }}>·</span><span style={{ color: '#ae9078' }}>reviewable under supervision</span></div><p className="text-[13px] leading-5" style={{ color: '#eadfd3' }}>Contract is complete and locally validated. Attach one supervised live run to move from <strong style={{ color: palette.amber }}>needs-live-evidence</strong> to release-ready.</p></div>
            <div className="hidden shrink-0 items-center gap-2 border px-3 py-2 md:flex" style={{ borderColor: '#6f4d35', color: '#d8b68e' }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: palette.amber }} /><span className="font-mono text-[9px] uppercase tracking-[0.1em]">Supervised use</span></div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 border md:grid-cols-4" style={{ borderColor: palette.line, background: palette.panel }}>{metadata.map((item) => <Stat key={item.label} {...item} />)}</section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 border" style={{ borderColor: palette.line, background: palette.deep }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: palette.line }}>
              <div className="flex items-center gap-2"><BookOpen size={14} style={{ color: palette.amber }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Contract / SKILL.md</span></div>
              <div className="flex items-center gap-1 border p-0.5" style={{ borderColor: palette.line, background: '#2a2320' }}>{(['contract', 'validation'] as const).map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className="px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: activeTab === tab ? palette.ink : palette.muted, background: activeTab === tab ? '#3a3029' : 'transparent' }}>{tab === 'contract' ? 'Raw markdown' : 'Validation'}</button>)}</div>
            </div>
            {activeTab === 'contract' ? (
              <>
                <div className="py-4">
                  <CodeLine number="01"><span style={{ color: '#e0a265' }}>#</span> okhp3-skill-cataloger</CodeLine>
                  <CodeLine number="02">&nbsp;</CodeLine>
                  <CodeLine number="03"><span style={{ color: '#e0a265' }}>## Purpose</span></CodeLine>
                  <CodeLine number="04">Maintain a canonical inventory of portable agent skills.</CodeLine>
                  <CodeLine number="05">Produce a searchable catalog without weakening the source contract.</CodeLine>
                  <CodeLine number="06">&nbsp;</CodeLine>
                  <CodeLine number="07"><span style={{ color: '#e0a265' }}>## Inputs</span></CodeLine>
                  <CodeLine number="08"><span style={{ color: '#8fb5a3' }}>- </span>One or more directories containing <span style={{ color: '#d9ad73' }}>SKILL.md</span> files.</CodeLine>
                  <CodeLine number="09"><span style={{ color: '#8fb5a3' }}>- </span>Optional family manifest and release policy.</CodeLine>
                  <CodeLine number="10">&nbsp;</CodeLine>
                  <CodeLine number="11" active><span style={{ color: '#e0a265' }}>## Procedure</span></CodeLine>
                  <CodeLine number="12">1. Discover files; preserve path and repository provenance.</CodeLine>
                  <CodeLine number="13">2. Parse frontmatter and validate required fields.</CodeLine>
                  <CodeLine number="14">3. Group by family; flag duplicate names and missing owners.</CodeLine>
                  <CodeLine number="15">4. Emit an index with evidence status attached to every entry.</CodeLine>
                  <CodeLine number="16">&nbsp;</CodeLine>
                  <CodeLine number="17"><span style={{ color: '#e0a265' }}>## Constraints</span></CodeLine>
                  <CodeLine number="18"><span style={{ color: '#8fb5a3' }}>- </span>Never infer maturity from naming alone.</CodeLine>
                  <CodeLine number="19"><span style={{ color: '#8fb5a3' }}>- </span>Do not publish a skill without a source path.</CodeLine>
                  <CodeLine number="20"><span style={{ color: '#8fb5a3' }}>- </span>Mark local-only checks as <span style={{ color: '#d9ad73' }}>needs-live-evidence</span>.</CodeLine>
                  <CodeLine number="21">&nbsp;</CodeLine>
                  <CodeLine number="22"><span style={{ color: '#e0a265' }}>## Expected output</span></CodeLine>
                  <CodeLine number="23">A deterministic catalog entry for each valid contract.</CodeLine>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: palette.line, background: palette.panel }}><span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: palette.muted }}>contract hash · sha256: 4f9a…b82d</span><span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: palette.softGreen }}><Check size={12} /> syntax valid</span></div>
              </>
            ) : (
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between border p-3" style={{ borderColor: '#4c5d4e', background: '#29342e' }}><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: palette.softGreen }}><Check size={13} /> frontmatter schema</span><span className="font-mono text-[10px]" style={{ color: palette.softGreen }}>8 / 8</span></div>
                <div className="flex items-center justify-between border p-3" style={{ borderColor: '#4c5d4e', background: '#29342e' }}><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: palette.softGreen }}><Check size={13} /> local fixture scan</span><span className="font-mono text-[10px]" style={{ color: palette.softGreen }}>passed</span></div>
                <div className="flex items-center justify-between border p-3" style={{ borderColor: '#74503c', background: '#352824' }}><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: '#df9970' }}><LockKeyhole size={13} /> supervised run</span><span className="font-mono text-[10px]" style={{ color: '#df9970' }}>{liveEvidence ? 'attached' : 'missing'}</span></div>
              </div>
            )}
          </section>

          <aside className="min-w-0">
            <div className="border" style={{ borderColor: '#735133', background: '#352920' }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#735133' }}><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#e0c4aa' }}>Release readiness</span><LockKeyhole size={14} style={{ color: palette.amber }} /></div>
              <div className="p-4"><div className="flex items-end justify-between"><span className="text-[24px] leading-none" style={{ fontFamily: "'Alfa Slab One', serif", color: '#f3e8dc' }}>{liveEvidence ? 'Reviewable' : 'Blocked'}</span><span className="font-mono text-[10px]" style={{ color: liveEvidence ? palette.softGreen : '#d58c67' }}>{liveEvidence ? '4 / 4 ready' : '3 / 4 ready'}</span></div><div className="mt-4 h-1.5 w-full" style={{ background: '#52372d' }}><div className="h-full transition-all" style={{ width: liveEvidence ? '100%' : '75%', background: liveEvidence ? palette.softGreen : palette.orange }} /></div><div className="mt-4 space-y-2 font-mono text-[9px] uppercase tracking-[0.08em]"><div className="flex items-center gap-2" style={{ color: palette.softGreen }}><Check size={12} /> Contract complete</div><div className="flex items-center gap-2" style={{ color: palette.softGreen }}><Check size={12} /> Owner assigned</div><div className="flex items-center gap-2" style={{ color: palette.softGreen }}><Check size={12} /> Local checks pass</div><button type="button" onClick={() => setLiveEvidence(true)} className="flex w-full items-center gap-2 text-left hover:text-[#f3e8dc]" style={{ color: liveEvidence ? palette.softGreen : '#d58c67' }}>{liveEvidence ? <Check size={12} /> : <LockKeyhole size={12} />} {liveEvidence ? 'Live evidence attached' : 'Attach live evidence'}</button></div><Button type="button" disabled={!liveEvidence} onClick={() => setActiveNav('Evidence')} className="mt-4 h-9 w-full rounded-[3px] border border-[#d27835] font-mono text-[10px] uppercase tracking-[0.08em] text-[#211c19] disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#e6a03c]" style={{ background: palette.orange }}><FileCheck2 size={13} /> {liveEvidence ? 'Request final review' : 'Unlock final review'}</Button></div>
            </div>
            <div className="mt-4 border" style={{ borderColor: palette.line, background: palette.deep }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: palette.line }}><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Related skills</span><Layers3 size={14} style={{ color: palette.muted }} /></div>
              {related.map((skill) => <button key={skill.name} type="button" onClick={() => setRelatedSkill(skill.name)} className="group block w-full border-b px-4 py-3 text-left last:border-b-0 hover:bg-[#2c2521]" style={{ borderColor: palette.line, background: relatedSkill === skill.name ? '#2c2521' : 'transparent' }}><div className="flex items-start justify-between gap-2"><span className="font-mono text-[10px]" style={{ color: '#e2d6ca' }}>{skill.name}</span><ArrowUpRight size={12} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: palette.amber }} /></div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: skill.status === 'needs live evidence' ? '#c98867' : '#9caa92' }}>{skill.status}</div><p className="mt-2 text-[10px] leading-4" style={{ color: palette.muted }}>{skill.description}</p></button>)}
              <button type="button" onClick={() => setActiveNav('Families')} className="flex w-full items-center gap-2 border-t px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] hover:text-[#ede7de]" style={{ borderColor: palette.line, color: '#a98e76' }}>View universal family <ChevronRight size={12} /></button>
            </div>
            <div className="mt-4 border px-4 py-3.5" style={{ borderColor: palette.line, background: palette.panel }}><div className="mb-3 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full" style={{ background: palette.orange }} /><span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Provenance</span></div><div className="space-y-2 font-mono text-[10px]"><div className="flex justify-between gap-3"><span style={{ color: palette.muted }}>owner</span><span style={{ color: '#c7b8aa' }}>{ownerAssigned ? 'M. Reyes' : 'overkill-hill'}</span></div><button type="button" onClick={() => setOwnerAssigned((value) => !value)} className="flex w-full justify-between gap-3 text-left hover:text-[#ede7de]"><span style={{ color: palette.muted }}>steward</span><span style={{ color: '#c7b8aa' }}>{ownerAssigned ? 'assigned' : 'assign owner'}</span></button><div className="flex justify-between gap-3"><span style={{ color: palette.muted }}>source</span><span style={{ color: '#c7b8aa' }}>main / universal</span></div></div></div>
          </aside>
        </div>
      </div>
    </main>
  );
}