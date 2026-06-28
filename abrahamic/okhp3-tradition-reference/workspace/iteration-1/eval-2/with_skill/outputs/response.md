# LDS Standard Works and ARE Routing Logic

Based on the **OKHP3 Tradition Reference Skill**, here is the breakdown of the LDS Standard Works canon and how the Abrahamic Reference Engine (ARE) routes lookup requests for LDS users compared to Protestant users.

## 1. The LDS Standard Works Canon
The LDS (Latter-day Saint) tradition uses a four-volume canon known as the **Standard Works**:

| Volume | Contents | Books / Sections |
|--------|----------|-----------------|
| **Holy Bible (KJV)** | Old and New Testament | 66 books |
| **Book of Mormon** | Narrative scripture from ancient American prophets | 15 books (1 Nephi -- Moroni) |
| **Doctrine and Covenants** | Modern revelations, primarily through Joseph Smith | 138 sections + Official Declarations |
| **Pearl of Great Price** | Moses, Abraham, Joseph Smith — History, Joseph Smith — Matthew, Articles of Faith | 5 texts |

## 2. Routing Logic: LDS vs. Protestant
The ARE routes requests differently based on the user's denomination and the specific text being requested.

### Regular Protestant Users
For Evangelical and Mainline Protestant users, all requests are routed to the **bible-api.com** service, as their canon is limited to the 66-book Bible.
*   **API Endpoint:** `GET https://bible-api.com/{reference}?translation={id}`
*   **Default Translation:** `kjv` (Evangelical) or `web` (Mainline).
*   **Reference Format:** `{book} {chapter}:{verse}` (e.g., `john 3:16`).

### LDS Users
For LDS users, the ARE employs a dual-routing strategy based on the book prefix:

#### A. Bible Requests (KJV)
If the requested book belongs to the 66-book Bible (determined by the `isLdsBibleRef` function), the request is routed to **bible-api.com** with the King James Version forced.
*   **API Endpoint:** `GET https://bible-api.com/{reference}?translation=kjv`
*   **Function:** `isLdsBibleRef(reference)` checks the input against `BIBLE_BOOK_PREFIXES`.

#### B. Non-Bible Standard Works
Requests for the Book of Mormon, D&C, or Pearl of Great Price are routed to the **scriptures.nephi.org** community API.
*   **API Endpoint:** `GET https://scriptures.nephi.org/verses/{encoded_reference}`
*   **Function:** `fetchNephiPassage(reference)`
*   **Reference Formats:** 
    *   Book of Mormon: `1 Ne. 3:7`, `2 Ne. 2:25`, `Alma 32:21`
    *   D&C: `D&C 76:22`, `D&C 1:37`
    *   Pearl of Great Price: `Moses 1:39`, `Abraham 3:22`, `A of F 1:13`

## 3. Implementation Details & Fallbacks
Because `scriptures.nephi.org` is a community-maintained API without an uptime guarantee, the ARE implements a specific error handler:

*   **Error Class:** `LdsApiUnavailableError`
*   **Fallback Message:** *"The LDS Standard Works (Book of Mormon, D&C, Pearl of Great Price) are not available via a guaranteed free API. Visit https://www.churchofjesuschrist.org/study/scriptures to look up this passage."*

### Code Snippet: Routing Check
```typescript
export function isLdsBibleRef(reference: string): boolean {
  const lower = reference.toLowerCase().trim();
  for (const prefix of BIBLE_BOOK_PREFIXES) {
    if (
      lower.startsWith(prefix + ' ') ||
      lower.startsWith(prefix + ':') ||
      lower === prefix
    ) {
      return true;
    }
  }
  return false;
}
```
