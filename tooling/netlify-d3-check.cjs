"use strict";

/**
 * Read-only: report whether .env.cloud exists and which build env keys exist
 * on Netlify (production context). Run from repo root.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const cloudEnvPath = path.join(root, "apps", "backend", "supabase", ".env.cloud");
const webDir = path.join(root, "apps", "web");

console.log("--- D3 readiness ---");
console.log(".env.cloud:", fs.existsSync(cloudEnvPath) ? `present (${path.relative(root, cloudEnvPath)})` : "MISSING — copy .env.cloud.example and add SUPABASE_URL + SUPABASE_ANON_KEY");

let plain;
try {
  plain = execFileSync("netlify", ["env:list", "--plain", "--context", "production"], {
    cwd: webDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  console.error("Netlify CLI failed (logged in? apps/web linked?).", e.message);
  process.exit(1);
}

const lines = plain.split("\n").map((l) => l.trim()).filter(Boolean);
console.log("Netlify production env (names only):", lines.map((l) => l.split("=")[0]).join(", "));

function hasKey(key) {
  const line = lines.find((l) => l.startsWith(`${key}=`));
  if (!line) return false;
  const val = line.slice(key.length + 1);
  return val.length > 0;
}
const need = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = need.filter((k) => !hasKey(k));
if (missing.length) {
  console.log("Missing for web build:", missing.join(", "));
  console.log("Next: pnpm netlify:env:push  (requires .env.cloud)");
  process.exit(2);
}
console.log("VITE_SUPABASE_* present on Netlify.");
process.exit(0);
