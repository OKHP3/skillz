import { useMemo, useState } from "react";

type Skill = {
  name: string;
  summary: string;
  version: string;
  runtime: string;
  input: string;
  output: string;
  reads: string;
};

type Family = {
  name: string;
  count: number;
  description: string;
  code: string;
  accent: string;
  skills: Skill[];
};

const families: Family[] = [
  {
    name: "Agent Ops",
    count: 16,
    description: "Run agents, hand off work, keep the loop moving.",
    code: "AO",
    accent: "#d88442",
    skills: [
      { name: "handoff-brief", summary: "Package a clean context handoff between agents.", version: "v1.8.2", runtime: "any agent", input: "task + context", output: "SKILL.md", reads: "workspace" },
      { name: "loop-keeper", summary: "Keep recurring work moving without losing the thread.", version: "v1.4.0", runtime: "node 20+", input: "queue + state", output: "next action", reads: "local files" },
      { name: "runbook-check", summary: "Validate an agent run against its declared contract.", version: "v0.9.6", runtime: "shell", input: "run + policy", output: "audit log", reads: "git history" },
    ],
  },
  {
    name: "Build & Ship",
    count: 15,
    description: "Turn a clean brief into software that reaches production.",
    code: "BS",
    accent: "#e0a34d",
    skills: [
      { name: "release-notes", summary: "Turn merged work into useful release notes.", version: "v2.1.1", runtime: "any agent", input: "git diff", output: "markdown", reads: "git history" },
      { name: "ship-check", summary: "Walk a deployable change through its final checks.", version: "v1.6.4", runtime: "shell", input: "repo + brief", output: "go / no-go", reads: "workspace" },
      { name: "scaffold-route", summary: "Add a route without leaving the project half-wired.", version: "v1.1.8", runtime: "node 20+", input: "route brief", output: "source files", reads: "project tree" },
    ],
  },
  {
    name: "Research",
    count: 13,
    description: "Find signal in the open web and bring back receipts.",
    code: "RS",
    accent: "#90aa98",
    skills: [
      { name: "source-map", summary: "Trace a claim back to primary evidence.", version: "v1.9.3", runtime: "any agent", input: "question", output: "source map", reads: "open web" },
      { name: "competitive-scan", summary: "Build a compact, evidence-led view of a market.", version: "v1.2.7", runtime: "browser", input: "market + lens", output: "brief", reads: "open web" },
      { name: "fact-stack", summary: "Separate observed facts from assumptions and inference.", version: "v0.8.5", runtime: "any agent", input: "research", output: "fact stack", reads: "citations" },
    ],
  },
  {
    name: "Code Intelligence",
    count: 12,
    description: "Read unfamiliar systems before you touch the first file.",
    code: "CI",
    accent: "#b7a17b",
    skills: [
      { name: "repo-orient", summary: "Map the seams, conventions, and hidden rules of a repo.", version: "v1.7.5", runtime: "shell", input: "repo path", output: "orientation", reads: "project tree" },
      { name: "dependency-trace", summary: "Follow a behavior across files and boundaries.", version: "v1.0.9", runtime: "any agent", input: "symbol", output: "trace", reads: "source files" },
      { name: "change-surface", summary: "Name the blast radius before making a change.", version: "v1.3.2", runtime: "shell", input: "change brief", output: "risk note", reads: "git history" },
    ],
  },
  {
    name: "Content Systems",
    count: 11,
    description: "Shape raw thinking into clear, useful artifacts.",
    code: "CS",
    accent: "#d79d79",
    skills: [
      { name: "brief-to-draft", summary: "Move from a rough brief to a structured first draft.", version: "v1.5.0", runtime: "any agent", input: "brief", output: "draft", reads: "references" },
      { name: "voice-lock", summary: "Keep a set of content aligned to its chosen voice.", version: "v1.0.4", runtime: "any agent", input: "draft + voice", output: "revision", reads: "style guide" },
      { name: "content-audit", summary: "Find the weak, duplicated, or missing parts of a set.", version: "v0.7.8", runtime: "any agent", input: "content set", output: "audit", reads: "workspace" },
    ],
  },
  {
    name: "Data & Analytics",
    count: 10,
    description: "Query, measure, and explain what the numbers are saying.",
    code: "DA",
    accent: "#9cae9b",
    skills: [
      { name: "metric-brief", summary: "Give a metric the definition and context it deserves.", version: "v1.4.6", runtime: "any agent", input: "metric name", output: "metric card", reads: "data docs" },
      { name: "query-shape", summary: "Turn a question into a query another person can trust.", version: "v1.1.3", runtime: "sql", input: "question", output: "query", reads: "schema" },
      { name: "signal-read", summary: "Explain the meaningful movement inside a data set.", version: "v0.9.1", runtime: "python", input: "data set", output: "readout", reads: "tables" },
    ],
  },
  {
    name: "Docs & Knowledge",
    count: 9,
    description: "Make the right answer findable when it matters.",
    code: "DK",
    accent: "#9eb4ae",
    skills: [
      { name: "doc-index", summary: "Make a living index for a fast-moving knowledge base.", version: "v1.2.9", runtime: "any agent", input: "docs", output: "index", reads: "workspace" },
      { name: "decision-record", summary: "Capture the why before the why gets lost.", version: "v1.0.7", runtime: "any agent", input: "decision", output: "ADR", reads: "context" },
      { name: "answer-finder", summary: "Locate the smallest useful answer in a messy archive.", version: "v0.8.9", runtime: "any agent", input: "question", output: "answer + refs", reads: "knowledge base" },
    ],
  },
  {
    name: "Design & Creative",
    count: 8,
    description: "Give ideas shape, hierarchy, and a point of view.",
    code: "DC",
    accent: "#d98c69",
    skills: [
      { name: "hierarchy-pass", summary: "Find the emphasis a composition is currently missing.", version: "v1.3.8", runtime: "any agent", input: "visual", output: "critique", reads: "brief" },
      { name: "interface-voice", summary: "Make product copy sound like one considered system.", version: "v1.1.0", runtime: "any agent", input: "UI copy", output: "revisions", reads: "voice guide" },
      { name: "palette-note", summary: "Document the logic behind a palette, not just its hexes.", version: "v0.6.4", runtime: "any agent", input: "palette", output: "design note", reads: "tokens" },
    ],
  },
  {
    name: "Security & Trust",
    count: 8,
    description: "Spot weak seams and make responsible defaults explicit.",
    code: "ST",
    accent: "#8eb0ae",
    skills: [
      { name: "permission-scan", summary: "Surface access assumptions before they become incidents.", version: "v1.6.1", runtime: "shell", input: "repo", output: "risk list", reads: "config" },
      { name: "safe-defaults", summary: "Turn a policy into defaults people can actually follow.", version: "v1.0.8", runtime: "any agent", input: "policy", output: "checklist", reads: "docs" },
      { name: "secrets-check", summary: "Check a change for accidental credential exposure.", version: "v1.2.2", runtime: "shell", input: "diff", output: "finding", reads: "git diff" },
    ],
  },
  {
    name: "Communication",
    count: 7,
    description: "Say the thing with precision, warmth, and less noise.",
    code: "CO",
    accent: "#d1a071",
    skills: [
      { name: "status-signal", summary: "Write a status update that makes the next move obvious.", version: "v1.2.5", runtime: "any agent", input: "project state", output: "update", reads: "workspace" },
      { name: "hard-message", summary: "Make a necessary message direct without making it cold.", version: "v0.9.4", runtime: "any agent", input: "situation", output: "message", reads: "context" },
      { name: "meeting-to-memo", summary: "Convert a noisy conversation into useful decisions.", version: "v1.0.2", runtime: "any agent", input: "transcript", output: "memo", reads: "transcript" },
    ],
  },
];

