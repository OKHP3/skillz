When a user types 'D&C 76:22' into the verse lookup with the LDS denomination enabled, the routing works by splitting requests between two different sources based on whether the reference is part of the standard Bible or other LDS Standard Works.

### Routing Logic Overview
The decision process is handled in the `VerseLookup.tsx` component (specifically within the `doFetch` function) and relies on the `isLdsBibleRef` helper function from `src/api/nephi.ts`.

For the input **'D&C 76:22'**, the flow follows this logic:

1.  **Denomination Check**: The app detects that `tradition === 'christianity'` and `denomination === 'lds'`.
2.  **Reference Validation**: It calls `isLdsBibleRef('D&C 76:22')`.
    *   `isLdsBibleRef` returns `true` only for the 66 books of the Protestant Bible.
    *   Since 'D&C' (Doctrine and Covenants) is not a Bible book, the function returns `false`.
3.  **Endpoint Routing**: Because it is not a Bible reference, the app routes the request to **scriptures.nephi.org** instead of bible-api.com.

### Implementation Details

#### 1. Routing Entry Point
The routing logic in the code looks like this:
```typescript
if (tradition === 'christianity' && denomination === 'lds' && !isLdsBibleRef(ref)) {
  // This branch is taken for 'D&C 76:22'
  fetchNephiPassage(ref);
} else {
  // This branch is for Bible books (KJV)
  fetchPassage({ tradition, reference, translationId });
}
```

#### 2. The API Call: scriptures.nephi.org
The `fetchNephiPassage` function targets a community-maintained API.

*   **Function**: `fetchNephiPassage(reference: string)`
*   **Base URL**: `https://scriptures.nephi.org`
*   **Endpoint Pattern**: `GET https://scriptures.nephi.org/verses/{url-encoded-reference}`
*   **Parameter**: The reference is URL-encoded using `encodeURIComponent`. For 'D&C 76:22', the path becomes `/verses/D%26C%2076%3A22`.

#### 3. Data Extraction
The response is JSON, and the text is extracted by checking fields in this priority:
1. `scripture_phrase`
2. `text`
3. `verse` (the first non-empty value is used)

#### 4. Fallback Handling
Because `scriptures.nephi.org` is a community API without an uptime guarantee, the app implements a specific error handling pattern:
*   If the fetch fails, the code throws an `LdsApiUnavailableError`.
*   The UI then displays a specific fallback message:
    > "The LDS Standard Works (Book of Mormon, D&C, Pearl of Great Price) are not available via a guaranteed free API at this time. Visit churchofjesuschrist.org/study/scriptures to look up this passage."

### Summary of Differences
*   **Bible-api.com**: Used only if the reference is a standard Bible book (e.g., 'James 1:5'). It uses the `translation=kjv` parameter.
*   **Scriptures.nephi.org**: Used for 'D&C 76:22' and other non-Bible LDS works (Book of Mormon, Pearl of Great Price).