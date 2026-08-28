# Enabling code-intelligence / LSP navigation

The recon phase can navigate a codebase in one of two ways: **grep + sub-agents** (the default,
no setup) or **code-intelligence / LSP** (symbol-level: go-to-definition, find-references,
hover). This guide sets up the LSP option using **[lsp-mcp](https://github.com/mickeyinfoshan/lsp-mcp)**,
a lightweight bridge between MCP and the Language Server Protocol.

> ## ⚠️ A language server must be installed **and running** for this option to work
>
> The LSP navigation mode is only actually available when **all** of the following are true:
>
> 1. A **language server** for your repo's language is installed (e.g. `gopls`,
>    `typescript-language-server`, `pylsp`).
> 2. The **lsp-mcp bridge** is built and registered with your agent, and it can launch that
>    language server.
> 3. The language server can **start and index your project** (the bridge runs it as a child
>    process on the first tool call).
>
> If any of these isn't in place, the `lsp_*` tools won't be present, so the skill will report
> that LSP isn't available and **fall back to grep**. LSP is an opt-in enhancement, never a
> requirement — the skill runs fine without it.

---

## What it gives the skill

lsp-mcp exposes these tools; recon uses them for precise structure and relationship tracing
instead of text search:

| Tool | Use in recon |
|---|---|
| `lsp_definition` | Resolve where a symbol is defined |
| `lsp_references` | Find everywhere a rule/entity/service is used (workflow tracing, impact) |
| `lsp_hover` | Type/signature/doc for a symbol |
| `lsp_completion` | Enumerate members/API surface |

Text patterns (enum values, error/validation message strings) are still best found with grep,
so the two modes complement each other.

---

## Setup

### 1. Install the language server(s) for your repo

Install only what your target codebase needs. Examples:

```bash
# Go
go install golang.org/x/tools/gopls@latest

# TypeScript / JavaScript
npm install -g typescript-language-server typescript

# Python
pip install python-lsp-server
```

Verify each is on your `PATH` (e.g. `gopls version`). **If the language server isn't installed
and runnable, the LSP option cannot work** — this is the most common cause of "LSP unavailable".

### 2. Build the lsp-mcp bridge

```bash
git clone https://github.com/mickeyinfoshan/lsp-mcp.git
cd lsp-mcp
make build          # binary -> ./bin/lsp-mcp
```

### 3. Configure which language servers the bridge launches

Copy the example next to this doc, [`lsp-mcp/config.yaml`](lsp-mcp/config.yaml), and adjust it
to match the servers you installed. Keep only the languages you need.

### 4. Register the bridge with your agent

**Claude Code** — add to `~/.claude/settings.json` (see
[`lsp-mcp/claude-code.mcp.json`](lsp-mcp/claude-code.mcp.json)); replace the placeholder paths
with the **absolute** paths to your built binary and config:

```json
{
  "mcpServers": {
    "lsp": {
      "command": "/absolute/path/to/lsp-mcp/bin/lsp-mcp",
      "args": ["-config", "/absolute/path/to/lsp-mcp/config/config.yaml"]
    }
  }
}
```

**Cursor / Windsurf / any MCP client** — point your MCP config at the same binary with the
`-config` flag, following the same shape.

### 5. Confirm it's live

Restart the agent and check the `lsp` MCP server is connected and the `lsp_*` tools are
listed. If they're missing, the language server or the bridge isn't running — the skill will
use grep until that's fixed.

---

## How the skill uses it

At the start of recon the skill asks how to navigate. If you choose LSP:

- It checks that the `lsp_*` tools are actually present. If not, it tells you and falls back to
  grep rather than stalling.
- It records the chosen mode (and that lsp-mcp was used) in `docs/_discovery/recon-manifest.md`
  so the provenance trail reflects how findings were obtained.
- It can still use grep for literal-string lookups where that's faster.

---

## Heavier alternative

If you want a more batteries-included, multi-language option that manages language servers for
you, **[Serena](https://github.com/oraios/serena)** is an LSP-backed MCP covering ~40
languages. Same principle and the same running-language-server requirement; more setup surface,
less per-language wiring. lsp-mcp is featured here for being small and transparent.

---

## Troubleshooting

- **`lsp_*` tools not showing:** the bridge isn't registered or failed to start — check the
  agent's MCP server list and the bridge logs (`./logs/lsp-mcp.log`).
- **Empty definition/references:** point `line`/`character` at the symbol itself; ensure the
  project's build config (e.g. `tsconfig.json`, Go module) is present so the server can index.
- **Language server won't start:** run the command manually to confirm it's installed and on
  `PATH`.
