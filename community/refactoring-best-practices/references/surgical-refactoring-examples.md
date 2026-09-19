# Small refactorings with observable compatibility

These examples adapt the named constants, validation, and shipping-strategy ideas in
`community/refactor/SKILL.md`, an MIT-licensed source at Skillz commit
`ff61152eeda6d7985805c9049840964ca781394b`. The full original is preserved in the repository
archive; see [the consolidation record](consolidation-review-2026-09-19.md).

Runnable examples are in `../assets/surgical-refactoring-examples.cjs`, with deterministic
regression cases in `../evals/test-surgical-refactoring-examples.cjs`. Run from the package:

```text
node --test evals/test-surgical-refactoring-examples.cjs
```

These fixtures compare small JavaScript examples. They do not demonstrate live-agent uplift or
prove equivalence for arbitrary application code. Characterize the real target before adapting.

## Name an existing constant without broadening the rule

`total * 0.15` becomes `total * PREMIUM_DISCOUNT_RATE`, where the constant is exactly `0.15`.
Keep the function inputs, numeric operation, return type, and rounding behavior. Do not add a
negative-total exception, date parameter, or richer return object under the heading of type
safety. Those are separate behavioral changes even if they seem desirable.

## Extract validation while keeping every diagnostic

The original validation contract returns an array of errors, in this order: required/invalid
email, missing name, age under 18, blocked country. A valid record returns `[]`. Extracting
email validation must preserve that order, the email `else if`, and the rest of the checks.
It must also preserve the call to the existing email predicate only when an email is present.

The runnable `validateAfter` delegates just that first decision to `emailErrors`, then appends
the other errors as before. Cases include multiple simultaneous failures. Do not substitute a
first-error string or `null` for the error array, or skip later diagnostics after a failure.

## Put a shipping strategy behind the existing entry point

The public call remains `calculateShipping(order, method)`. Internal strategies retain the
same rates and strict thresholds: standard shipping is free only above 50; express drops to
9.99 only above 100; overnight is 29.99. An unknown method still returns `undefined` because
that is the observed contract in the example.

`shippingAfter` selects an internal function while retaining strict method comparisons. It
does not introduce a map with inherited-key or coercion surprises, mutate the order, or require
callers to supply a strategy object. If the real application should reject unknown methods,
propose that as a separate, characterized behavior change. If there is no real variation or
change pressure, keep the simpler conditional instead of adding strategies speculatively.
