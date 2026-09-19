'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  discountBefore, discountAfter, validateBefore, validateAfter, shippingBefore, shippingAfter,
} = require('../assets/surgical-refactoring-examples.cjs');

test('naming a rate retains the numeric result without adding validation', () => {
  for (const total of [-20, -0, 0, 0.1, 100, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(discountAfter(total), discountBefore(total));
  }
});

test('validation retains every error, ordering, and the valid empty array', () => {
  const isValidEmail = email => email === 'valid@example.test';
  for (const email of ['', 'invalid', 'valid@example.test']) {
    for (const name of ['', 'Example']) {
      for (const age of [17, 18]) {
        for (const country of ['blocked', 'allowed']) {
          const user = { email, name, age, country };
          assert.deepEqual(validateAfter(user, isValidEmail), validateBefore(user, isValidEmail));
        }
      }
    }
  }
  assert.deepEqual(validateAfter({ email: '', name: '', age: 17, country: 'blocked' }, isValidEmail),
    ['Email required', 'Name required', 'Must be 18+', 'Country not supported']);
  assert.deepEqual(validateAfter({ email: 'valid@example.test', name: 'Example', age: 18, country: 'allowed' }, isValidEmail), []);
});

test('validation preserves when the supplied email predicate runs and throws', () => {
  for (const validate of [validateBefore, validateAfter]) {
    let calls = 0;
    const predicate = () => { calls += 1; throw new Error('predicate unavailable'); };
    validate({ email: '', name: '', age: 17 }, predicate);
    assert.equal(calls, 0);
    assert.throws(() => validate({ email: 'x' }, predicate), /predicate unavailable/);
    assert.equal(calls, 1);
  }
});

test('shipping keeps both strict thresholds and does not mutate the order', () => {
  for (const total of [-1, 0, 49.99, 50, 50.01, 99.99, 100, 100.01, Number.NaN]) {
    for (const method of ['standard', 'express', 'overnight']) {
      const order = Object.freeze({ total });
      assert.equal(shippingAfter(order, method), shippingBefore(order, method));
    }
  }
  assert.equal(shippingAfter({ total: 50 }, 'standard'), 5.99);
  assert.equal(shippingAfter({ total: 100 }, 'express'), 14.99);
});

test('unknown methods preserve undefined without reading order.total', () => {
  for (const method of ['unknown', 'toString', '__proto__', '', null, undefined, new String('standard')]) {
    const order = { get total() { throw new Error('must not read'); } };
    assert.equal(shippingBefore(order, method), undefined);
    assert.equal(shippingAfter(order, method), undefined);
  }
});
