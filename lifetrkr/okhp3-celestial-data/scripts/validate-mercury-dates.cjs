#!/usr/bin/env node
/**
 * Validates the MERCURY_RETROGRADE array in references/celestial.ts.
 *
 * Checks:
 * - No overlapping retrograde windows
 * - No retrograde window where start >= end
 * - Windows are in ascending chronological order
 * - No gaps larger than 200 days (normal max spacing is ~115 days)
 * - Dates are valid ISO strings
 * - Last end date is at least 365 days in the future (coverage expiry guard)
 *
 * Usage:
 *   node .agents/skills/okhp3-celestial-data/scripts/validate-mercury-dates.cjs
 *
 * Exit code 0 = all checks pass. Exit code 1 = validation errors found.
 */

const fs = require("fs");
const path = require("path");

const SKILL_DIR = path.resolve(__dirname, "../");
const CELESTIAL_TS = path.resolve(SKILL_DIR, "references/celestial.ts");

function extractDates(source) {
  // Matches: { start: '2026-03-15', end: '2026-04-07' }
  const matches = [
    ...source.matchAll(
      /\{\s*start:\s*['"](\d{4}-\d{2}-\d{2})['"]\s*,\s*end:\s*['"](\d{4}-\d{2}-\d{2})['"]\s*\}/g
    ),
  ];
  return matches.map((m) => ({
    start: new Date(m[1]),
    end: new Date(m[2]),
    raw: [m[1], m[2]],
  }));
}

function main() {
  if (!fs.existsSync(CELESTIAL_TS)) {
    console.error("ERROR: references/celestial.ts not found at", CELESTIAL_TS);
    process.exit(1);
  }

  const source = fs.readFileSync(CELESTIAL_TS, "utf8");
  const block = source.match(/MERCURY_RETROGRADE[\s\S]*?\]/);
  if (!block) {
    console.error(
      "ERROR: Could not locate MERCURY_RETROGRADE array in celestial.ts"
    );
    process.exit(1);
  }

  const dates = extractDates(block[0]);
  console.log(`Found ${dates.length} retrograde windows.\n`);

  let errors = 0;
  const MAX_GAP_DAYS = 200;
  const MS_PER_DAY = 86400000;

  for (let i = 0; i < dates.length; i++) {
    const { start, end, raw } = dates[i];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error(`[${i + 1}] INVALID DATE: ${raw[0]} or ${raw[1]}`);
      errors++;
      continue;
    }

    if (start >= end) {
      console.error(`[${i + 1}] START >= END: ${raw[0]} -- ${raw[1]}`);
      errors++;
    }

    if (i > 0) {
      const prev = dates[i - 1];

      if (start < prev.end) {
        console.error(
          `[${i + 1}] OVERLAP: ${raw[0]} starts before previous window ends (${prev.raw[1]})`
        );
        errors++;
      }

      if (start <= prev.start) {
        console.error(
          `[${i + 1}] NOT ASCENDING: ${raw[0]} is not after previous start ${prev.raw[0]}`
        );
        errors++;
      }

      const gapDays =
        (start.getTime() - prev.end.getTime()) / MS_PER_DAY;
      if (gapDays > MAX_GAP_DAYS) {
        console.warn(
          `[${i + 1}] LARGE GAP: ${Math.round(gapDays)} days between ${prev.raw[1]} and ${raw[0]} (max expected ~115)`
        );
      }
    }
  }

  // Coverage expiry guard: last end date must be >= 365 days from today.
  // If missed, getMercuryStatus silently returns retrograde:false for all
  // dates beyond the last entry — this check fires before that happens.
  if (dates.length > 0) {
    const lastEntry = dates[dates.length - 1];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const daysRemaining = (lastEntry.end.getTime() - today.getTime()) / MS_PER_DAY;
    if (daysRemaining < 365) {
      console.error(
        `COVERAGE EXPIRING: Last retrograde end date ${lastEntry.raw[1]} is only ` +
        `${Math.round(daysRemaining)} day(s) away (minimum required: 365). ` +
        `Update MERCURY_RETROGRADE with the next year of ephemeris data.`
      );
      errors++;
    } else {
      console.log(
        `Coverage OK: last end date ${lastEntry.raw[1]} is ${Math.round(daysRemaining)} days away.`
      );
    }
  }

  if (errors === 0) {
    console.log("All checks passed.");
    process.exit(0);
  } else {
    console.error(`\n${errors} error(s) found.`);
    process.exit(1);
  }
}

main();
