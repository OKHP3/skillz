#!/usr/bin/env node
/**
 * build-activity.mjs
 * C2: fetches the 10 most recent commits to `main` from the public GitHub
 * REST API at BUILD time and writes artifacts/forge/public/data/activity.json.
 *
 * This is deliberately build-time, not a client-side fetch from the SPA:
 * - avoids exposing every visitor's browser to GitHub's unauthenticated
 *   rate limit (60 req/hr per IP) directly,
 * - keeps the SPA free of any GitHub token/auth requirement (non-goal:
 *   no login or write-scoped tokens in the SPA),
 * - matches the same "static discovery surface" model as catalog.json.
 *
 * If the fetch fails (rate-limited, offline, GitHub down), the script does
 * NOT fail the build — it writes a feed with `fetchError` set, and
 * Activity.tsx renders a graceful fallback linking to GitHub directly.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Preview runs set FORGE_PUBLIC_DIR to an ignored output directory. Release
// builds leave it unset and keep writing the tracked public asset.
const PUBLIC_DIR = process.env.FORGE_PUBLIC_DIR
  ? resolve(__dirname, '..', process.env.FORGE_PUBLIC_DIR)
  : join(__dirname, '..', 'public');
const OUTPUT = join(PUBLIC_DIR, 'data', 'activity.json');
const GITHUB_REPO = 'OKHP3/skillz';

async function buildActivity() {
  const generatedAt = new Date().toISOString();
  let commits = [];
  let fetchError = null;

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?sha=main&per_page=10`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'skillz-forge-build' },
    });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();
    commits = data.map(c => ({
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      message: c.commit?.message || '',
      author: c.commit?.author?.name || c.author?.login || 'unknown',
      date: c.commit?.author?.date || generatedAt,
      url: c.html_url,
    }));
  } catch (err) {
    fetchError = err.message;
    console.warn(`[activity warn] Could not fetch recent commits: ${err.message}`);
  }

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify({ generatedAt, commits, fetchError }, null, 2), 'utf-8');
  console.log(`✓ Written: ${OUTPUT} (${commits.length} commits${fetchError ? ', fetch failed' : ''})`);
}

buildActivity();
