#!/usr/bin/env node
/**
 * Validates the Computus Easter algorithm against known correct dates.
 *
 * Uses the Anonymous Gregorian algorithm (Western) and the Julian algorithm
 * with 13-day offset (Orthodox). Test vectors sourced from the US Naval
 * Observatory and the Ecumenical Patriarchate calendar.
 *
 * Usage:
 *   node .agents/skills/okhp3-tradition-observance-calendar/scripts/validate-easter.js
 *
 * Exit code 0 = all known dates match. Exit code 1 = one or more mismatches.
 */

// Anonymous Gregorian algorithm (Western Easter)
function computeWesternEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

// Julian Computus + 13-day Gregorian offset (Orthodox Easter)
function computeOrthodoxEaster(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // Add 13-day Julian-to-Gregorian offset
  const julian = new Date(Date.UTC(year, month - 1, day));
  julian.setUTCDate(julian.getUTCDate() + 13);
  return julian;
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// Known correct Easter dates (sourced: US Naval Observatory / Ecumenical Patriarchate)
const WESTERN_KNOWN = [
  [2020, "2020-04-12"],
  [2021, "2021-04-04"],
  [2022, "2022-04-17"],
  [2023, "2023-04-09"],
  [2024, "2024-03-31"],
  [2025, "2025-04-20"],
  [2026, "2026-04-05"],
  [2027, "2027-03-28"],
  [2028, "2028-04-16"],
  [2029, "2029-04-01"],
  [2030, "2030-04-21"],
];

const ORTHODOX_KNOWN = [
  [2020, "2020-04-19"],
  [2021, "2021-05-02"],
  [2022, "2022-04-24"],
  [2023, "2023-04-16"],
  [2024, "2024-05-05"],
  [2025, "2025-04-20"],
  [2026, "2026-04-12"],
  [2027, "2027-05-02"],
  [2028, "2028-04-16"],
  [2029, "2029-04-08"],
  [2030, "2030-04-28"],
];

let errors = 0;

console.log("=== Western Easter ===");
for (const [year, expected] of WESTERN_KNOWN) {
  const got = fmt(computeWesternEaster(year));
  const ok = got === expected;
  if (!ok) errors++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${year}: expected ${expected}, got ${got}`);
}

console.log("\n=== Orthodox Easter ===");
for (const [year, expected] of ORTHODOX_KNOWN) {
  const got = fmt(computeOrthodoxEaster(year));
  const ok = got === expected;
  if (!ok) errors++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${year}: expected ${expected}, got ${got}`);
}

console.log(`\n${errors === 0 ? "All checks passed." : `${errors} error(s) found.`}`);
process.exit(errors > 0 ? 1 : 0);
