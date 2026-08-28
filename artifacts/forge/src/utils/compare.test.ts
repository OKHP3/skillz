import { describe, expect, it } from 'vitest';
import {
  addToCompareSelection,
  comparePath,
  normalizeCompareSelection,
  parseCompareSelection,
} from './compare';

describe('compare selection', () => {
  it('parses, trims, and deduplicates URL selections', () => {
    expect(parseCompareSelection(' first,second,first, ,third ')).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('adds a distinct skill without replacing existing selections', () => {
    expect(addToCompareSelection(['first'], 'second')).toEqual(['first', 'second']);
    expect(addToCompareSelection(['first'], 'first')).toEqual(['first']);
  });

  it('caps a comparison at four skills', () => {
    expect(normalizeCompareSelection(['one', 'two', 'three', 'four', 'five'])).toEqual([
      'one',
      'two',
      'three',
      'four',
    ]);
  });

  it('builds a shareable encoded comparison route', () => {
    expect(comparePath(['one', 'two'])).toBe('/compare?skills=one%2Ctwo');
    expect(comparePath([])).toBe('/compare');
  });
});