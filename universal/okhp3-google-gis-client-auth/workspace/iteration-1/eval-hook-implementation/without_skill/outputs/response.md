# Response — eval-hook-implementation (without_skill)

Here's a custom hook for Google authentication in React TypeScript:

```typescript
// src/hooks/useGoogleSignIn.ts
import { useState, useCallback } from 'react';

interface UserProfile { id: string; name: string; email: string; photoUrl: string; }

export function useGoogleOAuth() {
  const [user,        setUser]        = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const signIn = useCallback(() => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
      scope:     'https://www.googleapis.com/auth/calendar.readonly openid profile email',
      callback:  async (response) => {
        setAccessToken(response.access_token);
        localStorage.setItem('google_token', response.access_token);

        // Fetch user profile
        const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        });
        const profile = await profileRes.json();
        setUser({
          id:       profile.id,
          name:     profile.name,
          email:    profile.email,
          photoUrl: profile.picture,
        });
        setLoading(false);
      },
    });
    setLoading(true);
    tokenClient.requestAccessToken();
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_token');
    setUser(null);
    setAccessToken(null);
  }, []);

  const getAuthToken = useCallback(() => accessToken, [accessToken]);

  return { user, isSignedIn: !!user, loading, signIn, signOut, getAuthToken };
}
```
