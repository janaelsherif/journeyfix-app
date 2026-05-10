import { prisma } from "./db";
import { stripSandboxPlaywrightBrowsersPath } from "./playwright-env";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { translations } from "./translations";
import { markdownToHtml } from "./pdf-markdown";

export async function generateReportPdf(
  scanId: string,
  language: "de" | "en" = "de"
): Promise<string | null> {
  if (!prisma) return null;
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
    });

    if (!scan) return null;

    const tier = (scan.reportTier ?? (scan.isPremium ? "ADVANCED" : "FREE")) as "FREE" | "BASIC" | "ADVANCED";
    const rawResults = (scan.isPremium && scan.premiumUseCaseResults
      ? scan.premiumUseCaseResults
      : scan.useCaseResults) as Array<{
      useCaseName: string;
      score: number;
      severity: string;
      briefRemedy: string;
    }> || [];
    const results = tier === "FREE" ? rawResults.slice(0, 5) : rawResults;

    const reportLang = (scan.crawlData as { reportLang?: "de" | "en" })?.reportLang ?? language;
    const t = translations[reportLang];
    const scoreColor =
      (scan.overallScore ?? 0) >= 80 ? "#16a34a" : (scan.overallScore ?? 0) >= 60 ? "#d97706" : "#dc2626";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; font-size: 12px; color: #1e293b; line-height: 1.5; }
    h1 { font-size: 22px; margin-bottom: 20px; color: #0f172a; }
    .pdf-h2 { font-size: 16px; font-weight: bold; margin-top: 28px; margin-bottom: 12px; color: #4338ca; border-bottom: 2px solid #c7d2fe; padding-bottom: 6px; }
    .pdf-h3 { font-size: 14px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; color: #0d9488; }
    .pdf-h4 { font-size: 13px; font-weight: 600; margin-top: 16px; margin-bottom: 6px; color: #b45309; }
    .score { font-size: 28px; font-weight: bold; margin: 16px 0; }
    .issue { margin-bottom: 16px; padding: 12px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; }
    .issue:nth-child(odd) { background: #fff; }
    .meta { color: #64748b; margin-bottom: 8px; font-size: 11px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .pdf-p { margin: 0 0 10px 0; font-size: 11px; }
    .pdf-blockquote { margin: 10px 0; padding: 10px 14px; border-left: 4px solid #6366f1; background: #eef2ff; border-radius: 0 6px 6px 0; font-size: 11px; }
    .pdf-list { margin: 10px 0; padding-left: 20px; font-size: 11px; }
    .pdf-list li { margin-bottom: 4px; }
    .pdf-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; table-layout: fixed; page-break-inside: avoid; }
    .pdf-table thead tr { background: #4338ca !important; }
    .pdf-th { background: #4338ca !important; color: #fff !important; padding: 10px 12px; text-align: left; font-weight: 600; border: none; }
    .pdf-td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #475569; }
    .pdf-tr-alt td { background: #f8fafc; }
    .section { margin-top: 32px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>JourneyFix.ch – ${t.pdfReportTitle}</h1>
    <div class="meta">Website: ${scan.websiteUrl}</div>
    <div class="meta">${scan.city ? scan.city + ", " : ""}${scan.canton} • ${scan.profession}</div>
    <div class="score" style="color: ${scoreColor}">${t.pdfOverallScore}: ${scan.overallScore ?? 0}/100</div>
  </div>

  <h2 class="pdf-h2">${t.pdfTopIssues}</h2>
  ${results
    .map(
      (r, i) => `
    <div class="issue">
      <strong>#${i + 1} ${r.useCaseName}</strong> (${r.score}/100) – ${r.severity}${tier !== "FREE" ? `<br><span style="font-size: 11px;">${(r.briefRemedy || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>` : ""}
    </div>
  `
    )
    .join("")}

  ${tier === "ADVANCED" && scan.statusShiftAnalysis ? `
  <div class="section">
    <h2 class="pdf-h2">${t.pdfStatusShift}</h2>
    <div class="pdf-content">${markdownToHtml(scan.statusShiftAnalysis)}</div>
  </div>
  ` : ""}

  ${tier === "ADVANCED" && scan.fiveAngleAnalysis ? `
  <div class="section">
    <h2 class="pdf-h2">${t.pdfFiveAngle}</h2>
    <div class="pdf-content">${markdownToHtml(scan.fiveAngleAnalysis)}</div>
  </div>
  ` : ""}

  ${tier === "ADVANCED" && scan.critiqueAnalysis ? `
  <div class="section">
    <h2 class="pdf-h2">${t.pdfCritique}</h2>
    <div class="pdf-content">${markdownToHtml(scan.critiqueAnalysis)}</div>
  </div>
  ` : ""}
</body>
</html>
    `;

    stripSandboxPlaywrightBrowsersPath();
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const buffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });
    await browser.close();

    const reportsDir = path.join(process.cwd(), "public", "reports");
    await mkdir(reportsDir, { recursive: true });
    const filePath = path.join(reportsDir, `${scanId}.pdf`);
    await writeFile(filePath, buffer);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/reports/${scanId}.pdf`;
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  }
}
