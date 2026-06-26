# Cross-Tradition Comparison UI Component Guide

Based on the **OKHP3 Cross-Tradition Compare Skill**, here is the specification for building a comparison UI component.

## 1. Tradition Panel Colors
Each tradition should be assigned a distinct color for its panel and accents to maintain visual distinction. Based on the implementation in the host project (`src/components/TraditionBadge.tsx` and `src/pages/CrossTraditionCompare.tsx`), the standard color mapping is:

| Tradition    | Primary Color (Tailwind) | Border Color      | Background Color |
| :----------- | :----------------------- | :---------------- | :--------------- |
| **Judaism**  | `blue-400`               | `border-blue-800` | `bg-blue-950`    |
| **Christianity** | `violet-400`            | `border-violet-800` | `bg-violet-950`  |
| **Islam**    | `emerald-400`            | `border-emerald-800`| `bg-emerald-950` |

### Code Snippet: Color Mapping
```typescript
const borderColors: Record<TraditionFamily, string> = {
  judaism: 'border-blue-800',
  christianity: 'border-violet-800',
  islam: 'border-emerald-800',
};

const accentColors: Record<TraditionFamily, string> = {
  judaism: 'border-l-blue-500',
  christianity: 'border-l-violet-500',
  islam: 'border-l-emerald-500',
};
```

## 2. Passage Display Guidelines
According to the **Quick Start** and **Mission** sections of the skill:

1.  **Three-Panel Layout**: Render each tradition's passage (`staticText` and `attribution`) in a side-by-side layout (or stack on mobile).
2.  **Structural Dignity**: Each panel must receive identical visual and structural dignity, regardless of the tradition's population share.
3.  **Neutral Bridging Note**: Display the `bridgingNote` below the panels under a section titled **"What Connects These?"**. This note explains the shared structural move or linguistic parallel without ranking the traditions.

### Code Snippet: Tradition Panel Structure
```tsx
function TraditionPanel({ family, passage }) {
  return (
    <div className={`flex flex-col rounded-lg border bg-bg-elevated p-5 ${borderColors[family]}`}>
      <header className="mb-4">
        <TraditionBadge family={family} />
        <p className="text-xs uppercase tracking-widest">{passage.displayReference}</p>
      </header>
      
      <blockquote className={`flex-1 text-sm font-serif border-l-2 pl-3 ${accentColors[family]}`}>
        {passage.staticText}
      </blockquote>

      <footer className="mt-4 pt-3 border-t">
        <span className="text-2xs">{passage.translationName}</span>
      </footer>
    </div>
  );
}
```

## 3. Data and APIs
*   **Pre-seeded Data**: Use the 20 pre-seeded themes found in `COMPARE_THEMES` (imported from `../data/compareThemes`). These contain `staticText` for immediate display.
*   **Live Fetching**: If the user requires a live version of the verse, use the `fetchPassage` function with the `liveRef` or `lookup` field.
    *   **API Endpoint**: `fetchPassage` interacts with different providers based on the tradition:
        *   **Judaism**: `sefaria.org`
        *   **Christianity**: `bible-api.com`
        *   **Islam**: `quran.com` (or `alquran.cloud`)
    *   **Parameters**:
        ```typescript
        const result = await fetchPassage({
          tradition: 'christianity' | 'islam' | 'judaism',
          reference: passage.lookup,
          translationId: 'kjv' | 'sefaria-en' | 'quran-20',
        });
        ```

## 4. Proportional Representation Rule
When expanding the set of themes:
*   **Christianity**: Provides the most examples (reflecting ~63% US share).
*   **Judaism & Islam**: Receive equal representation (~2% and ~1% share).
*   **Inclusion**: Every comparison must include at least one entry from all three traditions.
