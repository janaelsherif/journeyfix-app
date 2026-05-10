"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-slate-900">500</h1>
        <p className="mt-2 text-slate-600">Ein Fehler ist aufgetreten.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
