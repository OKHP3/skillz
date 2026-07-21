# Response — eval-no-backend-oauth (without_skill)

Google OAuth typically requires a redirect URI and a server to handle the callback,
but Google Identity Services (GIS) provides a way to do this client-side.

## Client-side approach with GIS

Google provides the `google.accounts.oauth2.initTokenClient` API which can handle
OAuth without a backend:

```javascript
const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  scope:     'https://www.googleapis.com/auth/calendar.readonly',
  callback:  (response) => {
    const token = response.access_token;
    // Store and use the token
    localStorage.setItem('access_token', token);
  },
});

// Trigger sign-in
tokenClient.requestAccessToken();
```

## GCP Setup

In GCP Console:
1. Create an OAuth 2.0 Client ID (Web Application type)
2. Add your Netlify domain to Authorized JavaScript Origins
3. The Client ID is public — safe to include in client-side code
