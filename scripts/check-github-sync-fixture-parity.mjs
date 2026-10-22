#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CANONICAL = ".agents/skills/okhp3-replit-github-sync/evals";
const SHIPPING = "replit/okhp3-replit-github-sync/evals";

function requireNonEmptyString(value, path, failures) {
  if (typeof value !== "string" || !value.trim()) {
    failures.push(`${path}: expected a non-empty string`);
  }
  return value;
}

function indexBy(items, keyFor, label, failures) {
  if (!Array.isArray(items)) {
    failures.push(`${label}: expected an array`);
    return {};
  }
  const indexed = {};
  for (const item of items) {
    const key = keyFor(item);
    if (key === undefined || key === null || key === "") {
      failures.push(`${label}: item is missing its key`);
      continue;
    }
    const stringKey = String(key);
    if (Object.hasOwn(indexed, stringKey)) {
      failures.push(`${label}[${JSON.stringify(stringKey)}]: duplicate key`);
      continue;
    }
    indexed[stringKey] = item;
  }
  return indexed;
}

function evalContract(data, prefix, failures) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    failures.push(`${prefix}: expected a JSON object`);
    return {};
  }
  requireNonEmptyString(data.skill_name, `${prefix}.skill_name`, failures);
  requireNonEmptyString(data.skill_version, `${prefix}.skill_version`, failures);
  const evals = indexBy(data.evals, (item) => item?.id, `${prefix}.evals`, failures);
  const cases = {};
  for (const [id, item] of Object.entries(evals)) {
    requireNonEmptyString(item.name, `${prefix}.evals[id=${id}].name`, failures);
    requireNonEmptyString(item.prompt, `${prefix}.evals[id=${id}].prompt`, failures);
    const expectations = indexBy(
      item.expectations,
      (expectation) => expectation?.id,
      `${prefix}.evals[id=${id}].expectations`,
      failures,
    );
    const expectationContract = {};
    for (const [expectationId, expectation] of Object.entries(expectations)) {
      requireNonEmptyString(
        expectation.text,
        `${prefix}.evals[id=${id}].expectations[id=${expectationId}].text`,
        failures,
      );
      expectationContract[expectationId] = { text: expectation.text };
    }
    cases[id] = {
      name: item.name,
      prompt: item.prompt,
      expectations: expectationContract,
    };
  }

  // Keep only the safety contract. Release status, blockers, and live-run evidence
  // are package-specific metadata and must not be copied between distributions.
  return {
    skill_name: data.skill_name,
    skill_version: data.skill_version,
    cases,
  };
}

function triggerContract(data, prefix, failures) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    failures.push(`${prefix}: expected a JSON object`);
    return {};
  }
  requireNonEmptyString(data.skill_name, `${prefix}.skill_name`, failures);
  requireNonEmptyString(data.skill_version, `${prefix}.skill_version`, failures);
  requireNonEmptyString(data.description_evaluated, `${prefix}.description_evaluated`, failures);
  const queries = indexBy(
    data.queries,
    (item) => item?.query,
    `${prefix}.queries`,
    failures,
  );
  const queryContract = {};
  for (const [query, item] of Object.entries(queries)) {
    requireNonEmptyString(query, `${prefix}.queries.query`, failures);
    queryContract[query] = {
      should_trigger: item.should_trigger,
      triggered: item.triggered,
    };
  }
  return {
    skill_name: data.skill_name,
    skill_version: data.skill_version,
    description_evaluated: data.description_evaluated,
    queries: queryContract,
  };
}

