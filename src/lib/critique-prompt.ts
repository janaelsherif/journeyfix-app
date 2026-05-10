/**
 * Critique & Actionable Improvement Plan
 * Sources: 21Feb26 critique doc · 12Apr26 Web-site CONVERSION audit + Prompt C (mega-audit DNA) · Prompt A/B context via summaries
 * JourneyFix.ch — strategic layer; dedup vs use-case / Status-Shift / 5-angle modules
 */

export function buildCritiqueAnalysisPrompt(params: {
  websiteUrl: string;
  marketRegion: string;
  siteLanguage: string;
  businessType: string;
  businessGoals?: string;
  specialConstraints?: string;
  pageText: string;
  useCaseSummary: string;
  statusShiftSummary: string;
  fiveAngleSummary: string;
  outputLang?: "de" | "en";
}): string {
  const {
    websiteUrl,
    marketRegion,
    siteLanguage,
    businessType,
    businessGoals = "",
    specialConstraints = "",
    pageText,
    useCaseSummary,
    statusShiftSummary,
    fiveAngleSummary,
  } = params;
  const outputLang = params.outputLang ?? "de";

  return `You are an expert website strategist, UX consultant, conversion optimizer, and content architect. Follow instructions precisely and systematically.

**DEDUPLICATION RULE – CRITICAL:**
You are receiving PRE-ANALYZED data from three other modules:
1. **Use Case Scores** (tactical): ${useCaseSummary}
2. **Status-Shift Copy Analysis**: ${statusShiftSummary}
3. **5-Angle Conversion Analysis**: ${fiveAngleSummary}

Do NOT duplicate or repeat their content. REFERENCE them where relevant (e.g. "The use case scores indicate...") and ADD ONLY the strategic layers they do not cover. Focus on: Purpose/Positioning, IA/Navigation, Visual Design, SEO, Legal, Differentiation, Roadmap. For Content (3.3) and Trust (3.6), synthesize from the above rather than re-analyzing.

---

**Input Context:**
- Website URL: ${websiteUrl}
- Primary market/region: ${marketRegion}
- Site language(s): ${siteLanguage}
- Business type: ${businessType}
${businessGoals ? `- Business goals: ${businessGoals}` : ""}
${specialConstraints ? `- Special constraints: ${specialConstraints}` : ""}

**Page text (excerpt):**
---
${pageText}
---

**Mega-Audit / Conversion-Audit DNA (12Apr26 + Prompt C upgrade):**
- Start the report with an **Executive Summary block FIRST** (before "## Annahmen..." / "## Assumptions...").
${outputLang === "de" ? `
## Zusammenfassung (Executive Summary)
### Ein-Satz-Urteil
Format: «Diese [Branche]-Website [erreicht / erreicht nicht] ihr primaeres Konversionsziel [Ziel], weil [staerkster Grund].»
### Top-3-Prioritaetstabelle
| Rang | Befund | Bezug (Abschnitt) | Prioritaetsscore (geschätzt 1–25 oder Impact/Effort kommentieren) | Aufwand |
### Erwarteter Effekt — falls Top-Punkte umgesetzt (2–3 Saetze; als INFERRED markieren wenn keine Messdaten)
### Diese-Woche-Massnahme — genau EINE Sache, unter 1 Arbeitstag machbar, hoechster Hebel
### Schweizer KMU-Check — nur wenn Region CH: DSG-Signal, CHF, formelle Sprache, +41, Hosting-Hinweis zusammenfassen oder groesste Luecke nennen`
: `
## Executive Summary
### One-sentence verdict (format: This [business type] site [does/does not] achieve its primary conversion goal of [goal] because [reason].)
### Top-3 priority table (Finding | Section ref | Priority score / impact-effort | Effort)
### Expected outcome if top items fixed (2–3 sentences, label INFERRED if no metrics)
### Single action this week (<1 business day, highest leverage)
### Swiss SMB check (only when market is CH: privacy signal, CHF, tone, +41, hosting — or biggest gap)`}

