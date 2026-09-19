# Playwright workflows

Use this adapter for an explicit exploration, form-preparation, generated-test, or local-webapp
task. Keep the core skill's authorization, selectors, state waits, data isolation, and evidence
rules. These workflows do not imply that Playwright or an MCP server is installed.

## Select the available runtime

1. Inspect the project's test configuration and the browser tools available in this session.
2. Prefer an authorized Playwright MCP integration when it supports the task. Follow the
   integration's own interaction and resource-ownership rules.
3. If it is unavailable, use an existing local Node.js/Playwright installation when permitted.
   Check the package and browser executable before running. Do not silently install software;
   follow the user's existing dependency-change authorization or report the missing prerequisite.
4. Verify the supplied URL is reachable, or start the project's documented local server when
   authorized. Report connection or authentication failures separately from application defects.
5. Close only contexts, processes, and servers created for this task. Keep user-owned tabs and
   browser sessions open. Record which resources the task owns before cleanup.

## Explore a website

- Require a supplied URL; ask for it if absent. Establish the account, permitted data, and scope.
- Inspect and exercise three to five core features or user flows that fit that scope. Stop before
  a consequential action unless it is authorized. Report skipped steps and their reasons.
- For each flow, record the observed interaction sequence, accessible controls and locators,
  expected result, actual result, and useful screenshot or diagnostic evidence.
- Summarize findings and propose a short test list. If test generation is requested, follow the
  observed-first workflow below. Never fill missing observations with invented page behavior.

## Generate a test from an observed scenario

1. Require the scenario and target; clarify either missing input before generating a final test.
2. Execute its permitted steps one by one in the real browser. Capture the controls, waits,
   navigation, and assertions from observed behavior. Do not generate the test prematurely from
   the scenario alone. If execution is blocked, report that limitation and what would unblock it.
3. After the scenario is observed, write a TypeScript test using `@playwright/test`. Follow the
   repository's established test directory and configuration; use `tests/` when there is no
   convention. Keep credentials and private data out of fixtures and artifacts.
4. Run the generated test. Diagnose failures from traces, screenshots, console output, or
   network evidence. Make meaningful fixes and rerun while progress is justified. Do not weaken
   assertions, mask real defects with retries, or claim a blocked test passed.
5. Report the command or runner, scenario, result, files, and unresolved issues. A drafted test
   and an executed passing test are different evidence states.

## Prepare a form for review

Obtain the destination URL, acting account, field values, locale and date/time interpretation,
and any approved upload path at runtime. A remembered form URL, sample event, or machine-local
image path is not user input. Inspect the form before mapping fields; request missing required
values instead of guessing. Uploading a file can transmit it before form submission, so confirm
that the supplied asset and destination are within the existing authorization before uploading.

Fill the authorized fields and show a readable summary of the completed values and attachments,
redacting sensitive values where appropriate. **Do not submit a form when the task only asks
to fill it.** Offer the prepared form for review. Submit only when the exact destination and
action are already explicitly authorized, or after the user grants that authorization. Verify
the resulting confirmation without resubmitting on an ambiguous response.

## Debug a local web application

Start with a reachable target and the smallest reproducing interaction. Check element presence,
visibility, text, URL, dialogs, and the network or console evidence relevant to the reported bug.
For responsive defects, record the actual viewport sizes tested and inspect both layout and
interaction at those sizes. Take failure screenshots and report expected versus actual behavior.
Use bounded state waits and graceful timeouts; a slow environment does not justify infinite
retries. This workflow covers web applications, not native mobile application automation.

## Optional preserved helper

`../assets/test-helper.js` is the unchanged CommonJS helper from `webapp-testing`:

- `captureConsoleLogs(page)` collects console type, text, and timestamps after its listener is
  attached. It does not capture past messages or network traffic. Keep logs free of private data.
- `captureScreenshot(page, name)` writes a timestamped full-page PNG. Supply a safe output name
  in the task's artifact directory and protect any private content visible in the image.
- `waitForCondition(condition, timeout, interval)` polls a condition with a bounded timeout.
  Prefer framework assertions or event waits; use this only for state without a suitable native
  wait. Its polling delay is not an unconditional sleep before an assertion.

Use it from a CommonJS environment. In a consumer with `type: module`, copy the unchanged file
as `test-helper.cjs` before importing it; the `.js` filename alone does not override package mode.
The helper does not install Playwright, launch a browser, or submit a form.

Source attribution and review limits: [consolidation record](consolidation-review-2026-09-19.md).
