"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  scanId?: string;
  tier: "BASIC" | "ADVANCED";
};

export function PaymentPageClient({ scanId, tier }: Props) {
  const { t } = useLanguage();
  const tierLabel = tier === "BASIC" ? t.paymentPageTierBasic : t.paymentPageTierAdvanced;

  if (!scanId?.trim()) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{t.paymentPageTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.paymentPageNoScanId}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/scan"
              className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              {t.tryFree}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {t.paymentPageViewPricing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{t.comingSoon}</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{t.paymentPageTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.paymentPageDescription}</p>

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">{t.paymentPageSelectedTier}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{tierLabel}</p>
          <p className="mt-2 font-mono text-xs text-slate-500">
            Report ID: <span className="break-all">{scanId.trim()}</span>
          </p>
        </div>

        <p className="mt-4 text-sm text-slate-600">{t.paymentPageContactNote}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/report/${encodeURIComponent(scanId.trim())}`}
            className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            {t.paymentPageBackReport}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            {t.paymentPageViewPricing}
          </Link>
        </div>
      </div>
    </div>
  );
}
