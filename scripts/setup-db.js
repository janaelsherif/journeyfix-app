#!/usr/bin/env node
/**
 * JourneyFix.ch - Database setup script
 * Creates .env if needed, generates Prisma client, pushes schema
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("=== JourneyFix Database Setup ===\n");

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

// Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  console.log("Creating .env from .env.example...");
  fs.copyFileSync(envExamplePath, envPath);
  console.log("✓ .env created\n");
  console.log("⚠️  Edit .env and set:");
  console.log("   DATABASE_URL=\"postgresql://postgres:YOUR_PASSWORD@localhost:5432/journeyfix\"");
  console.log("   ANTHROPIC_API_KEY=\"sk-ant-...\"\n");
  console.log("Then run: npm run db:setup\n");
  process.exit(0);
}

// Prisma generate (always works)
console.log("Running Prisma generate...");
execSync("npx prisma generate", { stdio: "inherit", cwd: rootDir });
console.log("✓ Prisma client generated\n");

// Prisma db push (creates tables)
console.log("Pushing schema to database...");
try {
  execSync("npx prisma db push", { stdio: "inherit", cwd: rootDir });
  console.log("\n✅ Database setup complete!");
  console.log("   Run: npm run dev\n");
} catch (err) {
  console.error("\n❌ Schema push failed.");
  console.error("   Ensure:");
  console.error("   1. PostgreSQL is running");
  console.error("   2. Database exists: createdb journeyfix");
  console.error("   3. DATABASE_URL in .env is correct\n");
  process.exit(1);
}
