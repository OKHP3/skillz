import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpRight,
  Check,
  ChevronDown,
  Command,
  Filter,
  Grid2X2,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

type Maturity = "Ready" | "Validated" | "Experimental" | "Draft";

type Skill = {
  name: string;
  slug: string;
  family: string;
  description: string;
  maturity: Maturity;
  runs: string;
  version: string;
  tags: string[];
};

const familyMeta = [
  { key: "all", label: "All skills", count: 146, tint: "#e6a03c" },
  { key: "universal", label: "Universal", count: 18, tint: "#d9a353" },
  { key: "process-capture", label: "Process capture", count: 9, tint: "#81b7a5" },
  { key: "social-posting", label: "Social posting", count: 12, tint: "#d07a50" },
  { key: "knowledge-operations", label: "Knowledge ops", count: 11, tint: "#7ca7bf" },
  { key: "context-extraction", label: "Context extraction", count: 8, tint: "#c6a86a" },
  { key: "mermaid", label: "Mermaid", count: 7, tint: "#ba8ab6" },
  { key: "agent-foundry", label: "Agent foundry", count: 14, tint: "#ca755b" },
  { key: "community", label: "Community", count: 10, tint: "#8eb4a7" },
  { key: "abrahamic", label: "Abrahamic", count: 6, tint: "#d3ab69" },
  { key: "notion", label: "Notion", count: 13, tint: "#bcb5aa" },
  { key: "glee-fully", label: "Glee-fully", count: 8, tint: "#e0956e" },
  { key: "askjamie", label: "AskJamie", count: 6, tint: "#9aaad0" },
  { key: "lifetrkr", label: "Lifetrkr", count: 7, tint: "#92ae82" },
  { key: "outcome-modeling", label: "Outcome modeling", count: 7, tint: "#a991c1" },
  { key: "refolddec", label: "Refolddec", count: 6, tint: "#cd8f65" },
  { key: "replit", label: "Replit", count: 4, tint: "#82a9ba" },
];

