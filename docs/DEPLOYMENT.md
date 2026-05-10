# JourneyFix — deployment checklist (Muttahar)

End-to-end notes for production deploy: infrastructure, database, email, AI, Playwright crawler, and Stripe. **Payment UI wiring** called out explicitly (see §7).

---

## 1. Repo & build

- Clone: `https://github.com/janaelsherif/journeyfix-app` (or agreed canonical repo).
- Use the branch you shipped (e.g. `main`).
- **Node.js 20+**
- Commands:
  ```bash
  npm install
  npm run build
  ```
  Build must pass before go-live.

---

## 2. Hosting & Playwright (crawler)

The scan flow uses **Playwright** to fetch real pages.

- On the server, install browsers:
  ```bash
  npx playwright install chromium
  ```
- Prefer a environment that can run a **real browser**: **Docker** or **VM/VPS**.
- Plain **serverless-only** deployments often fail or need extra Chromium packaging—confirm crawls work in staging before production.

---

## 3. Environment variables

Copy `.env.example` → production secrets in your host dashboard. Do **not** commit `.env`.

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | **Required** — AI analysis |
| `DATABASE_URL` | **Required** — PostgreSQL; scans, reports, Stripe linkage by `scanId` |
| `NEXT_PUBLIC_APP_URL` | **Required** — e.g. `https://journeyfix.ch` (emails + Stripe redirect URLs) |
| `RESEND_API_KEY` | Recommended — send “your report is ready” email |
| `RESEND_FROM_EMAIL` | Sender for Resend, e.g. `JourneyFix <noreply@yourdomain.com>` |
| `BREVO_API_KEY` | Optional — newsletter / `/api/subscribe` widgets |
| `BREVO_LIST_IDS` | Optional — comma-separated list IDs |
| `NEXT_PUBLIC_BASIC_PRICE_CHF` / `NEXT_PUBLIC_ADVANCED_PRICE_CHF` / `NEXT_PUBLIC_MODULE_BC_CHF` | Display prices (keep aligned with Stripe) |
| `BASIC_PRICE_CHF` / `ADVANCED_PRICE_CHF` / `MODULE_BC_CHF` | Server-side CHF amounts for Checkout |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional analytics |

---

## 4. Database

```bash
npx prisma generate
npx prisma db push
```

(Use migrations instead of `db push` if your team adopts a migration workflow later.)

---

## 5. Timeouts / long requests

Each scan runs **crawl + multiple AI calls** and may take **several minutes**. Configure the reverse proxy / platform for **long timeouts** (e.g. **5–10+ minutes**). The scan API route is configured for up to **300s** where the platform allows it (`maxDuration`).

---

## 6. Stripe (backend & webhook)

1. **Stripe Dashboard** — use **Test** mode first, then **Live**.
2. Set:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (for any client-side Stripe usage)
3. **Webhook**
   - **URL:** `https://<your-domain>/api/webhooks/stripe`
   - **Event:** `checkout.session.completed` (minimum)
   - Paste signing secret → `STRIPE_WEBHOOK_SECRET`
   - Production webhook must use **HTTPS**.

Existing webhook behaviour: on success it records **`Payment`**, updates **`Scan`** (**`isPremium`**, **`reportTier`**, **`scanType`**), optionally runs extended use-case analysis for **Advanced**, and triggers **PDF** generation when configured.

---

## 7. Stripe — Checkout UI (**action required**)

Session creation helper exists (`createCheckoutSessionForScan` in `src/lib/stripe-checkout.ts`). The **`/payment` page currently does not** start Stripe Checkout—it is informational (“coming soon”).

**Someone must:**

- Add a **POST API route** or **server action** that calls `createCheckoutSessionForScan({ scanId, tier, appBaseUrl })`.
- From the UI, redirect the browser to **`url`** returned on success (`session.url`).

Until this is wired, Stripe keys + webhook can be correct but **users cannot complete payment** in the app.

---

## 8. Smoke tests (after deploy)

1. **Free scan** — URL + profession + canton + email → opens **`/report/{id}`** and survives a **hard refresh** (DB OK).
2. **Email** — if Resend configured, inbox receives link with correct `NEXT_PUBLIC_APP_URL`.
3. **Stripe (after §7)** — Test card → success return URL → webhook → DB shows premium/tier and PDF path if PDF runs.

---

## 9. Security

- Never commit secrets; rotate keys if exposed.
- Restrict database and Stripe Dashboard access.

---

## Quick reference: repo docs

- Local setup & DB: [`README.md`](../README.md), [`TESTING.md`](../TESTING.md), [`.env.example`](../.env.example)
