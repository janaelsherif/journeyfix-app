import Link from "next/link";

/**
 * Keep this page free of client providers (LanguageContext, etc.).
 * If the app errors early, hooks here can worsen "missing required error components" loops.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-6xl font-bold text-slate-900">404</h1>
      <p className="mt-4 text-lg text-slate-600">Diese Seite wurde nicht gefunden.</p>
      <p className="mt-2 text-sm text-slate-500">This page does not exist.</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
        >
          Zur Startseite
        </Link>
        <Link
          href="/scan"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          Analyse starten
        </Link>
      </div>
    </div>
  );
}
