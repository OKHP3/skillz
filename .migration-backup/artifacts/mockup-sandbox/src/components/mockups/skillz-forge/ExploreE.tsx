import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  Copy,
  FileText,
  FolderPlus,
  Layers3,
  Library,
  ListFilter,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

type Maturity = "Ready" | "Validated" | "Experimental";
type ShelfKey = "all" | "universal" | "process-capture" | "social-posting" | "knowledge-operations" | "context-extraction" | "agent-foundry" | "community";

type Skill = {
  name: string;
  family: ShelfKey;
  familyLabel: string;
  deck: string;
  description: string;
  readTime: string;
  maturity: Maturity;
  runs: string;
  version: string;
  tags: string[];
  excerpt: string;
  sections: { title: string; body: string }[];
};

type Collection = {
  id: string;
  name: string;
  note: string;
  color: string;
  skills: string[];
};

const shelves: { key: ShelfKey; label: string; count: string; color: string }[] = [
  { key: "all", label: "The complete index", count: "146", color: "#c55e3e" },
  { key: "universal", label: "Universal tools", count: "18", color: "#bd8c42" },
  { key: "process-capture", label: "Process capture", count: "09", color: "#4c8176" },
  { key: "social-posting", label: "Social posting", count: "12", color: "#c97954" },
  { key: "knowledge-operations", label: "Knowledge ops", count: "11", color: "#688ca0" },
  { key: "context-extraction", label: "Context extraction", count: "08", color: "#9b7c46" },
  { key: "agent-foundry", label: "Agent foundry", count: "14", color: "#ad6250" },
  { key: "community", label: "Community", count: "10", color: "#5d8c7a" },
];

