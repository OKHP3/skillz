---
name: cloudflare-worker-api-proxy
description: >
  Create a Cloudflare Worker that proxies API calls from a static frontend to
  a keyed API, keeping the API key server-side. Use when a client-only app
  (GitHub Pages, Netlify, Cloudflare Pages) needs to call an API that requires
  an API key — and exposing that key in the JavaScript bundle is unacceptable.
  Covers Worker code, CORS headers, secret storage, and the client-side fetch
  pattern. Free tier: 100,000 requests/day with no credit card.
license: MIT
metadata:
  author: okhp3
  version: "1.0.0"
  origin: kierans-lifetrkr
  published-to: okhp3/skillz
compatibility: >
  Cloudflare account (free tier). Static frontend on any host.
  No Node.js or local tooling required — deploy via Cloudflare dashboard.
---

# Cloudflare Worker API Proxy Skill

A Cloudflare Worker is a serverless function that runs at Cloudflare's edge.
It handles the API call server-side, holds the API key in secrets, and returns
the result to your browser. The key never appears in your JavaScript bundle.

## When to use this

Use this pattern when:
- Your static site needs to call an API that requires a key (Anthropic, OpenAI, SendGrid, etc.)
- Exposing the key in client JavaScript would be a security risk or ToS violation
- You don't want to set up a full backend server

## The 30-line Worker

```javascript
// worker.js — paste this into the Cloudflare Worker editor

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Parse the request body from the client
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Call the upstream API with your secret key
    const upstream = await fetch(env.UPSTREAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your API-specific auth header here:
        'Authorization': `Bearer ${env.API_SECRET_KEY}`,
        // Or for Anthropic:
        // 'x-api-key': env.API_SECRET_KEY,
        // 'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      },
    });
  },
};
```

## Setup steps (dashboard, no CLI required)

1. **Create the Worker**
   - Cloudflare dashboard → Workers & Pages → Create Worker
   - Name it (e.g., `my-api-proxy`)
   - Paste the Worker code above
   - Edit `env.UPSTREAM_API_URL` reference and auth header to match your API

2. **Add secrets (not visible in code)**
   - Worker → Settings → Variables → Add variable
   - Add as **Secret** (encrypted at rest):
     - `API_SECRET_KEY` = your actual API key
     - `UPSTREAM_API_URL` = the API endpoint you're proxying (e.g., `https://api.anthropic.com/v1/messages`)
     - `ALLOWED_ORIGIN` = your frontend's domain (e.g., `https://username.github.io`) — or `*` for open access

3. **Deploy**
   - Click Deploy
   - Worker URL: `https://my-api-proxy.your-account.workers.dev`

4. **Add the Worker URL to your frontend**
   - Store as an environment variable: `VITE_PROXY_URL=https://my-api-proxy.your-account.workers.dev`
   - In Replit: add to Secrets panel

## Client-side fetch pattern

```typescript
// In your React app — the key never appears here
const PROXY_URL = import.meta.env.VITE_PROXY_URL;

async function callApi(payload: object) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
  return res.json();
}
```

## Anthropic-specific variant

For proxying `api.anthropic.com/v1/messages`:

```javascript
// In the Worker, replace the fetch call with:
const upstream = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: body.model || 'claude-sonnet-4-6',
    max_tokens: body.max_tokens || 1000,
    system: body.system,
    messages: body.messages,
  }),
});
```

## Cloudflare free tier limits

| Resource | Free limit |
|---|---|
| Requests/day | 100,000 |
| CPU time/request | 10ms |
| Memory | 128MB |
| Workers | 100 |
| Monthly cost | $0 |

For a personal app with <100k daily requests, this is permanently free.

## CORS configuration

The `ALLOWED_ORIGIN` secret controls which domains can call your Worker:

```
ALLOWED_ORIGIN = https://username.github.io
```

Setting it to `*` allows any domain to call your Worker. Use your specific
frontend domain in production to prevent others from using your proxy.

## Security checklist

- [ ] API key stored as a Worker Secret (encrypted), not a plain variable
- [ ] `ALLOWED_ORIGIN` set to your specific frontend domain (not `*`)
- [ ] Worker only accepts POST (or the method your API uses)
- [ ] Worker validates the request body before forwarding
- [ ] Worker URL is in your frontend as an env var, not hardcoded

## What this does NOT protect against

- Someone hitting your Worker URL directly (anyone can POST to it if ALLOWED_ORIGIN is `*`)
- Rate abuse (add request counting logic if needed)
- The Worker URL being discovered from your frontend bundle (the URL is public — the key is not)

For higher-security scenarios: add an additional shared secret that the frontend sends
and the Worker validates before proxying.
