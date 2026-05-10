/**
 * Pricing configuration for JourneyFix.ch (aligned with Nexilon Website-Analyse ladder)
 * - FREE: CHF 0 (Schnell-Check)
 * - BASIC (Aktionsbericht): default CHF 99
 * - ADVANCED (Professioneller Bericht): default CHF 199
 * Override via env: BASIC_PRICE_CHF / ADVANCED_PRICE_CHF (+ NEXT_PUBLIC_* for client bundle)
 */
const BASIC_CHF = parseInt(process.env.BASIC_PRICE_CHF || "99", 10);
const ADVANCED_CHF = parseInt(process.env.ADVANCED_PRICE_CHF || "199", 10);
const MODULE_BC_CHF = parseInt(process.env.MODULE_BC_CHF || "299", 10);

export const TIER_PRICES = {
  FREE: 0,
  BASIC: BASIC_CHF,
  ADVANCED: ADVANCED_CHF,
} as const;

export function getBasicPriceChf(): number {
  return BASIC_CHF;
}

export function getAdvancedPriceChf(): number {
  return ADVANCED_CHF;
}

/** Legacy: single premium price (maps to ADVANCED) */
export function getPremiumPriceChf(): number {
  return ADVANCED_CHF;
}

/** Client-side: Basic price */
export function getBasicPriceChfClient(): number {
  return parseInt(process.env.NEXT_PUBLIC_BASIC_PRICE_CHF || "99", 10);
}

/** Client-side: Advanced price */
export function getAdvancedPriceChfClient(): number {
  return parseInt(process.env.NEXT_PUBLIC_ADVANCED_PRICE_CHF || "199", 10);
}

/** Legacy: single premium price for client */
export function getPremiumPriceChfClient(): number {
  return getAdvancedPriceChfClient();
}

export function formatBasicPrice(): string {
  return `CHF ${BASIC_CHF}.–`;
}

export function formatAdvancedPrice(): string {
  return `CHF ${ADVANCED_CHF}.–`;
}

/** Add-on Modul B / C (default CHF 299, Nexilon mockup) */
export function getModuleAddonPriceChf(): number {
  return MODULE_BC_CHF;
}

export function getModuleAddonPriceChfClient(): number {
  return parseInt(process.env.NEXT_PUBLIC_MODULE_BC_CHF || "299", 10);
}

/** Paketpreise vs. Einzelbuchung (Nexilon HTML) */
export function getBundleL2PlusOneModulePrices(advancedChf: number, moduleChf: number) {
  const was = advancedChf + moduleChf;
  const save = 49;
  return { was, now: was - save, save };
}

export function getBundleL2PlusBothModulesPrices(advancedChf: number, moduleChf: number) {
  const was = advancedChf + moduleChf * 2;
  const save = 98;
  return { was, now: was - save, save };
}
