# Response — eval-cache-key-daily-stability (with_skill)

The key function is `getOrCreateOracle(userId, context)`. Here is the complete implementation
with the caching layer:

```typescript
const APP_PREFIX = 'myapp'; // change to your app name

async function getOrCreateOracle(userId: string, context: OracleContext): Promise<Oracle> {
  const today    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cacheKey = `${APP_PREFIX}:${userId}:oracle:${today}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as Oracle;

  // Not yet generated today — fetch all three layers in parallel where possible
  const [card, horoscope] = await Promise.all([
    fetchTarotCard(),
    context.sign ? fetchHoroscope(context.sign) : Promise.resolve(null),
  ]);
  const message = await generateOracleMessage(card, context);

  const oracle: Oracle = { date: today, card, message, horoscope };
  localStorage.setItem(cacheKey, JSON.stringify(oracle));
  return oracle;
}
```

**Cache key anatomy:** `myapp:alice123:oracle:2026-06-26`
- `myapp` — your app's namespace prefix (prevents key collisions with other apps)
- `alice123` — the Google `sub` value (or `'guest'` for unauthenticated users)
- `oracle` — entity name within the namespace
- `2026-06-26` — ISO date, always via `toISOString().split('T')[0]`

**Per-user isolation:** Because `userId` is in the key, Alice's reading on June 26 is stored
separately from Bob's. Both users can have the app open simultaneously without cache collisions.

**Daily stability:** The date portion ensures a new key (and new reading) is generated each day.
Once generated, `localStorage.getItem(cacheKey)` returns the stored JSON on every subsequent
refresh that same day.

**Hook it into your component:**
```typescript
useEffect(() => {
  getOrCreateOracle(userId, context).then(setOracle).finally(() => setLoading(false));
}, [userId]);
```
