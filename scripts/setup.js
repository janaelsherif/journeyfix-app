#!/usr/bin/env node
/**
 * JourneyFix.ch - Full setup script
 * Ensures .env exists, Playwright browsers installed, ready for scanning
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== JourneyFix Setup ===\n");

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

// 1. Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log("Creating .env from .env.example...");
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✓ .env created\n");
  } else {
    console.log("⚠️  No .env.example found. Create .env manually.\n");
  }
} else {
  console.log("✓ .env exists\n");
}

// 2. Install Playwright Chromium (required for crawling)
console.log("Installing Playwright Chromium (required for website crawling)...");
try {
  const env = { ...process.env };
  delete env.PLAYWRIGHT_BROWSERS_PATH;
  execSync("npx playwright install chromium", { stdio: "inherit", cwd: rootDir, env });
  console.log("✓ Chromium installed\n");
} catch (err) {
  console.error("❌ Playwright install failed. Scans will not work.");
  console.error("   Try: npx playwright install chromium\n");
  process.exit(1);
}

console.log("✅ Setup complete!\n");
console.log("Next steps:");
console.log("  1. Edit .env and add ANTHROPIC_API_KEY for AI analysis");
console.log("     (Get one at https://console.anthropic.com)");
console.log("  2. Run: npm run dev");
console.log("  3. Open http://localhost:3000/scan\n");
