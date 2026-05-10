/**
 * Allowed `source` values for /api/subscribe — used for Brevo segmentation & follow-ups.
 */
export const SUBSCRIBE_SOURCES = [
  "journeyfix_footer",
  "journeyfix_pricing",
  "journeyfix_scan_page",
  "journeyfix_payment_soon",
  "journeyfix_coming_soon",
  "journeyfix_praxis_trust",
  "journeyfix_report_email_gate",
  "journeyfix_report_modal",
  "journeyfix_report_page",
] as const;

export type SubscribeSource = (typeof SUBSCRIBE_SOURCES)[number];
