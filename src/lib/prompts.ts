/**
 * AI Prompt templates for JourneyFix.ch
 * Sources: 12Apr26 Web site CONVERSION audit prompt, 29Apr26 Three_Upgraded_Master_Prompts_v2,
 *          29Apr26 JourneyFix_Upgraded_Prompts_v2 (integrated into live scan pipeline).
 */

import { SWISS_GERMAN_AI_INSTRUCTION } from "./swiss-german-guide";
import { PROFESSION_CATEGORIES } from "./constants";
import { getSwissProfessionExpectationsBlock } from "./swiss-profession-expectations";

const SWISS_LANG_NOTE = "CRITICAL – Write ALL output in Schweizer Hochdeutsch (de-CH): No ß (use ss), Swiss vocabulary (Spital, Natel, parkieren, Velo), Guillemets « » for quotes, formal Sie-form, no superlatives.";
const ENGLISH_LANG_NOTE = "CRITICAL – Write ALL output in clear, professional English. Be concise and actionable.";

function professionDisplayLabel(code: string, lang: "de" | "en"): string {
  const row = PROFESSION_CATEGORIES.find((c) => c.value === code);
  if (!row) return code;
  return lang === "en" ? row.labelEn : row.label;
}

function getStatusShiftLangNote(lang: "de" | "en") {
  return lang === "en" ? ENGLISH_LANG_NOTE : `${SWISS_LANG_NOTE}\nFull rules: ${SWISS_GERMAN_AI_INSTRUCTION}`;
}

const STRUCTURE_NOTE_DE =
  "Struktur gemäss Nexilon/JourneyFix «Three Upgraded Master Prompts» Prompt A — für Live-Output auf Deutsch.";
const STRUCTURE_NOTE_EN =
  "Structure follows Nexilon/JourneyFix «Three Upgraded Master Prompts» Prompt A — English output.";
export function getStatusShiftSystemPrompt(lang: "de" | "en") {
  return `You are an expert Swiss professional-services copy strategist (Nexilon/JourneyFix harness v2). Practices: dentists, doctors, physiotherapists, psychologists, lawyers, tax advisors, accountants (~1–20 employees). Transform website copy toward status-shift, identity-aligned messaging — calm, precise, trustworthy, non-hype.

${getStatusShiftLangNote(lang)}

Hard constraints:
- NEVER invent credentials, locations, or services not in the source text.
- NEVER shame the owner — critique copy/structure only.
- Every gap claim in diagnostics must cite a quoted phrase OR be labeled «Abgeleitet — nicht woertlich im Text».

Principles:
- Identity > Features | Status gap (offline expertise vs online impression) | Loss aversion first (professional framing) | Swiss cultural fit`;
}

export function getFiveAngleSystemPrompt(lang: "de" | "en") {
  const langNote = lang === "en" ? ENGLISH_LANG_NOTE : SWISS_LANG_NOTE;
  return `You are a senior conversion copy strategist (Nexilon/JourneyFix harness v2) for Swiss-German professional services. Analyze along five angles: contextual social proof, micro-objections, journey clarity, service prioritization, subtle local anchoring.

${langNote}

Hard constraints:
- NEVER invent degrees, testimonials, or outcomes not evidenced in text.
- In each angle, separate what IS present (quote fragments) vs what is ABSENT — never claim absence without verifying against the input.
- FAQ-style suggestions: calm, factual, Swiss-appropriate — no urgency/scarcity hacks.
`;
}

