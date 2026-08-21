import { describe, expect, it } from 'vitest';
import { getRouteAnchorId, routeWithAnchor } from './routeAnchors';

describe('HashRouter route anchors', () => {
  it('keeps the pathname and in-page target separate for a HashRouter URL', () => {
    const destination = routeWithAnchor('/faq', 'maturity-label');

    expect(destination).toEqual({
      pathname: '/faq',
      hash: '#maturity-label',
    });
    expect(`#/faq${destination.hash}`).toBe('#/faq#maturity-label');
  });

  it('round-trips a fragment target exposed by React Router', () => {
    expect(getRouteAnchorId('#full-contract')).toBe('full-contract');
    expect(getRouteAnchorId('#section%20one')).toBe('section one');
    expect(getRouteAnchorId('')).toBeNull();
    expect(getRouteAnchorId('/explore')).toBeNull();
  });

  it('does not throw for malformed percent-encoding in an incoming URL', () => {
    expect(getRouteAnchorId('#bad%2')).toBe('bad%2');
  });
});