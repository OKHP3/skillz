import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Copy,
  FileCode2,
  FlaskConical,
  GitBranch,
  History,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from "lucide-react";

type SkillStatus = "Ready" | "Validated" | "Experimental";

type SkillOption = {
  name: string;
  family: string;
  description: string;
  status: SkillStatus;
  version: string;
  runs: string;
  tint: string;
};

const skillOptions: SkillOption[] = [
  {
    name: "skill-contract-checker",
    family: "Agent foundry",
    description: "Check a SKILL.md for inputs, exits, failure paths, and drift.",
    status: "Validated",
    version: "v2.2",
    runs: "1.6k",
    tint: "#c47a44",
  },
  {
    name: "okhp3-brief-to-action",
    family: "Universal",
    description: "Turn an ambiguous brief into a sequenced, executable plan.",
    status: "Ready",
    version: "v1.8",
    runs: "1.8k",
    tint: "#d8a75c",
  },
  {
    name: "extract-the-context",
    family: "Context extraction",
    description: "Pull durable context from a conversation, file, or handoff.",
    status: "Validated",
    version: "v1.9",
    runs: "1.1k",
    tint: "#7ca7bf",
  },
];

const contractLines = [
  ["name", "skill-contract-checker"],
  ["version", "2.2.0"],
  ["purpose", "Validate a skill contract before it enters a run."],
  ["input", "skill_markdown"],
  ["input", "runtime_context"],
  ["output", "validation_report"],
  ["exit", "contract_valid"],
];

const baseHistory = [
  { time: "09:42:18", label: "Release gate", result: "passed", detail: "12 checks · 148ms" },
  { time: "Yesterday", label: "Manual review", result: "passed", detail: "12 checks · 201ms" },
  { time: "Mon, 14:06", label: "Schema drift", result: "warning", detail: "1 advisory · 96ms" },
];

function statusColor(status: SkillStatus) {
  if (status === "Ready") return "#e2a14e";
  if (status === "Experimental") return "#d58b79";
  return "#7dc2ad";
}

