# Forgiveness Across Judaism, Christianity, and Islam

In the Abrahamic traditions, forgiveness is a central attribute of the Divine and a critical practice for human relationship and reconciliation. According to the **OKHP3 -- Cross-Tradition Compare Skill**, this theme (ID: `forgiveness`) is one of the 20 pre-seeded comparisons available for immediate use without requiring external API calls.

## Comparison of Scriptural Passages

| Tradition | Reference | Passage | Translation |
| :--- | :--- | :--- | :--- |
| **Judaism** | Psalm 103:12 | "As far as the east is from the west, so far hath he removed our transgressions from us." | Sefaria English |
| **Christianity** | Matthew 6:14-15 | "For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses." | KJV |
| **Islam** | Az-Zumar 39:53 | "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'" | Sahih International |

## What Connects These? (Bridging Note)

No other divine attribute appears more consistently across all three traditions than the willingness to forgive. The distance metaphor in Psalms, the conditional symmetry of the Lord's Prayer, and Az-Zumar's sweeping assurance all locate forgiveness at the center of what God is.

---

## Technical Implementation Details

To implement this comparison in your interfaith education site using the **Cross-Tradition Compare Skill**, follow these guidelines:

### 1. Data Access
The theme data is stored in the host project's `compareThemes.ts` file. You can access the entry with the ID `forgiveness`.

### 2. Rendering Strategy
*   **Three-Panel Layout**: Render each tradition's `staticText` and `attribution` side-by-side to give each identical visual and structural dignity.
*   **Bridging Note**: Display the `bridgingNote` (provided above) below the panels under a section like "What Connects These?".

### 3. Live Verse Fetching
While static text is provided for immediate display, you can enhance the user experience by fetching live verses using the `okhp3-verse-lookup` skill. Use the `liveRef` or `lookup` field from the theme object to make requests to the appropriate API endpoints:

*   **Judaism (Sefaria API)**: 
    *   Endpoint: `https://www.sefaria.org/api/texts/${lookup}`
*   **Christianity (Bible API)**:
    *   Endpoint: `https://bible-api.com/${lookup}`
*   **Islam (Aladhan/Quran API)**:
    *   Endpoint: `https://api.alquran.cloud/v1/ayah/${lookup}/en.sahih`

### 4. Proportional Representation
When expanding your site with NEW themes beyond the 20 pre-seeded ones, follow the **Proportional Representation Rule**:
*   **Christianity**: Include multiple examples (e.g., from different denominations) to reflect its ~63% US population share.
*   **Judaism and Islam**: Include equal representation (~2% and ~1% share respectively).
*   **Inclusivity**: Every comparison must include at least one entry from all three traditions.
