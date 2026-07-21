import { useCallback, useState } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES } from '../constants'

export interface GoogleAuthOptions {
  clientId?: string
  scope?: string
  storage?: Storage
  tokenKey?: string
  expiryKey?: string
  expirySkewMs?: number
}

interface GoogleTokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

const DEFAULT_TOKEN_KEY = 'gal_token'
const DEFAULT_EXPIRY_KEY = 'gal_expiry'
const DEFAULT_EXPIRY_SKEW_MS = 120_000

export function useGoogleAuth(options: GoogleAuthOptions = {}) {
  const {
    clientId = GOOGLE_CLIENT_ID,
    scope = SCOPES,
    storage = sessionStorage,
    tokenKey = DEFAULT_TOKEN_KEY,
    expiryKey = DEFAULT_EXPIRY_KEY,
    expirySkewMs = DEFAULT_EXPIRY_SKEW_MS,
  } = options
  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick(value => value + 1), [])
  const readToken = () => storage.getItem(tokenKey)
  const readExpiry = () => Number(storage.getItem(expiryKey)) || 0

  const isTokenValid = useCallback(() => {
    return Boolean(readToken()) && Date.now() < readExpiry() - expirySkewMs
  }, [expiryKey, expirySkewMs, storage, tokenKey])

  const requestToken = useCallback((silent = false): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope,
        prompt: silent ? 'none' : '',
        callback: (response: GoogleTokenResponse) => {
          if (response.error || !response.access_token || !response.expires_in) {
            reject(new Error(response.error_description || response.error || 'Google token request failed'))
            return
          }
          const expiry = Date.now() + response.expires_in * 1000
          storage.setItem(tokenKey, response.access_token)
          storage.setItem(expiryKey, String(expiry))
          rerender()
          resolve(response.access_token)
        },
      })
      client.requestAccessToken()
    })
  }, [clientId, expiryKey, rerender, scope, storage, tokenKey])

  const getToken = useCallback(async (): Promise<string> => {
    if (isTokenValid()) return readToken()!
    return requestToken(true).catch(() => requestToken(false))
  }, [isTokenValid, requestToken])

  const disconnect = useCallback(() => {
    const token = readToken()
    if (token) window.google?.accounts?.oauth2?.revoke(token, () => {})
    storage.removeItem(tokenKey)
    storage.removeItem(expiryKey)
    rerender()
  }, [expiryKey, rerender, storage, tokenKey])

  const tokenExpiry = readExpiry()
  return {
    isConnected: isTokenValid(),
    accessToken: readToken(),
    minutesUntilExpiry: tokenExpiry
      ? Math.max(0, Math.floor((tokenExpiry - Date.now()) / 60000))
      : null,
    connect: () => requestToken(false),
    getToken,
    disconnect,
  }
}
