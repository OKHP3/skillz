import { pathToFileURL } from 'node:url';

// Offline boundary check only. Caller supplies independently observed metadata.
export function checkDestinationScope(input) {
  const held = (reason) => ({ allowed: false, reason });
  if (!input || !Array.isArray(input.trusted_roots) || !input.trusted_roots.length ||
      !Array.isArray(input.configured_roots) || !input.configured_roots.length ||
      !Array.isArray(input.pages) || typeof input.destination_id !== 'string') {
    return held('invalid_input');
  }
  const trusted = new Map();
  for (const root of input.trusted_roots) {
    if (!root || typeof root.hub !== 'string' || !root.hub ||
        typeof root.expected_parent !== 'string' || !root.expected_parent ||
        root.hub === root.expected_parent || trusted.has(root.hub)) return held('invalid_trusted_roots');
    trusted.set(root.hub, root.expected_parent);
  }
  const configured = new Set();
  for (const root of input.configured_roots) {
    if (!root || !trusted.has(root.hub) || trusted.get(root.hub) !== root.expected_parent ||
        configured.has(root.hub)) return held('mutable_scope_expansion');
    configured.add(root.hub);
  }
  const pages = new Map();
  for (const page of input.pages) {
    if (!page || typeof page.id !== 'string' || !page.id || pages.has(page.id)) return held('invalid_page_metadata');
    pages.set(page.id, page);
  }
  const seen = new Set();
  let current = input.destination_id;
  let approvedHub;
  while (current !== 'workspace_root') {
    if (seen.has(current)) return held('cyclic_ancestry');
    seen.add(current);
    const page = pages.get(current);
    if (!page || page.ancestry_complete !== true || typeof page.parent !== 'string' || !page.parent) {
      return held('incomplete_ancestry');
    }
    if (configured.has(current)) {
      if (page.parent !== trusted.get(current)) return held('unexpected_hub_parent');
      approvedHub ??= current;
    }
    if (page.parent === 'workspace_root' && page.root_listing_verified !== true) return held('unverified_workspace_root');
    current = page.parent;
  }
  return approvedHub ? { allowed: true, hub: approvedHub } : held('outside_approved_roots');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.slice(2).length) {
    if (process.argv[2] === '--help' && process.argv.length === 3) {
      console.log('Read JSON metadata from stdin; output a destination-boundary decision. No network or Notion writes. See references/validation.md.');
    } else {
      console.error('Use --help or supply JSON on stdin.');
      process.exitCode = 1;
    }
  } else {
    try {
      let data = '';
      for await (const chunk of process.stdin) data += chunk;
      const result = checkDestinationScope(JSON.parse(data));
      console.log(JSON.stringify(result));
      process.exitCode = result.allowed ? 0 : 1;
    } catch {
      console.log(JSON.stringify({ allowed: false, reason: 'invalid_input' }));
      process.exitCode = 1;
    }
  }
}
