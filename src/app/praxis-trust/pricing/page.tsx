"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";

export default function PraxisTrustPricingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-slate-800">
            PraxisTrust
          </Link>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/praxis-trust/check" className="text-sm text-slate-600 hover:text-slate-900">
              {t.ptCtaFreemium.replace(" →", "")}
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              {t.pricingNavHome}
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[680px] px-6 pt-16 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#13343b] sm:text-4xl">
          {t.ptTitle}
        </h1>
        <p className="mt-3 text-base text-[#626c71] max-w-[520px] mx-auto leading-relaxed">
          {t.ptSubtitle}
        </p>
      </section>

      <div className="flex justify-center gap-5 flex-wrap px-6 py-5 pb-11 max-w-[660px] mx-auto">
        <span className="flex items-center gap-1.5 text-xs text-[#626c71] font-medium">
          <svg className="w-4 h-4 text-[#21808d]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
          {t.pricingTrustHosting}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#626c71] font-medium">
          <svg className="w-4 h-4 text-[#21808d]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          {t.pricingTrustCompliance}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1020px] mx-auto px-6 pb-14">
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-md hover:shadow-lg transition-shadow">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#626c71] mb-0.5">{t.ptTierFreemium}</div>
          <div className="text-lg font-bold text-[#13343b] mb-3">{t.ptTierFreemiumTitle}</div>
          <div className="text-4xl font-extrabold text-green-600 mb-1">{t.pricingFree}</div>
          <div className="text-xs text-[#626c71] mb-4">{t.pricingNoPayment}</div>
          <hr className="border-slate-200 my-4" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#21808d] mb-2">{t.pricingYouGet}</div>
          <ul className="space-y-2 text-[13px] text-[#13343b] mb-4">
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptFreemiumFeature1}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptFreemiumFeature2}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptFreemiumFeature3}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptFreemiumFeature4}</li>
          </ul>
          <p className="text-[12px] text-[#626c71] mb-6">{t.ptFreemiumExcl}</p>
          <Link href="/praxis-trust/check" className="block w-full text-center py-3 rounded-xl text-sm font-semibold border-2 border-[#21808d] text-[#21808d] hover:bg-[#21808d] hover:text-white transition-colors">
            {t.ptCtaFreemium}
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-[#21808d] bg-white p-8 shadow-md hover:shadow-lg transition-shadow relative md:-mt-2 md:shadow-lg">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#21808d] text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {t.pricingRecommended}
          </span>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#626c71] mb-0.5">{t.ptTierBasic}</div>
          <div className="text-lg font-bold text-[#13343b] mb-3">{t.ptTierBasicTitle}</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold">79.–</span>
          </div>
          <div className="text-xs text-[#626c71] mb-4">{t.ptOnce} · exkl. MWST</div>
          <hr className="border-slate-200 my-4" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#21808d] mb-2">{t.pricingYouGet}</div>
          <ul className="space-y-2 text-[13px] text-[#13343b] mb-6">
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptBasicFeature1}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptBasicFeature2}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptBasicFeature3}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptBasicFeature4}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptBasicFeature5}</li>
          </ul>
          <Link href="/praxis-trust/check" className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-[#21808d] text-white hover:bg-[#1a6873] transition-colors">
            {t.ptCtaBasic}
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-white p-8 shadow-md hover:shadow-lg transition-shadow">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#626c71] mb-0.5">{t.ptTierAdvanced}</div>
          <div className="text-lg font-bold text-[#13343b] mb-3">{t.ptTierAdvancedTitle}</div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold">199.–</span>
            <span className="text-sm text-[#626c71]">{t.ptPerYear}</span>
          </div>
          <div className="text-xs text-[#626c71] mb-4">exkl. MWST</div>
          <hr className="border-slate-200 my-4" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#21808d] mb-2">{t.pricingYouGet}</div>
          <ul className="space-y-2 text-[13px] text-[#13343b] mb-6">
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptAdvancedFeature1}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptAdvancedFeature2}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptAdvancedFeature3}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptAdvancedFeature4}</li>
            <li className="flex gap-2"><span className="shrink-0 w-[18px] h-[18px] rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</span>{t.ptAdvancedFeature5}</li>
          </ul>
          <Link href="/praxis-trust/check" className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-[#c0152f] text-white hover:bg-[#a01228] transition-colors">
            {t.ptCtaAdvanced}
          </Link>
        </div>
      </div>

      <EmailCaptureWidget
        source="journeyfix_praxis_trust"
        variant="panel"
        className="border-t border-[#dcd9d5] bg-[#fcfcf9] py-10"
      />

      <div className="text-center px-6 pb-14 max-w-[560px] mx-auto">
        <p className="text-[13px] text-[#626c71] leading-relaxed">{t.pricingFooter}</p>
        <p className="mt-3">
          <Link href="/praxis-trust/check" className="text-[#21808d] font-semibold hover:underline">
            {t.ptCtaFreemium}
          </Link>
        </p>
      </div>
    </div>
  );
}
