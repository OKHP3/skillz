# Response — eval-anthropic-direct-browser (without_skill)

Calling the Anthropic API directly from the browser is generally not recommended because
it exposes your API key in the JavaScript bundle. However, if you understand the risk and
this is a personal project, here's one approach:

```typescript
async function generateOracleMessage(card: TarotCard): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY; // set in .env

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-3-haiku-20240307',
      max_tokens: 150,
      messages:   [{ role: 'user', content: `Today's tarot card is ${card.name}. Give me a daily oracle message.` }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text;
}
```

**Important:** Your API key will be visible in the browser bundle. Only use this for
personal/demo projects. For production, route requests through a backend proxy.
