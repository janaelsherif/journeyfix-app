"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SubscribeSource } from "@/lib/subscribe-sources";

type Props = {
  source: SubscribeSource;
  /** Full Nexilon-style panel (home, pricing) vs compact stack (scan, small pages) */
  variant?: "panel" | "compact";
  className?: string;
};

/**
 * Reusable marketing / community email capture (Brevo-ready via /api/subscribe).
 * Matches Nexilon handoff: consent checkbox, double opt-in note, source tagging.
 */
export function EmailCaptureWidget({ source, variant = "panel", className = "" }: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source,
          marketingConsent: true,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  }

  if (variant === "compact") {
    return (
      <section
        aria-labelledby={`email-capture-${source}-title`}
        className={`rounded-2xl border border-[#d4d1ca] bg-white p-5 shadow-sm ${className}`}
      >
        <h2 id={`email-capture-${source}-title`} className="text-base font-semibold text-[#28251d]">
          {t.subscribeTitle}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[#626c71]">{t.subscribeDesc}</p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.subscribePlaceholder}
              className="min-h-[44px] flex-1 rounded-full border border-[#d4d1ca] bg-[#fbfbf9] px-4 text-sm text-[#28251d] outline-none ring-[#01696f] focus:ring-2"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="min-h-[44px] shrink-0 rounded-full bg-[#01696f] px-5 text-sm font-semibold text-white transition hover:bg-[#0c4e54] disabled:opacity-60"
            >
              {t.subscribeButton}
            </button>
          </div>
          <label className="flex cursor-pointer gap-2 text-[11px] text-[#626c71]">
            <input type="checkbox" required className="mt-0.5 accent-[#01696f]" />
            <span>{t.subscribeConsent}</span>
          </label>
          <p className="text-[10px] text-[#9b968f]">{t.subscribeFineprint}</p>
          {status === "ok" && (
            <p className="text-sm font-medium text-[#01696f]" role="status">
              {t.subscribeSuccess}
            </p>
          )}
          {status === "err" && (
            <p className="text-sm text-red-600" role="alert">
              {t.subscribeError}
            </p>
          )}
        </form>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`email-capture-${source}-title`}
      className={`border-t border-[#dcd9d5] bg-[#f9f8f5] py-10 ${className}`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 rounded-2xl border border-[#d4d1ca] bg-white p-6 shadow-md md:grid-cols-[1fr,minmax(0,26rem)] md:items-center md:gap-8 md:p-8">
          <div>
            <h2 id={`email-capture-${source}-title`} className="text-xl font-semibold tracking-tight text-[#28251d]">
              {t.subscribeTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#626c71]">{t.subscribeDesc}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.subscribePlaceholder}
                className="min-h-[48px] flex-1 rounded-full border border-[#d4d1ca] bg-[#fbfbf9] px-4 text-sm text-[#28251d] outline-none ring-[#01696f] focus:ring-2"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="min-h-[48px] shrink-0 rounded-full bg-[#01696f] px-6 text-sm font-semibold text-white transition hover:bg-[#0c4e54] disabled:opacity-60"
              >
                {t.subscribeButton}
              </button>
            </div>
            <label className="flex cursor-pointer gap-2 text-xs text-[#626c71]">
              <input type="checkbox" required className="mt-0.5 accent-[#01696f]" />
              <span>{t.subscribeConsent}</span>
            </label>
            <p className="text-[11px] text-[#9b968f]">{t.subscribeFineprint}</p>
            {status === "ok" && (
              <p className="text-sm font-medium text-[#01696f]" role="status">
                {t.subscribeSuccess}
              </p>
            )}
            {status === "err" && (
              <p className="text-sm text-red-600" role="alert">
                {t.subscribeError}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
