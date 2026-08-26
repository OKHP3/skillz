/**
 * capabilities.mjs
 *
 * Single declarative source of truth for Forge's shipped "capability flags"
 * (the fields under `project-summary.json`'s `capabilities` object).
 *
 * Prior to this file, `writeProjectSummary()` in build-catalog.js hand-set
 * each flag as an independent boolean literal. That let the summary drift
 * from reality with zero warning — `localStackComposer` sat hardcoded
 * `false` for a full release cycle after the composer actually shipped and
 * was wired into every page via `App.tsx`.
 *
 * Each capability here is defined once, with a `detect()` check that proves
 * the feature from real, checkable signals (the implementing file exists
 * *and* is actually imported/wired somewhere in `src`, not just sitting in
 * the tree unused). Both the catalog generator (`build-catalog.js`) and the
 * catalog test suite (`test-catalog.mjs`) import this same module, so a
 * flag can never silently disagree with the shipped feature set without a
 * test failing.
 *
 * To add a new capability flag: add one entry below. Do not hand-set a
 * boolean anywhere else.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Recursively collects the contents of every source file under `dir` with
 * one of `extensions`, concatenated into one string. Used to check whether
 * a component is actually imported/rendered anywhere, not just present on
 * disk. Small enough (`artifacts/forge/src` is a few hundred KB) to do on every build
 * without caching.
 */
function collectSourceText(dir, extensions = ['.ts', '.tsx']) {
  let out = '';
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      out += collectSourceText(full, extensions);
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      out += readFileSync(full, 'utf-8') + '\n';
    }
  }
  return out;
}

/**
 * A component "is wired in" when some other file imports it by name — as a
 * static default/named import (`import Foo from '...'`), a static named
 * import (`import { Foo } from '...'`), or a dynamic/lazy import whose
 * module path ends in the component's file name (`lazy(() =>
 * import('./pages/Foo'))`, the pattern this codebase uses for route-level
 * code splitting in `App.tsx`). We search the whole `src` tree (excluding
 * the component's own file) rather than a single known consumer, so this
 * keeps working if the consumer moves.
 */
function isImportedByName(srcDir, componentName, ownFileAbsPath) {
  const text = collectSourceText(srcDir);
  const ownFileText = readFileSync(ownFileAbsPath, 'utf-8');
  const withoutOwnFile = text.includes(ownFileText) ? text.replace(ownFileText, '') : text;
  const patterns = [
    // import Foo from '...'
    new RegExp(`import\\s+${componentName}\\b`, 'm'),
    // import { Foo } from '...'
    new RegExp(`import\\s*\\{[^}]*\\b${componentName}\\b[^}]*\\}`, 'm'),
    // import('./pages/Foo') or import("...Foo") — static or lazy/dynamic,
    // module path ending in the component's file name
    new RegExp(`import\\(['"][^'"]*\\/${componentName}['"]\\)`, 'm'),
  ];
  return patterns.some((pattern) => pattern.test(withoutOwnFile));
}

/**
 * @typedef {Object} CapabilityDefinition
 * @property {string} key - the `project-summary.json` capabilities field name
 * @property {string} description - human-readable summary, mirrors the
 *   doc comment previously kept next to the hand-set booleans
 * @property {(forgeRoot: string) => boolean} detect - pure check against the
 *   real repo tree; must not depend on any hand-maintained flag
 */

/** @type {CapabilityDefinition[]} */
export const CAPABILITIES = [
  {
    key: 'familyOrientationPages',
    description: '/families/:family pages',
    detect: (forgeRoot) => {
      const file = join(forgeRoot, 'src', 'pages', 'FamilyDetail.tsx');
      return existsSync(file) && isImportedByName(join(forgeRoot, 'src'), 'FamilyDetail', file);
    },
  },
  {
    key: 'skillCompare',
    description: 'Compare page',
    detect: (forgeRoot) => {
      const file = join(forgeRoot, 'src', 'pages', 'Compare.tsx');
      return existsSync(file) && isImportedByName(join(forgeRoot, 'src'), 'Compare', file);
    },
  },
  {
    key: 'curatedStacks',
    description: 'static, author-curated Stacks page',
    detect: (forgeRoot) => {
      const file = join(forgeRoot, 'src', 'pages', 'Stacks.tsx');
      return existsSync(file) && isImportedByName(join(forgeRoot, 'src'), 'Stacks', file);
    },
  },
  {
    key: 'fullContractRenderer',
    description: 'in-app rendered SKILL.md ("Full Contract")',
    detect: (forgeRoot) => {
      const file = join(forgeRoot, 'src', 'components', 'ui', 'FullContract.tsx');
      return existsSync(file) && isImportedByName(join(forgeRoot, 'src'), 'FullContract', file);
    },
  },
  {
    key: 'localStackComposer',
    description: 'visitor-built, exportable local stack',
    detect: (forgeRoot) => {
      const drawer = join(forgeRoot, 'src', 'components', 'ui', 'ComposerDrawer.tsx');
      const context = join(forgeRoot, 'src', 'contexts', 'ComposerContext.tsx');
      return (
        existsSync(drawer) &&
        existsSync(context) &&
        isImportedByName(join(forgeRoot, 'src'), 'ComposerDrawer', drawer) &&
        isImportedByName(join(forgeRoot, 'src'), 'ComposerProvider', context)
      );
    },
  },
  {
    key: 'guidedDiscoveryAid',
    description: '"start with the work" question flow',
    detect: (forgeRoot) => {
      const file = join(forgeRoot, 'src', 'components', 'ui', 'DiscoveryAid.tsx');
      return existsSync(file) && isImportedByName(join(forgeRoot, 'src'), 'DiscoveryAid', file);
    },
  },
];

/**
 * Computes the live capabilities object for `project-summary.json` from
 * `CAPABILITIES` above. `forgeRoot` is the `artifacts/forge/` directory (parent of
 * `src/`).
 * @param {string} forgeRoot
 * @returns {Record<string, boolean>}
 */
export function computeCapabilities(forgeRoot) {
  /** @type {Record<string, boolean>} */
  const result = {};
  for (const capability of CAPABILITIES) {
    result[capability.key] = !!capability.detect(forgeRoot);
  }
  return result;
}