export function buildUseCaseEvaluationPrompt(
  useCaseName: string,
  professionCode: string,
  canton: string,
  crawledData: string,
  lang: "de" | "en" = "de"
): string {
  const professionLabel = professionDisplayLabel(professionCode, lang);
  const langNote =
    lang === "en"
      ? "CRITICAL – All narrative fields (evidence, brief_remedy, detailed_remedy, friction_points) MUST be clear professional English."
      : "CRITICAL – Alle Textfelder (evidence, brief_remedy, detailed_remedy, friction_points) sind Schweizer Hochdeutsch (de-CH): kein ß (ss), Guillemets « », Sie-Form, keine Superlative.";

  const preamble =
    lang === "en"
      ? `You are a SENIOR UX/CX strategist evaluating Swiss professional-practice websites for JourneyFix.ch.
End readers: Swiss SME owners — low jargon, zero hype, evidence-first.

EVALUATION DISCIPLINE (execute mentally before JSON):
1) Evidence inventory: what crawl data CONFIRMS present / CONFIRMS absent / UNCLEAR for this use case only.
2) Friction vs gap: friction = poorly implemented element; gap = missing element.
3) Severity & score from evidence weight — never invent page elements not in crawl JSON.
4) Compare briefly to typical ${professionLabel} expectations in ${canton} (state your baseline explicitly).
5) Remedies: realistic for a Swiss SME (time/cost bands, prefer Swiss-hosted tools when suggesting tech).
If you misread crawl data: state "Backtracking:" in "evidence", correct, then output JSON.

ANTI-HALLUCINATION: If crawl data does not show an element, write "The crawl data does not confirm whether …" — do not imply it exists.`
      : `Sie sind SENIOR UX/CX-STRATEGE fuer JourneyFix.ch und bewerten Schweizer Praxis-Websites.
Leser: Schweizer KMU-Inhaber — wenig Jargon, kein Marketing-Hype, evidenzbasiert.

BEWERTUNGSDISZIPLIN (mental, vor dem JSON):
1) Evidenz-Inventar: was bestätigt vorhanden / bestätigt fehlend / unklar — nur fuer diesen Use Case.
2) Reibung vs. Luecke: Reibung = schlecht umgesetzt; Luecke = fehlt komplett.
3) Schwere & Score aus Evidenz — keine erfundenen Seitenelemente ausserhalb der Crawl-Daten.
4) Kurzer Vergleich mit typischen Erwartungen fuer ${professionLabel} in ${canton} (Referenz explizit nennen).
5) Massnahmen: realistisch fuer Schweizer KMU (Zeit/CHF-Rahmen; bei Technik Schweizer Hosting bevorzugen).
Bei Fehllesen: in "evidence" mit «Backtracking:» kennzeichnen und korrigieren.

ANTI-HALLUZINATION: Steht etwas nicht in den Crawl-Daten, explizit formulieren («Die Crawl-Daten bestätigen nicht, ob …»).`;

  const expectations = getSwissProfessionExpectationsBlock(professionCode, lang);

  return `${preamble}

${expectations}

${langNote}

Use case label: ${useCaseName}
Profession (branch): ${professionLabel} (code ${professionCode})
Canton: ${canton}
Scope: ONLY this journey use case — no IA/design/SEO strategy here.

Website crawl excerpt (truncated structured data):
${crawledData}

SELF-CHECK BEFORE JSON:
- Every friction point traceable to the crawl excerpt OR marked as assumption if crawl sparse.
- "evidence" must start with CONFIRMED: or INFERRED: or UNVERIFIABLE: (English) resp. BESTÄTIGT: / ABGELEITET: / NICHT_PRÜFBAR: (German).

OUTPUT: ONLY one valid JSON object. No markdown fences, no prose around it.
Fields:
{
  "completion_possible": boolean,
  "time_to_complete_seconds": number,
  "click_depth": number,
  "friction_points": ["specific bullets tied to crawl where possible"],
  "severity": "critical|high|medium|low",
  "conversion_impact": "high|medium|low",
  "score": number,
  "evidence": "CONFIRMED|INFERRED|UNVERIFIABLE/BESTÄTIGT|ABGELEITET|NICHT_PRÜFBAR + concise findings",
  "brief_remedy": "2 sentences — highest-impact fix only",
  "detailed_remedy": "Numbered steps, rough hours/CHF for Swiss SME reality, Swiss data-residency note if tools mentioned"
}`;
}

