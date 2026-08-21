import type { FilterState } from '../types/catalog';

export type ShareOutcome = 'shared' | 'copied' | 'failed';
export type FavoriteOutcome = 'saved' | 'removed' | 'failed';

export function copyFeedback(label: string, copied: boolean): string {
  return copied
    ? `${label} copied to clipboard.`
    : `Could not copy ${label.toLowerCase()} to the clipboard.`;
}

export function shareFeedback(label: string, outcome: ShareOutcome): string {
  switch (outcome) {
    case 'shared':
      return `Share options opened for ${label}.`;
    case 'copied':
      return `Share link for ${label} copied to clipboard.`;
    case 'failed':
      return `Could not prepare a share link for ${label}.`;
  }
}

export function favoriteFeedback(label: string, outcome: FavoriteOutcome): string {
  switch (outcome) {
    case 'saved':
      return `${label} saved to favorites.`;
    case 'removed':
      return `${label} removed from favorites.`;
    case 'failed':
      return `Could not update favorites for ${label}.`;
  }
}

export function activeCatalogFilterCount(filters: Pick<FilterState, 'family' | 'maturity' | 'evidence' | 'releaseReadiness'>): number {
  return [filters.family, filters.maturity, filters.evidence, filters.releaseReadiness]
    .filter(Boolean)
    .length;
}