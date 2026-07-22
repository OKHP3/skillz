/**
 * oracle-component-template.tsx
 *
 * UI-only starter for src/components/OracleCard.tsx.
 * The data flow belongs in useOracle() and src/lib/oracle.ts. Do not move
 * fetches, Anthropic access, or localStorage into this component.
 */

import type { OracleReading } from '../types'

type OracleCardProps = {
  reading: OracleReading | null
  loading: boolean
}

export function OracleCard({ reading, loading }: OracleCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-purple-800/40 bg-[#1A1424] p-5 animate-pulse">
        <div className="h-3 w-32 rounded bg-purple-900/50" />
        <div className="mt-4 h-3 w-3/4 rounded bg-purple-900/40" />
        <div className="mt-2 h-3 w-1/2 rounded bg-purple-900/40" />
      </div>
    )
  }

  if (!reading) return null

  const { tarotCard, moonPhase, astroSeason, message, horoscope } = reading

  return (
    <article className="rounded-2xl border border-purple-800/40 bg-[#1A1424] p-5 space-y-4">
      <header className="flex items-center justify-between">
        <span className="font-display text-purple-300 text-xs uppercase tracking-widest">
          Daily Oracle
        </span>
        <span className="text-xs text-purple-400/70 font-mono">
          {moonPhase.emoji} {moonPhase.name}
        </span>
      </header>

      <div>
        <h2 className="font-display text-purple-200 text-sm font-medium">
          {tarotCard.name}
        </h2>
        <p className="mt-1 text-purple-400/80 text-xs leading-relaxed">
          {tarotCard.meaning_up}
        </p>
      </div>

      <p className="border-l-2 border-purple-700/50 pl-3 text-purple-100/90 text-sm leading-relaxed italic">
        {message}
      </p>

      {horoscope && (
        <blockquote className="border border-purple-800/30 rounded-xl p-3 text-purple-300/70 text-xs leading-relaxed">
          {horoscope}
        </blockquote>
      )}

      <footer className="text-[10px] text-purple-500/60 font-mono uppercase tracking-wide">
        {astroSeason.emoji} {astroSeason.sign} · {astroSeason.element} ·{' '}
        {Math.round(moonPhase.illumination * 100)}% lit
      </footer>
    </article>
  )
}

export default OracleCard
