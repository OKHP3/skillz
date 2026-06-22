---
name: google-gis-client-auth
description: >
  Implements Google OAuth 2.0 authentication entirely in the browser using the Google
  Identity Services (GIS) token model — no backend server, no Client Secret, no redirect
  URIs. Use when adding Google Sign-In to a static site, GitHub Pages app, or any
  client-only SPA that needs Google Calendar, Google Tasks, Gmail, or Drive access
  without a server. Also use when a user asks how to authenticate with Google without
  a backend, or how to use Google APIs from a static site or GitHub Pages deployment.
license: MIT
metadata:
  author: Jamie Hill (OKHP3 / OverKill Hill P³)
  version: "1.0"
  origin: Kieran's LifeTrkr (https://github.com/OKHP3/kierans-lifetrkr)
  published-via: OKHP3/skillz
compatibility: Browser environment required. Requires a Google Cloud Console project with OAuth 2.0 credentials. No Node.js, no server.
---

# google-gis-client-auth

Add Google Sign-In and Google API access to a static site or SPA without a backend
server using the Google Identity Services (GIS) implicit token model.

## When to use this skill

- GitHub Pages, Netlify, Cloudflare Pages, or any static hosting deployment
- React/Vue/Svelte SPA that needs Google Calendar, Tasks, Gmail, or Drive read access
- Any project where adding an Express/FastAPI server just for OAuth is overkill
- When a user is confused about "Client Secret" — they don't need one for this model

## The key distinction — token model vs. code model

Most OAuth tutorials describe the **authorization code model**: browser → backend → Google → backend → browser. This requires a server to hold the Client Secret.

This skill uses the **GIS implicit token model**: browser → Google → browser. No server involved. The access token is returned directly to the browser's JavaScript callback. The Client ID (not the Client Secret) is the only credential needed, and it is safe to embed in client-side code by design.

**Never use the Client Secret in client-side code.** This skill does not need it.

## GCP setup (one-time, manual)

1. console.cloud.google.com → New Project
2. APIs & Services → Library → Enable the APIs you need (Calendar, Tasks, etc.)
3. Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web Application**
   - Authorized JavaScript Origins (not redirect URIs):
     ```
     https://your-domain.com
     http://localhost:5173
     ```
4. Copy the Client ID (ends in `.apps.googleusercontent.com`)
5. Ignore the Client Secret — this model does not use it
6. OAuth Consent Screen → Testing mode → add test users by Gmail

## Implementation

### Step 1 — Load the GIS library

Add to your `index.html` `<head>`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

No npm package needed. The library loads from Google's CDN.

### Step 2 — Store the Client ID

```typescript
// src/constants.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
// For local dev: add VITE_GOOGLE_CLIENT_ID to .env
// For production: add to your deployment platform's env vars
// The Client ID is public by design — safe to commit if preferred
```

### Step 3 — Build the auth hook

Copy `useGoogleAuth.ts` from `references/useGoogleAuth.ts` into `src/hooks/`.

```typescript
// Usage
import { useGoogleAuth } from './hooks/useGoogleAuth';

function App() {
  const { isConnected, connect, getToken, disconnect } = useGoogleAuth(
    GOOGLE_CLIENT_ID,
    ['https://www.googleapis.com/auth/calendar.readonly']
  );

  const handleConnect = async () => {
    const { token, profile } = await connect();
    console.log('Connected as:', profile.name);
    console.log('Email:', profile.email);
    // profile.sub = unique Google user ID — use as localStorage namespace key
  };

  return isConnected
    ? <button onClick={disconnect}>Disconnect Google</button>
    : <button onClick={handleConnect}>Connect Google Account</button>;
}
```

### Step 4 — Make Google API calls

Once connected, use `getToken()` to retrieve a valid access token before any API call:

```typescript
const token = await getToken(); // handles silent re-auth automatically

const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
```

`getToken()` returns a cached token if still valid, silently re-auths if expired,
and falls back to a full consent popup only when needed.

## Token storage

- Access token: `sessionStorage` only. Survives page refresh within the same tab.
  Never stored in `localStorage` (security best practice).
- Token expiry: ~1 hour. Silent re-auth (`prompt: 'none'`) happens automatically.
- User profile: `localStorage`. Persists across sessions.

## Multi-user pattern (same device)

If multiple Google accounts may be used on the same device, namespace all user data
by the Google `sub` ID from the profile:

```typescript
const profile = await fetchUserProfile(token);
const sub = profile.sub; // unique per Google account
localStorage.setItem(`myapp:${sub}:habits`, JSON.stringify(habits));
```

## Scopes

Request only the scopes you need. Users see exactly what access they're granting.

Common read-only scopes:
```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/tasks.readonly
https://www.googleapis.com/auth/drive.readonly
openid
profile
email
```

Add them as an array to `useGoogleAuth`:
```typescript
const { connect } = useGoogleAuth(CLIENT_ID, [
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid', 'profile', 'email'
]);
```

## Token expiry banner

When the token expires, show a reconnect banner rather than silently failing:

```tsx
// In a global wrapper component
const { isConnected, tokenExpiry, getToken } = useGoogleAuth(CLIENT_ID, scopes);
const isExpired = tokenExpiry && Date.now() > tokenExpiry - 120000; // 2-min buffer

{isConnected && isExpired && (
  <div onClick={() => getToken()}>
    Google sync paused — tap to reconnect
  </div>
)}
```

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| Adding redirect URIs in GCP | Don't — only Authorized JavaScript Origins needed |
| Using `BrowserRouter` on GitHub Pages | Use `HashRouter` — GH Pages has no server-side routing |
| Storing token in localStorage | Use sessionStorage — tokens expire in 1 hour anyway |
| Calling `api.anthropic.com` with token | The GIS token works only for Google APIs |
| Exposing Client Secret in code | This model needs Client ID only — no secret |

## Going to production

When you're ready to allow users beyond your test list:
1. OAuth Consent Screen → Publish App
2. Google reviews sensitive scopes (calendar, drive, etc.) — typically 1–4 weeks
3. After approval: no warning screen, no 100-user cap

For personal or small-audience apps, Testing mode with manually added test users
is perfectly acceptable indefinitely.

## Files

- `references/useGoogleAuth.ts` — Full TypeScript React hook implementation
