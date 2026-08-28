# Java / Kotlin linting

## Java

**Formatting** — `google-java-format` or `palantir-java-format`, wired through **Spotless**.
Both are non-configurable by design, which is the point.

**Static analysis** — **Error Prone** at compile time is the highest-value addition. It catches
real bugs (`==` on boxed types, format-string mismatches, ignored return values) and many come
with auto-fixes. **SpotBugs** adds bytecode-level analysis, **PMD** and **Checkstyle** are
mostly style and generate more noise than value on a modern codebase.

```gradle
plugins {
  id "com.diffplug.spotless" version "6.25.0"
  id "net.ltgt.errorprone" version "4.0.1"
}

spotless {
  java {
    googleJavaFormat()
    removeUnusedImports()
  }
}

tasks.withType(JavaCompile) {
  options.errorprone {
    disableWarningsInGeneratedCode = true
    error("ReturnValueIgnored", "FallThrough")
  }
}
```

**NullAway** as an Error Prone plugin gives you practical null-safety in Java without
annotations everywhere. It is the single best return on setup effort for an existing Java
codebase.

## Kotlin

**ktlint** enforces the official style with almost no configuration — prefer it. **detekt**
adds bug-pattern and complexity analysis.

```gradle
plugins {
  id "org.jlleitschuh.gradle.ktlint" version "12.1.1"
  id "io.gitlab.arturbosch.detekt" version "1.23.6"
}

detekt {
  buildUponDefaultConfig = true
  config.setFrom("$projectDir/config/detekt.yml")
}
```

In `detekt.yml`, disable the complexity thresholds (`LongMethod`, `LongParameterList`,
`ComplexMethod`) unless the team has agreed the numbers. They are the main source of detekt
noise and produce `@Suppress` annotations rather than better code.

Keep `potential-bugs` and `coroutines` rule sets on — `GlobalCoroutineUsage` and
`SuspendFunWithFlowReturnType` catch real problems.

## Traps

- **Build-tool version drift.** Plugin, formatter, and JDK versions all interact. Pin all three
  and use the Gradle wrapper.
- **Generated sources** — protobuf, MapStruct, Lombok, Room — must be excluded or the build
  fails on code you cannot edit.
- **Lombok and Error Prone conflict.** Order matters; add `lombok` to the annotation processor
  path before Error Prone.
- **Spotless `check` vs `apply`.** CI runs `check`, developers run `apply`. Wire `apply` into a
  pre-commit hook or people will get failures they do not know how to fix.
- Multi-module builds need the config applied via `subprojects {}` or each module drifts.
