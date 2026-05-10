/**
 * Stripe Checkout session helper — ready for when payment is enabled in the app.
 * Today `/payment` is informational only; wire this back from the API route or server action when integrating.
 */
import Stripe from "stripe";
import { prisma, isDbConfigured } from "@/lib/db";
import { getBasicPriceChf, getAdvancedPriceChf } from "@/lib/pricing";

export type CheckoutFailureCode = "no_stripe" | "no_db" | "no_scan" | "stripe_error" | "no_url";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; code: CheckoutFailureCode; message?: string };

/**
 * Create a Stripe Checkout session for a scan (Basic or Advanced tier).
 */
export async function createCheckoutSessionForScan(options: {
  scanId: string;
  tier: string | null | undefined;
  appBaseUrl: string;
}): Promise<CheckoutResult> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { ok: false, code: "no_stripe", message: "STRIPE_SECRET_KEY is not set." };
  }

  if (!isDbConfigured() || !prisma) {
    return { ok: false, code: "no_db", message: "DATABASE_URL / Prisma is not configured." };
  }

  const stripe = new Stripe(stripeKey);
  const tierNorm = options.tier === "BASIC" ? "BASIC" : "ADVANCED";

  const scan = await prisma.scan.findUnique({
    where: { id: options.scanId },
  });

  if (!scan) {
    return { ok: false, code: "no_scan", message: "This report was not found (invalid or expired scan id)." };
  }

  const isBasic = tierNorm === "BASIC";
  const amountChf = isBasic ? getBasicPriceChf() : getAdvancedPriceChf();
  const productName = isBasic ? "JourneyFix Aktionsbericht" : "JourneyFix Professioneller Bericht";
  const productDesc = isBasic
    ? `Aktionsbericht (Stufe 1) mit Fix-Empfehlungen für ${scan.websiteUrl}`
    : `Professioneller Bericht (Stufe 2) inkl. strategischer Analyse für ${scan.websiteUrl}`;

  const base = options.appBaseUrl.replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: productName,
              description: productDesc,
              images: [],
            },
            unit_amount: amountChf * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/report/${options.scanId}?payment=success`,
      cancel_url: `${base}/report/${options.scanId}?payment=cancelled`,
      metadata: {
        scanId: options.scanId,
        tier: isBasic ? "BASIC" : "ADVANCED",
      },
    });

    if (!session.url) {
      return { ok: false, code: "no_url", message: "Stripe did not return a checkout URL." };
    }

    return { ok: true, url: session.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown Stripe error";
    console.error("[checkout]", e);
    return { ok: false, code: "stripe_error", message: msg };
  }
}

export function checkoutFailureExplanation(code: CheckoutFailureCode): { title: string; body: string } {
  switch (code) {
    case "no_stripe":
      return {
        title: "Zahlung nicht eingerichtet",
        body: "Auf diesem Server fehlt der Stripe-Schlüssel (STRIPE_SECRET_KEY). Bitte Konfiguration prüfen oder Support kontaktieren.",
      };
    case "no_db":
      return {
        title: "Datenbank nicht erreichbar",
        body: "Die App hat keine Datenbankverbindung (DATABASE_URL). Ohne Datenbank kann die Zahlung keinem Bericht zugeordnet werden.",
      };
    case "no_scan":
      return {
        title: "Bericht nicht gefunden",
        body: "Diese Scan-ID ist ungültig oder nicht mehr gespeichert. Starten Sie eine neue Prüfung unter «Analyse».",
      };
    case "stripe_error":
      return {
        title: "Stripe-Fehler",
        body: "Der Zahlungsdienst hat einen Fehler gemeldet. Bitte später erneut versuchen oder andere Zahlungsart prüfen.",
      };
    case "no_url":
      return {
        title: "Checkout nicht verfügbar",
        body: "Stripe hat keine gültige Checkout-Adresse zurückgegeben. Bitte Support informieren.",
      };
    default:
      return {
        title: "Zahlung nicht möglich",
        body: "Ein unbekannter Fehler ist aufgetreten.",
      };
  }
}
