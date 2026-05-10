import { createHash } from "crypto";

/**
 * Generate a hash for user identification (email + IP).
 * Used to enforce: 1 report per URL per user.
 */
export function getUserKey(email: string | null | undefined, clientIp: string | null): string {
  const emailPart = (email || "").trim().toLowerCase();
  const ipPart = clientIp || "unknown";
  const combined = `${emailPart}|${ipPart}`;
  return createHash("sha256").update(combined).digest("hex").slice(0, 32);
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}
