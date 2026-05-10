# Pricing & Features Summary

## 1. JourneyFix (Website Weak Links) – Pricing Page

**Source:** `Nexilon Weak points Pricing Page.html`

### Corrected Delivery Times (per your update)
| Tier | Delivery |
|------|----------|
| **Free** | Available immediately to your email |
| **Basic** | Available within 24–48 hrs to your email |
| **Advanced** | Available within 5 days to your email |

### Tier Structure (from HTML)
| Tier | Price | Key Features |
|------|-------|--------------|
| **Schnell-Check (Free)** | CHF 0 | Score 0–100, Top 5 weak points, Benchmark, Comparison table |
| **Aktionsplan (Basic)** | CHF 120 | + Sub-scores, Fix recommendations, Quick-Wins, Insights, DSG compliance |
| **Strategische Analyse (Advanced)** | CHF 450 | + Status-Shift, 5-Angle, 12-section Critique, Roadmap, Budget estimates |

### Report Content by Tier (to implement)
- **Free:** Score, Top 5 (headings + severity only), Benchmark, Comparison table. No recommendations, no Status-Shift, no Conversion.
- **Basic:** Free + Sub-scores, detailed Fix recommendations for Top 5, Quick-Wins, 3–5 insights, DSG compliance hints.
- **Advanced:** Full report (Status-Shift, 5-Angle, Critique, Roadmap, Budget estimates).

---

## 2. PraxisTrust Checker (Industry Compliance Checker) – Features by Tier

**Source:** `praxis_trust_checker_v4_final.md`

### Pricing (from spec)
| Tier | Price | Access |
|------|-------|--------|
| **Freemium** | CHF 0 | Open access; lead capture after results |
| **Basic** | CHF 79 (one-time) | Admin unlock after payment |
| **Advanced** | CHF 199/year | Admin unlock after payment |

### 29 Checkpoints (4 Domains)
- **Domain A – Patient Safety:** 11 checkpoints (PS-01 to PS-11)
- **Domain B – Professional Conduct:** 9 checkpoints (PC-01 to PC-09)
- **Domain C – Business Integrity:** 5 checkpoints (BI-01 to BI-05)
- **Domain D – Advertising & Marketing:** 4 checkpoints (AM-01 to AM-04)

### Freemium Report
- Overall Trust Score (0–100, color-coded)
- 4 domain score cards (PS, PC, BI, AM) with traffic light
- Top 6 findings (severity-first) with 1–2 sentence explanation
- Downloadable 1-page PDF summary
- CTA: "Unlock Full Report"

### Basic Report (Unlocked)
- All 29 checkpoints with PASS / FAIL / MANUAL_REVIEW
- Evidence per checkpoint: page URL + snippet + confidence
- Remediation instructions with German copy-paste text
- Priority ranking 1–29 (severity × effort)
- Effort estimate per fix: "5 Min.", "1 Stunde", "1 Tag", "fortlaufend"
- Resource links (SSO, cantonal directories, templates)
- Downloadable 10–12 page branded PDF
- 1 included rescan
- CSV export
- "Clinic Trust Badge" if score ≥ 80% and no critical fails

### Advanced Report (Unlocked)
- Everything in Basic
- Unlimited rescans + scan scheduling
- Trend dashboard (score over time)
- Side-by-side scan comparison
- Compliance calendar + regulatory alerts
- AI remediation coach
- Canton-aware content hints
- Competitor benchmarking (anonymized)
- Team accounts (up to 3 users)
- White-label PDF reports
- Multi-language site scanning (DE/FR/IT)
- Custom checklist builder

**Note:** PraxisTrust is not yet built in this codebase. The spec exists; implementation would be a separate project.

---

## 3. User Restriction (Both Apps)

**Rule:** Each user (email + unique IP) can run **only one report per URL at one level**

- If they pay, they get the corresponding report for the paid level.  
- Prevents multiple free scans of many URLs.

---

## 4. Next Steps (JourneyFix)

1. Add pricing page `/pricing` with Swiss-German content + corrected delivery times
2. Add subscription tiers: FREE, BASIC, ADVANCED
3. Split report content by tier (screen + PDF)
4. Implement 1 report per URL per user (email + IP)
5. Update database schema for tier tracking
