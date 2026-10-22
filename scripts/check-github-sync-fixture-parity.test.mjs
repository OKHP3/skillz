import assert from "node:assert/strict";
import test from "node:test";

import { compareGithubSyncFixtures } from "./check-github-sync-fixture-parity.mjs";

function makeFixtures() {
  const evals = {
    skill_name: "okhp3-replit-github-sync",
    skill_version: "1.0.0",
    release_status: "not-run",
    blockers: ["local package evidence"],
    evals: [
      {
        id: 1,
        name: "safe-push",
        prompt: "Sync safely.",
        expectations: [{ id: 1, text: "Preserve local history." }],
      },
    ],
  };
  const triggers = {
    skill_name: "okhp3-replit-github-sync",
    skill_version: "1.0.0",
    description_evaluated: "Safe GitHub synchronization.",
    queries: [
      { query: "Sync origin safely", should_trigger: true, triggered: true },
      { query: "Force push over GitHub", should_trigger: false, triggered: false },
    ],
    summary: {
      true_positives: 1,
      false_negatives: 0,
      true_negatives: 1,
      false_positives: 0,
      recall: 1,
      precision: 1,
    },
    method: "canonical-only provenance",
  };
  return {
    canonicalEvals: structuredClone(evals),
    shippedEvals: {
      ...structuredClone(evals),
      release_status: "published",
      blockers: [],
      evals: [
        {
          ...structuredClone(evals.evals[0]),
          live_result: { captured_response: "local evidence" },
        },
      ],
    },
    canonicalTriggers: structuredClone(triggers),
    shippedTriggers: {
      ...structuredClone(triggers),
      method: "shipping-package provenance",
    },
  };
}

test("compares safety contract while preserving distribution-specific metadata", () => {
  assert.deepEqual(compareGithubSyncFixtures(makeFixtures()), []);
});

test("reports missing and changed safety cases by case and expectation id", () => {
  const fixtures = makeFixtures();
  fixtures.shippedEvals.evals[0].expectations[0].text = "Use force push.";
  fixtures.shippedEvals.evals.push({
    id: 2,
    name: "missing from canonical",
    prompt: "extra",
    expectations: [],
  });
  const failures = compareGithubSyncFixtures(fixtures);
  assert.ok(
    failures.some((failure) =>
      failure.includes('safety-evals.cases.1.expectations.1.text: canonical "Preserve local history." != shipped "Use force push."'),
    ),
  );
  assert.ok(
    failures.some((failure) => failure.includes("safety-evals.cases.2: unexpected in shipped fixture")),
  );
});

test("reports a missing shipped expectation precisely", () => {
  const fixtures = makeFixtures();
  fixtures.shippedEvals.evals[0].expectations.pop();
  const failures = compareGithubSyncFixtures(fixtures);
  assert.ok(
    failures.some((failure) =>
      failure.includes("safety-evals.cases.1.expectations.1: missing from shipped fixture"),
    ),
  );
});

test("reports a missing shipped safety case precisely", () => {
  const fixtures = makeFixtures();
  fixtures.shippedEvals.evals[0].expectations = [];
  fixtures.shippedEvals.evals.pop();
  const failures = compareGithubSyncFixtures(fixtures);
  assert.ok(
    failures.some((failure) =>
      failure.includes("safety-evals.cases.1: missing from shipped fixture"),
    ),
  );
});

test("reports missing or relabeled trigger queries and stale trigger summaries", () => {
  const fixtures = makeFixtures();
  fixtures.shippedTriggers.queries[0].should_trigger = false;
  fixtures.shippedTriggers.queries.pop();
  fixtures.shippedTriggers.summary.true_positives = 0;
  const failures = compareGithubSyncFixtures(fixtures);
  assert.ok(
    failures.some((failure) =>
      failure.includes('trigger-coverage.queries.Sync origin safely.should_trigger: canonical true != shipped false'),
    ),
  );
  assert.ok(
    failures.some((failure) =>
      failure.includes("trigger-coverage.queries.Force push over GitHub: missing from shipped fixture"),
    ),
  );
  assert.ok(
    failures.some((failure) =>
      failure.includes("shipped.trigger-evals.summary.true_negatives: expected 0 from queries, got 1"),
    ),
  );
});

test("rejects duplicate case ids instead of hiding a fixture", () => {
  const fixtures = makeFixtures();
  fixtures.shippedEvals.evals.push(structuredClone(fixtures.shippedEvals.evals[0]));
  const failures = compareGithubSyncFixtures(fixtures);
  assert.ok(failures.some((failure) => failure.includes("shipped.evals.evals[\"1\"]: duplicate key")));
});