const skills: Skill[] = [
  { name: "okhp3-skill-cataloger", slug: "okhp3-skill-cataloger", family: "universal", description: "Index, classify, and expose governed SKILL.md contracts.", maturity: "Validated", runs: "2.4k", version: "v2.3", tags: ["catalog", "governance"] },
  { name: "okhp3-brief-to-action", slug: "okhp3-brief-to-action", family: "universal", description: "Turn an ambiguous brief into a sequenced, executable plan.", maturity: "Ready", runs: "1.8k", version: "v1.8", tags: ["planning", "triage"] },
  { name: "capture-the-work", slug: "capture-the-work", family: "process-capture", description: "Observe a workflow and write the repeatable parts down.", maturity: "Validated", runs: "684", version: "v1.4", tags: ["workflow", "SOP"] },
  { name: "fieldnote-to-process", slug: "fieldnote-to-process", family: "process-capture", description: "Convert messy field notes into a clean operating procedure.", maturity: "Ready", runs: "412", version: "v0.9", tags: ["notes", "process"] },
  { name: "social-posting-kit", slug: "social-posting-kit", family: "social-posting", description: "Draft a channel-native post from one source of truth.", maturity: "Ready", runs: "1.2k", version: "v2.1", tags: ["social", "repurpose"] },
  { name: "reply-with-context", slug: "reply-with-context", family: "social-posting", description: "Write thoughtful replies without losing the thread or voice.", maturity: "Experimental", runs: "302", version: "v0.7", tags: ["replies", "voice"] },
  { name: "knowledge-librarian", slug: "knowledge-librarian", family: "knowledge-operations", description: "Maintain a living library with owners, links, and next actions.", maturity: "Validated", runs: "943", version: "v1.7", tags: ["library", "ops"] },
  { name: "decision-record", slug: "decision-record", family: "knowledge-operations", description: "Capture what changed, why it changed, and what follows.", maturity: "Ready", runs: "521", version: "v1.2", tags: ["decisions", "memory"] },
  { name: "extract-the-context", slug: "extract-the-context", family: "context-extraction", description: "Pull durable context from a conversation, file, or handoff.", maturity: "Validated", runs: "1.1k", version: "v1.9", tags: ["context", "handoff"] },
  { name: "context-gap-audit", slug: "context-gap-audit", family: "context-extraction", description: "Spot the missing facts that make a request unsafe to execute.", maturity: "Ready", runs: "286", version: "v1.0", tags: ["audit", "safety"] },
  { name: "mermaid-flow-map", slug: "mermaid-flow-map", family: "mermaid", description: "Render a system or process as a diagram people can scan.", maturity: "Ready", runs: "735", version: "v1.5", tags: ["diagram", "systems"] },
  { name: "agent-blueprint", slug: "agent-blueprint", family: "agent-foundry", description: "Shape a reliable agent from capability, limits, and tests.", maturity: "Validated", runs: "876", version: "v2.0", tags: ["agents", "design"] },
  { name: "skill-contract-checker", slug: "skill-contract-checker", family: "agent-foundry", description: "Check a SKILL.md for inputs, exits, failure paths, and drift.", maturity: "Validated", runs: "1.6k", version: "v2.2", tags: ["quality", "contracts"] },
  { name: "community-roundup", slug: "community-roundup", family: "community", description: "Turn a week of community signals into a useful digest.", maturity: "Ready", runs: "458", version: "v1.1", tags: ["community", "digest"] },
  { name: "scripture-study-guide", slug: "scripture-study-guide", family: "abrahamic", description: "Build a careful study guide with context and open questions.", maturity: "Experimental", runs: "173", version: "v0.8", tags: ["study", "sources"] },
  { name: "notion-space-keeper", slug: "notion-space-keeper", family: "notion", description: "Tidy a Notion space without flattening the way it is used.", maturity: "Ready", runs: "1.0k", version: "v1.6", tags: ["Notion", "cleanup"] },
  { name: "joyful-check-in", slug: "joyful-check-in", family: "glee-fully", description: "Make a tiny ritual out of noticing progress and energy.", maturity: "Draft", runs: "96", version: "v0.4", tags: ["ritual", "reflection"] },
  { name: "askjamie-reframe", slug: "askjamie-reframe", family: "askjamie", description: "Ask the sharper question hiding inside the first question.", maturity: "Ready", runs: "337", version: "v1.3", tags: ["questions", "clarity"] },
  { name: "life-thread-review", slug: "life-thread-review", family: "lifetrkr", description: "Review personal signals and choose one kind next move.", maturity: "Experimental", runs: "214", version: "v0.6", tags: ["review", "life"] },
  { name: "outcome-ladder", slug: "outcome-ladder", family: "outcome-modeling", description: "Connect the work in front of you to an observable outcome.", maturity: "Validated", runs: "602", version: "v1.2", tags: ["outcomes", "metrics"] },
  { name: "refolddec-sensemaker", slug: "refolddec-sensemaker", family: "refolddec", description: "Re-fold a tangled decision until the real trade-off is visible.", maturity: "Ready", runs: "188", version: "v0.9", tags: ["decisions", "sensemaking"] },
  { name: "replit-build-loop", slug: "replit-build-loop", family: "replit", description: "Keep an agentic build loop focused from idea to shipped change.", maturity: "Validated", runs: "744", version: "v1.7", tags: ["build", "Replit"] },
];

const maturityStyles: Record<Maturity, { color: string; bg: string; line: string }> = {
  Ready: { color: "#e6a03c", bg: "rgba(230,160,60,.12)", line: "rgba(230,160,60,.32)" },
  Validated: { color: "#83c1b0", bg: "rgba(28,105,88,.28)", line: "rgba(93,178,154,.34)" },
  Experimental: { color: "#d39a83", bg: "rgba(154,74,54,.21)", line: "rgba(201,116,87,.32)" },
  Draft: { color: "#a79b8d", bg: "rgba(121,112,101,.16)", line: "rgba(167,155,141,.24)" },
};

function familyLabel(key: string) {
  return familyMeta.find((family) => family.key === key)?.label ?? key;
}

