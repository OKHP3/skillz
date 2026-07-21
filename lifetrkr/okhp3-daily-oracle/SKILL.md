---
name: okhp3-daily-oracle
description: "OverKill Hill P³ daily oracle workflow. Use when building or reviewing a stable reading that combines a tarot card, optional zodiac horoscope, and an AI message. Also activate for daily insight, affirmation, card-draw, or consistent word-of-the-day features in a client-only app. Preserve the repo's ISO cache key, deterministic fallback, graceful degradation, and direct-browser security warning; do not add a backend or proxy to this repository."
license: MIT
compatibility: "Browser, React, and Vite environments. Public tarot/horoscope requests are optional and network-dependent; this repository's Anthropic call is a personal-app direct-browser exception owned by src/lib/oracle.ts."
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "1.3.0"
  category: "wellness-astrology"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
  implementation: "references/oracle.ts"
  scripts: "scripts/test-oracle-apis.cjs"
  assets: "assets/oracle-component-template.tsx"
  scope: "Daily tarot, optional horoscope, AI message synthesis, local per-user caching, fallbacks, and React integration"
  boundaries: "Client-only personal-app workflow; no backend, proxy, database, accounts, push delivery, natal chart, or multi-user security design"
---

# okhp3-daily-oracle

Treat the oracle as a three-layer, once-per-day reading: tarot is the anchor,
horoscope is optional context, and the AI message is a best-effort synthesis.
The user must still receive a meaningful card and message when network services
or the AI key are unavailable.

## Scope

| In scope | Out of scope |
| --- | --- |
| `tarotapi.dev` card fetch with a deterministic Major Arcana fallback | Birth charts, natal calculations, or multi-day forecasts |
| Optional `freehoroscopeapi.com` daily horoscope | Push notifications, external writes, or server-side persistence |
| Anthropic message generation through this repo's `src/lib/oracle.ts` | Adding a backend, Cloudflare Worker, API route, secure proxy, or database |
| Per-user, per-day `localStorage` cache and graceful degradation | Non-Claude AI providers or public multi-user secret management |
| Existing `useOracle`, `OracleReading`, and `OracleCard` integration | Replacing the app's state and storage architecture |

## Repository boundary: read this first

When working in Kieran's LifeTrkr, preserve these facts:

- `src/lib/oracle.ts` owns tarot, horoscope, Anthropic access, the fallback, and
  the oracle-message cache. `src/hooks/useOracle.ts` orchestrates the reading;
  `src/components/OracleCard.tsx` renders it.
- The cache key is exactly
  `lifetrkr:{userId}:oracle:{YYYY-MM-DD}`. The profile `sub` is the user ID;
  use `guest` when no profile exists or parsing fails. The date is
  `new Date().toISOString().split('T')[0]`, never a locale-formatted date.
- The current tarot fallback uses the full 22-card `MAJOR_ARCANA` list and
  selects `MAJOR_ARCANA[dayOfYear % MAJOR_ARCANA.length]`. Do not substitute a
  random card or a static single card, and do not describe a 12-card pool as the
  repo implementation.
- The current app is deliberately client-only. Do not recommend or add a
  Cloudflare Worker, server, proxy, database, or API route as part of this
  repository task. A secure public proxy is a separate architecture and is out
  of scope here.

## Workflow

### 1. Plan

1. Identify whether the task changes the data layer, cache contract, UI, or
   validation only.
2. Inspect `src/lib/oracle.ts`, `src/hooks/useOracle.ts`, `src/types.ts`, and
   `src/components/OracleCard.tsx` before editing. Preserve their public names
   and data flow.
3. Decide the fallback at each layer: tarot must always resolve, horoscope may
   become `undefined`, and the AI message must fall back to `card.meaning_up`.
4. If adapting this pattern outside the repo, name the app prefix explicitly;
   inside this repo, never replace the `lifetrkr` namespace with `myapp`.

### 2. Validate

1. Read `references/oracle.ts` for implementation detail and
   `assets/oracle-component-template.tsx` only when a UI template is needed.
2. Run the optional public-source smoke test when network access is available:

   ```text
   node .agents/skills/okhp3-daily-oracle/scripts/test-oracle-apis.cjs --sign cancer
   ```

   A non-zero result can be a transient API or CORS failure; it does not remove
   the fallback requirement. Never put keys or `.env` files in test output.
3. Verify the cache with a fixed `YYYY-MM-DD` value and two reads. Confirm the
   same user/date returns the same message, another user has an isolated key,
   and `guest` is used without a profile.
