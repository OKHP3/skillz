import { useMemo, useState } from "react";

type Family = {
  name: string;
  count: number;
  description: string;
  code: string;
  tone: string;
};

const families: Family[] = [
  { name: "Agent Ops", count: 16, description: "Run agents, hand off work, keep the loop moving.", code: "AO", tone: "bg-[#34453f]" },
  { name: "Build & Ship", count: 15, description: "Turn a clean brief into software that reaches production.", code: "BS", tone: "bg-[#5a3c2c]" },
  { name: "Research", count: 13, description: "Find signal in the open web and bring back receipts.", code: "RS", tone: "bg-[#3e4341]" },
  { name: "Code Intelligence", count: 12, description: "Read unfamiliar systems before you touch the first file.", code: "CI", tone: "bg-[#473b31]" },
  { name: "Content Systems", count: 11, description: "Shape raw thinking into clear, useful artifacts.", code: "CS", tone: "bg-[#39473e]" },
  { name: "Data & Analytics", count: 10, description: "Query, measure, and explain what the numbers are saying.", code: "DA", tone: "bg-[#514036]" },
  { name: "Docs & Knowledge", count: 9, description: "Make the right answer findable when it matters.", code: "DK", tone: "bg-[#3c4848]" },
  { name: "Design & Creative", count: 8, description: "Give ideas shape, hierarchy, and a point of view.", code: "DC", tone: "bg-[#594038]" },
  { name: "Security & Trust", count: 8, description: "Spot weak seams and make responsible defaults explicit.", code: "ST", tone: "bg-[#353e43]" },
  { name: "Communication", count: 7, description: "Say the thing with precision, warmth, and less noise.", code: "CO", tone: "bg-[#4d4133]" },
  { name: "Web Automation", count: 7, description: "Move through browsers like a careful, tireless operator.", code: "WA", tone: "bg-[#34443f]" },
  { name: "Testing & QA", count: 6, description: "Break the happy path before your users have to.", code: "QA", tone: "bg-[#493c32]" },
  { name: "Product Strategy", count: 6, description: "Choose the next useful thing, not the loudest thing.", code: "PS", tone: "bg-[#3d4944]" },
  { name: "Personal Productivity", count: 5, description: "Clear the small friction between intention and action.", code: "PP", tone: "bg-[#524036]" },
  { name: "Dev Environment", count: 5, description: "Prepare the bench: tools, context, and repeatable setup.", code: "DE", tone: "bg-[#35424a]" },
  { name: "Governance & Policy", count: 8, description: "Set boundaries that make powerful work safer to share.", code: "GP", tone: "bg-[#4a3c33]" },
];

const navItems = ["Families", "How it works", "Contribute"];

function ForgeMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-label="Skillz Forge mark" role="img">
      <path d="M7 4h20v5H12v5h12v5H12v6h15v5H7V4Z" fill="#c46a2c" />
      <path d="M22 4h5v9h-5z" fill="#e6a03c" opacity=".7" />
    </svg>
  );
}

function ForgeGlyph({ code }: { code: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#766452]/50 text-[10px] font-semibold tracking-[-.04em] text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {code}
    </span>
  );
}

