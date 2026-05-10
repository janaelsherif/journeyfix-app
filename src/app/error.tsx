"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-slate-900">500</h1>
      <p className="mt-2 text-slate-600">Ein Fehler ist aufgetreten.</p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