4. Simulate tarot failure, horoscope failure, missing key, AI non-2xx response,
   malformed JSON, and offline mode. Each path must render useful output or
   omit only the optional horoscope. Report unverified external endpoints.

### 3. Execute

1. Use the existing `useOracle()` hook in the app. Keep network and local
   storage work in `src/lib/oracle.ts`; do not move it into a component.
2. Fetch tarot and the local celestial values in parallel. Fetch the horoscope
   only when `settings.birthSign` exists; treat failure as optional.
3. Generate the AI message only after the tarot card is available. Cache the
   resulting message or its `meaning_up` fallback under the exact key above.
4. Keep the cache read before any external call. This is what makes refreshes
   stable and prevents unnecessary requests.
5. Render `OracleReading` through the existing `OracleCard` API. Keep the date
   in ISO form and expose moon, season, and horoscope context without making
   the visual layer responsible for fetching it.

## Portable cache pattern

Use this compact pattern only when adapting the workflow to another app; replace
`APP_PREFIX` with that app's explicit namespace. In this repository the concrete
key must remain `lifetrkr:${userId}:oracle:${today}`.

```typescript
const today = new Date().toISOString().split('T')[0]
const userId = profile?.sub || 'guest'
const cacheKey = `${APP_PREFIX}:${userId}:oracle:${today}`
const cached = localStorage.getItem(cacheKey)
if (cached) return cached
// Generate tarot/context/message, then localStorage.setItem(cacheKey, message)
```

The user ID provides isolation; the ISO date provides daily stability and
zero-TTL expiry. Do not use `toLocaleDateString()`, `toDateString()`, or
`Math.random()` for the cache or fallback selection.

## Data and fallback contract

- Tarot: request
  `https://tarotapi.dev/api/v1/cards/random?n=1`; require a usable card and
  fall back deterministically from the 22-card `MAJOR_ARCANA` array using the
  `Date.now()`/`getTime()` day-of-year calculation and modulo.
- Horoscope: request
  `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign={sign}` only
  when a birth sign is set; return `null`/`undefined` on failure and keep the
  reading usable.
- Oracle message: preserve the function
  `generateOracleMessage(card, moon, season, mercury, birthSign?)` and its
  fallback to `card.meaning_up`.
- Keep the prompt warm, grounded, concise, and non-diagnostic. Treat tarot and
  horoscope as reflective content, not medical, legal, financial, or predictive
  advice.

## Anthropic security boundary

This repository has one intentional exception: `src/lib/oracle.ts` performs a
direct browser request for a personal app. If using that path, preserve all of
the following:

```typescript
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
// headers include:
// 'anthropic-dangerous-direct-browser-access': 'true'
```

The `VITE_` value is embedded in the production JavaScript bundle and can be
read by anyone who loads the site. This is acceptable only for a personal or
single-user app whose owner accepts exposure and key rotation risk. It is not a
secure public deployment pattern. Never commit the key, print it, or imply that
Vite hides it. If the user requests public multi-user hardening, explain that a
server-side proxy would be the normal solution but is explicitly outside this
repository task; do not implement it here.

## Gotchas

- Check `response.ok` and response shape before trusting external JSON.
- Cache only after a complete reading or a deliberate fallback; do not cache a
  transient loading state or an error object.
- Keep `userId` in the key. A global `oracle_${date}` key leaks one user's
  reading into another user's session.
- Keep the fallback deterministic. A refresh during an outage must not redraw a
  different card for the same day.
- Treat public endpoints as optional and CORS-sensitive. The smoke script is a
  diagnostic, not a production dependency or uptime guarantee.
- Do not introduce ad hoc storage keys in components. Use the existing
  `lifetrkr` conventions and `src/lib/storage.ts` where applicable.

## Bundled resources

- `references/oracle.ts` — full TypeScript data-layer reference. Read on demand;
  it is the implementation depth, not a reason to duplicate app modules.
- `scripts/test-oracle-apis.cjs` — network-dependent tarot/horoscope response
  shape check; it does not test Anthropic or prove production availability.
- `assets/oracle-component-template.tsx` — UI-only template aligned with the
  repo's `OracleReading`/`OracleCard` boundary. Do not copy API calls into it.

## Output contract

Return the planned data flow, exact cache key, fallback behavior, files changed,
validation commands and results, and any API/CORS or key-exposure concern. Do
not claim that a live endpoint or benchmark was verified unless it was actually
run.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