export function HomeA() {
  const [query, setQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("Agent Ops");
  const [sortByCount, setSortByCount] = useState(false);

  const visibleFamilies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? families.filter((family) => `${family.name} ${family.description}`.toLowerCase().includes(normalized))
      : families;
    return sortByCount ? [...filtered].sort((a, b) => b.count - a.count) : filtered;
  }, [query, sortByCount]);

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#2a2320] text-[#ede7de]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")" }} />

      <header className="relative z-10 border-b border-[#3d3530]">
        <div className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-7">
          <a href="#top" className="flex items-center gap-3 no-underline">
            <ForgeMark />
            <span className="leading-none">
              <span className="block text-[14px] font-bold uppercase tracking-[0.16em] text-[#f6f2ee]">Skillz Forge</span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.27em] text-[#8a7e6e]">by overkill hill p³</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navItems.map((item, index) => (
              <a key={item} href={`#${index === 0 ? "families" : index === 1 ? "method" : "contribute"}`} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a99b8b] transition-colors hover:text-[#e6a03c]">
                {item}
              </a>
            ))}
          </nav>
          <a href="https://github.com" className="flex items-center gap-2 border border-[#5b4b3f] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#ede7de] transition-colors hover:border-[#c46a2c] hover:text-[#e6a03c]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e6a03c]" />
            Open source
          </a>
        </div>
      </header>

      <section id="top" className="relative mx-auto max-w-[1180px] px-7 pb-12 pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px] lg:gap-20">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c46a2c]">
              <span className="h-px w-9 bg-[#c46a2c]" />
              The governed skill library
            </div>
            <h1 className="max-w-[700px] text-[clamp(44px,5.7vw,78px)] leading-[0.94] tracking-[-0.045em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>
              Put the right
              <br />
              tool in the hand.
            </h1>
            <p className="mt-6 max-w-[560px] text-[16px] leading-7 text-[#a99b8b]">
              Portable <span className="text-[#ede7de]">SKILL.md</span> contracts for agents that do recurring work. Read the label. Load the skill. Get on with it.
            </p>

            <div className="mt-9 grid max-w-[660px] grid-cols-3 border-y border-[#51463e] bg-[#241f1c]">
              <div className="border-r border-[#51463e] px-5 py-4">
                <div className="text-[27px] leading-none text-[#f6f2ee]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>146</div>
                <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">skills in the rack</div>
              </div>
              <div className="border-r border-[#51463e] px-5 py-4">
                <div className="text-[27px] leading-none text-[#f6f2ee]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>16</div>
                <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">working families</div>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 text-[27px] leading-none text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className="h-2 w-2 rounded-full bg-[#e6a03c]" />
                  OSS
                </div>
                <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7e6e]">open by default</div>
              </div>
            </div>
          </div>

          <aside className="relative hidden min-h-[270px] overflow-hidden border border-[#51463e] bg-[#1f1b18] lg:block">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(90deg, transparent 49%, #c46a2c 50%, transparent 51%), linear-gradient(#3d3530 1px, transparent 1px)", backgroundSize: "100% 100%, 100% 32px" }} />
            <div className="absolute left-7 top-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7e6e]">Rack / 00—16</div>
            <div className="absolute bottom-7 left-7 right-7">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-[72px] leading-[.8] text-[#c46a2c]/90" style={{ fontFamily: "'Alfa Slab One', serif" }}>P³</span>
                <span className="text-right text-[9px] uppercase tracking-[0.18em] text-[#8a7e6e]">inspect<br />before use</span>
              </div>
              <div className="h-px w-full bg-[#70533f]" />
              <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.18em] text-[#8a7e6e]">
                <span>every skill has a contract</span>
                <span className="text-[#e6a03c]">v1.4.6</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-[#3d3530] bg-[#1f1b18]" aria-label="Search the skill catalog">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-7 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7e6e]">
            <span className="text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>01</span>
            Find a skill family
          </div>
          <div className="flex w-full max-w-[580px] items-center border border-[#5d4d41] bg-[#2a2320] px-4 py-3 transition-colors focus-within:border-[#c46a2c]">
            <svg className="mr-3 h-4 w-4 text-[#c46a2c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search families or what you need to do…" className="w-full bg-transparent text-[13px] text-[#f6f2ee] outline-none placeholder:text-[#796f63]" />
            {query && (
              <button onClick={() => setQuery("")} className="ml-3 text-[10px] uppercase tracking-[0.13em] text-[#8a7e6e] hover:text-[#e6a03c]" aria-label="Clear search">
                clear
              </button>
            )}
          </div>
          <button onClick={() => setSortByCount((value) => !value)} className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors ${sortByCount ? "text-[#e6a03c]" : "text-[#8a7e6e] hover:text-[#ede7de]"}`}>
            {sortByCount ? "Count: high → low" : "Sort by count"}
          </button>
        </div>
      </section>

      <section id="families" className="mx-auto max-w-[1180px] px-7 pb-20 pt-11">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c46a2c]">Browse the rack</div>
            <h2 className="text-[30px] tracking-[-0.025em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>Sixteen ways to get moving.</h2>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[22px] leading-none text-[#e6a03c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(visibleFamilies.length).padStart(2, "0")}</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#8a7e6e]">showing</div>
          </div>
        </div>

        {visibleFamilies.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {visibleFamilies.map((family, index) => {
              const isSelected = selectedFamily === family.name;
              return (
                <button
                  key={family.name}
                  onClick={() => setSelectedFamily(family.name)}
                  className={`group relative min-h-[154px] overflow-hidden border p-5 text-left transition-transform duration-200 hover:-translate-y-1 ${isSelected ? "border-[#c46a2c] bg-[#3a2b23]" : "border-[#463b34] bg-[#302824] hover:border-[#846047]"}`}
                >
                  <div className="absolute right-0 top-0 h-16 w-16 translate-x-7 -translate-y-7 rotate-45 border border-[#c46a2c]/20" />
                  <div className="flex items-start justify-between">
                    <ForgeGlyph code={family.code} />
                    <span className="pt-1 text-[13px] text-[#c46a2c]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(family.count).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-7 text-[20px] leading-[1.05] tracking-[-0.025em] text-[#f6f2ee]" style={{ fontFamily: "'Alfa Slab One', serif" }}>{family.name}</h3>
                  <p className="mt-3 max-w-[210px] text-[11px] leading-[1.45] text-[#a99b8b]">{family.description}</p>
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

        <div id="method" className="mt-10 flex flex-col justify-between gap-5 border-t border-[#51463e] pt-5 sm:flex-row sm:items-center">
          <p className="text-[12px] text-[#8a7e6e]">
            Selected shelf: <span className="font-semibold text-[#ede7de]">{selectedFamily}</span>
            <span className="mx-2 text-[#665447]">/</span>
            <span className="text-[#c46a2c]">{families.find((family) => family.name === selectedFamily)?.count ?? 0} contracts ready to inspect</span>
          </p>
          <a href="#method-detail" className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#e6a03c] hover:text-[#f6f2ee]">How a skill works <span className="ml-2">↗</span></a>
        </div>
      </section>

      <section id="method-detail" className="border-y border-[#3d3530] bg-[#1f1b18]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-7 py-12 md:grid-cols-[1.2fr_1fr] md:items-center">
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

      <footer id="contribute" className="mx-auto flex max-w-[1180px] flex-col gap-5 px-7 py-8 text-[10px] uppercase tracking-[0.16em] text-[#806f5e] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ForgeMark />
          <span>146 contracts · 16 families · maintained in public</span>
        </div>
        <div className="flex gap-6">
          <a href="https://github.com" className="hover:text-[#e6a03c]">Read the repo</a>
          <a href="mailto:forge@overkillhill.com" className="hover:text-[#e6a03c]">Suggest a tool</a>
          <span className="text-[#c46a2c]">P³ / 2024—25</span>
        </div>
      </footer>
    </main>
  );
}

export default HomeA;