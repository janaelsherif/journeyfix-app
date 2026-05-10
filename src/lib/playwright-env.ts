/**
 * Cursor/IDE sandboxes may set PLAYWRIGHT_BROWSERS_PATH to a folder that never
 * receives `playwright install`, so Chromium is missing. Clear it so Playwright
 * uses the default cache (e.g. ~/Library/Caches/ms-playwright on macOS).
 */
export function stripSandboxPlaywrightBrowsersPath(): void {
  const p = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!p) return;
  if (p.includes("cursor-sandbox-cache") || p.includes("sandbox-cache")) {
    delete process.env.PLAYWRIGHT_BROWSERS_PATH;
  }
}
