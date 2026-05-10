"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";

export default function ComingSoonPage() {
  const { t } = useLanguage();

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

      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t.paymentComingSoonTitle}</h1>
        <p className="mt-4 text-slate-600">{t.paymentComingSoonSubtitle}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
        >
          {t.home}
        </Link>

        <div className="mx-auto mt-12 max-w-xl text-left">
          <EmailCaptureWidget source="journeyfix_coming_soon" variant="compact" />
        </div>
      </main>
    </div>
  );
}
