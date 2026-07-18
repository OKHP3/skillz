# Moon Phase Widget (TypeScript)

This solution provides a TypeScript implementation for calculating the moon phase offline using a simplified astronomical formula based on the Julian date.

### 1. Calculation Logic (`moon.ts`)

We use the "Conway" method (or similar astronomical approximations) to calculate the age of the moon. The synodic month (time between new moons) is approximately **29.530588853** days.

```typescript
export interface MoonPhase {
  name: string;
  emoji: string;
  illumination: number; // 0 to 100
  daysToNextPhase: number;
}

const LUNAR_MONTH = 29.530588853;

/**
 * Gets the moon phase for a specific date.
 * Based on a known New Moon: 2000-01-06T18:14:00
 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const msPerDay = 86400000;
  
  // Calculate days since known new moon
  const diffDays = (date.getTime() - knownNewMoon) / msPerDay;
  
  // Age of the moon in days (0 to 29.53)
  const age = diffDays % LUNAR_MONTH;
  const normalizedAge = age < 0 ? age + LUNAR_MONTH : age;

  // Illumination calculation (simplified: 0% at New Moon, 100% at Full Moon)
  // Uses a cosine-based approximation for better accuracy than linear
  const phaseAngle = (normalizedAge / LUNAR_MONTH) * 2 * Math.PI;
  const illumination = ((1 - Math.cos(phaseAngle)) / 2) * 100;

  // Determine Phase Name and Emoji
  let name = "";
  let emoji = "";
  let nextPhaseThreshold = 0;

  if (normalizedAge < 1.84566) {
    name = "New Moon";
    emoji = "🌑";
    nextPhaseThreshold = 1.84566;
  } else if (normalizedAge < 5.53699) {
    name = "Waxing Crescent";
    emoji = "🌒";
    nextPhaseThreshold = 7.38268;
  } else if (normalizedAge < 9.22831) {
    name = "First Quarter";
    emoji = "🌓";
    nextPhaseThreshold = 9.22831;
  } else if (normalizedAge < 12.91963) {
    name = "Waxing Gibbous";
    emoji = "🌔";
    nextPhaseThreshold = 14.76536;
  } else if (normalizedAge < 16.61096) {
    name = "Full Moon";
    emoji = "🌕";
    nextPhaseThreshold = 16.61096;
  } else if (normalizedAge < 20.30228) {
    name = "Waning Gibbous";
    emoji = "🌖";
    nextPhaseThreshold = 22.14804;
  } else if (normalizedAge < 23.99361) {
    name = "Last Quarter";
    emoji = "🌗";
    nextPhaseThreshold = 23.99361;
  } else if (normalizedAge < 27.68493) {
    name = "Waning Crescent";
    emoji = "🌘";
    nextPhaseThreshold = 29.53059;
  } else {
    name = "New Moon";
    emoji = "🌑";
    nextPhaseThreshold = 29.53059 + 1.84566;
  }

  const daysToNextPhase = Math.max(0, nextPhaseThreshold - normalizedAge);

  return {
    name,
    emoji,
    illumination: Math.round(illumination),
    daysToNextPhase: Math.ceil(daysToNextPhase),
  };
}
```

### 2. React Widget Example (`MoonWidget.tsx`)

```tsx
import React from 'react';
import { getMoonPhase } from './moon';

export const MoonWidget: React.FC = () => {
  const moon = getMoonPhase();

  return (
    <div className="p-4 border rounded-lg bg-slate-900 text-white flex flex-col items-center w-48">
      <div className="text-4xl mb-2">{moon.emoji}</div>
      <div className="font-bold text-lg">{moon.name}</div>
      <div className="text-sm opacity-80">{moon.illumination}% Illuminated</div>
      <div className="mt-2 text-xs border-t border-slate-700 pt-2 text-center">
        {moon.daysToNextPhase} days until next phase
      </div>
    </div>
  );
};
```

### How it works:
1.  **Reference Point**: We use a known New Moon date (Jan 6, 2000) as the "epoch".
2.  **Modulo Arithmetic**: By dividing the elapsed time by the Lunar Month (29.53 days), we find the current "age" of the moon cycle.
3.  **Illumination**: Calculated using the phase angle to simulate the percentage of the disk visible from Earth.
4.  **Offline-first**: No `fetch` calls or external libraries needed; it relies entirely on the system clock.
