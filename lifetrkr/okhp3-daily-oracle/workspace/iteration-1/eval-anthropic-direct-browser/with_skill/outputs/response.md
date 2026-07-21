# Response — eval-anthropic-direct-browser (with_skill)

For a personal app on GitHub Pages with no backend, use the **direct browser fetch** with
Anthropic's `anthropic-dangerous-direct-browser-access` header:

```typescript
// src/lib/oracle.ts
async function generateOracleMessage(card: TarotCard, context: OracleContext): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return card.meaning_up; // no key configured — degrade gracefully

  const userPrompt = buildPrompt(card, context);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':                            apiKey,
        'anthropic-version':                    '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type':                         'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5',
        max_tokens: 150,
        system:     'You are a warm, grounded daily oracle. 2–3 sentences. No clichés.',
        messages:   [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || card.meaning_up;
  } catch {
    return card.meaning_up;
  }
}
```

Set the key in `.env.local` or Replit Secrets:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

⚠️ **Security tradeoff — read before shipping:**
The `VITE_` prefix causes Vite to embed `VITE_ANTHROPIC_API_KEY` in the compiled JavaScript
bundle. **Anyone who loads your app can read the key** using browser DevTools → Sources.

This is acceptable only when:
- The app is for **personal or single-user use** (only you will load it)
- You accept the Anthropic ToS for browser-based API calls
- You are willing to rotate the key if it leaks (set a low Anthropic usage cap as a safeguard)

For a multi-user app, use Option A instead: a Cloudflare Worker proxy that holds the key
server-side and forwards Claude responses — see SKILL.md "API key delivery" section.
