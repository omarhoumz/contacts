"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const backendDir = path.join(root, "apps", "backend");
const cloudEnvPath = path.join(backendDir, "supabase", ".env.cloud");
const webEnvPath = path.join(root, "apps", "web", ".env.local");
const mobileEnvPath = path.join(root, "apps", "mobile", ".env.local");

const mode = process.argv[2];

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

function parseStatusEnv(text) {
  const out = {};
  const re = /^([A-Z0-9_]+)="((?:\\.|[^"\\])*)"/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    out[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return out;
}

function upsertEnvFile(filePath, pairs) {
  const lines = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").split("\n") : [];
  const kept = lines.filter((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return true;
    const eq = t.indexOf("=");
    if (eq === -1) return true;
    const k = t.slice(0, eq).trim();
    return pairs[k] === undefined;
  });
  const additions = Object.entries(pairs).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(filePath, [...kept, ...additions].join("\n") + "\n", "utf8");
  console.log("Updated", path.relative(root, filePath));
}

function applyToApps(url, anon) {
  upsertEnvFile(webEnvPath, {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: anon,
  });
  upsertEnvFile(mobileEnvPath, {
    EXPO_PUBLIC_SUPABASE_URL: url,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: anon,
  });
}

if (mode === "local") {
  let raw;
  try {
    raw = execFileSync("npx", ["supabase", "status", "-o", "env"], {
      cwd: backendDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    console.error(
      "Could not read local Supabase (is `pnpm --filter @widados/backend db:start` running?).",
    );
    process.exit(1);
  }
  const st = parseStatusEnv(raw);
  const url = st.API_URL;
  const anon = st.ANON_KEY || st.PUBLISHABLE_KEY;
  if (!url || !anon) {
    console.error("Missing API_URL or ANON_KEY in supabase status -o env output.");
    process.exit(1);
  }
  applyToApps(url, anon);
  console.log("Set web + mobile env to local stack.");
} else if (mode === "cloud") {
  if (!fs.existsSync(cloudEnvPath)) {
    console.error("Missing", cloudEnvPath);
    console.error("Copy apps/backend/supabase/.env.cloud.example to .env.cloud and fill values.");
    process.exit(1);
  }
  const cloud = parseEnvFile(fs.readFileSync(cloudEnvPath, "utf8"));
  const url = cloud.SUPABASE_URL;
  const anon = cloud.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error(".env.cloud must define SUPABASE_URL and SUPABASE_ANON_KEY.");
    process.exit(1);
  }
  applyToApps(url, anon);
  console.log("Set web + mobile env from .env.cloud.");
} else {
  console.error("Usage: node tooling/set-supabase-env.cjs <local|cloud>");
  process.exit(1);
}