const skills: Skill[] = [
  {
    name: "okhp3-skill-cataloger",
    family: "universal",
    familyLabel: "Universal tools",
    deck: "A field guide to the registry",
    description: "Index, classify, and expose governed SKILL.md contracts.",
    readTime: "4 min",
    maturity: "Validated",
    runs: "2.4k",
    version: "v2.3",
    tags: ["catalog", "governance"],
    excerpt: "The cataloger is the first pair of eyes on a new contract. It turns a loose folder of instructions into a legible surface: named, searchable, owned, and ready to be trusted.",
    sections: [
      { title: "Why it exists", body: "When a registry grows faster than its memory, good work becomes difficult to find. This skill makes the shape of the collection visible without flattening the nuance inside each contract." },
      { title: "What it returns", body: "A normalized index with family, maturity, owner, version, entry conditions, and a short signal-rich description. It keeps the original contract intact while making its edges easier to read." },
      { title: "Use it when", body: "You are onboarding a new body of skills, auditing drift, or preparing a handoff where the next person needs the map before they need the territory." },
    ],
  },
  {
    name: "okhp3-brief-to-action",
    family: "universal",
    familyLabel: "Universal tools",
    deck: "The small hinge between thought and work",
    description: "Turn an ambiguous brief into a sequenced, executable plan.",
    readTime: "3 min",
    maturity: "Ready",
    runs: "1.8k",
    version: "v1.8",
    tags: ["planning", "triage"],
    excerpt: "A good plan does not pretend the brief is clear. It names the unknowns, chooses a first move, and makes the next useful action impossible to miss.",
    sections: [
      { title: "The editorial cut", body: "Separate signal from ceremony. The brief becomes a short sequence of decisions, not a longer version of the same uncertainty." },
      { title: "The handoff", body: "Every action carries an owner, a definition of done, and the question it unlocks next." },
      { title: "Use it when", body: "The ask sounds urgent, the room is full, and nobody can point to the first irreversible step." },
    ],
  },
  {
    name: "capture-the-work",
    family: "process-capture",
    familyLabel: "Process capture",
    deck: "Notes from the floor",
    description: "Observe a workflow and write the repeatable parts down.",
    readTime: "6 min",
    maturity: "Validated",
    runs: "684",
    version: "v1.4",
    tags: ["workflow", "SOP"],
    excerpt: "The work is already happening. Capture-the-work listens for the tiny choices experts make automatically, then gives those choices a durable home.",
    sections: [
      { title: "Observe before naming", body: "Start with the sequence as it is actually lived. Exceptions are not noise; they are often the most valuable part of the procedure." },
      { title: "A useful record", body: "The output is an operational draft with triggers, steps, checks, and places where judgment still belongs to a person." },
      { title: "Use it when", body: "A team says, “it is obvious,” but a new teammate cannot reproduce the result without asking three people." },
    ],
  },
  {
    name: "fieldnote-to-process",
    family: "process-capture",
    familyLabel: "Process capture",
    deck: "From the margin to the manual",
    description: "Convert messy field notes into a clean operating procedure.",
    readTime: "5 min",
    maturity: "Ready",
    runs: "412",
    version: "v0.9",
    tags: ["notes", "process"],
    excerpt: "A field note is evidence, not a finished process. This skill keeps the texture of the original observation while giving it a useful order.",
    sections: [
      { title: "Keep the grain", body: "Preserve the language and caveats that explain why the procedure looks the way it does." },
      { title: "Make it runnable", body: "Group observations into a sequence that another capable person can pick up without translating it first." },
      { title: "Use it when", body: "The source material lives across screenshots, voice notes, and half-finished documents." },
    ],
  },
  {
    name: "knowledge-librarian",
    family: "knowledge-operations",
    familyLabel: "Knowledge ops",
    deck: "Keep the shelf honest",
    description: "Maintain a living library with owners, links, and next actions.",
    readTime: "4 min",
    maturity: "Validated",
    runs: "943",
    version: "v1.7",
    tags: ["library", "ops"],
    excerpt: "A library is a promise that the useful thing will still be findable later. The librarian tends that promise with owners, dates, and a bias toward clarity.",
    sections: [
      { title: "The maintenance loop", body: "Find the stale edge, ask who still needs it, and leave the smallest next action that restores confidence." },
      { title: "Use it when", body: "The team has plenty of documentation and very little certainty about which document to open." },
    ],
  },
  {
    name: "agent-blueprint",
    family: "agent-foundry",
    familyLabel: "Agent foundry",
    deck: "Architecture for capable things",
    description: "Shape a reliable agent from capability, limits, and tests.",
    readTime: "7 min",
    maturity: "Validated",
    runs: "876",
    version: "v2.0",
    tags: ["agents", "design"],
    excerpt: "Capability is the easy part. A blueprint makes the boundaries legible: what the agent can do, when it should stop, and how you will know it worked.",
    sections: [
      { title: "Start with the limit", body: "Define the no-go zones before adding cleverness. Reliability is designed at the edge of the system." },
      { title: "Test the shape", body: "A good blueprint gives every capability a witness: a test, a counterexample, or a human checkpoint." },
    ],
  },
  {
    name: "extract-the-context",
    family: "context-extraction",
    familyLabel: "Context extraction",
    deck: "What the handoff forgot",
    description: "Pull durable context from a conversation, file, or handoff.",
    readTime: "4 min",
    maturity: "Validated",
    runs: "1.1k",
    version: "v1.9",
    tags: ["context", "handoff"],
    excerpt: "Context is not a transcript. It is the durable set of facts, constraints, and decisions that lets the next move happen without starting over.",
    sections: [
      { title: "Extract the durable", body: "Keep decisions, definitions, constraints, and open questions. Let the conversational scaffolding fall away." },
      { title: "Use it when", body: "A project has changed hands, a thread has become a source of truth, or the important detail is hiding in the ninth reply." },
    ],
  },
];

const maturityStyle: Record<Maturity, { text: string; background: string; border: string }> = {
  Ready: { text: "#a95236", background: "#f5dfd1", border: "#d69c84" },
  Validated: { text: "#2f6e63", background: "#dcece4", border: "#9bc2b3" },
  Experimental: { text: "#846735", background: "#eee5cf", border: "#cab98a" },
};

const initialCollections: Collection[] = [
  { id: "reading", name: "Reading list", note: "For the quiet hour", color: "#c55e3e", skills: ["okhp3-skill-cataloger", "extract-the-context"] },
  { id: "field-kit", name: "Field kit", note: "Reliable on the ground", color: "#4c8176", skills: ["capture-the-work", "fieldnote-to-process"] },
  { id: "foundry", name: "Foundry notes", note: "Before the next build", color: "#688ca0", skills: ["agent-blueprint"] },
];

