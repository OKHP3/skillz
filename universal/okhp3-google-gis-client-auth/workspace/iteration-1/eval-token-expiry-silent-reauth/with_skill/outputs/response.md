# Response — eval-token-expiry-silent-reauth (with_skill)

GIS access tokens expire after approximately 1 hour. The solution is a two-step refresh
pattern: attempt a silent re-auth first, only show the user a popup if that fails.

## isTokenValid() — check before every API call

```typescript
function isTokenValid(): boolean {
  const token  = sessionStorage.getItem('g_token');
  const expiry = sessionStorage.getItem('g_expiry');
  if (!token || !expiry) return false;
  // 2-minute buffer: refresh before the token actually expires
  return Date.now() < Number(expiry) - 120_000;
}
```

The 2-minute buffer (`tokenExpiry - 120_000`) prevents the edge case where a token
is valid when checked but expires mid-request.

## getToken() — silent first, popup fallback

```typescript
function getToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isTokenValid()) {
      resolve(sessionStorage.getItem('g_token')!);
      return;
    }

    // Step 1: Try silent refresh — no popup, no user interaction
    tokenClient.requestAccessToken({ prompt: 'none' });

    // tokenClient callback stores new token; resolve from there
    // If silent fails (user not signed in / consent revoked),
    // requestAccessToken falls back to showing the popup automatically
  });
}
```

## Token storage — always sessionStorage

Tokens are stored in `sessionStorage` with keys `g_token` and `g_expiry`:

```typescript
sessionStorage.setItem('g_token',  response.access_token);
sessionStorage.setItem('g_expiry', String(Date.now() + response.expires_in * 1000));
```

`sessionStorage` clears automatically when the browser tab closes — intentional,
so tokens are never persisted long-term. **Never use `localStorage` for the token.**

## Usage in API calls

```typescript
const token    = await getToken();
const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  headers: { Authorization: `Bearer ${token}` }
});
```

Call `getToken()` before every fetch — it returns immediately if the token is still valid.
