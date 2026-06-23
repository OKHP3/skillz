import type { TarotCard, MoonPhase, AstroSeason, ZodiacSign } from '../types'

// ─── Tarot ────────────────────────────────────────────────────────────────────

const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress',
  'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
  'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
  'The Hanged Man', 'Death', 'Temperance', 'The Devil',
  'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
]

function fallbackCard(): TarotCard {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const name = MAJOR_ARCANA[dayOfYear % MAJOR_ARCANA.length]
  return {
    name,
    name_short: name.toLowerCase().replace(/\s/g, '_'),
    type: 'major',
    meaning_up: 'Trust the path unfolding before you.',
    meaning_rev: 'Resistance may be slowing what is meant to flow.',
    desc: 'A powerful card of transformation and insight.',
  }
}

export async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1')
    if (!res.ok) throw new Error('tarot api error')
    const data = await res.json()
    return data.cards[0] as TarotCard
  } catch {
    return fallbackCard()
  }
}

// ─── Horoscope ────────────────────────────────────────────────────────────────

export async function fetchHoroscope(sign: ZodiacSign): Promise<string | null> {
  try {
    const res = await fetch(
      `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign.toLowerCase()}`,
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.data?.horoscope || null
  } catch {
    return null
  }
}

// ─── Claude Oracle Message ────────────────────────────────────────────────────

function getUserSub(): string {
  try {
    const raw = localStorage.getItem('lifetrkr:profile')
    if (!raw) return 'guest'
    return JSON.parse(raw).sub || 'guest'
  } catch {
    return 'guest'
  }
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export async function generateOracleMessage(
  card: TarotCard,
  moon: MoonPhase,
  season: AstroSeason,
  mercury: { retrograde: boolean; endDate: string | null },
  birthSign?: ZodiacSign | null,
): Promise<string> {
  const cacheKey = `lifetrkr:${getUserSub()}:oracle:${getTodayISO()}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) return cached

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    const fallback = card.meaning_up
    localStorage.setItem(cacheKey, fallback)
    return fallback
  }

  const userPrompt = [
    `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`,
    `The moon is in ${moon.name}.`,
    `The sun is in ${season.sign} (${season.element} sign).`,
    `The tarot card for today is ${card.name}: ${card.meaning_up}`,
    mercury.retrograde ? `Mercury is retrograde until ${mercury.endDate}.` : '',
    birthSign ? `This person's sun sign is ${birthSign}.` : '',
    'Write a 2-3 sentence daily oracle message. Warm, grounded, quietly mystical. Do not use em dashes.',
  ].filter(Boolean).join(' ')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 150,
        system: 'You are a warm, grounded, slightly mystical daily oracle for a personal life app. Never use em dashes. Sound like someone who reads a lot and walks in the woods at dusk.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    const data = await response.json()
    const message = data.content?.[0]?.text || card.meaning_up
    localStorage.setItem(cacheKey, message)
    return message
  } catch {
    const fallback = card.meaning_up
    localStorage.setItem(cacheKey, fallback)
    return fallback
  }
}
