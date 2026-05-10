"use client";

import React from "react";
import { ShareReport } from "./ShareReport";
import { getBasicPriceChfClient, getAdvancedPriceChfClient } from "@/lib/pricing";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

interface UseCaseResult {
  useCaseId: string;
  useCaseName: string;
  score: number;
  severity: string;
  frictionPoints: string[];
  briefRemedy: string;
  evidence?: string;
  detailedRemedy?: string;
}

type ReportTier = "FREE" | "BASIC" | "ADVANCED";

interface ScanData {
  id?: string;
  websiteUrl: string;
  profession: string;
  canton: string;
  city?: string;
  overallScore: number;
  isPremium?: boolean;
  reportTier?: ReportTier;
  useCaseResults: UseCaseResult[];
  statusShiftAnalysis?: string;
  fiveAngleAnalysis?: string;
  critiqueAnalysis?: string;
  premiumUseCaseResults?: UseCaseResult[];
  pdfUrl?: string;
  crawlData?: {
    title: string;
    wordCount: number;
    hasHttps: boolean;
    loadTimeMs?: number;
    contact: { phoneNumbers: string[]; emails: string[] };
    reportLang?: "de" | "en";
  };
}

function renderInlineMarkdown(str: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = str;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(<strong key={key++} className="font-semibold text-slate-800">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }
  return <>{parts}</>;
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={elements.length} className="mb-3 text-slate-600 text-sm leading-relaxed">
          {renderInlineMarkdown(currentParagraph.join("\n"))}
        </p>
      );
      currentParagraph = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2 key={elements.length} className="mb-3 mt-8 text-xl font-bold text-slate-900 first:mt-0 border-b-2 border-indigo-200 pb-2">
          {renderInlineMarkdown(line.slice(3))}
        </h2>
      );
      i++;
    } else if (line.startsWith("### ")) {
      flushParagraph();
      elements.push(
        <h3 key={elements.length} className="mb-2 mt-6 text-base font-semibold text-teal-800">
          {renderInlineMarkdown(line.slice(4))}
        </h3>
      );
      i++;
    } else if (line.startsWith("#### ")) {
      flushParagraph();
      elements.push(
        <h4 key={elements.length} className="mb-2 mt-4 text-sm font-semibold text-amber-800">
          {renderInlineMarkdown(line.slice(5))}
        </h4>
      );
      i++;
    } else if (line.startsWith("> ")) {
      flushParagraph();
      elements.push(
        <blockquote key={elements.length} className="ml-4 border-l-4 border-indigo-300 pl-4 py-2 my-2 bg-indigo-50/50 rounded-r text-slate-600 text-sm">
          {renderInlineMarkdown(line.slice(2))}
        </blockquote>
      );
      i++;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      elements.push(
        <li key={elements.length} className="ml-4 list-disc text-slate-600 text-sm leading-relaxed mb-1">
          {renderInlineMarkdown(line.slice(2))}
        </li>
      );
      i++;
    } else if (line.includes("|") && line.trim().startsWith("|")) {
      flushParagraph();
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        const row = lines[i];
        if (!/^[\s|:-]+$/.test(row.trim())) {
          const cells = row.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        elements.push(
          <div key={elements.length} className="my-5 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full w-full text-sm">
              <thead>
                <tr className="border-b-2 border-indigo-200 bg-indigo-600">
                  {tableRows[0].map((cell, j) => (
                    <th key={j} className="px-4 py-3 text-left font-semibold text-white">{renderInlineMarkdown(cell)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className={`border-b border-slate-100 last:border-0 ${ri % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-slate-600">{renderInlineMarkdown(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } else if (line.trim()) {
      currentParagraph.push(line);
      i++;
    } else {
      flushParagraph();
      i++;
    }
  }
  flushParagraph();

  return <div className="space-y-2 max-w-3xl">{elements}</div>;
}

export function ReportView({ scan, onExportPdf, reportUrl }: { scan: ScanData; onExportPdf?: () => void; reportUrl?: string }) {
  const { t, language } = useLanguage();
  const reportLang = scan.crawlData?.reportLang;
  const showLangMismatch = reportLang && reportLang !== language;

  const tier: ReportTier = scan.reportTier ?? (scan.isPremium ? "ADVANCED" : "FREE");

  const resultsToShow =
    scan.isPremium && scan.premiumUseCaseResults
      ? scan.premiumUseCaseResults
      : scan.useCaseResults;

  const showChart = tier !== "FREE";
  const showDetailedRemedy = tier === "BASIC" || tier === "ADVANCED";
  const showStatusShift = tier === "ADVANCED";
  const showFiveAngle = tier === "ADVANCED";
  const showCritique = tier === "ADVANCED";
  const topN = tier === "FREE" ? 5 : resultsToShow.length;
  const resultsForDisplay = resultsToShow.slice(0, topN);

  const chartData = resultsForDisplay.map((r, i) => ({
    name: r.useCaseName.length > 25 ? r.useCaseName.slice(0, 22) + "…" : r.useCaseName,
    fullName: r.useCaseName,
    score: r.score,
    index: i,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#d97706";
    return "#dc2626";
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: "bg-red-100 text-red-800",
      high: "bg-amber-100 text-amber-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-slate-100 text-slate-800",
    };
    return styles[severity.toLowerCase()] || styles.low;
  };

  const scoreColorClass =
    scan.overallScore >= 80
      ? "text-green-600"
      : scan.overallScore >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-10">
      {reportLang && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            showLangMismatch
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {reportLang === "en" ? t.reportLangMismatchEn : t.reportLangMismatchDe}
        </div>
      )}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.reportTitle}</h1>
            <p className="mt-1 text-slate-600">
              {scan.websiteUrl}
              {scan.city && ` • ${scan.city}, ${scan.canton}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center">
            {reportUrl && (
              <div className="no-print order-first sm:order-last">
                <ShareReport reportUrl={reportUrl} />
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${scoreColorClass}`}>
                {scan.overallScore}
              </div>
              <div className="text-slate-500">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      {showChart && chartData.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
            {t.scoreBreakdown ?? "Score overview"}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}/100`, "Score"]}
                  labelFormatter={(_, payload) => (payload?.[0] as { fullName?: string })?.fullName || ""}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="print-break-inside-avoid">
        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b-2 border-slate-200 pb-2">
          {tier === "FREE" ? t.top5Issues : (tier === "BASIC" ? "Top 5 mit Empfehlungen" : (t.allWeakPoints ?? "All weak points"))}
        </h2>
        <div className="space-y-4">
          {resultsForDisplay.map((result, i) => (
            <div
              key={result.useCaseId}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-slate-400">#{i + 1}</span>
                    <h3 className="font-semibold text-slate-900">{result.useCaseName}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${getSeverityBadge(result.severity)}`}
                    >
                      {result.severity}
                    </span>
                  </div>
                  {tier !== "FREE" && (
                    <>
                      <p className="mt-2 text-slate-600 leading-relaxed">{renderInlineMarkdown(result.briefRemedy)}</p>
                      {showDetailedRemedy && result.detailedRemedy && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
                          {renderInlineMarkdown(result.detailedRemedy)}
                        </div>
                      )}
                    </>
                  )}
                  {result.frictionPoints?.length > 0 && showDetailedRemedy && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-500 leading-relaxed">
                      {result.frictionPoints.map((fp, j) => (
                        <li key={j}>{renderInlineMarkdown(fp)}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className={`shrink-0 text-2xl font-bold`}
                  style={{ color: getScoreColor(result.score) }}
                >
                  {result.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showStatusShift && scan.statusShiftAnalysis && (
        <section className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{t.statusShiftTitle}</h2>
          <MarkdownBlock text={scan.statusShiftAnalysis} />
        </section>
      )}

      {showFiveAngle && scan.fiveAngleAnalysis && (
        <section className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b-2 border-teal-200 pb-2">{t.fiveAngleTitle}</h2>
          <MarkdownBlock text={scan.fiveAngleAnalysis} />
        </section>
      )}

      {showCritique && scan.critiqueAnalysis && (
        <section className="print-break-inside-avoid rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b-2 border-amber-200 pb-2">{t.critiqueTitle}</h2>
          <MarkdownBlock text={scan.critiqueAnalysis} />
        </section>
      )}

      {(onExportPdf || (scan.isPremium && scan.pdfUrl)) && (
        <div className="flex justify-center">
          {scan.isPremium && scan.pdfUrl ? (
            <a
              href={scan.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.exportPdf ?? "Download PDF"}
            </a>
          ) : onExportPdf ? (
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.exportPdf ?? "Download PDF"}
            </button>
          ) : null}
        </div>
      )}

      {tier === "FREE" && (
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-center text-white shadow-lg">
          <h3 className="text-xl font-bold">{t.premiumCtaTitle}</h3>
          <p className="mt-2 text-slate-300">{t.premiumCtaSubtitle}</p>
          {scan.id && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href={`/payment?scanId=${encodeURIComponent(scan.id)}&tier=BASIC`}
                className="inline-block rounded-lg bg-white px-6 py-3 font-medium text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:shadow"
              >
                Aktionsplan – CHF {getBasicPriceChfClient()}
              </a>
              <a
                href={`/payment?scanId=${encodeURIComponent(scan.id)}&tier=ADVANCED`}
                className="inline-block rounded-lg bg-[#c0152f] px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-[#a01228] hover:shadow"
              >
                Strategische Analyse – CHF {getAdvancedPriceChfClient()}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
