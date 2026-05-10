import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/crawler";
import { rateLimitScan } from "@/lib/rate-limit";
import { getUserKey, getClientIp } from "@/lib/scan-eligibility";
import {
  evaluateUseCase,
  runStatusShiftAnalysis,
  runFiveAngleAnalysis,
  buildFreeScanCritiqueStub,
  type UseCaseEvaluation,
} from "@/lib/ai-evaluator";
import { FREE_SCAN_USE_CASE_COUNT, USE_CASES } from "@/lib/constants";
import { prisma, isDbConfigured } from "@/lib/db";
import { sendReportEmail } from "@/lib/email";

/** Vercel/serverless ceiling; local dev ignores this. Scan runs several AI calls in parallel. */
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const rateLimit = rateLimitScan(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          details: "Please wait a minute before running another scan.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { "Retry-After": String(rateLimit.retryAfter) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const { websiteUrl, profession, canton, city, email, language = "de" } = body;
    const lang = language === "en" ? "en" : "de";

    if (!websiteUrl || !profession || !canton) {
      return NextResponse.json(
        { error: "websiteUrl, profession, and canton are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "Email is required", details: "Please provide your email address to run a scan." },
        { status: 400 }
      );
    }

    let url = websiteUrl.trim();
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    const clientIp = getClientIp(request);
    const userKey = getUserKey(trimmedEmail, clientIp);

    if (isDbConfigured() && prisma) {
      const existing = await prisma.scanEligibility.findUnique({
        where: {
          userKey_websiteUrl: { userKey, websiteUrl: url },
        },
        include: { scan: { select: { id: true, websiteUrl: true, profession: true, canton: true, city: true, overallScore: true, crawlData: true, useCaseResults: true, statusShiftAnalysis: true, fiveAngleAnalysis: true, critiqueAnalysis: true, completedAt: true, reportTier: true } } },
      });
      if (existing?.scan) {
        const s = existing.scan;
        const scanData = {
          id: s.id,
          websiteUrl: s.websiteUrl,
          profession: s.profession,
          canton: s.canton,
          city: s.city,
          overallScore: s.overallScore ?? 0,
          crawlData: s.crawlData,
          useCaseResults: s.useCaseResults,
          statusShiftAnalysis: s.statusShiftAnalysis,
          fiveAngleAnalysis: s.fiveAngleAnalysis,
          critiqueAnalysis: s.critiqueAnalysis,
          completedAt: s.completedAt?.toISOString(),
          reportTier: s.reportTier ?? "FREE",
        };
        return NextResponse.json({
          success: true,
          scan: scanData,
          emailSent: false,
          existingReport: true,
        });
      }
    }

    const crawlResult = await crawlWebsite(url);

    const useCasesToEvaluate = USE_CASES.slice(0, FREE_SCAN_USE_CASE_COUNT);
    const useCaseName = (uc: (typeof USE_CASES)[number]) => (lang === "en" ? uc.nameEn : uc.name);
    const evaluations: UseCaseEvaluation[] = await Promise.all(
      useCasesToEvaluate.map((uc) =>
        evaluateUseCase(uc.id, useCaseName(uc), profession, canton, crawlResult, lang)
      )
    );
    const [statusShiftAnalysis, fiveAngleAnalysis] = await Promise.all([
      runStatusShiftAnalysis(
        crawlResult.text.substring(0, 4000),
        profession,
        `${city || ""} ${canton}`.trim(),
        "Home",
        lang
      ),
      runFiveAngleAnalysis(
        crawlResult.text.substring(0, 4000),
        profession,
        `${city || ""} ${canton}`.trim(),
        "Home",
        lang
      ),
    ]);

    const critiqueAnalysis = buildFreeScanCritiqueStub(evaluations, lang, crawlResult.url);

    const avgScore =
      evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
        : 0;

    const scanData = {
      websiteUrl: crawlResult.url,
      profession,
      canton,
      city: city || null,
      overallScore: Math.round(avgScore),
      crawlData: {
        title: crawlResult.title,
        wordCount: crawlResult.metadata.wordCount,
        hasHttps: crawlResult.performance.hasHttps,
        loadTimeMs: crawlResult.performance.loadTimeMs,
        contact: crawlResult.contact,
        reportLang: lang,
      },
      useCaseResults: evaluations.sort((a, b) => a.score - b.score),
      statusShiftAnalysis,
      fiveAngleAnalysis,
      critiqueAnalysis,
      completedAt: new Date().toISOString(),
    };

    let scanId: string | null = null;
    let emailSent = false;

    if (isDbConfigured() && prisma) {
      const scan = await prisma.scan.create({
        data: {
          websiteUrl: crawlResult.url,
          profession: profession as "DENTIST" | "LAWYER" | "VET" | "TAX_ADVISOR" | "PHYSIOTHERAPIST" | "DOCTOR_GENERAL" | "PSYCHOLOGIST" | "ACCOUNTANT" | "OTHER",
          canton,
          city: city || null,
          email: trimmedEmail,
          scanType: "FREE",
          reportTier: "FREE",
          status: "COMPLETED",
          overallScore: Math.round(avgScore),
          crawlData: scanData.crawlData as object,
          useCaseResults: scanData.useCaseResults as object,
          statusShiftAnalysis,
          fiveAngleAnalysis,
          critiqueAnalysis,
          completedAt: new Date(),
        },
      });
      scanId = scan.id;

      await prisma.scanEligibility.create({
        data: { userKey, websiteUrl: url, scanId: scan.id },
      });

      if (trimmedEmail && process.env.RESEND_API_KEY) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        try {
          await sendReportEmail(trimmedEmail, scanId, baseUrl, lang);
          emailSent = true;
        } catch (e) {
          console.warn("Email send failed:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      scan: {
        ...scanData,
        id: scanId,
      },
      emailSent,
    });
  } catch (error) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const isTimeout = message.includes("timeout") || message.includes("Timeout");
    const isNetwork = message.includes("fetch") || message.includes("ECONNREFUSED") || message.includes("ENOTFOUND");
    const isApiKey =
      message.includes("API key") ||
      message.includes("ANTHROPIC") ||
      message.includes("x-api-key") ||
      message.includes("authentication_error") ||
      message.includes("invalid x-api-key");
    const isModelNotFound =
      message.includes("not_found_error") || message.includes("model:");
    const isNoCredits =
      message.includes("credit balance") || message.includes("insufficient") || message.includes("Plans & Billing");
    return NextResponse.json(
      {
        error: isTimeout ? "Scan timeout" : isNetwork ? "Connection failed" : isApiKey ? "API key not configured" : isModelNotFound ? "Model not found" : isNoCredits ? "No credits" : "Scan failed",
        errorCode: isApiKey ? "API_KEY_INVALID" : isModelNotFound ? "MODEL_NOT_FOUND" : isNoCredits ? "NO_CREDITS" : undefined,
        details: isApiKey ? "API key missing or invalid. Check .env and ANTHROPIC_API_KEY." : isModelNotFound ? "Analysis service model was updated. Please try again." : isNoCredits ? "Add credits at console.anthropic.com" : message,
      },
      { status: 500 }
    );
  }
}
