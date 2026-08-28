---
name: integration-testing
description: Tests that components work together — service against real database, API against real dependencies, module against module. Use this whenever the user mentions integration tests, testing against a real database or queue, contract testing between services, or has unit tests passing while the system is still broken. For testing one unit in isolation, use unit-testing; for driving a real browser, use browser-testing.
license: MIT
---

# Integration testing

Unit tests prove each piece works against your assumptions about its neighbours. Integration
tests prove the assumptions were right. Almost every "all tests pass but production is broken"
story lives in that gap — a mock that returns a shape the real service never returns.

These cost more than unit tests and less than end-to-end. Spend them on the seams where your
assumptions about someone else's behaviour are most likely wrong.

## 1. Pick the seams worth the cost

Test the boundaries where you cross into something you do not control:

- **Your code against a real database:** queries, migrations, transactions, constraints. The
  highest-value integration tests in most applications, because SQL and ORM behaviour is where
  mocks lie most.
- **Your service against its dependencies:** real HTTP, real serialization.
- **Message producers against consumers:** that the payload one writes is one the other parses.
- **Your code against the filesystem, clock, or queue**, where behaviour is subtle.

Do not integration-test pure logic. If it has no boundary, it belongs in a unit test.

**Done when:** each planned test crosses a boundary you do not own.

## 2. Use the real thing, not a mock

The entire point is exercising real behaviour. A mocked database tests your mock.

- **Containers for infrastructure:** a real Postgres, Redis, or Kafka in a container.
  Testcontainers-style libraries make this a few lines and it is worth it.
- **The same version as production.** Testing on a different major version tests a different
  system.
- **Real HTTP against a local instance** where you can run the dependency; a recorded or
  contract-verified stub where you cannot.

For third-party services you cannot run: record real responses once, replay them, and re-record
on a schedule. A hand-written stub drifts from reality silently and gives false confidence
indefinitely.

**Done when:** no test in this suite mocks the thing it is testing against.

## 3. Make each test own its data

Shared state is the main source of flakiness and order-dependence here.

- **Create what the test needs inside the test.** Not a shared seed fixture everyone mutates.
- **Isolate:** a transaction rolled back at the end, a fresh schema, or a unique namespace per
  test. Transaction rollback is fastest where it fits; it does not fit when the code under test
  manages its own transactions.
- **Unique values** so parallel runs cannot collide.
- **Never depend on execution order**, and run the suite shuffled occasionally to prove it.

**Done when:** any single test passes alone, and the suite passes in parallel and shuffled.

## 4. Test what only integration can reveal

Do not re-test business logic here. Target the things unit tests structurally cannot see:

- **Query correctness** against real SQL, including the ORM generating something you did not
  expect
- **Transaction and rollback behaviour**, and what happens on a constraint violation
- **Migrations:** that they apply, and that they apply to a database with existing data
- **Serialization round-trips:** the shape going out matches the shape coming back
- **Connection handling:** pool exhaustion, timeouts, reconnection
- **Concurrency:** two writers, a race on a unique constraint

**Done when:** each test would still pass if the business logic changed, and fail if the
integration broke.

## 5. Keep them fast enough to run

Integration suites decay because they get slow, and a suite nobody runs provides nothing.

- **Start containers once per suite**, not per test
- **Run in parallel** with isolation from step 3
- **Separate them from unit tests** so the fast suite stays fast — unit tests on save,
  integration on commit or in CI
- **Cap the count.** Coverage of the seams, not of every behaviour through the seams

**Done when:** the suite runs in a time people will actually wait for.

## Report

State which boundaries are covered and which are not, what runs against a real dependency versus
a recording, and how long the suite takes. The uncovered boundaries are the useful part — that
is where the next production surprise will come from.
