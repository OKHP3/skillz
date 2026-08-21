# Response — eval-hook-implementation (with_skill)

Here's the complete `useGoogleAuth` hook with all four capabilities:

```typescript
// src/hooks/useGoogleAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../constants';

interface GoogleProfile { sub: string; name: string; email: string; picture: string; }

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export function useGoogleAuth() {
  const [profile,     setProfile]     = useState<GoogleProfile | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Restore token expiry from sessionStorage on mount
  useEffect(() => {
    const exp = sessionStorage.getItem('g_expiry');
    if (exp) setTokenExpiry(Number(exp));
  }, []);

  function isTokenValid(): boolean {
    const token = sessionStorage.getItem('g_token');
    if (!token || !tokenExpiry) return false;
    return Date.now() < tokenExpiry - 120_000; // 2-minute buffer
  }

  async function fetchUserProfile(token: string) {
    const res  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json() as GoogleProfile;
    setProfile(data);
  }

  const connect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    setLoading(true);
    setError(null);
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope:     GOOGLE_SCOPES,
      callback:  async (response) => {
        const expiry = Date.now() + response.expires_in * 1000;
        sessionStorage.setItem('g_token',  response.access_token);
        sessionStorage.setItem('g_expiry', String(expiry));
        setTokenExpiry(expiry);
        await fetchUserProfile(response.access_token);
        setLoading(false);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  }, []);

  const getToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (isTokenValid()) {
        resolve(sessionStorage.getItem('g_token')!);
        return;
      }
      if (!tokenClient) { reject(new Error('Not connected')); return; }
      // Silent refresh first — prompt: 'none' means no popup
      tokenClient.requestAccessToken({ prompt: 'none' });
      // On callback, token is stored; if silent fails, GIS shows popup automatically
    });
  }, [tokenExpiry]);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem('g_token');
    sessionStorage.removeItem('g_expiry');
    setProfile(null);
    setTokenExpiry(null);
    tokenClient = null;
  }, []);

  return {
    profile,
    isConnected:  !!profile,
    tokenExpiry,
    loading,
    error,
    connect,
    getToken,
    disconnect,
  };
}
```
