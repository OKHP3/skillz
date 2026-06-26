To fetch Psalms 23:1 from Sefaria, you can use their public REST API. The endpoint for retrieving texts is `https://www.sefaria.org/api/texts/{Ref}`.

### Exact API Call
For Psalms 23:1, the URL is:
`https://www.sefaria.org/api/texts/Psalms.23.1?context=0`

The `context=0` query parameter ensures that only the specific verse requested is returned, rather than the entire chapter.

### TypeScript Implementation and Normalization

In a TypeScript application, you can implement the fetch and normalization as follows:

```typescript
interface SefariaResponse {
  en: string | string[];
  he: string | string[];
  ref: string;
  [key: string]: any;
}

async function getPsalmsVerse(): Promise<string> {
  const ref = "Psalms.23.1";
  const url = `https://www.sefaria.org/api/texts/${ref}?context=0`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Sefaria API error: ${response.status} ${response.statusText}`);
    }

    const data: SefariaResponse = await response.json();

    // Normalization Logic:
    // Sefaria returns strings for single verses and arrays for ranges or multi-line verses.
    // We normalize this to always return a single string.
    let englishText = "";
    
    if (Array.isArray(data.en)) {
      englishText = data.en.join(" ");
    } else if (typeof data.en === "string") {
      englishText = data.en;
    }

    // Optional: Clean up HTML tags if they exist (Sefaria sometimes includes <i> or <b> tags)
    englishText = englishText.replace(/<[^>]*>?/gm, '');

    return englishText;
  } catch (error) {
    console.error("Failed to fetch verse:", error);
    throw error;
  }
}
```

### Key Normalization Points:
1.  **Handling Types**: The `en` field can be a `string` or an `Array<string>`. Always check with `Array.isArray()` before processing.
2.  **HTML Stripping**: Sefaria responses often contain HTML tags (like `<i>` for emphasis or formatting). Use a regex or a DOM parser to strip these if you need plain text.
3.  **Context Parameter**: Use `context=0` to avoid receiving extra verses that you didn't specifically ask for.
