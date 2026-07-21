To fetch **Psalms 23:1** from Sefaria for a TypeScript application, follow these steps based on the **Sefaria API** documentation:

### 1. Exact API Call
The endpoint uses the base URL `https://www.sefaria.org/api/texts/` followed by the URL-encoded reference and the `lang` parameter.

**Endpoint:**
`GET https://www.sefaria.org/api/texts/Psalms%2023:1?lang=en`

### 2. Implementation in TypeScript
Use the `fetch` API to retrieve the data. Note that Sefaria uses the book name `Psalms` (plural).

```typescript
async function fetchPsalms() {
  const ref = "Psalms 23:1";
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?lang=en`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  // Normalization logic
  const normalizedText = normalizeSefariaText(data.text);
  
  console.log(normalizedText); // "The LORD is my shepherd; I shall not want."
}
```

### 3. Normalization Rules
Sefaria responses may contain arrays (for multiple verses) and HTML tags. You must:
1. **Flatten**: Join arrays with a space if a range was requested (or if the single verse is returned as an array).
2. **Strip HTML**: Use a regex to remove any formatting tags.
3. **Trim**: Remove leading and trailing whitespace.

```typescript
function normalizeSefariaText(text: string | string[]): string {
  // 1. Flatten array if necessary
  const combined = Array.isArray(text) ? text.join(' ') : text;

  // 2. Strip HTML tags and 3. Trim whitespace
  return combined
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .trim();
}
```

### Attribution
Per the API requirements, you should include the following attribution in your UI:
`Sefaria.org -- CC BY-SA 2.0`