export function ForgeWorkbench() {
  const [activeSkill, setActiveSkill] = useState(skillOptions[0]);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"contract" | "inputs">("contract");
  const [input, setInput] = useState(
    "Review this SKILL.md and flag missing exits, unsafe assumptions, or version drift.",
  );
  const [context, setContext] = useState("release-gate / production");
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState(baseHistory);
  const [consoleLines, setConsoleLines] = useState([
    { tone: "muted", text: "forge://skill-contract-checker · ready" },
    { tone: "muted", text: "Select Run to stream a live validation." },
  ]);

  const filteredSkills = useMemo(
    () =>
      skillOptions.filter((skill) =>
        `${skill.name} ${skill.family}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const runSkill = () => {
    if (running) return;
    setRunning(true);
    setRunCount((count) => count + 1);
    setConsoleLines([
      { tone: "accent", text: `> run ${activeSkill.name}@${activeSkill.version}` },
      { tone: "muted", text: "loading contract manifest..." },
      { tone: "muted", text: "checking input shape · checking exits..." },
    ]);
    window.setTimeout(() => {
      setRunning(false);
      setConsoleLines([
        { tone: "accent", text: `> run ${activeSkill.name}@${activeSkill.version}` },
        { tone: "success", text: "✓ contract_valid" },
        { tone: "success", text: "✓ 12 checks passed in 148ms" },
        { tone: "muted", text: "report://run-" + String(824 + runCount + 1).padStart(3, "0") },
      ]);
      setHistory((items) => [
        { time: "now", label: "Workbench run", result: "passed", detail: "12 checks · 148ms" },
        ...items,
      ]);
    }, 900);
  };

  const copyContract = () => {
    setCopied(true);
    showNotice("Contract copied to clipboard");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const selectSkill = (skill: SkillOption) => {
    setActiveSkill(skill);
    setConsoleLines([
      { tone: "muted", text: `forge://${skill.name} · ready` },
      { tone: "muted", text: "Select Run to stream a live validation." },
    ]);
    setNotice("");
  };

  return (
    <div
      className="min-h-[100dvh] w-full overflow-hidden"
      style={{
        background: "#211b18",
        color: "#eee7dc",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <header
        className="flex min-h-[62px] items-center justify-between border-b px-4 md:px-6"
        style={{ borderColor: "#44362d", background: "#1b1715" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-sm border"
            style={{ borderColor: "#c46a2c", color: "#e5a54f" }}
          >
            <Terminal size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[12px] font-semibold tracking-[.18em] text-[#f5efe6]">
              SKILLZ FORGE
            </div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[.16em] text-[#807267]">
              workbench / contract runtime
            </div>
          </div>
          <div className="ml-2 hidden h-5 w-px bg-[#44362d] sm:block" />
          <div className="hidden items-center gap-2 text-[10px] text-[#8d7c6f] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#79bca7]" />
            Registry synced
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-sm border border-[#44362d] px-2.5 py-1.5 font-mono text-[9px] text-[#8d7c6f] md:block">
            RUNS <span className="text-[#e5a54f]">{activeSkill.runs}</span>
          </div>
          <button
            type="button"
            onClick={() => showNotice("Workbench pinned to your forge")}
            className="flex items-center gap-2 rounded-sm border border-[#65452f] bg-[#39241d] px-3 py-2 text-[10px] font-semibold text-[#e5a54f] transition-colors hover:bg-[#4a2d22]"
          >
            <Plus size={13} /> Add to forge
          </button>
          <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#5a3c2f] font-mono text-[10px] text-[#e5a54f]">
            OH
          </div>
        </div>
      </header>

      <div className="border-b border-[#44362d] bg-[#241d19] px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-[10px]">
            <span className="font-mono uppercase tracking-[.18em] text-[#bf6e38]">Workbench</span>
            <span className="text-[#66574d]">/</span>
            <span className="truncate font-mono text-[#dfd4c7]">{activeSkill.name}</span>
            <span className="rounded-sm border border-[#5a4438] px-1.5 py-0.5 font-mono text-[9px] text-[#a8917f]">
              {activeSkill.version}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-[260px] sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#806f61]" size={13} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Switch skill..."
                className="h-8 w-full rounded-sm border border-[#493a31] bg-[#1b1715] pl-8 pr-3 text-[10px] text-[#f0e7dc] outline-none placeholder:text-[#68594f] focus:border-[#b96534]"
              />
            </div>
            <button
              type="button"
              onClick={() => showNotice("Run history refreshed")}
              className="flex h-8 items-center gap-1.5 rounded-sm border border-[#493a31] px-2.5 text-[10px] text-[#aa9888] hover:bg-[#342822] hover:text-[#eee7dc]"
            >
              <RotateCcw size={12} /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <main className="grid min-h-[calc(100dvh-111px)] grid-cols-1 xl:grid-cols-[245px_minmax(420px,1fr)_352px]">
        <aside className="border-b border-[#44362d] bg-[#241d19] p-4 xl:border-b-0 xl:border-r">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#8c7a6b]">Selected skill</div>
              <div className="mt-1 text-[10px] text-[#67584e]">3 contracts in focus</div>
            </div>
            <Activity size={14} className="text-[#bd6b38]" />
          </div>
          <div className="space-y-1.5">
            {filteredSkills.map((skill) => (
              <button
                type="button"
                key={skill.name}
                onClick={() => selectSkill(skill)}
                className="group w-full rounded-sm border p-3 text-left transition-colors"
                style={{
                  borderColor: activeSkill.name === skill.name ? "#795039" : "#3e322b",
                  background: activeSkill.name === skill.name ? "#35241e" : "#211b18",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate font-mono text-[10px] font-semibold text-[#eee7dc]">{skill.name}</span>
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: statusColor(skill.status) }} />
                </div>
                <div className="mt-2 text-[10px] leading-[1.45] text-[#907f70]">{skill.family} · {skill.version}</div>
                {activeSkill.name === skill.name && (
                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.14em] text-[#d8974b]">
                    <CircleDot size={10} /> Active contract
                  </div>
                )}
              </button>
            ))}
          </div>
          {filteredSkills.length === 0 && (
            <div className="rounded-sm border border-dashed border-[#554239] px-3 py-5 text-center text-[10px] text-[#8c7a6b]">
              No matching contracts.
            </div>
          )}
          <div className="mt-5 border-t border-[#3c3029] pt-4">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[.18em] text-[#79695d]">Contract health</div>
            <div className="space-y-2.5">
              {[
                ["Required inputs", "2 / 2", "#7dc2ad"],
                ["Exit paths", "4 / 4", "#7dc2ad"],
                ["Drift risk", "low", "#e2a14e"],
              ].map(([label, value, color]) => (
                <div className="flex items-center justify-between text-[10px]" key={label}>
                  <span className="text-[#907f70]">{label}</span>
                  <span className="font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 border-b border-[#44362d] bg-[#211b18] xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between border-b border-[#44362d] px-5 py-4 md:px-6">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 size={15} className="text-[#c8743b]" />
                <h1 className="font-mono text-[13px] font-semibold text-[#f4ede4]">{activeSkill.name}</h1>
              </div>
              <p className="mt-1 text-[10px] text-[#867467]">{activeSkill.description}</p>
            </div>
            <button type="button" onClick={copyContract} aria-label="Copy contract" className="rounded-sm p-2 text-[#8e7b6b] hover:bg-[#352822] hover:text-[#e3a050]">
              {copied ? <Check size={14} className="text-[#7dc2ad]" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="flex border-b border-[#44362d] px-5 md:px-6">
            {[
              { key: "contract" as const, label: "Contract preview", icon: FileCode2 },
              { key: "inputs" as const, label: "Inputs", icon: Zap },
            ].map(({ key, label, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => setPanel(key)}
                className="mr-5 flex items-center gap-2 border-b-2 py-3 text-[10px] font-semibold transition-colors"
                style={{
                  borderColor: panel === key ? "#c46a2c" : "transparent",
                  color: panel === key ? "#f1e7dc" : "#806f61",
                }}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {panel === "contract" ? (
            <div className="p-5 md:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-[#476858] bg-[#233b31] px-2 py-1 text-[9px] font-semibold text-[#87c6af]">
                  <CheckCircle2 size={11} className="mr-1 inline" /> {activeSkill.status}
                </span>
                <span className="rounded-sm border border-[#554239] px-2 py-1 font-mono text-[9px] text-[#a69180]">SKILL.md</span>
                <span className="rounded-sm border border-[#554239] px-2 py-1 font-mono text-[9px] text-[#a69180]">MIT</span>
              </div>
              <div className="overflow-hidden rounded-sm border border-[#46372f] bg-[#1b1715]">
                <div className="flex items-center justify-between border-b border-[#3d3029] px-3 py-2">
                  <span className="font-mono text-[9px] text-[#7d6c5e]">contract.yaml</span>
                  <span className="font-mono text-[9px] text-[#67574b]">read-only</span>
                </div>
                <div className="space-y-0.5 px-3 py-4 font-mono text-[10px] leading-[1.85] md:px-5 md:text-[11px]">
                  <div><span className="mr-4 text-[#705e52]">01</span><span className="text-[#d6a267]">contract</span><span className="text-[#b9aa9c]">:</span></div>
                  {contractLines.map(([key, value], index) => (
                    <div key={`${key}-${index}`} className="pl-5">
                      <span className="mr-2 text-[#7db3a6]">{key}</span><span className="text-[#b9aa9c]">:</span>{" "}
                      <span className={key === "purpose" ? "text-[#d9c2a9]" : "text-[#d1a46c]"}>{value}</span>
                    </div>
                  ))}
                  <div><span className="mr-4 text-[#705e52]">11</span><span className="text-[#827266]"># all exits return a typed report</span></div>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  ["Owner", "Overkill Hill"],
                  ["Last changed", "2d ago"],
                  ["Dependencies", "none"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-sm border border-[#3e322b] bg-[#241d19] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-[.14em] text-[#6f5f54]">{label}</div>
                    <div className="mt-1.5 text-[10px] text-[#cbbbad]">{value}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPanel("inputs")}
                className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-[#d99a4c] hover:text-[#efbb6f]"
              >
                Configure inputs <ChevronDown size={13} className="-rotate-90" />
              </button>
            </div>
          ) : (
            <div className="p-5 md:p-6">
              <div className="mb-5 rounded-sm border border-[#664630] bg-[#36251d] p-3 text-[10px] leading-[1.5] text-[#c8ae95]">
                <AlertTriangle size={13} className="mr-2 inline text-[#d99a4c]" />
                Inputs are passed to the contract exactly as written. Keep context specific and observable.
              </div>
              <label className="block">
                <span className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em] text-[#8c796a]">
                  skill_markdown <span className="text-[#6d5d51]">required</span>
                </span>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="min-h-[134px] w-full resize-y rounded-sm border border-[#4c3a30] bg-[#1b1715] p-3 font-mono text-[11px] leading-[1.55] text-[#e8ded1] outline-none placeholder:text-[#69594f] focus:border-[#bb6735]"
                />
              </label>
              <label className="mt-5 block">
                <span className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em] text-[#8c796a]">
                  runtime_context <span className="text-[#6d5d51]">optional</span>
                </span>
                <input
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  className="h-10 w-full rounded-sm border border-[#4c3a30] bg-[#1b1715] px-3 font-mono text-[11px] text-[#e8ded1] outline-none focus:border-[#bb6735]"
                />
              </label>
              <div className="mt-5 flex items-center justify-between">
                <button type="button" onClick={() => { setInput("Review this SKILL.md and flag missing exits, unsafe assumptions, or version drift."); setContext("release-gate / production"); }} className="flex items-center gap-2 text-[10px] text-[#887668] hover:text-[#d1ba9e]">
                  <RotateCcw size={12} /> Reset example
                </button>
                <button type="button" onClick={runSkill} className="flex items-center gap-2 rounded-sm bg-[#c46a2c] px-4 py-2.5 text-[10px] font-semibold text-[#1b1715] hover:bg-[#e2a14e]">
                  <Play size={12} fill="currentColor" /> Run validation
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-[#44362d] px-5 py-4 md:px-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#8c796a]">
              <History size={12} /> Validation history
            </div>
            <div className="space-y-2">
              {history.slice(0, 3).map((item, index) => (
                <div className="flex items-center gap-3 rounded-sm border border-[#3b3029] bg-[#241d19] px-3 py-2.5" key={`${item.time}-${index}`}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: item.result === "warning" ? "#4a3425" : "#263f35" }}>
                    {item.result === "warning" ? <AlertTriangle size={12} className="text-[#dfa45d]" /> : <Check size={12} className="text-[#7dc2ad]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-[#d8cabc]">{item.label}</div>
                    <div className="mt-0.5 font-mono text-[9px] text-[#736357]">{item.detail}</div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px] text-[#75655a]"><Clock3 size={10} /> {item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex min-h-[420px] min-w-0 flex-col bg-[#1b1715]">
          <div className="flex items-center justify-between border-b border-[#44362d] px-5 py-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-[#c7743a]" />
              <div>
                <div className="text-[11px] font-semibold text-[#eee7dc]">Live run console</div>
                <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[.15em] text-[#766559]">stream / stdout</div>
              </div>
            </div>
            <button type="button" onClick={() => setConsoleLines([])} className="rounded-sm p-1.5 text-[#78675b] hover:bg-[#352822] hover:text-[#e3a050]" aria-label="Clear console">
              <X size={13} />
            </button>
          </div>
          <div className="flex-1 p-4 md:p-5">
            <div className="flex items-center justify-between border-b border-[#3c3029] pb-3">
              <span className="font-mono text-[9px] text-[#887466]">INPUT PAYLOAD</span>
              <span className="font-mono text-[9px] text-[#d79a4f]">{input.length} chars</span>
            </div>
            <div className="mt-3 rounded-sm border border-[#3e322b] bg-[#241d19] p-3 font-mono text-[10px] leading-[1.55] text-[#a99787]">
              <div><span className="text-[#79685b]">skill_markdown:</span> “{input.slice(0, 74)}{input.length > 74 ? "…" : ""}”</div>
              <div className="mt-2"><span className="text-[#79685b]">runtime_context:</span> {context}</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-[#3c3029] pb-3">
              <span className="font-mono text-[9px] text-[#887466]">OUTPUT</span>
              <span className={`flex items-center gap-1 font-mono text-[9px] ${running ? "text-[#e2a14e]" : "text-[#79bca7]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${running ? "bg-[#e2a14e]" : "bg-[#79bca7]"}`} /> {running ? "running" : "idle"}
              </span>
            </div>
            <div className="mt-3 min-h-[190px] rounded-sm border border-[#3e322b] bg-[#151210] p-3 font-mono text-[10px] leading-[1.75]">
              {consoleLines.length > 0 ? consoleLines.map((line, index) => (
                <div
                  key={`${line.text}-${index}`}
                  className={line.tone === "success" ? "text-[#7dc2ad]" : line.tone === "accent" ? "text-[#dfa05a]" : "text-[#8d7b6d]"}
                >
                  {line.text}
                </div>
              )) : <span className="text-[#63544b]">console cleared.</span>}
              {running && <span className="mt-2 inline-block h-3 w-1.5 animate-pulse bg-[#d99a4c]" />}
            </div>
          </div>
          <div className="border-t border-[#44362d] p-4 md:p-5">
            <button
              type="button"
              onClick={runSkill}
              disabled={running}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#c46a2c] text-[11px] font-semibold text-[#1b1715] transition-colors hover:bg-[#e2a14e] disabled:cursor-wait disabled:opacity-60"
            >
              <Play size={14} fill="currentColor" /> {running ? "Running contract..." : "Run contract"}
            </button>
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-[#6f5e53]">
              <span className="flex items-center gap-1.5"><GitBranch size={11} /> main / clean</span>
              <span>attempt {runCount + 1}</span>
            </div>
          </div>
        </aside>
      </main>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-sm border border-[#6b4a35] bg-[#34241d] px-4 py-3 text-[10px] text-[#e1c09a] shadow-xl">
          <ShieldCheck size={13} className="text-[#7dc2ad]" /> {notice}
        </div>
      )}
    </div>
  );
}

export default ForgeWorkbench;