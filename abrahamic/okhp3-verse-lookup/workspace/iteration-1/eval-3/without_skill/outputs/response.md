When a user types 'D&C 76:22' into your verse lookup, the routing logic identifies the scripture as belonging to the Latter-day Saint (LDS) tradition. 'D&C' stands for the Doctrine and Covenants, which is not part of the standard Biblical canon used by bible-api.com.

Here is how the routing typically works in this context:

### 1. Parsing the Reference
The application first parses the input string ('D&C 76:22'). It identifies the book abbreviation ('D&C') and determines which religious tradition or scripture set it belongs to. Since 'D&C' is specific to the LDS tradition, the app flags this request for specialized handling.

### 2. Tradition-Based Routing
Instead of sending the request to a general Bible API (like bible-api.com, which primarily handles the Old and New Testaments), the application routes the request to an LDS-specific data source or internal handler.

### 3. Destination: Not bible-api.com
It does **not** go to bible-api.com. Bible-api.com generally supports versions like the King James Version (KJV), World English Bible (WEB), etc., but it does not host the Doctrine and Covenants or the Book of Mormon.

### 4. Where it goes instead
Depending on your application's architecture, the request is likely routed to one of the following:
*   **A Custom LDS API:** A specialized API that serves LDS scriptures (e.g., a custom-built backend or a community-maintained LDS scripture API).
*   **Local Data Store:** Many LDS-enabled apps bundle these scriptures locally (in JSON or a database) because the text is static and allows for offline lookup.
*   **Dedicated LDS Scraping/Fetching Service:** A service specifically designed to interface with the Church's official scripture format or a compatible open-source dataset (like the one found in `src/api/nephi.ts` or similar LDS-specific files in your repository).

### Summary
The routing detects the 'D&C' prefix, bypasses the standard Bible API, and utilizes an LDS-specific endpoint or local module to retrieve the verse. This ensures that non-biblical scriptures are handled correctly without returning a "404 Not Found" from a Bible-only service.