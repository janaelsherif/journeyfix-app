"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";
import { PROFESSION_CATEGORIES, CANTONS } from "@/lib/constants";
import { trackScanComplete } from "@/lib/analytics";

export default function ScanPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [profession, setProfession] = useState("DENTIST");
  const [canton, setCanton] = useState("ZH");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  /** When true, hide generic "URL / npm run setup" hint (not relevant for 429 rate limit). */
  const [hideRetryHint, setHideRetryHint] = useState(false);

  const loadingSteps = [
    t.stepCrawling,
    t.stepUseCases,
    t.stepCopy,
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 2));
    }, 6000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setHideRetryHint(false);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t.emailRequired ?? "E-Mail ist erforderlich.");
      return;
    }
    setLoading(true);

    /** Server targets ~1 min; allow buffer for slow networks */
    const SCAN_FETCH_MS = 90 * 1000;
    const scanController = new AbortController();
    const scanTimeout = setTimeout(() => scanController.abort(), SCAN_FETCH_MS);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl,
          profession,
          canton,
          city: city || undefined,
          email: trimmedEmail,
          language,
        }),
        signal: scanController.signal,
      });

      const text = await res.text();
      let data: { scan?: { id?: string }; emailSent?: boolean; error?: string; details?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Unexpected end of JSON input");
      }

      if (!res.ok) {
        const errMsg = data.details || data.error || "Scan failed";
        if (res.status === 429) throw new Error("429:Rate limit");
        if (errMsg.toLowerCase().includes("email") && errMsg.toLowerCase().includes("required")) {
          throw new Error(t.emailRequired ?? "Email is required.");
        }
        throw new Error(errMsg);
      }

      if (!data.scan) {
        throw new Error("Unexpected server response");
      }

      trackScanComplete(data.scan.id || undefined);
      try {
        sessionStorage.setItem("jf_newsletter_email_hint", trimmedEmail);
      } catch {
        /* ignore */
      }
      if (data.scan.id) {
        router.push(data.emailSent ? `/report/${data.scan.id}?emailSent=1` : `/report/${data.scan.id}`);
      } else {
        sessionStorage.setItem("lastScan", JSON.stringify(data.scan));
        router.push(data.emailSent ? "/report?emailSent=1" : "/report");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (err instanceof Error && err.name === "AbortError") {
        setError(t.errorTimeout);
        return;
      }
      if (msg.includes("429") || msg.includes("Too many")) {
        setHideRetryHint(true);
        setError(t.errorRateLimit);
      } else if (msg.includes("timeout") || msg.includes("Timeout")) {
        setError(t.errorTimeout);
      } else if (msg.includes("fetch") || msg.includes("Failed to fetch")) {
        setError(t.errorNetwork);
      } else if (
        msg.includes("x-api-key") ||
        msg.includes("API key") ||
        msg.includes("ANTHROPIC") ||
        msg.includes("authentication_error")
      ) {
        setError(t.errorApiKey);
      } else if (msg.includes("not_found_error") || msg.includes("Model not found") || msg.includes("model was updated")) {
        setError(t.errorModelNotFound);
      } else if (msg.includes("credit balance") || msg.includes("No credits") || msg.includes("Plans & Billing")) {
        setError(t.errorNoCredits);
      } else if (msg.includes("Unexpected end of JSON") || msg.includes("Unexpected server response")) {
        setError(t.errorInvalidResponse);
      } else {
        setError(msg || t.errorGeneric);
      }
    } finally {
      clearTimeout(scanTimeout);
      setLoading(false);
    }
  };

  const getProfessionLabel = (p: (typeof PROFESSION_CATEGORIES)[number]) =>
    language === "en" ? p.labelEn : p.label;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-slate-800">
            JourneyFix.ch
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/"
              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              ← {t.back}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">{t.scanTitle}</h1>
        <p className="mt-2 text-slate-600">{t.scanSubtitle}</p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
          {language === "de" ? t.scanLangHintDe : t.scanLangHintEn}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium text-slate-700"
            >
              {t.websiteUrl} *
            </label>
            <input
              id="websiteUrl"
              type="url"
              required
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder={t.urlPlaceholder}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-slate-700"
            >
              {t.profession} *
            </label>
            <select
              id="profession"
              required
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              {PROFESSION_CATEGORIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {getProfessionLabel(p)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="canton"
                className="block text-sm font-medium text-slate-700"
              >
                {t.canton} *
              </label>
              <select
                id="canton"
                required
                value={canton}
                onChange={(e) => setCanton(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                {CANTONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700"
              >
                {t.city}
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.cityPlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>

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

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium">{error}</p>
              {!hideRetryHint && (
                <p className="mt-2 text-xs text-red-600">{t.errorRetryHint}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-slate-900 py-4 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex flex-col items-center justify-center gap-3">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-slate-600"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t.analyzing}
                </span>
                <span className="text-sm font-normal text-slate-500">
                  {loadingSteps[loadingStep]}
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        i <= loadingStep ? "bg-slate-600" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </span>
            ) : (
              t.startScan
            )}
          </button>
        </form>

        <div className="mt-10">
          <EmailCaptureWidget source="journeyfix_scan_page" variant="compact" />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t.scanDisclaimer}
        </p>
      </main>
    </div>
  );
}
