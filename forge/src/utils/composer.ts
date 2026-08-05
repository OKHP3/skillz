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

export function buildMarkdownBrief(items: ComposerItem[], allSkills: Skill[]): string {
  const lines: string[] = [];
  lines.push('# Skillz Forge — Local Stack Brief');
  lines.push('');
  lines.push(`${items.length} skill${items.length !== 1 ? 's' : ''}, composed locally in the browser.`);
  lines.push('');
  lines.push(
    'This brief was built entirely on the visitor\'s device. It does not install anything, ' +
    'contact any server, or resolve undeclared dependencies — it is a shareable list of install ' +
    'URLs and notes for the skills selected.'
  );
  lines.push('');

  items.forEach((item, i) => {
    const skill = allSkills.find(s => s.name === item.name);
    lines.push(`## ${i + 1}. ${skill?.displayName || item.name}${item.optional ? ' (optional)' : ''}`);
    lines.push('');
    if (skill) {
      if (skill.description) lines.push(skill.description, '');
      lines.push(`- Family: \`${skill.family}\``);
      lines.push(`- Maturity: ${skill.maturity}`);
      lines.push(`- Install: ${skill.rawUrl}`);
    } else {
      lines.push('_This skill is no longer present in the catalog — it may have been renamed or removed._');
    }
    if (item.note.trim()) {
      lines.push('', `**Note:** ${item.note.trim()}`);
    }
    lines.push('');
  });

  const suggestions = getCompanionSuggestions(items, allSkills);
  if (suggestions.length > 0) {
    lines.push('## Declared companions not in this stack');
    lines.push('');
    for (const s of suggestions) {
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
  itemCount: number;
  items: JsonManifestItem[];
}

export function buildJsonManifest(items: ComposerItem[], allSkills: Skill[]): JsonManifest {
  return {
    version: 1,
    source: 'skillz-forge-local-stack-composer',
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
  };
}
