In 2027, the dates for Easter are as follows according to the Computus algorithms provided in the specialized skill documentation:

### **Western Easter 2027**
- **Date:** March 28, 2027
- **Algorithm:** Gregorian Computus
- **Validation:** The skill confirms that for 2027, the Western Easter date is March 28.

### **Orthodox Easter 2027**
- **Date:** May 2, 2027
- **Algorithm:** Julian Computus with Gregorian offset (+13 days for the 20th/21st century)
- **Validation:** The skill confirms that for 2027, the Orthodox Easter date is May 2.

---

### **Implementation Details**

To verify your Computus algorithm, you can use the following TypeScript implementations provided in the skill:

#### **1. Western Easter (Gregorian Computus)**
The `computeWesternEaster` function implements the Gregorian Computus:

```typescript
function computeWesternEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
```

#### **2. Orthodox Easter (Julian Computus + Gregorian offset)**
The `computeOrthodoxEaster` function calculates the date based on the Julian calendar and then applies the 13-day offset for the Gregorian calendar:

```typescript
function computeOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const f = Math.floor((d + e + 114) / 31);
  const g = ((d + e + 114) % 31) + 1;
  // Julian result; add 13 days for 20th/21st century Gregorian conversion
  const result = new Date(year, f - 1, g + 13);
  return result;
}
```

These functions are part of the `generateChristianHolidays` generation process, which uses `algorithm` as the source for these dates rather than an external API.