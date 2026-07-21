---
name: okhp3-vite-github-pages
description: >
  Deploy a React or Vue SPA built with Vite to GitHub Pages using either a
  supported branch workflow or GitHub Actions. Covers the three most common
  failure modes: missing base path in vite.config (blank page), BrowserRouter
  instead of HashRouter (404 on reload), and a workflow that does not publish
  the built artifact. Use when setting up or fixing GitHub Pages deployment for
  a Vite single-page application.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: kierans-lifetrkr
  published-to: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
compatibility: Vite 4+, React 18+ or Vue 3+, npm. GitHub repository with Pages enabled.
---

# okhp3-vite-github-pages

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Three concerns must be resolved to deploy a Vite SPA to GitHub Pages. The exact
deployment mechanism may vary, but the built asset must use the correct base
path, the router must match the host's fallback behavior, and Pages must publish
the intended build output. Do not assume `gh-pages` is the only valid path.

## The three required changes

### 1. Base path in vite.config.ts

GitHub Pages serves your app from `https://username.github.io/repo-name/`, not
from root (`/`). Without the base path, all asset URLs resolve to `https://username.github.io/`
and the page loads blank with 404s in the console.

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',    // REQUIRED — must match your GitHub repo name exactly
})
```

If you use a custom domain (via CNAME): set `base: '/'` instead.

### 2. HashRouter (not BrowserRouter)

GitHub Pages is static hosting. When a user navigates to `https://username.github.io/repo-name/habits`,
GitHub serves a 404 — there is no `/habits` file. The HashRouter solves this by putting
the route in the URL hash: `https://username.github.io/repo-name/#/habits`.

```typescript
// App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';

// CORRECT
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  );
}

// WRONG — produces 404 on page reload or direct link
// import { BrowserRouter } from 'react-router-dom';
```

### 3. Deploy script using gh-pages

Install the package and add the deploy script:

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

Run `npm run deploy` to build and push the `dist/` folder to the `gh-pages` branch.
GitHub Pages automatically serves from that branch.

## Full setup checklist

- [ ] `base: '/repo-name/'` in vite.config.ts
- [ ] `HashRouter` in App.tsx (not BrowserRouter)
- [ ] `gh-pages` installed as devDependency
- [ ] `"deploy": "npm run build && gh-pages -d dist"` in package.json scripts
- [ ] GitHub repo Settings → Pages → Source set to `gh-pages` branch
- [ ] First deploy run: `npm run deploy`

## Verify it worked

After `npm run deploy`:
1. Go to the repo → Actions tab — should see a Pages deployment running
2. Go to Settings → Pages — should show the live URL
3. Visit `https://username.github.io/repo-name/#/` — should load your app
4. Reload the page — should NOT 404

## Environment variables in GitHub Pages deployments

Vite's `VITE_` prefix env vars are embedded at build time, not runtime.
They must be available when `npm run build` runs.

In Replit: add them to Replit Secrets, they are available during build.
In GitHub Actions: add them as repository secrets and inject into the build step.

```yaml
# .github/workflows/deploy.yml example
- name: Build
  env:
    VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
  run: npm run build
```

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Blank page, 404s in console | Missing `base` in vite.config | Add `base: '/repo-name/'` |
| 404 on page reload | BrowserRouter instead of HashRouter | Switch to HashRouter |
| `npm run deploy` fails | gh-pages not installed | `npm install --save-dev gh-pages` |
| Old version showing | Browser cache | Hard refresh (Cmd/Ctrl + Shift + R) |
| Correct on localhost, broken on Pages | Different `base` than repo name | Verify repo name matches base exactly |

## Custom domain setup

1. Add a `CNAME` file to `public/` containing your domain: `myapp.com`
2. Change vite.config: `base: '/'`
3. Configure DNS: CNAME `www` → `username.github.io`, A records for apex
4. GitHub Settings → Pages → Custom domain → enter domain → Save
5. Wait for DNS propagation (up to 48h) + GitHub TLS certificate (~15 min)

## Output contract

Return the chosen deployment mode, repository/base-path mapping, router decision, build and publish commands or workflow, live URL shape, and verification results for deep links and reloads. Treat GitHub Pages UI, Actions, DNS, and certificate timing as current platform facts that require verification when they affect the user's setup.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
