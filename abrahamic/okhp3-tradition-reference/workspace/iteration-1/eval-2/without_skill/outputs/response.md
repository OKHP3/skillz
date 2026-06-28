# Standard Works Canon and ARE Routing

## The Standard Works (LDS Canon)

The "Standard Works" are the four volumes of scripture that constitute the official canon of The Church of Jesus Christ of Latter-day Saints (LDS):

1.  **The Holy Bible**: The LDS Church primarily uses the King James Version (KJV). It includes both the Old Testament and the New Testament.
2.  **The Book of Mormon: Another Testament of Jesus Christ**: An account of God's dealings with the ancient inhabitants of the Americas.
3.  **The Doctrine and Covenants**: A collection of modern revelations and inspired declarations, primarily given through Joseph Smith.
4.  **The Pearl of Great Price**: A selection of choice materials touching many significant aspects of the faith and doctrine, including the Book of Moses, the Book of Abraham, and the Articles of Faith.

## ARE Route Lookup: LDS vs. Protestant Users

In the context of the **Aggregated Reference Engine (ARE)** (or similar architectural patterns for scriptural lookup), the routing of requests differs based on the "denomination" or "tradition" context of the user:

### 1. Scope of the Canon
*   **Protestant Users**: The lookup engine typically restricts the searchable scope to the 66 books of the Protestant Bible (39 Old Testament, 27 New Testament). Requests for books like "1 Nephi" or "Alma" would result in a "Not Found" or "Invalid Reference" error.
*   **LDS Users**: The engine expands the scope to include the entire Standard Works. A lookup for "Alma 32:21" is recognized as a valid canonical reference and routed to the LDS-specific scriptural database.

### 2. Version and Translation Defaults
*   **Protestant Users**: Routing often defaults to a variety of modern translations (NIV, ESV, NASB, etc.) or a standard KJV. The lookup might involve a "Version Selector" logic that defaults to a popular Protestant translation.
*   **LDS Users**: The route is typically hard-coded or heavily weighted to the **LDS edition of the KJV** for Bible references. This edition includes specific LDS-authored footnotes and cross-references (the Topical Guide and Bible Dictionary) that link to the other Standard Works.

### 3. Cross-Reference Resolution
*   **Protestant Users**: Cross-reference lookups are contained within the Bible.
*   **LDS Users**: The routing engine enables **inter-canonical lookups**. For example, a Bible verse might trigger a route to a "Compare" or "Footnote" service that pulls relevant passages from the Book of Mormon or Doctrine and Covenants.

### 4. API Endpoints/Data Sources
*   **Protestant Users**: Requests are often routed to general Bible APIs (like BibleGateway, Digital Bible Library, or local SQL Bibles).
*   **LDS Users**: Requests for the additional scriptures are routed to specialized data stores (like the Church's official Gospel Library API or custom LDS-indexed databases) that handle the specific chapter/verse structures unique to the Book of Mormon and D&C.