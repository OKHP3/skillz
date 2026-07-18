import type { Skill } from '../types/catalog';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
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

export function getInstallCommand(skill: Skill): string {
  return skill.rawUrl;
}

export async function copyInstallCommand(skill: Skill): Promise<boolean> {
  return copyToClipboard(getInstallCommand(skill));
}

export async function copyRawUrl(skill: Skill): Promise<boolean> {
  return copyToClipboard(skill.rawUrl);
}

export async function shareSkill(skill: Skill): Promise<boolean> {
  const url = `${window.location.origin}/skills/${skill.family}/${skill.name}`;
  const shareData = {
    title: `${skill.name} — Skillz Forge`,
    text: skill.description,
    url,
  };

  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch {
    // Ignore AbortError from user canceling
  }

  // Clipboard fallback
  return copyToClipboard(url);
}

export async function shareStack(stackId: string, stackName: string): Promise<boolean> {
  const url = `${window.location.origin}/stacks/${stackId}`;
  const shareData = {
    title: `${stackName} — Skillz Forge`,
    text: `Agent Skill stack: ${stackName}`,
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

export function useFavorites() {
  const STORAGE_KEY = 'skillz-forge-favorites';

  function getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    } catch { /* ignore */ }
    return idx < 0; // true if now favorited
  }

  return { getFavorites, isFavorite, toggleFavorite };
}
