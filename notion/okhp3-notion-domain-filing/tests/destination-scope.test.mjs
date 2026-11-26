import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDestinationScope } from '../scripts/check-destination-scope.mjs';

const top = ['CAREER', 'FINANCE', 'HOME', 'PERSONAL', 'PROJECTS', 'TECHNOLOGY', 'TRAVEL'];
function fixture(destination = 'AUDITS') {
  const roots = [...top.map(hub => ({ hub, expected_parent: 'workspace_root' })),
    { hub: 'REFERENCE', expected_parent: 'BRAIN' }];
  return {
    trusted_roots: roots,
    configured_roots: structuredClone(roots),
    destination_id: destination,
    pages: [
      ...top.map(id => ({ id, parent: 'workspace_root', ancestry_complete: true, root_listing_verified: true })),
      { id: 'BRAIN', parent: 'workspace_root', ancestry_complete: true, root_listing_verified: true },
      { id: 'REFERENCE', parent: 'BRAIN', ancestry_complete: true },
      { id: 'AUDITS', parent: 'CAREER', ancestry_complete: true },
      { id: 'ARTICLE', parent: 'REFERENCE', ancestry_complete: true },
      { id: 'OTHER', parent: 'workspace_root', ancestry_complete: true, root_listing_verified: true },
      { id: 'LOOKALIKE', title: 'CAREER', parent: 'OTHER', ancestry_complete: true },
    ],
  };
}

test('seven exact top-level hubs and nested reference hub accept their real destinations', () => {
  for (const id of [...top, 'REFERENCE', 'AUDITS', 'ARTICLE']) assert.equal(checkDestinationScope(fixture(id)).allowed, true, id);
});
test('root discovery and title similarity do not authorize unrelated destinations', () => {
  for (const id of ['OTHER', 'LOOKALIKE', 'BRAIN', 'workspace_root']) {
    assert.deepEqual(checkDestinationScope(fixture(id)), { allowed: false, reason: 'outside_approved_roots' });
  }
});
test('mutable ninth root and parent changes fail closed', () => {
  const input = fixture('OTHER');
  input.configured_roots.push({ hub: 'OTHER', expected_parent: 'workspace_root' });
  assert.equal(checkDestinationScope(input).reason, 'mutable_scope_expansion');
  input.configured_roots = [{ hub: 'CAREER', expected_parent: 'OTHER' }];
  assert.equal(checkDestinationScope(input).reason, 'mutable_scope_expansion');
});
test('drift holds only destinations below the affected hub', () => {
  const input = fixture();
  input.pages.find(p => p.id === 'CAREER').parent = 'OTHER';
  assert.equal(checkDestinationScope(input).reason, 'unexpected_hub_parent');
  input.destination_id = 'ARTICLE';
  assert.equal(checkDestinationScope(input).allowed, true);
});
test('empty, incomplete, missing and cyclic ancestry never establishes approval', () => {
  for (const change of [
    x => { x.pages.find(p => p.id === 'CAREER').root_listing_verified = false; },
    x => { x.pages.find(p => p.id === 'AUDITS').ancestry_complete = false; },
    x => { x.pages.find(p => p.id === 'AUDITS').parent = ''; },
    x => { x.pages = x.pages.filter(p => p.id !== 'CAREER'); },
    x => { x.pages.find(p => p.id === 'AUDITS').parent = 'AUDITS'; },
    x => { x.pages.find(p => p.id === 'BRAIN').ancestry_complete = false; x.destination_id = 'ARTICLE'; },
  ]) {
    const input = fixture(); change(input);
    assert.equal(checkDestinationScope(input).allowed, false);
  }
});
test('private configuration can narrow trusted roots', () => {
  const input = fixture(); input.configured_roots = input.configured_roots.filter(r => r.hub === 'REFERENCE');
  assert.equal(checkDestinationScope(input).allowed, false);
  input.destination_id = 'ARTICLE'; assert.equal(checkDestinationScope(input).allowed, true);
});
test('repeated read-only checks preserve caller metadata and return the same decision', () => {
  const input = fixture();
  const before = structuredClone(input);
  assert.deepEqual(checkDestinationScope(input), checkDestinationScope(input));
  assert.deepEqual(input, before);
});
test('malformed, conflicting or absent authority fails closed', () => {
  for (const input of [null, {}, { ...fixture(), trusted_roots: [] }, { ...fixture(), configured_roots: [] }]) {
    assert.equal(checkDestinationScope(input).allowed, false);
  }
  const input = fixture(); input.pages.push(structuredClone(input.pages[0]));
  assert.equal(checkDestinationScope(input).reason, 'invalid_page_metadata');
});
