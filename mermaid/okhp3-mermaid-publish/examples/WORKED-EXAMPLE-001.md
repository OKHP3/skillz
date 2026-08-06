# Worked Example 001 — Rendering the Skill Promotion Review Diagram

**Date:** 2026-08-06
**Skill version:** 0.2.0
**Completed by:** Replit Agent (`okhp3-mermaid-publish` workflow)
**Source diagram (repo-root-relative):** `mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd`
**Rendered outputs (this directory):** `skill-promotion-review-analyst-v1.svg`, `skill-promotion-review-analyst-v1.png`

---

## Task

Take the Gate-1/2/3-validated diagram produced in
`../okhp3-mermaid-bpmn/examples/WORKED-EXAMPLE-001.md` and run it through this skill's
Local Render path (`references/render-pipeline.sh`), producing and preserving an actual
rendered artifact — the genuine, non-hypothetical use case this skill exists for.

---

## Workflow execution (per `okhp3-mermaid-publish`)

### Step 1 — Format selection

Per `references/output-formats.md`'s default rule: no "embed"/"add to docs"/README
request was made and the target was not already a `.md` file, so the default `.mmd`
source-file path applies, with both PNG and SVG rendered as the output artifact.

### Step 2 — Local render

Ran the shipped script exactly as documented, no modifications, from the **repository
root** (paths below are repo-root-relative, matching how the script was actually
invoked):

```
bash mermaid/okhp3-mermaid-publish/references/render-pipeline.sh \
  mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd \
  mermaid/okhp3-mermaid-publish/examples/skill-promotion-review-analyst-v1.png
```

**Environment note (this sandbox specifically, not a skill defect):** the ephemeral
`npx --yes @mermaid-js/mermaid-cli` download's bundled `chrome-headless-shell` failed to
launch in this container with missing shared libraries (`libglib-2.0.so.0`, then
`libgbm.so.1`) — a sandbox dependency gap, not a script bug. The script's own dependency
check (Node/npx present) passed correctly; the failure surfaced from the downstream
Puppeteer browser launch. Resolved by installing the system `chromium` package and
setting `PUPPETEER_EXECUTABLE_PATH` to it before invoking the script — no change to
`render-pipeline.sh` itself was needed or made.

**Actual command and output from this session** (executable-path value shortened for
readability; the real value is the `chromium` package path shown by `which chromium`
after installing the Nix `chromium` system dependency):

```
$ export PUPPETEER_EXECUTABLE_PATH=/nix/store/<hash>-chromium-138.0.7204.100/bin/chromium
$ bash mermaid/okhp3-mermaid-publish/references/render-pipeline.sh \
    mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd \
    mermaid/okhp3-mermaid-publish/examples/skill-promotion-review-analyst-v1.png
Rendering mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd -> mermaid/okhp3-mermaid-publish/examples/skill-promotion-review-analyst-v1.png (first run may take ~30s to fetch mermaid-cli)...
Generating single mermaid chart
OK: mermaid/okhp3-mermaid-publish/examples/skill-promotion-review-analyst-v1.png written. Input preserved at mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd.
Next: view mermaid/okhp3-mermaid-publish/examples/skill-promotion-review-analyst-v1.png and check against the audience profile (Gate 3).
```

Exit code: **0**. The equivalent `.svg` output was produced the same way (`mmdc -i
<source> -o skill-promotion-review-analyst-v1.svg`, also exit 0), since this skill's
Output Format Selection step allows producing more than one output shape from the same
validated source. Both the `.mmd` input and the `.png`/`.svg` outputs were preserved
(never deleted), per this skill's non-negotiable rule, and both render files are
committed in this directory alongside this write-up (narrow `.gitignore` exceptions
were added for `mermaid/okhp3-mermaid-publish/examples/*.png` and `*.svg`, since the
repository otherwise treats rendered diagrams as disposable local test output).

### Step 3 — Visual confirmation

Opened the rendered PNG and confirmed against the source request: three swim lanes
render as expected (Author, Reviewer, Cataloger), the gateway diamond and its `yes`/`no`
labeled edges render correctly, and the dotted feedback edge visibly loops back into the
Author lane. This is the input to `okhp3-mermaid-core`'s Gate 1 (syntax — satisfied by
exit 0) and feeds Gate 3 (audience fit — confirmed in the BPMN skill's own worked
example, since fit is judged against the *content*, not the render step).

### Step 4 — MCP publish path (not exercised)

No Mermaid Chart MCP connector is configured in this environment. Per
`references/mcp-publish-workflow.md`'s documented fallback, the diagram was published
locally only; no share link exists, and no claim of one is made anywhere in this
worked example or in the registry entry recorded in the BPMN skill's worked example.

---

## Output

`skill-promotion-review-analyst-v1.svg` and `skill-promotion-review-analyst-v1.png`,
both preserved and committed in this directory alongside this write-up. The source
`.mmd` remains at its original location in
`../okhp3-mermaid-bpmn/references/process-examples/` and was not copied or duplicated
here, to avoid two divergent copies of the same source.

---

## Known limitations / follow-on work

- `references/output-formats.md` and `references/mcp-publish-workflow.md` are still
  Phase-1 TOC stubs. This worked example exercised only the Local Render / default
  `.mmd` path they describe at a high level; the MCP publish sequence and the
  "embed in `.md`" / "both" format options remain unexercised in practice.
- The Puppeteer browser-launch workaround needed in this specific sandbox
  (`PUPPETEER_EXECUTABLE_PATH` pointed at a system-installed `chromium`) is an
  environment fact, not a documented fallback in `render-pipeline.sh`. A future task
  could add this as a documented troubleshooting note if this environment gap recurs
  for other users of the script, but that is out of scope for clearing this promotion
  gate.
