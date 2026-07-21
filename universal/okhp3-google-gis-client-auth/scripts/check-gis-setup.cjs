#!/usr/bin/env node
/**
 * okhp3-google-gis-client-auth — check-gis-setup.cjs
 * Scans a project for the required GIS setup elements and reports gaps.
 *
 * Usage:
 *   node .agents/skills/okhp3-google-gis-client-auth/scripts/check-gis-setup.cjs
 *   node .agents/skills/okhp3-google-gis-client-auth/scripts/check-gis-setup.cjs --root ./my-app
 *   node .agents/skills/okhp3-google-gis-client-auth/scripts/check-gis-setup.cjs --token-key my_token --expiry-key my_expiry
 *
 * Options:
 *   --root <path>          project root to scan (default: current working directory)
 *   --token-key <name>     token key (default: gal_token)
 *   --expiry-key <name>    expiry key (default: gal_expiry)
 *
 * No dependencies — uses Node.js built-in fs and path modules.
 * Exit 0 = all required elements found.  Exit 1 = gaps detected.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const args    = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT    = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : process.cwd();

function optionValue(name, fallback) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const TOKEN_KEY  = optionValue('--token-key', 'gal_token');
const EXPIRY_KEY = optionValue('--expiry-key', 'gal_expiry');

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(label, detail) {
  console.log(`  ✓  ${label}`);
  if (detail) console.log(`       ${detail}`);
  passed++;
}
function fail(label, fix) {
  console.log(`  ✗  ${label}`);
  if (fix) console.log(`       Fix: ${fix}`);
  failed++;
}
function warn(label, detail) {
  console.log(`  ⚠  ${label}`);
  if (detail) console.log(`       ${detail}`);
  warnings++;
}

function readFile(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
  catch { return null; }
}

function findFiles(dir, ext, maxDepth = 4) {
  const results = [];
  function walk(d, depth) {
    if (depth > maxDepth) return;
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (e.name.endsWith(ext)) results.push(full);
    }
  }
  walk(dir, 0);
  return results;
}

function grepIn(content, patterns) {
  return patterns.some(p => content.includes(p));
}

// ── Check 1: index.html has GIS CDN script ──────────────────────────────────
console.log('\n  ── GIS CDN script tag ──────────────────────────────');
const indexHtml = readFile('index.html');
if (!indexHtml) {
  fail('index.html found', 'Create index.html at project root (standard for Vite/CRA apps)');
} else {
  const hasGIS = grepIn(indexHtml, [
    'accounts.google.com/gsi/client',
    'gsi/client',
  ]);
  if (hasGIS) {
    pass('GIS CDN script found in index.html');
  } else {
    fail(
      'GIS CDN script NOT found in index.html',
      'Add: <script src="https://accounts.google.com/gsi/client" async defer></script>'
    );
  }

  const hasRedirectUri = grepIn(indexHtml, ['redirect_uri', 'redirectUri', 'callback']);
  if (hasRedirectUri) {
    warn('index.html may reference redirect URIs', 'The GIS token model does NOT use redirect URIs — check this is not a leftover from auth code flow');
  }
}

// ── Check 2: GOOGLE_CLIENT_ID defined somewhere ─────────────────────────────
console.log('\n  ── Client ID configuration ─────────────────────────');
const allTsFiles  = findFiles(path.join(ROOT, 'src'), '.ts');
const allTsxFiles = findFiles(path.join(ROOT, 'src'), '.tsx');
const allJsFiles  = findFiles(path.join(ROOT, 'src'), '.js');
const allSrcFiles = [...allTsFiles, ...allTsxFiles, ...allJsFiles];

let foundClientId = false;
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (grepIn(content, ['GOOGLE_CLIENT_ID', 'VITE_GOOGLE_CLIENT_ID'])) {
    pass('GOOGLE_CLIENT_ID referenced', `Found in ${path.relative(ROOT, f)}`);
    foundClientId = true;
    break;
  }
}
if (!foundClientId) {
  fail(
    'GOOGLE_CLIENT_ID not found in src/',
    'Add: export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || \'\';'
  );
}

// ── Check 3: useGoogleAuth hook or initTokenClient usage ────────────────────
console.log('\n  ── GIS token client usage ──────────────────────────');
let foundHook = false;
let hookFile  = '';
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (grepIn(content, ['initTokenClient', 'useGoogleAuth'])) {
    foundHook = true;
    hookFile  = path.relative(ROOT, f);
    break;
  }
}
if (foundHook) {
  pass('GIS token client usage found', `Found in ${hookFile}`);
} else {
  fail(
    'No initTokenClient or useGoogleAuth found in src/',
    'Copy the useGoogleAuth hook from the skill\'s references/useGoogleAuth.ts'
  );
}

// ── Check 4: sessionStorage (not localStorage) for token ────────────────────
console.log('\n  ── Token storage safety ────────────────────────────');
let usesSessionStorage = false;
let usesLocalStorageForToken = false;
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (grepIn(content, [TOKEN_KEY, 'sessionStorage'])) {
    usesSessionStorage = true;
  }
  if (grepIn(content, ['localStorage']) && grepIn(content, [TOKEN_KEY, 'token', 'access_token'])) {
    usesLocalStorageForToken = true;
  }
}
if (usesSessionStorage) {
  pass(`Token key ${TOKEN_KEY} found with sessionStorage (clears on tab close)`);
} else if (usesLocalStorageForToken) {
  fail(
    'Token may be stored in localStorage — use sessionStorage instead',
    'sessionStorage clears on tab close; localStorage persists and is higher risk'
  );
} else {
  warn(`Could not verify token key ${TOKEN_KEY}`, 'Ensure the configured token is stored in sessionStorage, not localStorage');
}

let foundExpiryKey = false;
for (const f of allSrcFiles) {
  if (grepIn(fs.readFileSync(f, 'utf8'), [EXPIRY_KEY])) {
    foundExpiryKey = true;
    break;
  }
}
if (foundExpiryKey) {
  pass(`Expiry key ${EXPIRY_KEY} found`);
} else {
  warn(`Could not verify expiry key ${EXPIRY_KEY}`, 'Store an absolute epoch-millisecond expiry alongside the token');
}

// ── Check 5: .env or Replit Secret for VITE_GOOGLE_CLIENT_ID ────────────────
console.log('\n  ── Environment variable ────────────────────────────');
const envLocal = readFile('.env.local');
const envFile  = readFile('.env');
const hasEnvKey = (envLocal && envLocal.includes('VITE_GOOGLE_CLIENT_ID')) ||
                  (envFile  && envFile.includes('VITE_GOOGLE_CLIENT_ID'));
if (hasEnvKey) {
  pass('VITE_GOOGLE_CLIENT_ID found in .env file');
} else {
  warn(
    'VITE_GOOGLE_CLIENT_ID not found in .env or .env.local',
    'Set via Replit Secret or .env.local: VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com'
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n  ── Summary ─────────────────────────────────────────');
console.log(`  Passed: ${passed}   Failed: ${failed}   Warnings: ${warnings}`);
if (failed === 0 && warnings === 0) {
  console.log('  ✓ GIS setup looks complete.');
} else if (failed === 0) {
  console.log('  ⚠ Setup complete with warnings — review above.');
} else {
  console.log('  ✗ Setup incomplete — fix the failed checks before testing Google auth.');
}
console.log('');

process.exit(failed === 0 ? 0 : 1);
