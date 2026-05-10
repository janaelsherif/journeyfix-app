import type { Metadata } from "next";
import { PaymentPageClient } from "./payment-page-client";

export const metadata: Metadata = {
  title: "Zahlung",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Record<string, string | string[] | undefined> };

function normalizeTier(raw: string | undefined): "BASIC" | "ADVANCED" {
  return raw === "BASIC" ? "BASIC" : "ADVANCED";
}

export default function PaymentPage({ searchParams }: Props) {
  const scanId = typeof searchParams.scanId === "string" ? searchParams.scanId : undefined;
  const tier = normalizeTier(typeof searchParams.tier === "string" ? searchParams.tier : undefined);

  return <PaymentPageClient scanId={scanId} tier={tier} />;
}
