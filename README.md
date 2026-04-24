# WantedForNigeria.com
SPPG Class of 2027 — Admissions Nomination Platform

---

## What This Is

A Next.js web application with four working components:
1. **Nomination Platform** — Two forms (Nominate Someone / Nominate Yourself), submitted directly to Airtable
2. **Shareable Card Generator** — Canvas-based "Wanted" poster card, generated client-side in under 3 seconds
3. **Live Scoreboard** — Pulls nomination + application counts from Airtable in near real time
4. **Share Flow** — WhatsApp, Twitter, Telegram sharing + PNG download

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `AIRTABLE_PAT` | airtable.com → Account → Create personal access token |
| `AIRTABLE_BASE_ID` | Your Airtable base URL: `airtable.com/appXXXXX/...` |

Your PAT needs these **scopes**: `data.records:read`, `data.records:write`
It needs access to your base.

### 3. Verify your Airtable table + field names

The API routes use these exact field names. If yours differ, update `/pages/api/nominate.js` and `/pages/api/nominate-self.js`:

**"Nominate someone" table:**
- `Nominee's Name .`
- `Nominee's email`
- `Nominee's Gender`
- `Nominee's Phone number`
- `Nominator's Name .`
- `Nominator's Phone`
- `Nominator's email`
- `Please indicate if you are:` (multiple select)
- `Charges` (single select)
- `Explain further why you gave the charges`

**"Nominate yourself" table:**
- `Full Name`
- `Email`
- `Gender`
- `Phone number`
- `Charges` (single select)
- `Comment on the Charges`
- `How did you hear about us?` (multiple select)

### 4. Replace the YouTube video ID

In `pages/index.js`, line ~169:
```js
const YOUTUBE_VIDEO_ID = 'REPLACE_WITH_ACTUAL_VIDEO_ID';
```
Replace with the actual YouTube video ID (the part after `?v=` in the URL).

### 5. Run locally
```bash
npm run dev
```
Open `http://localhost:3000`

---

## Deployment: Vercel (Recommended — Free)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. In Vercel project settings → **Environment Variables**, add:
   - `AIRTABLE_PAT` → your PAT value
   - `AIRTABLE_BASE_ID` → your base ID
   - (Table name variables are optional if you use the defaults)
4. Deploy. Vercel auto-deploys on every push to main.
5. Add your custom domain in Vercel → Project → Settings → Domains

Your PAT is **never** exposed to the browser — it only lives in Vercel's server environment.

---

## Deployment: Hostinger (Alternative)

Hostinger supports Node.js hosting. Steps:
1. Build: `npm run build`
2. Upload the `.next/`, `public/`, `pages/`, `styles/`, `node_modules/`, `package.json`, `next.config.js` folders via FTP or File Manager
3. Set environment variables in Hostinger's Node.js config panel
4. Start: `npm start`

Note: Vercel is significantly easier and free for this use case.

---

## Non-Technical Team Tasks

### Updating the scoreboard manually (if Airtable connection has issues)
The scoreboard auto-updates from Airtable every 3 minutes. No code change needed. It reads directly from your tables.

### Seeing nomination data
Log into Airtable. All submissions appear in real time in:
- `Nominate someone` table
- `Nominate yourself` table

Export → CSV anytime for the admissions team.

### Adding/removing charges
Edit the `CHARGES` array in `pages/index.js` (line ~12).

---

## Architecture Notes

- **API routes** (`/pages/api/`) run server-side on Vercel — the Airtable PAT never reaches the browser
- **Scoreboard** uses Vercel CDN caching (`s-maxage=180`) — updates every 3 minutes, instant to load
- **Card generation** is entirely client-side using HTML Canvas API — no server needed, renders in <1 second
- **Email sequences** handled separately via Airtable automations (as agreed)

---

## File Structure

```
wantedfornigeria/
├── pages/
│   ├── index.js          ← Entire frontend (one page)
│   ├── _app.js           ← Global styles loader
│   ├── _document.js      ← Google Fonts, meta
│   └── api/
│       ├── nominate.js         ← POST to "Nominate someone"
│       ├── nominate-self.js    ← POST to "Nominate yourself"
│       └── scoreboard.js       ← GET counts from all 3 tables
├── public/
│   └── sppg-logo.jpg
├── styles/
│   └── globals.css
├── .env.example          ← Template (safe to commit)
├── .env.local            ← Your secrets (NEVER commit)
├── .gitignore
├── next.config.js
└── package.json
```
