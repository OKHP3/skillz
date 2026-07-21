For a Quran verse lookup, a highly recommended and commonly used API is **Aladhan's Quran Cloud API** (api.alquran.cloud) or the official **Quran.com API** (api.quran.com).

### 1. Aladhan's Quran Cloud API
This API is very straightforward for fetching specific verses with translations.

*   **API Base**: `https://api.alquran.cloud/v1/`
*   **Endpoint Format**: `ayah/{surah}:{ayah}/{edition}`
*   **For Surah 2, Verse 255 (Ayat al-Kursi)**: `https://api.alquran.cloud/v1/ayah/2:255/en.sahih`
*   **Sahih International Identifier**: `en.sahih`

### 2. Quran.com API (v4)
This is the official API used by Quran.com.

*   **API Base**: `https://api.quran.com/api/v4/`
*   **Endpoint Format**: `verses/by_key/{verse_key}?translations={translation_id}`
*   **For Surah 2, Verse 255**: `https://api.quran.com/api/v4/verses/by_key/2:255?translations=20`
*   **Sahih International Translation ID**: `20`

Both APIs are free to use and provide high-quality data. Quran Cloud is often preferred for simple integrations, while Quran.com API offers more robust features for complex applications.