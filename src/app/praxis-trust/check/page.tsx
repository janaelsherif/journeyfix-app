"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function PraxisTrustCheckPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t.ptCheckEmailRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t.ptInvalidEmail ?? "Invalid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: "journeyfix_praxis_trust",
          marketingConsent,
        }),
      });
      if (!res.ok) {
        setError(t.subscribeError);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t.subscribeError);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold text-slate-800">
              PraxisTrust
            </Link>
            <nav className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/praxis-trust/pricing" className="text-sm text-slate-600 hover:text-slate-900">
                {t.pricing}
              </Link>
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                {t.pricingNavHome}
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t.ptThankYou}</h2>
              <p className="mt-2 text-slate-600">{t.ptComingSoon}</p>
            </div>
            <Link
              href="/praxis-trust/pricing"
              className="mt-6 inline-block text-[#21808d] font-semibold hover:underline"
            >
              ← {t.pricingNavHome}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-slate-800">
            PraxisTrust
          </Link>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/praxis-trust/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              {t.pricing}
            </Link>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              {t.pricingNavHome}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">{t.ptCheckTitle}</h1>
        <p className="mt-2 text-slate-600">{t.ptCheckSubtitle}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              {t.email} *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.ch"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">{t.emailDisclaimer}</p>
          </div>

          <label className="flex cursor-pointer gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 accent-[#01696f]"
            />
            <span>{t.subscribeConsent}</span>
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-slate-900 py-4 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow disabled:opacity-60"
          >
            {loading ? t.analyzing : t.ptCtaFreemium}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t.ptComingSoon}
        </p>
      </main>
    </div>
  );
}
