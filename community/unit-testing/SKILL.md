---
name: unit-testing
description: Writes unit tests for code that already exists — choosing what deserves a test, what the cases are, and how to assert without welding the test to the implementation. Use this whenever the user asks for tests, unit tests, more coverage, or tests for a specific function or module, and also when adding to untested code where a characterization test is needed first. For building new code test-first, use test-driven-development.
license: MIT
---

# Unit testing

A test earns its place by failing when something breaks and staying quiet otherwise. A test
that never fails is documentation with a runtime cost; a test that fails on every refactor is a
tax. Both get deleted eventually, and the second one takes the good tests' credibility with it.

Coverage is not the goal. Coverage measures which lines ran, not whether anything was checked —
a suite that executes everything and asserts nothing scores beautifully and catches nothing.

## 1. Decide what deserves a test

In descending order of value:

1. **Logic with branches** — conditionals, loops, calculations, parsing, state transitions
2. **Anything that has broken before** — bugs cluster; a fixed bug without a test will return
3. **Boundaries** — where data is validated, converted, or crosses a system edge
4. **Contracts other code relies on** — a public API's shape and its documented failure modes

Not worth it: generated code, thin pass-throughs, framework behaviour, getters, and anything
where the test would restate the implementation line for line.

**Done when:** you can say why each planned test exists, in terms of a failure it would catch.

## 2. Pick the seam

Test at the smallest **stable** interface that exposes the behaviour, not necessarily the
smallest unit. A private function extracted for tidiness is an implementation detail; testing
it directly freezes a decision you should be free to change.

If a behaviour is only reachable through six layers of setup, that is a design signal. Note it,
and test at the level that is reachable rather than mocking your way down.

**Done when:** the seam is one a caller would actually use.

## 3. Enumerate cases before writing any

Go through these deliberately — the value of a test suite is mostly in the cases people forget:

- **Typical:** the ordinary, realistic input
- **Empty:** zero items, empty string, no match, null where permitted
- **One:** the case where off-by-one hides
- **Many:** enough to expose ordering, pagination, accumulation
- **Boundary:** exactly at the limit, one either side
- **Invalid:** wrong type, wrong shape, out of range. What *should* happen? Assert that.
- **Duplicate / out of order:** for anything collection- or sequence-shaped
- **Failure of a dependency:** timeout, error, partial result

**Done when:** you have a written case list, with the ones you are deliberately skipping noted.

## 4. Write tests that survive refactoring

**Name the behaviour, not the function.** `returns_empty_list_when_no_orders_match` tells you
what broke from the failure output alone. `test_get_orders_2` tells you to go read it.

**One behaviour per test.** Multiple assertions are fine when they describe one outcome;
multiple *scenarios* in one test hide everything after the first failure.

**Arrange, act, assert — visibly separated.** If arrange is longer than the other two combined,
the code under test needs too much context, which is itself worth reporting.

**Assert against an independent expectation.** The expected value must come from somewhere
other than the code's own logic. Re-deriving it the same way the implementation does produces a
test that passes by construction and can never disagree — the most dangerous kind, because it
looks like coverage.

**Build test data with factories, not shared fixtures.** A fixture mutated by one test bleeds
into the next, and the resulting failures are order-dependent and miserable to find. Each test
should be readable alone.

**Done when:** you could rewrite the implementation entirely and the tests would still be
correct as specifications.

## 5. Testing code that was not built for it

When the code has no tests and you need to change it, do not start by testing what it *should*
do — pin down what it *does*:

1. Write **characterization tests** that assert current behaviour, including behaviour that
   looks wrong. You are building a safety net, not a specification.
2. Refactor under that net until the code is reachable.
3. *Then* fix the behaviour that was wrong, changing the test in the same commit so the change
   is visible in review.

Doing this in the other order means changing behaviour and structure at once, with no way to
tell which broke it.

## 6. Keep the suite trustworthy

- **A flaky test is a failing test.** Quarantine or fix it the day it appears. One tolerated
  flake teaches everyone to re-run red builds, and after that the suite means nothing.
- **Speed is correctness in practice.** A suite too slow to run is a suite not run.
- **Delete tests that no longer earn their place.** Tests for deleted behaviour, duplicates,
  and tests that only assert the mock was called.
- **When a bug escapes, ask which test should have caught it.** That question, answered
  honestly, improves the suite faster than any coverage target.
