#!/usr/bin/env node
/**
 * Decide whether a publish-health result should alert.
 *
 * This module is intentionally dependency-free so the workflow and its local
 * contract fixture exercise the same debounce and state-replacement behavior.
 */

import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_THRESHOLD = 3;

export function decideAlert({
  previousStreak,
  healthy,
  eventName,
  deployConclusion = "",
  threshold = DEFAULT_THRESHOLD,
}) {
  const prior =
    Number.isInteger(previousStreak) && previousStreak >= 0
      ? previousStreak
      : 0;
  const immediate =
    eventName === "workflow_run" && deployConclusion !== "success";

  let scheduledUnhealthyRuns = prior;
  if (healthy) {
    scheduledUnhealthyRuns = 0;
  } else if (eventName === "schedule") {
    scheduledUnhealthyRuns += 1;
  }

  return {
    scheduledUnhealthyRuns,
    immediate,
    alert:
      immediate ||
      (eventName === "schedule" &&
        scheduledUnhealthyRuns >= threshold),
  };
}

export function replaceStreakState(stateFile, scheduledUnhealthyRuns) {
  const target = resolve(stateFile);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}`;
  writeFileSync(
    temporary,
    `${JSON.stringify({ scheduledUnhealthyRuns })}\n`,
    { mode: 0o600 },
  );
  renameSync(temporary, target);
  return target;
}

function main() {
  const stateFile = process.env.STATE_FILE;
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!stateFile || !outputFile) {
    throw new Error("STATE_FILE and GITHUB_OUTPUT are required.");
  }

  const result = decideAlert({
    previousStreak: Number(process.env.PREVIOUS_STREAK),
    healthy: process.env.HEALTHY === "true",
    eventName: process.env.EVENT_NAME,
    deployConclusion: process.env.DEPLOY_CONCLUSION,
  });
  replaceStreakState(stateFile, result.scheduledUnhealthyRuns);
  writeFileSync(
    outputFile,
    `alert=${result.alert}\nscheduled_unhealthy_runs=${result.scheduledUnhealthyRuns}\n`,
    { flag: "a" },
  );
  console.log(
    `Alert decision: event=${process.env.EVENT_NAME} healthy=${process.env.HEALTHY} ` +
      `scheduled_unhealthy_runs=${result.scheduledUnhealthyRuns} ` +
      `immediate=${result.immediate} alert=${result.alert}`,
  );
}

if (
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (error) {
    console.error(`✗ [debounce] ${error.message}`);
    process.exitCode = 1;
  }
}