export function ExploreE() {
  const [query, setQuery] = useState("");
  const [activeShelf, setActiveShelf] = useState<ShelfKey>("all");
  const [activeMaturity, setActiveMaturity] = useState<Maturity | "all">("all");
  const [selectedName, setSelectedName] = useState("okhp3-skill-cataloger");
  const [collections, setCollections] = useState(initialCollections);
  const [activeCollection, setActiveCollection] = useState("all");
  const [expanded, setExpanded] = useState<string[]>(["Why it exists"]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [copied, setCopied] = useState(false);

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchesShelf = activeShelf === "all" || skill.family === activeShelf;
      const matchesMaturity = activeMaturity === "all" || skill.maturity === activeMaturity;
      const matchesCollection = activeCollection === "all" || collections.find((collection) => collection.id === activeCollection)?.skills.includes(skill.name);
      const matchesQuery = !normalized || [skill.name, skill.familyLabel, skill.description, skill.deck, ...skill.tags].some((value) => value.toLowerCase().includes(normalized));
      return matchesShelf && matchesMaturity && matchesCollection && matchesQuery;
    });
  }, [activeCollection, activeMaturity, activeShelf, collections, query]);

  const selected = skills.find((skill) => skill.name === selectedName) ?? visibleSkills[0] ?? skills[0];
  const selectedStatus = maturityStyle[selected.maturity];
  const savedIn = collections.filter((collection) => collection.skills.includes(selected.name));

  function toggleSaved(collectionId: string) {
    setCollections((current) => current.map((collection) => collection.id === collectionId
      ? { ...collection, skills: collection.skills.includes(selected.name) ? collection.skills.filter((name) => name !== selected.name) : [...collection.skills, selected.name] }
      : collection));
  }

  function createCollection() {
    const cleanName = newCollectionName.trim();
    if (!cleanName) return;
    const id = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setCollections((current) => [...current, { id, name: cleanName, note: "A new corner of the shelf", color: "#bd8c42", skills: [selected.name] }]);
    setNewCollectionName("");
    setShowNewCollection(false);
    setActiveCollection(id);
  }

  function copyReference() {
    setCopied(true);
    if (navigator.clipboard) void navigator.clipboard.writeText(`forge://skills/${selected.name}`);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function resetView() {
    setQuery("");
    setActiveShelf("all");
    setActiveMaturity("all");
    setActiveCollection("all");
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden" style={{ background: "#eee9df", color: "#26322e", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.022]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E\")" }} />

      <header className="flex min-h-[68px] items-center justify-between border-b px-5 sm:px-8" style={{ borderColor: "#cfc6b8", background: "#e7e1d6" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: "#c55e3e", color: "#a95236" }}><Layers3 size={17} /></div>
          <div className="leading-none">
            <div className="text-[13px] font-bold tracking-[.18em]" style={{ color: "#26322e" }}>SKILLZ FORGE</div>
            <div className="mt-1 font-mono text-[8px] tracking-[.15em]" style={{ color: "#7f8177" }}>OVERKILL HILL P³ / READER</div>
          </div>
          <div className="hidden h-5 w-px sm:block" style={{ background: "#cfc6b8" }} />
          <span className="hidden font-mono text-[10px] uppercase tracking-[.14em] sm:block" style={{ color: "#777b70" }}>Explore / editorial index</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[10px] md:flex" style={{ color: "#4c8176" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4c8176" }} /> registry synced</div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px]" style={{ background: "#d9c3a7", color: "#80533d" }}>OH</div>
        </div>
      </header>

      <div className="mx-auto max-w-[1540px] px-4 pb-12 sm:px-7">
        <section className="border-b py-8 sm:py-11" style={{ borderColor: "#cfc6b8" }}>
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.22em]" style={{ color: "#a95236" }}><span className="h-px w-8" style={{ background: "#c55e3e" }} /> 02 / read the index</div>
              <h1 className="max-w-[760px] text-[clamp(37px,5.3vw,76px)] leading-[.91] tracking-[-.055em]" style={{ fontFamily: "Georgia, serif", color: "#26322e" }}>Choose by signal,<br /><em style={{ color: "#b2573b", fontStyle: "normal" }}>keep what matters.</em></h1>
              <p className="mt-5 max-w-[560px] text-[13px] leading-6" style={{ color: "#6f746c" }}>A slower view of the forge. Browse the shelves, open a contract, and save the ones worth returning to.</p>
            </div>
            <div className="flex items-end gap-7 border-l pl-5" style={{ borderColor: "#b8aa99" }}>
              <div><div className="font-mono text-[28px] leading-none" style={{ color: "#b2573b" }}>146</div><div className="mt-2 text-[9px] uppercase tracking-[.17em]" style={{ color: "#818077" }}>contracts indexed</div></div>
              <div><div className="font-mono text-[28px] leading-none" style={{ color: "#26322e" }}>{collections.reduce((total, collection) => total + collection.skills.length, 0)}</div><div className="mt-2 text-[9px] uppercase tracking-[.17em]" style={{ color: "#818077" }}>saved passages</div></div>
            </div>
          </div>
        </section>

        <section className="sticky top-0 z-20 -mx-1 border-b py-4 sm:mx-0" style={{ borderColor: "#cfc6b8", background: "rgba(238,233,223,.96)" }}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: "#b2573b" }} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the shelf by name, job, or tag…" className="h-11 w-full border bg-transparent pl-11 pr-24 text-[12px] outline-none placeholder:text-[#929188] focus:border-[#b2573b]" style={{ borderColor: query ? "#b2573b" : "#b8aa99", color: "#26322e" }} />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2"><kbd className="hidden border px-1.5 py-1 font-mono text-[9px] sm:block" style={{ borderColor: "#cfc6b8", color: "#88877e" }}><Command size={10} className="inline" /> K</kbd>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} style={{ color: "#88877e" }}><X size={14} /></button>}</div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button type="button" onClick={() => setShowCollections((value) => !value)} className="flex shrink-0 items-center gap-2 border px-3 py-2.5 text-[10px] uppercase tracking-[.08em] transition-colors" style={{ borderColor: showCollections ? "#b2573b" : "#b8aa99", background: showCollections ? "#f4ddd0" : "transparent", color: "#80533d" }}><BookmarkCheck size={13} /> saved collections <ChevronDown size={12} /></button>
              <button type="button" onClick={() => setShowFilters((value) => !value)} className="flex shrink-0 items-center gap-2 border px-3 py-2.5 text-[10px] uppercase tracking-[.08em] transition-colors" style={{ borderColor: showFilters ? "#4c8176" : "#b8aa99", background: showFilters ? "#deebe4" : "transparent", color: "#477368" }}><ListFilter size={13} /> refine</button>
              <button type="button" onClick={resetView} className="hidden shrink-0 px-2 py-2 text-[10px] uppercase tracking-[.1em] sm:block" style={{ color: "#85857d" }}>reset</button>
            </div>
          </div>
          {showCollections && (
            <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2 xl:grid-cols-4" style={{ borderColor: "#d8d0c4" }}>
              <button type="button" onClick={() => setActiveCollection("all")} className="flex items-center justify-between border p-3 text-left" style={{ borderColor: activeCollection === "all" ? "#b2573b" : "#cfc6b8", background: activeCollection === "all" ? "#f4ddd0" : "#f4f0e8" }}>
                <span><span className="block text-[11px] font-semibold">All saved</span><span className="mt-1 block font-mono text-[9px]" style={{ color: "#89877d" }}>Every marked passage</span></span><span className="font-mono text-[12px]" style={{ color: "#b2573b" }}>{collections.reduce((total, collection) => total + collection.skills.length, 0)}</span>
              </button>
              {collections.map((collection) => (
                <button key={collection.id} type="button" onClick={() => setActiveCollection(collection.id)} className="flex items-center justify-between border p-3 text-left" style={{ borderColor: activeCollection === collection.id ? collection.color : "#cfc6b8", background: activeCollection === collection.id ? "#f5eadc" : "#f4f0e8" }}>
                  <span className="min-w-0"><span className="flex items-center gap-2 text-[11px] font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: collection.color }} />{collection.name}</span><span className="mt-1 block truncate font-mono text-[9px]" style={{ color: "#89877d" }}>{collection.note}</span></span><span className="font-mono text-[12px]" style={{ color: collection.color }}>{collection.skills.length}</span>
                </button>
              ))}
            </div>
          )}
          {showFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "#d8d0c4" }}>
              <span className="mr-1 font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: "#89877d" }}>maturity</span>
              {(["all", "Ready", "Validated", "Experimental"] as const).map((maturity) => <button key={maturity} type="button" onClick={() => setActiveMaturity(maturity)} className="border px-2.5 py-1.5 text-[10px]" style={{ borderColor: activeMaturity === maturity ? "#4c8176" : "#cfc6b8", background: activeMaturity === maturity ? "#deebe4" : "transparent", color: activeMaturity === maturity ? "#2f6e63" : "#777b70" }}>{maturity === "all" ? "Any stage" : maturity}</button>)}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[188px_minmax(0,1fr)_390px] lg:items-start">
          <aside className="hidden lg:block">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.15em]" style={{ color: "#818077" }}><Library size={13} /> shelves</div>
            <nav className="space-y-1">
              {shelves.map((shelf) => <button key={shelf.key} type="button" onClick={() => { setActiveShelf(shelf.key); setActiveCollection("all"); }} className="group flex w-full items-start justify-between gap-2 border-l-2 px-3 py-2.5 text-left transition-colors" style={{ borderColor: activeShelf === shelf.key ? shelf.color : "transparent", background: activeShelf === shelf.key ? "#e3ddd1" : "transparent", color: activeShelf === shelf.key ? "#26322e" : "#777b70" }}><span className="text-[11px] leading-4">{shelf.label}</span><span className="font-mono text-[9px]" style={{ color: activeShelf === shelf.key ? shelf.color : "#aaa69d" }}>{shelf.count}</span></button>)}
            </nav>
            <div className="mt-7 border-t pt-4" style={{ borderColor: "#cfc6b8" }}>
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: "#818077" }}>your shelf</div>
              {collections.map((collection) => <button key={collection.id} type="button" onClick={() => { setActiveCollection(collection.id); setActiveShelf("all"); }} className="mb-2 flex w-full items-center gap-2 text-left text-[10px]" style={{ color: "#626b63" }}><span className="h-2 w-2 rounded-full" style={{ background: collection.color }} />{collection.name}<span className="ml-auto font-mono text-[9px]" style={{ color: "#aaa69d" }}>{collection.skills.length}</span></button>)}
              <button type="button" onClick={() => setShowNewCollection(true)} className="mt-2 flex items-center gap-2 text-[10px]" style={{ color: "#a95236" }}><FolderPlus size={12} /> new collection</button>
            </div>
          </aside>

          <section className="min-w-0 border" style={{ borderColor: "#cfc6b8", background: "#f7f3eb" }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5" style={{ borderColor: "#d8d0c4" }}>
              <div className="flex items-center gap-2"><BookOpen size={14} style={{ color: "#b2573b" }} /><span className="font-mono text-[10px] uppercase tracking-[.16em]" style={{ color: "#646d65" }}>{activeCollection === "all" ? "Live contract set" : collections.find((collection) => collection.id === activeCollection)?.name}</span><span className="font-mono text-[10px]" style={{ color: "#a09c91" }}>· {visibleSkills.length} showing</span></div>
              <span className="font-mono text-[9px] uppercase tracking-[.12em]" style={{ color: "#aaa69d" }}>ordered by signal</span>
            </div>
            <div className="hidden grid-cols-[minmax(0,1.5fr)_120px_94px_58px_20px] gap-3 border-b px-4 py-2 font-mono text-[9px] uppercase tracking-[.14em] sm:grid" style={{ borderColor: "#d8d0c4", color: "#aaa69d" }}><span>contract / field note</span><span>shelf</span><span>stage</span><span>read</span><span /></div>
            <div>
              {visibleSkills.map((skill, index) => {
                const active = selected.name === skill.name;
                const status = maturityStyle[skill.maturity];
                return <button key={skill.name} type="button" onClick={() => { setSelectedName(skill.name); setExpanded([skill.sections[0].title]); }} className="group grid w-full grid-cols-[minmax(0,1fr)_26px] gap-3 border-b px-4 py-4 text-left transition-colors sm:grid-cols-[minmax(0,1.5fr)_120px_94px_58px_20px] sm:items-center" style={{ borderColor: "#e1dbd0", background: active ? "#f1e1d7" : "transparent", boxShadow: active ? "inset 3px 0 #c55e3e" : "none" }}>
                  <div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-[11px] font-semibold" style={{ color: active ? "#8f4935" : "#35423c" }}>{skill.name}</span>{index < 2 && <Sparkles size={11} className="shrink-0" style={{ color: "#bd8c42" }} />}</div><div className="mt-1 truncate text-[11px]" style={{ color: "#81877f" }}>{skill.description}</div><div className="mt-2 flex items-center gap-2 sm:hidden"><span className="text-[9px]" style={{ color: shelves.find((shelf) => shelf.key === skill.family)?.color }}>{skill.familyLabel}</span><span className="text-[9px]" style={{ color: status.text }}>· {skill.maturity}</span></div></div>
                  <span className="hidden truncate text-[10px] sm:block" style={{ color: shelves.find((shelf) => shelf.key === skill.family)?.color }}>{skill.familyLabel}</span>
                  <span className="hidden w-fit border px-1.5 py-1 text-[9px] sm:block" style={{ color: status.text, borderColor: status.border, background: status.background }}>{skill.maturity}</span>
                  <span className="hidden items-center gap-1 font-mono text-[10px] sm:flex" style={{ color: "#8e9087" }}><Clock3 size={11} /> {skill.readTime}</span>
                  <ArrowUpRight size={14} className="mt-1 transition-colors group-hover:text-[#b2573b]" style={{ color: active ? "#b2573b" : "#a7a49a" }} />
                </button>;
              })}
              {visibleSkills.length === 0 && <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center"><Search size={25} style={{ color: "#b2573b" }} /><div className="mt-3 text-[18px]" style={{ fontFamily: "Georgia, serif", color: "#35423c" }}>Nothing on this shelf.</div><p className="mt-2 text-[11px]" style={{ color: "#85877f" }}>Try another signal, or return to the complete index.</p><button type="button" onClick={resetView} className="mt-4 border px-3 py-2 text-[10px] uppercase tracking-[.12em]" style={{ borderColor: "#b2573b", color: "#a95236" }}>Reset view</button></div>}
            </div>
          </section>

          <aside className="self-start border lg:sticky lg:top-[90px]" style={{ borderColor: "#b8aa99", background: "#e5ddd1" }}>
            <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: "#cfc6b8" }}><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em]" style={{ color: "#59655d" }}><FileText size={13} style={{ color: "#b2573b" }} /> reading pane</div><div className="flex items-center gap-2"><span className="font-mono text-[9px]" style={{ color: "#99958b" }}>open / 01</span><button type="button" aria-label="Pane options" className="sm:hidden" style={{ color: "#777b70" }}><Menu size={15} /></button><MoreHorizontal size={15} className="hidden sm:block" style={{ color: "#99958b" }} /></div></div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3"><div className="font-mono text-[9px] uppercase tracking-[.17em]" style={{ color: shelves.find((shelf) => shelf.key === selected.family)?.color }}>{selected.familyLabel} / {selected.deck}</div><span className="border px-2 py-1 font-mono text-[9px]" style={{ color: selectedStatus.text, borderColor: selectedStatus.border, background: selectedStatus.background }}>{selected.maturity}</span></div>
              <h2 className="break-words text-[29px] leading-[.99] tracking-[-.035em]" style={{ fontFamily: "Georgia, serif", color: "#26322e" }}>{selected.name}</h2>
              <p className="mt-4 text-[13px] leading-6" style={{ color: "#646d65" }}>{selected.excerpt}</p>
              <div className="mt-5 flex items-center gap-4 border-y py-3 font-mono text-[9px] uppercase tracking-[.1em]" style={{ borderColor: "#cfc6b8", color: "#85877f" }}><span><strong className="font-normal" style={{ color: "#a95236" }}>{selected.version}</strong> version</span><span><strong className="font-normal" style={{ color: "#26322e" }}>{selected.runs}</strong> observed runs</span><span><strong className="font-normal" style={{ color: "#26322e" }}>{selected.readTime}</strong> read</span></div>
              <div className="mt-5 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <span key={tag} className="flex items-center gap-1 border px-2 py-1 font-mono text-[9px]" style={{ borderColor: "#c7b6a4", background: "#eee7db", color: "#6c756d" }}><Tag size={10} />{tag}</span>)}</div>
              <div className="mt-6 space-y-1.5">
                {selected.sections.map((section, index) => {
                  const isOpen = expanded.includes(section.title);
                  return <div key={section.title} className="border-t" style={{ borderColor: "#cfc6b8" }}><button type="button" onClick={() => setExpanded((current) => isOpen ? current.filter((title) => title !== section.title) : [...current, section.title])} className="flex w-full items-center justify-between py-3 text-left text-[11px] font-semibold" style={{ color: "#4b5b52" }}><span className="flex items-center gap-2"><span className="font-mono text-[9px]" style={{ color: "#b2573b" }}>0{index + 1}</span>{section.title}</span>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button>{isOpen && <p className="pb-3 pl-7 text-[11px] leading-5" style={{ color: "#70776f" }}>{section.body}</p>}</div>;
                })}
              </div>
              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setShowCollections(true)} className="flex flex-1 items-center justify-center gap-2 border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[.09em] transition-colors" style={{ borderColor: savedIn.length ? "#4c8176" : "#b2573b", background: savedIn.length ? "#dcece4" : "#b2573b", color: savedIn.length ? "#2f6e63" : "#f7f3eb" }}>{savedIn.length ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}{savedIn.length ? `Saved in ${savedIn.length}` : "Save passage"}</button>
                <button type="button" onClick={copyReference} aria-label="Copy skill reference" className="flex w-11 items-center justify-center border transition-colors hover:border-[#b2573b]" style={{ borderColor: "#b8aa99", color: copied ? "#2f6e63" : "#777b70" }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
              </div>
              {showCollections && <div className="mt-3 border p-3" style={{ borderColor: "#cfc6b8", background: "#f0e9dd" }}><div className="mb-2 font-mono text-[9px] uppercase tracking-[.13em]" style={{ color: "#85877f" }}>Save to a collection</div>{collections.map((collection) => <button key={collection.id} type="button" onClick={() => toggleSaved(collection.id)} className="flex w-full items-center gap-2 py-1.5 text-left text-[10px]" style={{ color: "#536259" }}><span className="flex h-4 w-4 items-center justify-center border" style={{ borderColor: collection.skills.includes(selected.name) ? collection.color : "#b8aa99", background: collection.skills.includes(selected.name) ? collection.color : "transparent", color: "#f7f3eb" }}>{collection.skills.includes(selected.name) && <Check size={11} />}</span>{collection.name}</button>)}<button type="button" onClick={() => setShowNewCollection(true)} className="mt-2 flex items-center gap-2 border-t pt-2 text-[10px]" style={{ borderColor: "#d8d0c4", color: "#a95236" }}><Plus size={12} /> Create collection</button></div>}
              <div className="mt-5 flex items-start gap-2 border-t pt-4 text-[10px] leading-4" style={{ borderColor: "#cfc6b8", color: "#878980" }}><ArrowUpRight size={13} className="mt-0.5 shrink-0" style={{ color: "#b2573b" }} />Open a row to replace this reading pane. Sections stay closed until you ask for the next layer.</div>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "#cfc6b8", background: "#dcd2c5" }}><span className="truncate font-mono text-[9px] uppercase tracking-[.09em]" style={{ color: "#88877d" }}>forge://skills/{selected.name}</span><button type="button" aria-label="Copy reference" onClick={copyReference} style={{ color: "#a95236" }}><Copy size={12} /></button></div>
          </aside>
        </div>
      </div>

      {showNewCollection && <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#26322e]/25 px-5" onClick={() => setShowNewCollection(false)}><div className="w-full max-w-[390px] border p-5 shadow-[0_16px_40px_rgba(38,50,46,.16)]" style={{ borderColor: "#b8aa99", background: "#f7f3eb" }} onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[.15em]" style={{ color: "#b2573b" }}>New shelf</div><h3 className="mt-2 text-[24px]" style={{ fontFamily: "Georgia, serif", color: "#26322e" }}>Name your collection.</h3></div><button type="button" aria-label="Close new collection" onClick={() => setShowNewCollection(false)} style={{ color: "#85877f" }}><X size={16} /></button></div><p className="mt-2 text-[11px] leading-5" style={{ color: "#777b70" }}>The current passage will be saved there first.</p><input autoFocus value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createCollection(); }} placeholder="e.g. Monday handoffs" className="mt-5 h-11 w-full border bg-transparent px-3 text-[12px] outline-none focus:border-[#b2573b]" style={{ borderColor: "#b8aa99", color: "#26322e" }} /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowNewCollection(false)} className="px-3 py-2 text-[10px] uppercase tracking-[.1em]" style={{ color: "#777b70" }}>Cancel</button><button type="button" onClick={createCollection} className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.1em]" style={{ background: "#b2573b", color: "#f7f3eb" }}><Plus size={13} /> Add shelf</button></div></div></div>}
    </main>
  );
}

export default ExploreE;