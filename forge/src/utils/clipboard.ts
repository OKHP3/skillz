import type { Skill } from '../types/catalog';

/** Canonical public base for share URLs — always points to the live site */
const FORGE_CANONICAL = 'https://okhp3.github.io/skillz';

/**
 * Returns the base URL to use for share links.
 * On the live GitHub Pages domain, uses the canonical URL.
 * In local dev, builds a hash URL relative to the current origin so
 * shared URLs still work when opened in a browser.
 */
function getShareBase(): string {
  if (typeof window === 'undefined') return FORGE_CANONICAL;
  const { hostname } = window.location;
  if (hostname === 'okhp3.github.io' || hostname === 'overkillhill.com') {
    return FORGE_CANONICAL;
  }
  // Dev: use current origin so links open correctly in local browser
  return window.location.origin;
}

/** Builds a hash-safe share URL for any in-app route */
export function buildShareUrl(hashPath: string): string {
  return `${getShareBase()}/#${hashPath}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / non-secure contexts
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function getInstallUrl(skill: Skill): string {
  return skill.rawUrl;
}

export async function copyInstallUrl(skill: Skill): Promise<boolean> {
  return copyToClipboard(getInstallUrl(skill));
}

export async function copyRawUrl(skill: Skill): Promise<boolean> {
  return copyToClipboard(skill.rawUrl);
}

export async function shareSkill(skill: Skill): Promise<boolean> {
  const url = buildShareUrl(`/skills/${skill.family}/${skill.name}`);
  const shareData = {
    title: `${skill.name} — Skillz Forge`,
    text: skill.description || `${skill.name} — reusable agent skill`,
    url,
  };

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch {
    // Ignore AbortError from user canceling native share sheet
  }

  return copyToClipboard(url);
}

export async function shareStack(stackId: string, stackName: string): Promise<boolean> {
  const url = buildShareUrl(`/stacks/${stackId}`);
  const shareData = {
    title: `${stackName} — Skillz Forge`,
    text: `Agent skill stack: ${stackName}`,
    url,
  };

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch { /* ignore */ }

  return copyToClipboard(url);
}

export async function shareSearch(query: string, family?: string): Promise<boolean> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (family) params.set('family', family);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const url = buildShareUrl(`/explore${suffix}`);
  return copyToClipboard(url);
}

export async function shareCompare(skillNames: string[]): Promise<boolean> {
  const url = buildShareUrl(`/compare?skills=${skillNames.join(',')}`);
  return copyToClipboard(url);
}

// ─── Favorites (localStorage) ─────────────────────────────────────────────────

const FAVORITES_KEY = 'skillz-forge-favorites';

export function useFavorites() {
  function getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function isFavorite(skillName: string): boolean {
    return getFavorites().includes(skillName);
  }

  function toggleFavorite(skillName: string): boolean {
    const favs = getFavorites();
    const idx = favs.indexOf(skillName);
    if (idx >= 0) {
      favs.splice(idx, 1);
    } else {
      favs.push(skillName);
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    } catch { /* ignore storage errors */ }
    return idx < 0;
  }

  return { getFavorites, isFavorite, toggleFavorite };
}
