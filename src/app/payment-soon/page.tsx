"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";

/** Placeholder until Stripe checkout is wired (e.g. from pricing). */
export default function PaymentSoonPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-slate-800">
            JourneyFix.ch
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/pricing" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.pricing}
            </Link>
            <Link href="/" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              {t.home}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{t.comingSoon}</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{t.paymentComingSoonTitle}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">{t.paymentComingSoonSubtitle}</p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            {t.paymentPageViewPricing}
          </Link>
          <Link href="/scan" className="text-sm font-medium text-slate-700 underline hover:text-slate-900">
            {t.pricingNavScan}
          </Link>
        </div>

        <div className="mx-auto mt-16 max-w-xl px-4 pb-16">
          <EmailCaptureWidget source="journeyfix_payment_soon" variant="compact" />
        </div>
      </main>
    </div>
  );
}
