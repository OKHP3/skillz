According to the **Proportional representation rule** section of the `okhp3-cross-tradition-compare` skill, when generating NEW theme entries or expanding the seeded set beyond the initial 20, the number of examples per tradition should reflect their share of the US population (based on Pew Research Center data).

### The Rule
*   **Christianity:** Receives the most examples (reflecting ~63% of the US population, across 5 denominations).
*   **Judaism and Islam:** Receive equal representation to each other (reflecting ~2% and ~1% of the US population respectively).
*   **Universal Inclusion:** Every tradition must have at least one entry in every comparison; no tradition is optional.

### Application
This rule applies to the **frequency or number of examples** provided when expanding the dataset. However, it does **not** apply to the aesthetic or visual weighting within the UI. Each tradition's panel must receive identical visual and structural dignity in the display, regardless of population share.

### Technical Implementation Details
When creating a new theme entry, you should follow the structure of the `compareThemes.ts` file in the host project. Each entry requires:
*   `id`: A unique string identifier (e.g., `forgiveness`).
*   `title`: The name of the theme.
*   `description`: A brief overview of the theme's relevance.
*   `bridgingNote`: A neutral explanation of the shared structural moves between the traditions.
*   **Tradition Objects:** Three objects (Judaism, Christianity, Islam) each containing:
    *   `displayRef`: The human-readable reference (e.g., `Leviticus 19:18`).
    *   `lookup`: The string used for API/internal lookup (e.g., `matthew 7:12`).
    *   `staticText`: The pre-seeded text of the passage.
    *   `translationName`: The specific translation used (e.g., `Sefaria English`, `KJV`, `Sahih International`).
    *   `apiProvider`: The source for live fetching if applicable.

### Neutral Bridging Note Style Guide
When generating the `bridgingNote` for new entries, you must follow these constraints:
*   **Do:** Describe shared structural moves and linguistic parallels (e.g., "The Hebrew shalom, Greek eirene, and Arabic salam share both a root and a meaning").
*   **Do Not:** Use competitive or hierarchical language such as "original," "fulfilled," "superior," or "more complete."
*   **Tone:** Academic-neutral, warm, and curious.
