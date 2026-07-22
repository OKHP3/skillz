# Response — eval-tarot-api-fallback (with_skill)

When `tarotapi.dev` is down, the oracle uses a **deterministic day-of-year fallback**.
The user always sees a real, meaningful card — not an error or a blank screen.

## The fallback strategy

```typescript
const FALLBACK_CARDS = [
  { name: 'The Star',           meaning_up: 'Hope, renewal, trust in the unfolding.' },
  { name: 'The Moon',           meaning_up: 'Cycles, dreams, what lies beneath.' },
  { name: 'The Sun',            meaning_up: 'Clarity, vitality, things coming to light.' },
  { name: 'Temperance',         meaning_up: 'Balance, patience, the middle path.' },
  { name: 'Strength',           meaning_up: 'Inner courage, gentle power, compassion.' },
  { name: 'The Hermit',         meaning_up: 'Stillness, inner guidance, turning inward.' },
  { name: 'The World',          meaning_up: 'Completion, wholeness, the journey fulfilled.' },
  { name: 'The Empress',        meaning_up: 'Abundance, creativity, nurturing life.' },
  { name: 'The High Priestess', meaning_up: 'Intuition, inner knowing, the unseen.' },
  { name: 'Judgement',          meaning_up: 'Awakening, reckoning, the call toward purpose.' },
  { name: 'Wheel of Fortune',   meaning_up: 'Change, cycles, forces larger than yourself.' },
  { name: 'The Fool',           meaning_up: 'New beginnings, open heart, the unknown.' },
];

async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res  = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0];
  } catch {
    // Deterministic fallback: same card for the same calendar day, every year
    const doy = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const card = FALLBACK_CARDS[doy % FALLBACK_CARDS.length];
    return { name: card.name, meaning_up: card.meaning_up, type: 'major', desc: '' };
  }
}
```

## Why deterministic?

The fallback selects by **day of year** (`doy`), not at random. This means:
- User refreshes during an outage → same card, not a different random one
- The reading stays stable all day, which is the core contract of the oracle
- Two users on the same day see the same fallback card (both see The Star on day 1, etc.)
  — acceptable since they also have their own AI message layer on top

The pool is exactly **12 cards** (one per month if cycled yearly), all Major Arcana chosen
for positive, open-ended meanings appropriate to a wellness context.
