To implement a Quran verse lookup for Surah 2, verse 255 (Ayat al-Kursi) using the Sahih International translation, you should use the following details as specified in the authoritative tradition reference:

### **Primary API Provider**
The primary API provider for Islam is **Quran.com API v4**.

### **Endpoint Format**
The endpoint format for fetching a specific verse is:
`GET https://api.quran.com/api/v4/verses/by_key/{surah}:{ayah}?language=en&translations={id}&words=false`

For **Ayat al-Kursi (Surah 2, verse 255)**, the reference key is `2:255`.

### **Translation ID**
The translation ID for **Sahih International** is **`20`**.

### **Complete Request Example**
To fetch the verse with the Sahih International translation, you would use:
`https://api.quran.com/api/v4/verses/by_key/2:255?language=en&translations=20&words=false`

---

### **Fallback Option**
If you need an alternative provider, you can use **AlQuran.cloud**:
- **Endpoint**: `GET https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/{edition}`
- **Sahih International Edition**: `en.sahih`
- **Example**: `https://api.alquran.cloud/v1/ayah/2:255/en.sahih`

### **Implementation Notes**
- **Reference format**: Always use `{surah}:{ayah}` (e.g., `2:255`).
- **Translation handling**: In this ecosystem, if you are using internal IDs, you may see them prefixed with `quran-` (e.g., `quran-20`). Ensure you strip this prefix before passing the integer ID to the Quran.com API.