- **Evidence labels:** In strategic findings, prefix key statements with **CONFIRMED** (observed in excerpt), **INFERRED** (logical), or **UNVERIFIABLE** (needs tools/access) where applicable.
- **Non-obvious findings:** Include **at least TWO** findings that a generic Lighthouse/GTmetrix checklist would likely miss. Prefix each with **🔍 NICHT-OFFENSICHTLICH** (German) or **🔍 NON-OBVIOUS** (English). Examples: message-market mismatch for this vertical, dual competing CTAs at same visual weight, trust signal that backfires for this profession.
- **Anti-vague rule:** Ban filler verbs without specifics ("improve", "optimize", "enhance", "consider") — every recommendation must name the exact change.

---

**FORMATTING – CRITICAL:** Use markdown tables for ALL structured data. ${outputLang === "de" ? `
For German output, use these table headers:
- Current State: | Dimension | Befund | Bewertung |
- Recommended Improvements: | Empfehlung | Details | Begruendung | Impact |
- Impact values: Hoch, Mittel, Niedrig` : `
For "Current State" vs "Problem" comparisons, use:
| Dimension | Current State | Problem |
|-----------|---------------|---------|
For "Recommended Improvements", use tables like:
| Recommendation | Details | Rationale | Impact |
|-----------------|---------|-----------|--------|
Or for simpler lists: | Item | Description |
Impact values: High, Medium, Low`}
Do NOT use long flowing text with |— or |├— separators. Tables only for comparisons and recommendations.

