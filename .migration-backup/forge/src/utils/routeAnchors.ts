export interface RouteAnchorDestination {
  pathname: string;
  hash: string;
}

/** Builds a React Router destination that preserves the route and carries an
 * in-page target separately. HashRouter serializes this as `#/path#target`. */
export function routeWithAnchor(pathname: string, targetId: string): RouteAnchorDestination {
  const normalizedTarget = targetId.replace(/^#/, '');
  return {
    pathname,
    hash: normalizedTarget ? `#${encodeURIComponent(normalizedTarget)}` : '',
  };
}

/** Returns the decoded target ID React Router exposes in location.hash. */
export function getRouteAnchorId(hash: string): string | null {
  if (!hash.startsWith('#')) return null;
  const encodedTarget = hash.slice(1);
  if (!encodedTarget) return null;

  try {
    return decodeURIComponent(encodedTarget);
  } catch {
    // Invalid percent-encoding must not break route rendering. The un-decoded
    // value still gives an element with a matching literal ID a chance to work.
    return encodedTarget;
  }
}

/** Focuses an explicitly focusable in-page target, then scrolls it below the
 * sticky navigation. Returns false when the destination has not mounted yet. */
export function focusAndScrollToId(targetId: string): boolean {
  const target = document.getElementById(targetId);
  if (!target) return false;

  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start' });
  return true;
}