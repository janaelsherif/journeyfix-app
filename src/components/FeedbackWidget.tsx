"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const FEEDBACK_KEY = "journeyfix-feedback-dismissed";

export function FeedbackWidget({ reportId }: { reportId?: string }) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || typeof window === "undefined") return null;
  if (localStorage.getItem(FEEDBACK_KEY)) return null;

  const handleHelpful = () => {
    setSubmitted(true);
    localStorage.setItem(FEEDBACK_KEY, "true");
    if (typeof (window as Window & { plausible?: (e: string, o?: object) => void }).plausible === "function") {
      (window as Window & { plausible: (e: string, o?: object) => void }).plausible("Feedback Helpful", { props: { reportId: reportId || "session" } });
    }
  };

  const handleNotHelpful = () => {
    setSubmitted(true);
    localStorage.setItem(FEEDBACK_KEY, "true");
    if (typeof (window as Window & { plausible?: (e: string, o?: object) => void }).plausible === "function") {
      (window as Window & { plausible: (e: string, o?: object) => void }).plausible("Feedback Not Helpful", { props: { reportId: reportId || "session" } });
    }
  };

  const handleDismiss = () => {
    setSubmitted(true);
    localStorage.setItem(FEEDBACK_KEY, "true");
  };

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-slate-700">
        {language === "de" ? "War dieser Bericht hilfreich?" : "Was this report helpful?"}
      </p>
      {!submitted ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleHelpful}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-200"
          >
            {language === "de" ? "Ja" : "Yes"}
          </button>
          <button
            type="button"
            onClick={handleNotHelpful}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {language === "de" ? "Nein" : "No"}
          </button>
          <button type="button" onClick={handleDismiss} className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-600" aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">{language === "de" ? "Danke!" : "Thanks!"}</p>
      )}
    </div>
  );
}