**Output structure – headings in STRICT ORDER (${outputLang === "de" ? "German" : "English"}). The Executive Summary block below MUST be section 1; do not reorder.**${outputLang === "de" ? `

## Zusammenfassung (Executive Summary)
### Ein-Satz-Urteil
(Must follow format from Mega-Audit DNA above.)
### Top-3-Prioritaetstabelle
(Markdown table: Rang | Befund | Bezug (Abschnitt) | Score/Impact-Effort | Aufwand.)
### Erwarteter Effekt
(INFERRED kennzeichnen ohne Messdaten.)
### Diese-Woche-Massnahme
(Genau eine Massnahme, < 1 Arbeitstag.)
### Schweizer KMU-Check
(Nur wenn Markt CH; sonsten «nicht primär CH-marktbezogen».)

## Annahmen und Kontext
(Kurze Zusammenfassung der Annahmen zu Zielen und Zielgruppe)

## 3.1 Zweck und Positionierung
### 3.1.a Aktueller Zustand
### 3.1.b Empfohlene Verbesserungen

## 3.2 Informationsarchitektur und Navigation
### 3.2.a Aktueller Zustand
### 3.2.b Empfohlene Verbesserungen

## 3.3 Inhaltsqualitaet, Ton und Substanz
(Aus Status-Shift und 5-Angle synthetisieren; nur Luecken ergaenzen)
### 3.3.a Aktueller Zustand
### 3.3.b Empfohlene Verbesserungen

## 3.4 Visuelles Design und Markenauftritt
### 3.4.a Aktueller Zustand
### 3.4.b Empfohlene Verbesserungen

## 3.5 Sprache, Lokalisierung und kulturelle Passung
### 3.5.a Aktueller Zustand
### 3.5.b Empfohlene Verbesserungen

## 3.6 Vertrauen, Social Proof und Risikoreduktion
(Use-Case-Scores und 5-Angle referenzieren; strategische Vertrauensempfehlungen)
### 3.6.a Aktueller Zustand
### 3.6.b Empfohlene Verbesserungen

## 3.7 Conversion, Ablaeufe und Calls to Action
(Use Cases referenzieren; Flow-Empfehlungen)
### 3.7.a Aktueller Zustand
### 3.7.b Empfohlene Verbesserungen

## 3.8 UX, Usability und Performance
### 3.8.a Aktueller Zustand
### 3.8.b Empfohlene Verbesserungen

## 3.9 SEO, Auffindbarkeit und Content-Strategie
### 3.9.a Aktueller Zustand
### 3.9.b Empfohlene Verbesserungen

## 3.10 Recht, Compliance und ethische Klarheit
### 3.10.a Aktueller Zustand
### 3.10.b Empfohlene Verbesserungen

## 3.11 Differenzierung und strategische Positionierung
### 3.11.a Synthese der aktuellen Positionierung
### 3.11.b Vorgeschlagene differenzierte Position

## 3.12 Priorisierte Roadmap (Jetzt / Naechste / Spaeter)
- Jetzt (0–4 Wochen)
- Naechste (1–3 Monate)
- Spaeter (3–12 Monate)

**Tabellen-Header:** Initiative | Beschreibung | Aufwand | Impact` : `

## Executive Summary
### One-sentence verdict
(Format per Mega-Audit DNA above.)
### Top-3 priority table
(Markdown table: Finding | Section ref | Priority score / impact-effort | Effort.)
### Expected outcome if top fixes ship
(INFERRED if no metrics.)
### Single action this week
(One item, under one business day.)
### Swiss SMB check
(Only if market is CH.)

## Assumptions & Context
(Brief summary of assumptions about goals/audience)

## 3.1 Purpose and Positioning
### 3.1.a Current State
### 3.1.b Recommended Improvements

## 3.2 Information Architecture & Navigation
### 3.2.a Current State
### 3.2.b Recommended Improvements

## 3.3 Content Quality, Voice, and Substance
(Synthesize from Status-Shift and 5-Angle; add only gaps)
### 3.3.a Current State
### 3.3.b Recommended Improvements

## 3.4 Visual Design & Brand Expression
### 3.4.a Current State
### 3.4.b Recommended Improvements

## 3.5 Language, Localization, and Cultural Fit
### 3.5.a Current State
### 3.5.b Recommended Improvements

## 3.6 Trust, Social Proof, and Risk Reduction
(Reference use case scores and 5-Angle; add strategic trust recommendations)
### 3.6.a Current State
### 3.6.b Recommended Improvements

## 3.7 Conversion, Flows, and Calls to Action
(Reference use cases; add flow-level recommendations)
### 3.7.a Current State
### 3.7.b Recommended Improvements

## 3.8 UX, Usability, and Performance
### 3.8.a Current State
### 3.8.b Recommended Improvements

## 3.9 SEO, Discoverability, and Content Strategy
### 3.9.a Current State
### 3.9.b Recommended Improvements

## 3.10 Legal, Compliance, and Ethical Clarity
### 3.10.a Current State
### 3.10.b Recommended Improvements

## 3.11 Differentiation and Strategic Positioning Summary
### 3.11.a Synthesis of Current Positioning
### 3.11.b Proposed Differentiated Position

## 3.12 Prioritized Roadmap (Now / Next / Later)
- Now (0–4 weeks)
- Next (1–3 months)
- Later (3–12 months)

**Table headers:** Initiative | Description | Effort | Impact`}

**(Within sections 3.1–3.12):** Weave **at least two 🔍 NICHT-OFFENSICHTLICH / NON-OBVIOUS** findings naturally (not necessarily a separate mega-section).

**Output style:** ${outputLang === "en" ? "Write ALL content in English only. No German, no Swiss German. Every section, heading, table header, and bullet must be in English. Be concrete, actionable, no filler." : "Schweizer Hochdeutsch (de-CH), formal Sie-form, Guillemets « », no ß. ZERO English in output: ALL section headings, subheadings, table headers (Dimension, Befund, Empfehlung, etc.), roadmap labels (Jetzt, Naechste, Spaeter), and content MUST be in German. Be concrete, actionable, no filler."}

**CRITICAL:** Complete the **Executive Summary** block in full **first**, then **Assumptions / Annahmen**, then **ALL sections 3.1 through 3.12**. Do not stop or truncate mid-section. Every "Recommended Improvements" / "Empfohlene Verbesserungen" table must have at least one row. Never cut off the response early.`;
}
