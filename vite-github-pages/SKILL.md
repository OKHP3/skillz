---
name: vite-github-pages
description: >
  Configures a Vite + React (or Vue/Svelte) SPA for deployment to GitHub Pages as
  a static site. Handles the three most common failure points: missing base path in
  vite.config.ts, BrowserRouter vs HashRouter for SPA routing, and the gh-pages
  npm package setup. Use when a user is deploying a Vite app to GitHub Pages and
  getting a blank page, 404 errors on route refresh, or broken asset paths.
license: MIT
metadata:
  author: Jamie Hill (OKHP3 / OverKill Hill P³)
  version: "1.0"
  origin: Kieran's LifeTrkr (https://github.com/OKHP3/kierans-lifetrkr)
  published-via: OKHP3/skillz
---

# vite-github-pages

Deploy a Vite SPA to GitHub Pages correctly. Three changes required. All three are
necessary. Missing any one of them produces a different failure mode.

## The three required changes

### 1. Set `base` in vite.config.ts (prevents blank page)

GitHub Pages serves your app at `https://username.github.io/repo-name/`.
Vite defaults to `/`, which means all asset paths are wrong.

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/repo-name/',  // ← REQUIRED. Replace with your actual repo name.
})
```

Without this: the page loads but all JS/CSS files 404, producing a blank white page.

### 2. Use HashRouter (prevents 404 on refresh)

GitHub Pages is a static file server. When a user refreshes at `/habits`, the server
looks for a file called `habits/index.html` — which doesn't exist.

`HashRouter` sidesteps this by putting the route in the URL fragment (`/#/habits`).
The fragment is never sent to the server, so GitHub Pages always serves `index.html`.

```typescript
// App.tsx — React Router example
import { HashRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <HashRouter>  {/* ← Use this. NOT BrowserRouter. */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/habits" element={<Habits />} />
      </Routes>
    </HashRouter>
  );
}
```

Without this: direct links and page refreshes return GitHub's 404 page.

### 3. Install gh-pages and add the deploy script

```bash
npm install --save-dev gh-pages
```

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

To deploy:
```bash
npm run deploy
```

This builds to `dist/` and pushes that folder to the `gh-pages` branch.
GitHub Pages serves from the `gh-pages` branch automatically.

Without this: you'd need to manually push built files, which is error-prone.

## Enable GitHub Pages in repository settings

1. GitHub → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages`, folder: `/ (root)`
4. Save

GitHub Pages will be available at `https://username.github.io/repo-name/#/`
(note the `#/` from HashRouter).

## Complete working example

```
my-app/
├── src/
│   └── App.tsx              ← HashRouter
├── vite.config.ts           ← base: '/my-app/'
├── package.json             ← deploy script with gh-pages
└── .gitignore               ← dist/ is in .gitignore (gh-pages manages it)
```

`.gitignore` should include `dist/` — the `gh-pages` package handles pushing the
built output to the `gh-pages` branch independently.

## Debugging checklist

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank white page | Missing `base` in vite.config.ts | Add `base: '/repo-name/'` |
| 404 on page refresh | Using BrowserRouter | Switch to HashRouter |
| Assets 404 but page loads | Wrong `base` value | Check repo name matches exactly |
| Deploy command fails | `gh-pages` not installed | `npm install --save-dev gh-pages` |
| Old version showing | Browser cache | Hard refresh (Ctrl+Shift+R) |
| Changes not live | Pushed to main, not gh-pages | Run `npm run deploy` |

## Custom domain (optional)

To use a custom domain (e.g., `app.yourdomain.com`):
1. Create a `CNAME` file in the `public/` folder containing your domain
2. Configure DNS at your registrar
3. GitHub → Settings → Pages → Custom domain

When using a custom domain, change `base` in vite.config.ts to `/` (root).
