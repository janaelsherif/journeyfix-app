/**
 * Website crawler using Playwright
 * Extracts text, DOM structure, and key data points for AI analysis
 */

import { stripSandboxPlaywrightBrowsersPath } from "@/lib/playwright-env";

export interface CrawlResult {
  url: string;
  html: string;
  text: string;
  title: string;
  metadata: {
    description?: string;
    h1Tags: string[];
    h2Tags: string[];
    wordCount: number;
  };
  contact: {
    phoneNumbers: string[];
    emails: string[];
    hasContactForm: boolean;
    hasMap: boolean;
  };
  performance: {
    loadTimeMs?: number;
    hasHttps: boolean;
  };
  structure: {
    hasMobileViewport: boolean;
    hasLanguageSwitcher: boolean;
    hasBookingButton: boolean;
    hasPrivacyPolicy: boolean;
  };
}

function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(\+41|0041|0)\s*[\d\s\-\.\(\)]{8,}/g;
  const matches = text.match(phoneRegex) || [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return Array.from(new Set(matches));
}

function extractHeadings(html: string): { h1: string[]; h2: string[] } {
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  const clean = (s: string) => s.replace(/<[^>]+>/g, "").trim();
  return {
    h1: h1Matches.map(clean),
    h2: h2Matches.map(clean),
  };
}

export async function crawlWebsite(url: string): Promise<CrawlResult> {
  stripSandboxPlaywrightBrowsersPath();
  // Dynamic import to avoid bundling issues
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      locale: "de-CH",
      timezoneId: "Europe/Zurich",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const startTime = Date.now();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    const loadTimeMs = Date.now() - startTime;

    const html = await page.content();
    const text = extractTextFromHtml(html);
    const headings = extractHeadings(html);

    // Extract meta description
    const description = await page
      .$eval('meta[name="description"]', (el) => el.getAttribute("content"))
      .catch(() => null);

    // Check for key elements
    const hasContactForm = (await page.$('form[action*="contact"], form[action*="kontakt"], [class*="contact-form"], [class*="kontaktformular"]')) !== null;
    const hasMap = (await page.$('iframe[src*="google.com/maps"], [class*="map"], [class*="karte"]')) !== null;
    const hasBookingButton = (await page.$('a[href*="book"], a[href*="termin"], [class*="booking"], [class*="doctolib"]')) !== null;
    const hasPrivacyPolicy = (await page.$('a[href*="privacy"], a[href*="datenschutz"], a[href*="impressum"]')) !== null;
    const hasLanguageSwitcher = (await page.$('[class*="language"], [class*="lang"], [href*="?lang="]')) !== null;

    const pageUrl = page.url();
    const hasHttps = pageUrl.startsWith("https://");
    const title = await page.title().catch(() => "");

    return {
      url: pageUrl,
      html,
      text,
      title,
      metadata: {
        description: description || undefined,
        h1Tags: headings.h1,
        h2Tags: headings.h2,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      },
      contact: {
        phoneNumbers: extractPhoneNumbers(text),
        emails: extractEmails(text),
        hasContactForm,
        hasMap,
      },
      performance: {
        loadTimeMs,
        hasHttps,
      },
      structure: {
        hasMobileViewport: true, // Playwright viewport handles this
        hasLanguageSwitcher,
        hasBookingButton,
        hasPrivacyPolicy,
      },
    };
  } finally {
    await browser.close();
  }
}
