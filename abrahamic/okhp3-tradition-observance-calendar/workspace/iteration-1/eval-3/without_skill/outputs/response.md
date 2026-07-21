To fetch a description of Rosh Hashanah from Wikipedia, the most efficient method is to use the **Wikipedia REST API (Summary endpoint)**.

### 1. Fetching the Description
You can perform a GET request to the following endpoint:
`https://en.wikipedia.org/api/rest_v1/page/summary/Rosh_Hashanah`

The response will be a JSON object containing:
- `extract`: A plain-text summary of the article.
- `extract_html`: An HTML-formatted version of the summary.
- `thumbnail`: A link to the article's primary image.
- `content_urls`: Direct links to the article (desktop and mobile).

### 2. Attribution Requirements
Wikipedia content is licensed under **Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA)**. To comply with this license and Wikipedia's terms of use, you must:

1.  **Link back to the source**: Provide a clear hyperlink to the original Wikipedia article.
2.  **State the source**: It is standard practice to include the text "From Wikipedia, the free encyclopedia".
3.  **License Disclosure**: If you are modifying the text significantly, you should mention the CC BY-SA license. For a simple summary display, a clear link to the article is usually sufficient for attribution.

Example display:
> **Rosh Hashanah** is the Jewish New Year... [Read more on Wikipedia]
