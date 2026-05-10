import { NextRequest, NextResponse } from "next/server";

/**
 * Checkout is not active yet (Stripe integration pending).
 * This route only forwards to the informational /payment page so existing links keep working.
 */
export async function GET(request: NextRequest) {
  const scanId = request.nextUrl.searchParams.get("scanId");
  const tierRaw = request.nextUrl.searchParams.get("tier") || "ADVANCED";
  const tier = tierRaw === "BASIC" ? "BASIC" : "ADVANCED";

  const u = new URL("/payment", request.url);
  if (scanId?.trim()) {
    u.searchParams.set("scanId", scanId.trim());
  }
  u.searchParams.set("tier", tier);

  return NextResponse.redirect(u.toString());
}
