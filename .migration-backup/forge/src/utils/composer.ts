import type { Skill } from '../types/catalog';

// ─── Local stack composer (Release 2) ──────────────────────────────────────
// Browser-only, versioned localStorage. No account, no server, no write-scoped
// GitHub access — this is a scratch list a visitor builds while browsing and
// can export as a shareable brief. It never claims to install anything or to
// resolve undeclared dependencies (SKILL.md `companions` are suggestions, not
// enforced prerequisites).

export const COMPOSER_STORAGE_KEY = 'skillz-forge-composer-v1';
export const COMPOSER_MAX_ITEMS = 8;

export interface ComposerItem {
  name: string;
  optional: boolean;
  note: string;
}

interface ComposerStateV1 {
  version: 1;
  items: ComposerItem[];
}

function isValidState(v: unknown): v is ComposerStateV1 {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    obj.version === 1 &&
    Array.isArray(obj.items) &&
    obj.items.every(i => i && typeof (i as ComposerItem).name === 'string')
  );
}

/** Loads the composer's saved items. An unrecognized or corrupt shape (e.g.
 *  from a future schema version) resets to empty rather than guess-migrating
 *  — this is local, non-authoritative scratch data the visitor can trivially
 *  rebuild by re-adding skills, so a hard reset is safe and simpler than a
 *  silent partial migration. */
