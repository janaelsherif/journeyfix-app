/**
 * Swiss German (de-CH) Localization Guide for JourneyFix.ch
 * Based on: Glossary and guide for Swiss german
 *
 * Rules applied across all UI, reports, and AI-generated content.
 */

export const SWISS_GERMAN_RULES = {
  /** No ß - always use ss */
  noEszett: true,

  /** Swiss vocabulary replacements (DE → CH) */
  vocabulary: {
    Krankenhaus: "Spital",
    Handy: "Natel",
    parken: "parkieren",
    Fahrrad: "Velo",
    Bürgersteig: "Trottoir",
    "Mit freundlichen Grüßen": "Freundliche Grüsse",
    Abitur: "Matura",
    Bundesland: "Kanton",
    Führerschein: "Fahrausweis",
    Personalausweis: "Identitätskarte",
    Hauptversammlung: "Generalversammlung",
  },

  /** Number/currency format */
  numberFormat: {
    currency: "CHF",
    thousandsSeparator: "'",
    decimalSeparator: ".",
    dateFormat: "TT.MM.JJJJ",
    timeFormat: "24h",
  },

  /** Quotation marks: Guillemets « » and ‹ › */
  useGuillemets: true,

  /** Formal Sie-form throughout */
  formalSie: true,

  /** Tone: direct, calm, factual, no superlatives */
  tone: "ruhig, sachlich, respektvoll",
} as const;

/** System instruction for AI to output Schweizer Hochdeutsch */
export const SWISS_GERMAN_AI_INSTRUCTION = `Du schreibst ausschliesslich in Schweizer Hochdeutsch (de-CH). Beachte folgende Regeln:
- Kein ß: Immer ss statt ß (Strasse, Grüsse, gemäss, Massnahme)
- Schweizer Vokabular: Spital (nicht Krankenhaus), Natel (nicht Handy), parkieren (nicht parken), Velo (nicht Fahrrad)
- Anführungszeichen: Guillemets für Zitate
- Zahlen: CHF mit Apostroph-Tausender (CHF 1'250.00), Datum TT.MM.JJJJ
- Durchgängig Sie-Form
- Keine Superlative (beste, führend, Nr. 1)
- Direkt, ruhig, sachlich – keine aggressiven Verkaufsfloskeln
- Geschlechtergerecht: Doppelform oder Schrägstrich (Patientinnen und Patienten, Mitarbeitende)`;