export function buildStatusShiftAnalysisPrompt(
  pageText: string,
  practiceType?: string,
  region?: string,
  pageType?: string,
  lang: "de" | "en" = "de"
): string {
  const langNote =
    lang === "en"
      ? "LANGUAGE: Write ALL output in English only."
      : "CRITICAL – Write ALL output in Schweizer Hochdeutsch (de-CH): No ß (use ss), Swiss vocabulary, Guillemets « », formal Sie-form, no superlatives.";

  const structureDe = `
INTERNAL REASONING (do not print): evidence inventory → status gaps with quotes → gaps/missing messaging → rewrite checks.

OUTPUT — use exactly these headings and sub-headings:

## 1. Quick Snapshot (3–5 bullets)
Konkret: Positionierung, Vertrauen, CTA-Klarheit, CH-Angemessenheit.

## 2. Status & Identity Analysis (200–350 Woerter; Aussagen mit Textzitat oder «Abgeleitet» markieren)
### 2.1 Gewolltes Selbstbild aus dem Text
### 2.2 Welches Statussignal sendet die Seite jetzt?
### 2.3 Wo klafft Identitäts-/Statusluecke? (Belege zitieren)
### 2.4 Umgang mit Risiko/Nutzen (Loss vs Gain)

## 3. Messaging Gaps & Issues
DIFFERENTIATOR: §2 = Diagnose («was der Text sagt»), §3 = Lücken («was er nicht liefert») — keine doppelten Bulletpoints.
### 3.1 Positionierung & Klarheit
### 3.2 Status & Glaubwürdigkeit
### 3.3 Emotional & Identity
### 3.4 Call-to-Action & Flow
Mindestens 2 Bulletpoints je Unterabschnitt, mit konkretem Bezug zur Seite.

## 4. Improved Positioning & Core Narrative
### 4.1 Zielidentität nach Verbesserung
### 4.2 One-Sentence Value Proposition (max. 25 Wörter)
### 4.3 Status-Shift-Promise (3–5 Vorher/Nachher-Bullet-Paare)
### 4.4 Loss-framed Insight (ruhig, ohne Panikmache)

## 5. Rewritten Page Copy (Status-Shift Version)
H1, Subheadline, 2–4 kurze Abschnitte, mindestens ein klarer CTA. Vor Abgabe prüfen: H1 = Outcome/Identität, nicht nur Fachbegriff; CTA ohne Druck; keine erfundenen Fakten.

## 6. Implementation Notes & ToDos
### 6.1 Content-ToDos
### 6.2 Design/UX-ToDos (nur aus Text ableitbar)
### 6.3 SEO & Struktur (H1/H2, Laenge, lokale Bezuege)`;

  const structureEn = `
INTERNAL REASONING (do not print): evidence inventory → quoted gaps → messaging holes → verification before rewrite.

OUTPUT — use exactly these headings:

## 1. Quick Snapshot (3–5 bullets)
## 2. Status & Identity Analysis
### 2.1 Intended self-image from copy
### 2.2 Status signal today
### 2.3 Identity/status gaps (cite phrases)
### 2.4 Risk/benefit framing

## 3. Messaging Gaps & Issues
§2 = what copy communicates; §3 = what’s missing — no duplicate bullets across sections.
### 3.1 Positioning & Clarity
### 3.2 Status & Credibility
### 3.3 Emotional & Identity
### 3.4 CTA & Flow

## 4. Improved Positioning & Core Narrative
### 4.1 Target identity
### 4.2 One-sentence value proposition (max 25 words)
### 4.3 Status-shift promises (before/after bullet pairs)
### 4.4 Loss-framed insight (professional tone)

## 5. Rewritten Page Copy (Status-Shift Version)

## 6. Implementation Notes & ToDos
### 6.1 Content
### 6.2 Design/UX (infer from text only)
### 6.3 SEO & structure`;

  return `${lang === "de" ? STRUCTURE_NOTE_DE : STRUCTURE_NOTE_EN}

Analyze this Swiss professional-practice website text (Status-Shift harness v2 / Prompt A lineage).

${langNote}

SCOPE: Copy & messaging only — no navigation audit, IA, roadmap (separate critique module).

${practiceType ? `Practice type: ${practiceType}` : ""}
${region ? `Region: ${region}` : ""}
${pageType ? `Page type: ${pageType}` : ""}

Page text:
---
${pageText}
---

${lang === "de" ? structureDe : structureEn}

CRITICAL: Complete EVERY section and subsection. End with §6. No premature stop.`;
}

