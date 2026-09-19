// Adapted from community/refactor at ff61152eeda6d7985805c9049840964ca781394b.
// MIT; see LICENSE and references/consolidation-review-2026-09-19.md.
// Illustrative contracts, not application-specific validation or shipping policy.
'use strict';

const PREMIUM_DISCOUNT_RATE = 0.15;
const discountBefore = total => total * 0.15;
const discountAfter = total => total * PREMIUM_DISCOUNT_RATE;

function validateBefore(user, isValidEmail) {
  const errors = [];
  if (!user.email) errors.push('Email required');
  else if (!isValidEmail(user.email)) errors.push('Invalid email');
  if (!user.name) errors.push('Name required');
  if (user.age < 18) errors.push('Must be 18+');
  if (user.country === 'blocked') errors.push('Country not supported');
  return errors;
}

function emailErrors(user, isValidEmail) {
  if (!user.email) return ['Email required'];
  if (!isValidEmail(user.email)) return ['Invalid email'];
  return [];
}

function validateAfter(user, isValidEmail) {
  const errors = [];
  errors.push(...emailErrors(user, isValidEmail));
  if (!user.name) errors.push('Name required');
  if (user.age < 18) errors.push('Must be 18+');
  if (user.country === 'blocked') errors.push('Country not supported');
  return errors;
}

function shippingBefore(order, method) {
  if (method === 'standard') {
    return order.total > 50 ? 0 : 5.99;
  } else if (method === 'express') {
    return order.total > 100 ? 9.99 : 14.99;
  } else if (method === 'overnight') {
    return 29.99;
  }
}

const standardShipping = order => order.total > 50 ? 0 : 5.99;
const expressShipping = order => order.total > 100 ? 9.99 : 14.99;
const overnightShipping = () => 29.99;

function shippingAfter(order, method) {
  if (method === 'standard') return standardShipping(order);
  if (method === 'express') return expressShipping(order);
  if (method === 'overnight') return overnightShipping(order);
}

module.exports = {
  discountBefore, discountAfter,
  validateBefore, validateAfter,
  shippingBefore, shippingAfter,
};
