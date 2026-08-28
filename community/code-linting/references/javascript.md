# JavaScript / TypeScript linting

## Tools

**ESLint** for linting, **Prettier** for formatting — the long-standing default pairing.
**Biome** does both in one fast binary and is a reasonable choice for a new project, but has a
smaller plugin ecosystem; pick it only if you do not need framework-specific rules.

Use ESLint's flat config (`eslint.config.js`). The legacy `.eslintrc` format is on the way out.

```js
// eslint.config.js
import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  { ignores: ["dist/", "build/", "coverage/"] },
];
```

## The rules that actually catch bugs

**`no-floating-promises`** is the highest-value rule in the TypeScript ecosystem. An unawaited
promise swallows errors silently, and this rule catches a whole class of production incidents.
It requires type-aware linting (`recommendedTypeChecked`), which is slower — worth it.

**`no-misused-promises`** catches passing an async function where a sync callback is expected,
notably in event handlers and `Array.filter`.

**`exhaustive-deps`** (React) — do not disable it casually. Most disables are hiding a genuine
stale-closure bug.

## Do not fight Prettier

Turn off every stylistic ESLint rule. `eslint-config-prettier` does this in one line — add it
last in the config array. Two tools disagreeing about formatting produces files that cannot be
made clean.

## TypeScript strictness

Compiler strictness is separate from linting and matters more:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

`noUncheckedIndexedAccess` is the highest-value non-default flag — it makes `arr[i]` correctly
typed as possibly `undefined`, which is where a lot of runtime errors live. Expect real work to
adopt it on an existing codebase.

## Traps

- **Type-aware linting is slow** on large repos. Scope it to `src/` and skip it on the
  pre-commit hook if it drags.
- **`any` defeats everything.** `no-explicit-any` as a warning, with real review pressure, works
  better than banning it outright.
- **`eslint-disable` without a rule name** disables all rules on that line. Enable
  `@eslint-community/eslint-comments/no-unlimited-disable`.
- Flat config and legacy config plugins are not interchangeable — check plugin support before
  migrating.
