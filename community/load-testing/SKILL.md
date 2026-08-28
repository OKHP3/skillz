---
name: load-testing
description: Measures how a system behaves under load and finds where it breaks — throughput ceilings, latency under concurrency, and failure modes at saturation. Use this whenever the user mentions load testing, stress testing, benchmarking, capacity planning, an upcoming traffic spike, or asks how many users the system can handle. For making already-identified slowness faster, use performance-profiling.
license: MIT
---

# Load testing

A load test answers one of two questions, and confusing them wastes the effort:

- **Can it handle X?:** a specific, known target. Verification.
- **Where does it break, and how?:** the ceiling and the failure mode. Discovery.

Discovery is usually more valuable. Knowing you handle 1,000 requests per second tells you less
than knowing that at 1,200 the connection pool exhausts and every request hangs for 30 seconds
rather than failing fast.

## 1. Model realistic traffic, not a single endpoint

Hammering one endpoint measures that endpoint. Real systems fail through interaction — a slow
report query saturating the pool that the login path needs.

Model:
- **The mix:** which endpoints, in what proportion, from real traffic data
- **The shape:** steady, spiky, or diurnal. A ramp reveals different problems than a sudden step
- **Think time:** real users pause. Zero think time produces an unrealistic connection pattern
- **The data distribution:** everyone hitting one hot row behaves nothing like a spread of keys.
  This is a very common cause of misleading results

**Done when:** the generated traffic resembles what production actually sees.

## 2. Test something that resembles production

A load test against a laptop tells you about the laptop.

Match, or document the difference: instance sizes, replica counts, database size and data
volume, network topology, and — critically — caches in a realistic state. A cold cache and a
fully warm one give completely different numbers, and neither may be the steady state.

**Done when:** you can state how the environment differs from production and how that skews the
result.

## 3. Ramp, and watch for the knee

Do not start at target load. Ramp, and watch for the point where the response curve bends.

Below saturation, latency stays roughly flat as throughput rises. At the knee, latency climbs
sharply while throughput stops rising. That point is your real capacity, and it is usually well
below the number where errors start.

Past the knee, watch what happens — this is the most valuable part of the exercise:
- Does it degrade gracefully or collapse?
- Does it shed load, queue indefinitely, or crash?
- **Does it recover when load drops?** A system that stays broken after the spike passes is a
  much worse problem than one that briefly fails.

**Done when:** you have located the knee and observed behaviour beyond it.

## 4. Measure the right things

- **Latency percentiles:** p50, p95, p99. Never the mean; under load, the mean is dominated by
  a tail that is where the real user pain lives
- **Throughput**, alongside latency. Either alone is misleading
- **Error rate by type:** timeouts, 5xx, and connection refusals mean different things
- **Saturation of each resource:** CPU, memory, connection pool, file descriptors, thread pool,
  disk and network I/O. **The bottleneck is nearly always one of these**, and identifying which
  is the whole point

Measure from the client side too. Server-side timings exclude queueing, and queueing is exactly
what happens under load.

**Done when:** you can name the resource that saturates first.

## 5. Do not test in production carelessly

If you must test against production, and there are good reasons to — take precautions: schedule
it, tell people, mark synthetic traffic so it can be excluded from metrics and billing, have a
kill switch, and start small.

Otherwise you are running an incident on purpose. See `incident-response` if it turns into one.

**Done when:** the test can be stopped instantly and its traffic is distinguishable.

## Report

Report the knee, the saturating resource, and the failure mode — those three are the output.
Include the environment's differences from production and the traffic model, because a number
without them is not comparable to anything.

Then say what capacity headroom this implies against current traffic. That is the question
whoever asked for the test actually has.
