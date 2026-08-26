#!/usr/bin/env node
/**
 * Dependency-free contract check for overlapping publish-health triggers.
 *
 * This fixture uses the same debounce and state-replacement module as the
 * workflow. It never reads repository secrets or contacts GitHub.
 */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decideAlert, replaceStreakState } from "./debounce.mjs";

const repositoryRoot = resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);
const workflowPath = join(
  repositoryRoot,
  ".github/workflows/publish-health-check.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

assert.match(workflow, /group:\s*publish-health-check/);
assert.match(workflow, /cancel-in-progress:\s*false/);
assert.match(
  workflow,
  /name:\s*publish-health-streak[\s\S]*?overwrite:\s*true/,
);
assert.match(
  workflow,
  /steps\.alert\.outcome\s*==\s*'success'[\s\S]*?path:.*publish-health-state\/streak\.json/,
);
assert.doesNotMatch(workflow, /echo\s+["'][^"']*\$(?:GH_TOKEN|PUBLISH_HEALTH_WEBHOOK_URL)/);

function applyCheck(state, input) {
  const result = decideAlert({ previousStreak: state.streak, ...input });
  let opened = false;
  let updated = false;
  if (result.alert) {
    if (state.incidentOpen) {
      updated = true;
    } else {
      state.incidentOpen = true;
      opened = true;
    }
  }
  state.streak = result.scheduledUnhealthyRuns;
  return { ...result, opened, updated };
}

// A successful workflow_run check may observe an unhealthy live site, but it
// is a catch-up check, not a scheduled attempt. Only schedules advance this
// streak. The third scheduled failure opens one incident.
const interleaved = { streak: 0, incidentOpen: false };
const firstScheduled = applyCheck(interleaved, {
  healthy: false,
  eventName: "schedule",
});
assert.deepEqual(firstScheduled, {
  scheduledUnhealthyRuns: 1,
  immediate: false,
  alert: false,
  opened: false,
  updated: false,
});

const successfulCatchUp = applyCheck(interleaved, {
  healthy: false,
  eventName: "workflow_run",
  deployConclusion: "success",
});
assert.equal(successfulCatchUp.scheduledUnhealthyRuns, 1);
assert.equal(successfulCatchUp.alert, false);

const secondScheduled = applyCheck(interleaved, {
  healthy: false,
  eventName: "schedule",
});
assert.equal(secondScheduled.scheduledUnhealthyRuns, 2);
assert.equal(secondScheduled.alert, false);

const secondSuccessfulCatchUp = applyCheck(interleaved, {
  healthy: false,
  eventName: "workflow_run",
  deployConclusion: "success",
});
assert.equal(secondSuccessfulCatchUp.scheduledUnhealthyRuns, 2);
assert.equal(secondSuccessfulCatchUp.alert, false);

const thirdScheduled = applyCheck(interleaved, {
  healthy: false,
  eventName: "schedule",
});
assert.equal(thirdScheduled.scheduledUnhealthyRuns, 3);
assert.equal(thirdScheduled.alert, true);
assert.equal(thirdScheduled.opened, true);
assert.equal(thirdScheduled.updated, false);

const fourthScheduled = applyCheck(interleaved, {
  healthy: false,
  eventName: "schedule",
});
assert.equal(fourthScheduled.scheduledUnhealthyRuns, 4);
assert.equal(fourthScheduled.alert, true);
assert.equal(fourthScheduled.opened, false);
assert.equal(fourthScheduled.updated, true);

// A failed deploy is definitive and alerts immediately, without consuming a
// scheduled attempt.
const failedDeploy = { streak: 0, incidentOpen: false };
const immediateFailure = applyCheck(failedDeploy, {
  healthy: false,
  eventName: "workflow_run",
  deployConclusion: "failure",
});
assert.equal(immediateFailure.immediate, true);
assert.equal(immediateFailure.alert, true);
assert.equal(immediateFailure.scheduledUnhealthyRuns, 0);
assert.equal(immediateFailure.opened, true);

// A healthy successful catch-up resets state but never increments it.
const healthyCatchUp = decideAlert({
  previousStreak: 2,
  healthy: true,
  eventName: "workflow_run",
  deployConclusion: "success",
});
assert.deepEqual(healthyCatchUp, {
  scheduledUnhealthyRuns: 0,
  immediate: false,
  alert: false,
});

// Replacing the local state is atomic: write a new file beside the old one,
// then rename it into place, leaving no partial or temporary state behind.
const stateDirectory = mkdtempSync(join(tmpdir(), "publish-health-debounce-"));
const stateFile = join(stateDirectory, "streak.json");
writeFileSync(stateFile, '{"scheduledUnhealthyRuns":1}\n');
replaceStreakState(stateFile, 3);
assert.deepEqual(JSON.parse(readFileSync(stateFile, "utf8")), {
  scheduledUnhealthyRuns: 3,
});
assert.deepEqual(readdirSync(stateDirectory), ["streak.json"]);

console.log(
  "✓ debounce contract: interleaved triggers, immediate deploy failure, single incident, safe state replacement, and secret redaction passed",
);