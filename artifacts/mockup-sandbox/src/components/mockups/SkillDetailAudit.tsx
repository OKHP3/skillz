import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileCheck2,
  Github,
  Hash,
  History,
  LockKeyhole,
  MessageSquare,
  PackagePlus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

const ink = '#eee7dc';
const soft = '#c8bbae';
const muted = '#8d8073';
const line = '#443a33';
const panel = '#211c19';
const canvas = '#2a2320';
const amber = '#e6a03c';
const orange = '#c46a2c';
const green = '#9fb69d';
const red = '#c98268';

type AuditKind = 'source' | 'check' | 'review' | 'gate';

const auditRows: Array<{
  id: string;
  kind: AuditKind;
  title: string;
  summary: string;
  actor: string;
  timestamp: string;
  status: 'verified' | 'attention' | 'pending';
  evidence: string;
}> = [
  {
    id: 'source',
    kind: 'source',
    title: 'Source contract pinned',
    summary: 'SKILL.md resolved from canonical repository path.',
    actor: 'repository',
    timestamp: '09:41:08 UTC',
    status: 'verified',
    evidence: 'sha256: 4f9a…b82d',
  },
  {
    id: 'syntax',
    kind: 'check',
    title: 'Contract syntax check',
    summary: 'Frontmatter, headings, and required fields are valid.',
    actor: 'forge-check / local',
    timestamp: '09:41:11 UTC',
    status: 'verified',
    evidence: '14 assertions passed',
  },
  {
    id: 'provenance',
    kind: 'check',
    title: 'Provenance completeness',
    summary: 'Owner, family, source path, and revision are attached.',
    actor: 'forge-check / local',
    timestamp: '09:41:12 UTC',
    status: 'verified',
    evidence: '4 / 4 fields present',
  },
  {
    id: 'review',
    kind: 'review',
    title: 'Human review requested',
    summary: 'One reviewer has acknowledged the contract boundary.',
    actor: 'Mara Reyes',
    timestamp: '09:42:04 UTC',
    status: 'attention',
    evidence: '1 of 2 reviewers',
  },
  {
    id: 'live',
    kind: 'gate',
    title: 'Live evidence gate',
    summary: 'Production invocation evidence has not been attached.',
    actor: 'release policy',
    timestamp: 'waiting',
    status: 'pending',
    evidence: 'required before publish',
  },
];

const kindLabel: Record<AuditKind, string> = {
  source: 'source',
  check: 'check',
  review: 'review',
  gate: 'release gate',
};

function StatusMark({ status }: { status: 'verified' | 'attention' | 'pending' }) {
  if (status === 'verified') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: '#607661', color: green, background: '#263329' }}>
        <Check size={13} strokeWidth={2.5} />
      </span>
    );
  }
  if (status === 'attention') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: '#806044', color: amber, background: '#382c21' }}>
        <CircleDashed size={13} />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: '#795047', color: red, background: '#362521' }}>
      <LockKeyhole size={12} />
    </span>
  );
}

function KindIcon({ kind }: { kind: AuditKind }) {
  const props = { size: 14 };
  if (kind === 'source') return <FileCheck2 {...props} />;
  if (kind === 'check') return <ClipboardCheck {...props} />;
  if (kind === 'review') return <Users {...props} />;
  return <LockKeyhole {...props} />;
}

function CodeLine({ number, children, highlight }: { number: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div className="flex min-h-[22px] font-mono text-[10px] leading-[22px]" style={{ background: highlight ? '#302820' : 'transparent' }}>
      <span className="w-9 shrink-0 select-none pr-2 text-right" style={{ color: '#65594e' }}>{number}</span>
      <span style={{ color: highlight ? '#dbb17a' : '#c8bbae' }}>{children}</span>
    </div>
  );
}

