# Cross-Tradition Comparison UI Design

When designing a UI component for cross-tradition comparisons, it's important to use colors that are respectful, recognizable, and provide clear visual distinction. Below are suggested color schemes and layout strategies for displaying passages.

## 1. Suggested Color Palettes for Traditions

Using a consistent color for each tradition helps users quickly orient themselves when looking at comparative data.

| Tradition | Primary Color | Suggested Hex | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Judaism** | Blue / Navy | `#0038A8` | `bg-blue-800` |
| **Christianity** | Purple / Gold | `#673AB7` | `bg-purple-700` |
| **Islam** | Green | `#009000` | `bg-green-700` |
| **Buddhism** | Saffron / Orange | `#FF9933` | `bg-orange-500` |
| **Hinduism** | Deep Red / Saffron | `#FF4500` | `bg-red-600` |
| **Sikhism** | Blue / Orange | `#FF9933` | `bg-orange-600` |

### UI Implementation Tip:
Use these colors as **accents**:
- Border tops or side ribbons on the panels.
- Badge backgrounds for the tradition labels.
- Subtle background tints (e.g., 5% opacity) to distinguish columns.

## 2. Displaying Passages

For effective comparison, clarity and readability are paramount.

### A. Side-by-Side (Columnar) Layout
On desktop, a multi-column layout is most effective for direct comparison.
- **Header:** Clear title (e.g., "The Torah", "The Gospel", "The Quran") with the tradition icon/color.
- **Reference:** Chapter and verse citation clearly visible at the top or bottom.
- **Text Body:** High-contrast typography (Serif fonts often work well for religious texts to convey a sense of tradition and weight).

### B. Segmented Display
If comparing specific themes (e.g., "Charity"), group the passages under a single theme heading:
1. **Theme Heading** (e.g., "Concept of Mercy")
2. **Horizontal Stack or Grid** of cards.
3. **Card Structure:**
    - **Top Bar:** Tradition Name + Icon + Color Accent.
    - **Middle:** The translated text.
    - **Footer:** Original language snippet (optional) and the Citation.

### C. Mobile Responsiveness
On mobile, columns often become too narrow. Use a **Tabbed Interface** or a **Vertical Stack**:
- **Tabs:** Allow users to quickly switch between the same passage across different traditions.
- **Stack:** Show one after another with clear dividers and colored badges to prevent confusion.

## 3. Best Practices for Accessibility
- **Contrast:** Ensure text on colored backgrounds meets WCAG AA standards.
- **Translation Credits:** Always include the version or translator of the text used, as interpretations can vary significantly between traditions.
- **Toggle for Original Language:** Provide a way to view the original Hebrew, Greek, Arabic, etc., for users who want to see the source text.
