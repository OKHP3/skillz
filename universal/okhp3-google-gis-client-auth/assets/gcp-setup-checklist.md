# GCP Console Setup Checklist
## okhp3-google-gis-client-auth

Printable / copy-paste reference for setting up a Google OAuth 2.0 Client ID
for the GIS implicit token model (no backend, no redirect URI, no Client Secret).

---

## Prerequisites

- [ ] Google account with GCP access
- [ ] Your deployed app domain (e.g. `https://yourname.github.io`)
- [ ] Your dev server URL (e.g. `http://localhost:5173`)

---

## Step 1 — Create or select a GCP project

1. Open [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector (top left) → **New Project**
3. Name it (e.g. `my-app-auth`), click **Create**

---

## Step 2 — Enable required APIs

For each API your app calls:

| API | Enable at |
|---|---|
| Google Calendar API | `console.cloud.google.com/apis/library/calendar-json.googleapis.com` |
| Tasks API | `console.cloud.google.com/apis/library/tasks.googleapis.com` |
| Drive API | `console.cloud.google.com/apis/library/drive.googleapis.com` |
| Gmail API | `console.cloud.google.com/apis/library/gmail.googleapis.com` |

Click **Enable** on each API page.

- [ ] Required APIs enabled

---

## Step 3 — Configure OAuth Consent Screen

**APIs & Services → OAuth consent screen**

1. User type: **External** (for most apps; Internal = G Suite orgs only)
2. Fill in:
   - App name
   - User support email
   - Developer contact email
3. **Scopes:** Add the minimum scopes your app uses (matches `GOOGLE_SCOPES` in your app)
4. **Test users:** Add the Google accounts that will test the app
   - While in **Testing** mode, only these accounts can authorize
   - Maximum **100 test users** in Testing mode
   - For production use, submit for verification (required once you exceed 100 users)
5. Click **Save and Continue** through all steps

- [ ] OAuth consent screen configured
- [ ] Test users added

---

## Step 4 — Create the OAuth 2.0 Client ID

**APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**

1. **Application type: Web application** ← this is the correct type
2. Name: `My App (Web)`
3. **Authorized JavaScript origins** — add BOTH:
   ```
   https://your-deployed-domain.com
   http://localhost:5173
   ```
4. ⛔ **Do NOT add Authorized redirect URIs** — the token model does not use them.
   Adding redirect URIs here is for the authorization code flow (which requires a server).
   Leave the redirect URIs field empty.
5. Click **Create**
6. Copy the **Client ID** (ends in `.apps.googleusercontent.com`)

- [ ] Client ID created — type: Web Application
- [ ] JavaScript Origins set: production domain + localhost dev URL
- [ ] ⛔ Redirect URIs field left EMPTY

---

## Step 5 — Add Client ID to your app

The Client ID is **not a secret** — it is safe to embed in client-side code.

```typescript
// src/constants.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
```

Set the environment variable (Replit Secret or `.env.local`):
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

- [ ] `VITE_GOOGLE_CLIENT_ID` set in environment
- [ ] `GOOGLE_CLIENT_ID` constant defined in app

---

## Step 6 — Add GIS script to index.html

```html
<head>
  <!-- Google Identity Services — load before your app bundle -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
```

- [ ] GIS CDN script in `index.html`

---

## Rate limits reference

| API | Free daily quota |
|---|---|
| Calendar API | 1,000,000 requests/day |
| Tasks API | 50,000 requests/day |
| Drive API | 1,000,000,000 bytes downloaded/day |
| Gmail API | 1,000,000,000 quota units/day |

All limits are per Google Cloud project. For personal apps, these quotas are effectively unlimited.

---

## Verification checklist (run before testing)

```bash
node .agents/skills/okhp3-google-gis-client-auth/scripts/check-gis-setup.cjs
```

All items should show ✓ before you test authentication in the browser.

---

## Troubleshooting quick reference

| Error | Cause | Fix |
|---|---|---|
| `popup_closed_by_user` | User dismissed popup | No action needed — user cancelled |
| `access_denied` | User not in test users list | Add their Google account in OAuth consent screen |
| `idpiframe_initialization_failed` | GIS script not loaded | Check `index.html` script tag; check browser extensions blocking it |
| `invalid_client` | Client ID wrong or domain not in Origins | Verify Client ID and JavaScript Origins in GCP Console |
| `origin_mismatch` | App running on unlisted origin | Add the current domain to JavaScript Origins; changes take a few minutes |
| Token silently expires | No expiry check | Implement `isTokenValid()` with the 2-minute buffer (see SKILL.md) |

---

*Part of [okhp3-google-gis-client-auth](https://github.com/OKHP3/skillz) · [OverKill Hill P³](https://overkillhill.com)*
