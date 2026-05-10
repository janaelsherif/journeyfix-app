# JourneyFix.ch – Testing Guide

## Prerequisites

- Node.js 20+
- Anthropic API key (for full AI analysis)
- PostgreSQL (optional, for persistence)

---

## How to Run

### 1. Install dependencies

```bash
cd journeyfix-app
npm install
```

### 2. Install Playwright (for crawler)

```bash
npx playwright install chromium
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
# Required for AI analysis
ANTHROPIC_API_KEY="sk-ant-..."

# Optional – for persistence
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Optional – for email
RESEND_API_KEY="re_..."

# For local dev
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Postgres connection string examples:**
- Local Postgres: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/journeyfix`
- Create DB first: `createdb journeyfix` (or use psql)
- Supabase: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 4. Set up database (optional)

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000** (or 3001/3002 if 3000 is in use)

### 6. Automated E2E tests (Playwright)

Install the browser used by `@playwright/test` (once per machine / after Playwright upgrades):

```bash
npm run playwright:install
```

Run tests (Playwright will start `npm run dev` on port **3000** if nothing is already listening; or set `reuseExistingServer: true` and run `npm run dev` yourself):

```bash
npm run test              # all specs in e2e/
npm run test:payment      # payment page + /api/checkout redirect only
npm run test:e2e:ui       # interactive Playwright UI
```

---

## Test URL for Scan

Use this Swiss dental practice website for testing:

**Primary test URL:**
```
https://www.zahnarzt-zuerich.ch
```

**Alternative test URLs (if primary is slow or blocked):**
- `https://www.dr-gassmann.ch` (Zahnarzt Basel)
- `https://www.zahnarztpraxis-oberentfelden.ch`
- `https://www.google.ch` (quick connectivity test – minimal content)

**Recommended test:** Use `https://www.zahnarzt-zuerich.ch` with:
- Profession: Zahnarzt
- Canton: Zürich
- City: Zürich (optional)

---

## Test Cases

### Test 1: Landing Page

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open http://localhost:3000 | Landing page loads |
| 2 | Click "Prüfung starten" or "Kostenlos testen" | Navigate to /scan |
| 3 | Switch language (Deutsch ↔ English) | All text updates |
| 4 | Click "So funktioniert es" | Scroll to how-it-works section |
| 5 | Check testimonial block | Quote visible |

---

### Test 2: Scan Form – Happy Path

| Step | Action | Expected |
|------|--------|----------|
| 1 | Go to http://localhost:3000/scan | Scan form loads |
| 2 | Enter URL: `https://www.zahnarzt-zuerich.ch` | URL accepted |
| 3 | Select Profession: Zahnarzt | Dropdown works |
| 4 | Select Canton: Zürich | Dropdown works |
| 5 | Enter City: Zürich (optional) | Optional field |
| 6 | Enter Email: test@mailinator.com (optional) | Optional field |
| 7 | Click "Prüfung starten" | Loading state with rotating steps + progress dots |
| 8 | Wait 1–2 minutes | Progress: "Website wird analysiert..." → "Kundenjourney wird geprüft..." → "Copy-Analyse wird erstellt..." |
| 9 | Scan completes | Redirect to /report/[id] or /report |

---

### Test 3: Report Page

| Step | Action | Expected |
|------|--------|----------|
| 1 | After scan completes | Report page loads |
| 2 | Check overall score | Number 0–100 displayed |
| 3 | Check Score chart | Horizontal bar chart visible |
| 4 | Check Top 5 Schwachstellen | 5 issue cards with scores |
| 5 | Scroll to Status-Shift Analyse | Markdown content rendered |
| 6 | Scroll to 5-Angle Analyse | Markdown content rendered |
| 7 | Click "PDF herunterladen" | PDF opens in new tab |
| 8 | Check Premium CTA | "Jetzt CHF 197 für Vollbericht" or "Demnächst verfügbar" |

---

### Test 4: Report by ID (with DB)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Copy report URL (e.g. /report/clxxx...) | - |
| 2 | Open in new tab or incognito | Report loads from DB |
| 3 | If email was provided | Check Mailinator for report link |
| 4 | If emailSent=1 in URL | Green success banner: "Bericht wurde an Ihre E-Mail gesendet." |

---

### Test 5: Error Handling

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter invalid URL: `not-a-url` | Form validation or error |
| 2 | Enter non-existent domain: `https://thisdoesnotexist12345.ch` | Error: "Connection failed" or similar |
| 3 | Run 6+ scans in 10 min (same IP) | 6th scan: "Too many requests" (429) |
| 4 | Error shown | Retry hint visible below error |

---

### Test 6: Language Consistency

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set language to Deutsch | All UI in German |
| 2 | Run scan | Report content in Schweizer Hochdeutsch |
| 3 | Switch to English | All UI in English |
| 4 | Run scan | Report content still in German (AI outputs de-CH) |

---