function compareTrees(canonical, shipped, path, failures) {
  const canonicalObject =
    canonical !== null && typeof canonical === "object" && !Array.isArray(canonical);
  const shippedObject =
    shipped !== null && typeof shipped === "object" && !Array.isArray(shipped);

  if (canonicalObject && shippedObject) {
    const keys = new Set([...Object.keys(canonical), ...Object.keys(shipped)]);
    for (const key of [...keys].sort()) {
      const childPath = `${path}.${key}`;
      if (!Object.hasOwn(shipped, key)) {
        failures.push(`${childPath}: missing from shipped fixture`);
      } else if (!Object.hasOwn(canonical, key)) {
        failures.push(`${childPath}: unexpected in shipped fixture`);
      } else {
        compareTrees(canonical[key], shipped[key], childPath, failures);
      }
    }
    return;
  }

  if (!Object.is(canonical, shipped)) {
    failures.push(
      `${path}: canonical ${JSON.stringify(canonical)} != shipped ${JSON.stringify(shipped)}`,
    );
  }
}

function calculateTriggerSummary(data, prefix, failures) {
  const counts = {
    true_positives: 0,
    false_negatives: 0,
    true_negatives: 0,
    false_positives: 0,
  };
  if (!Array.isArray(data?.queries)) return counts;

  for (const item of data.queries) {
    if (
      typeof item?.should_trigger !== "boolean" ||
      typeof item?.triggered !== "boolean"
    ) {
      failures.push(`${prefix}.queries: each entry must contain boolean trigger labels`);
      continue;
    }
    if (item.should_trigger && item.triggered) counts.true_positives += 1;
    else if (item.should_trigger) counts.false_negatives += 1;
    else if (item.triggered) counts.false_positives += 1;
    else counts.true_negatives += 1;
  }

  const totalPositive = counts.true_positives + counts.false_negatives;
  const totalTriggered = counts.true_positives + counts.false_positives;
  const expected = {
    ...counts,
    recall: totalPositive ? counts.true_positives / totalPositive : 1,
    precision: totalTriggered ? counts.true_positives / totalTriggered : 1,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (!Object.is(data.summary?.[key], value)) {
      failures.push(
        `${prefix}.summary.${key}: expected ${JSON.stringify(value)} from queries, got ${JSON.stringify(data.summary?.[key])}`,
      );
    }
  }
  return expected;
}

export function compareGithubSyncFixtures(fixtures) {
  const failures = [];
  const canonicalEvals = evalContract(
    fixtures.canonicalEvals,
    "canonical.evals",
    failures,
  );
  const shippedEvals = evalContract(
    fixtures.shippedEvals,
    "shipped.evals",
    failures,
  );
  compareTrees(canonicalEvals, shippedEvals, "safety-evals", failures);

  const canonicalTriggers = triggerContract(
    fixtures.canonicalTriggers,
    "canonical.trigger-evals",
    failures,
  );
  const shippedTriggers = triggerContract(
    fixtures.shippedTriggers,
    "shipped.trigger-evals",
    failures,
  );
  compareTrees(canonicalTriggers, shippedTriggers, "trigger-coverage", failures);

  calculateTriggerSummary(
    fixtures.canonicalTriggers,
    "canonical.trigger-evals",
    failures,
  );
  calculateTriggerSummary(
    fixtures.shippedTriggers,
    "shipped.trigger-evals",
    failures,
  );

  return failures;
}

function readJson(root, relativePath) {
  const absolutePath = resolve(root, relativePath);
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`${relativePath}: ${error.message}`);
  }
}

function main() {
  const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
  let failures;
  try {
    failures = compareGithubSyncFixtures({
      canonicalEvals: readJson(root, `${CANONICAL}/evals.json`),
      shippedEvals: readJson(root, `${SHIPPING}/evals.json`),
      canonicalTriggers: readJson(root, `${CANONICAL}/trigger-evals.json`),
      shippedTriggers: readJson(root, `${SHIPPING}/trigger-evals.json`),
    });
  } catch (error) {
    console.error(`✗ GitHub-sync fixture parity could not read its inputs: ${error.message}`);
    process.exit(1);
  }

  if (failures.length) {
    for (const failure of failures) {
      console.error(`✗ GitHub-sync fixture drift: ${failure}`);
    }
    process.exit(1);
  }
  console.log("✓ GitHub-sync safety fixtures and trigger coverage match");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
