import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  ExternalLink,
  GitBranch,
  Github,
  Hash,
  Layers3,
  LockKeyhole,
  MoreHorizontal,
  PackagePlus,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ink = '#ede7de';
const muted = '#8a7e6e';
const border = '#3d3530';
const orange = '#c46a2c';
const amber = '#e6a03c';

const relatedSkills = [
  {
    name: 'okhp3-skill-auditor',
    family: 'universal',
    note: 'Checks contracts for drift, gaps, and unsafe assumptions.',
    status: 'reviewable',
  },
  {
    name: 'okhp3-skill-indexer',
    family: 'universal',
    note: 'Builds the machine-readable inventory from SKILL.md files.',
    status: 'draftable',
  },
  {
    name: 'okhp3-release-check',
    family: 'delivery',
    note: 'Gates a release on evidence and owner sign-off.',
    status: 'needs live evidence',
  },
];

function MetaItem({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 border-r px-4 py-2.5 last:border-r-0" style={{ borderColor: border }}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm" style={{ color: accent ?? muted, background: '#332b27' }}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: muted }}>{label}</div>
        <div className="truncate text-[12px] font-medium" style={{ color: accent ?? ink }}>{value}</div>
      </div>
    </div>
  );
}

function CodeLine({ n, children, highlight }: { n: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div className="flex min-h-[23px] items-start font-mono text-[11px] leading-[23px]" style={{ background: highlight ? '#302a24' : 'transparent' }}>
      <span className="w-10 shrink-0 select-none pr-3 text-right" style={{ color: '#62574c' }}>{n}</span>
      <span style={{ color: highlight ? '#d5ae76' : '#c9c0b5' }}>{children}</span>
    </div>
  );
}

