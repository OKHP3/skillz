---
name: browser-testing
description: Writes and debugs end-to-end browser tests — Playwright, Cypress, Selenium — covering selector strategy, waiting, test data, and the flakiness that makes suites get ignored. Use this whenever the user mentions E2E tests, browser tests, UI tests, Playwright, Cypress, Selenium, or a flaky or slow browser suite, and also when a bug is only reproducible through the UI. For testing logic below the UI, use unit-testing.
license: MIT
---

# Browser testing

Browser tests are the most expensive tests you own — slowest to run, most likely to break for
reasons unrelated to your code, hardest to debug. That cost buys one thing nothing else does:
proof that the pieces work together in a real browser.

Spend that budget on a small number of journeys that must never break. A large E2E suite is not
thorough; it is slow, flaky, and eventually ignored, and an ignored suite provides no safety
while still consuming CI time.

**Rule of thumb:** if a case can be covered below the UI, cover it there. E2E is for the wiring.

## 1. Choose the journeys

Pick the paths where failure is unacceptable, typically five to fifteen for a whole product:

- Sign up, sign in, sign out
- The core action the product exists for
- Anything involving money
- The path most users take on first visit

For each, test the **happy path plus the one failure that matters** (declined card, taken
username). Every remaining permutation belongs in a cheaper test.

**Done when:** the journey list is written and short enough to defend.

## 2. Select elements the way a user identifies them

Selector choice determines whether the suite survives a redesign. In order of preference:

1. **Role and accessible name** — `getByRole("button", { name: "Save" })`. Closest to how a
   person finds the control, and it fails when accessibility breaks, which is a real bug.
2. **Visible text** — `getByText`, for non-interactive content.
3. **Dedicated test attributes** — `data-testid`. Explicit contract, immune to restyling. Use
   when the first two are ambiguous.
4. **CSS or XPath structure**, a last resort. `div > div:nth-child(3) > span` encodes the DOM
   shape, and it breaks on a layout change that broke nothing for users.

**Done when:** no selector in the suite depends on the DOM's structure.

## 3. Never wait for time

Fixed sleeps are the single largest source of flakiness. `sleep(2000)` is simultaneously too
long on a fast machine and too short on a loaded CI runner — it wastes time *and* fails
randomly, the worst of both.

Wait for the **state you actually need**: an element to be visible, a request to resolve, text
to change, a URL to update. Modern frameworks auto-wait on assertions — lean on that rather
than adding explicit waits.

The exception worth knowing: waiting for something to *not* appear genuinely requires a
timeout, since absence has no event. Keep it short and rare.

**Done when:** the suite contains no unconditional sleeps.

## 4. Make each test own its data

Tests that share fixtures fail in ways that depend on execution order, and order-dependent
failures cost hours to diagnose.

- Create what the test needs, in the test — via API or direct DB setup, not by clicking through
  the UI. Setting up state through the UI makes every test depend on every other feature.
- Use unique values — timestamped or random emails, names, IDs, so parallel runs cannot collide.
- Clean up after, but **never** rely on cleanup for correctness. Assume the previous run crashed
  halfway.

**Done when:** any single test passes alone, and the full suite passes in parallel.

## 5. Make failures diagnosable

A browser test that fails in CI with "element not found" and nothing else will be marked flaky
and skipped. Configure, before you need them:

- **Screenshot on failure**, always
- **Video or trace** for the failing test — a Playwright trace is worth more than any log line
- **Console and network logs** captured as artifacts
- **A meaningful test name** that identifies the journey and the step

**Done when:** you could diagnose a CI-only failure without reproducing it locally.

## 6. Handle flakiness as a defect

When a test fails intermittently, find the cause before touching retries. Almost always one of:

- **A race:** asserting before the app finished updating. Fix the wait, not the timing.
- **Animation:** an element present but still moving. Disable animations in the test
  environment; this removes a whole class of flake at once.
- **Shared state:** see step 4.
- **Genuine non-determinism:** real time, random ordering, timezone. Control it: freeze the
  clock, seed the randomness, pin the timezone.
- **A real bug:** the one that intermittently fails is sometimes telling the truth about a race
  in the application. Rule this in or out before dismissing it.

Retries hide all five. Use them only as a temporary measure with the flake tracked as an issue —
an automatic retry on a real race means shipping the race.

**Done when:** the test passes 20 consecutive runs, or the flake is filed with a cause.

## Keeping the suite affordable

Run it in parallel, and shard in CI. Keep a **smoke subset**, two or three journeys — that runs
on every commit, with the full suite on merge or nightly. Fast feedback on the critical path
beats complete feedback nobody waits for.

When a journey stops being critical, delete its test. A suite that only ever grows becomes the
thing people route around.
