# JourneyFix.ch

AI-powered website customer journey auditing for Swiss professional services (dentists, lawyers, vets, tax advisors, physiotherapists, etc.).

## Features

- **Website Crawling**: Playwright-based crawler extracts text, contact info, structure
- **Use Case Evaluation**: 17+ customer journey scenarios (phone visibility, online booking, trust signals, etc.)
- **Status-Shift Copy Analysis**: Transforms copy into identity-aligned, Swiss-appropriate messaging
- **5-Angle Conversion Analysis**: Social proof, objection handling, journey clarity, service structure, local anchoring
- **Free Report**: Top 5 weak links with brief remedies, score chart, PDF export
- **Email Delivery**: Optional report delivery via Resend (when DB configured)
- **Premium Report** (coming): Full analysis, detailed remedies, PDF download

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (score visualization)
- Playwright (crawling, PDF generation)
- Anthropic Claude (AI analysis)
- Prisma (database schema - optional)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run setup** (creates .env if needed, installs Playwright Chromium)
   ```bash
   npm run setup
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   - `ANTHROPIC_API_KEY` – AI analysis (required for full analysis)
   - `DATABASE_URL` – PostgreSQL (Supabase). Without it, reports use sessionStorage only
   - `RESEND_API_KEY` – Email delivery (optional)
   - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` – Payments (optional, handled by Muttahar)
   - `NEXT_PUBLIC_APP_URL` – Base URL for links (e.g. `http://localhost:3000`)

4. **Database** (optional)
   ```bash
   npm run db:setup
   ```
   Or manually:
   ```bash
   npx prisma generate
   createdb journeyfix
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   If you see `EMFILE: too many open files`, run `ulimit -n 10240` first (macOS).

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Go to **/scan**
2. Enter website URL, profession, canton
3. Click "Prüfung starten"
4. Wait 1–2 minutes for the analysis
5. View the report with:
   - Overall score
   - Score chart (horizontal bar)
   - Top 5 weak links with remedies
   - Status-Shift copy analysis
   - 5-Angle conversion analysis
   - PDF export (free report)

## Project Structure

```
src/
  app/
    page.tsx          # Landing page
    scan/page.tsx     # Scan form
    report/page.tsx   # Report viewer (sessionStorage)
    report/[id]/     # Report by ID (from DB)
    api/
      scan/route.ts   # Scan API
      report/[id]/    # Fetch report by ID
      pdf/route.ts    # PDF export (free report)
      checkout/      # Stripe (Muttahar)
      webhooks/stripe # Stripe webhook (Muttahar)
  components/
    ReportView.tsx   # Shared report layout + charts
  lib/
    crawler.ts       # Playwright crawler
    ai-evaluator.ts  # Claude integration
    prompts.ts       # AI prompt templates
    constants.ts     # Professions, cantons, use cases
```

## Deployment

- **Vercel**: Connect repo, set env vars, deploy. Add `playwright` to `serverComponentsExternalPackages` (already in config).
- **Database**: Use Supabase or Railway for PostgreSQL.
- **Cron/Edge**: Not required; API routes handle everything.

## Based On

- 1st MASTER PROMPT: Status-Shift framing for webpage copy
- 2nd MASTER PROMPT: 5-Angle engagement & conversion enhancer
- NEXT apps: Customer Journey Weak Link Analyzer spec