/** Sidebar content — shared between desktop aside and mobile drawer */
function SidebarContent({
  activeFamily,
  onFamilyChange,
  onClose,
  onNewSearch,
}: {
  activeFamily: string;
  onFamilyChange: (key: string) => void;
  onClose?: () => void;
  onNewSearch: (q: string) => void;
}) {
  return (
    <>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[.19em] text-[#8a7e6e]">Browse by family</div>
          <div className="mt-1 text-[11px] text-[#675e55]">Signal groups, not folders</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#c46a2c]">16</span>
          {onClose && (
            <button type="button" aria-label="Close filters" onClick={onClose} className="rounded p-1 text-[#8a7e6e] hover:text-[#f6f2ee] md:hidden">
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        {familyMeta.map((family) => {
          const isActive = activeFamily === family.key;
          return (
            <button
              type="button"
              key={family.key}
              onClick={() => { onFamilyChange(family.key); onClose?.(); }}
              className="group flex w-full items-center justify-between rounded-sm px-2 py-[7px] text-left transition-colors"
              style={{
                background: isActive ? "rgba(196,106,44,.15)" : "transparent",
                color: isActive ? "#f6f2ee" : "#a79b8d",
              }}
            >
              <span className="flex min-w-0 items-center gap-2.5 text-[11px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: family.tint, opacity: isActive ? 1 : .65 }} />
                <span className="truncate">{family.label}</span>
              </span>
              <span className="font-mono text-[10px]" style={{ color: isActive ? "#e6a03c" : "#675e55" }}>{family.count}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 border-t pt-4" style={{ borderColor: "#3d3530" }}>
        <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#8a7e6e]">
          <Layers3 size={11} /> Maturity
        </div>
        <div className="space-y-2 text-[10px] text-[#a79b8d]">
          {(Object.keys(maturityStyles) as Maturity[]).map((maturity) => (
            <div className="flex items-center justify-between" key={maturity}>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: maturityStyles[maturity].color }} />{maturity}</span>
              <span className="font-mono text-[#675e55]">{maturity === "Ready" ? "62" : maturity === "Validated" ? "39" : maturity === "Experimental" ? "28" : "17"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 rounded-sm border p-3" style={{ borderColor: "#3d3530", background: "rgba(31,27,24,.75)" }}>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-[#d8cfc4]"><Sparkles size={12} className="text-[#c46a2c]" /> New this week</div>
        <p className="text-[10px] leading-[1.45] text-[#8a7e6e]">7 contracts cleared review and joined the forge.</p>
        <button type="button" onClick={() => { onNewSearch("new"); onClose?.(); }} className="mt-3 text-[10px] font-semibold text-[#e6a03c] hover:text-[#f4bd65]">View arrivals →</button>
      </div>
    </>
  );
}

export function ExploreB() {
  const [query, setQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [selected, setSelected] = useState<Skill | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Lock body scroll and handle Escape key while the mobile drawer is open
  useEffect(() => {
    if (!showMobileSidebar) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMobileSidebar(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showMobileSidebar]);

  const visibleSkills = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const filtered = skills.filter((skill) => {
      const inFamily = activeFamily === "all" || skill.family === activeFamily;
      const inQuery =
        !normalized ||
        [skill.name, skill.family, skill.description, ...skill.tags].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      return inFamily && inQuery;
    });
    return [...filtered].sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : 0,
    );
  }, [activeFamily, query, sortBy]);

  return (
    <div
      className="min-h-[100dvh] w-full overflow-hidden"
      style={{
        background: "#2a2320",
        color: "#ede7de",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="flex h-[52px] items-center justify-between border-b px-4 md:h-[58px] md:px-5"
        style={{ borderColor: "#3d3530", background: "#1f1b18" }}
      >
        <div className="flex items-center gap-4 md:gap-7">
          {/* Logo */}
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#c46a2c] text-[#e6a03c]">
              <Terminal size={15} strokeWidth={2.4} />
            </div>
            <div className="leading-none">
              <div className="text-[12px] font-semibold tracking-[.16em] text-[#f6f2ee] md:text-[13px] md:tracking-[.18em]">SKILLZ FORGE</div>
              <div className="mt-1 hidden font-mono text-[8px] tracking-[.15em] text-[#8a7e6e] sm:block">OVERKILL HILL P³ / LIBRARY</div>
            </div>
          </div>
          {/* Nav — hidden on mobile */}
          <nav className="hidden h-[58px] items-center gap-5 text-[12px] sm:flex md:gap-6">
            <button className="h-full border-b-2 border-[#c46a2c] font-semibold text-[#f6f2ee]" type="button">Explore</button>
            <button className="text-[#8a7e6e] transition-colors hover:text-[#ede7de]" type="button">My forge</button>
            <button className="hidden text-[#8a7e6e] transition-colors hover:text-[#ede7de] md:block" type="button">Collections</button>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile filter toggle */}
          <button
            type="button"
            aria-label="Open family filter"
            onClick={() => setShowMobileSidebar(true)}
            className="flex items-center gap-1.5 rounded-sm border border-[#4b4038] px-2.5 py-1.5 text-[11px] text-[#a79b8d] hover:border-[#c46a2c] hover:text-[#f6f2ee] md:hidden"
          >
            <Filter size={12} />
            {activeFamily !== "all" ? (
              <span style={{ color: "#e6a03c" }}>{familyLabel(activeFamily)}</span>
            ) : (
              "Families"
            )}
          </button>
          {/* Registry synced badge */}
          <div className="hidden items-center gap-2 text-[11px] text-[#8a7e6e] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#75b9a4]" />
            Registry synced
          </div>
          {/* Avatar */}
          <div className="flex items-center gap-2 border-l border-[#3d3530] pl-3 md:pl-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5a3a2d] font-mono text-[10px] text-[#e6a03c]">OH</div>
            <ChevronDown size={13} className="hidden text-[#8a7e6e] sm:block" />
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex h-[calc(100dvh-52px)] md:h-[calc(100dvh-58px)]">

        {/* Desktop sidebar — hidden on mobile */}
        <aside
          className="hidden w-[220px] shrink-0 overflow-y-auto border-r px-4 py-5 md:block"
          style={{ borderColor: "#3d3530", background: "#241e1b" }}
        >
          <SidebarContent
            activeFamily={activeFamily}
            onFamilyChange={setActiveFamily}
            onNewSearch={setQuery}
          />
        </aside>

        {/* Mobile sidebar drawer */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#15110f]/70" />
            {/* Drawer panel */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Family filter"
              className="absolute inset-y-0 left-0 w-[280px] overflow-y-auto border-r px-4 py-5"
              style={{ borderColor: "#3d3530", background: "#241e1b" }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent
                activeFamily={activeFamily}
                onFamilyChange={setActiveFamily}
                onClose={() => setShowMobileSidebar(false)}
                onNewSearch={setQuery}
              />
            </div>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────── */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1060px] px-4 pb-10 pt-5 md:px-7 md:pt-7">

            {/* Page header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#c46a2c]">/ explore / signal index</div>
                <h1
                  className="mt-2 text-[22px] leading-none tracking-[-.03em] text-[#f6f2ee] md:text-[29px]"
                  style={{ fontFamily: "'Alfa Slab One', serif" }}
                >
                  Find the right contract.
                </h1>
                <p className="mt-2 text-[11px] text-[#8a7e6e] md:text-[12px]">146 portable skills for agents that need to get useful, quickly.</p>
              </div>
              <div className="mt-1 hidden text-right sm:block">
                <div className="font-mono text-[22px] leading-none text-[#e6a03c]">146</div>
                <div className="mt-1 text-[9px] uppercase tracking-[.16em] text-[#675e55]">total contracts</div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative mt-5 md:mt-7">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c46a2c] md:left-4" size={18} strokeWidth={2.2} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skills, families, or what you need..."
                className="h-[48px] w-full rounded-sm border bg-[#1f1b18] pl-10 pr-24 text-[13px] text-[#f6f2ee] outline-none placeholder:text-[#675e55] focus:border-[#c46a2c] focus:ring-1 focus:ring-[#c46a2c]/40 md:h-[58px] md:pl-12 md:text-[14px]"
                style={{ borderColor: query ? "#c46a2c" : "#4b4038" }}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {query && (
                  <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="rounded p-1 text-[#8a7e6e] hover:text-[#f6f2ee]">
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden rounded border border-[#3d3530] px-2 py-1 font-mono text-[10px] text-[#8a7e6e] sm:block">⌘ K</kbd>
              </div>
            </div>

            {/* Toolbar row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "#3d3530" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-[#8a7e6e]">
                  <span className="text-[#f6f2ee]">{visibleSkills.length}</span> showing
                </span>
                {activeFamily !== "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveFamily("all")}
                    className="flex items-center gap-1 rounded-sm border border-[#6e452f] bg-[#5a3023] px-2 py-1 text-[10px] text-[#e6a03c]"
                  >
                    {familyLabel(activeFamily)} <X size={11} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] text-[#8a7e6e] hover:bg-[#332a25] hover:text-[#ede7de]"
                >
                  <SlidersHorizontal size={12} /> Filters
                </button>
                <div className="h-4 w-px bg-[#3d3530]" />
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === "relevance" ? "name" : "relevance")}
                  className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] text-[#8a7e6e] hover:bg-[#332a25] hover:text-[#ede7de]"
                >
                  {sortBy === "relevance" ? <Grid2X2 size={12} /> : <ArrowDownAZ size={12} />}
                  <span className="hidden sm:inline">{sortBy === "relevance" ? "Relevance" : "A–Z"}</span>
                </button>
              </div>
            </div>

            {/* Quick filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-2 border-b py-3 text-[10px]" style={{ borderColor: "#3d3530" }}>
                <Filter size={12} className="text-[#c46a2c]" />
                <span className="text-[#8a7e6e]">Quick filter:</span>
                {(Object.keys(maturityStyles) as Maturity[]).map((maturity) => (
                  <button
                    type="button"
                    key={maturity}
                    onClick={() => setQuery(maturity.toLowerCase())}
                    className="rounded-sm border px-2 py-1"
                    style={{ color: maturityStyles[maturity].color, borderColor: maturityStyles[maturity].line, background: maturityStyles[maturity].bg }}
                  >
                    {maturity}
                  </button>
                ))}
              </div>
            )}

            {/* Skill grid — 1 col mobile, 2 col tablet (md), 3 col desktop (xl) */}
            <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {visibleSkills.map((skill) => {
                const maturity = maturityStyles[skill.maturity];
                const family = familyMeta.find((entry) => entry.key === skill.family);
                return (
                  <button
                    type="button"
                    key={skill.slug}
                    onClick={() => setSelected(skill)}
                    className="group relative min-h-[120px] overflow-hidden rounded-sm border p-3.5 text-left transition-transform duration-150 hover:-translate-y-0.5 md:min-h-[137px]"
                    style={{ borderColor: "#403731", background: "#302824" }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity group-hover:opacity-100" style={{ background: family?.tint ?? "#c46a2c" }} />
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-mono text-[11px] font-semibold tracking-[-.01em] text-[#f6f2ee] md:text-[12px]">{skill.name}</span>
                      <ArrowUpRight size={13} className="shrink-0 text-[#675e55] transition-colors group-hover:text-[#e6a03c]" />
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-[28px] text-[11px] leading-[1.45] text-[#a79b8d]">{skill.description}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-sm px-1.5 py-0.5 text-[9px] font-medium" style={{ color: family?.tint, background: `${family?.tint}1a` }}>{family?.label}</span>
                      <span className="rounded-sm border px-1.5 py-0.5 text-[9px]" style={{ color: maturity.color, borderColor: maturity.line, background: maturity.bg }}>{skill.maturity}</span>
                      <span className="ml-auto font-mono text-[9px] text-[#675e55]">{skill.runs} runs</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Empty state */}
            {visibleSkills.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-sm border border-dashed border-[#4b4038] text-center">
                <Command size={24} className="mb-3 text-[#c46a2c]" />
                <div className="text-[13px] text-[#f6f2ee]">No contract matches that signal.</div>
                <button type="button" onClick={() => { setQuery(""); setActiveFamily("all"); }} className="mt-2 text-[11px] text-[#e6a03c]">
                  Clear search and browse all
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Skill detail modal ─────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-[#15110f]/70 px-4 sm:items-center sm:px-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="mb-0 w-full max-w-[430px] rounded-t-sm border p-5 shadow-2xl sm:mb-0 sm:rounded-sm"
            style={{ borderColor: "#59463a", background: "#2a2320" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#c46a2c]">Contract preview</div>
                <h2 className="mt-2 font-mono text-[15px] font-semibold text-[#f6f2ee] md:text-[17px]">{selected.name}</h2>
              </div>
              <button type="button" aria-label="Close preview" onClick={() => setSelected(null)} className="rounded p-1 text-[#8a7e6e] hover:bg-[#3a2f29] hover:text-[#f6f2ee]">
                <X size={16} />
              </button>
            </div>
            <p className="mt-4 text-[12px] leading-[1.6] text-[#b3a89a]">{selected.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-sm border border-[#3d3530] bg-[#1f1b18] p-3">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#675e55]">Maturity</div>
                <div className="mt-1 text-[12px] text-[#e6a03c]">{selected.maturity}</div>
              </div>
              <div className="rounded-sm border border-[#3d3530] bg-[#1f1b18] p-3">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#675e55]">Version</div>
                <div className="mt-1 text-[12px] text-[#ede7de]">{selected.version}</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span key={tag} className="rounded-sm bg-[#3a302a] px-2 py-1 font-mono text-[9px] text-[#a79b8d]">#{tag}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex shrink-0 items-center gap-1.5 rounded-sm bg-[#c46a2c] px-3 py-2 text-[11px] font-semibold text-[#1f1b18] hover:bg-[#e6a03c]"
              >
                <Check size={13} /> Use contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreB;
