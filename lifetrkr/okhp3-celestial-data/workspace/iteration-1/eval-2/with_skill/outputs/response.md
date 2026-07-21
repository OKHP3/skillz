Based on the `okhp3-celestial-data` skill document, you can determine if Mercury is currently retrograde using the `getMercuryStatus()` function. This function uses a hardcoded array of retrograde periods sourced from published ephemeris data (2026–2031).

### Mercury Retrograde Status
To check the status for the current date in your wellness tracker UI:

1.  **Function Name**: `getMercuryStatus(date?)`
2.  **Parameters**: An optional `Date` object (defaults to the current date).
3.  **Return Type**:
    ```typescript
    type MercuryStatus = {
      retrograde: boolean;
      endDate: string | null; // ISO date string or null if not retrograde
    };
    ```

### Implementation Details
The status is calculated by comparing the current ISO date string against a predefined list of retrograde periods (`MERCURY_RETROGRADE`).

**Mercury Retrograde Periods (2025-2026 Context):**
According to the skill's data, the upcoming retrograde periods in 2026 are:
*   **2026-03-15** to **2026-04-07**
*   **2026-07-17** to **2026-08-11**
*   **2026-11-11** to **2026-12-01**

*(Note: If the current date falls outside these ranges and you are currently in 2024 or 2025, the function will return `retrograde: false` as the data set in this specific version of the skill begins in 2026.)*

### Code Snippet for your UI
You can copy this implementation into your project (e.g., `src/lib/celestial.ts`):

```typescript
const MERCURY_RETROGRADE = [
  { start: '2026-03-15', end: '2026-04-07' },
  { start: '2026-07-17', end: '2026-08-11' },
  { start: '2026-11-11', end: '2026-12-01' },
  // ... (refer to SKILL.md for full list through 2031)
];

export function getMercuryStatus(date: Date = new Date()) {
  const iso = date.toISOString().split('T')[0];
  const period = MERCURY_RETROGRADE.find(r => iso >= r.start && iso <= r.end);
  return { retrograde: !!period, endDate: period?.end ?? null };
}
```

### Usage in your Wellness Tracker
```typescript
import { getMercuryStatus } from './lib/celestial';

const mercury = getMercuryStatus();

if (mercury.retrograde) {
  console.log(`☿ Mercury is retrograde until ${mercury.endDate}`);
  // Update your UI state to show the warning and end date
} else {
  console.log("Mercury is not currently retrograde.");
}
```

This approach is entirely client-side, requires no network calls, and provides accurate results based on the astronomical ephemeris provided in the skill.