To fetch John 3:16 in the World English Bible (WEB) translation from bible-api.com, you can use the following `fetch` call:

```javascript
fetch('https://bible-api.com/john+3:16?translation=web')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching verse:', error));
```

### Explanation of the WEB Translation

The **World English Bible (WEB)** is a modern English update of the American Standard Version (ASV) of 1901. It is unique because it is in the **public domain**, meaning it is free from copyright restrictions.

**Denominational Suitability:**
The WEB is generally considered a **non-denominational** or **ecumenical** translation. It is well-suited for:

1.  **Protestant Denominations:** As a revision of the ASV, it follows the Protestant biblical canon (66 books). It is popular among various evangelical, baptist, and independent churches that prefer a literal yet modern translation.
2.  **Messianic Judaism / Hebrew Roots Movements:** There is a specific version of the WEB called the "World Messianic Bible" (WMB) that uses Hebrew names (e.g., "Yeshua" instead of "Jesus"), making the base WEB text very accessible to these groups.
3.  **Global Missions and Digital Ministries:** Because it is royalty-free, it is the primary choice for app developers, website creators, and missionaries who need a modern English text without the legal hurdles of licensed translations like the NIV or ESV.
4.  **Conservative/Traditional Believers:** Since it is based on the ASV, which was known for its extreme literalness, it appeals to those who value a "word-for-word" (formal equivalence) approach to translation.

While it is not the "official" liturgical text of the Catholic or Orthodox churches (as it typically lacks the Deuterocanon/Apocrypha in its standard form), its clear language makes it a useful reference for any English speaker.