---
name: gis-token-model
description: >
  Implement client-only Google OAuth for React SPAs using the Google Identity
  Services (GIS) implicit token model — no server, no Client Secret, no redirect
  URI, no backend. Use when adding Google Sign-In, Google Calendar read access,
  or Google Tasks read access to a static site deployed on GitHub Pages, Netlify,
  Cloudflare Pages, or any CDN host. Covers GCP setup, scopes, token storage,
  expiry handling, and silent re-auth. Works with Calendar API and Tasks API.
license: MIT
metadata:
  author: okhp3
  version: "1.0.0"
  origin: kierans-lifetrkr
  published-to: okhp3/skillz
compatibility: >
  React 18+ with TypeScript. Requires google.accounts.oauth2 global (GIS CDN loaded in index.html).
  Designed for static hosting — GitHub Pages, Netlify, Cloudflare Pages, etc.
---

# GIS Token Model Skill

Client-only Google OAuth for single-page applications. Eliminates the need for
a backend server, redirect callback route, Client Secret, or session management.

## Why this matters

Most Google OAuth tutorials describe the **authorization code flow** — the user
gets redirected to Google, Google redirects back to a callback URL, and a server
exchanges the code for tokens using the Client Secret. This requires a backend.

The GIS **implicit token model** works differently:
1. A popup opens directly in the browser
2. The user consents
3. Google returns the access token directly to your JavaScript callback
4. No redirect. No server. No Client Secret.

The Client ID is intentionally public — it identifies your app to Google but
contains no secret material. Embedding it in client-side JavaScript is correct
and expected.

## What you need

**In GCP Console:**
- OAuth 2.0 Client ID — type: **Web Application**
- Authorized **JavaScript Origins** only (NOT redirect URIs):
  ```
  https://your-deployed-domain.com
  http://localhost:5173
  ```
- Enable the APIs you'll use (Calendar API, Tasks API, etc.)

**In your app:**
- GIS CDN script in `index.html`
- Client ID (public — safe to embed)
- Scopes matching your API usage

## Setup

### 1. Add GIS script to index.html

```html
<head>
  <!-- Google Identity Services — load before your app bundle -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
```

### 2. Store the Client ID

```typescript
// src/constants.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Define your scopes
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid',
  'profile',
  'email',
].join(' ');
```

### 3. The useGoogleAuth hook

```typescript
// src/hooks/useGoogleAuth.ts
import { useState, useCallback } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../constants';

declare global {
  interface Window { google: any; }
}

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem('g_token')
  );
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(
    () => Number(sessionStorage.getItem('g_expiry')) || null
  );

  // Check if stored token is still valid (with 2-minute buffer)
  const isTokenValid = useCallback((): boolean => {
    if (!accessToken || !tokenExpiry) return false;
    return Date.now() < tokenExpiry - 120000;
  }, [accessToken, tokenExpiry]);

  // Request a token (silent = skip consent UI if already granted)
  const requestToken = useCallback((silent = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('GIS library not loaded — check index.html script tag'));
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        prompt: silent ? 'none' : '',
        callback: (resp: any) => {
          if (resp.error) { reject(new Error(resp.error)); return; }
          const expiry = Date.now() + resp.expires_in * 1000;
          // Store in sessionStorage (clears on browser close — intentional)
          sessionStorage.setItem('g_token', resp.access_token);
          sessionStorage.setItem('g_expiry', String(expiry));
          setAccessToken(resp.access_token);
          setTokenExpiry(expiry);
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken();
    });
  }, []);

  // Get a valid token — silently refresh if possible, otherwise prompt
  const getToken = useCallback(async (): Promise<string> => {
    if (isTokenValid()) return accessToken!;
    try {
      return await requestToken(true);   // try silent first
    } catch {
      return requestToken(false);         // fallback to consent popup
    }
  }, [isTokenValid, accessToken, requestToken]);

  // Connect + fetch user profile in one step
  const connect = useCallback(async () => {
    const token = await requestToken(false);
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Profile fetch failed');
    const profile = await res.json();
    // profile = { sub, name, email, picture }
    // sub is the stable unique user ID — use it as a namespace key
    return { token, profile };
  }, [requestToken]);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem('g_token');
    sessionStorage.removeItem('g_expiry');
    setAccessToken(null);
    setTokenExpiry(null);
  }, []);

  return {
    isConnected: isTokenValid(),
    tokenExpiry,
    connect,
    getToken,
    disconnect,
  };
}
```

### 4. Call a Google API with the token

```typescript
const { getToken } = useGoogleAuth();

async function fetchCalendarEvents() {
  const token = await getToken();  // handles refresh automatically
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('timeMin', new Date().toISOString());
  url.searchParams.set('maxResults', '20');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  return res.json();
}
```

### 5. Token expiry UI pattern

Tokens expire after 1 hour. Show a reconnect banner when expired:

```typescript
// Check every 30 seconds or on each API call
const { isConnected, tokenExpiry } = useGoogleAuth();
const tokenExpired = tokenExpiry && Date.now() > tokenExpiry;

// Render:
{tokenExpired && (
  <div className="token-expiry-banner">
    <span>Google sync paused — tap to reconnect</span>
    <button onClick={() => getToken()}>↻ Reconnect</button>
  </div>
)}
```

## Common Scopes Reference

| Scope | What it allows |
|---|---|
| `calendar.readonly` | Read user's calendar events |
| `tasks.readonly` | Read user's tasks and task lists |
| `drive.readonly` | Read files from Google Drive |
| `gmail.readonly` | Read Gmail messages |
| `openid profile email` | Sign-in: user ID, name, email, photo |

Always request the minimum scopes you need. Users see a consent dialog listing each scope.

## Security notes

- **Token lives in sessionStorage** — clears when the browser tab closes. Intentional.
- **Never store the token in localStorage** — sessionStorage is cleared per session; localStorage persists across sessions and is higher risk.
- **The Client ID is public** — this is correct. Only the Client Secret is sensitive, and the token model requires no Client Secret.
- **Rate limits** — Google's APIs have per-user quotas. Calendar API: 1M requests/day free. Tasks API: 50k requests/day free.

## What this does NOT support

- Creating, editing, or deleting calendar events or tasks (requires write scopes + user consent)
- Service account authentication (no user involved)
- Offline access / refresh tokens (requires authorization code flow + backend)
- Multi-provider OAuth (this skill is Google-specific)

## GCP Console checklist

- [ ] Project created
- [ ] Required APIs enabled (Calendar, Tasks, etc.)
- [ ] OAuth consent screen configured (name, support email, scopes)
- [ ] OAuth 2.0 Client ID created — Web Application type
- [ ] Authorized JavaScript Origins set (NOT redirect URIs)
- [ ] Test users added (while in Testing mode, max 100 users)
- [ ] Client ID copied to app constants or environment variable
