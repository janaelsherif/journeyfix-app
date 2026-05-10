"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { type Language, translations } from "@/lib/translations";

type Translations = (typeof translations)[Language];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("journeyfix-language") as Language | null;
    if (stored === "de" || stored === "en") {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("journeyfix-language", lang);
      document.documentElement.lang = lang;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = translations[mounted ? language : "de"];

  return (
    <LanguageContext.Provider value={{ language: mounted ? language : "de", setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "de" as const,
      setLanguage: () => {},
      t: translations.de,
    };
  }
  return context;
}
