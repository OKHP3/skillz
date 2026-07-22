# Response — eval-no-backend-oauth (with_skill)

Yes — Google Calendar read access from a static Netlify site is fully supported, with **no
backend, no redirect URI, and no server-side callback**. Here's exactly how it works.

## The GIS implicit token model

The Google Identity Services (GIS) library provides a **popup-based token flow** that runs
entirely in the browser:

1. Your JavaScript calls `google.accounts.oauth2.initTokenClient({ client_id, scope, callback })`
2. The user clicks "Connect" → a popup opens with Google's consent screen
3. The user grants permission → Google returns an **access token directly to your JavaScript callback**
4. No redirect, no authorization code, no server exchange — the token lands in your callback function

```typescript
const tokenClient = window.google.accounts.oauth2.initTokenClient({
  client_id: GOOGLE_CLIENT_ID,
  scope:     'https://www.googleapis.com/auth/calendar.readonly openid profile email',
  callback:  (response) => {
    // Token delivered here — no server involved
    sessionStorage.setItem('g_token',  response.access_token);
    sessionStorage.setItem('g_expiry', String(Date.now() + response.expires_in * 1000));
    fetchUserProfile(response.access_token);
  },
});
```

## GCP Console setup — critical detail

In GCP Console → Credentials → your OAuth 2.0 Client ID:

- ✅ **Authorized JavaScript Origins** — add your Netlify domain + `http://localhost:5173`
- ⛔ **Do NOT add Authorized redirect URIs** — the token model does not use them.
  Adding redirect URIs signals the authorization code flow (which requires a server).
  Leave the redirect URIs section completely empty.

## Client ID is public — by design

Your Client ID (e.g. `123456.apps.googleusercontent.com`) is safe to embed in client-side
code. The token model uses no Client Secret — it is intentionally absent from this flow.
