To fetch a description for Rosh Hashanah from Wikipedia and display it with proper attribution, follow the implementation details from the `okhp3-tradition-observance-calendar` skill.

### 1. Fetching the Description
Use the Wikipedia REST API summary endpoint. You should only fetch this on user interaction (e.g., when the user clicks the event).

**Endpoint:**
`GET https://en.wikipedia.org/api/rest_v1/page/summary/{article_title}`

For Rosh Hashanah, the `article_title` should be `Rosh_Hashanah`.

### 2. Implementation Code
Here is the recommended fetch pattern using the `WIKIPEDIA_ARTICLE_MAP` and a caching strategy:

```typescript
export const WIKIPEDIA_ARTICLE_MAP: Record<string, string> = {
  'Rosh Hashanah': 'Rosh_Hashanah',
  'Rosh Hashana':  'Rosh_Hashanah',
  // ... other mappings
};

async function getHolidayDescription(rawName: string): Promise<{
  extract: string;
  wikiUrl: string;
} | null> {
  // Strip year suffixes (common in Hebcal data like "Rosh Hashana 5787")
  const normalized = rawName.replace(/\s+\d{4}$/, '').trim();
  const articleTitle = WIKIPEDIA_ARTICLE_MAP[normalized] || WIKIPEDIA_ARTICLE_MAP[rawName];
  
  if (!articleTitle) return null;

  const cacheKey = `are_wiki_${articleTitle}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    
    const data = await res.json();
    const result = {
      extract: data.extract || '',
      wikiUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${articleTitle}`,
    };
    
    sessionStorage?.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}
```

### 3. Required Attribution
When displaying the Wikipedia content in your UI, you must include the following attribution and link to the source URL:

*   **Attribution Text:** `"Description via Wikipedia (CC BY-SA 3.0)"`
*   **Link:** The `wikiUrl` returned by the API (e.g., `https://en.wikipedia.org/wiki/Rosh_Hashanah`).

### Summary Checklist
*   **Trigger:** Fetch only on user interaction.
*   **License:** Ensure the CC BY-SA 3.0 attribution is visible.
*   **Caching:** Use `sessionStorage` to avoid redundant API calls.