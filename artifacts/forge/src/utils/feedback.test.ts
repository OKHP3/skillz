import { describe, expect, it } from 'vitest';
import { activeCatalogFilterCount, copyFeedback, favoriteFeedback, shareFeedback } from './feedback';

describe('accessible action feedback', () => {
  it('describes both successful and failed clipboard outcomes', () => {
    expect(copyFeedback('Skill URL', true)).toBe('Skill URL copied to clipboard.');
    expect(copyFeedback('Skill URL', false)).toBe('Could not copy skill url to the clipboard.');
  });

  it('distinguishes opening a native share sheet, copying a link, and failure', () => {
    expect(shareFeedback('Example skill', 'shared')).toBe('Share options opened for Example skill.');
    expect(shareFeedback('Example skill', 'copied')).toBe('Share link for Example skill copied to clipboard.');
    expect(shareFeedback('Example skill', 'failed')).toBe('Could not prepare a share link for Example skill.');
  });

  it('describes saved, removed, and failed favorite changes', () => {
    expect(favoriteFeedback('Example skill', 'saved')).toBe('Example skill saved to favorites.');
    expect(favoriteFeedback('Example skill', 'removed')).toBe('Example skill removed from favorites.');
    expect(favoriteFeedback('Example skill', 'failed')).toBe('Could not update favorites for Example skill.');
  });

  it('counts release-readiness as an active catalog filter', () => {
    expect(activeCatalogFilterCount({
      family: '',
      maturity: '',
      evidence: '',
      releaseReadiness: 'ready-for-peer-review',
    })).toBe(1);
  });
});