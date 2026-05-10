"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CommunitySubscribe } from "@/components/CommunitySubscribe";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-slate-800">
              JourneyFix.ch
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/pricing" className="min-h-[44px] min-w-[44px] hidden sm:inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              {t.pricing}
            </Link>
            <Link href="#faq" className="min-h-[44px] min-w-[44px] hidden sm:inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              FAQ
            </Link>
            <Link
              href="/scan"
              className="min-h-[44px] inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
            >
              {t.ctaStartAnalysis}
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20">
        {/* Plain divs — Framer Motion opacity:0 SSR/hydration issues left the page blank */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 text-lg text-slate-600">{t.heroSubtitle}</p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/scan"
              className="w-full sm:w-auto rounded-lg bg-slate-900 px-8 py-4 text-lg font-medium text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg text-center"
            >
              {t.ctaStartAnalysis}
            </Link>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              {t.howItWorks} ↓
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
          <span>✓ {t.trust1}</span>
          <span>✓ {t.trust2}</span>
          <span>✓ {t.trust3}</span>
        </div>

        <div className="mt-16 grid max-w-4xl mx-auto gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-600 italic">«{t.testimonialQuote}»</p>
            <p className="mt-4 text-sm text-slate-500">— {t.testimonialAuthor}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-600 italic">«{t.testimonial2Quote}»</p>
            <p className="mt-4 text-sm text-slate-500">— {t.testimonial2Author}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-600 italic">«{t.testimonial3Quote}»</p>
            <p className="mt-4 text-sm text-slate-500">— {t.testimonial3Author}</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            {t.howItWorksTitle}
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-400" aria-hidden />
              <span className="text-sm text-slate-600">1. {t.step1Short ?? "URL"}</span>
              <span className="text-slate-300">→</span>
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-400 [animation-delay:200ms]" aria-hidden />
              <span className="text-sm text-slate-600">2. {t.step2Short ?? "Review"}</span>
              <span className="text-slate-300">→</span>
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-600 [animation-delay:400ms]" aria-hidden />
              <span className="text-sm text-slate-600">3. {t.step3Short ?? "Report"}</span>
            </div>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-2xl font-bold text-slate-400">1</div>
              <h3 className="mt-2 font-semibold text-slate-900">
                {t.step1Title}
              </h3>
              <p className="mt-2 text-slate-600">{t.step1Desc}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-2xl font-bold text-slate-400">2</div>
              <h3 className="mt-2 font-semibold text-slate-900">
                {t.step2Title}
              </h3>
              <p className="mt-2 text-slate-600">{t.step2Desc}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-2xl font-bold text-slate-400">3</div>
              <h3 className="mt-2 font-semibold text-slate-900">
                {t.step3Title}
              </h3>
              <p className="mt-2 text-slate-600">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">{t.faqTitle}</h2>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="font-semibold text-slate-900">{t.faq1Q}</dt>
              <dd className="mt-2 text-slate-600">{t.faq1A}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">{t.faq2Q}</dt>
              <dd className="mt-2 text-slate-600">{t.faq2A}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">{t.faq3Q}</dt>
              <dd className="mt-2 text-slate-600">{t.faq3A}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">{t.faq4Q}</dt>
              <dd className="mt-2 text-slate-600">{t.faq4A}</dd>
            </div>
          </dl>
        </div>
      </section>

      <CommunitySubscribe />

      <section className="border-t border-slate-200 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-slate-600">{t.ctaSubtitle}</p>
          <Link
            href="/scan"
            className="mt-4 inline-block text-slate-900 font-semibold hover:underline"
          >
            {t.ctaStartAnalysis} →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          {t.footer}
          <span className="mx-2">·</span>
          <Link href="/praxis-trust/pricing" className="text-slate-600 hover:text-slate-900 hover:underline">
            PraxisTrust
          </Link>
        </div>
      </footer>
    </div>
  );
}
