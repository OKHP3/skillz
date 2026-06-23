import { useState, useCallback } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES } from '../constants'

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    sessionStorage.getItem('gal_token')
  )
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(
    Number(sessionStorage.getItem('gal_expiry')) || null
  )

  const isTokenValid = useCallback(() => {
    if (!accessToken || !tokenExpiry) return false
    return Date.now() < tokenExpiry
  }, [accessToken, tokenExpiry])

  const requestToken = useCallback((silent = false): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        prompt: silent ? 'none' : '',
        callback: (response) => {
          if (response.error) {
            reject(response.error)
            return
          }
          const expiry = Date.now() + (response.expires_in * 1000)
          sessionStorage.setItem('gal_token', response.access_token)
          sessionStorage.setItem('gal_expiry', String(expiry))
          setAccessToken(response.access_token)
          setTokenExpiry(expiry)
          resolve(response.access_token)
        },
      })
      client.requestAccessToken()
    })
  }, [])

  const getToken = useCallback(async (): Promise<string> => {
    if (isTokenValid()) return accessToken!
    return requestToken(true).catch(() => requestToken(false))
  }, [isTokenValid, accessToken, requestToken])

  const disconnect = useCallback(() => {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {})
    }
    sessionStorage.removeItem('gal_token')
    sessionStorage.removeItem('gal_expiry')
    setAccessToken(null)
    setTokenExpiry(null)
  }, [accessToken])

  const minutesUntilExpiry = tokenExpiry
    ? Math.max(0, Math.floor((tokenExpiry - Date.now()) / 60000))
    : null

  return {
    isConnected: isTokenValid(),
    accessToken,
    minutesUntilExpiry,
    connect: () => requestToken(false),
    getToken,
    disconnect,
  }
}
