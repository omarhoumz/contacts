"use strict";

/**
 * Push Supabase URL + anon key from apps/backend/supabase/.env.cloud to Netlify
 * as VITE_* build env vars. Runs `netlify env:set` with cwd apps/web so the
 * linked site is used without the repo-root monorepo picker.
 *
 * Prereq: copy .env.cloud.example → .env.cloud and fill SUPABASE_URL + SUPABASE_ANON_KEY.
 * Prereq: Netlify CLI logged in; apps/web linked (see wiki/operations.md D1).
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const cloudEnvPath = path.join(root, "apps", "backend", "supabase", ".env.cloud");
const webDir = path.join(root, "apps", "web");

function parseEnvFile(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function netlifyEnvSet(key, value, extraArgs) {
  const args = ["env:set", key, value, "--context", "production", "deploy-preview", "--scope", "builds", ...extraArgs];
  execFileSync("netlify", args, { cwd: webDir, stdio: "inherit" });
}

if (!fs.existsSync(cloudEnvPath)) {
  console.error("Missing", cloudEnvPath);
  console.error("Copy apps/backend/supabase/.env.cloud.example to .env.cloud and set SUPABASE_URL + SUPABASE_ANON_KEY.");
  process.exit(1);
}

const cloud = parseEnvFile(fs.readFileSync(cloudEnvPath, "utf8"));
const url = cloud.SUPABASE_URL;
const anon = cloud.SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error(".env.cloud must define SUPABASE_URL and SUPABASE_ANON_KEY.");
  process.exit(1);
}

netlifyEnvSet("VITE_SUPABASE_URL", url, []);
netlifyEnvSet("VITE_SUPABASE_ANON_KEY", anon, ["--secret"]);
console.log("Netlify env updated for production + deploy-preview (builds scope). Run: pnpm netlify:env:list");
