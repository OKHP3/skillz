import { useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Circle,
  Command,
  Copy,
  Filter,
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

type Maturity = "Ready" | "Validated" | "Experimental" | "Draft";

type Skill = {
  name: string;
  family: string;
  description: string;
  maturity: Maturity;
  runs: string;
  version: string;
  tags: string[];
};

const familyMeta = [
  { key: "all", label: "All contracts", count: 146, tint: "#e6a03c" },
  { key: "universal", label: "Universal", count: 18, tint: "#d9a353" },
  { key: "process-capture", label: "Process capture", count: 9, tint: "#81b7a5" },
  { key: "social-posting", label: "Social posting", count: 12, tint: "#d07a50" },
  { key: "knowledge-operations", label: "Knowledge ops", count: 11, tint: "#7ca7bf" },
  { key: "context-extraction", label: "Context extraction", count: 8, tint: "#c6a86a" },
  { key: "agent-foundry", label: "Agent foundry", count: 14, tint: "#ca755b" },
  { key: "community", label: "Community", count: 10, tint: "#8eb4a7" },
];

const skills: Skill[] = [
  { name: "okhp3-skill-cataloger", family: "universal", description: "Index, classify, and expose governed SKILL.md contracts.", maturity: "Validated", runs: "2.4k", version: "v2.3", tags: ["catalog", "governance"] },
  { name: "okhp3-brief-to-action", family: "universal", description: "Turn an ambiguous brief into a sequenced, executable plan.", maturity: "Ready", runs: "1.8k", version: "v1.8", tags: ["planning", "triage"] },
  { name: "capture-the-work", family: "process-capture", description: "Observe a workflow and write the repeatable parts down.", maturity: "Validated", runs: "684", version: "v1.4", tags: ["workflow", "SOP"] },
  { name: "fieldnote-to-process", family: "process-capture", description: "Convert messy field notes into a clean operating procedure.", maturity: "Ready", runs: "412", version: "v0.9", tags: ["notes", "process"] },
  { name: "social-posting-kit", family: "social-posting", description: "Draft a channel-native post from one source of truth.", maturity: "Ready", runs: "1.2k", version: "v2.1", tags: ["social", "repurpose"] },
  { name: "reply-with-context", family: "social-posting", description: "Write thoughtful replies without losing the thread or voice.", maturity: "Experimental", runs: "302", version: "v0.7", tags: ["replies", "voice"] },
  { name: "knowledge-librarian", family: "knowledge-operations", description: "Maintain a living library with owners, links, and next actions.", maturity: "Validated", runs: "943", version: "v1.7", tags: ["library", "ops"] },
  { name: "decision-record", family: "knowledge-operations", description: "Capture what changed, why it changed, and what follows.", maturity: "Ready", runs: "521", version: "v1.2", tags: ["decisions", "memory"] },
  { name: "extract-the-context", family: "context-extraction", description: "Pull durable context from a conversation, file, or handoff.", maturity: "Validated", runs: "1.1k", version: "v1.9", tags: ["context", "handoff"] },
  { name: "context-gap-audit", family: "context-extraction", description: "Spot the missing facts that make a request unsafe to execute.", maturity: "Ready", runs: "286", version: "v1.0", tags: ["audit", "safety"] },
  { name: "agent-blueprint", family: "agent-foundry", description: "Shape a reliable agent from capability, limits, and tests.", maturity: "Validated", runs: "876", version: "v2.0", tags: ["agents", "design"] },
  { name: "skill-contract-checker", family: "agent-foundry", description: "Check a SKILL.md for inputs, exits, failure paths, and drift.", maturity: "Validated", runs: "1.6k", version: "v2.2", tags: ["quality", "contracts"] },
  { name: "community-roundup", family: "community", description: "Turn a week of community signals into a useful digest.", maturity: "Ready", runs: "458", version: "v1.1", tags: ["community", "digest"] },
];

const maturityStyles: Record<Maturity, { color: string; bg: string; border: string }> = {
  Ready: { color: "#e6a03c", bg: "rgba(230,160,60,.12)", border: "rgba(230,160,60,.34)" },
  Validated: { color: "#83c1b0", bg: "rgba(28,105,88,.28)", border: "rgba(93,178,154,.34)" },
  Experimental: { color: "#d39a83", bg: "rgba(154,74,54,.21)", border: "rgba(201,116,87,.32)" },
  Draft: { color: "#a79b8d", bg: "rgba(121,112,101,.16)", border: "rgba(167,155,141,.24)" },
};

function familyName(key: string) {
  return familyMeta.find((family) => family.key === key)?.label ?? key;
}

export function ExploreD() {
  const [query, setQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState("all");
  const [activeMaturity, setActiveMaturity] = useState<Maturity | "all">("all");
  const [sortByName, setSortByName] = useState(false);
  const [selectedName, setSelectedName] = useState("okhp3-skill-cataloger");
  const [stack, setStack] = useState<string[]>(["okhp3-skill-cataloger"]);
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleSkills = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return [...skills]
      .filter((skill) => {
        const matchesFamily = activeFamily === "all" || skill.family === activeFamily;
        const matchesMaturity = activeMaturity === "all" || skill.maturity === activeMaturity;
        const matchesQuery =
          !normalized ||
          [skill.name, skill.family, skill.description, ...skill.tags].some((value) =>
            value.toLowerCase().includes(normalized),
          );
        return matchesFamily && matchesMaturity && matchesQuery;
      })
      .sort((a, b) => (sortByName ? a.name.localeCompare(b.name) : 0));
  }, [activeFamily, activeMaturity, query, sortByName]);

  const selected = visibleSkills.find((skill) => skill.name === selectedName) ?? skills.find((skill) => skill.name === selectedName) ?? skills[0];
  const selectedFamily = familyMeta.find((family) => family.key === selected.family);
  const selectedMaturity = maturityStyles[selected.maturity];
  const isInStack = stack.includes(selected.name);

  function copyReference() {
    setCopied(true);
    if (navigator.clipboard) void navigator.clipboard.writeText(`forge://skills/${selected.name}`);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function toggleStack() {
    setStack((current) => (current.includes(selected.name) ? current.filter((name) => name !== selected.name) : [...current, selected.name]));
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden" style={{ background: "#211b18", color: "#ede7de", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.028]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E\")" }} />

      <header className="flex min-h-[62px] items-center justify-between border-b px-5 sm:px-8" style={{ borderColor: "#403630", background: "#181411" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center border" style={{ borderColor: "#c46a2c", color: "#e6a03c" }}><Terminal size={16} /></div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-[.17em] text-[#f6f2ee]">SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] tracking-[.16em] text-[#776b5e]">OVERKILL HILL P³ / REGISTRY</div>
          </div>
          <div className="hidden h-5 w-px bg-[#403630] sm:block" />
          <span className="hidden font-mono text-[10px] uppercase tracking-[.13em] text-[#9b8d7d] sm:block">Explore / workbench</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-[10px] text-[#819f8e] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#7fbe9e]" /> registry synced</div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#513426] font-mono text-[10px] text-[#e6a03c]">OH</div>
        </div>
      </header>

      <div className="mx-auto max-w-[1420px] px-4 pb-10 sm:px-7">
        <section className="border-b py-7 sm:py-9" style={{ borderColor: "#403630" }}>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.22em] text-[#c46a2c]"><span className="h-px w-7 bg-[#c46a2c]" /> 02 / inspect the index</div>
              <h1 className="text-[clamp(34px,4.4vw,62px)] leading-[.93] tracking-[-.045em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>Choose by signal,<br /><span className="text-[#c46a2c]">not by shelf.</span></h1>
              <p className="mt-4 max-w-[580px] text-[13px] leading-6 text-[#a99b8b]">A working view of the forge. Filter the contract set, then keep the one you trust in your stack.</p>
            </div>
            <div className="flex shrink-0 items-end gap-7 border-l pl-5" style={{ borderColor: "#5a4638" }}>
              <div><div className="font-mono text-[27px] leading-none text-[#e6a03c]">146</div><div className="mt-2 text-[9px] uppercase tracking-[.17em] text-[#776b5e]">contracts indexed</div></div>
              <div><div className="font-mono text-[27px] leading-none text-[#f0e8dc]">{stack.length}</div><div className="mt-2 text-[9px] uppercase tracking-[.17em] text-[#776b5e]">in your stack</div></div>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-10 border-b py-4" style={{ borderColor: "#403630", background: "rgba(33,27,24,.96)" }}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c46a2c]" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, family, or job to be done…" className="h-11 w-full border bg-[#191512] pl-11 pr-24 text-[12px] text-[#f6f2ee] outline-none placeholder:text-[#6f6256] focus:border-[#c46a2c]" style={{ borderColor: query ? "#c46a2c" : "#514239" }} />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2"><kbd className="hidden border px-1.5 py-1 font-mono text-[9px] text-[#8a7e6e] sm:block" style={{ borderColor: "#403630" }}>⌘ K</kbd>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="text-[#8a7e6e] hover:text-[#f6f2ee]"><X size={14} /></button>}</div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {familyMeta.slice(0, 6).map((family) => (
                <button key={family.key} type="button" onClick={() => setActiveFamily(family.key)} className="flex shrink-0 items-center gap-1.5 border px-2.5 py-2 text-[10px] transition-colors" style={{ borderColor: activeFamily === family.key ? family.tint : "#403630", color: activeFamily === family.key ? "#f6f2ee" : "#927f6e", background: activeFamily === family.key ? `${family.tint}18` : "transparent" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: family.tint }} />{family.label}</button>
              ))}
              <button type="button" onClick={() => setShowFilters((value) => !value)} className="flex shrink-0 items-center gap-1.5 border px-2.5 py-2 text-[10px] text-[#c6b5a4] hover:border-[#c46a2c]" style={{ borderColor: showFilters ? "#c46a2c" : "#403630" }}><SlidersHorizontal size={12} /> filters</button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "#403630" }}>
              <Filter size={12} className="mr-1 text-[#c46a2c]" />
              <span className="mr-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#776b5e]">maturity</span>
              {(["all", "Ready", "Validated", "Experimental"] as const).map((maturity) => <button key={maturity} type="button" onClick={() => setActiveMaturity(maturity)} className="border px-2.5 py-1.5 text-[10px]" style={{ borderColor: activeMaturity === maturity ? "#c46a2c" : "#403630", color: activeMaturity === maturity ? "#e6a03c" : "#9b8d7d" }}>{maturity === "all" ? "Any stage" : maturity}</button>)}
              <button type="button" onClick={() => { setActiveFamily("all"); setActiveMaturity("all"); setQuery(""); }} className="ml-auto text-[10px] text-[#8a7e6e] hover:text-[#f6f2ee]">Reset all</button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 border" style={{ borderColor: "#403630", background: "#191512" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "#403630" }}>
              <div className="flex items-center gap-2"><Layers3 size={14} className="text-[#c46a2c]" /><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#c6b5a4]">Live contract set</span><span className="font-mono text-[10px] text-[#776b5e]">· {visibleSkills.length} showing</span></div>
              <button type="button" onClick={() => setSortByName((value) => !value)} className="flex items-center gap-1.5 text-[10px] text-[#9b8d7d] hover:text-[#e6a03c]">{sortByName ? <ArrowDownAZ size={12} /> : <Command size={12} />}{sortByName ? "A–Z" : "Relevance"}</button>
            </div>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_90px_90px_24px] gap-3 border-b px-4 py-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#66594f] sm:grid" style={{ borderColor: "#403630" }}><span>contract</span><span>family</span><span>maturity</span><span>runs</span><span /></div>
            <div>
              {visibleSkills.map((skill, index) => {
                const maturity = maturityStyles[skill.maturity];
                const family = familyMeta.find((item) => item.key === skill.family);
                const active = selected.name === skill.name;
                return (
                  <button key={skill.name} type="button" onClick={() => setSelectedName(skill.name)} className="group grid w-full grid-cols-[minmax(0,1fr)_24px] gap-3 border-b px-4 py-4 text-left transition-colors hover:bg-[#241d19] sm:grid-cols-[minmax(0,1.4fr)_140px_90px_90px_24px] sm:items-center" style={{ borderColor: "#342c27", background: active ? "rgba(196,106,44,.09)" : "transparent", boxShadow: active ? "inset 3px 0 #c46a2c" : "none" }}>
                    <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[11px] font-semibold text-[#f3ede5]">{skill.name}</span>{index < 2 && <Sparkles size={11} className="shrink-0 text-[#e6a03c]" />}</div><div className="mt-1 truncate text-[11px] text-[#87796c]">{skill.description}</div><div className="mt-2 flex gap-1.5 sm:hidden"><span className="text-[9px]" style={{ color: family?.tint }}>{family?.label}</span><span className="text-[9px]" style={{ color: maturity.color }}>· {skill.maturity}</span></div></div>
                    <span className="hidden truncate text-[10px] sm:block" style={{ color: family?.tint }}>{family?.label}</span>
                    <span className="hidden w-fit border px-1.5 py-1 text-[9px] sm:block" style={{ color: maturity.color, borderColor: maturity.border, background: maturity.bg }}>{skill.maturity}</span>
                    <span className="hidden font-mono text-[10px] text-[#88796b] sm:block">{skill.runs}</span>
                    <ArrowUpRight size={14} className="mt-1 text-[#5f5248] transition-colors group-hover:text-[#e6a03c]" />
                  </button>
                );
              })}
              {visibleSkills.length === 0 && <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center"><Circle size={26} className="mb-3 text-[#c46a2c]" /><div className="font-serif text-[18px] text-[#f6f2ee]">No contract on that frequency.</div><p className="mt-2 text-[11px] text-[#8a7e6e]">Clear a filter or try the work you need to do.</p><button type="button" onClick={() => { setQuery(""); setActiveFamily("all"); setActiveMaturity("all"); }} className="mt-4 border border-[#c46a2c] px-3 py-2 text-[10px] uppercase tracking-[.12em] text-[#e6a03c]">Reset view</button></div>}
            </div>
          </section>

          <aside className="self-start border lg:sticky lg:top-[84px]" style={{ borderColor: "#514239", background: "#2a211d" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#514239" }}><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#c6b5a4]"><Terminal size={13} className="text-[#c46a2c]" /> Selection desk</div><span className="font-mono text-[9px] text-[#776b5e]">inspect / 01</span></div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3"><div><div className="mb-2 font-mono text-[9px] uppercase tracking-[.17em]" style={{ color: selectedFamily?.tint }}>{selectedFamily?.label} family</div><h2 className="break-words text-[23px] leading-[1.04] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>{selected.name}</h2></div><span className="border px-2 py-1 font-mono text-[10px]" style={{ color: selectedMaturity.color, borderColor: selectedMaturity.border, background: selectedMaturity.bg }}>{selected.maturity}</span></div>
              <p className="mt-4 text-[12px] leading-5 text-[#b3a698]">{selected.description}</p>
              <div className="mt-5 grid grid-cols-2 border-y" style={{ borderColor: "#514239" }}><div className="border-r py-3 pr-3" style={{ borderColor: "#514239" }}><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#776b5e]">Version</div><div className="mt-1 font-mono text-[12px] text-[#e6a03c]">{selected.version}</div></div><div className="py-3 pl-3"><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#776b5e]">Observed runs</div><div className="mt-1 font-mono text-[12px] text-[#f0e8dc]">{selected.runs}</div></div></div>
              <div className="mt-5"><div className="mb-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#776b5e]">Contract labels</div><div className="flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="border px-2 py-1 font-mono text-[9px] text-[#b7a696]" style={{ borderColor: "#604a3b", background: "#322720" }}>#{tag}</span>)}</div></div>
              <div className="mt-6 flex gap-2"><button type="button" onClick={toggleStack} className="flex flex-1 items-center justify-center gap-2 border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[.1em] transition-colors" style={{ borderColor: isInStack ? "#819f8e" : "#c46a2c", background: isInStack ? "rgba(127,190,158,.12)" : "#c46a2c", color: isInStack ? "#a6d0b7" : "#211b18" }}>{isInStack ? <Check size={13} /> : <Plus size={13} />}{isInStack ? "In your stack" : "Add to stack"}</button><button type="button" onClick={copyReference} aria-label="Copy skill reference" className="flex w-11 items-center justify-center border text-[#b7a696] hover:border-[#c46a2c] hover:text-[#e6a03c]" style={{ borderColor: "#665044" }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div>
              <div className="mt-5 flex items-start gap-2 border-t pt-4 text-[10px] leading-4 text-[#88796b]" style={{ borderColor: "#514239" }}><ArrowLeft size={13} className="mt-0.5 shrink-0 text-[#c46a2c]" /> Select another row to compare its contract signal here.</div>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "#514239", background: "#211a17" }}><span className="font-mono text-[9px] uppercase tracking-[.13em] text-[#776b5e]">forge://skills/{selected.name}</span><ChevronDown size={13} className="text-[#88796b]" /></div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ExploreD;