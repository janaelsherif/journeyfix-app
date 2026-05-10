import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PlausibleAnalytics } from "@/components/PlausibleAnalytics";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://journeyfix.ch";

export const metadata: Metadata = {
  title: {
    default: "JourneyFix.ch | Website Customer Journey Analyzer",
    template: "%s | JourneyFix.ch",
  },
  description:
    "Website review for Swiss professional services. Identify friction points preventing visitors from becoming clients.",
  keywords: ["Website", "Analyse", "Schweiz", "Zahnarzt", "Anwalt", "Kundenjourney", "Conversion"],
  authors: [{ name: "JourneyFix.ch" }],
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: baseUrl,
    siteName: "JourneyFix.ch",
    title: "JourneyFix.ch | Website Customer Journey Analyzer",
    description: "Fachkundige Website-Prüfung für Schweizer Praxen. Finden Sie die Schwachstellen Ihrer Website.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JourneyFix.ch | Website Customer Journey Analyzer",
    description: "Website review for Swiss professional services.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="light">
      <body className="antialiased min-h-screen">
        <PlausibleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