export function buildFiveAngleAnalysisPrompt(
  pageText: string,
  practiceType?: string,
  region?: string,
  pageType?: string,
  lang: "de" | "en" = "de"
): string {
  const langNote =
    lang === "en"
      ? "LANGUAGE: English only for all prose and table cells."
      : "SPRACHE: Schweizer Hochdeutsch (de-CH), Guillemets « », kein ß.";

  const intro =
    lang === "de"
      ? `5-Winkel-Analyse (Harness v2 / Prompt B). Vor dem Schreiben mental: Evidenz-Inventar je Winkel (vorhanden vs fehlend im Text) → zwei Prioritätswinkel fuer Abschnitt 7 markieren.
Schweizer Filter: ruhig, konkret, keine Kunst-Verknappung; Kostentransparenz & Datenschutz oft Top-Einwaende.`
      : `Five-angle analysis (Harness v2 / Prompt B). Mentally: inventory what copy contains vs lacks per angle → pick top 2 angles for Section 7 emphasis.
Swiss filter: calm, factual; cost transparency & privacy often dominate objections.`;

  const skeletonDe = `
## 1. Kurze Seitenuebersicht (3–5 Stichpunkte)

## 2. Winkel 1 — Kontextuelle Social Proof
### 2.1 IST-Zustand — tabellarisch | Element | Status (Vorhanden/Textzitat oder Fehlt im Text) |
### 2.2 Lücken — je Bullet: was fehlt UND warum fuer diese Branche in dieser Region wichtig ist (nicht generisch)
### 2.3 Vorschläge — 3–5 diskrete Testimonial-Beispiele («Outcome in 1–2 Sätzen» — Rolle, Region) + Platzierungshinweise

## 3. Winkel 2 — Mikro-Einwaende / FAQ
### 3.1 Typische Einwaende — interne Monologe der Besucher («Werde ich den Preis kennen?», «Wie steht es um Datenschutz?», …) priorisiert fuer CH
### 3.2 Abdeckung im aktuellen Text — je Einwand: ADRESSIERT / TEILWEISE / NICHT_ADRESSIERT (+ Zitat falls vorhanden)
### 3.3 FAQ-Block — 4–7 Q&A, Antworten 2–4 Sätze, sachlich, keine Floskeln und kein Druck

## 4. Winkel 3 — Journey-Klarheit («So funktioniert es»)
### 4.1 Was der Text bereits sagt — bullets mit «Vorhanden» oder «Fehlt»
### 4.2 Vorgeschlagene 3–5 Schritte — je Schritt nimmt eine konkrete Unsicherheit weg (Zeit, Kanal, Kosten, nächster Schritt)

## 5. Winkel 4 — Leistungs-Priorisierung und Struktur
### 5.1 Wie Leistungen jetzt wirken (Besucherzentriert vs intern?)
### 5.2 3–5 Kategorien nach Besuchersprache — Flagship-Leistungen je Kategorie fett; Visitor-Language-Test erwähnen falls verletzt

## 6. Winkel 5 — Lokale Verankerung
### 6.1 Vorhandene geografische Signale vs Lücken
### 6.2 Neue Headline-/Body-Varianten mit subtilem Ort/Kanton (Vertrauen, nicht Verkauf)

## 7. Konsolidierter Verbesserungsblock (kuratiert — keine Wiederholung schwacher Punkte)
- Eröffnungssatz: welche zwei Winkel haben hier Priorität und warum?
- A) Kurzer «Warum wir»-Absatz integriert Trust + lokale Verankerung (nur belegbare Fakten aus Text)
- B) Beste Testimonials (Auszug)
- C) «So funktioniert es»-Schritte
- D) Leistungsübersicht nach Kategorien + Flagships
- E) Mini-FAQ aus den wichtigsten unbearbeiteten Einwaenden
Nutzen Sie Markdown-Tabellen fuer strukturierte Vergleiche.`;

  const skeletonEn = `
## 1. Brief Page Overview (3–5 bullets)

## 2. Angle 1 — Contextual Social Proof
### 2.1 Current situation — table | Element | Present (quote) or Absent |
### 2.2 Gaps — bullets: missing element + why it matters for THIS profession/region
### 2.3 Suggestions — restrained testimonial samples + placement notes

## 3. Angle 2 — Micro-Objections / FAQ
### 3.1 Likely objections — visitor monologues prioritized for CH professionalism
### 3.2 Coverage — per objection: ADDRESSED / PARTIAL / NOT ADDRESSED (+ quote)
### 3.3 FAQ — 4–7 Q&A, 2–4 sentence factual answers, no hype

## 4. Angle 3 — Journey Clarity ("How it works")
### 4.1 What copy already states (Present vs Absent bullets)
### 4.2 Proposed 3–5 steps removing specific uncertainties

## 5. Angle 4 — Service Prioritization & Structure
### 5.1 Current presentation critique
### 5.2 Visitor-centric categories + flagship services (bold), visitor-language test

## 6. Angle 5 — Subtle Local Anchoring
### 6.1 Signals present vs missing
### 6.2 Improved headline/body variants with subtle geography

## 7. Consolidated Improvement Block (curated)
Opening: name the two priority angles and why.
Then A–E as in German instructions (Why us, testimonials, journey, services, mini-FAQ).
Use markdown tables for comparisons.`;

  return `${intro}

${langNote}

${practiceType ? `Practice type: ${practiceType}` : ""}
${region ? `Region: ${region}` : ""}
${pageType ? `Page type: ${pageType}` : ""}

Page text:
---
${pageText}
---

${lang === "de" ? skeletonDe : skeletonEn}

CRITICAL: Complete ALL 7 sections incl. subsections. Populate every table row. Section 7 must be curated (not a dump of repeats).`;
}
