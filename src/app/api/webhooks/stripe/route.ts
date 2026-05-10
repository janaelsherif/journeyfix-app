import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma, isDbConfigured } from "@/lib/db";
import { USE_CASES } from "@/lib/constants";
import { evaluateUseCase } from "@/lib/ai-evaluator";
import { crawlWebsite } from "@/lib/crawler";
import { generateReportPdf } from "@/lib/pdf";
import { getBasicPriceChf, getAdvancedPriceChf } from "@/lib/pricing";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !stripe || !isDbConfigured() || !prisma) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const scanId = session.metadata?.scanId;
    const tierFromMeta = session.metadata?.tier as string | undefined;
    const fallbackChf =
      tierFromMeta === "BASIC" ? getBasicPriceChf() : getAdvancedPriceChf();
    const amountChf =
      session.amount_total != null
        ? Math.round(session.amount_total / 100)
        : fallbackChf;

    if (!scanId) {
      return NextResponse.json({ error: "No scanId in metadata" }, { status: 400 });
    }

    const reportTier = tierFromMeta === "BASIC" ? "BASIC" : "ADVANCED";
    const scanType = tierFromMeta === "BASIC" ? "PREMIUM_SINGLE" : "PREMIUM_TRIPLE";

    await prisma.payment.create({
      data: {
        scanId,
        stripeSessionId: session.id,
        amountChf,
        status: "succeeded",
      },
    });

    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
    });

    if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        isPremium: true,
        reportTier,
        scanType,
      },
    });

    if (reportTier === "ADVANCED") {
      const crawlResult = await crawlWebsite(scan.websiteUrl);
      const allUseCases = USE_CASES;
      const premiumResults = [];

      for (const uc of allUseCases) {
        const result = await evaluateUseCase(
          uc.id,
          uc.name,
          scan.profession,
          scan.canton,
          crawlResult
        );
        premiumResults.push(result);
      }

      await prisma.scan.update({
        where: { id: scanId },
        data: {
          premiumUseCaseResults: premiumResults as object,
        },
      });
    }

    try {
      const pdfUrl = await generateReportPdf(scanId);
      if (pdfUrl) {
        await prisma.scan.update({
          where: { id: scanId },
          data: { pdfUrl },
        });
      }
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
    }
  }

  return NextResponse.json({ received: true });
}