export function SkillDetailAudit() {
  const [activeNav, setActiveNav] = useState('Evidence');
  const [copied, setCopied] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [filter, setFilter] = useState<'all' | AuditKind>('all');
  const [selected, setSelected] = useState('live');
  const [reviewRequested, setReviewRequested] = useState(false);
  const [liveEvidence, setLiveEvidence] = useState(false);

  const visibleRows = filter === 'all' ? auditRows : auditRows.filter((row) => row.kind === filter);
  function copySkillUrl() {
    setCopied(true);
    if (navigator?.clipboard) void navigator.clipboard.writeText('https://forge.okhp3.dev/skills/okhp3-skill-cataloger');
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden" style={{ background: canvas, color: ink, fontFamily: "'DM Sans', sans-serif" }}>
      <nav className="flex min-h-[56px] items-center border-b px-5 sm:px-7" style={{ borderColor: line, background: '#211c19' }}>
        <div className="flex shrink-0 items-center gap-3 pr-5 sm:pr-9">
          <div className="flex h-7 w-7 items-center justify-center rounded-[3px] text-[13px] font-black" style={{ background: orange, color: '#211c19' }}>P³</div>
          <div className="hidden leading-none sm:block">
            <div className="font-mono text-[11px] font-bold tracking-[0.12em]">SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: muted }}>OverKill Hill / governed library</div>
          </div>
        </div>
        <div className="flex h-full items-center gap-0.5 overflow-x-auto">
          {['Catalog', 'Families', 'Evidence', 'Changelog'].map((item) => (
            <button key={item} type="button" onClick={() => setActiveNav(item)} className="relative h-[56px] shrink-0 px-2.5 font-mono text-[9px] uppercase tracking-[0.11em] transition-colors sm:px-4 sm:text-[10px]" style={{ color: activeNav === item ? ink : muted }}>
              {item}
              {activeNav === item && <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px]" style={{ background: orange }} />}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: line, color: muted }}>
            <Hash size={12} />
            <span className="font-mono text-[10px]">146 skills / 16 families</span>
          </div>
          <button type="button" className="flex h-8 items-center gap-1.5 border px-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors hover:bg-[#302823]" style={{ borderColor: '#51463d', color: soft }}>
            <Search size={13} /> Search
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#68574a', color: amber }}>MR</div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1320px] px-4 pb-14 pt-5 sm:px-7">
        <div className="mb-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] sm:text-[10px]" style={{ color: muted }}>
          <ArrowLeft size={12} />
          <button type="button" onClick={() => setActiveNav('Catalog')} className="hover:text-[#ede7de]">Catalog</button>
          <ChevronRight size={11} />
          <span>Universal</span>
          <ChevronRight size={11} />
          <span style={{ color: soft }}>Evidence ledger</span>
        </div>

        <header className="border-y py-5" style={{ borderColor: line }}>
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em]" style={{ borderColor: '#6c492f', background: '#3a281f', color: '#e2a064' }}>Evidence-led detail</span>
                <span className="font-mono text-[10px]" style={{ color: muted }}>SKILL-014 / canonical / v0.8.3</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <h1 className="text-[30px] font-normal leading-none tracking-[-0.03em] sm:text-[38px]" style={{ fontFamily: "'Alfa Slab One', serif", color: '#f3ede5' }}>okhp3-skill-cataloger</h1>
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: amber }}>audit in progress</span>
              </div>
              <p className="mt-3 max-w-[700px] text-[13px]" style={{ color: '#b3a698' }}>Maintain a trustworthy, searchable index of portable agent skill contracts.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={copySkillUrl} className="flex h-9 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors hover:bg-[#332a25]" style={{ borderColor: '#665448', color: '#d5c8bc' }}>
                {copied ? <Check size={14} style={{ color: green }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy URL'}
              </button>
              <button type="button" onClick={() => window.open('https://github.com/overkillhill/skills/tree/main/universal/okhp3-skill-cataloger', '_blank', 'noopener,noreferrer')} className="flex h-9 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors hover:bg-[#332a25]" style={{ borderColor: '#665448', color: '#d5c8bc' }}>
                <Github size={14} /> GitHub <ExternalLink size={11} />
              </button>
              <button type="button" onClick={() => setStacked((value) => !value)} className="flex h-9 items-center gap-2 border px-3 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors hover:brightness-110" style={{ borderColor: '#d27835', background: stacked ? amber : orange, color: '#211c19' }}>
                {stacked ? <Check size={14} /> : <PackagePlus size={14} />}
                {stacked ? 'In your stack' : 'Add to stack'}
              </button>
            </div>
          </div>
        </header>

        <section className="mt-4 border" style={{ borderColor: '#735133', background: '#352920' }}>
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:px-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm" style={{ background: '#5b3a26', color: amber }}><ShieldCheck size={17} /></div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: amber }}><span>Release posture</span><span style={{ color: '#7e5940' }}>·</span><span style={{ color: '#ae9078' }}>ledger-first view</span></div>
              <p className="text-[14px] leading-6" style={{ color: '#eadfd3' }}>The contract is complete and locally verified. <strong style={{ color: amber }}>One release gate remains open:</strong> attach live invocation evidence and complete the second reviewer sign-off.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 border px-3 py-2 sm:ml-auto" style={{ borderColor: '#6f4d35', color: '#d8b68e' }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: amber }} /><span className="font-mono text-[9px] uppercase tracking-[0.1em]">supervised use</span></div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 border sm:grid-cols-4" style={{ borderColor: line, background: '#241f1c' }}>
          {[
            { label: 'Evidence events', value: '04 / 05', note: 'one pending', color: amber, icon: <ClipboardCheck size={14} /> },
            { label: 'Reviewers', value: '01 / 02', note: 'second requested', color: amber, icon: <UserCheck size={14} /> },
            { label: 'Provenance', value: '4 / 4', note: 'fields attached', color: green, icon: <History size={14} /> },
            { label: 'Release gate', value: liveEvidence ? 'ready' : 'blocked', note: liveEvidence ? 're-check required' : 'live evidence', color: liveEvidence ? green : red, icon: <LockKeyhole size={14} /> },
          ].map((item, index) => (
            <div key={item.label} className="flex min-w-0 items-center gap-3 border-b px-3 py-3 sm:border-b-0 sm:px-4" style={{ borderColor: line, borderRight: index < 3 ? `1px solid ${line}` : undefined }}>
              <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-sm sm:flex" style={{ color: item.color, background: '#332b27' }}>{item.icon}</span>
              <div className="min-w-0"><div className="font-mono text-[8px] uppercase tracking-[0.12em]" style={{ color: muted }}>{item.label}</div><div className="mt-0.5 truncate font-mono text-[12px]" style={{ color: item.color }}>{item.value}</div><div className="font-mono text-[8px]" style={{ color: muted }}>{item.note}</div></div>
            </div>
          ))}
        </section>

        <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.72fr)]">
          <div className="min-w-0">
            <section className="border" style={{ borderColor: line, background: panel }}>
              <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: line }}>
                <div><div className="flex items-center gap-2"><ClipboardCheck size={15} style={{ color: amber }} /><span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Audit ledger</span><span className="font-mono text-[9px]" style={{ color: muted }}>· append-only evidence</span></div><p className="mt-1 pl-6 text-[11px]" style={{ color: muted }}>Every assertion carries a source, actor, and decision.</p></div>
                <div className="flex gap-1 overflow-x-auto">
                  {(['all', 'source', 'check', 'review', 'gate'] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setFilter(item)} className="shrink-0 border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors" style={{ borderColor: filter === item ? '#84603f' : line, background: filter === item ? '#3b2a20' : 'transparent', color: filter === item ? amber : muted }}>{item === 'all' ? 'all events' : kindLabel[item]}</button>
                  ))}
                </div>
              </div>
              <div>
                {visibleRows.map((row, index) => (
                  <div key={row.id} className="border-b last:border-b-0" style={{ borderColor: line, background: selected === row.id ? '#2c2520' : 'transparent' }}>
                    <button type="button" onClick={() => setSelected(row.id)} className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-[#302823] sm:gap-4 sm:px-5">
                      <span className="mt-0.5 hidden w-5 shrink-0 font-mono text-[10px] sm:block" style={{ color: '#675b50' }}>{String(index + 1).padStart(2, '0')}</span>
                      <StatusMark status={row.status} />
                      <span className="mt-0.5 shrink-0" style={{ color: row.status === 'pending' ? red : row.status === 'attention' ? amber : green }}><KindIcon kind={row.kind} /></span>
                      <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="font-mono text-[11px]" style={{ color: ink }}>{row.title}</span><span className="border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ borderColor: row.status === 'pending' ? '#734d43' : '#536451', color: row.status === 'pending' ? red : row.status === 'attention' ? amber : green }}>{row.status}</span></span><span className="mt-1 block text-[11px] leading-4" style={{ color: muted }}>{row.summary}</span></span>
                      <span className="hidden shrink-0 text-right sm:block"><span className="block font-mono text-[9px]" style={{ color: soft }}>{row.evidence}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.08em]" style={{ color: muted }}>{row.timestamp}</span></span>
                      <ChevronDown size={14} className="mt-1 shrink-0 transition-transform" style={{ color: muted, transform: selected === row.id ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>
                    {selected === row.id && (
                      <div className="border-t px-12 pb-4 pt-3 sm:pl-[88px]" style={{ borderColor: '#3b3028', background: '#27211e' }}>
                        <div className="grid gap-3 text-[11px] sm:grid-cols-[1fr_180px]"><div><div className="mb-1 font-mono text-[8px] uppercase tracking-[0.13em]" style={{ color: amber }}>Evidence detail</div><p style={{ color: soft }}>{row.id === 'live' ? 'No production run has been linked to this revision. Add a trace, invocation ID, or signed output before the release policy can pass.' : row.id === 'review' ? 'Reviewer acknowledgement covers contract shape and constraints. A second independent reviewer is still required.' : 'The check resolved against the canonical source revision and left an immutable event in the ledger.'}</p></div><div className="font-mono text-[9px] leading-5" style={{ color: muted }}><div><span style={{ color: '#6c5d50' }}>actor / </span>{row.actor}</div><div><span style={{ color: '#6c5d50' }}>recorded / </span>{row.timestamp}</div><div><span style={{ color: '#6c5d50' }}>evidence / </span>{row.evidence}</div></div></div>
                        {row.id === 'live' && <button type="button" onClick={() => { setLiveEvidence(true); setSelected('live'); }} className="mt-3 flex items-center gap-2 border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[#3b2b21]" style={{ borderColor: '#825733', color: amber }}><FileCheck2 size={13} /> {liveEvidence ? 'Live evidence attached' : 'Attach live evidence'}</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3 sm:px-5" style={{ borderColor: line, background: '#241f1c' }}><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.11em]" style={{ color: muted }}><History size={12} /> ledger head · 2024-06-14 / 09:42:04</span><span className="font-mono text-[9px]" style={{ color: '#9db39d' }}>append-only / verified</span></div>
            </section>

            <section className="mt-5 border" style={{ borderColor: line, background: panel }}>
              <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5" style={{ borderColor: line }}><div className="flex items-center gap-2"><Users size={15} style={{ color: amber }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Reviewer chain</span></div><span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: muted }}>1 / 2 acknowledged</span></div>
              <div className="grid gap-0 sm:grid-cols-2">
                <div className="flex items-center gap-3 border-b px-4 py-4 sm:border-b-0 sm:border-r sm:px-5" style={{ borderColor: line }}><div className="flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#6f815f', background: '#2b362c', color: green }}>MR</div><div className="min-w-0"><div className="font-mono text-[11px]" style={{ color: ink }}>Mara Reyes</div><div className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: green }}>contract owner · acknowledged</div></div><Check size={14} className="ml-auto shrink-0" style={{ color: green }} /></div>
                <div className="flex items-center gap-3 px-4 py-4 sm:px-5"><div className="flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold" style={{ borderColor: '#665448', background: '#302824', color: muted }}>?</div><div className="min-w-0"><div className="font-mono text-[11px]" style={{ color: soft }}>Release reviewer</div><div className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: reviewRequested ? amber : muted }}>{reviewRequested ? 'request sent · awaiting claim' : 'not assigned'}</div></div><button type="button" onClick={() => setReviewRequested(true)} className="ml-auto shrink-0 border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] hover:bg-[#382b22]" style={{ borderColor: '#725238', color: amber }}>{reviewRequested ? 'sent' : 'request'}</button></div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <section className="border" style={{ borderColor: line, background: '#241f1c' }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: line }}><div className="flex items-center gap-2"><History size={14} style={{ color: amber }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Provenance chain</span></div><span className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: green }}>complete</span></div>
              <div className="p-4">
                <div className="relative ml-1 space-y-5 border-l pl-5" style={{ borderColor: '#68513c' }}>
                  {[
                    ['owner', 'overkill-hill / platform', 'verified'],
                    ['source', 'main / universal / SKILL.md', 'pinned'],
                    ['revision', '4f9a…b82d / v0.8.3', 'immutable'],
                    ['reviewed', '2024-06-14 / Mara Reyes', 'acknowledged'],
                  ].map(([label, value, state]) => <div key={label} className="relative"><span className="absolute -left-[25px] top-1 h-2 w-2 rounded-full border" style={{ borderColor: amber, background: '#241f1c' }} /><div className="font-mono text-[8px] uppercase tracking-[0.13em]" style={{ color: muted }}>{label}</div><div className="mt-1 font-mono text-[10px]" style={{ color: soft }}>{value}</div><div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.08em]" style={{ color: green }}>{state}</div></div>)}
                </div>
                <button type="button" onClick={() => setSelected('source')} className="mt-5 flex w-full items-center justify-between border-t pt-3 font-mono text-[9px] uppercase tracking-[0.1em] hover:text-[#ede7de]" style={{ borderColor: line, color: '#a98e76' }}>View source event <ArrowUpRight size={13} /></button>
              </div>
            </section>

            <section className="border" style={{ borderColor: line, background: panel }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: line }}><div className="flex items-center gap-2"><BookOpen size={14} style={{ color: amber }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: '#d9cfc4' }}>Contract / SKILL.md</span></div><span className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: muted }}>secondary pane</span></div>
              <div className="overflow-hidden py-4">
                <CodeLine number="01"><span style={{ color: '#e0a265' }}>#</span> okhp3-skill-cataloger</CodeLine>
                <CodeLine number="02">&nbsp;</CodeLine>
                <CodeLine number="03"><span style={{ color: '#e0a265' }}>## Purpose</span></CodeLine>
                <CodeLine number="04">Maintain a canonical inventory of portable skills.</CodeLine>
                <CodeLine number="05">Preserve source provenance and contract boundaries.</CodeLine>
                <CodeLine number="06">&nbsp;</CodeLine>
                <CodeLine number="07"><span style={{ color: '#e0a265' }}>## Procedure</span></CodeLine>
                <CodeLine number="08"><span style={{ color: '#8fb5a3' }}>1.</span> Discover files; preserve repository path.</CodeLine>
                <CodeLine number="09"><span style={{ color: '#8fb5a3' }}>2.</span> Parse frontmatter and required fields.</CodeLine>
                <CodeLine number="10" highlight><span style={{ color: '#8fb5a3' }}>3.</span> Attach evidence status to every entry.</CodeLine>
                <CodeLine number="11">&nbsp;</CodeLine>
                <CodeLine number="12"><span style={{ color: '#e0a265' }}>## Constraints</span></CodeLine>
                <CodeLine number="13"><span style={{ color: '#8fb5a3' }}>- </span>Never infer maturity from naming alone.</CodeLine>
                <CodeLine number="14"><span style={{ color: '#8fb5a3' }}>- </span>Mark local checks as <span style={{ color: '#d9ad73' }}>needs-live-evidence</span>.</CodeLine>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: line, background: '#241f1c' }}><span className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: muted }}>23 lines / read-only</span><span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: green }}><Check size={11} /> syntax valid</span></div>
            </section>

            <section className="border" style={{ borderColor: '#735133', background: '#30251f' }}>
              <div className="border-b px-4 py-3" style={{ borderColor: '#604531' }}><div className="flex items-center gap-2"><LockKeyhole size={14} style={{ color: amber }} /><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: amber }}>Release gates</span></div><p className="mt-1 text-[11px]" style={{ color: '#b9a391' }}>Publish only when every gate has a record.</p></div>
              <div className="p-4">
                <div className="space-y-3">
                  {([
                    ['contract hash', true, 'verified'],
                    ['owner sign-off', true, 'verified'],
                    ['second reviewer', reviewRequested, reviewRequested ? 'requested' : 'missing'],
                    ['live invocation', liveEvidence, liveEvidence ? 'attached' : 'missing'],
                  ] as Array<[string, boolean, string]>).map(([label, done, state]) => <div key={label} className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center border" style={{ borderColor: done ? '#607661' : '#795047', color: done ? green : red, background: done ? '#263329' : '#362521' }}>{done ? <Check size={11} /> : <XCircle size={11} />}</span><span className="flex-1 font-mono text-[10px]" style={{ color: soft }}>{label}</span><span className="font-mono text-[8px] uppercase tracking-[0.08em]" style={{ color: done ? green : red }}>{state}</span></div>)}
                </div>
                <button type="button" onClick={() => setSelected('live')} className="mt-4 flex w-full items-center justify-center gap-2 border px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors hover:bg-[#432e22]" style={{ borderColor: '#986237', color: amber }}>Inspect blocked gate <ChevronRight size={13} /></button>
              </div>
            </section>

            <div className="flex items-start gap-3 border px-4 py-3" style={{ borderColor: line, background: '#241f1c' }}><MessageSquare size={14} className="mt-0.5 shrink-0" style={{ color: muted }} /><p className="text-[11px] leading-4" style={{ color: muted }}>Need context? The audit ledger is the canonical readout for this skill’s trust posture.</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}