### Test 7: PDF Export (Free Report)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete scan (no DB or sessionStorage report) | Report page loads |
| 2 | Click "PDF herunterladen" | PDF opens in new tab |
| 3 | Check PDF content | Score, top issues, Status-Shift visible |

---

### Test 8: Email Flow (with DB + Resend)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter email in scan form | - |
| 2 | Complete scan | Redirect to report |
| 3 | URL contains ?emailSent=1 | Green banner: "Bericht wurde an Ihre E-Mail gesendet." |
| 4 | Check inbox | Report link email received |

---

### Test 9: Pricing Page

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open http://localhost:3000/pricing | Swiss-German pricing page loads |
| 2 | Check three tiers | Schnell-Check (Free), Aktionsplan (CHF 120), Strategische Analyse (CHF 450) |
| 3 | Check delivery times | Free: Sofort; Basic: 24–48 Std.; Advanced: 5 Tage |
| 4 | Click "Kostenlose Analyse anfordern" | Navigate to /scan |
| 5 | Click "Preise" in header (home) | Navigate to /pricing |

---

### Test 10: Report Tiers (FREE vs BASIC vs ADVANCED)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete scan (FREE tier) | Report loads |
| 2 | Check FREE report | Score, Top 5 (headings + severity only), no chart, no Status-Shift/Five-Angle/Critique |
| 3 | Check PDF export (FREE) | PDF has Top 5 with severity only, no recommendations |
| 4 | Check upgrade CTA | Two buttons: "Aktionsplan – CHF 120" and "Strategische Analyse – CHF 450" |

---

### Test 11: 1 Report per URL per User (with DB)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run scan for URL X with email A | Scan completes, report created |
| 2 | Run scan again for same URL X with same email A (same IP) | Same report returned immediately (no new scan) |
| 3 | Run scan for URL X with different email B | New scan runs (different user) |
| 4 | Run scan for URL Y with email A | New scan runs (different URL) |

---

### Test 12: Payment page (checkout UI only; Stripe later)

| Step | Action | Expected |
|------|--------|----------|
| 1 | On FREE report, click Basic or Advanced CTA | Opens `/payment` with scanId + tier |
| 2 | Page shows “coming soon” copy and selected tier | No redirect to Stripe |
| 3 | “Zurück zum Bericht” / “Back to report” | Returns to `/report/[id]` |
| 4 | `GET /api/checkout?scanId=…&tier=…` | Redirects to same `/payment` URL (legacy link support) |

_When Stripe is integrated: retest success/cancel URLs, webhooks, and tier unlock._

---

## URLs Reference

| Page | URL |
|------|-----|
| Landing | http://localhost:3000 |
| Scan form | http://localhost:3000/scan |
| Report (sessionStorage) | http://localhost:3000/report |
| Report by ID | http://localhost:3000/report/[scanId] |
| Pricing | http://localhost:3000/pricing |
| Checkout (page) | http://localhost:3000/payment?scanId=[scanId]&tier=BASIC |
| Checkout (page) | http://localhost:3000/payment?scanId=[scanId]&tier=ADVANCED |
| Checkout (API, redirects to page) | http://localhost:3000/api/checkout?scanId=[scanId]&tier=BASIC |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/scan | Run website scan |
| GET | /api/report/[id] | Fetch report by ID |
| POST | /api/pdf | Generate PDF from scan data (free report) |
| GET | /api/checkout?scanId=xxx | Redirects to `/payment` (Stripe not active yet) |
| POST | /api/webhooks/stripe | Stripe webhook (production, when checkout is wired) |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **`__webpack_modules__[moduleId] is not a function`** / missing chunk (e.g. `205.js`) | Kill **all** Next dev processes. Run **`npm run clean`** then **`npm run dev`**. Prefer **`npm run dev:clean`** once. Only **one** dev server per project folder; don’t run `next dev` twice. |
| Blank home page (header only) | Fixed in app (no invisible Framer placeholders). If it returns: `npm run clean` + restart dev. |
| 404 on root | Restart dev server, clear .next, run `npm run build` |
| "Database not configured" | Set DATABASE_URL in .env, run `npx prisma db push` |
| "Scan failed" / timeout | Check ANTHROPIC_API_KEY, try smaller site |
| "Connection refused" | Ensure dev server is running (`npm run dev`) |
| Playwright errors | Run `npx playwright install chromium` |
| Port 3000 in use | App will try 3001, 3002; check terminal for actual URL |
| SWC error | .babelrc fallback is configured; should work |

---

## E2E Tests (Playwright)

Automated E2E tests cover landing, scan form, and report pages:

```bash
# Run all E2E tests (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

Tests mock the scan API to avoid real API calls and 2-minute waits. Install Chromium if needed: `npx playwright install chromium`.

---

## When to Test

Run through Tests 1–4 first. If all pass, the core flow works.  
Then test PDF (Test 7) and Email (Test 8).  
Stripe (Test 9) is handled by Muttahar.
 ter