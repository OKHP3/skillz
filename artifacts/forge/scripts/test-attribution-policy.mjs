import assert from 'node:assert/strict';
import { attributionLinksOmitted } from './build-catalog.js';

assert.equal(attributionLinksOmitted(undefined), false);
assert.equal(attributionLinksOmitted(null), false);
assert.equal(attributionLinksOmitted('omitted-by-author'), true);
for (const invalid of [true, false, '', 'false', 'true', {}, []]) {
  assert.throws(() => attributionLinksOmitted(invalid));
}
console.log('Attribution policy: explicit opt-out accepted; absent/invalid declarations cannot silently waive requirements.');