export function loadComposerState(): ComposerItem[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(COMPOSER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return isValidState(parsed) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function saveComposerState(items: ComposerItem[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const state: ComposerStateV1 = { version: 1, items };
    localStorage.setItem(COMPOSER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private browsing, quota exceeded, disabled
    // storage) — the in-memory stack still works for the current session.
  }
}

export interface CompanionSuggestion {
  /** Skill already in the stack that declares the companion relationship. */
  from: string;
  /** The companion skill name — may or may not exist in the current catalog. */
  companion: string;
}

/** Real, declared companion relationships (`skill.companions`) for skills
 *  currently in the stack, where the companion is not already in the stack.
 *  Purely informational — a companion is an authored suggestion, never an
 *  enforced or fabricated dependency. */
export function getCompanionSuggestions(items: ComposerItem[], allSkills: Skill[]): CompanionSuggestion[] {
  const inStack = new Set(items.map(i => i.name));
  const suggestions: CompanionSuggestion[] = [];
  for (const item of items) {
    const skill = allSkills.find(s => s.name === item.name);
    if (!skill) continue;
    for (const c of skill.companions) {
      if (!inStack.has(c) && !suggestions.some(s => s.companion === c)) {
        suggestions.push({ from: item.name, companion: c });
      }
    }
  }
  return suggestions;
}

/** Wall-clock source used by export builders. `window.location.href` in the
 *  browser (the page the visitor was on when they exported), a fixed
 *  canonical fallback under SSR/test environments where `window` is
 *  undefined. */
function currentSourceUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : 'https://okhp3.github.io/skillz';
}

function currentExportTimestamp(): string {
  return new Date().toISOString();
}

/** Fixed caveat text every exported handoff carries, regardless of format.
 *  Exports are a local, unvalidated compilation — never a claim that the
 *  combination has been reviewed, tested together, or is safe to run as-is. */
export const EXPORT_CAVEATS =
  'This is a locally composed reference list, not a validated bundle. Companion relationships are ' +
  'author-declared suggestions, not enforced dependencies, and no skill\'s maturity or evidence claims ' +
  'have been re-verified as part of this export.';

export function buildMarkdownBrief(items: ComposerItem[], allSkills: Skill[]): string {
  const lines: string[] = [];
  lines.push('# Skillz Forge — Local Stack Brief');
  lines.push('');
  lines.push(`${items.length} skill${items.length !== 1 ? 's' : ''}, composed locally in the browser.`);
  lines.push('');
  lines.push(
    'This brief was built entirely on the visitor\'s device. It does not install anything, ' +
    'contact any server, or resolve undeclared dependencies — it is a shareable list of raw skill ' +
    'file URLs and notes for the skills selected.'
  );
  lines.push('');
  lines.push(`- **Source:** ${currentSourceUrl()}`);
  lines.push(`- **Exported:** ${currentExportTimestamp()}`);
  lines.push('');
  lines.push(`> **Caveat:** ${EXPORT_CAVEATS}`);
  lines.push('');

  items.forEach((item, i) => {
    const skill = allSkills.find(s => s.name === item.name);
    lines.push(`## ${i + 1}. ${skill?.displayName || item.name}${item.optional ? ' (optional)' : ''}`);
    lines.push('');
    if (skill) {
      if (skill.description) lines.push(skill.description, '');
      lines.push(`- Family: \`${skill.family}\``);
      lines.push(`- Maturity: ${skill.maturity}`);
      lines.push(`- Skill file URL: ${skill.rawUrl}`);
    } else {
      lines.push('_This skill is no longer present in the catalog — it may have been renamed or removed._');
    }
    if (item.note.trim()) {
      lines.push('', `**Note:** ${item.note.trim()}`);
    }
    lines.push('');
  });

  const report = getStackIntegrityReport(items, allSkills);
  if (report.unresolvedItems.length > 0 || report.companionSuggestions.length > 0) {
    lines.push('## Unresolved relationships');
    lines.push('');
    for (const name of report.unresolvedItems) {
      lines.push(`- \`${name}\` is no longer present in the catalog and could not be resolved.`);
    }
    for (const s of report.companionSuggestions) {
      lines.push(`- \`${s.from}\` declares a companion relationship with \`${s.companion}\`, not currently included here.`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export interface JsonManifestItem {
  name: string;
  family: string | null;
  optional: boolean;
  note: string;
  installUrl: string | null;
  resolved: boolean;
}

export interface JsonManifest {
  version: 1;
  source: 'skillz-forge-local-stack-composer';
  sourceUrl: string;
  exportedAt: string;
  caveats: string;
  itemCount: number;
  items: JsonManifestItem[];
  unresolvedRelationships: {
    unresolvedItems: string[];
    companionSuggestions: CompanionSuggestion[];
  };
}

export function buildJsonManifest(items: ComposerItem[], allSkills: Skill[]): JsonManifest {
  const report = getStackIntegrityReport(items, allSkills);
  return {
    version: 1,
    source: 'skillz-forge-local-stack-composer',
    sourceUrl: currentSourceUrl(),
    exportedAt: currentExportTimestamp(),
    caveats: EXPORT_CAVEATS,
    itemCount: items.length,
    items: items.map(item => {
      const skill = allSkills.find(s => s.name === item.name);
      return {
        name: item.name,
        family: skill?.family ?? null,
        optional: item.optional,
        note: item.note,
        installUrl: skill?.rawUrl ?? null,
        resolved: Boolean(skill),
      };
    }),
    unresolvedRelationships: {
      unresolvedItems: report.unresolvedItems,
      companionSuggestions: report.companionSuggestions,
    },
  };
}

// ─── Stack integrity (Release 3) ───────────────────────────────────────────
// A read-only report surfaced in the composer panel and included in every
// export. It never asserts the stack as a whole is "validated," "safe," or
// "compatible" — it only restates what is or is not declared/on-file for
// each individual skill, so a visitor can judge risk themselves.

export interface MaturityWarning {
  name: string;
  maturity: Skill['maturity'];
  evidenceStatus: Skill['evidence']['status'];
  note: string;
}

export interface StackIntegrityReport {
  companionSuggestions: CompanionSuggestion[];
  unresolvedItems: string[];
  maturityWarnings: MaturityWarning[];
}

const LOW_MATURITY_LEVELS = new Set<Skill['maturity']>(['placeholder', 'skeleton']);
const WEAK_EVIDENCE_STATUSES = new Set<Skill['evidence']['status']>(['none', 'not-run']);

/** Aggregates everything the composer knows about a stack's reliability
 *  gaps: catalog items that no longer resolve, companions the source skills
 *  declare but the stack doesn't include, and skills whose maturity or
 *  evidence-contract-v2 status is weak enough to flag. Every field here is
 *  read directly off already-derived catalog data — nothing is inferred
 *  from name/family, and nothing here amounts to a pass/fail verdict on the
 *  stack as a whole. */
export function getStackIntegrityReport(items: ComposerItem[], allSkills: Skill[]): StackIntegrityReport {
  const companionSuggestions = getCompanionSuggestions(items, allSkills);
  const unresolvedItems = items
    .filter(item => !allSkills.some(s => s.name === item.name))
    .map(item => item.name);

  const maturityWarnings: MaturityWarning[] = [];
  for (const item of items) {
    const skill = allSkills.find(s => s.name === item.name);
    if (!skill) continue;
    const lowMaturity = LOW_MATURITY_LEVELS.has(skill.maturity);
    const weakEvidence = WEAK_EVIDENCE_STATUSES.has(skill.evidence.status);
    if (!lowMaturity && !weakEvidence) continue;
    const parts: string[] = [];
    if (lowMaturity) parts.push(`maturity is "${skill.maturity}"`);
    if (weakEvidence) parts.push(`evidence status is "${skill.evidence.status}"`);
    maturityWarnings.push({
      name: skill.name,
      maturity: skill.maturity,
      evidenceStatus: skill.evidence.status,
      note: parts.join(' and '),
    });
  }

  return { companionSuggestions, unresolvedItems, maturityWarnings };
}
