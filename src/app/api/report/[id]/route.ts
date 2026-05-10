import { NextRequest, NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  if (!isDbConfigured() || !prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const scan = await prisma.scan.findUnique({
    where: { id },
  });

  if (!scan) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const reportTier = scan.reportTier ?? "FREE";

  return NextResponse.json({
    id: scan.id,
    websiteUrl: scan.websiteUrl,
    profession: scan.profession,
    canton: scan.canton,
    city: scan.city,
    overallScore: scan.overallScore,
    isPremium: scan.isPremium,
    reportTier,
    crawlData: scan.crawlData,
    useCaseResults: scan.useCaseResults,
    statusShiftAnalysis: scan.statusShiftAnalysis,
    fiveAngleAnalysis: scan.fiveAngleAnalysis,
    critiqueAnalysis: scan.critiqueAnalysis,
    premiumUseCaseResults: scan.isPremium ? scan.premiumUseCaseResults : null,
    pdfUrl: scan.pdfUrl,
    completedAt: scan.completedAt?.toISOString(),
  });
}
