"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SESSION_KEY = "jf_report_email_gate_v1";

type Props = {
  reportTier?: string;
};

/**
 * Email gate after value (free report visible): collect lead + optional marketing consent.
 * Nexilon mockup: transactional framing, optional marketing checkbox, Brevo source tag.
 */
export function MarketingOptInModal({ reportTier }: Props) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reportTier && reportTier !== "FREE") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const hint = sessionStorage.getItem("jf_newsletter_email_hint");
    if (hint) setEmail(hint);
    const tmr = window.setTimeout(() => {
      dialogRef.current?.showModal();
    }, 4000);
    return () => window.clearTimeout(tmr);
  }, [reportTier]);

  function markSeen() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function close() {
    dialogRef.current?.close();
    markSeen();
  }

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
          source: "journeyfix_report_email_gate",
          marketingConsent: marketing,
        }),
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      window.setTimeout(() => {
        close();
      }, 1100);
    } catch {
      setStatus("err");
    }
  }

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => markSeen();
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="marketing-modal-title"
      className="w-[min(100%-2rem,26rem)] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-black/50"
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="inline-flex rounded-full bg-[#d9e6e3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#01696f]">
            {t.marketingModalBadge}
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            aria-label={t.marketingModalLater}
          >
            ✕
          </button>
        </div>

        <h2 id="marketing-modal-title" className="text-xl font-semibold tracking-tight text-slate-900">
          {t.marketingModalTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.marketingModalSubtitle}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
            <strong className="mb-0.5 block text-slate-900">{t.emailGatePill1Strong}</strong>
            {t.emailGatePill1}
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
            <strong className="mb-0.5 block text-slate-900">{t.emailGatePill2Strong}</strong>
            <code className="text-[10px] text-slate-500">journeyfix_report_email_gate</code>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
            <strong className="mb-0.5 block text-slate-900">{t.emailGatePill3Strong}</strong>
            {t.emailGatePill3}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.subscribePlaceholder}
            className="min-h-[48px] w-full rounded-full border border-slate-300 bg-[#fbfbf9] px-4 text-sm outline-none ring-[#01696f] focus:ring-2"
          />
          <label className="flex cursor-pointer gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-1 accent-[#01696f]"
            />
            <span>{t.marketingModalConsent}</span>
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-[48px] w-full rounded-full bg-[#01696f] text-sm font-semibold text-white transition hover:bg-[#0c4e54] disabled:opacity-60"
          >
            {t.marketingModalSubmit}
          </button>

          <p className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <span aria-hidden className="select-none">
              ↳
            </span>
            <span>{t.marketingModalNote}</span>
          </p>

          {status === "ok" && (
            <p className="text-center text-sm font-medium text-[#01696f]" role="status">
              {t.subscribeSuccess}
            </p>
          )}
          {status === "err" && (
            <p className="text-center text-sm text-red-600" role="alert">
              {t.subscribeError}
            </p>
          )}
        </form>

        <button type="button" onClick={close} className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-800">
          {t.marketingModalLater}
        </button>
      </div>
    </dialog>
  );
}
