# Response — eval-token-expiry-silent-reauth (without_skill)

Google OAuth access tokens expire after about an hour. Here's how to handle token expiry:

## Track the expiry time

When you receive the token, store the expiry:

```javascript
const expiresAt = Date.now() + (response.expires_in * 1000);
localStorage.setItem('token_expires', expiresAt.toString());
localStorage.setItem('access_token', response.access_token);
```

## Check before each API call

```javascript
function isTokenExpired() {
  const expiresAt = localStorage.getItem('token_expires');
  return !expiresAt || Date.now() > Number(expiresAt);
}

async function getCalendarEvents() {
  if (isTokenExpired()) {
    // Token expired — request a new one
    tokenClient.requestAccessToken();
    return; // wait for new token, retry after callback
  }

  const token = localStorage.getItem('access_token');
  const res   = await fetch('...calendar endpoint...', {
    headers: { Authorization: `Bearer ${token}` }
  });
  // ...
}
```

## Handling the callback

When `tokenClient.requestAccessToken()` triggers and the user grants again,
update localStorage with the new token and expiry, then retry the failed request.
