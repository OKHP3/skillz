To fetch John 3:16 in the World English Bible (WEB) translation from bible-api.com, you should use the following API endpoint and fetch call.

### API Endpoint and Fetch Call

**Endpoint Pattern:**
`GET https://bible-api.com/{reference}?translation={id}`

**Specific Request for John 3:16 (WEB):**
`GET https://bible-api.com/john%203:16?translation=web`

**Code Snippet:**
```javascript
const reference = "john 3:16";
const translationId = "web";
const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translationId}`;

fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Passage Text:", data.text);
  })
  .catch(error => {
    console.error("Error fetching passage:", error);
  });
```

### Denominational Suitability

According to the skill documentation, the **World English Bible (WEB)** translation is a public domain, modern update that includes deuterocanonical books. It is best suited for the following denominations:

*   **Evangelical Protestant:** It is one of the available translations for the 66-book Protestant canon.
*   **Mainline Protestant:** It is suitable for the 66-book canon.
*   **Catholic:** It is suitable because it includes deuterocanonical books (such as Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, and Baruch), which are required for the 73-book Catholic canon but absent from the KJV on this API.
*   **Orthodox Christian:** It is the "best available" option among the free translations on bible-api.com for Orthodox users, as it is Septuagint-based, although it does not cover the full Orthodox Old Testament (missing 3 Maccabees, Psalm 151, and 4 Maccabees).

### Key Parameters and Information
*   **Translation ID:** `web`
*   **Reference Format:** `{book} {chapter}:{verse}` (e.g., `john 3:16`)
*   **Auth:** None required.
*   **License:** Public domain.
