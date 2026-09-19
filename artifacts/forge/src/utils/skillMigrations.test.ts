import { afterEach, describe, expect, it, vi } from 'vitest';
import { canonicalSkillIdentity, canonicalSkillName } from './skillMigrations';
import { parseCompareSelection } from './compare';
import { loadComposerState, migrateComposerItems } from './composer';
import { useFavorites } from './clipboard';
import { findSkill } from '../../../forge-review-desk/src/lib/catalog';
import type { Catalog as ReviewCatalog } from '../../../forge-review-desk/src/types/catalog';

afterEach(() => vi.unstubAllGlobals());

describe('skill migration compatibility', () => {
  it('resolves the old family and name without fuzzy-matching another family', () => {
    expect(canonicalSkillIdentity('universal', 'sp-build-auditor')).toEqual({
      family: 'copilot', name: 'okhp3-sharepoint-content-auditor',
    });
    expect(canonicalSkillIdentity('unknown', 'sp-build-auditor')).toEqual({ family: 'unknown', name: 'sp-build-auditor' });
    expect(canonicalSkillName('okhp3-repo-settings')).toBe('okhp3-repository-settings');
  });

  it('normalizes old compare URLs before deduplication and the selection cap', () => {
    expect(parseCompareSelection('sp-build-auditor,okhp3-sharepoint-content-auditor,sp-list-architect')).toEqual([
      'okhp3-sharepoint-content-auditor', 'okhp3-sharepoint-list-schema-design',
    ]);
  });

  it('opens a Review Desk alias against the current contract identity', () => {
    const current = { family: 'copilot', name: 'okhp3-sharepoint-content-auditor' };
    const catalog = { skills: [current] } as ReviewCatalog;
    expect(findSkill(catalog, 'universal', 'sp-build-auditor')).toBe(current);
    expect(findSkill(catalog, 'unknown', 'sp-build-auditor')).toBeUndefined();
  });

  it('preserves both notes and a required flag when saved composer aliases converge', () => {
    const items = [
      { name: 'okhp3-repl-repo-janitor', optional: true, note: 'Keep recovery references.' },
      { name: 'okhp3-replit-repl-janitor', optional: false, note: 'Check current pull requests.' },
    ];
    const expected = [{ name: 'okhp3-replit-repository-janitor', optional: false, note: 'Keep recovery references.\n\nCheck current pull requests.' }];
    expect(migrateComposerItems(items)).toEqual(expected);
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ version: 1, items }) });
    expect(loadComposerState()).toEqual(expected);
  });

  it('preserves favorites under the canonical name and tolerates malformed stored data', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(['sp-build-auditor', 'okhp3-sharepoint-content-auditor', 42]) });
    expect(useFavorites().getFavorites()).toEqual(['okhp3-sharepoint-content-auditor']);
    vi.stubGlobal('localStorage', { getItem: () => '{"wrong":"shape"}' });
    expect(useFavorites().getFavorites()).toEqual([]);
  });
});
