# Phase 0 — Pre-check

**Role:** Senior Software Engineer.
**Goal:** Orient, set up resumable working state, and gather what the existing documentation
says about the system — capturing it as input to **verify against the code**, since
documentation naturally drifts from the code over time.

Do not write onboarding docs in this phase. Only gather and set up state.

---

## 1. Resume or initialise working state

Check for prior state and resume if present:

- If `docs/_discovery/discovery-state.md` exists, read it and continue from where the last
  session left off.
- If `docs/_discovery/recon-manifest.md` exists, run the **freshness check**: compare the
  recorded file hashes/timestamps against the current tree. Note any drift and mark affected
  areas for re-recon.

If neither exists, create `docs/_discovery/` and initialise both files from the templates
(`templates/discovery-state.md`, `templates/recon-manifest.md`).

---

## 2. Confirm scope and mode

- Confirm the target: whole repo, or a named subsystem/module.
- Confirm the mode: **full** (a BA/PO/SME is available) or **code-only** (none yet).
- Confirm whether optional inputs are available (git tooling, code-intelligence / LSP server,
  sub-agents). Record what is and isn't available in the recon manifest. The **navigation
  mode** (grep + sub-agents vs code-intelligence / LSP) is offered to the user at the start of
  recon — note here whether an LSP server exists so that choice is informed.

State the scope, mode and available inputs back to the user before proceeding.

---

## 3. Discover existing documentation

Find and read everything that describes the system, to reconcile it against the code:

- `README*` at every level (root and per-module).
- `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `CONTRIBUTING.md`, `ARCHITECTURE.md`.
- Anything under an existing `docs/`, `wiki/`, `adr/`, `decisions/`.
- Inline top-of-file/module docstrings that describe purpose.

If nothing exists, note that and move on — the code is the source.

---

## 4. Capture what the docs state, to verify

From each existing doc, note the discrete statements it makes about the system — for example:
"authentication uses OAuth2", "orders can't be cancelled after dispatch", "the payments
service owns refunds". For each, record in `docs/_discovery/discovery-state.md`:

- The statement, plainly.
- Its source (file + location).
- Status: `[unverified]` — meaning simply "not yet checked against the code", the default for
  everything captured here.

**Do not** promote any of these to accepted knowledge yet. Phase 1 verifies each against the
code; only then does the status change (to accepted-and-unmarked, or `[outdated]` /
`[contradicted]` where the code has since moved on).

---

## 5. Record what was read

Update `docs/_discovery/recon-manifest.md`:

- List the existing docs read (path + last-modified).
- Note the mode, scope, and available optional inputs.
- Leave the source-file hash list for Phase 1 to populate as it reads.

---

## Exit criteria

- Working state initialised or resumed; freshness check run if applicable.
- Scope, mode and available inputs confirmed with the user.
- All existing docs found and their statements logged as `[unverified]` (not yet checked).
- Ready to begin deep recon.
