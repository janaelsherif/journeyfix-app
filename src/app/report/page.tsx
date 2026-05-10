"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ReportView } from "@/components/ReportView";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";
import { trackReportView } from "@/lib/analytics";

function ReportPageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [scan, setScan] = useState<Record<string, unknown> | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastScan");
    if (stored) {
      try {
        setScan(JSON.parse(stored));
        trackReportView();
      } catch {
        setScan(null);
      }
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("emailSent") === "1") {
      setShowEmailSent(true);
      setTimeout(() => setShowEmailSent(false), 5000);
    }
  }, [searchParams]);

  const handleExportPdf = async () => {
    if (!scan) return;
    setPdfLoading(true);
    const { trackPdfDownload } = await import("@/lib/analytics");
    trackPdfDownload();
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scan, language }),
      });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } catch {
      // ignore
    } finally {
      setPdfLoading(false);
    }
  };

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">{t.noReportTitle}</h1>
          <p className="mt-2 text-slate-600">{t.noReportSubtitle}</p>
          <Link
            href="/scan"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
          >
            {t.startAnalysis}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-slate-800">
            JourneyFix.ch
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/scan" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.newAnalysis}
            </Link>
            <Link href="/" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.home}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12" key={language}>
        {showEmailSent && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {t.emailSentSuccess}
          </div>
        )}
        <ReportView
          scan={scan as unknown as Parameters<typeof ReportView>[0]["scan"]}
          onExportPdf={pdfLoading ? undefined : handleExportPdf}
          reportUrl="/report"
        />
        <div className="mt-12">
          <EmailCaptureWidget source="journeyfix_report_page" variant="compact" />
        </div>
        <FeedbackWidget />
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
