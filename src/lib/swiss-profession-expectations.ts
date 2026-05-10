/**
 * Profession-specific Swiss SMB / professional-service expectations for AI evaluation.
 * Derived from: 29Apr26_JourneyFix_Upgraded_Prompts_v2 (Prompt 3 — Swiss Expectations).
 */

import type { Language } from "@/lib/translations";

const PROFESSION_CODES = [
  "DENTIST",
  "LAWYER",
  "VET",
  "TAX_ADVISOR",
  "PHYSIOTHERAPIST",
  "DOCTOR_GENERAL",
  "PSYCHOLOGIST",
  "ACCOUNTANT",
  "OTHER",
] as const;

export type ProfessionCode = (typeof PROFESSION_CODES)[number];

function isProfessionCode(s: string): s is ProfessionCode {
  return (PROFESSION_CODES as readonly string[]).includes(s);
}

/** Short block injected into use-case evaluation prompts. */
export function getSwissProfessionExpectationsBlock(professionRaw: string, lang: Language): string {
  const p = isProfessionCode(professionRaw) ? professionRaw : "OTHER";

  if (lang === "en") {
    return `SWISS PROFESSION-SPECIFIC CHECKS (use as active scoring criteria — failed checks → friction/gaps):
${BASE_EN}
${SPECIFIC_EN[p]}`;
  }
  return `BRANCHENSPEZIFISCHE SCHWEIZER ERWARTUNGEN (aktive Bewertungskriterien — Verstoss → Reibung/Luecke):
${BASE_DE}
${SPECIFIC_DE[p]}`;
}

const BASE_DE = `Basis (alle Branchen): Formell, kein Marketing-Hype | nFADP/DSG-Hinweise sichtbar | konsistente Kontaktdaten | Vertrauen (Qualifikationen, Verbaende) greifbar | Kerntatigkeiten in wenigen Klicks erreichbar.

`;

const BASE_EN = `Base (all professions): Professional tone, no hype | privacy (GDPR/nFADP) signaled | consistent contact details | trust (credentials, associations) visible | key actions within a few clicks.

`;

const SPECIFIC_DE: Record<ProfessionCode, string> = {
  DENTIST: `Zahnarzt: Online-Terminbuchung zunehmend erwartet (urban); Transparenz bei typischen Leistungen (z. B. Prophylaxe); Notfallhinweis/Erreichbarkeit.`,
  LAWYER: `Anwalt: Fachgebiete explizit; Vertraulichkeit/Berufsgeheimnis; keine Preisangabe ist in CH oft normal — nicht als Schwaeche werten.`,
  VET: `Tierarzt: Notfall/Notdienst klar; Öffnungszeiten inkl. Feiertage; Tierart/Spektrum (Kleintiere vs. alles) eindeutig.`,
  TAX_ADVISOR: `Steuerberatung: Datensicherheit/Tresor/Schweizer Hosting signalisieren; EXPERTsuisse o. ae.; sicherer Dokumentenaustausch; Reaktionszeit in Stosszeiten.`,
  PHYSIOTHERAPIST: `Physiotherapie: Kasse/Verordnung (Physio 1:1) explizit; Online-Buchung in Städten üblich; Spezialisierung (Sport, post-op, pädiatrisch); Barrierefreiheit/Parkplatz.`,
  DOCTOR_GENERAL: `Arztpraxis: Terminwege, Kasse, Bereitschaft/Notfallhinweis je nach Fokus; Vertrauen über Team und Zugang.`,
  PSYCHOLOGIST: `Psychologie: Vertraulichkeit ausdrücklich; kein Druck-CTA; Zugang (Überweisung, Kasse) wenn erkennbar adressieren.`,
  ACCOUNTANT: `Treuhand/Buchhaltung: TREUHAND|SUISSE/EXPERTsuisse sichtbar; Leistungssegmentierung (Buchhaltung vs. Steuer vs. Revision); Zielkunde KMU vs. Privat.`,
  OTHER: `Sonstige Praxis: Kernleistung und Zielkunde in Sekunden erkennbar; Vertrauens- und Kontaktpfade wie oben prüfen.`,
};

const SPECIFIC_EN: Record<ProfessionCode, string> = {
  DENTIST: `Dentistry: online booking increasingly expected (urban); transparency on common treatments; emergency/after-hours signaling.`,
  LAWYER: `Law: practice areas explicit; confidentiality/professional secrecy; missing public pricing is often normal in CH — do not score as weakness.`,
  VET: `Vet: emergency protocol clear; hours incl. holidays; species scope explicit.`,
  TAX_ADVISOR: `Tax: data security & Swiss hosting; association signals; secure document exchange; response-time expectations in peak season.`,
  PHYSIOTHERAPIST: `Physio: insurance/prescription clarity; online booking in urban areas; specialization; accessibility/parking.`,
  DOCTOR_GENERAL: `GP: access paths, coverage, out-of-hours where relevant; trust via team and contact clarity.`,
  PSYCHOLOGIST: `Psychology: confidentiality explicit; soft CTAs; referral/coverage if inferable.`,
  ACCOUNTANT: `Fiduciary: association badges; scope segmentation; SMB vs private client clarity.`,
  OTHER: `Other: core offer & audience clear quickly; trust and contact paths as above.`,
};