const navItems = [
  { label: "Families", href: "#families" },
  { label: "The contract", href: "#contract" },
  { label: "Contribute", href: "#contribute" },
];

function ForgeMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-label="Skillz Forge mark" role="img">
      <path d="M7 4h20v5H12v5h12v5H12v6h15v5H7V4Z" fill="#c46a2c" />
      <path d="M22 4h5v9h-5z" fill="#e6a03c" opacity=".72" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function FamilyGlyph({ code, accent }: { code: string; accent: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center border text-[10px] font-semibold tracking-[-.04em]" style={{ borderColor: `${accent}70`, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
      {code}
    </span>
  );
}

export function HomeB() {
  const [query, setQuery] = useState("");
  const [selectedFamilyName, setSelectedFamilyName] = useState("Agent Ops");
  const [selectedSkillName, setSelectedSkillName] = useState("handoff-brief");
  const [sortByCount, setSortByCount] = useState(false);
  const [loadedFamily, setLoadedFamily] = useState<string | null>(null);
  const [contractOpen, setContractOpen] = useState(false);

  const selectedFamily = families.find((family) => family.name === selectedFamilyName) ?? families[0];
  const selectedSkill = selectedFamily.skills.find((skill) => skill.name === selectedSkillName) ?? selectedFamily.skills[0];

  const visibleFamilies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? families.filter((family) => `${family.name} ${family.description} ${family.skills.map((skill) => skill.name).join(" ")}`.toLowerCase().includes(normalized))
      : families;
    return sortByCount ? [...filtered].sort((a, b) => b.count - a.count) : filtered;
  }, [query, sortByCount]);

  const selectFamily = (family: Family) => {
    setSelectedFamilyName(family.name);
    setSelectedSkillName(family.skills[0].name);
    setContractOpen(false);
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#28211e] text-[#ede7de]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")" }} />

      <header className="relative z-10 border-b border-[#463a34]">
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3 no-underline">
            <ForgeMark />
            <span className="leading-none">
              <span className="block text-[14px] font-bold uppercase tracking-[0.16em] text-[#f6f2ee]">Skillz Forge</span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.27em] text-[#8a7e6e]">by overkill hill p³</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a99b8b] transition-colors hover:text-[#e6a03c]">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="https://github.com" className="flex items-center gap-2 border border-[#5b4b3f] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#ede7de] transition-colors hover:border-[#c46a2c] hover:text-[#e6a03c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e6a03c]" />
            Open source
          </a>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:divide-x lg:divide-[#463a34]">
          <div className="min-w-0 lg:pr-10">
            <section className="relative pb-10 pt-14 sm:pt-16">
              <div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c46a2c]">
                <span className="h-px w-9 bg-[#c46a2c]" />
                The governed skill library
              </div>
              <h1 className="max-w-[760px] text-[clamp(44px,6.6vw,86px)] leading-[0.91] tracking-[-0.05em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>
                Find the
                <br />
                <span className="text-[#c46a2c]">right contract.</span>
              </h1>
              <p className="mt-7 max-w-[590px] text-[16px] leading-7 text-[#a99b8b]">
                Portable <span className="text-[#ede7de]">SKILL.md</span> contracts for agents that do recurring work. Search by intent, inspect the family, then load only what belongs in the loop.
              </p>
              <div className="mt-9 grid max-w-[720px] grid-cols-3 border-y border-[#51463e] bg-[#241f1c]">
                <div className="border-r border-[#51463e] px-4 py-4 sm:px-5">
                  <div className="text-[27px] leading-none text-[#f6f2ee]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>146</div>
                  <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">skills in the rack</div>
                </div>
                <div className="border-r border-[#51463e] px-4 py-4 sm:px-5">
                  <div className="text-[27px] leading-none text-[#f6f2ee]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>16</div>
                  <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">working families</div>
                </div>
                <div className="px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-2 text-[27px] leading-none text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="h-2 w-2 rounded-full bg-[#e6a03c]" />
                    OSS
                  </div>
                  <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">open by default</div>
                </div>
              </div>
            </section>

            <section className="border-y border-[#3d3530] bg-[#211c19]" aria-label="Search the skill catalog">
              <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7e6e]">
                  <span className="text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>01</span>
                  Find a family
                </div>
                <div className="flex w-full max-w-[580px] items-center border border-[#5d4d41] bg-[#2a2320] px-4 py-3 transition-colors focus-within:border-[#c46a2c]">
                  <SearchIcon />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search families or what you need to do…" className="ml-3 w-full bg-transparent text-[13px] text-[#f6f2ee] outline-none placeholder:text-[#796f63]" />
                  {query && (
                    <button onClick={() => setQuery("")} className="ml-3 text-[10px] uppercase tracking-[0.13em] text-[#8a7e6e] hover:text-[#e6a03c]" aria-label="Clear search">clear</button>
                  )}
                </div>
                <button onClick={() => setSortByCount((value) => !value)} className={`whitespace-nowrap text-left text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${sortByCount ? "text-[#e6a03c]" : "text-[#8a7e6e] hover:text-[#ede7de]"}`}>
                  {sortByCount ? "Count: high → low" : "Sort by count"}
                </button>
              </div>
            </section>

            <section id="families" className="pb-20 pt-11">
              <div className="mb-7 flex items-end justify-between">
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c46a2c]">Browse the rack</div>
                  <h2 className="text-[30px] tracking-[-0.025em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>Pick a starting point.</h2>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-[22px] leading-none text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(visibleFamilies.length).padStart(2, "0")}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#8a7e6e]">showing</div>
                </div>
              </div>

              {visibleFamilies.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {visibleFamilies.map((family, index) => {
                    const isSelected = selectedFamily.name === family.name;
                    return (
                      <button key={family.name} onClick={() => selectFamily(family)} aria-pressed={isSelected} className={`group relative min-h-[142px] overflow-hidden border p-5 text-left transition-transform duration-200 hover:-translate-y-1 ${isSelected ? "border-[#c46a2c] bg-[#3a2b23]" : "border-[#463b34] bg-[#302824] hover:border-[#846047]"}`}>
                        <div className="absolute right-0 top-0 h-16 w-16 translate-x-7 -translate-y-7 rotate-45 border border-[#c46a2c]/20" />
                        <div className="flex items-start justify-between">
                          <FamilyGlyph code={family.code} accent={family.accent} />
                          <span className="pt-1 text-[13px]" style={{ color: family.accent, fontFamily: "'JetBrains Mono', monospace" }}>{String(family.count).padStart(2, "0")}</span>
                        </div>
                        <h3 className="mt-6 text-[20px] leading-[1.05] tracking-[-0.025em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>{family.name}</h3>
                        <p className="mt-3 max-w-[260px] text-[11px] leading-[1.45] text-[#a99b8b]">{family.description}</p>
                        <span className={`absolute bottom-0 left-0 h-[3px] bg-[#c46a2c] transition-all ${isSelected ? "w-full" : "w-0 group-hover:w-1/2"}`} />
                        <span className="absolute bottom-4 right-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806f5e] opacity-0 transition-opacity group-hover:opacity-100">inspect →</span>
                        <span className="absolute left-5 top-5 text-[8px] text-[#75695e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(index + 1).padStart(2, "0")}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#665447] bg-[#241f1c] px-8 py-16 text-center">
                  <div className="text-[22px] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>No tool on that shelf.</div>
                  <p className="mt-2 text-[12px] text-[#8a7e6e]">Try a broader search or clear the label.</p>
                  <button onClick={() => setQuery("")} className="mt-5 border border-[#c46a2c] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e6a03c] hover:bg-[#c46a2c] hover:text-[#f6f2ee]">Clear search</button>
                </div>
              )}
            </section>

            <section id="contract" className="border-y border-[#3d3530] bg-[#211c19]">
              <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-[1.15fr_1fr] md:items-center">
                <div>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c46a2c]">The contract is the feature</div>
                  <h2 className="max-w-[560px] text-[30px] leading-[1.05] tracking-[-0.025em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>Small files. Clear behavior. No mystery meat.</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[11px] text-[#a99b8b]">
                  {["Read the intent", "Load the context", "Return the result"].map((step, index) => (
                    <div key={step} className="border-l border-[#6d503d] pl-3">
                      <div className="mb-3 text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0{index + 1}</div>
                      <div className="leading-5">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="relative lg:pl-8">
            <div className="sticky top-5 pb-8 pt-8 lg:min-h-[calc(100dvh-74px)]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7e6e]">
                  <span className="text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>02</span>
                  Family detail
                </div>
                <span className="text-[9px] uppercase tracking-[0.17em] text-[#806f5e]">live preview</span>
              </div>
              <div className="overflow-hidden border border-[#6b503e] bg-[#302824]">
                <div className="relative border-b border-[#51463e] bg-[#241f1c] p-6">
                  <div className="absolute right-5 top-5 text-[10px] text-[#806f5e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>F/{selectedFamily.code}</div>
                  <div className="flex items-start gap-4">
                    <FamilyGlyph code={selectedFamily.code} accent={selectedFamily.accent} />
                    <div className="min-w-0">
                      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c46a2c]">selected family</div>
                      <h2 className="mt-2 text-[30px] leading-none tracking-[-0.035em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>{selectedFamily.name}</h2>
                    </div>
                  </div>
                  <p className="mt-5 max-w-[300px] text-[12px] leading-5 text-[#a99b8b]">{selectedFamily.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[#463a34] pt-4">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#806f5e]">contracts ready</span>
                    <span className="text-[18px] text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(selectedFamily.count).padStart(2, "0")}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">Preview skills</span>
                    <span className="text-[9px] text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>03 shown</span>
                  </div>
                  <div className="space-y-2">
                    {selectedFamily.skills.map((skill, index) => {
                      const isSkillSelected = selectedSkill.name === skill.name;
                      return (
                        <button key={skill.name} onClick={() => setSelectedSkillName(skill.name)} aria-pressed={isSkillSelected} className={`group w-full border p-3 text-left transition-colors ${isSkillSelected ? "border-[#c46a2c] bg-[#3b2c23]" : "border-[#4a3d35] bg-[#2a2320] hover:border-[#806047]"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-3">
                              <span className="text-[9px] text-[#806f5e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0{index + 1}</span>
                              <span className={`text-[12px] font-semibold ${isSkillSelected ? "text-[#f6f2ee]" : "text-[#cfc4b7]"}`}>{skill.name}</span>
                            </span>
                            <span className="text-[9px] text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{skill.version}</span>
                          </div>
                          <p className="mt-2 pl-7 text-[10px] leading-4 text-[#8f8275]">{skill.summary}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[#51463e] bg-[#241f1c] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">Contract metadata</div>
                      <div className="mt-1 text-[13px] text-[#ede7de]">{selectedSkill.name}</div>
                    </div>
                    <button onClick={() => setContractOpen((value) => !value)} className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#e6a03c] hover:text-[#f6f2ee]">
                      {contractOpen ? "Hide spec" : "View spec"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#463a34] py-4">
                    <div><div className="text-[8px] uppercase tracking-[0.15em] text-[#806f5e]">version</div><div className="mt-1 text-[11px] text-[#cfc4b7]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedSkill.version}</div></div>
                    <div><div className="text-[8px] uppercase tracking-[0.15em] text-[#806f5e]">runtime</div><div className="mt-1 text-[11px] text-[#cfc4b7]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedSkill.runtime}</div></div>
                    <div><div className="text-[8px] uppercase tracking-[0.15em] text-[#806f5e]">takes</div><div className="mt-1 text-[11px] text-[#cfc4b7]">{selectedSkill.input}</div></div>
                    <div><div className="text-[8px] uppercase tracking-[0.15em] text-[#806f5e]">returns</div><div className="mt-1 text-[11px] text-[#cfc4b7]">{selectedSkill.output}</div></div>
                  </div>
                  {contractOpen && (
                    <div className="mt-4 border-l-2 border-[#c46a2c] pl-3 text-[10px] leading-5 text-[#9c8e80]">
                      Reads <span className="text-[#ede7de]">{selectedSkill.reads}</span>. Contract is portable, inspectable, and safe to load into a recurring run.
                    </div>
                  )}
                  <button onClick={() => setLoadedFamily(selectedFamily.name)} className={`mt-5 flex w-full items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] transition-colors ${loadedFamily === selectedFamily.name ? "border border-[#718d72] bg-[#354437] text-[#b8d2af]" : "bg-[#c46a2c] text-[#f6f2ee] hover:bg-[#d07838]"}`}>
                    <span>{loadedFamily === selectedFamily.name ? "Family loaded" : "Load family"}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{loadedFamily === selectedFamily.name ? "✓" : "→"}</span>
                  </button>
                  {loadedFamily === selectedFamily.name && <div className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-[#7f9b80]">Ready in your next agent run</div>}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer id="contribute" className="border-t border-[#3d3530]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-8 text-[10px] uppercase tracking-[0.16em] text-[#806f5e] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3"><ForgeMark /><span>146 contracts · 16 families · maintained in public</span></div>
          <div className="flex gap-6"><a href="https://github.com" className="hover:text-[#e6a03c]">Read the repo</a><a href="mailto:forge@overkillhill.com" className="hover:text-[#e6a03c]">Suggest a tool</a><span className="text-[#c46a2c]">P³ / 2024—25</span></div>
        </div>
      </footer>
    </main>
  );
}

export default HomeB;