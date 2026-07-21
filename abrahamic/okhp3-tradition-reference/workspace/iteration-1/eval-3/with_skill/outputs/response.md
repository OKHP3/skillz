The Orthodox Christian tradition uses a **Septuagint-based (LXX)** canon for its Old Testament, which is broader than the canons used by Protestant or Catholic traditions.

### Canon and Book Count
The Orthodox canon typically consists of **76-78 books**, though this count varies slightly by specific jurisdiction (e.g., Greek, Russian, or Serbian Orthodox). The canon includes:
- **Protestant OT Core:** 39 books shared with all Christian traditions.
- **Catholic Deuterocanonicals:** 7 books (Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch) plus Greek additions to Esther and Daniel.
- **Orthodox Additions:** 3 Maccabees and Psalm 151 (present in most Eastern Orthodox canons).
- **Extended Canon:** Some jurisdictions include 4 Maccabees (as an appendix), 1 Esdras, and the Prayer of Manasseh.
- **New Testament:** 27 books, shared with all other Christian traditions.

### API Information and Gap
There is a significant **API gap** for the Orthodox tradition: **No free public unauthenticated API covers the full Orthodox Old Testament.**

When implementing scripture lookups for Orthodox users, be aware of the following:
- **API Provider:** `bible-api.com`
- **Endpoint:** `GET https://bible-api.com/{reference}?translation={id}`
- **Recommended Translation ID:** `web` (World English Bible) is the closest available for free as it includes the seven Catholic deuterocanonicals.
- **The Gap:** The `web` translation on `bible-api.com` **omits 3 Maccabees, Psalm 151, and 4 Maccabees**.
- **Developer Action:** You should surface this limitation explicitly when a user requests these specific Orthodox texts.

### Code Snippet Example
To fetch a verse using the closest available translation (WEB):
```javascript
// Example request for an Orthodox-relevant passage (using WEB translation)
fetch('https://bible-api.com/john 1:1-14?translation=web')
  .then(response => response.json())
  .then(data => console.log(data.text));
```

**Key Representative Passages for Orthodox tradition:**
- John 1:1-14 (`john 1:1-14`)
- 2 Peter 1:4 (`2 peter 1:4`)
- Matthew 3:13-17 (`matthew 3:13-17`)
