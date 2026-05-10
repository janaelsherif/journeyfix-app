/**
 * Analytics tracking for JourneyFix.ch
 * Works with Plausible or custom events
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export function trackScanComplete(scanId?: string) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Scan Complete", { props: { scanId: scanId || "session" } });
  }
}

export function trackReportView(scanId?: string) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Report View", { props: { scanId: scanId || "session" } });
  }
}

export function trackPdfDownload(scanId?: string) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("PDF Download", { props: { scanId: scanId || "session" } });
  }
}

export function trackShareReport(scanId?: string) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible("Share Report", { props: { scanId: scanId || "session" } });
  }
}
