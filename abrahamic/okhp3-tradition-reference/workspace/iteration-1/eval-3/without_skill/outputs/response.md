# Orthodox Christian Scripture: Canon and API Considerations

## The Orthodox Canon
The Eastern Orthodox Church follows a larger canon than the Protestant and Catholic Bibles, primarily based on the **Septuagint (LXX)**, which is the ancient Greek translation of the Hebrew Scriptures. 

### Book Count
The Orthodox Old Testament typically includes **49 books**, while the New Testament consists of the standard **27 books** shared by almost all Christian denominations. This brings the total to **76 books**.

Key books included in the Orthodox Old Testament that are not in the Protestant canon (often referred to as "Deuterocanonical" or "Anagignoskomena") include:
*   1 Esdras
*   Tobit
*   Judith
*   1, 2, and 3 Maccabees
*   Wisdom of Solomon
*   Sirach (Ecclesiasticus)
*   Baruch
*   Letter of Jeremiah
*   Prayer of Manasseh
*   Psalm 151
*   Expanded versions of Esther and Daniel (including the Prayer of Azariah, Susanna, and Bel and the Dragon)

*Note: Some jurisdictions, like the Ethiopian Orthodox Tewahedo Church, have a even broader canon (81 books), but for the mainstream Eastern Orthodox Church, the count is generally 76.*

## The API Gap
When developing applications that reference Orthodox scripture, you will encounter a significant **API Gap**:

1.  **Limited Support for Deuterocanonical Books:** Most popular Bible APIs (like the API.Bible or YouVersion) primarily focus on the Protestant 66-book canon or the Catholic 73-book canon. Many do not include the additional books found in the Orthodox Septuagint, such as 3 Maccabees or 1 Esdras.
2.  **Versioning and Translation:** Many APIs default to the KJV, NIV, or ESV. For an Orthodox context, the **Orthodox Study Bible (OSB)** or specific Septuagint-based translations are preferred. These are often copyrighted and not available via free public APIs.
3.  **Numbering Discrepancies:** The numbering of Psalms and some chapters in the Septuagint differs from the Masoretic Text (the basis for most Western Bibles). An API that doesn't account for these offsets will serve the "wrong" text when a user requests a specific Orthodox reference.
4.  **Metadata and Liturgical Context:** Orthodox scripture use is heavily tied to the liturgical calendar (the Lectionary). Most general Bible APIs do not provide the metadata needed to link a specific date or feast to its assigned "Pericope" (reading).

### Recommendation
If you need to support the Orthodox canon, look for APIs that explicitly provide the **Septuagint (LXX)** and verify that they include the specific books required by the Eastern tradition. You may need to supplement a standard Bible API with a specialized data source for the additional books and liturgical readings.
