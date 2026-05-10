# Nexilon / JourneyFix assets

References from product mockups and strategy docs (HTML in Downloads / internal briefs):

- **Pricing page**: `/pricing` keeps the **Nexilon ladder content** (Stufen 0–2, Module B & C, Pakete, 6-Spalten-Vergleich) but uses the **same JourneyFix shell** as Home/Scan (slate/white header with Beta, `bg-gradient-to-b from-slate-50 to-white`, slate-900 CTAs, no Instrument Serif / no purple-orange-gold Nexilon theme).
- **Teal accent**: `#01696f` used on pricing/UI accents where aligned with Nexilon.
- **Marketing capture (email widget + report gate)**:
  - **`EmailCaptureWidget`** + **`CommunitySubscribe`** (home): Nexilon-style consent + **`POST /api/subscribe`** with per-page **`source`** (see **`src/lib/subscribe-sources.ts`**).
  - **Surfaces**: `/pricing`, `/scan` (below form), `/payment-soon`, `/coming-soon`, **`/report`** & **`/report/[id]`** (footer widget), PraxisTrust `/praxis-trust/pricing`, **`/praxis-trust/check`** (waitlist → API).
  - **`MarketingOptInModal`**: timed **`<dialog>`** on FREE **`/report/[id]`** — lead capture + optional marketing; **`journeyfix_report_email_gate`**. Scan prefills **`jf_newsletter_email_hint`**.
  - Env: **`BREVO_API_KEY`**, **`BREVO_LIST_IDS`** (comma) — lists used only when **`marketingConsent: true`**.
- **`.docx` prompt packs** (conversion audit, “Three Upgraded Master Prompts”, JourneyFix prompts v2): not ingested automatically — paste/copy into **`src/lib/prompts.ts`**, **`critique-prompt.ts`**, or related AI config when updating copy.
