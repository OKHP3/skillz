#!/usr/bin/env node
/**
 * okhp3-daily-oracle — test-oracle-apis.cjs
 * Tests connectivity and response shapes for the two free APIs used by the oracle.
 *
 * Usage:
 *   node .agents/skills/okhp3-daily-oracle/scripts/test-oracle-apis.cjs
 *   node .agents/skills/okhp3-daily-oracle/scripts/test-oracle-apis.cjs --sign scorpio
 *
 * Options:
 *   --sign <sign>   zodiac sign for horoscope test (default: cancer)
 *
 * No dependencies — uses Node.js built-in https module.
 * Exit 0 = all checks pass.  Exit 1 = one or more checks failed.
 */

'use strict';

const https  = require('https');
const args   = process.argv.slice(2);
const signIdx = args.indexOf('--sign');
const SIGN   = signIdx !== -1 ? args[signIdx + 1] : 'cancer';

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.log(`  ✗  ${label}`);
    if (detail) console.log(`       → ${detail}`);
    failed++;
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'okhp3-daily-oracle-test/1.3.0' } }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: null, raw: body.slice(0, 200) }); }
      });
    }).on('error', reject);
  });
}

async function testTarotApi() {
  console.log('\n  ── tarotapi.dev ────────────────────────────────');
  try {
    const { status, data } = await fetchJSON('https://tarotapi.dev/api/v1/cards/random?n=1');
    check('HTTP 200', status === 200, `got ${status}`);
    check('Response has cards array', Array.isArray(data?.cards), `data.cards = ${JSON.stringify(data?.cards)?.slice(0, 80)}`);
    const card = data?.cards?.[0];
    check('Card has name field',       typeof card?.name        === 'string', `name = ${card?.name}`);
    check('Card has meaning_up field', typeof card?.meaning_up  === 'string', `meaning_up = ${card?.meaning_up?.slice(0, 60)}`);
    check('Card has type field',       typeof card?.type        === 'string', `type = ${card?.type}`);
    if (card) {
      console.log(`       Sample: "${card.name}" (${card.type}) — "${card.meaning_up?.slice(0, 50)}..."`);
    }
  } catch (err) {
    console.log(`  ✗  FETCH FAILED: ${err.message}`);
    failed++;
  }
}

async function testHoroscopeApi() {
  console.log(`\n  ── freehoroscopeapi.com (sign: ${SIGN}) ─────────────`);
  try {
    const url = `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${SIGN.toLowerCase()}`;
    const { status, data } = await fetchJSON(url);
    check('HTTP 200',                status === 200, `got ${status}`);
    check('Response has data field', typeof data?.data === 'object', `data.data = ${JSON.stringify(data?.data)?.slice(0, 80)}`);
    const horoscope = data?.data?.horoscope;
    check('Horoscope text present',  typeof horoscope === 'string' && horoscope.length > 10, `horoscope = "${horoscope?.slice(0, 60)}"`);
    if (horoscope) {
      console.log(`       Sample: "${horoscope.slice(0, 80)}..."`);
    }
  } catch (err) {
    console.log(`  ✗  FETCH FAILED: ${err.message}`);
    console.log(`       The horoscope API is optional — the oracle degrades gracefully if unavailable.`);
    failed++;
  }
}

async function main() {
  console.log('\n  okhp3-daily-oracle — API connectivity check');
  console.log('  ════════════════════════════════════════════');

  await testTarotApi();
  await testHoroscopeApi();

  console.log('\n  ── Summary ─────────────────────────────────────────');
  console.log(`  Passed: ${passed}   Failed: ${failed}`);

  if (failed === 0) {
    console.log('  ✓ All API checks pass — oracle is ready to use.');
  } else {
    console.log('  ⚠ Some checks failed. The oracle uses fallbacks for all failures.');
    console.log('    Review failed checks above. Network issues are transient.');
  }
  console.log('');

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error(`\n  Fatal: ${err.message}`);
  process.exit(1);
});