export function SkillDetailC() {
  const [copied, setCopied] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [activeNav, setActiveNav] = useState('Catalog');

  function copySkillUrl() {
    setCopied(true);
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText('https://forge.okhp3.dev/skills/okhp3-skill-cataloger');
    }
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main
      className="min-h-[100dvh] w-full overflow-x-hidden"
      style={{ background: '#2a2320', color: ink, fontFamily: "'DM Sans', sans-serif" }}
    >
      <nav className="flex h-[56px] items-center border-b px-7" style={{ borderColor: border, background: '#211c19' }}>
        <div className="flex items-center gap-3 pr-9">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[13px] font-black" style={{ background: orange, color: '#211c19' }}>P³</div>
          <div className="leading-none">
            <div className="font-mono text-[11px] font-bold tracking-[0.12em]" style={{ color: ink }}>SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: muted }}>OverKill Hill / governed library</div>
          </div>
        </div>
        <div className="flex h-full items-center gap-1">
          {['Catalog', 'Families', 'Evidence', 'Changelog'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveNav(item)}
              className="relative h-full px-4 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
              style={{ color: activeNav === item ? ink : muted }}
            >
              {item}
              {activeNav === item && <span className="absolute bottom-0 left-4 right-4 h-[2px]" style={{ background: orange }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 border px-3 py-1.5 md:flex" style={{ borderColor: border, color: muted }}>
            <Hash size={12} />
            <span className="font-mono text-[10px]">146 skills / 16 families</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[3px] border-[#51463d] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#c9bcae] hover:bg-[#302823]"
          >
            <Terminal size={13} /> CLI
          </Button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#68574a', color: amber }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1260px] px-7 pb-12 pt-5">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: muted }}>
          <ArrowLeft size={12} />
          <button type="button" className="hover:text-[#ede7de]" onClick={() => setActiveNav('Catalog')}>Catalog</button>
          <ChevronRight size={11} />
          <span>Universal</span>
          <ChevronRight size={11} />
          <span style={{ color: '#c4b7a8' }}>Skill detail</span>
        </div>

        <header className="border-y py-5" style={{ borderColor: border }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge className="rounded-[2px] border border-[#6c492f] bg-[#3a281f] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[#e2a064]">Universal family</Badge>
                <span className="font-mono text-[10px]" style={{ color: muted }}>SKILL-014 / canonical</span>
              </div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 className="text-[32px] font-normal leading-none tracking-[-0.025em]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#f3ede5' }}>
                  okhp3-skill-cataloger
                </h1>
                <span className="mb-0.5 border px-2 py-1 font-mono text-[10px]" style={{ borderColor: '#5a4d43', color: amber }}>v0.8.3</span>
              </div>
              <p className="mt-3 max-w-[680px] text-[13px]" style={{ color: '#b3a698' }}>
                Maintain a trustworthy, searchable index of portable agent skill contracts.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-8">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copySkillUrl}
                className="h-9 rounded-[3px] border-[#665448] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#d5c8bc] hover:bg-[#332a25]"
              >
                {copied ? <Check size={14} style={{ color: '#a7c29e' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy skill URL'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/overkillhill/skills/tree/main/universal/okhp3-skill-cataloger', '_blank', 'noopener,noreferrer')}
                className="h-9 rounded-[3px] border-[#665448] bg-transparent px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#d5c8bc] hover:bg-[#332a25]"
              >
                <Github size={14} /> GitHub <ExternalLink size={11} />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setStacked((value) => !value)}
                className="h-9 rounded-[3px] border border-[#d27835] px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#211c19] hover:bg-[#e6a03c]"
                style={{ background: stacked ? amber : orange }}
              >
                {stacked ? <Check size={14} /> : <PackagePlus size={14} />}
                {stacked ? 'In your stack' : 'Add to stack'}
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-4 border" style={{ borderColor: '#735133', background: '#352920' }}>
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm" style={{ background: '#5b3a26', color: amber }}>
              <ShieldCheck size={17} />
            </div>
            <div className="max-w-[850px]">
              <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: amber }}>
                <span>In plain terms</span><span style={{ color: '#7e5940' }}>·</span><span style={{ color: '#ae9078' }}>trust summary</span>
              </div>
              <p className="text-[14px] leading-6" style={{ color: '#eadfd3' }}>
                This skill&apos;s contract is complete and reviewable under supervision. Evidence is local checks only, which puts it at <strong style={{ color: amber }}>&apos;needs-live-evidence.&apos;</strong>
              </p>
            </div>
            <div className="ml-auto hidden shrink-0 items-center gap-2 border px-3 py-2 md:flex" style={{ borderColor: '#6f4d35', color: '#d8b68e' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: amber }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.1em]">Supervised use</span>
            </div>
          </div>
        </section>

        <section className="mt-4 flex flex-wrap border" style={{ borderColor: border, background: '#241f1c' }}>
          <MetaItem label="Maturity" value="draftable" accent={amber} icon={<GitBranch size={14} />} />
          <MetaItem label="Evidence status" value="local-checks" accent="#d7ad73" icon={<Clipboard size={14} />} />
          <MetaItem label="Last modified" value="2024-06-14 · 09:42 UTC" icon={<Clock3 size={14} />} />
          <MetaItem label="Release readiness" value="needs-live-evidence" accent="#d58b67" icon={<LockKeyhole size={14} />} />
        </section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_295px]">
          <section className="min-w-0 border" style={{ borderColor: border, background: '#211c19' }}>
            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: border }}>
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: amber }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Contract / SKILL.md</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: muted }}>
                <span>raw markdown</span>
                <MoreHorizontal size={14} />
              </div>
            </div>
            <div className="px-0 py-4">
              <CodeLine n="01"><span style={{ color: '#e0a265' }}>#</span> okhp3-skill-cataloger</CodeLine>
              <CodeLine n="02">&nbsp;</CodeLine>
              <CodeLine n="03"><span style={{ color: '#e0a265' }}>## Purpose</span></CodeLine>
              <CodeLine n="04">Maintain a canonical inventory of portable agent skills.</CodeLine>
              <CodeLine n="05">Produce a searchable catalog without weakening the source contract.</CodeLine>
              <CodeLine n="06">&nbsp;</CodeLine>
              <CodeLine n="07"><span style={{ color: '#e0a265' }}>## Inputs</span></CodeLine>
              <CodeLine n="08"><span style={{ color: '#8fb5a3' }}>- </span>One or more directories containing <span style={{ color: '#d9ad73' }}>SKILL.md</span> files.</CodeLine>
              <CodeLine n="09"><span style={{ color: '#8fb5a3' }}>- </span>Optional family manifest and release policy.</CodeLine>
              <CodeLine n="10">&nbsp;</CodeLine>
              <CodeLine n="11" highlight><span style={{ color: '#e0a265' }}>## Procedure</span></CodeLine>
              <CodeLine n="12">1. Discover files; preserve path and repository provenance.</CodeLine>
              <CodeLine n="13">2. Parse frontmatter and validate required fields.</CodeLine>
              <CodeLine n="14">3. Group by family; flag duplicate names and missing owners.</CodeLine>
              <CodeLine n="15">4. Emit an index with evidence status attached to every entry.</CodeLine>
              <CodeLine n="16">&nbsp;</CodeLine>
              <CodeLine n="17"><span style={{ color: '#e0a265' }}>## Constraints</span></CodeLine>
              <CodeLine n="18"><span style={{ color: '#8fb5a3' }}>- </span>Never infer maturity from naming alone.</CodeLine>
              <CodeLine n="19"><span style={{ color: '#8fb5a3' }}>- </span>Do not publish a skill without a source path.</CodeLine>
              <CodeLine n="20"><span style={{ color: '#8fb5a3' }}>- </span>Mark local-only checks as <span style={{ color: '#d9ad73' }}>needs-live-evidence</span>.</CodeLine>
              <CodeLine n="21">&nbsp;</CodeLine>
              <CodeLine n="22"><span style={{ color: '#e0a265' }}>## Expected output</span></CodeLine>
              <CodeLine n="23">A deterministic catalog entry for each valid contract.</CodeLine>
            </div>
            <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: border, background: '#241f1c' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: muted }}>contract hash · sha256: 4f9a…b82d</span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: '#9db39d' }}><Check size={12} /> syntax valid</span>
            </div>
          </section>

          <aside className="min-w-0">
            <Card className="rounded-none border-[#3d3530] bg-[#211c19] p-0 text-[#ede7de] shadow-none">
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: border }}>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Related skills</span>
                <Layers3 size={14} style={{ color: muted }} />
              </div>
              <div>
                {relatedSkills.map((skill, index) => (
                  <button
                    type="button"
                    key={skill.name}
                    className="group block w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#2c2521]"
                    style={{ borderColor: border }}
                    onClick={() => setActiveNav('Catalog')}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] leading-4" style={{ color: '#e2d6ca' }}>{skill.name}</span>
                      <ArrowUpRight size={13} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: amber }} />
                    </div>
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: index === 2 ? '#c98867' : '#9caa92' }}>{skill.status}</div>
                    <p className="text-[11px] leading-4" style={{ color: muted }}>{skill.note}</p>
                  </button>
                ))}
              </div>
              <button type="button" className="flex w-full items-center gap-2 border-t px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] hover:text-[#ede7de]" style={{ borderColor: border, color: '#a98e76' }} onClick={() => setActiveNav('Families')}>
                View universal family <ChevronRight size={12} />
              </button>
            </Card>
            <div className="mt-4 border px-4 py-4" style={{ borderColor: border, background: '#241f1c' }}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: orange }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: muted }}>Provenance</span>
              </div>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between gap-3"><span style={{ color: muted }}>owner</span><span style={{ color: '#c7b8aa' }}>overkill-hill</span></div>
                <div className="flex justify-between gap-3"><span style={{ color: muted }}>source</span><span style={{ color: '#c7b8aa' }}>main / universal</span></div>
                <div className="flex justify-between gap-3"><span style={{ color: muted }}>reviewed</span><span style={{ color: '#c7b8aa' }}>2024-06-14</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
