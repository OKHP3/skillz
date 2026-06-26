---
title: Settings Schema -- Abrahamic Reference Engine
type: schema
status: active
---

# Settings Schema

This document defines the configurable settings for the Abrahamic Reference Engine. Settings apply at the user/session level. There is no backend; all settings are stored in `localStorage` under the key `are-settings` (JSON-encoded).

---

## Schema

```typescript
interface ARESettings {
  theme: 'dark' | 'light' | 'system'
  defaultTranslations: {
    judaism: JudaismTranslationId
    christianity: ChristianityTranslationId
    islam: IslamTranslationId
  }
  denomination: DenominationId | null
  showPewExplainer: boolean
  compareLanguage: 'en'
}

type JudaismTranslationId = 'sefaria-en' | 'sefaria-he-en'

type ChristianityTranslationId =
  | 'kjv'
  | 'web'
  | 'asv'
  | 'bbe'
  | 'darby'
  | 'akjv'
  | 'ylt'
  | 'douay'

type IslamTranslationId =
  | 'quran-20'
  | 'quran-21'
  | 'quran-22'
  | 'quran-23'
  | 'quran-24'

type DenominationId =
  | 'christianity-evangelical'
  | 'christianity-catholic'
  | 'christianity-mainline'
  | 'christianity-lds'
  | 'christianity-orthodox'
  | 'judaism'
  | 'islam'
  | null
```

---

## Field reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | `'dark' \| 'light' \| 'system'` | `'system'` | UI color scheme. `system` follows the OS preference via `prefers-color-scheme`. Persisted to `localStorage`. |
| `defaultTranslations.judaism` | `JudaismTranslationId` | `'sefaria-en'` | Default translation for Sefaria/Judaism passages. |
| `defaultTranslations.christianity` | `ChristianityTranslationId` | `'kjv'` | Default translation for bible-api.com/Christianity passages. |
| `defaultTranslations.islam` | `IslamTranslationId` | `'quran-20'` | Default translation for Quran.com/Islam passages (Sahih International). |
| `denomination` | `DenominationId \| null` | `null` | User's self-identified denomination; used to pre-select translations. `null` means no preference. |
| `showPewExplainer` | `boolean` | `true` | Whether to show the "Why these three?" / Pew scope explainer widget. Users may dismiss it. |
| `compareLanguage` | `'en'` | `'en'` | Language for cross-tradition compare API calls. Currently locked to English. |

---

## localStorage key

```
localStorage key: 'are-settings'
Format: JSON string
```

### Read pattern

```typescript
function loadSettings(): ARESettings {
  const raw = localStorage.getItem('are-settings')
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}
```

### Write pattern

```typescript
function saveSettings(settings: ARESettings): void {
  localStorage.setItem('are-settings', JSON.stringify(settings))
}
```

Always merge with `defaultSettings` on read -- never assume a stored value is complete. Future schema additions must be backward-compatible (new fields always have a default).

---

## Default settings object

```typescript
const defaultSettings: ARESettings = {
  theme: 'system',
  defaultTranslations: {
    judaism: 'sefaria-en',
    christianity: 'kjv',
    islam: 'quran-20',
  },
  denomination: null,
  showPewExplainer: true,
  compareLanguage: 'en',
}
```

---

## Theme implementation

The `theme` setting drives a CSS class on the `<html>` element:

| Setting | CSS class | Custom properties |
|---------|-----------|-------------------|
| `dark` | `theme-dark` (or no class; dark is default) | `--bg-base: #0f0f0f`, `--bg-elevated: #1a1a1a` |
| `light` | `theme-light` | `--bg-base: #f5f0e8`, `--bg-elevated: #ffffff` |
| `system` | Derived from `prefers-color-scheme` at mount | Same as dark or light respectively |

System preference is read at mount via:

```typescript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
```

---

## Denomination-to-default-translation mapping

When a user sets `denomination`, the following default translations are suggested (not forced):

| Denomination | Christianity default | Note |
|-------------|---------------------|------|
| `christianity-evangelical` | `kjv` | KJV is the historic standard |
| `christianity-catholic` | `web` | WEB includes deuterocanonicals; NABRE not available in free build |
| `christianity-mainline` | `kjv` | NRSV not available in free build |
| `christianity-lds` | `kjv` | LDS standard is KJV without modification |
| `christianity-orthodox` | `web` | WEB covers most deuterocanonicals available via free API |
| `judaism` | `sefaria-en` | |
| `islam` | `quran-20` | Sahih International as default |

---

## Migration notes

If the settings schema changes (fields added, renamed, or removed), bump the schema version by adding a `_v` field and handling migration in `loadSettings()`.

```typescript
// Future migration example
if (!settings._v || settings._v < 2) {
  settings.newField = defaultSettings.newField
  settings._v = 2
}
```

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
