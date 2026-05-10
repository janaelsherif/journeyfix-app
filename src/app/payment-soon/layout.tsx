import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zahlung demnächst",
  robots: { index: false, follow: false },
};

export default function PaymentSoonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
