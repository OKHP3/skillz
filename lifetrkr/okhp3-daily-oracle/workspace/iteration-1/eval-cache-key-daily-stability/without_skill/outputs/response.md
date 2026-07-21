# Response — eval-cache-key-daily-stability (without_skill)

Here's a simple localStorage caching approach for a daily oracle reading:

```typescript
async function getDailyOracle(userId: string): Promise<Oracle> {
  const date     = new Date().toLocaleDateString(); // e.g. "6/26/2026"
  const cacheKey = `oracle_${date}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as Oracle;

  // Generate new reading
  const card    = await fetchTarotCard();
  const message = await generateOracleMessage(card);
  const oracle  = { date, card, message };

  localStorage.setItem(cacheKey, JSON.stringify(oracle));
  return oracle;
}
```

This generates a new reading each day and caches it in localStorage. When the user
refreshes, the same reading is served from cache for the rest of the day.

**Per-user isolation:** You could prefix with the user ID if needed:
```typescript
const cacheKey = `oracle_${userId}_${date}`;
```
