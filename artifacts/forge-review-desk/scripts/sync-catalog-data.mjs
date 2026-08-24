// Copies the Forge catalog (the real skill/evidence/provenance data set) from
// artifacts/forge into this artifact's public/data folder so the Review Desk
// can fetch it as a same-origin static asset. Runs before dev/build so the
// desk always ships whatever catalog Forge most recently generated.
//
// This is a deliberate one-way copy, not a live cross-artifact fetch: the two
// artifacts are independently built/deployed static sites, so embedding the
// data at build time keeps the desk working (and its browser test
// self-contained) regardless of whether the Forge service happens to be
// running.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '..', '..', 'forge', 'public', 'data', 'catalog.json');
const destDir = path.resolve(here, '..', 'public', 'data');
const dest = path.join(destDir, 'catalog.json');

if (!existsSync(source)) {
  throw new Error(
    `Cannot sync catalog data: ${source} does not exist. Run the Forge catalog build (pnpm --filter @workspace/forge run predev) first.`,
  );
}

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log(`Synced catalog data: ${source} -> ${dest}`);
