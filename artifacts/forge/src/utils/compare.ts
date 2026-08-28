export const COMPARE_MAX_ITEMS = 4;
const COMPARE_STORAGE_KEY = 'skillz-forge-compare';

export function normalizeCompareSelection(names: string[]): string[] {
  return [...new Set(names.map(name => name.trim()).filter(Boolean))].slice(0, COMPARE_MAX_ITEMS);
}

export function parseCompareSelection(value: string | null): string[] {
  return normalizeCompareSelection((value ?? '').split(','));
}

export function addToCompareSelection(names: string[], name: string): string[] {
  return normalizeCompareSelection([...names, name]);
}

export function loadCompareSelection(): string[] {
  try {
    const value = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? normalizeCompareSelection(parsed.filter((item): item is string => typeof item === 'string'))
      : [];
  } catch {
    return [];
  }
}

export function saveCompareSelection(names: string[]): void {
  try {
    const normalized = normalizeCompareSelection(names);
    if (normalized.length === 0) {
      sessionStorage.removeItem(COMPARE_STORAGE_KEY);
    } else {
      sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized));
    }
  } catch {
    // The URL remains the source of truth when browser storage is unavailable.
  }
}

export function comparePath(names: string[]): string {
  const normalized = normalizeCompareSelection(names);
  return normalized.length > 0
    ? `/compare?skills=${encodeURIComponent(normalized.join(','))}`
    : '/compare';
}

export function comparePathWithSkill(name: string): string {
  const next = addToCompareSelection(loadCompareSelection(), name);
  saveCompareSelection(next);
  return comparePath(next);
}